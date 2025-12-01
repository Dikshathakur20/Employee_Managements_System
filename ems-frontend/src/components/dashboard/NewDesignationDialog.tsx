import { useState, useEffect } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
Dialog,
DialogContent,
DialogFooter,
DialogHeader,
DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Department {
department_id: number;
department_name: string;
}

interface NewDesignationDialogProps {
open: boolean;
onOpenChange: (open: boolean) => void;
onSuccess: () => void;
}

const NewDesignationDialog = ({ open, onOpenChange, onSuccess }: NewDesignationDialogProps) => {
const [designationTitle, setDesignationTitle] = useState('');
const [departmentId, setDepartmentId] = useState<number | null>(null);
const [departments, setDepartments] = useState<Department[]>([]);
const [loading, setLoading] = useState(false);
const { toast } = useToast();

useEffect(() => {
if (open && departments.length === 0) fetchDepartments();
}, [open]);

const fetchDepartments = async () => {
  try {
    const res = await axiosClient.get('/departments');

    // res.data is already the array
    const deptData: Department[] = res.data || [];

    setDepartments(deptData);
    setDepartmentId(null);
  } catch {
    toast({
      title: 'Error',
      description: 'Unable to fetch departments',
      variant: 'default'
    });
  }
};


const resetForm = () => {
setDesignationTitle('');
setDepartmentId(null);
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();


if (!departmentId) {
  toast({ title: 'Error', description: 'Please select a department', variant: 'default' });
  return;
}

if (!designationTitle.trim()) {
  toast({ title: 'Error', description: 'Designation cannot be empty', variant: 'default' });
  return;
}

setLoading(true);
try {
  await axiosClient.post('/designations', {
    designation_title: designationTitle.trim(),
    department_id: departmentId
  });
  toast({ title: 'Success', description: 'Designation added successfully', duration: 2000 });
  resetForm();
  onSuccess();
  onOpenChange(false);
} catch (error) {
  toast({ title: 'Error', description: 'Failed to add designation', variant: 'default', duration: 2000 });
} finally {
  setLoading(false);
}


};

return ( <Dialog open={open} onOpenChange={onOpenChange}> <DialogContent className="sm:max-w-[400px] bg-white text-black rounded-xl shadow-lg border border-gray-200 overflow-visible"> <DialogHeader> <DialogTitle>Add New Designation</DialogTitle> </DialogHeader>


    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Department Selector */}
       {/* Department Selector */}
        <div className="space-y-2">
  <Label htmlFor="departmentSelect">Department</Label>

  <select
    id="departmentSelect"
    value={departmentId ?? ""}
    onChange={(e) => setDepartmentId(Number(e.target.value))}
    className="w-full bg-white-900 text-blue border border-blue-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600"
  >
    <option value="" disabled>
      Select department
    </option>

    {departments.map((dept) => (
      <option
        key={dept.department_id}
        value={dept.department_id}
        className="text-black"
      >
        {dept.department_name}
      </option>
    ))}
  </select>
</div>


        {/* Designation Input */}
        <div className="space-y-2">
          <Label htmlFor="designationTitle">Designation</Label>
          <Input
            id="designationTitle"
            value={designationTitle}
            maxLength={50}
            placeholder="Enter designation"
            className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
            onChange={(e) => {
              const value = e.target.value;
              // Allow letters, spaces, and basic punctuation
              if (/^[A-Za-z\s.,'-]*$/.test(value)) setDesignationTitle(value);
            }}
            required
          />
          {designationTitle.length === 50 && (
            <p className="text-xs text-red-500">Maximum 50 characters allowed</p>
          )}
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => { resetForm(); onOpenChange(false); }}
          className="bg-white text-blue-900 border border-blue-900 hover:bg-blue-50"
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading} className="bg-blue-900 text-white hover:bg-blue-700">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Designation
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>


);
};

export default NewDesignationDialog;
