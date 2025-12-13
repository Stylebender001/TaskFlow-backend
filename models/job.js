import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 55,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 255,
  },
  skillsRequired: [
    {
      type: String,
      required: true,
    },
  ],
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "assigned", "completed"],
    default: "open",
  },
  maxWorkers: {
    type: Number,
    default: 1,
  },
  assignedWorkers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Jobs", jobSchema);
