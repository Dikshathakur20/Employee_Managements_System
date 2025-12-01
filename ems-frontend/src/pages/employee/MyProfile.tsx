import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

/* ---------------- Helper Date Functions ---------------- */

// Convert YYYY-MM-DD → DD/MM/YYYY
const formatToDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const MyProfile: React.FC = () => {
  const [employee, setEmployee] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ---------------- GET EMPLOYEE ID ----------------
  const storedEmployee = JSON.parse(localStorage.getItem("employee") || "{}");
  const employeeId = storedEmployee?.employee_id;

  // ---------------- FETCH EMPLOYEE ----------------
  useEffect(() => {
    if (!employeeId) {
      toast.error("No employee data found. Please log in again.");
      return;
    }

    const fetchEmployee = async () => {
      try {
        const res = await axiosClient.get(`/employees/${employeeId}`);

        // Ensure emergency fields always exist (important)
        const safeData = {
          ...res.data,
          emergency_contact_name: res.data.emergency_contact_name ?? "",
          emergency_contact_phone: res.data.emergency_contact_phone ?? "",
          emergency_contact_relation: res.data.emergency_contact_relation ?? "",
        };

        setEmployee(safeData);
        setFormData(safeData);
      } catch (err) {
        console.error("Error fetching employee:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchEmployee();
  }, [employeeId]);

  // ---------------- ON INPUT CHANGE ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  let newValue = value;

  // Limit phone numbers to 10 digits
  if (name.includes("phone")) {
    newValue = value.replace(/\D/g, "").slice(0, 10); // remove non-digits & max 10
  }

  setFormData({ ...formData, [name]: newValue });
  setEmployee({ ...employee, [name]: newValue }); // UPDATE employee state immediately
};

  // ---------------- FILE UPLOAD ----------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, file_data: reader.result });
      toast.info("Profile photo updated (not saved yet)");
    };
    reader.readAsDataURL(file);
  };

  // ---------------- SAVE CHANGES ----------------
  const handleSave = async () => {
  try {
    setLoading(true);

    // 1️⃣ Send updated data to backend
    const res = await axiosClient.put(`/employees/${employeeId}`, formData);

    // 2️⃣ Update the employee state with backend response
    setEmployee(res.data.employee);

    // 3️⃣ Exit edit mode
    setIsEditing(false);

    toast.success("Profile updated successfully!");
  } catch (err) {
    console.error("Error updating profile:", err);
    toast.error("Failed to update profile.");
  } finally {
    setLoading(false);
  }
};


  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <Card className="w-full max-w-3xl shadow-sm border rounded-2xl overflow-hidden">
        {/* ---------------- HEADER ---------------- */}
        <div
          className="bg-gradient-to-r text-white px-6 py-8 flex flex-col items-center"
          style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
        >
          <div className="relative">
            <img
              src={
                formData.file_data ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
            />

            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-white text-black text-xs px-2 py-1 rounded cursor-pointer">
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>

          <h1 className="text-xl font-bold mt-4">
            {employee.first_name} {employee.last_name}
          </h1>

          {!isEditing ? (
            <Button
              className="mt-4 bg-blue-900 text-white"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-900 text-white"
              >
                Save
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* ---------------- CONTENT ---------------- */}
        <CardContent className="p-6 space-y-4">
          {/* BASIC INFO */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputBlock
                label="Email"
                name="email"
                value={formData.email}
                viewValue={employee.email}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputBlock
                label="Phone"
                name="phone"
                value={formData.phone}
                viewValue={employee.phone}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* PERSONAL DETAILS */}
          <CollapsibleSection title="Personal Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputBlock
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                max="2007-12-31"
                value={
                  isEditing
                    ? formData.date_of_birth
                      ? new Date(formData.date_of_birth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                    : formatToDisplayDate(employee.date_of_birth)
                }
                viewValue={formatToDisplayDate(employee.date_of_birth)}
                isEditing={isEditing}
                onChange={(e: any) => {
                  setFormData({
                    ...formData,
                    date_of_birth: e.target.value,
                  });
                }}
              />

              <InputBlock
                full
                label="Address"
                name="address"
                value={formData.address}
                viewValue={employee.address}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </CollapsibleSection>

          {/* EMERGENCY CONTACT */}
          <CollapsibleSection title="Emergency Contact">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputBlock
                label="Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                viewValue={employee.emergency_contact_name}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputBlock
                label="Phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                viewValue={employee.emergency_contact_phone}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputBlock
                label="Relation"
                name="emergency_contact_relation"
                value={formData.emergency_contact_relation}
                viewValue={employee.emergency_contact_relation}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </CollapsibleSection>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;

/* ---------------- Helper Components ---------------- */

const CollapsibleSection = ({ title, children }: any) => (
  <Collapsible className="border rounded-lg p-4">
    <CollapsibleTrigger className="flex justify-between items-center w-full text-left font-semibold">
      {title}
      <ChevronDown className="h-4 w-4" />
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-3 text-sm">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

const Section = ({ title, children }: any) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
    {children}
  </div>
);

/* FINAL FIXED INPUTBLOCK */
const InputBlock = ({
  label,
  name,
  value,
  viewValue,
  isEditing,
  onChange,
  type = "text",
  full = false,
  max,
}: any) => (
  <div className={full ? "md:col-span-2" : ""}>
    <Label className="text-sm font-medium">{label}</Label>

    {isEditing ? (
      <Input
        name={name}
        type={type}
        value={value ?? ""}   // IMPORTANT FIX
        onChange={onChange}
        max={max}
      />
    ) : (
      <p className="text-gray-600">{viewValue || "—"}</p>
    )}
  </div>
);
