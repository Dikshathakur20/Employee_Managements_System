import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// CREATE NOTIFICATION --> Admin only
router.post(
  "/",
  protect,
  roleMiddleware(["admin"]),
  notificationController.createNotification
);

// 👇 EMPLOYEE NOTIFICATIONS (employee sees only their relevant ones)
router.get(
  "/employee",
  protect,
  roleMiddleware(["employee", "admin"]),
  notificationController.getAllNotifications
);

// 👇 ADMIN NOTIFICATIONS (admin sees all)
router.get(
  "/admin",
  protect,
  roleMiddleware(["admin"]),
  notificationController.getAdminNotifications
);

// 👇 MUST COME LAST — otherwise it will catch /admin or /employee
router.get(
  "/:id",
  protect,
  roleMiddleware(["admin", "employee"]),
  notificationController.getNotificationById
);

// UPDATE
router.put(
  "/:id",
  protect,
  roleMiddleware(["admin"]),
  notificationController.updateNotification
);

// DELETE
router.delete(
  "/:id",
  protect,
  roleMiddleware(["admin"]),
  notificationController.deleteNotification
);

export default router;
