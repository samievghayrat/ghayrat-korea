import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  phone: string;
  messenger: string;
  message: string;
  carId?: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    messenger: { type: String, default: 'phone' },
    message: { type: String, required: true },
    carId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
