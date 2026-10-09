import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const paymentMode = process.env.PAYMENT_MODE || (process.env.NODE_ENV === 'production' ? 'razorpay' : 'mock');

let razorpayInstance: Razorpay | null = null;
if (keyId && keySecret) {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const createRazorpayOrder = async (orderIdString: string, amountInINR: number) => {
  const amountInPaisa = Math.round(amountInINR * 100);

  if (paymentMode === 'mock') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MOCK PAYMENT MODE IS FORBIDDEN IN PRODUCTION ENVIRONMENT.');
    }
    const demoRazorpayOrderId = `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: demoRazorpayOrderId,
      amount: amountInPaisa,
      currency: 'INR',
      receipt: orderIdString,
      isMock: true,
    };
  }

  if (!razorpayInstance) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are missing.');
  }

  const order = await razorpayInstance.orders.create({
    amount: amountInPaisa,
    currency: 'INR',
    receipt: orderIdString,
    notes: {
      platform: 'Allied Learning Zone',
    },
  });

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    isMock: false,
  };
};

export const verifyRazorpaySignature = (params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

  if (razorpay_order_id.startsWith('order_mock_') || razorpay_signature === 'mock_signature') {
    if (process.env.NODE_ENV === 'production') {
      return false; // Mock payments strictly prohibited in production
    }
    return true;
  }

  if (!keySecret) return false;

  try {
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export const verifyRazorpayWebhookSignature = (body: string, signature: string): boolean => {
  if (!webhookSecret) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  } catch (error) {
    return false;
  }
};
