import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  User,
  Course,
  Semester,
  Subject,
  Material,
  Order,
  Payment,
  Purchase,
  Entitlement,
  Blog,
  Enquiry,
  AuditLog,
  SystemSetting,
  Notification,
  Pricing,
} from '../models';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { uploadMaterial } from '../middlewares/upload.middleware';
import { logAuditAction } from '../utils/auditLog';
import {
  triggerEnrollmentNotifications,
  sendStudentPaymentApprovalEmail,
  sendStudentPaymentRejectionEmail,
} from '../services/emailService';
import mongoose from 'mongoose';
import path from 'path';

const router = Router();

type MaterialReferences = {
  courseId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
};

async function resolveMaterialReferences(
  subjectId: unknown
): Promise<{ references: MaterialReferences } | { error: string }> {
  if (typeof subjectId !== 'string' || !mongoose.Types.ObjectId.isValid(subjectId)) {
    return { error: 'A valid Subject is required.' };
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) return { error: 'Selected Subject was not found.' };

  const semester = await Semester.findById(subject.semesterId);
  if (!semester) return { error: 'Selected Subject is not linked to a valid Semester.' };

  let course = semester.courseId && mongoose.Types.ObjectId.isValid(semester.courseId.toString())
    ? await Course.findById(semester.courseId)
    : null;

  if (!course && subject.courseId && mongoose.Types.ObjectId.isValid(subject.courseId.toString())) {
    course = await Course.findById(subject.courseId);
    if (course) {
      semester.courseId = course._id;
      await semester.save();
    }
  }

  if (!course) return { error: 'Selected Semester is not linked to a valid Course.' };

  return {
    references: {
      courseId: course._id,
      semesterId: semester._id,
      subjectId: subject._id,
    },
  };
}

// Apply authentication and admin authorization to ALL admin routes
router.use(authenticate, requireAdmin);

// ----------------------------------------------------
// 1. ADMIN DASHBOARD STATS & ANALYTICS
// ----------------------------------------------------
router.get('/dashboard', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalStudents,
      totalCourses,
      totalSemesters,
      totalSubjects,
      totalMaterials,
      totalOrders,
      successfulPayments,
      failedPayments,
      pendingPayments,
      revenueResult,
      recentOrders,
      recentStudents,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      Course.countDocuments(),
      Semester.countDocuments(),
      Subject.countDocuments(),
      Material.countDocuments(),
      Order.countDocuments(),
      Payment.countDocuments({ status: 'SUCCESS' }),
      Payment.countDocuments({ status: 'FAILED' }),
      Payment.countDocuments({ status: 'PENDING' }),
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.find()
        .populate('userId', 'name email')
        .populate('courseId', 'name')
        .populate('semesterId', 'name')
        .populate('subjectId', 'name')
        .populate('materialId', 'title')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: 'STUDENT' })
        .select('name email phone status createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Payment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCourses,
          totalSemesters,
          totalSubjects,
          totalMaterials,
          totalOrders,
          successfulPayments,
          failedPayments,
          pendingPayments,
          totalRevenue,
        },
        charts: {
          revenueChart: [
            { month: 'May', revenue: 12000 },
            { month: 'Jun', revenue: 25000 },
            { month: 'Jul', revenue: 38000 },
            { month: 'Aug', revenue: 54000 },
            { month: 'Sep', revenue: 78000 },
            { month: 'Oct', revenue: totalRevenue > 0 ? totalRevenue : 95000 },
          ],
          ordersChart: [
            { month: 'May', count: 15 },
            { month: 'Jun', count: 30 },
            { month: 'Jul', count: 55 },
            { month: 'Aug', count: 85 },
            { month: 'Sep', count: 120 },
            { month: 'Oct', count: totalOrders },
          ],
        },
        recentOrders,
        recentStudents,
        recentPayments,
      },
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
});

