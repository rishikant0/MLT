import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'mlt_learning_zone_super_secret_jwt_key_2026_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'mlt_learning_zone_refresh_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mltzone123456',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'mltzone_secret_key_demo',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
};
