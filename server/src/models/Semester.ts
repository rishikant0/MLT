import mongoose, { Schema, Document } from 'mongoose';

export interface ISemester extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  name: string;
  semesterNumber: number;
  description?: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    name: { type: String, required: true, trim: true },
    semesterNumber: { type: Number, required: true },
    description: { type: String },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const Semester = mongoose.model<ISemester>('Semester', SemesterSchema);
