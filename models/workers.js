import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  skills: { type: [String], required: true },
  rating: { type: Number, default: 0 },
  location: { type: String, required: true },
});

export default mongoose.model("Workers", workerSchema);
