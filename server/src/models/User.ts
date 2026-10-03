import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'STUDENT' | 'ADMIN';
  avatar?: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT', index: true },
    avatar: { type: String },
    isVerified: { type: Boolean, default: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
