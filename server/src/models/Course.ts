import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  category: string;
  duration: string;
  eligibility?: string;
  careerOpportunities: string[];
  thumbnail?: string;
  price?: number;
  offerPrice?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String },
    description: { type: String },
    category: { type: String, default: 'Allied Health' },
    duration: { type: String, required: true },
    eligibility: { type: String },
    careerOpportunities: [{ type: String }],
    thumbnail: { type: String },
    price: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
