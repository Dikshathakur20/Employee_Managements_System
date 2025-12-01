// src/pages/Departments.tsx — Full Working File

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useLogin } from "@/contexts/LoginContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Edit, Trash2, ChevronDown } from "lucide-react";
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
import { EditDepartmentDialog } from "@/components/dashboard/EditDepartmentDialog";
import { NewDepartmentDialog } from "@/components/dashboard/NewDepartmentDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Department {
  department_id: number;
  department_name: string;
  location: string | null;
  total_designations?: number;
  total_employees?: number;
}

interface Designation {
  designation_id: number;
  designation_title: string;
  department_id: number;
}

const Departments = () => {
  const { user } = useLogin();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [departmentDesignations, setDepartmentDesignations] = useState<Designation[]>([]);
  const [sortOption, setSortOption] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">("id-desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/departments");
      const deptData = res.data;

      const enriched = deptData.map((d: any) => ({
        department_id: d.department_id,
        department_name: d.department_name,
        location: d.location,
        total_designations: d.total_designations || 0,
        total_employees: d.total_employees || 0,
      }));

      setDepartments(enriched);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to fetch departments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, totalEmployees: number, totalDesignations: number) => {
  try {
    // Prevent deletion if employees or designations exist
    if (totalEmployees > 0 || totalDesignations > 0) {
      toast({
        title: "Cannot delete",
        description: "This department has employees or designations assigned.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this department?")) return;

    await axiosClient.delete(`/departments/${id}`);
    toast({ title: "Deleted", description: "Department removed successfully" });
    fetchDepartments();
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: "Error while deleting department.", variant: "destructive" });
  }
};


  const fetchDepartmentDesignations = async (id: number) => {
  try {
    const res = await axiosClient.get(`/designations`);
    
    // Filter only those that belong to the department
    const filtered = (res.data || []).filter(
      (des: any) => des.department_id === id
    );

    setDepartmentDesignations(filtered);
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Unable to fetch designations",
    });
    setDepartmentDesignations([]);
  }
};


  const filtered = departments.filter((d) =>
    d.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "id-asc") return a.department_id - b.department_id;
    if (sortOption === "id-desc") return b.department_id - a.department_id;
    if (sortOption === "name-asc") return a.department_name.localeCompare(b.department_name);
    if (sortOption === "name-desc") return b.department_name.localeCompare(a.department_name);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const displayedDepartments = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="px-4 py-2">
        <Card className="w-full border-0 shadow-none bg-transparent flex-1 flex flex-col">
          <CardHeader className="px-0 py-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <CardTitle className="text-2xl font-bold">Departments</CardTitle>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    placeholder="Search department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Button onClick={() => setShowNewDialog(true)} className="bg-[#001F7A] text-white hover:bg-[#0029b0]">
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
                      <DropdownMenuItem onClick={() => setSortOption("name-asc")}>A → Z</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("name-desc")}>Z → A</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("id-asc")}>Old → New</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("id-desc")}>New → Old</DropdownMenuItem>
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
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Total Designations</TableHead>
                    <TableHead className="text-center">Active Employees</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
  {loading ? (
    <>
      {[...Array(rowsPerPage)].map((_, i) => (
        <TableRow key={i}>
          {/* Department Name */}
          <TableCell>
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
          </TableCell>

          {/* Designations */}
          <TableCell className="text-center">
            <div className="h-4 w-10 bg-gray-200 animate-pulse rounded mx-auto"></div>
          </TableCell>

          {/* Employees */}
          <TableCell className="text-center">
            <div className="h-4 w-10 bg-gray-200 animate-pulse rounded mx-auto"></div>
          </TableCell>

          {/* Action Buttons */}
          <TableCell className="text-end">
            <div className="flex justify-end gap-2">
              <div className="h-7 w-7 bg-gray-300 animate-pulse rounded"></div>
              <div className="h-7 w-7 bg-gray-300 animate-pulse rounded"></div>
              <div className="h-7 w-7 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  ) : (
    displayedDepartments.map((d) => (
      <TableRow key={d.department_id}>
        <TableCell>{d.department_name}</TableCell>

        <TableCell className="text-center">
          {d.total_designations > 0 ? (
            <a
              href={`/designations?department=${d.department_id}`}
              className="text-gray-700 hover:text-blue-700 cursor-pointer"
            >
              {d.total_designations}
            </a>
          ) : (
            <span className="text-gray-500">{d.total_designations}</span>
          )}
        </TableCell>

        <TableCell className="text-center">
          {d.total_employees > 0 ? (
            <a
              href={`/employees?department=${d.department_id}`}
              className="text-gray-700 hover:text-blue-700 cursor-pointer"
            >
              {d.total_employees}
            </a>
          ) : (
            <span className="text-gray-500">{d.total_employees}</span>
          )}
        </TableCell>

        <TableCell className="text-end">
          <div className="flex justify-end space-x-1">
            <Button
              size="sm"
              className="bg-blue-900 text-white h-7 w-7 p-0"
              onClick={async () => {
                await fetchDepartmentDesignations(d.department_id);
                setViewingDepartment(d);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              className="bg-blue-900 text-white h-7 w-7 p-0"
              onClick={() => setEditingDepartment(d)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              className="bg-blue-900 text-white h-7 w-7 p-0"
              onClick={() =>
                handleDelete(
                  d.department_id,
                  d.total_employees ?? 0,
                  d.total_designations ?? 0
                )
              }
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

            {/* Pagination Controls */} {/* Rows per Page & Pagination */}
           {/* Pagination Controls */}
<div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
  <div className="flex items-center gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]">
          Records: {rowsPerPage} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="bg-white"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
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
      title="Previous Page"
    >
      Previous
    </Button>

    <span className="px-2 py-1 rounded text-gray-700 bg-gray-200">
      Page {currentPage} of {Math.max(1, Math.ceil(sorted.length / rowsPerPage))}
    </span>

    <Button
      size="sm"
      onClick={() =>
        setCurrentPage((p) =>
          Math.min(p + 1, Math.ceil(sorted.length / rowsPerPage))
        )
      }
      disabled={currentPage === Math.ceil(sorted.length / rowsPerPage)}
      className="bg-[#001F7A] text-white hover:bg-[#0029b0] rounded px-3 py-1"
      title="Next Page"
    >
      Next
    </Button>
  </div>
</div>

          </CardContent>
        </Card>
      </main>

      {/* View Dialog */}
      <Dialog open={!!viewingDepartment} onOpenChange={() => setViewingDepartment(null)}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>

          {viewingDepartment && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {viewingDepartment.department_name}</p>
            {/*}  <p><strong>Location:</strong> {viewingDepartment.location || "N/A"}</p>*/}

              <p className="mt-4 font-semibold">Designations:</p>
              {departmentDesignations.length === 0 ? (
                <p className="text-sm text-gray-600">No designations found.</p>
              ) : (
                <ul className="list-disc pl-5 text-sm">
                  {departmentDesignations.map((des) => (
                    <li key={des.designation_id}>{des.designation_title}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingDepartment && (
        <EditDepartmentDialog
          open={!!editingDepartment}
          onOpenChange={() => setEditingDepartment(null)}
          department={editingDepartment}
          onSuccess={() => {
            setEditingDepartment(null);
            fetchDepartments();
          }}
        />
      )}

      {/* Add Dialog */}
      <NewDepartmentDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => {
          setShowNewDialog(false);
          fetchDepartments();
        }}
      />
    </div>
  );
};

export default Departments;