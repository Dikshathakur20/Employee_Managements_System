import express from "express";
import {
  addAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getTodaysAttendance,
  updateAttendance,
  
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* -------------------------- ADD ATTENDANCE -------------------------- */
// Employee can check-in or check-out
router.post("/", protect, roleMiddleware(["employee"]), addAttendance);

/* ------------------------- GET TODAY'S RECORD ------------------------ */
// IMPORTANT: Place BEFORE /:employee_id to avoid route conflict
router.get(
  "/today/:employee_id",
  protect,
  roleMiddleware(["employee", "admin"]),
  getTodaysAttendance
);

/* ---------------------- GET ATTENDANCE OF EMPLOYEE ------------------ */
// Admin can view any employee; Employee can view their own
router.get(
  "/employee/:employee_id",
  protect,
  roleMiddleware(["admin", "employee"]),
  getAttendanceByEmployee
);

/* -------------------------- GET ALL ATTENDANCE ---------------------- */
// Admin only
router.get(
  "/",
  protect,
  roleMiddleware(["admin"]),
  getAllAttendance
);

/* -------------------------- UPDATE ATTENDANCE ------------------------ */
// Employee can update only their own check-out
router.put("/:id", protect, roleMiddleware(["employee"]), updateAttendance);



/* ---------------------------- DELETE (BLOCKED) ----------------------- */
router.delete("/:id", protect, (req, res) =>
  res.status(403).json({ message: "Not allowed" })
);



export default router;
