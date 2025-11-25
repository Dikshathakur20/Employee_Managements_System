import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import axiosClient from "@/utils/axiosClient"; // make sure you have axiosClient set up

interface Task {
_id: string;
task_title: string;
task_description?: string;
employee_id: number;
due_date?: string;
status: "Pending" | "In Progress" | "Completed";
created_at: string;
tblemployees?: { first_name: string; last_name: string };
isOverdue?: boolean;
}

const TaskStatus = () => {
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(false);
const [pendingCount, setPendingCount] = useState(0);

const fetchTasks = async () => {
try {
setLoading(true);
const storedEmployee = localStorage.getItem("employee");
let employeeId = null;
if (storedEmployee) {
const parsed = JSON.parse(storedEmployee);
employeeId = parsed.employee_id;
}
if (!employeeId) {
toast.error("Could not find employee details. Please log in again.");
return;
}


  const res = await axiosClient.get(`/tasks/employee/${employeeId}`);
  const data: Task[] = res.data;

  const today = new Date();
  const updatedTasks = data.map((task) => {
    const due = task.due_date ? new Date(task.due_date) : null;
    const isOverdue = task.status !== "Completed" && due && today > due;
    return { ...task, isOverdue };
  });

  const pending = updatedTasks.filter((t) => t.status === "Pending").length;
  setPendingCount(pending);
  setTasks(updatedTasks);
} catch (err: any) {
  console.error(err);
  toast.error("Failed to fetch tasks.");
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchTasks();
}, []);

const handleStatusChange = async (id: string, newStatus: string) => {
  try {
    setLoading(true);

    // Correct PUT request to update status
    await axiosClient.put(`/tasks/${id}`, { status: newStatus });

    toast.success(`Task marked as ${newStatus}`);

    // Refresh tasks after update
    fetchTasks();
  } catch (err: any) {
    console.error(err);
    toast.error("Failed to update status.");
  } finally {
    setLoading(false);
  }
};


const notifyAdminForOverdueTasks = () => {
const overdueTasks = tasks.filter((t) => t.isOverdue);
if (overdueTasks.length === 0) return;
console.log("🔔 Overdue tasks:", overdueTasks);
toast.warning(`${overdueTasks.length} task(s) are overdue! Admin notified.`);
};

useEffect(() => {
if (tasks.length > 0) notifyAdminForOverdueTasks();
}, [tasks]);

const getStatusBadge = (status: string, isOverdue: boolean) => {
if (isOverdue) {
return ( <Badge className="bg-red-600 flex items-center gap-1"> <AlertTriangle className="h-3 w-3" /> Overdue </Badge>
);
}
switch (status) {
case "Completed":
return <Badge className="bg-green-600">Completed</Badge>;
case "In Progress":
return <Badge className="bg-blue-600">In Progress</Badge>;
default:
return <Badge className="bg-yellow-600">Pending</Badge>;
}
};

return ( <div className="min-h-screen bg-background text-foreground p-6"> <div className="flex justify-between items-center mb-6"> <h1 className="text-2xl font-bold text-[#001F7A]">Task Status</h1> <Badge className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-lg">
Pending Tasks: {pendingCount} </Badge> </div>


  {loading ? (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="h-6 w-6 animate-spin text-[#001F7A]" />
    </div>
  ) : tasks.length === 0 ? (
    <p className="text-gray-600 text-center mt-8">No tasks available.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card
          key={task._id}
          className="hover:shadow-md transition border border-gray-200"
          style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex justify-between items-center">
              {task.task_title}
              {getStatusBadge(task.status, !!task.isOverdue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Assigned To:</strong>{" "}
              {task.tblemployees
                ? `${task.tblemployees.first_name} ${task.tblemployees.last_name}`
                : "Unknown"}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Assigned On:</strong> {new Date(task.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Expected Complete (Due Date):</strong>{" "}
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Not set"}
            </p>
            {task.isOverdue && (
              <p className="text-sm text-red-600 font-semibold mb-2">
                ⚠ Overdue! Please complete immediately.
              </p>
            )}
            <p className="text-sm text-gray-600 mb-4">
              {task.task_description || "No description provided."}
            </p>

            <div className="flex justify-between">
              <Button
                size="sm"
                variant="outline"
                className="text-green-700 border-green-600 hover:bg-green-50 flex items-center gap-1"
                onClick={() => handleStatusChange(task._id, "Completed")}
                disabled={loading}
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-600 hover:bg-blue-50 flex items-center gap-1"
                onClick={() => handleStatusChange(task._id, "In Progress")}
                disabled={loading}
              >
                <Clock className="h-4 w-4" />
                Progress
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-red-700 border-red-600 hover:bg-red-50 flex items-center gap-1"
                onClick={() => handleStatusChange(task._id, "Pending")}
                disabled={loading}
              >
                <XCircle className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )}
</div>


);
};

export default TaskStatus;
