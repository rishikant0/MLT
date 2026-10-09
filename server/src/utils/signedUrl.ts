import jwt from 'jsonwebtoken';
import { Material, Entitlement } from '../models';
import { config } from '../config';
import mongoose from 'mongoose';

export const checkStudentEntitlementForMaterial = async (
  userId: string,
  materialId: string
): Promise<{ hasAccess: boolean; reason?: string }> => {
  if (!mongoose.Types.ObjectId.isValid(materialId)) {
    return { hasAccess: false, reason: 'Invalid material ID' };
  }

  const material = await Material.findById(materialId);

  if (!material) {
    return { hasAccess: false, reason: 'Material not found' };
  }

  // If material is explicitly free, a sample, or public access, grant access immediately
  if (!material.isPaid || material.isSample || material.accessLevel === 'PUBLIC') {
    return { hasAccess: true };
  }

  // Fetch active entitlements for this user
  const entitlements = await Entitlement.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: 'ACTIVE',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } },
    ],
  });

  const mId = material._id.toString();
  const subId = material.subjectId ? material.subjectId.toString() : '';
  const semId = material.semesterId ? material.semesterId.toString() : '';
  const crsId = material.courseId ? material.courseId.toString() : '';

  const hasAccess = entitlements.some((ent) => {
    if (ent.materialId && ent.materialId.toString() === mId) return true;
    if (ent.subjectId && ent.subjectId.toString() === subId) return true;
    if (ent.semesterId && ent.semesterId.toString() === semId) return true;
    if (ent.courseId && ent.courseId.toString() === crsId && !ent.semesterId && !ent.subjectId && !ent.materialId) {
      return true;
    }
    return false;
  });

  if (hasAccess) {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    reason: 'Active purchase required for this material, subject, semester, or course.',
  };
};

export const generateSignedMaterialUrl = (userId: string, materialId: string): string => {
  const expiresInSeconds = 3600; // 1 hour token
  const token = jwt.sign(
    { userId, materialId, purpose: 'material_access' },
    config.jwtSecret,
    { expiresIn: expiresInSeconds }
  );

  return `${config.backendUrl}/api/materials/stream?materialId=${materialId}&token=${token}`;
};

export const verifySignedMaterialToken = (
  token: string,
  materialId: string
): { valid: boolean; userId?: string } => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; materialId: string; purpose?: string };
    if (decoded.purpose !== 'material_access' || decoded.materialId !== materialId) {
      return { valid: false };
    }
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false };
  }
};
