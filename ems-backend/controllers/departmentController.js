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
    const { department_id, department_name, location } = req.body;

    const existingDept = await Department.findOne({ department_id });
    if (existingDept) {
      return res.status(400).json({ message: "Department ID already exists" });
    }

    const department = new Department({ department_id, department_name, location });
    await department.save();

    res.status(201).json({ message: "Department added successfully", department });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ department_name: 1 });

    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const [designationCount, employeeCount] = await Promise.all([
          Designation.countDocuments({ department_id: dept.department_id }),
          Employee.countDocuments({ department_id: dept.department_id }),
        ]);

        return {
          department_id: dept.department_id,
          department_name: dept.department_name,
          location: dept.location,
          total_designations: designationCount,
          total_employees: employeeCount,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getDesignationsByDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const designations = await Designation.find({ department_id: Number(id) });

    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { department_id } = req.params;
    const department = await Department.findOne({ department_id });

    if (!department) return res.status(404).json({ message: "Department not found" });

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { department_id } = req.params;
    const { department_name, location } = req.body;

    const department = await Department.findOneAndUpdate(
      { department_id },
      { department_name, location },
      { new: true }
    );

    if (!department) return res.status(404).json({ message: "Department not found" });

    res.status(200).json({ message: "Department updated", department });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { department_id } = req.params;

    const department = await Department.findOneAndDelete({ department_id });

    if (!department) return res.status(404).json({ message: "Department not found" });

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
