import mongoose, { Schema } from 'mongoose';

export interface ICar {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: string;
  engine: string;
  hp?: number;
  displacement?: number;
  color?: string;
  bodyType?: string;
  transmission?: string;
  drivetrain?: string;
  price_krw: number;
  price_rub: number;
  price_usd?: number;
  images: string[];
  description?: string;
  equipment: string[];
  vin?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema = new Schema<ICar>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    fuel: { type: String, required: true },
    engine: { type: String, default: '' },
    hp: { type: Number },
    displacement: { type: Number },
    color: { type: String },
    bodyType: { type: String },
    transmission: { type: String },
    drivetrain: { type: String },
    price_krw: { type: Number, required: true },
    price_rub: { type: Number, required: true },
    price_usd: { type: Number },
    images: [{ type: String }],
    description: { type: String },
    equipment: [{ type: String }],
    vin: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);
