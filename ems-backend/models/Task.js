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

taskSchema.index({ employee_id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ due_date: 1 });
taskSchema.index({ created_at: -1 });


export default mongoose.model("Task", taskSchema);
