import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import employeeAuthRoutes from "./routes/employeeAuthRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import designationRoutes from "./routes/designationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Put this BEFORE routes
// ✅ Universal CORS that works for Vercel + Localhost + Render
app.use(cors({
  origin: [
    /\.vercel\.app$/,        // Allow ANY Vercel URL (new deployments, previews)
    "http://localhost:5173", // Allow local dev
    "http://localhost:3000"
  ],
  credentials: true
}));


app.use(express.json());

// ROUTES
app.use("/api/admins", adminRoutes);
app.use("/api/auth", employeeAuthRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/password-reset", passwordResetRoutes);

app.get("/", (req, res) => {
  res.send("EMS Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
