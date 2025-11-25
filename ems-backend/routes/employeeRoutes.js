import express from "express";
import * as employeeController from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/count", protect, employeeController.getEmployeeCount);
// Routes
router.post("/", protect, employeeController.addEmployee); // Add employee
router.get("/", protect, employeeController.getAllEmployees); // Get all employees
router.get("/:employee_id", protect, employeeController.getEmployeeById); // Get by employee_id
router.put("/:employee_id", protect, employeeController.updateEmployee); // Update employee
router.delete("/:employee_id", protect, employeeController.deleteEmployee); // Delete employee
// Get employee count


export default router;
