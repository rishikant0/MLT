import dotenv from 'dotenv';
import { connectDB } from './lib/db';
import { ensureAdminUser } from './utils/adminInit';

dotenv.config();

async function runCreateAdmin() {
  try {
    await connectDB();
    console.log('🔐 Admin Account Initialization...');
    await ensureAdminUser();
    console.log('======================================');
    console.log('✅ ADMIN ACCOUNT INITIALIZED SUCCESSFULLY');
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL || 'rishikant.aws27@gmail.com'}`);
    console.log('======================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

runCreateAdmin();