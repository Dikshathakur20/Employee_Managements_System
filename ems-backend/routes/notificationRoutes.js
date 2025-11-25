import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import Employee from "../models/Employee.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// CREATE NOTIFICATION --> Admin only
router.post("/", protect, roleMiddleware(["admin"]), notificationController.createNotification);

// GET ALL NOTIFICATIONS --> Admin only
router.get("/", protect, roleMiddleware(["admin"]), notificationController.getAllNotifications);

// GET BY ID --> Both admin & employee
router.get("/:id", protect, roleMiddleware(["admin", "employee"]), notificationController.getNotificationById);

// UPDATE NOTIFICATION --> Admin only
router.put("/:id", protect, roleMiddleware(["admin"]), notificationController.updateNotification);

// DELETE NOTIFICATION --> Admin only
router.delete("/:id", protect, roleMiddleware(["admin"]), notificationController.deleteNotification);





export default router;
