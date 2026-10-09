import { Router, Response } from 'express';
import { Semester } from '../models';
import { optionalAuthenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// GET /api/semesters (Public listing of semesters by courseId)
router.get('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, status } = req.query;

    const filter: any = {};
    if (courseId && mongoose.Types.ObjectId.isValid(String(courseId))) {
      filter.courseId = new mongoose.Types.ObjectId(String(courseId));
    }

    // Default to ACTIVE for public/students unless status explicitly specified or user is admin
    if (status) {
      filter.status = String(status);
    } else if (!req.user || req.user.role !== 'ADMIN') {
      filter.status = 'ACTIVE';
    }

    const semesters = await Semester.find(filter)
      .populate('courseId', 'name slug')
      .sort({ semesterNumber: 1 });

    return res.json({
      success: true,
      data: semesters,
    });
  } catch (error) {
    console.error('Fetch semesters error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch semesters.' });
  }
});

// GET /api/semesters/:id
router.get('/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid semester ID' });
    }

    const semester = await Semester.findById(id).populate('courseId', 'name slug');
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found.' });
    }

    return res.json({ success: true, data: semester });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch semester details.' });
  }
});

export default router;