router.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalStudents,
      totalCourses,
      totalSemesters,
      totalSubjects,
      totalMaterials,
      totalOrders,
      successfulPayments,
      failedPayments,
      pendingPayments,
      revenueResult,
      recentOrders,
      recentStudents,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      Course.countDocuments(),
      Semester.countDocuments(),
      Subject.countDocuments(),
      Material.countDocuments(),
      Order.countDocuments(),
      Payment.countDocuments({ status: 'SUCCESS' }),
      Payment.countDocuments({ status: 'FAILED' }),
      Payment.countDocuments({ status: 'PENDING' }),
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: 'STUDENT' })
        .select('name email phone status createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Payment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCourses,
          totalSemesters,
          totalSubjects,
          totalMaterials,
          totalOrders,
          successfulPayments,
          failedPayments,
          pendingPayments,
          totalRevenue,
        },
        charts: {
          revenueChart: [
            { month: 'May', revenue: 12000 },
            { month: 'Jun', revenue: 25000 },
            { month: 'Jul', revenue: 38000 },
            { month: 'Aug', revenue: 54000 },
            { month: 'Sep', revenue: 78000 },
            { month: 'Oct', revenue: totalRevenue > 0 ? totalRevenue : 95000 },
          ],
        },
        recentOrders,
        recentStudents,
        recentPayments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

// ----------------------------------------------------
// 2. COURSES CRUD
// ----------------------------------------------------
router.get('/courses', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter: any = {};

    if (category && category !== 'ALL') filter.category = new RegExp(`^${category}$`, 'i');
    if (status && status !== 'ALL') filter.status = String(status);
    if (search) {
      filter.$or = [
        { name: new RegExp(String(search), 'i') },
        { description: new RegExp(String(search), 'i') },
      ];
    }

    const courses = await Course.find(filter).sort({ name: 1 });
    return res.json({ success: true, data: courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load courses.' });
  }
});

router.post('/courses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, description, shortDescription, duration, eligibility, careerOpportunities, thumbnail, status } = req.body;
    if (!name || !duration) {
      return res.status(400).json({ success: false, message: 'Name and Duration are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const course = await Course.create({
      name,
      slug,
      category: category || 'Allied Health',
      description,
      shortDescription,
      duration,
      eligibility: eligibility || '10+2 PCB/PCM',
      careerOpportunities: Array.isArray(careerOpportunities) ? careerOpportunities : ['Hospitals', 'Labs', 'Research'],
      thumbnail,
      status: status || 'ACTIVE',
    });

    await logAuditAction({
      adminId: req.user?.id,
      action: 'CREATE_COURSE',
      entity: 'Course',
      entityId: course._id.toString(),
      details: { name: course.name, slug: course.slug },
    });

    return res.status(201).json({ success: true, message: 'Course created successfully!', data: course });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create course.' });
  }
});

router.put('/courses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const { name, category, description, shortDescription, duration, eligibility, careerOpportunities, thumbnail, status } = req.body;

    if (name) {
      course.name = name;
      course.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (category) course.category = category;
    if (description !== undefined) course.description = description;
    if (shortDescription !== undefined) course.shortDescription = shortDescription;
    if (duration) course.duration = duration;
    if (eligibility !== undefined) course.eligibility = eligibility;
    if (careerOpportunities) course.careerOpportunities = Array.isArray(careerOpportunities) ? careerOpportunities : [careerOpportunities];
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (status) course.status = status;

    await course.save();

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_COURSE',
      entity: 'Course',
      entityId: id,
      details: { name: course.name, status: course.status },
    });

    return res.json({ success: true, message: 'Course updated successfully!', data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update course.' });
  }
});

router.delete('/courses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const course = await Course.findByIdAndDelete(id);

    await logAuditAction({
      adminId: req.user?.id,
      action: 'DELETE_COURSE',
      entity: 'Course',
      entityId: id,
    });

    return res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete course.' });
  }
});

// ----------------------------------------------------
// 3. SEMESTERS CRUD
// ----------------------------------------------------
router.get('/semesters', async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter: any = {};
    if (courseId && mongoose.Types.ObjectId.isValid(String(courseId))) {
      filter.courseId = courseId;
    }

    const semesters = await Semester.find(filter).populate('courseId', 'name').sort({ semesterNumber: 1 });
    return res.json({ success: true, data: semesters });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch semesters.' });
  }
});

