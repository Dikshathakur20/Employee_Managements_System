import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
  },
  leave_type: {
    type: String,
    enum: ["Paid Leave", "Sick Leave", "Casual Leave", "Other"],
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  no_of_leaves: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
