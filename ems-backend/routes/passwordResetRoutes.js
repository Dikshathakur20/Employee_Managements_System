import express from "express";
import * as passwordResetController from "../controllers/passwordResetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js"; // multi-role middleware

const router = express.Router();

// CREATE RESET REQUEST --> Admin only
router.post("/", protect, roleMiddleware(["admin"]), passwordResetController.createPasswordReset);

// GET ALL REQUESTS --> Admin only
router.get("/", protect, roleMiddleware(["admin"]), passwordResetController.getAllPasswordResets);

// GET BY ID --> Both admin & employee
router.get("/:id", protect, roleMiddleware(["admin", "employee"]), passwordResetController.getPasswordResetById);

// UPDATE PASSWORD RESET STATUS --> Admin only
router.put("/:id", protect, roleMiddleware(["admin"]), passwordResetController.updatePasswordResetStatus);

// DELETE PASSWORD RESET --> Admin only
router.delete("/:id", protect, roleMiddleware(["admin"]), passwordResetController.deletePasswordReset);

export default router;
