// src/pages/Designations.tsx — Full Working Page

import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useLogin } from "@/contexts/LoginContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import axiosClient from "../utils/axiosClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Dialog Components
import  NewDesignationDialog  from "@/components/dashboard/NewDesignationDialog";
import { EditDesignationDialog } from "@/components/dashboard/EditDesignationDialog";

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number;
  employeeCount?: number;
  total_employees?: number;  // new
}


interface Department {
  department_id: number;
  department_name: string;
}

export default function Designations() {
  const { user } = useLogin();
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const filterDept = searchParams.get("department");

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const [sortOption, setSortOption] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">(
    "id-desc"
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Re-fetch designations whenever the department filter changes
  useEffect(() => {
    fetchDesignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDept]);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const res = await axiosClient.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Unable to fetch departments", variant: "destructive" });
    }
  };

  // Fetch designations + employee count
 const fetchDesignations = async () => {
  setLoading(true);
  try {
    const res = await axiosClient.get("/designations");
    let list: Designation[] = res.data || [];

    if (filterDept) {
      list = list.filter((d: Designation) => d.department_id === Number(filterDept));
    }

    // No extra requests. Backend already sends employee count.
    const prepared = list.map((d) => ({
      ...d,
      employeeCount: d.total_employees ?? 0
    }));

    setDesignations(prepared);
  } catch (err) {
    toast({ title: "Error", description: "Unable to fetch designations", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  // Delete designation
  // Delete designation
const handleDelete = async (id: number, employeeCount: number) => {
  try {
    // Prevent deletion if employees are linked
    if (employeeCount > 0) {
      toast({
        title: "Cannot delete",
        description: "This designation has employees assigned to it.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this designation?")) return;

    await axiosClient.delete(`/designations/${id}`);
    toast({ title: "Deleted", description: "Designation removed successfully" });
    fetchDesignations();
  } catch {
    toast({ title: "Error", description: "Error while deleting designation.", variant: "destructive" });
  }
};


  // Filtering
  const filtered = designations.filter((d) =>
    d.designation_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
  if (sortOption === "name-asc")
    return a.designation_title.localeCompare(b.designation_title);

  if (sortOption === "name-desc")
    return b.designation_title.localeCompare(a.designation_title);

  if (sortOption === "id-asc")
    return a.designation_id - b.designation_id; // Old → New

  if (sortOption === "id-desc")
    return b.designation_id - a.designation_id; // New → Old

  return 0;
});


  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const displayed = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="px-4 py-2">
        <Card className="w-full border-0 shadow-none bg-transparent flex-1 flex flex-col">
          <CardHeader className="px-0 py-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <CardTitle className="text-2xl font-bold">Designations</CardTitle>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    placeholder="Search designation"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 text-black bg-white border border-gray-300 shadow-sm"
                  />
                  <button
      onClick={() => setSearchTerm("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-xs p-1 bg-transparent focus:outline-none"
    >
      ×
    </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowNewDialog(true)}
                    className="bg-[#001F7A] text-white hover:bg-[#0029b0]"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                     <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]" title="Sort">
                                             Sort:{" "}
                                             {sortOption === "name-asc"
                                               ? "A-Z"
                                               : sortOption === "name-desc"
                                               ? "Z-A"
                                               : sortOption === "id-asc"
                                               ? "Old → New"
                                               : "New → Old"}
                                             <ChevronDown className="ml-2 h-4 w-4" />
                                           </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="bg-white">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortOption("name-asc");
                          setCurrentPage(1);
                        }}
                      >
                        A → Z
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortOption("name-desc");
                          setCurrentPage(1);
                        }}
                      >
                        Z → A
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortOption("id-asc");
                          setCurrentPage(1);
                        }}
                      >
                        Old → New
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortOption("id-desc");
                          setCurrentPage(1);
                        }}
                      >
                        New → Old
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 flex-1 flex flex-col overflow-hidden">
            <div className="border rounded-lg overflow-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-blue-50">
                  <TableRow>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Employees</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
  {loading ? (
    // 🔵 Skeleton Loading Rows
    <>
      {[...Array(rowsPerPage)].map((_, i) => (
        <TableRow key={i}>
          
          {/* Designation Title */}
          <TableCell>
            <div className="h-4 w-36 bg-gray-200 animate-pulse rounded"></div>
          </TableCell>

          {/* Department Name */}
          <TableCell>
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
          </TableCell>

          {/* Employee Count */}
          <TableCell className="text-center">
            <div className="h-4 w-10 mx-auto bg-gray-200 animate-pulse rounded"></div>
          </TableCell>

          {/* Actions */}
          <TableCell className="text-end">
            <div className="flex justify-end gap-2">
              <div className="h-7 w-7 bg-gray-300 animate-pulse rounded"></div>
              <div className="h-7 w-7 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </TableCell>

        </TableRow>
      ))}
    </>
  ) : (
    // 🔵 Real Data Rows
    displayed.map((d) => (
      <TableRow key={d.designation_id}>
        <TableCell>{d.designation_title}</TableCell>

        <TableCell>
          {departments.find((x) => x.department_id === d.department_id)?.department_name || "Unknown"}
        </TableCell>

        <TableCell className="text-center">
          {d.employeeCount && d.employeeCount > 0 ? (
            <a
              href={`/employees?designation=${d.designation_id}`}
              className="text-gray-700 hover:underline cursor-pointer"
            >
              {d.employeeCount}
            </a>
          ) : (
            <span className="text-gray-600">{d.employeeCount || 0}</span>
          )}
        </TableCell>

        <TableCell className="text-end">
          <div className="flex justify-end space-x-1">
            <Button
              size="sm"
              className="bg-blue-900 text-white h-7 w-7 p-0"
              onClick={() => setEditingDesignation(d)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              className="bg-blue-900 text-white h-7 w-7 p-0"
              onClick={() => handleDelete(d.designation_id, d.employeeCount ?? 0)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>

              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]">
                      Records: {rowsPerPage} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="bg-white">
                    {[5, 10, 15, 20, 25, 50, 100].map((num) => (
                      <DropdownMenuItem
                        key={num}
                        onClick={() => {
                          setRowsPerPage(num);
                          setCurrentPage(1);
                        }}
                      >
                        {num}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1"
                >
                  Previous
                </Button>

                <span className="px-2 py-1 rounded text-gray-700 bg-gray-200">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>

                <Button
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* New Designation Dialog */}
      <NewDesignationDialog
        open={showNewDialog}
        onOpenChange={(open) => setShowNewDialog(open)}
        onSuccess={() => {
          setShowNewDialog(false);
          // reset to first page and refresh list to show newly added
          setCurrentPage(1);
          fetchDesignations();
        }}
      />

      {/* Edit Dialog */}
      {editingDesignation && (
        <EditDesignationDialog
          open={!!editingDesignation}
          onOpenChange={() => setEditingDesignation(null)}
          designation={editingDesignation}
          onSuccess={() => {
            setEditingDesignation(null);
            fetchDesignations();
          }}
        />
      )}
    </div>
  );
}
