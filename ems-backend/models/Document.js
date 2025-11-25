import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
  },
  department: {
    type: Number,
    required: true,
  },
  designation: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["personal", "skills","education"], // adjust categories as needed
  },
  file_name: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  uploaded_by: {
    type: String,
    required: true,
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Document", documentSchema);
