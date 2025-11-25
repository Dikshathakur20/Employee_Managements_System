import logo from "@/public/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

// ✔ Correct API Base
const API_BASE = "http://localhost:5000/api/auth";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [loading, setLoading] = useState(false);
  const inactivityTimer = useRef(null);

  // 🔐 Generate Password
  const generatePassword = (employee) => {
    const empCode = employee.employee_code || "";
    const phone = employee.phone || "";
    const dobValue = employee.dob || employee.date_of_birth || "";

    let year = "0000";
    if (dobValue) {
      const parsed = new Date(dobValue);
      if (!isNaN(parsed)) year = parsed.getFullYear().toString();
    }

    return `${empCode.slice(-3)}#${phone.slice(-4)}@${year}`;
  };

  // 🔍 Validate Email
  const validateEmail = (email) => {
    const regex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|info|org|net|co|io)$/;
    return regex.test(email);
  };

  // ➤ LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(form.email)) {
      toast({
        title: "Invalid Email",
        description: "Enter a valid email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("employee", JSON.stringify(data.employee));
      localStorage.setItem("token", data.token);

      toast({ title: "Login Successful", description: "Welcome back!" });

      navigate("/employee/Dashboard");
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ➤ REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const password = "temp@123"; // You replace later

      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({
        title: "Registration Successful",
        description: `Your temporary password: ${password}`,
      });

      setMode("login");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ➤ FORGOT PASSWORD
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({
        title: "Request Sent",
        description: "Admin will reset your password.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Auto Logout
  const resetTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    inactivityTimer.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "You were logged out due to inactivity.",
        variant: "destructive",
      });

      localStorage.removeItem("employee");
      navigate("/employee/login");
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    const events = ["mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6"
      >
        <img src="/logo.png" alt="logo" className="h-12" />
      </button>

      <h1 className="text-blue-700 text-3xl font-bold mb-8">
        Employee Portal
      </h1>

      <Card className="w-full max-w-md shadow-xl rounded-3xl bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === "login"
              ? "Employee Login"
              : mode === "register"
              ? "Register Employee"
              : "Forgot Password"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={
              mode === "login"
                ? handleLogin
                : mode === "register"
                ? handleRegister
                : handleForgot
            }
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            {/* Password Only on Login */}
            {mode === "login" && (
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="pr-10"
                  />
                  <span
                    className="absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button className="w-64 bg-blue-700 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : mode === "register" ? (
                  "Register"
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </form>

          {/* Mode Switch */}
          <div className="text-center mt-4">
            {mode !== "login" && (
              <Button
                className="w-64 bg-blue-700 text-white"
                onClick={() => setMode("login")}
              >
                Back to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
