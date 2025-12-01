import Designation from "../models/Designation.js";
import Employee from "../models/Employee.js";



// Get total designation count
export const getDesignationCount = async (req, res) => {
  try {
    const count = await Designation.estimatedDocumentCount();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// Add new designation
export const addDesignation = async (req, res) => {
  try {
    const { designation_id, designation_title, department_id } = req.body;

    const existing = await Designation.findOne({ designation_id }).lean();
    if (existing)
      return res.status(400).json({ message: "Designation ID already exists" });

    const designation = await Designation.create({
      designation_id,
      designation_title,
      department_id
    });

    res.status(201).json({ message: "Designation added successfully", designation });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Get all designations (Faster version)
export const getAllDesignations = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const designations = await Designation.find({})
      .sort({ designation_title: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fast employee count mapping
    const ids = designations.map(d => d.designation_id);

    const employeeCounts = await Employee.aggregate([
      { $match: { designation_id: { $in: ids } } },
      { $group: { _id: "$designation_id", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    employeeCounts.forEach(e => (countMap[e._id] = e.count));

    const response = designations.map(d => ({
      ...d,
      total_employees: countMap[d.designation_id] || 0
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Get designation by ID
export const getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findOne({
      designation_id: Number(req.params.designation_id)
    })
      .select("designation_id designation_title department_id")
      .lean();

    if (!designation)
      return res.status(404).json({ message: "Designation not found" });

    res.status(200).json(designation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Update designation
export const updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findOneAndUpdate(
      { designation_id: Number(req.params.designation_id) },
      req.body,
      { new: true }
    ).lean();

    if (!designation)
      return res.status(404).json({ message: "Designation not found" });

    res.status(200).json({ message: "Designation updated", designation });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Delete designation
export const deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findOneAndDelete({
      designation_id: Number(req.params.designation_id)
    }).lean();

    if (!designation)
      return res.status(404).json({ message: "Designation not found" });

    res.status(200).json({ message: "Designation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
