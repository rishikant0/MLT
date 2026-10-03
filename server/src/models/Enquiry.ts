import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  course?: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    course: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'],
      default: 'NEW',
      index: true,
    },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
