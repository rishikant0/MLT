import mongoose, { Schema, Document } from 'mongoose';
import { ProductType } from './Order';

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  productType: ProductType;
  courseId?: mongoose.Types.ObjectId;
  semesterId?: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId;
  amount: number;
  status: 'SUCCESS';
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    productType: { type: String, enum: ['COURSE', 'SEMESTER', 'SUBJECT', 'MATERIAL'], required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
