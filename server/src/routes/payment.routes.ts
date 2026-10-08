import { Router, Response } from 'express';
import { z } from 'zod';
import { Order, Payment, Purchase, Entitlement, Course, Semester, Subject, Material, SystemSetting } from '../models';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../services/razorpay.service';
import { triggerEnrollmentNotifications } from '../services/emailService';
import { calculateCoursePrice, resolveEffectivePrice } from '../services/pricing.service';
import mongoose from 'mongoose';

const router = Router();

const submitUpiSchema = z.object({
  productType: z.enum(['COURSE', 'SEMESTER', 'SUBJECT', 'MATERIAL']),
  courseId: z.string().optional(),
  semesterId: z.string().optional(),
  subjectId: z.string().optional(),
  materialId: z.string().optional(),
  utrNumber: z.string().min(4, 'Transaction / UTR Number is required'),
  screenshotUrl: z.string().min(1, 'Payment screenshot is required'),
});

const createOrderSchema = z.object({
  productType: z.enum(['COURSE', 'SEMESTER', 'SUBJECT', 'MATERIAL']),
  courseId: z.string().optional(),
  semesterId: z.string().optional(),
  subjectId: z.string().optional(),
  materialId: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Helper function to process entitlement creation (idempotent)
async function processSuccessfulOrder(order: any, razorpayPaymentId: string, method: string = 'RAZORPAY') {
  if (order.status === 'SUCCESS') {
    return; // Already processed
  }

  order.status = 'SUCCESS';
  await order.save();

  // Create or update Payment
  let payment = await Payment.findOne({ orderId: order._id });
  if (!payment) {
    payment = await Payment.create({
      orderId: order._id,
      userId: order.userId,
      razorpayPaymentId,
      razorpayOrderId: order.razorpayOrderId,
      method,
      amount: order.amount,
      currency: order.currency,
      status: 'SUCCESS',
      signatureVerified: true,
      paidAt: new Date(),
    });
  } else {
    payment.status = 'SUCCESS';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.signatureVerified = true;
    payment.paidAt = new Date();
    await payment.save();
  }

  // Create Purchase (idempotent)
  let purchase = await Purchase.findOne({ orderId: order._id });
  if (!purchase) {
    purchase = await Purchase.create({
      userId: order.userId,
      orderId: order._id,
      productType: order.productType,
      courseId: order.courseId,
      semesterId: order.semesterId,
      subjectId: order.subjectId,
      materialId: order.materialId,
      amount: order.amount,
      status: 'SUCCESS',
    });
  }

  // Create Entitlement (idempotent)
  let entitlement = await Entitlement.findOne({ purchaseId: purchase._id });
  if (!entitlement) {
    entitlement = await Entitlement.create({
      userId: order.userId,
      courseId: order.courseId,
      semesterId: order.semesterId,
      subjectId: order.subjectId,
      materialId: order.materialId,
      purchaseId: purchase._id,
      status: 'ACTIVE',
    });
  }

  // Trigger non-blocking enrollment notifications (Admin & Student emails + Admin Notification record)
  triggerEnrollmentNotifications(order._id.toString());

  return { purchase, entitlement };
}

// 0. Calculate Price (Public API)
router.post('/calculate-price', async (req, res) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { productType, courseId, semesterId, subjectId, materialId } = parsed.data;
    const itemId = productType === 'COURSE'
      ? courseId
      : productType === 'SEMESTER'
        ? semesterId
        : productType === 'SUBJECT'
          ? subjectId
          : materialId;
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: `A valid ${productType.toLowerCase()} ID is required.` });
    }

    const result = await calculateCoursePrice({
      productType,
      courseId,
      semesterId,
      subjectId,
      materialId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to calculate price.' });
  }
});

