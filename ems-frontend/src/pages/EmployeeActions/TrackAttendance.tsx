import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import axiosClient from "@/utils/axiosClient"; // ✅ using axiosClient

const TrackAttendance = () => {
  const { id } = useParams(); // employee_id
  const [employeeName, setEmployeeName] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());

  // ==========================
  // FETCH EMPLOYEE NAME
  // ==========================
  const fetchEmployeeName = async (employeeId: string) => {
    try {
      const res = await axiosClient.get(`/employees/${employeeId}`);
      const data = res.data;

      if (data?.first_name && data?.last_name) {
        setEmployeeName(`${data.first_name} ${data.last_name}`);
      } else {
        setEmployeeName("Unknown Employee");
      }
    } catch (err) {
      console.error("Error fetching employee name");
      setEmployeeName("Unknown Employee");
    }
  };

  // ==========================
  // FETCH ATTENDANCE RECORDS
  // ==========================
  const fetchAttendance = async (
    employeeId: number,
    month: number,
    year: number
  ) => {
    try {
      setLoading(true);

      const res = await axiosClient.get(
        `/attendance/${employeeId}?month=${month}&year=${year}`
      );

      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching attendance");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeName(id);
      fetchAttendance(Number(id), month, year);

    }
  }, [id, month, year]);

  const getBarColor = (status: string) => {
    switch (status) {
      case "Present":
        return "#10B981"; // green
      case "Absent":
        return "#EF4444"; // red
      case "Leave":
        return "#F59E0B"; // orange
      default:
        return "#1E40AF"; // blue
    }
  };

  const chartData = records.map((r) => ({
    ...r,
    total_hours: Number(r.total_hours) || 0,
  }));

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Track Attendance</h2>

        {employeeName && (
          <p className="text-lg text-blue-700 font-semibold mt-2 md:mt-0">
            Employee:{" "}
            <span className="text-blue-900">{employeeName}</span>
          </p>
        )}
      </div>

      {/* Month & Year Selector */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("en-IN", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading attendance...</p>
      ) : records.length > 0 ? (
        <>
          {/* Chart */}
          <div className="w-full h-64 mb-6 bg-white shadow p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  }
                  formatter={(value: any) => [`${value} hours`, "Total Hours"]}
                  contentStyle={{
                    backgroundColor: "#f3f4f6",
                    borderRadius: 6,
                  }}
                />
                <Bar dataKey="total_hours" minPointSize={5}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={getBarColor(entry.status)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-300 text-center bg-white shadow">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Check-In</th>
                <th className="border p-2">Check-Out</th>
                <th className="border p-2">Total Hours</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((rec, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border p-2">{rec.date}</td>

                  <td className="border p-2">
                    {rec.check_in
                      ? new Date(rec.check_in).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>

                  <td className="border p-2">
                    {rec.check_out
                      ? new Date(rec.check_out).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>

                  <td className="border p-2">{rec.total_hours || "-"}</td>
                  <td className="border p-2">{rec.status || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-gray-500">No attendance records found.</p>
      )}

      <Button
        onClick={() => window.history.back()}
        className="mt-4 bg-blue-900 text-white hover:bg-blue-800"
      >
        Back
      </Button>
    </div>
  );
};

export default TrackAttendance;