router.post('/semesters', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, name, semesterNumber, description, price, fee, status } = req.body;
    if (!courseId || !name) {
      return res.status(400).json({ success: false, message: 'Course ID and Semester Name are required.' });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(400).json({ success: false, message: 'Specified Course does not exist.' });
    }

    const finalPrice = price !== undefined ? Number(price) : (fee !== undefined ? Number(fee) : 0);
    const semNum = semesterNumber ? Number(semesterNumber) : 1;

    const semester = await Semester.create({
      courseId: new mongoose.Types.ObjectId(courseId),
      name,
      semesterNumber: semNum,
      description,
      price: finalPrice,
      status: status || 'ACTIVE',
    });

    await logAuditAction({
      adminId: req.user?.id,
      action: 'CREATE_SEMESTER',
      entity: 'Semester',
      entityId: semester._id.toString(),
      details: { name: semester.name, price: semester.price },
    });

    return res.status(201).json({ success: true, message: 'Semester created successfully!', data: semester });
  } catch (error: any) {
    console.error('Create semester error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create semester.' });
  }
});

router.put('/semesters/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const semester = await Semester.findById(id);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    const { name, semesterNumber, description, price, fee, status } = req.body;

    if (name) semester.name = name;
    if (semesterNumber) semester.semesterNumber = Number(semesterNumber);
    if (description !== undefined) semester.description = description;
    if (price !== undefined) semester.price = Number(price);
    else if (fee !== undefined) semester.price = Number(fee);
    if (status) semester.status = status;

    await semester.save();

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_SEMESTER',
      entity: 'Semester',
      entityId: id,
    });

    return res.json({ success: true, message: 'Semester updated successfully.', data: semester });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update semester.' });
  }
});

router.delete('/semesters/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    await Semester.findByIdAndDelete(id);

    await logAuditAction({
      adminId: req.user?.id,
      action: 'DELETE_SEMESTER',
      entity: 'Semester',
      entityId: id,
    });

    return res.json({ success: true, message: 'Semester deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete semester.' });
  }
});

// ----------------------------------------------------
// 4. SUBJECTS CRUD
// ----------------------------------------------------
router.get('/subjects', async (req, res) => {
  try {
    const { semesterId } = req.query;
    const filter: any = {};
    if (semesterId && mongoose.Types.ObjectId.isValid(String(semesterId))) {
      filter.semesterId = semesterId;
    }

    const subjects = await Subject.find(filter)
      .populate('courseId', 'name')
      .populate({
        path: 'semesterId',
        select: 'name semesterNumber courseId',
        populate: { path: 'courseId', select: 'name' },
      })
      .sort({ name: 1 });

    return res.json({ success: true, data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
});

router.post('/subjects', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { semesterId, name, code, description, price, fee, status } = req.body;
    if (typeof semesterId !== 'string' || !mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ success: false, message: 'A valid Semester is required.' });
    }
    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Subject Name must be text.' });
    }
    if (code !== undefined && typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Subject Code must be text.' });
    }

    const sem = await Semester.findById(semesterId);
    if (!sem) {
      return res.status(400).json({ success: false, message: 'Selected Semester was not found.' });
    }

    const courseId = sem.courseId?.toString();
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId) || !(await Course.exists({ _id: courseId }))) {
      return res.status(400).json({ success: false, message: 'Selected Semester is not linked to a valid Course.' });
    }
    const finalPrice = price !== undefined ? Number(price) : (fee !== undefined ? Number(fee) : 0);
    if (!Number.isFinite(finalPrice) || finalPrice < 0) {
      return res.status(400).json({ success: false, message: 'Subject Fee must be a valid non-negative number.' });
    }

    const subject = await Subject.create({
      courseId: sem.courseId,
      semesterId: sem._id,
      name: typeof name === 'string' ? name.trim() : '',
      code: typeof code === 'string' && code.trim() ? code.trim() : undefined,
      description,
      price: finalPrice,
      status: status || 'ACTIVE',
    });

    await logAuditAction({
      adminId: req.user?.id,
      action: 'CREATE_SUBJECT',
      entity: 'Subject',
      entityId: subject._id.toString(),
      details: { name: subject.name, price: subject.price },
    });

    return res.status(201).json({ success: true, message: 'Subject added successfully!', data: subject });
  } catch (error: any) {
    console.error('Create subject error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create subject.' });
  }
});

