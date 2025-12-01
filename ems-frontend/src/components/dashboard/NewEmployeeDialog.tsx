import { useState, useEffect, useRef } from 'react';
import  axiosClient  from '@/utils/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewEmployeeDialogProps {
open: boolean;
onOpenChange: (open: boolean) => void;
onEmployeeAdded?: (employee: any) => void;
}

interface Department {
department_id: number;
department_name: string;
}

interface Designation {
designation_id: number;
designation_title: string;
department_id: number | null;
}

export const NewEmployeeDialog = ({ open, onOpenChange, onEmployeeAdded }: NewEmployeeDialogProps) => {
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [hireDate, setHireDate] = useState('');
const [salary, setSalary] = useState('');
const [departmentId, setDepartmentId] = useState<string>('');
const [designationId, setDesignationId] = useState<string>('');
const [phone, setPhone] = useState('');
const [employmentType, setEmploymentType] = useState('');
const [dateOfBirth, setDateOfBirth] = useState('');
const [address, setAddress] = useState('');
const [departments, setDepartments] = useState<Department[]>([]);
const [designations, setDesignations] = useState<Designation[]>([]);
const [loading, setLoading] = useState(false);
const [emailExists, setEmailExists] = useState('');
const [profilePicture, setProfilePicture] = useState<File | null>(null);

const hireDateRef = useRef<HTMLInputElement | null>(null);
const dobRef = useRef<HTMLInputElement | null>(null);

const { toast } = useToast();

const capitalizeWords = (val: string) => val.replace(/\b\w/g, c => c.toUpperCase());

const toBase64 = (file: File): Promise<string> =>
new Promise((resolve, reject) => {
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onload = () => resolve(reader.result as string);
reader.onerror = (error) => reject(error);
});

useEffect(() => {
if (open) fetchData();
}, [open]);

const fetchData = async () => {
try {
const [departmentsRes, designationsRes] = await Promise.all([
axiosClient.get('/departments'),
axiosClient.get('/designations'),
]);
setDepartments(departmentsRes.data);
setDesignations(designationsRes.data);
} catch (error) {
toast({ title: "Data Loading Issue", description: "Unable to fetch departments and designations", duration: 1500 });
}
};

const checkEmailExists = async (email: string) => {
if (!email || email.length < 3) return setEmailExists('');
try {
const res = await axiosClient.get(`/employees/check-email?email=${encodeURIComponent(email)}`);
setEmailExists(res.data.exists ? `This email is already registered to ${res.data.name}` : '');
} catch (error) {
console.warn('Email check issue:', error);
}
};

const generateEmployeeCode = async () => {
const res = await axiosClient.get('/employees/generate-code');
return res.data.code;
};

const resetForm = () => {
setFirstName('');
setLastName('');
setEmail('');
setHireDate('');
setSalary('');
setDepartmentId('');
setDesignationId('');
setPhone('');
setEmploymentType('');
setDateOfBirth('');
setAddress('');
setEmailExists('');
setProfilePicture(null);
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();


if (emailExists) {
  toast({ title: "Email Already Exists", description: emailExists });
  return;
}

if (!departmentId || !designationId) {
  toast({ title: "Missing Selection", description: "Please select both Department and Designation" });
  return;
}

const salaryValue = salary ? parseFloat(salary) : 0;
if (salaryValue <= 0) {
  toast({ title: "Invalid Salary", description: "Salary cannot be 0 or empty. Please enter a valid amount." });
  return;
}
if (salaryValue > 10000000) {
  toast({ title: "Salary Limit Exceeded", description: "Salary cannot exceed ₹10,000,000" });
  return;
}
if (phone && !/^\d{7,15}$/.test(phone)) {
  toast({ title: "Invalid Phone", description: "Phone must be 7-15 digits" });
  return;
}
if (address && address.length > 250) {
  toast({ title: "Address Too Long", description: "Address cannot exceed 250 characters" });
  return;
}

setLoading(true);

try {
  let fileData: string | null = null;
  if (profilePicture) fileData = await toBase64(profilePicture);

  const employeeCode = await generateEmployeeCode();
  const employeeData: any = {
    employee_code: employeeCode,
    first_name: firstName,
    last_name: lastName,
    email: email.toLowerCase(),
    hire_date: hireDate,
    salary: salaryValue,
    department_id: parseInt(departmentId),
    designation_id: parseInt(designationId),
    phone: phone || null,
    employment_type: employmentType || null,
    status: "Active",
    date_of_birth: dateOfBirth || null,
    address: address || null,
    file_data: fileData || null,
  };

  const res = await axiosClient.post('/employees', employeeData);

  toast({ title: "Success", description: `Employee added successfully.` });
  if (onEmployeeAdded) onEmployeeAdded(res.data);

  resetForm();
  onOpenChange(false);
} catch (error) {
  console.error(error);
  toast({ title: "Addition Issue", description: "Unable to add employee" });
} finally {
  setLoading(false);
}


};

const filteredDesignations = departmentId
? designations.filter(d => d.department_id === parseInt(departmentId))
: [];

return ( <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent
className="w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white text-black rounded-xl shadow-lg border border-gray-200 overflow-auto"
style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
> <DialogHeader> <DialogTitle>Add New Employee</DialogTitle> </DialogHeader>


    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-auto">
      {/* First & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label htmlFor="firstName" className="text-sm">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            maxLength={25}
            className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
            onChange={e => { if (/^[A-Za-z\s]*$/.test(e.target.value)) setFirstName(capitalizeWords(e.target.value)); }}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            maxLength={25}
            className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
            onChange={e => { if (/^[A-Za-z\s]*$/.test(e.target.value)) setLastName(capitalizeWords(e.target.value)); }}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-sm">Email</Label>
           <Input
            id="email"
            type="email"
            value={email}
            pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
            className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md"
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, '').toLowerCase())}
            onPaste={(e) => e.preventDefault()}
            required
          />

        {emailExists && <p className="text-xs text-orange-600 mt-0.5">{emailExists}</p>}
      </div>

      {/* Hire Date & DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative">
  <Label htmlFor="hireDate">Hire Date</Label>
  <div
    onClick={() => {
      hireDateRef.current?.showPicker?.(); // open date picker
      hireDateRef.current?.focus();        // focus the input
    }}
    className="cursor-pointer"
  >
    <Input
      id="hireDate"
      ref={hireDateRef}
      type="date"
      value={hireDate}
      className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md cursor-pointer"
      onChange={(e) => setHireDate(e.target.value)}
      max={new Date().toISOString().split('T')[0]}
      min="2000-01-01"
      required
    />
  </div>
</div>

<div className="relative">
  <Label htmlFor="dateOfBirth">Date of Birth</Label>
  <div
    onClick={() => {
      dobRef.current?.showPicker?.();
      dobRef.current?.focus();
    }}
    className="cursor-pointer"
  >
    <Input
      id="dateOfBirth"
      ref={dobRef}
      type="date"
      value={dateOfBirth}
      className="border border-blue-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 placeholder-blue-400 rounded-md cursor-pointer"
      onChange={(e) => setDateOfBirth(e.target.value)}
      max="2007-12-31"
    />
  </div>
</div>
</div>


      {/* Phone & Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label htmlFor="phone" className="text-sm">Phone</Label>
          <Input
            id="phone"
            type="text"
            value={phone}
            placeholder="Enter phone number"
            className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 rounded-md"
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
          />
        </div>
        <div>
          <Label htmlFor="salary" className="text-sm">Salary</Label>
          <Input
  id="salary"
  type="number"
  step="0.01"
  value={salary}
  placeholder="Max ₹10,000,000"
  className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 rounded-md"
  onChange={(e) => {
    const val = e.target.value;
    if (val === '' || parseFloat(val) > 0) setSalary(val); // prevent 0
  }}
  required
/>

        </div>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address" className="text-sm">Address</Label>
        <Input
          id="address"
          type="text"
          value={address}
          placeholder="Enter address"
          className="h-9 border border-blue-500 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-blue-900 rounded-md"
          onChange={e => setAddress(e.target.value)}
          maxLength={250}
        />
      </div>

      {/* Employment Type & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label htmlFor="employmentType" className="text-sm">Employment Type</Label>
          <Select value={employmentType} onValueChange={setEmploymentType}>
            <SelectTrigger className="h-9 w-full bg-blue-900 text-white hover:bg-blue-700">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white shadow-lg">
              {['Full-Time', 'Part-Time', 'Contract', 'Intern'].map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Status</Label>
          <div className="h-9 flex items-center font-semibold text-green-700 border border-green-600 bg-green-100 rounded-md px-3">
            Active
          </div>
        </div>
      </div>

      {/* Department & Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label htmlFor="department" className="text-sm">Department *</Label>
          <Select value={departmentId} onValueChange={val => { setDepartmentId(val); setDesignationId(''); }} required>
            <SelectTrigger className="h-9 w-full bg-blue-900 text-white hover:bg-blue-700">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white shadow-lg">
              {departments.map(dept => (
                <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                  {dept.department_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="designation" className="text-sm">Designation *</Label>
          <Select value={designationId} onValueChange={setDesignationId} required disabled={!departmentId || filteredDesignations.length === 0}>
            <SelectTrigger className="h-9 w-full bg-blue-900 text-white hover:bg-blue-700">
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white shadow-lg">
              {filteredDesignations.map(des => (
                <SelectItem key={des.designation_id} value={des.designation_id.toString()}>
                  {des.designation_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Profile Picture */}
      <div>
        <Label htmlFor="profilePicture" className="text-sm">Profile Picture</Label>
        <Input
          id="profilePicture"
          type="file"
          accept="image/*"
          className="h-9"
          onChange={e => setProfilePicture(e.target.files?.[0] || null)}
        />
      </div>

      {/* Buttons */}
      <DialogFooter className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="h-9 bg-white text-blue-900 border border-blue-900 hover:bg-blue-50" onClick={() => { onOpenChange(false); resetForm(); }}>Cancel</Button>
        <Button type="submit" disabled={loading} className="h-9 bg-blue-900 text-white hover:bg-blue-700">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>


);
};

export default NewEmployeeDialog;
