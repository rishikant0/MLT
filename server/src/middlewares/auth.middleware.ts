import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';
import mongoose from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ success: false, message: 'Invalid token user ID.' });
    }

    const user = await User.findById(decoded.userId).select('name email role status');

    if (!user || user.status === 'INACTIVE') {
      return res.status(401).json({ success: false, message: 'User account not found or inactive.' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin rights required.' });
  }
  next();
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (mongoose.Types.ObjectId.isValid(decoded.userId)) {
        const user = await User.findById(decoded.userId).select('name email role status');
        if (user && user.status === 'ACTIVE') {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
          };
        }
      }
    }
  } catch (_) {
    // Ignore error for optional auth
  }
  next();
};
