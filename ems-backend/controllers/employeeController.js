import Employee from "../models/Employee.js";

export const getEmployeeCount = async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new employee
export const addEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Check for duplicate email or employee_code
    const existingEmployee = await Employee.findOne({
      $or: [{ email: employeeData.email }, { employee_code: employeeData.employee_code }]
    });

    if (existingEmployee) {
      return res.status(400).json({ message: "Email or Employee Code already exists" });
    }

    const employee = new Employee(employeeData);
    await employee.save();
    res.status(201).json({ message: "Employee added successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ first_name: 1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const employee = await Employee.findOne({ employee_id });

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const updatedData = req.body;

    const employee = await Employee.findOneAndUpdate({ employee_id }, updatedData, { new: true });

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const employee = await Employee.findOneAndDelete({ employee_id });

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
