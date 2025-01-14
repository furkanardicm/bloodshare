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
  userId: string;
  requesterName: string;
  bloodType: string;
  hospital: string;
  city: string;
  units: number;
  description: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isUrgent?: boolean;
  status: "pending" | "completed" | "cancelled";
  donors?: Array<{
    email: string;
    name: string;
    userId: string;
    status: "pending" | "completed" | "cancelled";
  }>;
} 