router.put('/subjects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const { semesterId, name, code, description, price, fee, status } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Subject Name must be text.' });
    }
    if (code !== undefined && typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Subject Code must be text.' });
    }
    if (name !== undefined) subject.name = name.trim();
    if (code !== undefined) subject.code = code.trim() || undefined;
    if (description !== undefined) subject.description = description;
    const requestedPrice = price !== undefined ? price : fee;
    if (requestedPrice !== undefined) {
      const parsedPrice = Number(requestedPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, message: 'Subject Fee must be a valid non-negative number.' });
      }
      subject.price = parsedPrice;
    }
    if (status) subject.status = status;

    const selectedSemesterId = semesterId ?? subject.semesterId.toString();
    if (typeof selectedSemesterId !== 'string' || !mongoose.Types.ObjectId.isValid(selectedSemesterId)) {
      return res.status(400).json({ success: false, message: 'A valid Semester is required.' });
    }
    const semester = await Semester.findById(selectedSemesterId);
    if (!semester) {
      return res.status(400).json({ success: false, message: 'Selected Semester was not found.' });
    }
    const courseId = semester.courseId?.toString();
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId) || !(await Course.exists({ _id: courseId }))) {
      return res.status(400).json({ success: false, message: 'Selected Semester is not linked to a valid Course.' });
    }
    subject.semesterId = semester._id;
    subject.courseId = semester.courseId;

    await subject.save();

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_SUBJECT',
      entity: 'Subject',
      entityId: id,
    });

    return res.json({ success: true, message: 'Subject updated successfully.', data: subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update subject.' });
  }
});

router.delete('/subjects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    await Subject.findByIdAndDelete(id);

    await logAuditAction({
      adminId: req.user?.id,
      action: 'DELETE_SUBJECT',
      entity: 'Subject',
      entityId: id,
    });

    return res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete subject.' });
  }
});

// ----------------------------------------------------
// 5. STUDY MATERIALS CRUD
// ----------------------------------------------------
router.get('/materials', async (req, res) => {
  try {
    const { subjectId, type, search } = req.query;
    const filter: any = {};

    if (subjectId && mongoose.Types.ObjectId.isValid(String(subjectId))) {
      filter.subjectId = subjectId;
    }
    if (type && type !== 'ALL') filter.type = String(type);
    if (search) {
      filter.$or = [
        { title: new RegExp(String(search), 'i') },
        { description: new RegExp(String(search), 'i') },
      ];
    }

    const materials = await Material.find(filter)
      .populate('courseId', 'name')
      .populate({
        path: 'semesterId',
        select: 'name semesterNumber courseId',
        populate: { path: 'courseId', select: 'name' },
      })
      .populate({
        path: 'subjectId',
        select: 'name code semesterId',
        populate: { path: 'semesterId', select: 'name courseId', populate: { path: 'courseId', select: 'name' } },
      })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch materials.' });
  }
});

router.post('/materials', uploadMaterial.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subjectId, title, description, type, isPaid, isSample, price, status, accessLevel } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Material Title is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Material file is required.' });
    }

    const resolved = await resolveMaterialReferences(subjectId);
    if ('error' in resolved) {
      return res.status(400).json({ success: false, message: resolved.error });
    }

    const { courseId, semesterId, subjectId: resolvedSubjectId } = resolved.references;
    const filePathStr = `/uploads/materials/${req.file.filename}`;
    const fileNameStr = req.file.filename;
    const origFileNameStr = req.file.originalname;
    const fileSizeStr = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
    const mimeTypeStr = req.file.mimetype;

    const materialIsPaid = isSample === true || isSample === 'true' ? false : (isPaid !== undefined ? (isPaid === true || isPaid === 'true') : true);

    const material = await Material.create({
      courseId,
      semesterId,
      subjectId: resolvedSubjectId,
      title: title.trim(),
      description: description || '',
      type: type || 'PDF',
      file: filePathStr,
      filePath: filePathStr,
      fileName: fileNameStr,
      originalFileName: origFileNameStr,
      fileSize: fileSizeStr,
      mimeType: mimeTypeStr,
      isPaid: materialIsPaid,
      accessLevel: accessLevel || (materialIsPaid ? 'PROTECTED' : 'PUBLIC'),
      price: price ? Number(price) : 0,
      status: status || 'ACTIVE',
    });

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPLOAD_MATERIAL',
      entity: 'Material',
      entityId: material._id.toString(),
      details: { title: material.title, type: material.type, filePath: filePathStr },
    });

    return res.status(201).json({ success: true, message: 'Study material added successfully!', data: material });
  } catch (error: any) {
    console.error('Upload material error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload material.' });
  }
});

