// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/contexts/LoginContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axiosClient from "@/utils/axiosClient"; // ✅ use your axiosClient

const Dashboard = () => {
  const { user } = useLogin();
  const navigate = useNavigate();

  const [employeeCount, setEmployeeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [designationCount, setDesignationCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  // ---------------- API Fetch Helper ----------------
  const fetchCount = async (url, setter) => {
    try {
      const { data } = await axiosClient.get(url);
      setter(typeof data.count === "number" ? data.count : 0);
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      setter(0);
    }
  };

  // ---------------- Fetch All Counts ----------------
  useEffect(() => {
    fetchCount("/employees/count", setEmployeeCount);
    fetchCount("/departments/count", setDepartmentCount);
    fetchCount("/designations/count", setDesignationCount);
    fetchCount("/leaves/count/pending", setLeaveCount);
    fetchCount("/tasks/count/pending", setTaskCount);
    fetchCount("/password-reset/count/pending", setRequestCount);
  }, []);

  // ------------- Protect Dashboard ---------------
  if (!user) return <Navigate to="/login" replace />;

  // ---------------- Dashboard Cards ----------------
  const cards = [
    {
      title: "Employees",
      count: employeeCount,
      subtitle: "Active employees",
      route: "/employees",
    },
    {
      title: "Departments",
      count: departmentCount,
      subtitle: "Total departments",
      route: "/departments",
    },
    {
      title: "Designations",
      count: designationCount,
      subtitle: "Available positions",
      route: "/designations",
    },
    {
      title: "Leaves Approval",
      count: leaveCount,
      subtitle: "Pending leave requests",
      route: "/approve-leave",
    },
    {
      title: "Task Board",
      count: taskCount,
      subtitle: "Pending employee tasks",
      route: "/tasks-status",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#001F7A]">Dashboard</h1>

        <Button
          onClick={() => navigate("/notification")}
          className="bg-blue-900 hover:bg-blue-800 text-white shadow-none mb-6"
        >
          Send Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            onClick={() => navigate(card.route)}
            className="cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
            style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold">{card.count}</span>
                <span className="text-sm text-muted-foreground">{card.subtitle}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
