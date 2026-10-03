import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
