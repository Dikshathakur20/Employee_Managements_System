import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import {
Card,
CardHeader,
CardTitle,
CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
Table,
TableHeader,
TableBody,
TableRow,
TableHead,
TableCell,
} from "@/components/ui/table";
import { Search } from "lucide-react";

interface LeaveRequest {
_id: string;
employee_id: string;
leave_type: string;
start_date: string;
end_date: string;
reason: string;
status: string;
created_at: string;
rejection_reason: string | null;
employee_name: string;
department_name: string;
}

const ApproveLeave: React.FC = () => {
const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectReason, setRejectReason] = useState("");
const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

// ---------------------------
// HELPER: Safe date formatting
// ---------------------------
const formatDate = (d?: string | null) => {
if (!d) return "—";
const cleanDate = d.split(".")[0].replace(" ", "T");
const date = new Date(cleanDate);
return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
};

// ====================================================
// FETCH LEAVE REQUESTS
// ====================================================
const fetchLeaveRequests = async () => {
try {
setLoading(true);
const res = await axiosClient.get("/leaves");
setLeaveRequests(res.data || []);
} catch (err) {
toast.error("Failed to load leave requests.");
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchLeaveRequests();
}, []);

// ====================================================
// FILTER REQUESTS
// ====================================================
const filteredRequests = leaveRequests.filter((leave) => {
const name = leave.employee_name?.toLowerCase() || "";
const dept = leave.department_name?.toLowerCase() || "";
const term = searchTerm.toLowerCase();
return name.includes(term) || dept.includes(term);
});

const pendingRequests = filteredRequests.filter(
(req) => req.status === "Pending"
);

// ====================================================
// UPDATE STATUS
// ====================================================
const handleUpdateStatus = async (
id: string,
newStatus: string,
reason?: string
) => {
try {
setLoading(true);
await axiosClient.put(`/leaves/status/${id}`, {
status: newStatus,
rejection_reason: newStatus === "Rejected" ? reason : null,
});
toast.success(`Leave ${newStatus.toLowerCase()} successfully.`);
fetchLeaveRequests();
} catch (err) {
toast.error("Failed to update leave status.");
} finally {
setLoading(false);
}
};

return ( <div className="min-h-screen bg-gray-50 p-8">
{/* PENDING REQUESTS TO APPROVE */}
{pendingRequests.length > 0 && ( <div className="mt-6 bg-white border shadow-md p-5 rounded-lg max-w-3xl mx-auto"> <h2 className="text-xl font-semibold mb-3 text-[#001F7A]">
Pending Leave Approval </h2>
{pendingRequests.map((req) => ( <div
           key={req._id}
           className="flex justify-between items-center border-b py-3"
         > <div> <p className="font-medium text-gray-900">{req.employee_name}</p> <p className="text-gray-600 text-sm">{req.leave_type}</p> </div> <div className="flex gap-3">
<Button
className="bg-green-600 hover:bg-green-700"
onClick={() => handleUpdateStatus(req._id, "Approved")}
>
Approve </Button>
<Button
className="bg-red-600 hover:bg-red-700"
onClick={() => {
setSelectedLeaveId(req._id);
setShowRejectModal(true);
}}
>
Reject </Button> </div> </div>
))} </div>
)}


  {/* MAIN TABLE */}
  <Card className="max-w-6xl mx-auto border shadow-md mt-8">
    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <CardTitle className="text-[#001F7A] text-2xl font-bold">
        Leave Requests Management
      </CardTitle>

      <div className="relative w-full sm:w-80">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-xs p-1"
          >
            ✖
          </button>
        )}
      </div>
    </CardHeader>

    <CardContent>
      <div className="border rounded-lg overflow-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-blue-50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Rejection Reason</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              // 🔹 Skeleton Loader Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 9 }).map((_, cellIdx) => (
                    <TableCell key={cellIdx} className="py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-3">
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((leave) => (
                <TableRow key={leave._id} className="hover:bg-gray-100">
                  <TableCell>{leave.employee_name}</TableCell>
                  <TableCell>{leave.department_name}</TableCell>
                  <TableCell>{leave.leave_type}</TableCell>
                  <TableCell>{formatDate(leave.start_date)}</TableCell>
                  <TableCell>{formatDate(leave.end_date)}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell
                    className={
                      leave.status === "Approved"
                        ? "text-green-600 font-semibold"
                        : leave.status === "Rejected"
                        ? "text-red-600 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }
                  >
                    {leave.status}
                  </TableCell>
                  <TableCell>{formatDate(leave.created_at)}</TableCell>
                  <TableCell>{leave.rejection_reason || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  {/* REJECT MODAL */}
  {showRejectModal && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Reject Leave Request
        </h2>

        <textarea
          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-red-600"
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button
            className="bg-gray-500 text-white"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              if (!rejectReason.trim()) {
                toast.error("Rejection reason is required");
                return;
              }
              handleUpdateStatus(selectedLeaveId!, "Rejected", rejectReason);
              setShowRejectModal(false);
              setRejectReason("");
            }}
          >
            Confirm Reject
          </Button>
        </div>
      </div>
    </div>
  )}
</div>


);
};

export default ApproveLeave;
