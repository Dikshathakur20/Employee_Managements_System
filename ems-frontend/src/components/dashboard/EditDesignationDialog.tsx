import { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {
Dialog,
DialogContent,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Department {
department_id: number;
department_name: string;
}

interface Designation {
designation_id: number;
designation_title: string;
department_id: number | null;
}

export const EditDesignationDialog = ({
designation,
open,
onOpenChange,
onSuccess,
}: {
designation: Designation | null;
open: boolean;
onOpenChange: (open: boolean) => void;
onSuccess: () => void;
}) => {
const [designationTitle, setDesignationTitle] = useState("");
const [departmentId, setDepartmentId] = useState<number | null>(null);
const [departments, setDepartments] = useState<Department[]>([]);
const [loading, setLoading] = useState(false);
const [deptLoading, setDeptLoading] = useState(false);

const { toast } = useToast();

// Fetch departments whenever the dialog opens
useEffect(() => {
const fetchDepartments = async () => {
try {
setDeptLoading(true);
const res = await axiosClient.get("/departments");
setDepartments(res.data || []);
} catch (error) {
toast({
title: "Error",
description: "Unable to load departments",
});
} finally {
setDeptLoading(false);
}
};


if (open) {
  fetchDepartments();
}


}, [open, toast]);

// Pre-fill form when dialog opens
// Pre-fill form when dialog opens AND departments are loaded
useEffect(() => {
  if (open && designation && departments.length > 0) {
    setDesignationTitle(designation.designation_title);
    setDepartmentId(designation.department_id);
  }
}, [open, designation, departments]);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!designation) return;


if (!departmentId) {
  toast({
    title: "Validation Error",
    description: "Please select a department",
  });
  return;
}

setLoading(true);
try {
  await axiosClient.put(`/designations/${designation.designation_id}`, {
    designation_title: designationTitle,
    department_id: departmentId,
  });

  toast({
    title: "Success",
    description: "Designation updated",
  });

  onSuccess();
  onOpenChange(false);
} catch (error) {
  toast({
    title: "Error",
    description: "Update failed",
  });
} finally {
  setLoading(false);
}


};

// Show the current department name or placeholder
const selectedDeptName =
departments.find((d) => d.department_id === departmentId)?.department_name ||
"Select Department";

return ( <Dialog open={open} onOpenChange={onOpenChange}> <DialogContent className="sm:max-w-[450px] rounded-xl shadow-xl border border-gray-200 bg-white text-black"> <DialogHeader> <DialogTitle className="text-lg font-semibold text-black">
Edit Designation </DialogTitle> </DialogHeader>


    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-white text-black shadow-sm">
      {/* Department */}
      <div className="space-y-2">
        <Label className="text-black">Department *</Label>
        <Select
  value={departmentId !== null ? String(departmentId) : ""}
  onValueChange={(val) => setDepartmentId(Number(val))}
>
  <SelectTrigger className="w-full text-black bg-white border-gray-300">
    {/* Always show the selected department name */}
    <SelectValue>
      {deptLoading
        ? "Loading..."
        : departments.find((d) => d.department_id === departmentId)
            ?.department_name }
    </SelectValue>
  </SelectTrigger>

  <SelectContent className="bg-white text-black">
    {departments.map((dept) => (
      <SelectItem key={dept.department_id} value={String(dept.department_id)}>
        {dept.department_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

      </div>

      {/* Designation Title */}
      <div className="space-y-2">
        <Label className="text-black">Designation Title *</Label>
        <Input
          value={designationTitle}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[A-Za-z\s]*$/.test(value)) {
              setDesignationTitle(value);
            }
          }}
          maxLength={50}
          required
          className="text-black placeholder-gray-400 bg-white border-gray-300"
        />
      </div>

      <DialogFooter>
        <Button variant="text-white bg-gray-700" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        <Button type="submit" disabled={loading} className="bg-blue-700 text-white  hover:bg-blue-800">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-white bg-blue-700" />}
          Update
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>


);
};

export default EditDesignationDialog;
