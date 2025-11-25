import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, FileText } from "lucide-react";
import axiosClient from "@/utils/axiosClient";

interface Document {
  _id: string;
  employee_id: number;
  department: string;
  designation: string;
  category: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

const UploadDocument = () => {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [designation, setDesignation] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
  const storedEmployee = localStorage.getItem("employee");
  if (storedEmployee) {
    try {
      const parsed = JSON.parse(storedEmployee);

      // 👇 Use correct field names (MUST MATCH backend)
      setEmployeeId(parsed.employee_id || null);
      setDepartment(parsed.department || null);
      setDesignation(parsed.designation || null);

    } catch (err) {
      console.error("Error parsing employee:", err);
    }
  }
}, []);


  const fetchDocs = async () => {
    if (!employeeId) return;
    try {
      const res = await axiosClient.get(`/documents/employee/${employeeId}`);
      setUploadedDocs(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch documents." });
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [employeeId]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async () => {
    if (!file || !category) {
      toast({ title: "Missing fields", description: "Select file and category." });
      return;
    }
    if (!employeeId || !department || !designation) {
      toast({ title: "Employee info missing", description: "Please log in again.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const fileBase64 = await toBase64(file);

      await axiosClient.post(`/documents`, {
        employee_id: employeeId,
        department,
        designation,
        category,
        file_name: file.name,
        file_url: fileBase64,
        uploaded_by: "Employee",
      });

      toast({ title: "Success", description: "Document uploaded successfully." });

      setFile(null);
      setCategory("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocs();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (fileUrl: string) => {
    if (fileUrl.startsWith("data:application/pdf")) {
      fetch(fileUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        });
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await axiosClient.delete(`/documents/${id}`);
      toast({ title: "Deleted", description: "Document removed successfully." });
      setUploadedDocs(uploadedDocs.filter((doc) => doc._id !== id));
    } catch (err: any) {
      console.error(err);
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const personalDocs = uploadedDocs.filter((doc) => doc.category === "personal");
  const educationDocs = uploadedDocs.filter((doc) => doc.category === "education");
  const skillDocs = uploadedDocs.filter((doc) => doc.category === "skills");

  const renderDocList = (docs: Document[]) => (
    <ul className="space-y-3">
      {docs.length > 0 ? (
        docs.map((doc) => (
          <li
            key={doc._id}
            className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#001F7A] shadow-sm"
            style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
          >
            <div className="flex items-center gap-2">
              <FileText className="text-[#001F7A]" size={20} />
              <span className="text-sm text-[#001F7A] font-semibold">{doc.file_name}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewDocument(doc.file_url)}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                <Eye size={18} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteDocument(doc._id)}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </li>
        ))
      ) : (
        <p className="text-sm text-gray-600 text-center">No documents found.</p>
      )}
    </ul>
  );

  return (
       <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-10">
        {/* Upload Section */}
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-200 backdrop-blur-sm"
          
        >
          <h2 className="text-2xl font-bold text-[#001F7A] mb-6 text-center"
          style={{background: "Linear-gradient(-45 deg, #ffffff, #c9d0fb)"}}
          >
            Upload Your Document
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-[#001F7A] font-medium text-sm mb-1 block ">
                Select Document Category
              </label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="w-full border-[#001F7A] text-[#001F7A] bg-blue-50 text-black hover:bg-blue-50">
                  <SelectValue placeholder="Choose Document Type" />
                </SelectTrigger>
                <SelectContent className="bg-blue-50 text-black">
                  <SelectItem value="education">Education Qualification</SelectItem>
                  <SelectItem value="skills">Skill Set Document</SelectItem>
                  <SelectItem value="personal">Personal Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[#001F7A] font-medium text-sm mb-1 block">
                Choose PDF File
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="border-[#001F7A] text-[#001F7A]"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-[#001F7A] hover:bg-[#001F7A]/90 text-white font-semibold py-2 rounded-lg mt-3"
            >
              {loading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>

        {/* Grouped Documents Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-10">
          {/* Personal */}
          <div className="p-6 rounded-2xl shadow-md border border-gray-200 bg-white"
          >
            <h3 className="text-lg font-semibold text-[#001F7A] mb-4 text-center">
              Personal Documents
            </h3>
            {renderDocList(personalDocs)}
          </div>

          {/* Educational */}
          <div className="p-6 rounded-2xl shadow-md border border-gray-200 bg-white"
          >
            <h3 className="text-lg font-semibold text-[#001F7A] mb-4 text-center"
  
            >
              Educational Documents
            </h3>
            {renderDocList(educationDocs)}
          </div>

          {/* Skills */}
          <div className="p-6 rounded-2xl shadow-md border border-gray-200 bg-white"
          >
            <h3 className="text-lg font-semibold text-[#001F7A] mb-4 text-center">
              Skill Documents
            </h3>
            {renderDocList(skillDocs)}
          </div>
        </div>
      </div>
    
  
    </div>
  );
};

export default UploadDocument;
