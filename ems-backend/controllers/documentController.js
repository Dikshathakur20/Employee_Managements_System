import Document from "../models/Document.js";

// Add new document
export const addDocument = async (req, res) => {
  try {
    const { employee_id, department, designation, category, file_name, file_url, uploaded_by } = req.body;

    const document = new Document({
      employee_id,
      department,
      designation,
      category,
      file_name,
      file_url,
      uploaded_by,
    });

    await document.save();
    res.status(201).json({ message: "Document uploaded successfully", document });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ uploaded_at: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) return res.status(404).json({ message: "Document not found" });

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get documents by employee ID
export const getDocumentsByEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const documents = await Document.find({ employee_id }).sort({ uploaded_at: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndDelete(id);

    if (!document) return res.status(404).json({ message: "Document not found" });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
