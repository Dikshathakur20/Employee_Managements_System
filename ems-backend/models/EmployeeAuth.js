import mongoose from "mongoose";

const employeeAuthSchema = new mongoose.Schema(
  {
    employee_id: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    employee_code: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const EmployeeAuth = mongoose.model("EmployeeAuth", employeeAuthSchema);

export default EmployeeAuth;
