import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import Employee from "../models/Employee.js";

export const getDepartmentCount = async (req, res) => {
  try {
    const count = await Department.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new department
export const addDepartment = async (req, res) => {
  try {
    const { department_name, location } = req.body;

    const department = new Department({
      department_name,
      location: location || null
    });

    await department.save();

    res.status(201).json({
      message: "Department added successfully",
      department
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: "designations",
          localField: "department_id",
          foreignField: "department_id",
          as: "designations"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "department_id",
          foreignField: "department_id",
          as: "employees"
        }
      },
      {
        $project: {
          department_id: 1,
          department_name: 1,
          location: 1,
          total_designations: { $size: "$designations" },
          total_employees: { $size: "$employees" }
        }
      },
      { $sort: { department_name: 1 } }
    ]);

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const getDesignationsByDepartment = async (req, res) => {
  try {
    const deptId = Number(req.params.id);

    const list = await Designation.find({ department_id: deptId });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findOne({
      department_id: Number(req.params.department_id)
    });

    if (!dept) return res.status(404).json({ message: "Department not found" });

    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findOneAndUpdate(
      { department_id: Number(req.params.department_id) },
      req.body,
      { new: true }
    );

    if (!dept) return res.status(404).json({ message: "Department not found" });

    res.json({ message: "Updated successfully", department: dept });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findOneAndDelete({
      department_id: Number(req.params.department_id)
    });

    if (!dept) return res.status(404).json({ message: "Department not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

