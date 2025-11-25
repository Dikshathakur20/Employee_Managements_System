import PasswordReset from "../models/PasswordReset.js";

// Create a password reset request
export const createPasswordReset = async (req, res) => {
  try {
    const { email, employee_id } = req.body;

    const resetRequest = new PasswordReset({ email, employee_id });
    await resetRequest.save();

    res.status(201).json({ message: "Password reset request created", resetRequest });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all password reset requests
export const getAllPasswordResets = async (req, res) => {
  try {
    const resets = await PasswordReset.find().sort({ requested_at: -1 });
    res.status(200).json(resets);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get password reset by ID
export const getPasswordResetById = async (req, res) => {
  try {
    const { id } = req.params;
    const reset = await PasswordReset.findById(id);
    if (!reset) return res.status(404).json({ message: "Password reset request not found" });

    res.status(200).json(reset);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update status of password reset
export const updatePasswordResetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reset = await PasswordReset.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reset) return res.status(404).json({ message: "Password reset request not found" });

    res.status(200).json({ message: "Password reset status updated", reset });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a password reset request
export const deletePasswordReset = async (req, res) => {
  try {
    const { id } = req.params;
    const reset = await PasswordReset.findByIdAndDelete(id);

    if (!reset) return res.status(404).json({ message: "Password reset request not found" });

    res.status(200).json({ message: "Password reset request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
