import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/utils/axiosClient";

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("All");
  const [departments, setDepartments] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 📌 Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosClient.get("departments");
        setDepartments(res.data.map((d: any) => d.department_name));
      } catch (err: any) {
        toast({
          title: "Error loading departments",
          description: err.response?.data?.message || err.message,
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, []);

  // 📌 Fetch all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosClient.get("notifications");
        setNotifications(res.data);
      } catch (err: any) {
        toast({
          title: "Error loading notifications",
          description: err.response?.data?.message || err.message,
          variant: "destructive",
        });
      }
    };

    fetchNotifications();
  }, []);

  // 📌 Handle Sending Notification
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Missing title",
        description: "Please enter a notification title.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axiosClient.post("notifications", {
        title,
        message,
        target_audience: target,
      });

      toast({
        title: "Notification sent",
        description: res.data.message,
      });

      // Add the new notification to list
      setNotifications((prev) => [res.data.notification, ...prev]);

      // Reset fields
      setTitle("");
      setMessage("");
      setTarget("All");
    } catch (err: any) {
      toast({
        title: "Error sending notification",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/dashboard");

  return (
    <div
      className="max-w-[60vw] min-h-[calc(100vh-64px)] mx-auto mt-7 p-4 bg-gray-50 flex flex-col space-y-6"
      style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-900">Create Notification</h2>
        <Button
          onClick={handleBack}
          variant="outline"
          className="bg-blue-900 border-blue-900 text-white hover:bg-blue-800"
        >
          ← Back
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="flex flex-col space-y-4">
        <Input
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-blue-900 focus:ring-0 focus:border-blue-900"
        />

        <Textarea
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-blue-900 focus:ring-0 focus:border-blue-900"
        />

        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="border border-black-900 rounded-lg px-3 py-2 bg-blue-900 text-white focus:outline-none focus:ring-0 w-full"
        >
          <option value="All">All Employees</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>
              {dept} Department
            </option>
          ))}
        </select>

        <Button type="submit" disabled={loading} className="bg-blue-900 hover:bg-blue-800 text-white">
          {loading ? "Sending..." : "Send Notification"}
        </Button>
      </form>

      {/* Notifications List */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">All Notifications</h3>

        <ul className="space-y-2">
          {notifications.length === 0 && (
            <li className="text-gray-600">No notifications yet.</li>
          )}

          {notifications.map((n: any) => (
            <li key={n._id} className="p-3 border rounded-md bg-white shadow-sm">
              <strong>{n.title}</strong> - {n.message}{" "}
              <span className="text-sm text-gray-500">({n.target_audience})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
