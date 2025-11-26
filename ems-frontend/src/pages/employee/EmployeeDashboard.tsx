import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CalendarCheck, ClipboardList, LogIn, LogOut } from "lucide-react";
import { toast } from "react-toastify";

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

  // ------------------ FETCH EMPLOYEE & DATA ------------------
  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (!storedEmployee) return;
    const emp = JSON.parse(storedEmployee);
    const employeeId = emp?.employee_id;
    if (employeeId) {
      fetchEmployee(employeeId);
      fetchAllData(employeeId);
    }
  }, []);

  // ------------------ FETCH NOTIFICATIONS AFTER EMPLOYEE IS LOADED ------------------
  useEffect(() => {
    if (!employee) return;

    const fetchDeptNotifications = async () => {
      try {
        const { data } = await axiosClient.get("/notifications/employee");

        const filtered = data.filter(
          (n: Notification) =>
            n.target_audience === "All" || n.target_audience === employee.department
        );
        setNotifications(filtered || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      }
    };

    fetchDeptNotifications();
  }, [employee]);

  const fetchEmployee = async (employeeId: number) => {
    try {
      const { data } = await axiosClient.get(`/employees/${employeeId}`);
      setEmployee({
        id: data.employee_id,
        name:
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          data.email?.split("@")[0] ||
          "Unknown",
        email: data.email || "",
        designation: data.designation || "Not Assigned",
        department: data.department || "Not Assigned",
      });
    } catch (err) {
      console.error("Error fetching employee:", err);
    }
  };

  const fetchAllData = async (employeeId: number) => {
    await Promise.all([
      fetchTasks(employeeId),
      fetchAttendance(employeeId),
      fetchLeaves(employeeId),
    ]);
    await checkIfOnLeave(employeeId);
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

  const fetchAttendance = async (employeeId: number) => {
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const { data } = await axiosClient.get(`/attendance/${employeeId}?date=${today}`);
      setAttendance(data?.[0] || null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendance(null);
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

  const handleCheckIn = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const { data } = await axiosClient.post("/attendance", {
        employee_id: employee.id,
        check_in: getISTDateTime(),
        date: today,
        status: "Present",
      });
      toast.success("Checked in successfully!");
      setAttendance(data);
    } catch (err: any) {
      console.error("Check-in error:", err);
      toast.error(err?.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employee || !attendance) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.put(`/attendance/${attendance.id}`, {
        check_out: getISTDateTime(),
      });
      toast.success("Checked out successfully!");
      setAttendance(data);
    } catch (err: any) {
      console.error("Check-out error:", err);
      toast.error(err?.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ MARQUEE STYLE ------------------
  const marqueeStyle = `@keyframes marquee {
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
  }`;

  // ------------------ NOTIFICATIONS LOGIC ------------------
  const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const getISTDate = (date: string) =>
    new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const todaysNotifications = notifications.filter(
    (n) => getISTDate(n.created_at) === todayIST
  );

  const oldNotifications = notifications
    .filter((n) => getISTDate(n.created_at) !== todayIST)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // ------------------ RENDER ------------------
  return (
    <>
      <style>{marqueeStyle}</style>
      <div className="min-h-screen bg-gray-50">
        {/* 🔷 Welcome Banner */}
        <div className="bg-[#001F7A] text-white py-3 overflow-hidden">
          <div className="animate-marquee text-center text-lg font-semibold">
            👋 Welcome back, {employee?.name || "Employee"} — Have a productive day!
          </div>
        </div>

        {/* Main Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 🔹 Left Column */}
          <div className="space-y-6">
            {/* Tasks Card */}
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
                      <li
                        key={task.id}
                        className="border p-2 rounded-md"
                        style={{ background: "linear-gradient(-45deg, #eef1ff, #c9d0fb)" }}
                      >
                        <p className="text-sm font-bold text-gray-900 mb-1">{task.task_title}</p>
                        <p className="text-xs text-black-500 mb-1">
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN") : "Not Set"}
                        </p>
                        <p className="text-sm text-black-600">{task.task_description || "No description"}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No tasks assigned yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Leave Card */}
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
                          className={`${leave.status === "Approved"
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

          {/* 🔸 Middle Column */}
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
                {attendance?.check_in && !attendance.check_out ? (
                  <Button
                    className="bg-blue-900 hover:bg-blue-900 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleCheckOut}
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-5 w-5" /> Check Out
                  </Button>
                ) : !attendance?.check_in ? (
                  <Button
                    className="bg-blue-900 hover:bg-blue-900 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleCheckIn}
                    disabled={loading}
                  >
                    <LogIn className="mr-2 h-5 w-5" /> Check In
                  </Button>
                ) : (
                  <p className="text-gray-500 font-medium">You have completed attendance for today.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 🔷 Right Column */}
          <div className="space-y-6">
            {/* Notifications Card */}
            <Card className="border shadow-md" style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
              <CardHeader>
                <CardTitle className="text-[#001F7A] flex items-center gap-2">
                  <Bell className="h-5 w-5" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Today's Notifications */}
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Today's Notifications</h3>
                  {todaysNotifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No notification yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {todaysNotifications.map((note) => (
                        <li key={note.id} className="border-b pb-2">
                          <strong>{note.title}</strong>
                          <p className="text-gray-600">{note.message}</p>
                          <p className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString("en-IN")}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Older Notifications */}
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Earlier Notifications</h3>
                  {oldNotifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No older notifications.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {oldNotifications.map((note) => (
                        <li key={note.id} className="border-b pb-2">
                          <strong>{note.title}</strong>
                          <p className="text-gray-600">{note.message}</p>
                          <p className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString("en-IN")}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Overview Card */}
            <Card className="border shadow-md" style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}>
              <CardHeader>
                <CardTitle className="text-[#001F7A] flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" /> Today’s Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</p>
                  <p><strong>Status:</strong> {todayLeaveStatus || attendance?.status || "Not Marked"}</p>
                  <p><strong>Check-In:</strong> {attendance?.check_in ? formatIST(attendance.check_in) : "—"}</p>
                  <p><strong>Check-Out:</strong> {attendance?.check_out ? formatIST(attendance.check_out) : "—"}</p>
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
