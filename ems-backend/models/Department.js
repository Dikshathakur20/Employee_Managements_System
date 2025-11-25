import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  department_id: {
    type: Number,
    required: true,
    unique: true,
  },
  department_name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Department", departmentSchema);
