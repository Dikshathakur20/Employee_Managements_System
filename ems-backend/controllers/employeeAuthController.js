import EmployeeAuth from "../models/EmployeeAuth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register employee authentication
export const registerEmployeeAuth = async (req, res) => {
  try {
    const { employee_id, email, password, employee_code, phone, dob } = req.body;

    // Check if user exists
    const existingUser = await EmployeeAuth.findOne({ $or: [{ email }, { employee_code }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Employee Code already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAuth = new EmployeeAuth({
      employee_id,
      email,
      password: hashedPassword,
      employee_code,
      phone,
      dob,
    });

    await newAuth.save();
    res.status(201).json({ message: "Employee Auth created successfully", newAuth });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Employee login
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await EmployeeAuth.findOne({ email });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
  { id: employee._id, role: "employee" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        employee_id: employee.employee_id,
        email: employee.email,
        employee_code: employee.employee_code,
        phone: employee.phone,
        dob: employee.dob,
        status: employee.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all employee auth records
export const getAllEmployeeAuth = async (req, res) => {
  try {
    const employees = await EmployeeAuth.find().sort({ employee_id: 1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete employee auth
export const deleteEmployeeAuth = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const employee = await EmployeeAuth.findOneAndDelete({ employee_id });

    if (!employee) return res.status(404).json({ message: "Employee Auth not found" });

    res.status(200).json({ message: "Employee Auth deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
