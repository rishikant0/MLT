import mongoose, { Schema, Document } from 'mongoose';

export type ProductType = 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL';
export type OrderStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productType: ProductType;
  courseId?: mongoose.Types.ObjectId;
  semesterId?: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productType: { type: String, enum: ['COURSE', 'SEMESTER', 'SUBJECT', 'MATERIAL'], required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    razorpayOrderId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
