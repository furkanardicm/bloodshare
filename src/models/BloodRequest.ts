import mongoose from "mongoose";
import User from "./User";

// Şemayı temizle ve yeniden oluştur
if (mongoose.models.BloodRequest) {
  delete mongoose.models.BloodRequest;
}

const bloodRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"],
  },
  hospital: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  units: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'bloodRequests'
});

export default mongoose.model("BloodRequest", bloodRequestSchema); 