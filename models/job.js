import mongoose from "mongoose";
import JOB_STATUS from "../constants/jobStatus.js";

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skills",
      required: true,
    },
  ],
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(JOB_STATUS),
    default: JOB_STATUS.OPEN,
  },
  workersNeeded: {
    type: Number,
    default: 1,
  },
  assignedWorkers: [
    {
      worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
      agreedPrice: {
        type: Number,
        required: true,
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("Jobs", jobSchema);
