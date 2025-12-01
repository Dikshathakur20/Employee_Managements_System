import Leave from "../models/Leave.js";


export const getLeaveCount = async (req, res) => {
  try {
    const count = await Leave.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get pending leave count
export const getPendingLeaveCount = async (req, res) => {
  try {
    const count = await Leave.countDocuments({ status: "Pending" });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason, no_of_leaves } = req.body;

    const leave = new Leave({
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      no_of_leaves,
    });

    await leave.save();
    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all leaves
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.aggregate([
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "employee_id",
      as: "employee"
    }
  },
  { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

  {
    $lookup: {
      from: "departments",
      localField: "employee.department_id",
      foreignField: "department_id",   // ✅ FIXED
      as: "department"
    }
  },
  { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

  {
    $project: {
      leave_type: 1,
      start_date: 1,
      end_date: 1,
      reason: 1,
      status: 1,
      created_at: 1,
      rejection_reason: 1,
      no_of_leaves: 1,

      employee_name: { 
        $concat: ["$employee.first_name", " ", "$employee.last_name"] 
      },

      department_name: "$department.department_name"  // ✔ NOW WORKS
    }
  }
]);


    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


//Get leave by employee ID
export const getLeavesByEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const leaves = await Leave.find({ employee_id }).sort({ start_date: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update leave status (approve/reject)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;  // ✅ get rejection_reason

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status, rejection_reason: status === "Rejected" ? rejection_reason : null },
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: "Leave status updated", leave });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Delete leave
export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
