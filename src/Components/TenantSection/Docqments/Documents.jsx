import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper function to convert file to Base64
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Helper function to get authentication token and tenant ID
const getAuthDetails = () => {
  const token = localStorage.getItem("tenanttoken");
  if (!token) throw new Error("No authentication token found");
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const tenantId = payload.id; // e.g., TENANT-quiokbc77
    return { token, tenantId };
  } catch (error) {
    throw new Error("Invalid authentication token");
  }
};

export default function DocumentManager() {
  const [tenantDocs, setTenantDocs] = useState([]);
  const [landlordDocs, setLandlordDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docName, setDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async (url, setDocs, source, filterVisible = false) => {
      try {
        const { token, tenantId } = getAuthDetails();
        const response = await fetch(url.replace("{tenantId}", tenantId), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.headers.get("content-type")?.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || `Failed to fetch ${source} documents`);
        }

        const docs = result.documents
          .filter((doc) => !filterVisible || doc.isVisibleToTenants)
          .map((doc) => ({
            id: doc._id,
            url: doc.filePath ? `https://api.gharzoreality.com${doc.filePath}` : doc.fileUrl,
            name: doc.documentType,
            uploadedAt: doc.uploadedAt,
            source,
          }));

        setDocs(docs);
        localStorage.setItem(`${source}Docs`, JSON.stringify(docs));
      } catch (error) {
        toast.error(error.message || `Error fetching ${source} documents`, {
          position: "top-center",
          autoClose: 3000,
        });
        console.error(`Error fetching ${source} documents:`, error);
      }
    };

    fetchDocuments(
      "https://api.gharzoreality.com/api/tenant-documents/tenant/{tenantId}",
      setTenantDocs,
      "tenant"
    );
    fetchDocuments(
      "https://api.gharzoreality.com/api/documents/tenant/{tenantId}/documents",
      setLandlordDocs,
      "landlord",
      true
    );
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!docName.trim() || !selectedFile) {
      toast.error(!docName.trim() ? "Please enter a document name" : "Please select a file", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only images (JPEG, PNG, GIF) and PDFs are allowed", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error(`File ${selectedFile.name} exceeds 5MB limit`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const { token } = getAuthDetails();
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("documentType", docName.trim());
formData.append("isVisibleToLandlord", true);
      const response = await fetch("https://api.gharzoreality.com/api/tenant-documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Upload failed`);
      }

      const newDoc = {
        id: result.document?._id,
        url: result.document?.filePath ? `https://api.gharzoreality.com${result.document.filePath}` : await getBase64(selectedFile),
        name: result.document?.documentType,
        uploadedAt: result.document?.uploadedAt,
        source: "tenant",
      };

      const updatedDocs = [...tenantDocs, newDoc];
      setTenantDocs(updatedDocs);
      localStorage.setItem("tenantDocs", JSON.stringify(updatedDocs));
      toast.success(result.message || `Uploaded ${docName.trim()}`, {
        position: "top-center",
        autoClose: 3000,
      });

      setDocName("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(error.message || "Error uploading document", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error uploading document:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const { token } = getAuthDetails();
      const response = await fetch(`https://api.gharzoreality.com/api/tenant-documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to delete document`);
      }

      const updatedDocs = tenantDocs.filter((doc) => doc.id !== id);
      setTenantDocs(updatedDocs);
      localStorage.setItem("tenantDocs", JSON.stringify(updatedDocs));
      setSelectedDoc(null);
      toast.success(result.message || "Document deleted successfully", {
        position: "top-center",
        autoClose: 3000,
        className: "bg-green-600 text-white font-semibold",
      });
    } catch (error) {
      toast.error(error.message || "Error deleting document", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error deleting document:", error);
    }
  };

  const handleCloseModal = () => setSelectedDoc(null);
  const handleModalClick = (e) => e.stopPropagation();
  const handleViewDocument = (doc) => setSelectedDoc(doc);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Upload Section */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Enter document name"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={!docName.trim() || !selectedFile}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload Document
        </button>
      </div>

      {/* Tenant Documents Section */}
      <h2 className="text-2xl font-bold mb-4">My Documents</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mb-8">
        <AnimatePresence>
          {tenantDocs.map((doc) => (
            <motion.div
              key={doc.id}
              className="relative group overflow-hidden rounded-xl shadow-md cursor-pointer bg-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={doc.url}
                alt={`${doc.name} uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                className="w-full h-40 object-cover rounded-t-xl"
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="text-white text-2xl hover:scale-110 transition"
                  aria-label={`View document ${doc.name}`}
                >
                  <FaEye />
                </button>
              </div>
              <div className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 text-center rounded-b-xl truncate">
                {doc.name}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Landlord Documents Section */}
      <h2 className="text-2xl font-bold mb-4">Landlord Documents</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mb-8">
        <AnimatePresence>
          {landlordDocs.map((doc) => (
            <motion.div
              key={doc.id}
              className="relative group overflow-hidden rounded-xl shadow-md cursor-pointer bg-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={doc.url}
                alt={`${doc.name} uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                className="w-full h-40 object-cover rounded-t-xl"
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="text-white text-2xl hover:scale-110 transition"
                  aria-label={`View document ${doc.name}`}
                >
                  <FaEye />
                </button>
              </div>
              <div className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 text-center rounded-b-xl truncate">
                {doc.name}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseModal}
          >
            <div className="relative max-w-4xl w-full" onClick={handleModalClick}>
              <img
                src={selectedDoc.url}
                alt={`${selectedDoc.name} uploaded on ${new Date(selectedDoc.uploadedAt).toLocaleDateString()}`}
                className="w-full rounded-lg max-h-[80vh] object-contain"
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
              {selectedDoc.source === "tenant" && (
                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
                  aria-label={`Delete document ${selectedDoc.name}`}
                >
                  <FaTrash />
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
                aria-label="Close document preview"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md text-gray-800 font-semibold text-center max-w-[90%] truncate">
                {selectedDoc.name} ({selectedDoc.source === "tenant" ? "My Document" : "Landlord Document"})
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}