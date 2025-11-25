import Attendance from "../models/Attendance.js";

// =======================
// Add new attendance record
// =======================
export const addAttendance = async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;

    // Normalize the date to UTC midnight (just the day for monthly filtering)
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const attendance = new Attendance({
      employee_id,
      date: attendanceDate,
      check_in: check_in ? new Date(check_in) : undefined,
      check_out: check_out ? new Date(check_out) : undefined,
      status: status || "Present",
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance added successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================
// Get all attendance records
// =======================
export const getAllAttendance = async (req, res) => {
  try {
    const attendances = await Attendance.find().sort({ date: -1 });
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================
// Get attendance by employee and month/year
// =======================
// getAttendanceByEmployee
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { month, year } = req.query;

    // Make sure employee_id is a number
    const empId = Number(employee_id);
    if (isNaN(empId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // Build base query
    const query = { employee_id: empId };

    // Add month/year filter if provided
    if (month && year) {
      const m = Number(month); // 1-12
      const y = Number(year);

      if (!isNaN(m) && !isNaN(y)) {
        const startDate = new Date(Date.UTC(y, m - 1, 1));
        const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)); // last day of month

        query.date = { $gte: startDate, $lte: endDate };
      }
    }

    const records = await Attendance.find(query).sort({ date: 1 });

    if (!records.length) {
      return res.status(200).json([]); // no records found
    }

    // Optional: calculate total_hours if check_in/check_out exist
    const processedRecords = records.map((rec) => {
      let total_hours = null;
      if (rec.check_in && rec.check_out) {
        total_hours = (rec.check_out - rec.check_in) / 1000 / 60 / 60; // hours
        total_hours = Number(total_hours.toFixed(2));
      }
      return {
        _id: rec._id,
        date: rec.date,
        check_in: rec.check_in,
        check_out: rec.check_out,
        status: rec.status,
        total_hours,
      };
    });

    res.status(200).json(processedRecords);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// =======================
// Update attendance
// =======================
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, check_in, check_out } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        status,
        check_in: check_in ? new Date(check_in) : undefined,
        check_out: check_out ? new Date(check_out) : undefined,
      },
      { new: true }
    );

    if (!attendance)
      return res.status(404).json({ message: "Attendance not found" });

    res.status(200).json({ message: "Attendance updated", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================
// Delete attendance
// =======================
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance)
      return res.status(404).json({ message: "Attendance not found" });

    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
