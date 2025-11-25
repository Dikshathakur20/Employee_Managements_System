import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hire_date: {
    type: Date,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  department_id: {
    type: Number,
    required: true,
  },
  designation_id: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  employee_code: {
    type: String,
    required: true,
    unique: true,
  },
  employment_type: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Contractor", "Intern"],
    default: "Full-Time",
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Terminated"],
    default: "Active",
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
