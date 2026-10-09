import { Router, Response } from 'express';
import { Subject } from '../models';
import { optionalAuthenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// GET /api/subjects (Public listing of subjects by courseId and/or semesterId)
router.get('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, semesterId, status } = req.query;

    const filter: any = {};
    if (semesterId && mongoose.Types.ObjectId.isValid(String(semesterId))) {
      filter.semesterId = new mongoose.Types.ObjectId(String(semesterId));
    }
    if (courseId && mongoose.Types.ObjectId.isValid(String(courseId))) {
      filter.courseId = new mongoose.Types.ObjectId(String(courseId));
    }

    // Default to ACTIVE for public/students unless status explicitly specified or user is admin
    if (status) {
      filter.status = String(status);
    } else if (!req.user || req.user.role !== 'ADMIN') {
      filter.status = 'ACTIVE';
    }

    const subjects = await Subject.find(filter)
      .populate('courseId', 'name slug')
      .populate('semesterId', 'name semesterNumber')
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
});

// GET /api/subjects/:id
router.get('/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid subject ID' });
    }

    const subject = await Subject.findById(id)
      .populate('courseId', 'name slug')
      .populate('semesterId', 'name semesterNumber');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    return res.json({ success: true, data: subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subject details.' });
  }
});

export default router;
