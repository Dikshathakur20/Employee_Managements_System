// src/pages/employee/EmployeeDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CalendarCheck, ClipboardList, LogIn, LogOut } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  designation?: string;
  department?: string;
}

interface Task {
  id: string;
  task_title: string;
  task_description: string;
  due_date?: string;
  status: string;
  created_at?: string;
}

interface Attendance {
  id: string;
  check_in?: string;
  check_out?: string;
  date: string;
  status: string;
}

interface Leave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  target_audience?: string;
}

const getISTDateTime = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.toISOString().slice(0, 19).replace("T", " ");
};

const formatIST = (dateStr?: string) => {
  if (!dateStr) return "—";
  const istDate = new Date(
    new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return istDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayLeaveStatus, setTodayLeaveStatus] = useState<string | null>(null);

  /** ------------------ Fetch Employee & Data ------------------ */
  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (!storedEmployee) return;

    const emp = JSON.parse(storedEmployee);
    setEmployee(emp);
    fetchAllData(emp);
  }, []);

  const fetchAllData = async (emp: Employee) => {
    await Promise.all([
      fetchTasks(emp.id),
      fetchAttendance(emp.id),
      fetchLeaves(emp.id),
      fetchNotifications(),
    ]);
    checkIfOnLeave(emp.id);
  };

  const fetchAttendance = async (employeeId: number) => {
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const { data } = await axiosClient.get(`/attendance/${employeeId}?date=${today}`);
      setAttendance(data || null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchTasks = async (employeeId: number) => {
    try {
      const { data } = await axiosClient.get(`/tasks/employee/${employeeId}`);
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchLeaves = async (employeeId: number) => {
    try {
      const { data } = await axiosClient.get(`/leaves/employee/${employeeId}`);
      setLeaves(data || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  const fetchNotifications = async () => {
  try {
    const { data } = await axiosClient.get("/notifications"); // backend filters by department
    setNotifications(data || []);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    setNotifications([]);
  }
};

  const checkIfOnLeave = async (employeeId: number) => {
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const { data } = await axiosClient.get(`/leaves/${employeeId}?status=Approved`);
      const isOnLeave = data.some(
        (leave: Leave) => today >= leave.start_date && today <= leave.end_date
      );
      setTodayLeaveStatus(isOnLeave ? "On Leave" : null);
    } catch (err) {
      console.error("Error checking leave:", err);
    }
  };

  /** ------------------ Check-In / Check-Out ------------------ */
  const handleCheckIn = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const { data: existing } = await axiosClient.get(`/attendance/${employee.id}?date=${today}`);
      if (existing?.check_in) {
        alert("Already checked in today!");
        setLoading(false);
        return;
      }

      await axiosClient.post("/attendance", {
        employee_id: employee.id,
        check_in: getISTDateTime(),
        date: today,
        status: "Present",
      });

      setAttendance((prev) => ({
        ...prev,
        check_in: getISTDateTime(),
        status: "Present",
      }));
    } catch (err) {
      console.error("Check-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      await axiosClient.put(`/attendance/${employee.id}`, {
        check_out: getISTDateTime(),
        date: today,
      });
      setAttendance((prev) => ({
        ...prev,
        check_out: getISTDateTime(),
      }));
    } catch (err) {
      console.error("Check-out error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour12: true });
  };

  /** ------------------ Marquee Welcome ------------------ */
  const marqueeStyle = `
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .animate-marquee {
      display: inline-block;
      animation: marquee 12s linear infinite;
      white-space: nowrap;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `;

  /** ------------------ Render ------------------ */
  return (
    <>
      <style>{marqueeStyle}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Banner */}
        <div className="bg-[#001F7A] text-white py-3 overflow-hidden">
          <div className="animate-marquee text-center text-lg font-semibold">
            👋 Welcome back, {employee?.name || "Employee"} — Have a productive day!
          </div>
        </div>

        {/* Main Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Tasks & Leaves */}
          <div className="space-y-6">
            {/* Tasks */}
            <Card
              className="border shadow-md cursor-pointer"
              style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
              onClick={() => navigate("/employee/task-status")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#001F7A]">
                  <ClipboardList className="h-5 w-5" /> Assigned Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <ul className="space-y-2">
                    {tasks.slice(0, 3).map((task) => (
                      <li key={task.id} className="border p-2 rounded-md bg-gray-50">
                        <p className="text-sm font-bold text-gray-900 mb-1">{task.task_title}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN") : "Not Set"}
                        </p>
                        <p className="text-sm text-gray-700">{task.task_description || "No description"}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No tasks assigned yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Leaves */}
            <Card
              className="border shadow-md cursor-pointer"
              onClick={() => navigate("/employee/apply-leave")}
              style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#001F7A]">
                  <CalendarCheck className="h-5 w-5" /> My Leaves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-[#001F7A] mb-2">
                  Leave Taken: {leaves.filter((l) => l.status === "Approved").length}
                </p>
                {leaves.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {leaves.slice(0, 2).map((leave) => (
                      <li key={leave.id} className="flex justify-between border-b py-1 text-gray-700">
                        <span>{leave.leave_type}</span>
                        <span
                          className={`${
                            leave.status === "Approved"
                              ? "text-green-600"
                              : leave.status === "Rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No leave records.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: Attendance */}
          <div className="space-y-6">
            <Card
              className="border shadow-md text-center"
              style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-[#001F7A]">
                  <CalendarCheck className="h-5 w-5" /> Attendance ({new Date().toLocaleDateString("en-IN")})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!attendance?.check_in ? (
                  <Button onClick={handleCheckIn} disabled={loading}>
                    <LogIn className="mr-2 h-5 w-5" /> Check In
                  </Button>
                ) : !attendance?.check_out ? (
                  <Button onClick={handleCheckOut} disabled={loading}>
                    <LogOut className="mr-2 h-5 w-5" /> Check Out
                  </Button>
                ) : (
                  <p className="text-gray-500 font-medium">Attendance completed for today.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Notifications & Today Overview */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#001F7A]">
                  <Bell className="h-5 w-5" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notifications.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {notifications.map((note) => (
                      <li key={note.id} className="border-b pb-2">
                        <strong>{note.title}</strong>
                        <p className="text-gray-600">{note.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(note.created_at).toLocaleString("en-IN")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Today’s Overview */}
            <Card
              className="border shadow-md cursor-pointer"
              style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
              onClick={() => navigate("/employee/monthly-report")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#001F7A]">
                  <CalendarCheck className="h-5 w-5" /> Today’s Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}
                  </p>
                  <p>
                    <strong>Status:</strong> {todayLeaveStatus || attendance?.status || "Not Marked"}
                  </p>
                  <p>
                    <strong>Check-In:</strong> {formatIST(attendance?.check_in)}
                  </p>
                  <p>
                    <strong>Check-Out:</strong> {formatIST(attendance?.check_out)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
