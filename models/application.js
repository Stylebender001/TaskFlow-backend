import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jobs",
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  proposedPrice: { type: Number, required: true },
  message: String,
  status: {
    type: String,
    enum: ["pending", "selected", "accepted", "rejected", "cancelled"],
    default: "pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Applications", applicationSchema);
