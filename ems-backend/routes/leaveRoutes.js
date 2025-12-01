import express from "express";
import * as leaveController from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.get("/count", protect, leaveController.getLeaveCount);
router.get("/count/pending", protect, leaveController.getPendingLeaveCount);

// APPLY LEAVE --> Employee only
router.post("/", protect, roleMiddleware(["employee"]), leaveController.applyLeave);

// GET ALL LEAVES --> Admin only
router.get("/", protect, roleMiddleware(["admin"]), leaveController.getAllLeaves);

// GET LEAVES BY EMPLOYEE --> Both admin & employee
router.get("/employee/:employee_id", protect, roleMiddleware(["admin", "employee"]), leaveController.getLeavesByEmployee);

// UPDATE LEAVE STATUS --> Admin only
router.put("/status/:id", protect, roleMiddleware(["admin"]), leaveController.updateLeaveStatus);

// DELETE LEAVE --> Employee only (self delete if needed)
router.delete("/:id", protect, roleMiddleware(["employee"]), leaveController.deleteLeave);

export default router;
