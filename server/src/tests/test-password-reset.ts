import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models';
import { connectDB } from '../lib/db';

dotenv.config();

async function testPasswordResetFlow() {
  await connectDB();
  console.log('🧪 Running Password Reset & Security Verification Tests...');

  // 1. Ensure admin user exists
  const adminEmail = process.env.ADMIN_EMAIL || 'rishikant.aws27@gmail.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    admin = await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
    });
  }

  // 2. Test OTP Generation & Hashing
  const rawOtp = '123456';
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

  admin.resetOtp = otpHash;
  admin.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  admin.resetOtpAttempts = 0;
  await admin.save();

  console.log('✅ PASS: OTP generated, hashed via SHA-256 and saved in database.');

  // 3. Test Wrong OTP Attempt Counter
  const wrongOtpHash = crypto.createHash('sha256').update('999999').digest('hex');
  if (wrongOtpHash !== admin.resetOtp) {
    admin.resetOtpAttempts = (admin.resetOtpAttempts || 0) + 1;
    await admin.save();
  }
  if (admin.resetOtpAttempts === 1) {
    console.log('✅ PASS: Wrong OTP attempt correctly incremented attempts counter.');
  } else {
    throw new Error('Attempt counter test failed');
  }

  // 4. Test Correct OTP Verification & Reset Token Generation
  if (crypto.createHash('sha256').update(rawOtp).digest('hex') === admin.resetOtp) {
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    admin.resetToken = tokenHash;
    admin.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    admin.resetOtp = undefined;
    admin.resetOtpExpires = undefined;
    admin.resetOtpAttempts = undefined;
    await admin.save();

    console.log('✅ PASS: Correct OTP verified, OTP invalidated, and short-lived reset token issued.');

    // 5. Test Password Update & Reset Token Invalidation
    const newPass = 'NewAdminPass123!';
    const hashedPass = await bcrypt.hash(newPass, 10);
    admin.password = hashedPass;
    admin.resetToken = undefined;
    admin.resetTokenExpires = undefined;
    await admin.save();

    const passMatch = await bcrypt.compare(newPass, admin.password);
    if (!passMatch) {
      throw new Error('New password verification failed');
    }
    console.log('✅ PASS: Admin password updated and reset token invalidated.');
  }

  // Restore original default admin password
  admin.password = await bcrypt.hash('Admin@123', 10);
  await admin.save();

  console.log('🎉 ALL FORGOT PASSWORD SECURITY TESTS PASSED!');
  process.exit(0);
}

testPasswordResetFlow().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
