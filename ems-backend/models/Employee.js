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
    index: true
  },

  designation_id: {
    type: Number,
    required: true,
    index: true
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

  file_data: {
  type: String,
  default: null,
},

emergency_contact_name: {
    type: String,
    default: "",
  },
  emergency_contact_phone: {
    type: String,
    default: "",
  },
  emergency_contact_relation: {
    type: String,
    default: "",
  },

}, { timestamps: true });


// ----------------------------------
// ✅ ADD INDEXES HERE
// ----------------------------------
employeeSchema.index({ employee_id: 1 }, { unique: true });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ employee_code: 1 }, { unique: true });
employeeSchema.index({ department_id: 1 });
// Optional: Compound index (if you need search optimization)
// employeeSchema.index({ department_id: 1, designation_id: 1 });

export default mongoose.model("Employee", employeeSchema);
