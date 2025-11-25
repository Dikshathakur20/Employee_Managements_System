import express from "express";
import * as designationController from "../controllers/designationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/count",protect,designationController.getDesignationCount)
// Routes
router.post("/", protect, designationController.addDesignation); // Add designation
router.get("/", protect, designationController.getAllDesignations); // Get all designations
router.get("/:designation_id", protect, designationController.getDesignationById); // Get by ID
router.put("/:designation_id", protect, designationController.updateDesignation); // Update designation
router.delete("/:designation_id", protect, designationController.deleteDesignation); // Delete designation

export default router;
