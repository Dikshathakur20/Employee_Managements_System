import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  department_id: {
    type: Number,
    required: false,
    index: true, // 🚀 speeds up queries
  },
  department_name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    default: null,
  },
});

// AUTO-INCREMENT department_id (fast)
DepartmentSchema.pre("save", async function (next) {
  if (this.department_id) return next();

  const last = await this.constructor.findOne({}, { department_id: 1 })
    .sort({ department_id: -1 });

  this.department_id = last ? last.department_id + 1 : 1;
  next();
});

export default mongoose.model("Department", DepartmentSchema);
