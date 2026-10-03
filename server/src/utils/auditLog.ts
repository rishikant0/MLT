import { AuditLog } from '../models';
import mongoose from 'mongoose';

export const logAuditAction = async (params: {
  adminId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}) => {
  try {
    await AuditLog.create({
      adminId: params.adminId ? new mongoose.Types.ObjectId(params.adminId) : undefined,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details,
      ipAddress: params.ipAddress || '127.0.0.1',
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
};
