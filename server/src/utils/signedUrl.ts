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

  // If material is free/not paid, grant access
  if (!material.isPaid) {
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
    { userId, materialId },
    config.jwtSecret,
    { expiresIn: expiresInSeconds }
  );

  return `${config.backendUrl}/api/materials/${materialId}/access?token=${token}`;
};

export const verifySignedMaterialToken = (token: string, materialId: string): boolean => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; materialId: string };
    return decoded.materialId === materialId;
  } catch (error) {
    return false;
  }
};
