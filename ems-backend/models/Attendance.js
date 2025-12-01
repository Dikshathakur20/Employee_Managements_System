import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
  },

  // Only one record per date
  date: {
    type: Date,
    required: true,
  },

  // Check-in must exist when creating the record
  check_in: {
    type: Date,
    required: true,
  },

  // Check-out will be added later (not required on creation)
  check_out: {
    type: Date,
    default: null,
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
