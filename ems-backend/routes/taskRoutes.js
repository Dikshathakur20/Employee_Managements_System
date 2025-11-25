import express from "express";
import * as taskController from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import Task from "../models/Task.js";

const router = express.Router();

// Count Pending Tasks (PLACE FIRST)
router.get("/count/pending", async (req, res) => {
  try {
    const count = await Task.countDocuments({ status: "Pending" });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// CREATE TASK --> Admin only
router.post("/", protect, roleMiddleware(["admin"]), taskController.createTask);

// GET ALL TASKS --> Admin only
router.get("/", protect, roleMiddleware(["admin"]), taskController.getAllTasks);

// GET TASKS BY EMPLOYEE --> Both admin & employee
router.get("/employee/:employeeId", protect, roleMiddleware(["admin", "employee"]), async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const tasks = await Task.find({ employee_id: employeeId });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// UPDATE TASK
router.put(
  "/:id",
  protect,
  (req, res, next) => {
    if (req.user.role === "employee") {
      req.allowedFields = ["status"];
    } else if (req.user.role === "admin") {
      req.allowedFields = ["title", "description", "deadline"];
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
  taskController.updateTask
);

// DELETE TASK --> Admin only
router.delete("/:id", protect, roleMiddleware(["admin"]), taskController.deleteTask);

export default router;
