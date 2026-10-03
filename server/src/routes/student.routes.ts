import { Router, Response } from 'express';
import { Entitlement, Purchase, Payment, Course } from '../models';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// Student Dashboard Summary: GET /api/student/dashboard
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Active entitlements
    const entitlements = await Entitlement.find({
      userId: userObjectId,
      status: 'ACTIVE',
    })
      .populate('courseId', 'name slug category thumbnail')
      .populate('semesterId', 'name semesterNumber')
      .populate('subjectId', 'name code')
      .populate('materialId', 'title type')
      .sort({ createdAt: -1 });

    // Recent purchases
    const purchases = await Purchase.find({ userId: userObjectId })
      .populate('orderId')
      .sort({ createdAt: -1 })
      .limit(10);

    // Enrolled courses (derived from entitlements)
    const enrolledCourseIds = Array.from(
      new Set(
        entitlements
          .map((e) => (e.courseId ? e.courseId._id ? e.courseId._id.toString() : e.courseId.toString() : null))
          .filter(Boolean)
      )
    );

    const courses = await Course.find({ _id: { $in: enrolledCourseIds } });

    return res.json({
      success: true,
      data: {
        stats: {
          enrolledCoursesCount: courses.length,
          activeEntitlementsCount: entitlements.length,
          totalPurchasesCount: purchases.length,
        },
        entitlements,
        recentPurchases: purchases,
        courses,
      },
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load student dashboard.' });
  }
});

// Student Purchases History: GET /api/student/purchases
router.get('/purchases', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const purchases = await Purchase.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('orderId')
      .populate('courseId', 'name slug')
      .populate('semesterId', 'name semesterNumber')
      .populate('subjectId', 'name code')
      .populate('materialId', 'title type')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load purchase history.' });
  }
});

// Student Payments History: GET /api/student/payments
router.get('/payments', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const payments = await Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('orderId')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load payment history.' });
  }
});

// Student Entitlements: GET /api/student/entitlements
router.get('/entitlements', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const entitlements = await Entitlement.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('courseId', 'name slug')
      .populate('semesterId', 'name semesterNumber')
      .populate('subjectId', 'name code')
      .populate('materialId', 'title type')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: entitlements,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load entitlements.' });
  }
});

export default router;
