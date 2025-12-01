// =============================
// ApplyLeave.tsx - Updated Date & Rejection Reason
// =============================
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axiosClient from "../../utils/axiosClient"; // ✅ use axiosClient

const ApplyLeave = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    no_of_leaves: "",
  });

  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employee, setEmployee] = useState(null);

  // ---------------- HELPER: format date dd/mm/yyyy ----------------
  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    const cleanDate = d.split("T")[0] || d; // in case ISO string
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  // ---------------- GET EMPLOYEE ----------------
  useEffect(() => {
    const storedEmployee =
      JSON.parse(localStorage.getItem("employee")) ||
      JSON.parse(localStorage.getItem("employeeData")) ||
      null;

    if (!storedEmployee?.employee_id) {
      toast({
        variant: "destructive",
        title: "Employee Not Found",
        description: "Please log in again.",
      });
      return;
    }

    setEmployee(storedEmployee);
    fetchLeaveRequests(storedEmployee.employee_id);
  }, []);

  // ---------------- AUTO CALCULATE NO OF LEAVES ----------------
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end >= start) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, no_of_leaves: diff.toString() }));
      } else {
        setFormData(prev => ({ ...prev, no_of_leaves: "" }));
      }
    }
  }, [formData.start_date, formData.end_date]);

  // ---------------- FETCH LEAVE REQUESTS ----------------
  const fetchLeaveRequests = async (employee_id) => {
    try {
      const res = await axiosClient.get(`/leaves/employee/${employee_id}`);
      setLeaveRequests(res.data || []);
    } catch (err) {
      toast.error("Error loading leave requests.");
    }
  };

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------- SUBMIT LEAVE ----------------
  const handleSubmit = async () => {
    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.no_of_leaves) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      setLoading(true);

      await axiosClient.post("/leaves", {
        employee_id: employee.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        no_of_leaves: parseInt(formData.no_of_leaves, 10),
      });

      toast({
        title: "Leave Submitted",
        description: "Your leave request has been successfully submitted.",
      });

      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        no_of_leaves: "",
      });

      fetchLeaveRequests(employee.employee_id);

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Submit",
        description: err.response?.data?.message || "Failed to submit leave.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE LEAVE ----------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      await axiosClient.delete(`/leaves/${id}`);
      toast.success("Leave request deleted.");
      fetchLeaveRequests(employee.employee_id);
    } catch (err) {
      toast.error("Failed to delete leave request.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-3xl mx-auto shadow-md border">
        <CardHeader>
          <CardTitle className="text-[#001F7A] text-2xl font-bold">Apply for Leave</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Leave Type</Label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 bg-blue-50"
              >
                <option value="">Select Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Paid Leave">Paid Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
              </select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
            </div>

            <div>
              <Label>End Date</Label>
              <Input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
            </div>

            <div>
              <Label>No. of Leaves</Label>
              <p className="border p-2 rounded-lg bg-white font-semibold">{formData.no_of_leaves || "—"}</p>
            </div>

            <div className="md:col-span-2">
              <Label>Reason</Label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button className="bg-[#001F7A] text-white" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-4xl mx-auto mt-10 border shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#001F7A]">Leave History</CardTitle>
        </CardHeader>

        <CardContent>
          {leaveRequests.length === 0 ? (
            <p>No leave requests found.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-blue-50 text-[#001F7A]">
                <tr>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                  <th className="border p-2">Leaves</th>
                  <th className="border p-2">Reason</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Rejection Reason</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave._id}>
                    <td className="border p-2">{leave.leave_type}</td>
                    <td className="border p-2">{formatDate(leave.start_date)}</td>
                    <td className="border p-2">{formatDate(leave.end_date)}</td>
                    <td className="border p-2">{leave.no_of_leaves}</td>
                    <td className="border p-2">{leave.reason}</td>
                    <td className="border p-2">{leave.status}</td>
                    <td className="border p-2">{leave.status === "Rejected" ? leave.rejection_reason || "—" : "—"}</td>
                    <td className="border p-2 text-center">
                      {leave.status === "Pending" && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(leave._id)}>
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeave;