router.put('/materials/:id', uploadMaterial.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const material = await Material.findById(id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    const { subjectId, title, description, type, isPaid, isSample, price, status, accessLevel } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Material Title is required.' });
      }
      material.title = title.trim();
    }
    if (description !== undefined) material.description = description;
    if (type) material.type = type;
    if (subjectId !== undefined) {
      const resolved = await resolveMaterialReferences(subjectId);
      if ('error' in resolved) {
        return res.status(400).json({ success: false, message: resolved.error });
      }
      material.courseId = resolved.references.courseId;
      material.semesterId = resolved.references.semesterId;
      material.subjectId = resolved.references.subjectId;
    }
    if (isPaid !== undefined || isSample !== undefined) {
      material.isPaid = isSample === true || isSample === 'true' ? false : (isPaid === true || isPaid === 'true');
    }
    if (price !== undefined) material.price = Number(price);
    if (status) material.status = status;
    if (accessLevel) material.accessLevel = accessLevel;

    if (req.file) {
      material.file = `/uploads/materials/${req.file.filename}`;
      material.filePath = `/uploads/materials/${req.file.filename}`;
      material.fileName = req.file.filename;
      material.originalFileName = req.file.originalname;
      material.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      material.mimeType = req.file.mimetype;
    }

    await material.save();

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_MATERIAL',
      entity: 'Material',
      entityId: id,
    });

    return res.json({ success: true, message: 'Material updated successfully.', data: material });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update material.' });
  }
});

router.delete('/materials/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    await Material.findByIdAndDelete(id);

    await logAuditAction({
      adminId: req.user?.id,
      action: 'DELETE_MATERIAL',
      entity: 'Material',
      entityId: id,
    });

    return res.json({ success: true, message: 'Material deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete material.' });
  }
});

// ----------------------------------------------------
// 6. PRICING MANAGEMENT
// ----------------------------------------------------
router.get('/pricing', async (_req, res) => {
  try {
    const rules = await Pricing.find().sort({ updatedAt: -1 });
    const [courses, semesters, subjects, materials] = await Promise.all([
      Course.find().select('name slug category status'),
      Semester.find().populate('courseId', 'name').select('name semesterNumber price status'),
      Subject.find().populate('semesterId', 'name').select('name code price status'),
      Material.find().select('title type price isPaid status'),
    ]);

    return res.json({
      success: true,
      data: {
        rules,
        courses,
        semesters,
        subjects,
        materials,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load pricing matrix.', error: error.message });
  }
});

router.post('/pricing', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, entityId, targetType, targetId, price, offerPrice, discountPercentage, accessDurationDays, newPrice } = req.body;

    const type = String(entityType || targetType || '').toUpperCase();
    const id = entityId || targetId;
    const rawOriginalPrice = price !== undefined ? price : newPrice;
    const rawOfferPrice = offerPrice !== undefined ? offerPrice : (newPrice !== undefined ? newPrice : rawOriginalPrice);
    const origPrice = Number(rawOriginalPrice);
    const offer = Number(rawOfferPrice);

    if (!['COURSE', 'SEMESTER', 'SUBJECT', 'MATERIAL'].includes(type)) {
      return res.status(400).json({ success: false, message: 'A valid targetType is required.' });
    }
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'A valid targetId is required.' });
    }
    if (
      rawOriginalPrice === undefined || rawOriginalPrice === null || rawOriginalPrice === '' ||
      rawOfferPrice === undefined || rawOfferPrice === null || rawOfferPrice === '' ||
      !Number.isFinite(origPrice) || !Number.isFinite(offer) || origPrice < 0 || offer < 0
    ) {
      return res.status(400).json({ success: false, message: 'A valid non-negative newPrice is required.' });
    }

    const objId = new mongoose.Types.ObjectId(id);
    const targetExists = type === 'COURSE'
      ? await Course.exists({ _id: objId })
      : type === 'SEMESTER'
        ? await Semester.exists({ _id: objId })
        : type === 'SUBJECT'
          ? await Subject.exists({ _id: objId })
          : await Material.exists({ _id: objId });
    if (!targetExists) {
      return res.status(400).json({ success: false, message: 'Selected pricing target was not found.' });
    }

    const calculatedDiscount = origPrice > offer ? Math.round(((origPrice - offer) / origPrice) * 100) : 0;
    const discPercentage = discountPercentage !== undefined ? Number(discountPercentage) : calculatedDiscount;
    if (!Number.isFinite(discPercentage) || discPercentage < 0 || discPercentage > 100) {
      return res.status(400).json({ success: false, message: 'Discount percentage must be between 0 and 100.' });
    }

    // Upsert Pricing Rule
    const pricingRule = await Pricing.findOneAndUpdate(
      { entityType: type, entityId: objId },
      {
        entityType: type,
        entityId: objId,
        price: origPrice,
        offerPrice: offer,
        discountPercentage: discPercentage,
        accessDurationDays: accessDurationDays ? Number(accessDurationDays) : 365,
      },
      { upsert: true, new: true }
    );

    // Synchronize price field directly on target entity
    if (type === 'SEMESTER') {
      await Semester.findByIdAndUpdate(objId, { price: offer });
    } else if (type === 'SUBJECT') {
      await Subject.findByIdAndUpdate(objId, { price: offer });
    } else if (type === 'MATERIAL') {
      await Material.findByIdAndUpdate(objId, { price: offer });
    }

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_PRICING',
      entity: type,
      entityId: id,
      details: { price: origPrice, offerPrice: offer, discountPercentage: discPercentage },
    });

    return res.json({
      success: true,
      message: 'Pricing matrix updated successfully!',
      data: pricingRule,
    });
  } catch (error: any) {
    console.error('Update pricing matrix error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update pricing matrix.', error: error.message });
  }
});

