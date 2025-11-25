import mongoose from "mongoose";
import Department from "./Department.js";

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },

  target_audience: {
    type: String,
    required: true,
    default: "All",
    validate: {
      validator: async function (value) {
        if (value === "All") return true; // Allow "All"

        // Check department_name instead of name
        const departmentExists = await Department.exists({
          department_name: value,
        });

        return departmentExists ? true : false;
      },
      message: "Invalid department selected",
    },
  },

}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