// 1. Create Order
router.post('/create-order', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { productType, courseId, semesterId, subjectId, materialId } = parsed.data;
    const userId = req.user!.id;

    // READ PRICE AUTHORITATIVELY FROM MONGODB DATABASE
    const pricingResult = await calculateCoursePrice({
      productType,
      courseId,
      semesterId,
      subjectId,
      materialId,
    });

    if (!pricingResult.success || !pricingResult.pricing) {
      return res.status(400).json({
        success: false,
        message: pricingResult.message || 'Price is not configured for this course.',
      });
    }

    const amount = pricingResult.pricing.finalPrice;
    const receipt = `REC_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder(receipt, amount);

    // Create internal DB Order record
    const dbOrder = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      productType,
      courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
      semesterId: semesterId ? new mongoose.Types.ObjectId(semesterId) : undefined,
      subjectId: subjectId ? new mongoose.Types.ObjectId(subjectId) : undefined,
      materialId: materialId ? new mongoose.Types.ObjectId(materialId) : undefined,
      amount,
      currency: 'INR',
      status: 'CREATED',
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: dbOrder._id.toString(),
        amount: dbOrder.amount,
        currency: dbOrder.currency,
        razorpayOrderId: razorpayOrder.id,
        isMock: (razorpayOrder as any).isMock || false,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mltzone123456',
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create payment order.' });
  }
});

// 2. Verify Payment
router.post('/verify', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findById(orderId);

    if (!order || order.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Verify Razorpay Signature
    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      order.status = 'FAILED';
      await order.save();

      await Payment.create({
        orderId: order._id,
        userId: order.userId,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount: order.amount,
        currency: order.currency,
        status: 'FAILED',
        signatureVerified: false,
        failureReason: 'Invalid signature signature verification failed',
      });

      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    // Process payment success (idempotent)
    const result = await processSuccessfulOrder(order, razorpay_payment_id);

    return res.json({
      success: true,
      message: 'Payment verified successfully! Access granted to your study material.',
      data: {
        orderId: order._id.toString(),
        purchaseId: result?.purchase?._id.toString(),
        entitlementId: result?.entitlement?._id.toString(),
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Server error during payment verification.' });
  }
});

// 3. Razorpay Webhook Endpoint
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature if secret configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body;
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        await processSuccessfulOrder(order, razorpayPaymentId, paymentEntity.method);
      }
    }

    return res.json({ success: true, message: 'Webhook processed successfully.' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, message: 'Webhook error.' });
  }
});

// 4. Get Order Status: GET /api/payments/:orderId/status
router.get('/:orderId/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const entitlement = await Entitlement.findOne({
      userId: order.userId,
      $or: [
        { courseId: order.courseId },
        { semesterId: order.semesterId },
        { subjectId: order.subjectId },
        { materialId: order.materialId },
      ],
      status: 'ACTIVE',
    });

    return res.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        status: order.status,
        amount: order.amount,
        unlocked: !!entitlement,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to check order status.' });
  }
});

// 5. Get UPI Settings: GET /api/payments/upi-details
router.get('/upi-details', async (_req, res: Response) => {
  try {
    const upiSetting = await SystemSetting.findOne({ key: 'UPI_CONFIG' });
    const config = upiSetting?.value || {
      upiId: 'mltlearningzone@upi',
      payeeName: 'MLT Learning Zone',
      qrCodeUrl: '/logo.jpg',
      instructions: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app. Enter the 12-digit UTR/Ref No. and attach a screenshot after payment.',
    };

    return res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch UPI details.' });
  }
});

// 6. Submit Manual UPI Payment: POST /api/payments/submit-upi & POST /api/payments/submit
router.post(['/submit-upi', '/submit'], authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = submitUpiSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { productType, courseId, semesterId, subjectId, materialId, utrNumber, screenshotUrl } = parsed.data;
    const userId = req.user!.id;

    let amount = 0;
    let itemTitle = 'Study Material';

    // READ PRICE AUTHORITATIVELY FROM MONGODB DATABASE
    const pricingResult = await calculateCoursePrice({
      productType,
      courseId,
      semesterId,
      subjectId,
      materialId,
    });

    if (!pricingResult.success || !pricingResult.pricing) {
      return res.status(400).json({
        success: false,
        message: pricingResult.message || 'Price is not configured for this course.',
      });
    }

    amount = pricingResult.pricing.finalPrice;
    itemTitle = pricingResult.pricing.title;

    const manualOrderId = `UPI_ORD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Order with PENDING status
    const dbOrder = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      productType,
      courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
      semesterId: semesterId ? new mongoose.Types.ObjectId(semesterId) : undefined,
      subjectId: subjectId ? new mongoose.Types.ObjectId(subjectId) : undefined,
      materialId: materialId ? new mongoose.Types.ObjectId(materialId) : undefined,
      amount,
      currency: 'INR',
      paymentMethod: 'UPI_MANUAL',
      status: 'PENDING',
      razorpayOrderId: manualOrderId,
    });

    // Create Payment record with PENDING status
    const dbPayment = await Payment.create({
      orderId: dbOrder._id,
      userId: new mongoose.Types.ObjectId(userId),
      paymentMethod: 'UPI_MANUAL',
      method: 'UPI',
      utrNumber,
      screenshotUrl,
      amount,
      currency: 'INR',
      status: 'PENDING',
      signatureVerified: false,
    });

    // Trigger non-blocking enrollment notifications (Admin & Student emails + Admin Notification record)
    triggerEnrollmentNotifications(dbOrder._id.toString());

    return res.status(201).json({
      success: true,
      message: 'Payment submitted successfully! Admin will verify your UTR and grant access shortly.',
      data: {
        paymentId: dbPayment._id.toString(),
        orderId: dbOrder._id.toString(),
        utrNumber: dbPayment.utrNumber,
        amount: dbPayment.amount,
        status: dbPayment.status,
        itemTitle,
        createdAt: dbPayment.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Submit UPI error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit UPI payment.' });
  }
});

