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
  resetOtp?: string;
  resetOtpExpires?: Date;
  resetOtpAttempts?: number;
  resetToken?: string;
  resetTokenExpires?: Date;
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
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
    resetOtpAttempts: { type: Number, default: 0 },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
