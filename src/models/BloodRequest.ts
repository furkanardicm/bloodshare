import mongoose from "mongoose";
import { Document, Types } from "mongoose";
import { User } from "./User";

// Şemayı temizle ve yeniden oluştur
if (mongoose.models.BloodRequest) {
  delete mongoose.models.BloodRequest;
}

export interface IBloodRequest extends Document {
  userId: Types.ObjectId;
  bloodType: string;
  hospital: string;
  city: string;
  units: number;
  description: string;
  contact: string;
  status: 'active' | 'completed';
  isDonation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bloodRequestSchema = new mongoose.Schema<IBloodRequest>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: [true, 'Kullanıcı ID alanı zorunludur'],
  },
  bloodType: {
    type: String,
    required: [true, 'Kan grubu alanı zorunludur'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'],
  },
  hospital: {
    type: String,
    required: [true, 'Hastane alanı zorunludur'],
  },
  city: {
    type: String,
    required: [true, 'Şehir alanı zorunludur'],
  },
  units: {
    type: Number,
    required: [true, 'Ünite alanı zorunludur'],
    min: [1, 'En az 1 ünite kan gereklidir'],
  },
  description: {
    type: String,
    required: [true, 'Açıklama alanı zorunludur'],
  },
  contact: {
    type: String,
    required: [true, 'İletişim alanı zorunludur'],
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  isDonation: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const BloodRequest = mongoose.models.BloodRequest || mongoose.model<IBloodRequest>('BloodRequest', bloodRequestSchema); 