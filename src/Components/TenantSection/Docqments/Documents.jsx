import React, { useState, useEffect, useRef } from "react";
import { FaEye,FaFileAlt,FaUpload,FaFileSignature,FaFileUpload ,FaInfoCircle ,FaUser ,FaFile ,FaBuilding ,FaDownload ,FaArrowRight ,FaCalendarAlt ,FaClock , FaTrash } from "react-icons/fa";
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
  <div className="max-w-7xl mx-auto px-4 bg-white sm:px-6 lg:px-8 py-8">
    {/* Enhanced Header */}
    <div className="mb-12">
      <div className="flex items-center shadow px-5 py-3 rounded justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <FaFileAlt className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 py-1 to-blue-800 bg-clip-text text-transparent">
              Document Manager
            </h1>
            <p className="text-gray-600 mt-2">Upload, view, and manage all your important documents</p>
          </div>
        </div>
      </div>
    </div>

    {/* Enhanced Upload Section */}
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden  rounded-3xl bg-gradient-to-br from-white to-blue-50 shadow-2xl border border-blue-100 p-8"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full -translate-y-20 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/20 to-indigo-100/10 rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
              <FaUpload className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upload New Document</h2>
              <p className="text-gray-600">Add important files to your collection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <FaFileSignature className="text-blue-500" />
                  Document Name
                </span>
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                <input
                  type="text"
                  placeholder="Enter a descriptive name..."
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="relative w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <FaFileUpload className="text-purple-500" />
                  Select File
                </span>
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full p-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <FaFile className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FaInfoCircle className="text-blue-400" />
              Supports JPG, PNG, PDF, DOC, XLS (Max 10MB)
            </div>
            <motion.button
              onClick={handleUpload}
              disabled={!docName.trim() || !selectedFile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                !docName.trim() || !selectedFile
                  ? "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed text-gray-700"
                  : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white hover:shadow-xl"
              }`}
            >
              <span className="flex items-center gap-2">
                <FaUpload className="text-white" />
                Upload Document
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Enhanced Tenant Documents Section */}
    <div className="mb-12">
      <div className="flex items-center shadow py-3 px-5 rounded  justify-between mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                My Documents
              </h2>
              <p className="text-gray-600">Documents you have uploaded</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold shadow-sm">
            {tenantDocs.length} documents
          </span>
        </div>
      </div>

      {tenantDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {tenantDocs.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6 }}
                className="group relative"
              >
                {/* Card Background Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Document Preview */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                    {doc.type === 'application/pdf' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <FaFilePdf className="w-16 h-16 text-red-500 opacity-50" />
                          <span className="text-sm font-medium text-red-600 mt-2">PDF Document</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                      />
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDocument(doc)}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        aria-label={`View ${doc.name}`}
                      >
                        <FaEye className="text-indigo-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(doc)}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        aria-label={`Download ${doc.name}`}
                      >
                        <FaDownload className="text-green-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(doc.id)}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        aria-label={`Delete ${doc.name}`}
                      >
                        <FaTrash className="text-red-600" />
                      </motion.button>
                    </div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                        {doc.type?.split('/')[1]?.toUpperCase() || 'DOC'}
                      </span>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {doc.name}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaArrowRight className="text-gray-400 group-hover:text-indigo-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="text-gray-400" />
                        <span>{new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border-2 border-dashed border-indigo-200">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
            <FaFile className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Documents Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-5">
            Upload your first document to get started. Your uploaded files will appear here.
          </p>
        </div>
      )}
    </div>

    {/* Enhanced Landlord Documents Section */}
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
              <FaBuilding className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 via-emerald-700 to-green-700 bg-clip-text text-transparent">
                Landlord Documents
              </h2>
              <p className="text-gray-600">Important documents shared by your landlord</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full text-sm font-semibold shadow-sm">
            {landlordDocs.length} documents
          </span>
        </div>
      </div>

      {landlordDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {landlordDocs.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6 }}
                className="group relative"
              >
                {/* Card Background Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Document Preview */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50">
                    {doc.type === 'application/pdf' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <FaFilePdf className="w-16 h-16 text-red-500 opacity-50" />
                          <span className="text-sm font-medium text-red-600 mt-2">PDF Document</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                      />
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDocument(doc)}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        aria-label={`View ${doc.name}`}
                      >
                        <FaEye className="text-teal-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(doc)}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        aria-label={`Download ${doc.name}`}
                      >
                        <FaDownload className="text-green-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(doc)}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        aria-label={`Share ${doc.name}`}
                      >
                        <FaShareAlt className="text-blue-600" />
                      </motion.button>
                    </div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                        {doc.type?.split('/')[1]?.toUpperCase() || 'DOC'}
                      </span>
                    </div>
                    
                    {/* Official Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        OFFICIAL
                      </span>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                        {doc.name}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaArrowRight className="text-gray-400 group-hover:text-teal-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUserTie className="text-gray-400" />
                        <span>Shared by Landlord</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-2xl border-2 border-dashed border-teal-200">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 flex items-center justify-center">
            <FaFileAlt className="w-12 h-12 text-teal-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Landlord Documents</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-5">
            Your landlord hasn't shared any documents yet. Check back later for important updates.
          </p>
        </div>
      )}
    </div>

    {/* Enhanced Document Preview Modal */}
    <AnimatePresence>
      {selectedDoc && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${selectedDoc.source === 'tenant' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'} shadow-md`}>
                    <FaFile className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedDoc.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDoc.source === 'tenant' 
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
                          : 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700'
                      }`}>
                        {selectedDoc.source === 'tenant' ? 'My Document' : 'Landlord Document'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Uploaded {new Date(selectedDoc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(selectedDoc)}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all shadow-sm"
                    aria-label="Download document"
                  >
                    <FaDownload />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseModal}
                    className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
                    aria-label="Close preview"
                  >
                    <FaTimes />
                  </motion.button>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                {selectedDoc.type === 'application/pdf' ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-32 h-32 mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-center">
                      <FaFilePdf className="w-20 h-20 text-red-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-5">This PDF document needs to be downloaded to view</p>
                    <button
                      onClick={() => handleDownload(selectedDoc)}
                      className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold flex items-center gap-3"
                    >
                      <FaDownload />
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <img
                    src={selectedDoc.url}
                    alt={selectedDoc.name}
                    className="w-full h-auto rounded-xl shadow-lg max-h-[60vh] object-contain mx-auto"
                    onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                  />
                )}
              </div>

              {/* Modal Footer */}
              {selectedDoc.source === "tenant" && (
                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-red-50/50 to-rose-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Delete this document</p>
                        <p className="text-sm text-gray-600">This action cannot be undone</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                    >
                      <FaTrash />
                      Delete Document
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
);
}
