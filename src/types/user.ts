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
  _id: string
  userId: {
    _id: string
    name: string
  }
  bloodType: string
  hospital: string
  city: string
  units: number
  description: string
  contact: string
  status: "active" | "completed"
  donors: {
    userId: string
    status: "pending" | "completed"
    createdAt: string
  }[]
  totalDonors: number
  createdAt: string
  completedAt?: string
} 