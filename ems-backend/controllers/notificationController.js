import Notification from "../models/Notification.js";
import Department from "../models/Department.js";

// Create a new notification (Admin only)
export const createNotification = async (req, res) => {
  try {
    const { title, message, target_audience } = req.body;

    const departments = await Department.find().select("department_name");
    const deptNames = departments.map(d => d.department_name);

    const normalizedTarget = target_audience.trim().toLowerCase();
    const normalizedDeptNames = deptNames.map(d => d.toLowerCase());

    if (normalizedTarget !== "all" && !normalizedDeptNames.includes(normalizedTarget)) {
      return res.status(400).json({
        message: `Invalid target audience. Allowed: All, ${deptNames.join(", ")}`,
      });
    }

    const notification = new Notification({ title, message, target_audience });
    await notification.save();

    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all notifications (Admin & Employee)
export const getAllNotifications = async (req, res) => {
  try {
    const employeeDepartment = req.user.department; // department from auth middleware

    const notifications = await Notification.find({
      $or: [
        { target_audience: "All" },
        { target_audience: employeeDepartment }
      ],
    }).sort({ created_at: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get notification by ID (secure for employees)
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    // Restrict employee access to only their department or 'All'
    if (
      req.user.role === "employee" &&
      notification.target_audience !== "All" &&
      notification.target_audience !== req.user.department
    ) {
      return res.status(403).json({ message: "Not authorized to view this notification" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a notification (Admin only)
export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, target_audience } = req.body;

    const departments = await Department.find().select("department_name");
    const deptNames = departments.map(d => d.department_name);

    const normalizedTarget = target_audience.trim().toLowerCase();
    const normalizedDeptNames = deptNames.map(d => d.toLowerCase());

    if (normalizedTarget !== "all" && !normalizedDeptNames.includes(normalizedTarget)) {
      return res.status(400).json({
        message: `Invalid target audience. Allowed: All, ${deptNames.join(", ")}`,
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { title, message, target_audience },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification updated", notification });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a notification (Admin only)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
