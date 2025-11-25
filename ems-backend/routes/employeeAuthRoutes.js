import express from "express";
import * as employeeAuthController from "../controllers/employeeAuthController.js";
import { protect } from "../middleware/authMiddleware.js"; // optional auth middleware

const router = express.Router();

// Routes
router.post("/register", employeeAuthController.registerEmployeeAuth); // Register employee auth
router.post("/login", employeeAuthController.loginEmployee); // Employee login
router.get("/", protect, employeeAuthController.getAllEmployeeAuth); // Get all auth records
router.delete("/:employee_id", protect, employeeAuthController.deleteEmployeeAuth); // Delete auth

export default router;