// ----------------------------------------------------
// 7. STUDENTS MANAGEMENT
// ----------------------------------------------------
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    const filter: any = { role: 'STUDENT' };

    if (search) {
      filter.$or = [
        { name: new RegExp(String(search), 'i') },
        { email: new RegExp(String(search), 'i') },
        { phone: new RegExp(String(search), 'i') },
      ];
    }

    const students = await User.find(filter).select('-password').sort({ createdAt: -1 });

    const formattedStudents = await Promise.all(
      students.map(async (st) => {
        const purchases = await Purchase.find({ userId: st._id });
        const entitlements = await Entitlement.find({ userId: st._id, status: 'ACTIVE' });
        const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
          _id: st._id.toString(),
          id: st._id.toString(),
          name: st.name,
          email: st.email,
          phone: st.phone,
          status: st.status,
          isVerified: st.isVerified,
          createdAt: st.createdAt,
          purchaseCount: purchases.length,
          activeEntitlementsCount: entitlements.length,
          totalSpent,
        };
      })
    );

    return res.json({ success: true, data: formattedStudents });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch students list.' });
  }
});

router.put('/students/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required.' });
    }

    const student = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');

    await logAuditAction({
      adminId: req.user?.id,
      action: status === 'ACTIVE' ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
      entity: 'User',
      entityId: id,
    });

    return res.json({ success: true, message: `Student status updated to ${status}.`, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update student status.' });
  }
});

// ----------------------------------------------------
// 8. ORDERS, PAYMENTS, PURCHASES, ENTITLEMENTS
// ----------------------------------------------------
router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('courseId', 'name')
      .populate('semesterId', 'name')
      .populate('subjectId', 'name')
      .populate('materialId', 'title')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

router.get('/payments', async (_req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

router.get('/purchases', async (_req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .populate('courseId', 'name')
      .populate('semesterId', 'name')
      .populate('subjectId', 'name')
      .populate('materialId', 'title')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: purchases });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch purchases.' });
  }
});

router.get('/entitlements', async (_req, res) => {
  try {
    const entitlements = await Entitlement.find()
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('semesterId', 'name')
      .populate('subjectId', 'name')
      .populate('materialId', 'title')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: entitlements });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch entitlements.' });
  }
});

