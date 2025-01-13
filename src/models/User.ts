import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bloodType: string;
  city: string;
  phone: string;
  isAvailable: boolean;
  lastDonationDate: Date | null;
  totalDonations: number;
  helpedPeople: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithoutPassword {
  id: string;
  name: string | undefined;
  email: string | undefined;
  bloodType: string | undefined;
  city: string | undefined;
  phone: string | undefined;
  isAvailable: boolean | undefined;
  lastDonationDate: Date | undefined;
  totalDonations: number;
  helpedPeople: number;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Geçerli bir email adresi giriniz'
    }
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
  },
  bloodType: {
    type: String,
    required: [true, 'Kan grubu alanı zorunludur'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'],
      message: 'Geçersiz kan grubu'
    }
  },
  city: {
    type: String,
    required: [true, 'Şehir alanı zorunludur'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefon alanı zorunludur'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Geçerli bir telefon numarası giriniz (10 haneli)'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0,
    required: true
  },
  helpedPeople: {
    type: Number,
    default: 0,
    required: true
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'users'
});

// Şemayı temizle ve yeniden oluştur
if (models.User) {
  delete models.User;
}

export default model<IUser>('User', userSchema); 