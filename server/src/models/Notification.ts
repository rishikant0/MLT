import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: 'ENROLLMENT' | 'PAYMENT' | 'SYSTEM';
  title: string;
  message: string;
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  amount?: number;
  orderId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['ENROLLMENT', 'PAYMENT', 'SYSTEM'], default: 'ENROLLMENT' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    studentName: { type: String },
    studentEmail: { type: String },
    courseName: { type: String },
    amount: { type: Number },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
