import mongoose, { Schema, Document } from 'mongoose';

export type MaterialType =
  | 'PDF'
  | 'HANDWRITTEN_NOTES'
  | 'MCQ'
  | 'QUESTION_BANK'
  | 'SHORT_NOTES'
  | 'LONG_QUESTIONS'
  | 'PREVIOUS_YEAR'
  | 'VIDEO'
  | 'DOCUMENT';

export interface IMaterial extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: MaterialType;
  file: string;
  thumbnail?: string;
  fileSize?: string;
  mimeType?: string;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  accessLevel?: 'PUBLIC' | 'PROTECTED';
  isSample?: boolean;
  isPaid: boolean;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: [
        'PDF',
        'HANDWRITTEN_NOTES',
        'MCQ',
        'QUESTION_BANK',
        'SHORT_NOTES',
        'LONG_QUESTIONS',
        'PREVIOUS_YEAR',
        'VIDEO',
        'DOCUMENT',
      ],
      required: true,
    },
    file: { type: String, required: true },
    thumbnail: { type: String },
    fileSize: { type: String },
    mimeType: { type: String },
    fileName: { type: String },
    originalFileName: { type: String },
    filePath: { type: String },
    accessLevel: { type: String, enum: ['PUBLIC', 'PROTECTED'], default: 'PROTECTED' },
    isPaid: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const Material = mongoose.model<IMaterial>('Material', MaterialSchema);
