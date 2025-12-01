import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =============================
// FAST Admin Login
// =============================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use lean() → MUCH FASTER (returns plain object)
    const admin = await Admin.findOne({ email }).lean();
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    // Compare password (bcrypt.compare is already optimized)
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(400).json({ message: "Invalid password" });

    // Smaller JWT payload = faster signing + better performance
   const token = jwt.sign(
  { id: admin._id, role: admin.role }, // <-- include role
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    // Remove password before sending
    delete admin.password;

    res.json({ token, admin });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// FAST Create Admin
// =============================
export const createAdmin = async (req, res) => {
  try {
    const { email, password, user_name, role } = req.body;

    // Check exists (fast path if email indexed)
    const exists = await Admin.exists({ email });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });

    // Hashing is expensive → keep cost low (10 is optimal)
    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashed,
      user_name,
      role: role || "admin",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Don't leak password
    admin.password = undefined;

    res.status(201).json(admin);
  } catch (error) {
    console.error("Create Admin Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// FAST Get All Admins
// =============================
export const getAllAdmins = async (req, res) => {
  try {
    // lean() improves speed by 50–200%
    const admins = await Admin.find().select("-password").lean();
    res.json(admins);
  } catch (error) {
    console.error("Get All Admins Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// FAST Update Admin
// =============================
export const updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body, updated_at: new Date() };

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password",
    }).lean();

    res.json(admin);
  } catch (error) {
    console.error("Update Admin Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// FAST Delete Admin
// =============================
export const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id).lean();
    res.json({ message: "Admin deleted" });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
