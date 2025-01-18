import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string | null;
  bloodType: string | null;
  isDonor: boolean;
  lastDonationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithoutPassword {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bloodType: string | null;
  isDonor: boolean;
  lastDonationDate: Date | null;
}

export interface BloodRequest {
  _id: string;
  hospital: string;
  city: string;
  bloodType: string;
  isUrgent: boolean;
  createdAt: string;
  description: string;
  completedAt?: string;
  userId: string | { _id: string };
  donors: Array<{
    userId: string;
    status: string;
  }>;
} 