import mongoose, { Schema } from 'mongoose';

export interface IReservation {
  carId: string;
  status: 'reserved' | 'sold';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    carId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['reserved', 'sold'], required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
