import mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  bloodType: string;
  isDonor: boolean;
  lastDonationDate?: Date;
  city?: string;
  totalDonations?: number;
  helpedPeople?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithoutPassword {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  isDonor: boolean;
  lastDonationDate?: Date;
  city?: string;
  totalDonations?: number;
  helpedPeople?: number;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
  },
  phone: {
    type: String,
    required: [true, 'Telefon alanı zorunludur'],
  },
  bloodType: {
    type: String,
    required: [true, 'Kan grubu alanı zorunludur'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'],
  },
  isDonor: {
    type: Boolean,
    default: false,
  },
  lastDonationDate: {
    type: Date,
  },
  city: {
    type: String,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  helpedPeople: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 