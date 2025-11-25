import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

console.log("Admin controller loaded");

// =============================
// Admin Login
// =============================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
  { id: admin._id, role: "admin" }, // FIXED ROLE HERE
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    res.json({ token, admin });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// =============================
// Create new admin
// =============================
export const createAdmin = async (req, res) => {
  try {
    const { email, password, user_name, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashed,
      user_name,
      role: role ?? "admin",
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error("Create Admin Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// =============================
// Get all admins
// =============================
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error("Get All Admins Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// =============================
// Update admin
// =============================
export const updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body, updated_at: new Date() };

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
    res.json(admin);
  } catch (error) {
    console.error("Update Admin Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// =============================
// Delete admin
// =============================
export const deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    await Admin.findByIdAndDelete(id);
    res.json({ message: "Admin deleted" });
  } catch (error) {
    console.error("Delete Admin Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

console.log("Exports:", { loginAdmin, createAdmin, getAllAdmins, updateAdmin, deleteAdmin });
