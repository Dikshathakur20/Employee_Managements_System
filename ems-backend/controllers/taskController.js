import Task from "../models/Task.js";
import Employee from "../models/Employee.js";

// =======================

// Create a new task
// =======================
export const createTask = async (req, res) => {
try {
const { employee_id, task_title, task_description, due_date, status } = req.body;


const task = new Task({ employee_id, task_title, task_description, due_date, status });
await task.save();

res.status(201).json({ message: "Task created successfully", task });

} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// =======================
// Get all tasks with employee_name and department_name
// =======================
export const getAllTasks = async (req, res) => {
try {
const tasks = await Task.aggregate([
{
$lookup: {
from: "employees",
localField: "employee_id",
foreignField: "employee_id",
as: "employee_info",
},
},
{ $unwind: { path: "$employee_info", preserveNullAndEmptyArrays: true } },
{
$lookup: {
from: "departments",
localField: "employee_info.department_id",
foreignField: "department_id",
as: "department_info",
},
},
{ $unwind: { path: "$department_info", preserveNullAndEmptyArrays: true } },
{
$addFields: {
employee_name: {
$concat: [
{ $ifNull: ["$employee_info.first_name", ""] },
" ",
{ $ifNull: ["$employee_info.last_name", ""] },
],
},
department_name: { $ifNull: ["$department_info.department_name", "Unknown"] },
},
},
{
$project: {
employee_info: 0,
department_info: 0,
},
},
{ $sort: { created_at: -1 } },
]);

res.status(200).json(tasks);


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// =======================
// Get task by ID
// =======================
export const getTasks = async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    if (!employeeId) return res.status(400).json({ message: "employeeId is required" });

    // Use $expr to handle type mismatch (string or number in DB)
    const tasks = await Task.find({
      $expr: { $eq: ["$employee_id", { $toInt: employeeId }] }
    }).sort({ created_at: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// =======================
// Update a task
// =======================
export const updateTask = async (req, res) => {
try {
const { id } = req.params;
const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });


if (!updatedTask) return res.status(404).json({ message: "Task not found" });

res.status(200).json({ message: "Task updated successfully", task: updatedTask });


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// =======================
// Delete a task
// =======================
export const deleteTask = async (req, res) => {
try {
const { id } = req.params;
const deletedTask = await Task.findByIdAndDelete(id);


if (!deletedTask) return res.status(404).json({ message: "Task not found" });

res.status(200).json({ message: "Task deleted successfully" });


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};
