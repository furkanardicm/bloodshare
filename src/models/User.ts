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
  lastDonationDate: Date,
  donationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const User = models.users || model('users', userSchema);

export default User; 