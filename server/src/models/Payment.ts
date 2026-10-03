import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from './Order';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentMethod: 'UPI_MANUAL' | 'RAZORPAY';
  method?: string;
  utrNumber?: string;
  screenshotUrl?: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  signatureVerified: boolean;
  failureReason?: string;
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
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
    paymentMethod: { type: String, enum: ['UPI_MANUAL', 'RAZORPAY'], default: 'RAZORPAY' },
    method: { type: String },
    utrNumber: { type: String, index: true },
    screenshotUrl: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'REFUNDED'],
      required: true,
      index: true,
    },
    signatureVerified: { type: Boolean, default: false },
    failureReason: { type: String },
    rejectionReason: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
