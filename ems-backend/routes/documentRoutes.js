import express from "express";
import * as documentController from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// UPLOAD DOCUMENT --> Both admin & employee
router.post("/", protect, roleMiddleware(["admin", "employee"]), documentController.addDocument);

// GET ALL DOCUMENTS --> Admin only
router.get("/", protect, roleMiddleware(["admin"]), documentController.getAllDocuments);

// GET DOCUMENTS BY EMPLOYEE ID --> Both admin & employee
router.get("/employee/:employee_id", protect, roleMiddleware(["admin", "employee"]), documentController.getDocumentsByEmployee);

// GET DOCUMENT BY ID --> Admin only
router.get("/:id", protect, roleMiddleware(["admin"]), documentController.getDocumentById);



// DELETE DOCUMENT --> Both admin & employee
router.delete("/:id", protect, roleMiddleware(["admin", "employee"]), documentController.deleteDocument);

export default router;
