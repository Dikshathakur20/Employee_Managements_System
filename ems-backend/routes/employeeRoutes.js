import express from "express";
import * as employeeController from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/count", protect, employeeController.getEmployeeCount);
router.get("/check-email", employeeController.checkEmail);
router.get("/generate-code", employeeController.generateEmployeeCode);

router.post("/", protect, employeeController.addEmployee); // Add employee
router.get("/", protect, employeeController.getAllEmployees); // Get all employees
router.get("/:employee_id", protect, employeeController.getEmployeeById); // Get employee by ID
router.put("/:employee_id", protect, employeeController.updateEmployee); // Update employee
router.patch("/:employee_id/profile", protect, employeeController.updateEmployeeProfile);
router.delete("/:employee_id", protect, employeeController.deleteEmployee); // Delete employee

export default router;
