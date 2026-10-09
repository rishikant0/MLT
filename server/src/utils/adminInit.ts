import bcrypt from 'bcryptjs';
import { User } from '../models';

/**
 * Safely initializes or updates the main application administrator account in MongoDB.
 * 
 * Rules:
 * 1. Read ADMIN_EMAIL from process.env (default: Alliedlearningzone@gmail.com).
 * 2. Read ADMIN_PASSWORD from process.env (default: Allied@5995).
 * 3. Hash ADMIN_PASSWORD using bcrypt before saving.
 * 4. Migrate old admin accounts if found.
 * 5. Guarantee role: 'ADMIN', status: 'ACTIVE', isVerified: true without creating duplicates.
 */
export async function ensureAdminUser(): Promise<void> {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'Alliedlearningzone@gmail.com').toLowerCase().trim();
    const rawAdminPassword = process.env.ADMIN_PASSWORD || 'Allied@5995';

    // 1. Check if target admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      let updated = false;

      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        updated = true;
      }

      if (existingAdmin.status !== 'ACTIVE') {
        existingAdmin.status = 'ACTIVE';
        updated = true;
      }

      if (!existingAdmin.isVerified) {
        existingAdmin.isVerified = true;
        updated = true;
      }

      // Also ensure password matches if updated in .env
      const isPasswordMatch = await bcrypt.compare(rawAdminPassword, existingAdmin.password || '');
      if (!isPasswordMatch) {
        existingAdmin.password = await bcrypt.hash(rawAdminPassword, 10);
        updated = true;
      }

      if (updated) {
        await existingAdmin.save();
        console.log(`✅ Main Admin account synchronized: ${adminEmail} (role: ADMIN)`);
      } else {
        console.log(`✅ Main Admin account verified: ${adminEmail}`);
      }
      return;
    }

    // 2. Check if legacy admin accounts exist and migrate them to target email
    const legacyAdmin = await User.findOne({
      email: { $in: ['admin@mltlearningzone.com', 'admin@alliedlearningzone.com', 'kumarrishikant660@gmail.com', 'rishikant.aws27@gmail.com'] },
    });

    if (legacyAdmin) {
      console.log(`🔄 Migrating legacy admin account (${legacyAdmin.email}) -> ${adminEmail}`);
      legacyAdmin.email = adminEmail;
      legacyAdmin.password = await bcrypt.hash(rawAdminPassword, 10);
      legacyAdmin.role = 'ADMIN';
      legacyAdmin.isVerified = true;
      legacyAdmin.status = 'ACTIVE';
      await legacyAdmin.save();
      console.log(`✅ Legacy admin account migrated successfully to: ${adminEmail}`);
      return;
    }

    // 3. Create new Admin account with bcrypt hashed password
    const hashedPassword = await bcrypt.hash(rawAdminPassword, 10);

    await User.create({
      name: 'Academic Administrator',
      email: adminEmail,
      phone: '+916206465995',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
    });

    console.log(`✅ Main Admin account created successfully: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to ensure admin user:', error);
  }
}

export const initializeAdminUser = ensureAdminUser;

