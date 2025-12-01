import Employee from "../models/Employee.js";
import Counter from "../models/Counter.js";
import { createClient } from "@supabase/supabase-js";

// ----------------------
// Supabase Config (DIRECT VALUES)
// ----------------------
const SUPABASE_URL = "https://xwipkmjonfsgrtdacggo.supabase.co";
const SUPABASE_SERVICE_ROLE =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aXBrbWpvbmZzZ3J0ZGFjZ2dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDQzMCwiZXhwIjoyMDcxOTM2NDMwfQ.58kyEZLpq2W5BpfvfO-vREaGo227wAFUVpRTkV02pcY";
const BUCKET_NAME = "employee-documents";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// ----------------------
// Get employee count
// ----------------------
export const getEmployeeCount = async (req, res) => {
try {
const count = await Employee.estimatedDocumentCount();
res.json({ count });
} catch (err) {
res.status(500).json({ message: "Server Error" });
}
};

// ----------------------
// Check Email
// ----------------------
export const checkEmail = async (req, res) => {
try {
const { email } = req.query;


if (!email) {
  return res.status(400).json({ message: "Email is required" });
}

const exists = await Employee.exists({ email });

return res.status(200).json({
  exists: !!exists,
  message: exists ? "Email already in use" : "Email is available",
});


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ----------------------
// Generate Employee Code
// ----------------------
export const generateEmployeeCode = async (req, res) => {
try {
// Find the last employee by employee_id
const lastEmployee = await Employee.findOne({}, { employee_id: 1 })
.sort({ employee_id: -1 })
.lean();


if (!lastEmployee) {
  // No employee yet
  return res.status(200).json({ code: "EMP001" });
}

// Get the last 3 digits of the existing employee_id
const lastThreeDigits = lastEmployee.employee_id
  .toString()
  .slice(-3)
  .padStart(3, "0");

const newCode = "EMP" + lastThreeDigits;

res.status(200).json({ code: newCode });


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ===============================
// Add Employee + Upload Image
// ===============================
export const addEmployee = async (req, res) => {
try {
const employeeData = req.body;


// Step 1: Get last employee_id
const last = await Employee.findOne({}, { employee_id: 1 })
  .sort({ employee_id: -1 })
  .lean();

// Step 2: Generate new employee_id
employeeData.employee_id = last ? last.employee_id + 1 : 1;

// Step 3: Generate employee_code from employee_id
employeeData.employee_code =
  "EMP" + employeeData.employee_id.toString().padStart(3, "0");

// Create employee
const employee = await Employee.create(employeeData);

// If file uploaded → Upload to Supabase
if (req.file) {
  const fileName = `employee_${employee.employee_id}.webp`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return res.status(500).json({ message: "Photo upload failed" });
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  // Save file link
  employee.file_data = publicUrl;
  await employee.save();
}

res.status(201).json({
  message: "Employee added successfully",
  employee,
});


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ----------------------
// Get all employees
// ----------------------
export const getAllEmployees = async (req, res) => {
try {
const employees = await Employee.find({}, null, { lean: true }).sort({
first_name: 1,
});
res.status(200).json(employees);
} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ----------------------
// Get employee by ID
// ----------------------
export const getEmployeeById = async (req, res) => {
try {
const employee = await Employee.findOne(
{ employee_id: req.params.employee_id },
null,
{ lean: true }
);


if (!employee)
  return res.status(404).json({ message: "Employee not found" });

res.status(200).json(employee);


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ----------------------
// Update employee
// ----------------------
export const updateEmployee = async (req, res) => {
try {
const employee = await Employee.findOneAndUpdate(
{ employee_id: req.params.employee_id },
req.body,
{ new: true, lean: true }
);


if (!employee)
  return res.status(404).json({ message: "Employee not found" });

res.status(200).json({
  message: "Employee updated successfully",
  employee,
});


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ----------------------
// Update employee profile fields
// ----------------------
export const updateEmployeeProfile = async (req, res) => {
try {
const { employee_id } = req.params;
const updatedData = req.body;


const employee = await Employee.findOneAndUpdate(
  { employee_id },
  updatedData,
  { new: true, lean: true }
);

if (!employee)
  return res.status(404).json({ message: "Employee not found" });

res.status(200).json({
  message: "Profile updated successfully",
  employee,
});


} catch (error) {
console.error(error);
res.status(500).json({ message: "Server Error", error: error.message });
}
};

// ----------------------
// Delete employee
// ----------------------
export const deleteEmployee = async (req, res) => {
try {
const employee = await Employee.findOneAndDelete({
employee_id: req.params.employee_id,
});


if (!employee)
  return res.status(404).json({ message: "Employee not found" });

res.status(200).json({ message: "Employee deleted successfully" });


} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};
