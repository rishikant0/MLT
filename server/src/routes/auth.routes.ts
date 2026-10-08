import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User, Entitlement } from '../models';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { sendPasswordResetOTP } from '../services/emailService';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyResetOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

const resetPasswordSchema = z.object({
  resetToken: z.string().min(10, 'Invalid reset token'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Rate limiter for password reset requests (5 requests per 15 mins)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password reset requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
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

    const user = await User.findOne({ email });

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

// 1. Request Password Reset OTP: POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { email } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Security rule: Do not reveal whether an email exists or if account is admin
    const user = await User.findOne({ email: cleanEmail });

    if (user && user.role === 'ADMIN') {
      // Generate cryptographically random 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      
      // Hash OTP using SHA-256 before storing
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

      user.resetOtp = otpHash;
      user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      user.resetOtpAttempts = 0; // Reset attempts counter
      await user.save();

      // Send OTP to registered email (asynchronously)
      sendPasswordResetOTP(user.email, otp, user.name);
    }

    return res.json({
      success: true,
      message: 'Verification code sent successfully. If an admin account exists with that email, check your inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error during forgot password request.' });
  }
});

// 2. Verify OTP: POST /api/auth/verify-reset-otp
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const parsed = verifyResetOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { email, otp } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.role !== 'ADMIN' || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Check expiration
    if (new Date() > user.resetOtpExpires) {
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Check maximum attempts limit
    if ((user.resetOtpAttempts || 0) >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new verification code.',
      });
    }

    // Hash provided OTP to compare
    const inputOtpHash = crypto.createHash('sha256').update(otp).digest('hex');

    if (inputOtpHash !== user.resetOtp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Generate short-lived password-reset token (valid for 15 minutes)
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    user.resetToken = tokenHash;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    // Invalidate OTP once verified
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = undefined;

    await user.save();

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        resetToken: rawResetToken,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// 3. Reset Password: POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { resetToken, newPassword } = parsed.data;

    // Hash token to search
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetToken: tokenHash,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = undefined;

    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successfully. Your admin password has been updated.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
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
