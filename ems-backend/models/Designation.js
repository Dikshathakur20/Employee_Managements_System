import mongoose from "mongoose";

const designationSchema = new mongoose.Schema({
  designation_id: {
    type: Number,
    required: true,
    unique: true,
  },
  designation_title: {
    type: String,
    required: true,
  },
  department_id: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Designation", designationSchema);
