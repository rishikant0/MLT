import dotenv from 'dotenv';
import { checkStudentEntitlementForMaterial, generateSignedMaterialUrl } from '../utils/signedUrl';
import { User, Course, Material, Entitlement } from '../models';
import { connectDB } from '../lib/db';
import mongoose from 'mongoose';

dotenv.config();

async function testAccessControl() {
  await connectDB();
  console.log('🧪 Running Access Control & Security Tests...');

  // 1. Get test users
  const adminEmail = process.env.ADMIN_EMAIL || 'rishikant.aws27@gmail.com';
  const admin = await User.findOne({ email: adminEmail });
  const student = await User.findOne({ email: 'student@mltlearningzone.com' });

  if (!admin || !student) {
    throw new Error('Test users missing. Run seed script first.');
  }

  // 2. Test Material Entitlement Check for Paid Material
  const paidMaterial = await Material.findOne({ isPaid: true });

  if (!paidMaterial) {
    throw new Error('No paid material found for testing');
  }

  // Create a dummy unpaid student
  const dummyStudent = await User.create({
    name: 'Unpaid Student',
    email: `unpaid_${Date.now()}@example.com`,
    password: 'dummy_hash_password',
    role: 'STUDENT',
    isVerified: true,
  });

  // Test 2a: Student without purchase -> should be forbidden
  const unpaidCheck = await checkStudentEntitlementForMaterial(dummyStudent._id.toString(), paidMaterial._id.toString());
  if (unpaidCheck.hasAccess) {
    console.error('❌ FAIL: Unpaid student was granted access!');
    process.exit(1);
  } else {
    console.log('✅ PASS: Unpaid student correctly denied access (403 Forbidden).');
  }

  // Test 2b: Create entitlement for student and check access
  const bmlsCourse = await Course.findOne({ slug: 'bmls' });
  const bmlsMaterial = await Material.findOne({ isPaid: true });

  if (bmlsMaterial && bmlsCourse) {
    await Entitlement.create({
      userId: student._id,
      courseId: bmlsCourse._id,
      materialId: bmlsMaterial._id,
      purchaseId: new mongoose.Types.ObjectId(),
      status: 'ACTIVE',
    });

    const paidCheck = await checkStudentEntitlementForMaterial(student._id.toString(), bmlsMaterial._id.toString());
    if (!paidCheck.hasAccess) {
      console.error('❌ FAIL: Student with entitlement was denied access!');
      process.exit(1);
    } else {
      console.log('✅ PASS: Student with entitlement correctly granted access.');
      const signedUrl = generateSignedMaterialUrl(student._id.toString(), bmlsMaterial._id.toString());
      console.log(`✅ PASS: Signed URL generated securely: ${signedUrl}`);
    }
  }

  // Clean up dummy student
  await User.findByIdAndDelete(dummyStudent._id);

  console.log('🎉 ALL SECURITY & ACCESS TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

testAccessControl().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
