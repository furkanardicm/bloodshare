import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const bloodRequestSchema = new mongoose.Schema(
  {
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
      enum: ["active", "completed"],
      default: "active",
    },
    donors: [donorSchema],
    totalDonors: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Toplam bağışçı sayısını güncelle
bloodRequestSchema.pre("save", function (next) {
  if (this.isModified("donors")) {
    this.totalDonors = this.donors.length
  }
  next()
})

export default mongoose.models.BloodRequest || mongoose.model("BloodRequest", bloodRequestSchema) 