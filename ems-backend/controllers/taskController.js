import Task from "../models/Task.js";
import Employee from "../models/Employee.js";

// =======================
// Create Task (Fast)
// =======================
export const createTask = async (req, res) => {
  try {
    const { employee_id, task_title, task_description, due_date, status } = req.body;

    const task = await Task.create({
      employee_id,
      task_title,
      task_description,
      due_date,
      status
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// =======================
// Get All Tasks (Optimized Aggregation)
// =======================
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.aggregate([
      {
        $lookup: {
          from: "employees",
          let: { empId: "$employee_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$employee_id", "$$empId"] } } },
            { $project: { first_name: 1, last_name: 1, department_id: 1 } }
          ],
          as: "employee"
        }
      },

      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "departments",
          localField: "employee.department_id",
          foreignField: "department_id",
          as: "department"
        }
      },

      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          task_title: 1,
          task_description: 1,
          due_date: 1,
          status: 1,
          created_at: 1,

          employee_name: {
            $concat: [
              { $ifNull: ["$employee.first_name", ""] },
              " ",
              { $ifNull: ["$employee.last_name", ""] }
            ]
          },

          department_name: { $ifNull: ["$department.department_name", "Unknown"] }
        }
      },

      { $sort: { created_at: -1 } }
    ]);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// =======================
// Get Tasks by Employee (SUPER FAST)
// =======================
export const getTasks = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId)
      return res.status(400).json({ message: "employeeId is required" });

    const tasks = await Task.find({ employee_id: Number(employeeId) })
      .sort({ created_at: -1 })
      .lean();

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// =======================
// Update Task
// =======================
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      lean: true
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// =======================
// Delete Task
// =======================
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
