import mongoose, { Schema } from 'mongoose';

const CarPhotoSchema = new Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
}, { timestamps: true });

export default mongoose.models.CarPhoto || mongoose.model('CarPhoto', CarPhotoSchema);