router.put('/entitlements/:id/revoke', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'REVOKED'
    const newStatus = status || 'REVOKED';

    const entitlement = await Entitlement.findByIdAndUpdate(id, { status: newStatus }, { new: true });

    await logAuditAction({
      adminId: req.user?.id,
      action: `${newStatus}_ENTITLEMENT`,
      entity: 'Entitlement',
      entityId: id,
    });

    return res.json({ success: true, message: `Entitlement ${newStatus.toLowerCase()}.`, data: entitlement });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update entitlement status.' });
  }
});

// ----------------------------------------------------
// 9. BLOG CRUD
// ----------------------------------------------------
router.get('/blog', async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load blog posts.' });
  }
});

router.post('/blog', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, featuredImage, category, author, seoTitle, seoDescription, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and Content are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const blog = await Blog.create({
      title,
      slug,
      content,
      featuredImage,
      category: category || 'Medical Education',
      author: author || 'MLT Academic Team',
      seoTitle: seoTitle || title,
      seoDescription,
      status: status || 'PUBLISHED',
    });

    await logAuditAction({
      adminId: req.user?.id,
      action: 'CREATE_BLOG',
      entity: 'Blog',
      entityId: blog._id.toString(),
    });

    return res.status(201).json({ success: true, message: 'Blog created successfully!', data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create blog post.' });
  }
});

router.put('/blog/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, featuredImage, category, author, seoTitle, seoDescription, status } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    if (title) {
      blog.title = title;
      blog.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (content) blog.content = content;
    if (featuredImage !== undefined) blog.featuredImage = featuredImage;
    if (category) blog.category = category;
    if (author) blog.author = author;
    if (seoTitle !== undefined) blog.seoTitle = seoTitle;
    if (seoDescription !== undefined) blog.seoDescription = seoDescription;
    if (status) blog.status = status;

    await blog.save();

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_BLOG',
      entity: 'Blog',
      entityId: id,
    });

    return res.json({ success: true, message: 'Blog updated successfully.', data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update blog.' });
  }
});

router.delete('/blog/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);

    await logAuditAction({
      adminId: req.user?.id,
      action: 'DELETE_BLOG',
      entity: 'Blog',
      entityId: id,
    });

    return res.json({ success: true, message: 'Blog deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete blog.' });
  }
});

// ----------------------------------------------------
// 10. ENQUIRIES MANAGEMENT
// ----------------------------------------------------
router.get('/enquiries', async (_req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch enquiries.' });
  }
});

router.put('/enquiries/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'

    const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });

    await logAuditAction({
      adminId: req.user?.id,
      action: 'UPDATE_ENQUIRY',
      entity: 'Enquiry',
      entityId: id,
      details: { status },
    });

    return res.json({ success: true, message: 'Enquiry status updated.', data: enquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update enquiry status.' });
  }
});

