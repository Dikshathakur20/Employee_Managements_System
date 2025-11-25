import express from "express";
import {
  addAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js"; // Import role middleware

const router = express.Router();

// ADD ATTENDANCE --> Employee only
router.post("/", protect, roleMiddleware(["employee"]), addAttendance);

// GET ALL ATTENDANCE --> Admin only
router.get("/", protect, roleMiddleware(["admin"]), getAllAttendance);

// GET ATTENDANCE BY EMPLOYEE --> Both admin & employee
router.get("/:employee_id", protect, roleMiddleware(["admin", "employee"]), getAttendanceByEmployee);

// UPDATE ATTENDANCE --> Employee only
router.put("/:id", protect, roleMiddleware(["employee"]), updateAttendance);

// DELETE ATTENDANCE --> No one allowed (optional: remove route or keep it protected)
router.delete("/:id", protect, (req, res) => res.status(403).json({ message: "Not allowed" }));

export default router;
