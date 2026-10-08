import mongoose, { Schema, Document } from 'mongoose';

export type PricingEntityType = 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL';

export interface IPricing extends Document {
  _id: mongoose.Types.ObjectId;
  entityType: PricingEntityType;
  entityId: mongoose.Types.ObjectId;
  price: number;
  offerPrice: number;
  discountPercentage: number;
  accessDurationDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    entityType: {
      type: String,
      enum: ['COURSE', 'SEMESTER', 'SUBJECT', 'MATERIAL'],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    accessDurationDays: { type: Number, default: 365 },
  },
  { timestamps: true }
);

// Ensure one pricing rule per entity
PricingSchema.index({ entityType: 1, entityId: 1 }, { unique: true });

export const Pricing = mongoose.model<IPricing>('Pricing', PricingSchema);