// 7. Get My Payments: GET /api/payments/my-payments
router.get('/my-payments', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const payments = await Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('orderId')
      .sort({ createdAt: -1 })
      .lean();

    // Populate item details dynamically
    const enrichedPayments = await Promise.all(
      payments.map(async (payment: any) => {
        const order = payment.orderId;
        let itemTitle = 'Study Content';
        let itemCode = '';

        if (order) {
          if (order.materialId) {
            const mat = await Material.findById(order.materialId).select('title type').lean();
            if (mat) {
              itemTitle = mat.title;
              itemCode = mat.type || 'PDF';
            }
          } else if (order.subjectId) {
            const subj = await Subject.findById(order.subjectId).select('name code').lean();
            if (subj) {
              itemTitle = subj.name;
              itemCode = subj.code || '';
            }
          } else if (order.semesterId) {
            const sem = await Semester.findById(order.semesterId).select('name semesterNumber').lean();
            if (sem) {
              itemTitle = sem.name;
              itemCode = `Semester ${sem.semesterNumber}`;
            }
          } else if (order.courseId) {
            const crs = await Course.findById(order.courseId).select('name slug').lean();
            if (crs) {
              itemTitle = crs.name;
              itemCode = crs.slug || '';
            }
          }
        }

        return {
          id: payment._id.toString(),
          orderId: order?._id?.toString(),
          paymentMethod: payment.paymentMethod || 'RAZORPAY',
          utrNumber: payment.utrNumber || payment.razorpayPaymentId || 'N/A',
          screenshotUrl: payment.screenshotUrl,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          rejectionReason: payment.rejectionReason,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          itemTitle,
          itemCode,
          productType: order?.productType || 'MATERIAL',
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedPayments,
    });
  } catch (error) {
    console.error('Fetch my payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
});

// POST /api/purchases (Create purchase record with server-side effective price calculation)
router.post('/purchases', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, semesterId, subjectId, materialId, purchaseType, productType } = req.body;
    const userId = req.user!.id;

    const targetType = (productType || purchaseType || (materialId ? 'MATERIAL' : subjectId ? 'SUBJECT' : semesterId ? 'SEMESTER' : 'COURSE')).toUpperCase();

    const pricing = await resolveEffectivePrice({ courseId, semesterId, subjectId, materialId, productType: targetType });

    if (!pricing || pricing.offerPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price is not configured for this course.',
      });
    }

    const manualOrderId = `PUR_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const dbOrder = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      productType: targetType,
      courseId: courseId && mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : undefined,
      semesterId: semesterId && mongoose.Types.ObjectId.isValid(semesterId) ? new mongoose.Types.ObjectId(semesterId) : undefined,
      subjectId: subjectId && mongoose.Types.ObjectId.isValid(subjectId) ? new mongoose.Types.ObjectId(subjectId) : undefined,
      materialId: materialId && mongoose.Types.ObjectId.isValid(materialId) ? new mongoose.Types.ObjectId(materialId) : undefined,
      amount: pricing.offerPrice,
      currency: 'INR',
      paymentMethod: 'MANUAL',
      status: 'PENDING',
      razorpayOrderId: manualOrderId,
    });

    const purchase = await Purchase.create({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: dbOrder._id,
      productType: targetType,
      courseId: dbOrder.courseId,
      semesterId: dbOrder.semesterId,
      subjectId: dbOrder.subjectId,
      materialId: dbOrder.materialId,
      amount: pricing.offerPrice,
      originalAmount: pricing.originalPrice,
      offerAmount: pricing.offerPrice,
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase record created successfully with PENDING status.',
      data: {
        orderId: dbOrder._id.toString(),
        purchaseId: purchase._id.toString(),
        amount: pricing.offerPrice,
        originalAmount: pricing.originalPrice,
        offerAmount: pricing.offerPrice,
        status: 'PENDING',
      },
    });
  } catch (error: any) {
    console.error('Create purchase error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create purchase record.' });
  }
});

export default router;
