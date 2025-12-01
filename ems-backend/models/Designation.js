import mongoose from "mongoose";

const DesignationSchema = new mongoose.Schema({
  designation_id: {
    type: Number,
    required: true,
    unique: true,       // prevents duplicate IDs
    index: true         // speeds up searches
  },
  designation_title: {
    type: String,
    required: true,
    trim: true
  },
  department_id: {
    type: Number,
    required: true,
    index: true         // important for fast lookup
  }
}, { timestamps: true });

// Auto-increment designation_id
DesignationSchema.pre("save", async function (next) {
  if (this.designation_id) return next();

  const last = await this.constructor.findOne({}, { designation_id: 1 })
    .sort({ designation_id: -1 });

  this.designation_id = last ? last.designation_id + 1 : 1;
  next();
});

export default mongoose.model("Designation", DesignationSchema);
