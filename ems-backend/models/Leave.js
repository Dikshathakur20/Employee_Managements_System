import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee_id: {
      type: Number,
      required: true,
    },
    leave_type: {
      type: String,
      enum: ["Paid Leave", "Sick Leave", "Casual Leave", "Emergency Leave"],
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
    rejection_reason: {
      type: String,
      default: null,
    },
  },
 { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } } 
);

// ================================
// INDEXES (correct field + name)
// ================================
leaveSchema.index({ employee_id: 1 });
leaveSchema.index({ start_date: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ created_at: -1 }); // correct timestamps index

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
