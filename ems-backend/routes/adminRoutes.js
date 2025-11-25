import express from "express";
import {
  loginAdmin,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// PUBLIC
router.post("/login", loginAdmin);

// ADMIN CREATION (optional)
router.post("/", createAdmin);

// PROTECTED CRUD (you can add middleware later)
router.get("/", getAllAdmins);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
