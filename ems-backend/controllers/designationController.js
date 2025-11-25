import Designation from "../models/Designation.js";

export const getDesignationCount = async (req, res) => {
  try {
    const count = await Designation.countDocuments();
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

    const existingDesignation = await Designation.findOne({ designation_id });
    if (existingDesignation) {
      return res.status(400).json({ message: "Designation ID already exists" });
    }

    const designation = new Designation({ designation_id, designation_title, department_id });
    await designation.save();

    res.status(201).json({ message: "Designation added successfully", designation });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all designations
export const getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().sort({ designation_title: 1 });
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get designation by ID
export const getDesignationById = async (req, res) => {
  try {
    const { designation_id } = req.params;
    const designation = await Designation.findOne({ designation_id });

    if (!designation) return res.status(404).json({ message: "Designation not found" });

    res.status(200).json(designation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update designation
export const updateDesignation = async (req, res) => {
  try {
    const { designation_id } = req.params;
    const { designation_title, department_id } = req.body;

    const designation = await Designation.findOneAndUpdate(
      { designation_id },
      { designation_title, department_id },
      { new: true }
    );

    if (!designation) return res.status(404).json({ message: "Designation not found" });

    res.status(200).json({ message: "Designation updated", designation });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete designation
export const deleteDesignation = async (req, res) => {
  try {
    const { designation_id } = req.params;

    const designation = await Designation.findOneAndDelete({ designation_id });

    if (!designation) return res.status(404).json({ message: "Designation not found" });

    res.status(200).json({ message: "Designation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
