import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  category?: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    content: { type: String, required: true },
    featuredImage: { type: String },
    category: { type: String, default: 'Medical Education' },
    author: { type: String, default: 'MLT Academic Team' },
    seoTitle: { type: String },
    seoDescription: { type: String },
    status: { type: String, enum: ['PUBLISHED', 'DRAFT'], default: 'PUBLISHED', index: true },
  },
  { timestamps: true }
);

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
