import mongoose, { Schema, Document } from 'mongoose';

export interface IEntitlement extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  semesterId?: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId;
  purchaseId: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'REVOKED';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EntitlementSchema = new Schema<IEntitlement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE', index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Entitlement = mongoose.model<IEntitlement>('Entitlement', EntitlementSchema);
