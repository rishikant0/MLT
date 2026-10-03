import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from './Order';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  method?: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  signatureVerified: boolean;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpayOrderId: { type: String, index: true },
    method: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'],
      required: true,
      index: true,
    },
    signatureVerified: { type: Boolean, default: false },
    failureReason: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
