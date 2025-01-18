import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false // Varsayılan olarak şifreyi getirme
  },
  image: String,
  bloodType: String,
  city: String,
  phone: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  helpedPeople: {
    type: Number,
    default: 0
  },
  isDonor: {
    type: Boolean,
    default: true
  },
  pendingDonations: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const User = models.users || model('users', userSchema);

export default User; 