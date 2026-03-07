import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  serviceFeeUsd: number;
  brokerFee: number;
  contactPhone: string;
  contactTelegram: string;
  contactWhatsApp: string;
  aboutText: string;
  exchangeRateMarkup: number;
}

const SettingsSchema = new Schema<ISettings>({
  serviceFeeUsd: { type: Number, default: 1600 },
  brokerFee: { type: Number, default: 100000 },
  contactPhone: { type: String, default: '' },
  contactTelegram: { type: String, default: '' },
  contactWhatsApp: { type: String, default: '' },
  aboutText: { type: String, default: '' },
  exchangeRateMarkup: { type: Number, default: 1.02 },
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
