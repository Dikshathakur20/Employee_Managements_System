import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  check_in: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave"],
    default: "Present",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Attendance", attendanceSchema);
