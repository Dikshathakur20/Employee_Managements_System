import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/utils/axiosClient"; // ✅ using axiosClient

export default function AssignTask() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ===============================
  // FETCH EMPLOYEES
  // ===============================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosClient.get("/employees");
        setEmployees(res.data);
      } catch (err: any) {
        toast({
          title: "Error fetching employees",
          description: err.response?.data?.message || err.message,
          variant: "destructive",
        });
      }
    };

    fetchEmployees();
  }, []);

  // ===============================
  // ASSIGN TASK
  // ===============================
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskTitle || !assignedTo || !dueDate) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("/tasks", {
        employee_id: parseInt(assignedTo),
        task_title: taskTitle,
        task_description: taskDescription,
        due_date: dueDate,
        status: "Pending",
      });

      toast({
        title: "Task Assigned",
        description: res.data.message || "Task successfully assigned!",
      });

      // Reset form
      setTaskTitle("");
      setTaskDescription("");
      setAssignedTo("");
      setDueDate("");
    } catch (err: any) {
      toast({
        title: "Error assigning task",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-900">
        Assign Employee Task
      </h2>

      <form
        onSubmit={handleAssignTask}
        className="max-w-2xl mx-auto space-y-5 bg-gray-50 p-6 rounded-lg shadow-lg"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
        <div>
          <Label>Task Title</Label>
          <Input
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="border border-black focus:ring-0 focus:border-black"
            required
          />
        </div>

        <div>
          <Label>Task Description</Label>
          <Textarea
            placeholder="Describe the task details..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="border border-black focus:ring-0 focus:border-black"
          />
        </div>

        <div>
          <Label>Assign To</Label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="border border-gray-300 rounded-md w-full p-2 bg-blue-900 text-white"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-900 hover:bg-blue-800 text-white w-full"
        >
          {loading ? "Assigning Task..." : "Assign Task"}
        </Button>
      </form>
    </div>
  );
}
