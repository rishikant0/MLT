import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, Entitlement } from '../models';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
    }

    const { name, email, phone, password } = parsed.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      status: 'ACTIVE',
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to MLT Learning Zone.',
      data: {
        token,
        refreshToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        refreshToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Logout
router.post('/logout', authenticate, async (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required.' });
  }

  try {
    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.status === 'INACTIVE') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return success message for security to prevent email enumeration
  return res.json({
    success: true,
    message: 'If an account exists with that email address, password reset instructions have been sent.',
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// Get Current User
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const entitlements = await Entitlement.find({
      userId,
      status: 'ACTIVE',
    })
      .populate('courseId', 'name slug')
      .populate('semesterId', 'name semesterNumber')
      .populate('subjectId', 'name code');

    return res.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        entitlements,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

export default router;
