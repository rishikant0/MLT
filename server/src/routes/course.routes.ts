import { Router, Response } from 'express';
import { Course, Semester, Subject, Material, Entitlement } from '../models';
import { optionalAuthenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// List public active courses
router.get('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, search } = req.query;

    const filter: any = { status: 'ACTIVE' };

    if (category && category !== 'ALL') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(String(search), 'i') },
        { description: new RegExp(String(search), 'i') },
        { eligibility: new RegExp(String(search), 'i') },
      ];
    }

    const courses = await Course.find(filter).sort({ name: 1 });

    const enrichedCourses = await Promise.all(
      courses.map(async (course) => {
        const semesters = await Semester.find({ courseId: course._id, status: 'ACTIVE' });
        const semesterCount = semesters.length;

        const prices = semesters.map((s) => s.price).filter((p) => p > 0);
        const startingPrice = prices.length > 0 ? Math.min(...prices) : 1999;

        return {
          _id: course._id.toString(),
          id: course._id.toString(),
          name: course.name,
          slug: course.slug,
          shortDescription: course.shortDescription,
          description: course.description,
          category: course.category,
          duration: course.duration,
          eligibility: course.eligibility,
          careerOpportunities: course.careerOpportunities,
          thumbnail: course.thumbnail,
          status: course.status,
          semesterCount,
          startingPrice,
          originalPrice: Math.round(startingPrice * 1.3),
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedCourses,
    });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load courses.' });
  }
});

// Course detail by slug
router.get('/:slug', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug, status: 'ACTIVE' });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const semesters = await Semester.find({ courseId: course._id, status: 'ACTIVE' }).sort({ semesterNumber: 1 });

    const semestersWithSubjects = await Promise.all(
      semesters.map(async (sem) => {
        const subjects = await Subject.find({ semesterId: sem._id, status: 'ACTIVE' }).sort({ name: 1 });

        const subjectsWithMaterials = await Promise.all(
          subjects.map(async (subj) => {
            const materials = await Material.find({ subjectId: subj._id, status: 'ACTIVE' }).select(
              'title description type fileSize mimeType isPaid price status'
            );
            return {
              _id: subj._id.toString(),
              id: subj._id.toString(),
              name: subj.name,
              code: subj.code,
              description: subj.description,
              price: subj.price || 499,
              status: subj.status,
              materials,
            };
          })
        );

        return {
          _id: sem._id.toString(),
          id: sem._id.toString(),
          name: sem.name,
          semesterNumber: sem.semesterNumber,
          description: sem.description,
          price: sem.price || 2999,
          status: sem.status,
          subjects: subjectsWithMaterials,
        };
      })
    );

    // Calculate full course price from semesters sum or default
    const totalSemestersPrice = semestersWithSubjects.reduce((sum, s) => sum + (s.price || 0), 0);
    const fullCoursePrice = totalSemestersPrice > 0 ? Math.round(totalSemestersPrice * 0.85) : 8999;

    let userEntitlements: any[] = [];
    if (req.user && req.user.id) {
      userEntitlements = await Entitlement.find({
        userId: new mongoose.Types.ObjectId(req.user.id),
        status: 'ACTIVE',
      });
    }

    return res.json({
      success: true,
      data: {
        _id: course._id.toString(),
        id: course._id.toString(),
        name: course.name,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        duration: course.duration,
        eligibility: course.eligibility,
        careerOpportunities: course.careerOpportunities,
        thumbnail: course.thumbnail,
        status: course.status,
        pricing: {
          fullCoursePrice,
          originalPrice: Math.round(fullCoursePrice * 1.25),
        },
        semesters: semestersWithSubjects,
        userEntitlements,
      },
    });
  } catch (error) {
    console.error('Fetch course detail error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
  }
});

export default router;