// ----------------------------------------------------
// 11. AUDIT LOGS
// ----------------------------------------------------
router.get('/audit-logs', async (_req, res) => {
  try {
    const logs = await AuditLog.find().populate('adminId', 'name email').sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
});

// ----------------------------------------------------
// 12. MANUAL UPI PAYMENTS VERIFICATION PANEL
// ----------------------------------------------------
router.get('/payments/manual', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email phone status')
      .populate({
        path: 'orderId',
        populate: [
          { path: 'courseId', select: 'name slug' },
          { path: 'semesterId', select: 'name semesterNumber' },
          { path: 'subjectId', select: 'name code' },
          { path: 'materialId', select: 'title type price' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Fetch manual payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment verification queue.' });
  }
});

router.post('/payments/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'APPROVE' or 'REJECT'." });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found.' });
    }

    const adminId = new mongoose.Types.ObjectId(req.user!.id);

    if (action === 'APPROVE') {
      payment.status = 'SUCCESS';
      payment.paidAt = new Date();
      payment.verifiedBy = adminId;
      payment.verifiedAt = new Date();
      await payment.save();

      order.status = 'SUCCESS';
      await order.save();

      // Create Purchase record
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

      // Grant Entitlement to student in MongoDB
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

      await logAuditAction({
        adminId: req.user!.id,
        action: 'APPROVE_PAYMENT',
        entity: 'Payment',
        entityId: payment._id.toString(),
        details: { utrNumber: payment.utrNumber, amount: payment.amount, userId: order.userId },
      });

      // Send student payment approval email (non-blocking)
      setImmediate(async () => {
        try {
          const studentUser = await User.findById(order.userId);
          if (studentUser) {
            let courseName = 'MLT Comprehensive Program';
            if (order.courseId) {
              const crs = await Course.findById(order.courseId);
              if (crs) courseName = crs.name;
            }
            await sendStudentPaymentApprovalEmail({
              studentName: studentUser.name || 'Student',
              studentEmail: studentUser.email,
              courseName,
              amount: payment.amount,
              orderId: order._id.toString(),
            });
          }
        } catch (emailErr) {
          console.error('Failed to send payment approval email to student:', emailErr);
        }
      });

      // Trigger standard enrollment notifications as well
      triggerEnrollmentNotifications(order._id.toString());

      return res.json({
        success: true,
        message: 'Payment APPROVED successfully! Access to notes granted to the student.',
        data: { payment, entitlement },
      });
    } else {
      // REJECT ACTION
      payment.status = 'REJECTED';
      payment.rejectionReason = rejectionReason || 'Payment verification failed by admin';
      payment.verifiedBy = adminId;
      payment.verifiedAt = new Date();
      await payment.save();

      order.status = 'REJECTED';
      await order.save();

      // Revoke any entitlement if it was previously created
      await Entitlement.updateMany({ userId: order.userId, courseId: order.courseId, materialId: order.materialId }, { status: 'REVOKED' });

      await logAuditAction({
        adminId: req.user!.id,
        action: 'REJECT_PAYMENT',
        entity: 'Payment',
        entityId: payment._id.toString(),
        details: { reason: payment.rejectionReason, utrNumber: payment.utrNumber },
      });

      // Send student payment rejection email (non-blocking)
      setImmediate(async () => {
        try {
          const studentUser = await User.findById(order.userId);
          if (studentUser) {
            let courseName = 'MLT Comprehensive Program';
            if (order.courseId) {
              const crs = await Course.findById(order.courseId);
              if (crs) courseName = crs.name;
            }
            await sendStudentPaymentRejectionEmail({
              studentName: studentUser.name || 'Student',
              studentEmail: studentUser.email,
              courseName,
              amount: payment.amount,
              orderId: order._id.toString(),
              reason: payment.rejectionReason || 'Payment verification failed by admin',
            });
          }
        } catch (emailErr) {
          console.error('Failed to send payment rejection email to student:', emailErr);
        }
      });

      return res.json({
        success: true,
        message: 'Payment REJECTED. Access denied.',
        data: { payment },
      });
    }
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to process payment action.' });
  }
});

// ----------------------------------------------------
// 13. SYSTEM UPI SETTINGS
// ----------------------------------------------------
router.get('/settings/upi', async (_req, res: Response) => {
  try {
    const upiSetting = await SystemSetting.findOne({ key: 'UPI_CONFIG' });
    const config = upiSetting?.value || {
      upiId: 'mltlearningzone@upi',
      payeeName: 'MLT Learning Zone',
      qrCodeUrl: '/logo.jpg',
      instructions: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app. Enter the 12-digit UTR/Ref No. and attach a screenshot after payment.',
    };

    return res.json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch UPI settings.' });
  }
});

router.post('/settings/upi', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { upiId, payeeName, qrCodeUrl, instructions } = req.body;

    const value = {
      upiId: upiId || 'mltlearningzone@upi',
      payeeName: payeeName || 'MLT Learning Zone',
      qrCodeUrl: qrCodeUrl || '/logo.jpg',
      instructions: instructions || 'Scan QR Code or copy UPI ID to complete payment.',
    };

    const setting = await SystemSetting.findOneAndUpdate(
      { key: 'UPI_CONFIG' },
      { value, updatedBy: new mongoose.Types.ObjectId(req.user!.id) },
      { upsert: true, new: true }
    );

    await logAuditAction({
      adminId: req.user!.id,
      action: 'UPDATE_UPI_SETTINGS',
      entity: 'SystemSetting',
      entityId: setting._id.toString(),
      details: value,
    });

    return res.json({
      success: true,
      message: 'UPI settings updated successfully.',
      data: setting.value,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update UPI settings.' });
  }
});

// Notifications Endpoints
router.get('/notifications', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    return res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin notifications.' });
  }
});

router.patch('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

router.patch('/notifications/mark-all-read', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
});

export default router;
