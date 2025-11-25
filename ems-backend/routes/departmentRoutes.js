import express from "express";
import * as departmentController from "../controllers/departmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/count", protect, departmentController.getDepartmentCount);
// ⚠️ Place this BEFORE /:department_id
router.get("/department/:id", protect, departmentController.getDesignationsByDepartment);

// Add department
router.post("/", protect, departmentController.addDepartment);

// Get all departments
router.get("/", protect, departmentController.getAllDepartments);

// Get department by ID
router.get("/:department_id", protect, departmentController.getDepartmentById);

// Update
router.put("/:department_id", protect, departmentController.updateDepartment);

// Delete
router.delete("/:department_id", protect, departmentController.deleteDepartment);

export default router;
