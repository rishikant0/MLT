import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  description?: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
