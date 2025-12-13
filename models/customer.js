import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
    required: true,
  },
});

export default mongoose.model("Customers", customerSchema);
