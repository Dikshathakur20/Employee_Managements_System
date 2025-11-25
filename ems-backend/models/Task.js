import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
  },
  task_title: {
    type: String,
    required: true,
  },
  task_description: {
    type: String,
    required: true,
  },
  due_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Overdue"],
    default: "Pending",
  },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Task", taskSchema);
