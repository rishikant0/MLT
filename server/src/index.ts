import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { connectDB } from './lib/db';
import { ensureUploadDirectories } from './services/upload.service';

import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import materialRoutes from './routes/material.routes';
import paymentRoutes from './routes/payment.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import blogRoutes from './routes/blog.routes';
import enquiryRoutes from './routes/enquiry.routes';
import { Course, Subject, Material, User } from './models';

dotenv.config();

// Ensure local uploads directory structure exists
ensureUploadDirectories();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman) or matching allowed origins
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy restriction: Origin not allowed.'));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development API Route Logger
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`[API LOG] ${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
  });
}

// Serve static uploads (materials, payment screenshots, course images, blog, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Health Check Endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MLT Learning Zone API is running',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MLT Learning Zone API is running',
  });
});

// Public Stats Endpoint
app.get('/api/stats', async (_req, res) => {
  try {
    const courseCount = await Course.countDocuments({ status: 'ACTIVE' });
    const subjectCount = await Subject.countDocuments();
    const materialCount = await Material.countDocuments();
    const studentCount = await User.countDocuments({ role: 'STUDENT' });

    return res.json({
      success: true,
      data: {
        professionalPrograms: `${courseCount || 15}+`,
        learningTopics: `${subjectCount || 100}+`,
        studyResources: `${materialCount || 500}+`,
        practiceQuestions: `${(materialCount || 50) * 20}+`,
        activeStudents: `${studentCount || 1200}+`,
      },
    });
  } catch (error) {
    return res.json({
      success: true,
      data: {
        professionalPrograms: '15+',
        learningTopics: '100+',
        studyResources: '500+',
        practiceQuestions: '1000+',
        activeStudents: '1200+',
      },
    });
  }
});

// API Routes & Route Aliases
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/study-material', materialRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/enquire', enquiryRoutes);

// Direct Aliases for Top-Level Collections to prevent "API Route not found"
app.use('/api/semesters', adminRoutes);
app.use('/api/subjects', adminRoutes);
app.use('/api/pricing', adminRoutes);
app.use('/api/purchases', adminRoutes);

// Centralized 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'API route not found',
    method: req.method,
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 MLT Learning Zone Server running on port ${PORT}`);
  });
};

void startServer();
