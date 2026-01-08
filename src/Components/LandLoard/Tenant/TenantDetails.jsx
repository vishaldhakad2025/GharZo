import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaArrowLeft, FaTrash, FaEye } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TenantDetails = () => {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [tenantDocuments, setTenantDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [landlordId, setLandlordId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Fetch landlord-uploaded documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://api.gharzoreality.com/api/documents/landlord", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDocuments(
          response.data.documents.map((doc) => ({
            id: doc._id,
            name: doc.documentType,
            date: new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            visible: !!doc.isVisibleToTenants,
            raw: doc,
          }))
        );
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("fetchDocuments error:", error);
      toast.error("Failed to load documents.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  // Fetch tenant-uploaded documents for a given landlordId (pass id to avoid stale state)
  const fetchTenantDocuments = async (id) => {
    const usedId = id || landlordId;
    if (!usedId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const response = await axios.get(
        `https://api.gharzoreality.com/api/tenant-documents/landlord/${usedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && Array.isArray(response.data.documents)) {
        const documents = response.data.documents.map((doc) => {
          const filePath = doc.filePath || "";
          const url = filePath.startsWith("http")
            ? filePath
            : `https://api.gharzoreality.com${filePath.startsWith("/") ? "" : "/"}${filePath}`;

          return {
            id: doc._id,
            tenantId: doc.tenantId,
            name: doc.documentType || "Untitled Document",
            originalName: doc.originalName || "Unknown File",
            date: new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            visible: doc.isVisibleToLandlord ?? true,
            url: url,
            size: doc.size,
            mimeType: doc.mimeType,
            uploadedAt: doc.uploadedAt,
            raw: doc,
          };
        });

        setTenantDocuments(documents);
      } else {
        setTenantDocuments([]);
      }
    } catch (error) {
      console.error("fetchTenantDocuments error:", error);
      toast.error("Failed to load documents.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  // Helper: enrich accommodations and bookingRequests with property/room/bed names
  const enrichAccommodations = async (tenantData, token) => {
    let enrichedTenant = { ...tenantData };

    if (enrichedTenant.accommodations && enrichedTenant.accommodations.length > 0) {
      const enrichedAccom = await Promise.all(
        enrichedTenant.accommodations.map(async (acc) => {
          let propertyName = "N/A";
          let roomName = "N/A";
          let bedName = "N/A";

          try {
            const propRes = await axios.get(
              `https://api.gharzoreality.com/api/landlord/properties/${acc.propertyId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            propertyName = propRes.data.property?.name || "N/A";
          } catch (err) {}

          try {
            const roomRes = await axios.get(
              `https://api.gharzoreality.com/api/landlord/properties/${acc.propertyId}/rooms/${acc.roomId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            roomName = roomRes.data.room?.name || "N/A";
          } catch (err) {}

          try {
            if (acc.bedId) {
              const bedsRes = await axios.get(
                `https://api.gharzoreality.com/api/landlord/properties/${acc.propertyId}/rooms/${acc.roomId}/beds`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const matchingBed =
                bedsRes.data.beds?.find((b) => b.bedId === acc.bedId) ||
                bedsRes.data.beds?.find((b) => b.id === acc.bedId);
              bedName = matchingBed?.name || "N/A";
            }
          } catch (err) {}

          return {
            ...acc,
            propertyName,
            roomName,
            bedName,
          };
        })
      );
      enrichedTenant.accommodations = enrichedAccom;
    }

    if (enrichedTenant.bookingRequests && enrichedTenant.bookingRequests.length > 0) {
      const enrichedBookings = await Promise.all(
        enrichedTenant.bookingRequests.map(async (req) => {
          let propertyName = "N/A";
          let roomName = "N/A";
          let bedName = "N/A";

          try {
            const propRes = await axios.get(
              `https://api.gharzoreality.com/api/landlord/properties/${req.propertyId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            propertyName = propRes.data.property?.name || "N/A";
          } catch (err) {}

          try {
            const roomRes = await axios.get(
              `https://api.gharzoreality.com/api/landlord/properties/${req.propertyId}/rooms/${req.roomId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            roomName = roomRes.data.room?.name || "N/A";
          } catch (err) {}

          if (req.bedId) {
            try {
              const bedsRes = await axios.get(
                `https://api.gharzoreality.com/api/landlord/properties/${req.propertyId}/rooms/${req.roomId}/beds`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const matchingBed =
                bedsRes.data.beds?.find((b) => b.bedId === req.bedId) ||
                bedsRes.data.beds?.find((b) => b.id === req.bedId);
              bedName = matchingBed?.name || "N/A";
            } catch (err) {}
          }

          return {
            ...req,
            propertyName,
            roomName,
            bedName,
          };
        })
      );
      enrichedTenant.bookingRequests = enrichedBookings;
    }

    return enrichedTenant;
  };

  // Fetch tenant details and then documents
  useEffect(() => {
    const fetchTenantDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        let tenantData = response.data.tenant || response.data;
        if (!tenantData) throw new Error("No tenant data found");

        tenantData = await enrichAccommodations(tenantData, token);

        setTenant(tenantData);

        let extractedLandlordId =
          tenantData.accommodations?.[0]?.landlordId ||
          tenantData.landlordId ||
          response.data.landlordId ||
          null;

        setLandlordId(extractedLandlordId);

        await fetchDocuments();

        if (extractedLandlordId) {
          await fetchTenantDocuments(extractedLandlordId);
        }
      } catch (error) {
        console.error("fetchTenantDetails error:", error);
        toast.error(error.response?.data?.message || "Failed to load tenant details.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
        navigate("/landlord/tenant-list");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantDetails();
    } else {
      toast.error("Invalid tenant ID.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      navigate("/landlord/tenant-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, navigate]);

  const handleEditToggle = () => setIsEditing(!isEditing);
  const handleDeleteToggle = () => setIsDeleting(!isDeleting);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only JPEG, PNG, PDF, DOC files are allowed", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !documentName.trim() || !landlordId) {
      toast.error(
        !file
          ? "Please select a file first."
          : !documentName.trim()
          ? "Please enter a document name."
          : "Landlord information not available.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
      return;
    }

    const formData = new FormData();
    formData.append("landlordId", landlordId);
    formData.append("isVisibleToTenants", isVisible);
    formData.append("document", file);
    formData.append("documentType", documentName);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("https://api.gharzoreality.com/api/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      if (response.data.success) {
        await fetchDocuments();
        await fetchTenantDocuments(landlordId);

        toast.success("Document uploaded successfully.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setFile(null);
        setDocumentName("");
        setIsVisible(true);
        setUploadProgress(0);

        if (e.target) e.target.reset?.();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("handleUpload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`https://api.gharzoreality.com/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        await fetchTenantDocuments(landlordId);

        toast.success("Document deleted successfully.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete document");
      }
    } catch (error) {
      console.error("handleDelete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete document.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  const handleViewTenantDocument = (url) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Document URL not available.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  // Delete tenant modal form component
  const DeleteTenantForm = ({ tenantId, onCancel, tenant, navigate }) => {
    let firstBooking = tenant.bookingRequests?.[0] || tenant.bills?.[0] || tenant.accommodations?.[0] || {};
    const [formData, setFormData] = useState({
      propertyId: firstBooking.propertyId || "",
      roomId: firstBooking.roomId || "",
      bedId: firstBooking.bedId || "",
      moveOutDate: "",
    });

    const [missingData, setMissingData] = useState(!formData.propertyId || !formData.roomId);

    const today = new Date().toISOString().split("T")[0];

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        setMissingData(!updated.propertyId || !updated.roomId);
        return updated;
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `https://api.gharzoreality.com/api/landlord/tenant/remove`,
          { tenantId, ...formData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Tenant deleted successfully.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setTimeout(() => {
          navigate("/landlord/tenant-list");
        }, 1200);
      } catch (error) {
        console.error("DeleteTenantForm submit error:", error);
        toast.error(error.response?.data?.message || "Failed to delete tenant.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-orange-300 mb-6 text-center">Delete Tenant</h2>
          {missingData && (
            <p className="text-red-400 text-center mb-4 text-sm">
              Some accommodation details are missing. Please verify or enter manually.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-200 mb-2">Move Out Date *</label>
              <input
                type="date"
                name="moveOutDate"
                value={formData.moveOutDate}
                onChange={handleChange}
                min={today}
                className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                required
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-8 py-3 bg-red-600/80 text-white font-semibold rounded-xl hover:bg-red-500 transition"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 bg-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit tenant form component
  const EditTenantForm = ({ tenant, onCancel }) => {
    const [formData, setFormData] = useState({
      name: tenant.name || "",
      email: tenant.email || "",
      mobile: tenant.mobile || "",
      aadhaar: tenant.aadhaar || "",
      dob: tenant.dob?.split("T")[0] || "",
      work: tenant.work || "",
      moveInDate: tenant.moveInDate?.split("T")[0] || "",
      moveOutDate: tenant.moveOutDate?.split("T")[0] || "",
      fatherName: tenant.fatherName || "",
      fatherMobile: tenant.fatherMobile || "",
      motherName: tenant.motherName || "",
      motherMobile: tenant.motherMobile || "",
      permanentAddress: tenant.permanentAddress || "",
      maritalStatus: tenant.maritalStatus || "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        await axios.put(`https://api.gharzoreality.com/api/landlord/tenant/${tenantId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Tenant updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setTenant({ ...tenant, ...formData });
        setIsEditing(false);
      } catch (error) {
        console.error("EditTenantForm submit error:", error);
        toast.error(error.response?.data?.message || "Failed to update tenant.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      }
    };

    return (
      <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-orange-300 mb-8 text-center">Edit Tenant Details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Mobile *</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Aadhaar</label>
            <input
              type="text"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Work</label>
            <input
              type="text"
              name="work"
              value={formData.work}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Father's Mobile</label>
            <input
              type="tel"
              name="fatherMobile"
              value={formData.fatherMobile}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Mother's Mobile</label>
            <input
              type="tel"
              name="motherMobile"
              value={formData.motherMobile}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-base font-medium text-gray-200 mb-2">Permanent Address</label>
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              rows={3}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-200 mb-2">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              <option value="">Select</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-center gap-6 mt-6">
            <button
              type="submit"
              className="px-10 py-3 bg-orange-600/80 text-white font-semibold rounded-xl hover:bg-orange-500 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-10 py-3 bg-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/20 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-6 border-orange-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
        }}
      >
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-6">No tenant details found.</p>
          <button
            onClick={() => navigate("/landlord/tenant-list")}
            className="px-8 py-3 bg-orange-600/80 text-white font-semibold rounded-xl hover:bg-orange-500 transition shadow-xl flex items-center gap-3 mx-auto"
          >
            <FaArrowLeft className="text-xl" />
            Back to Tenant List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 text-gray-100"
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
      }}
    >
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/landlord/tenant-list")}
          className="mb-6 flex items-center gap-3 text-gray-300 hover:text-orange-300 transition text-base"
        >
          <FaArrowLeft className="text-xl" />
          Back to Tenant List
        </button>

        {isEditing ? (
          <EditTenantForm tenant={tenant} onCancel={() => setIsEditing(false)} />
        ) : isDeleting ? (
          <DeleteTenantForm tenantId={tenantId} onCancel={() => setIsDeleting(false)} tenant={tenant} navigate={navigate} />
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            {/* Profile Section */}
            <div className="flex flex-col items-center mb-10">
              {tenant.photo ? (
                <img
                  src={tenant.photo}
                  alt="Tenant"
                  className="w-32 h-32 rounded-full object-cover shadow-xl border-6 border-white/30"
                />
              ) : (
                <div className="w-32 h-32 bg-orange-600/80 rounded-full flex items-center justify-center text-5xl text-white shadow-xl">
                  <FaUser />
                </div>
              )}
              <h2 className="text-3xl font-bold mt-6 text-orange-300">
                {tenant.name || "N/A"}
              </h2>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base">
              <div className="space-y-4">
                <p><strong className="text-orange-300">Email:</strong> <span className="text-gray-300">{tenant.email || "N/A"}</span></p>
                <p><strong className="text-orange-300">Mobile:</strong> <span className="text-gray-300">{tenant.mobile || "N/A"}</span></p>
                <p><strong className="text-orange-300">Aadhaar:</strong> <span className="text-gray-300">{tenant.aadhaar || "N/A"}</span></p>
                <p><strong className="text-orange-300">Work:</strong> <span className="text-gray-300">{tenant.work || "N/A"}</span></p>
                <p><strong className="text-orange-300">DOB:</strong> <span className="text-gray-300">
                  {tenant.dob
                    ? new Date(tenant.dob).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </span></p>
                <p><strong className="text-orange-300">Marital Status:</strong> <span className="text-gray-300">{tenant.maritalStatus || "N/A"}</span></p>
              </div>
              <div className="space-y-4">
                <p><strong className="text-orange-300">Father:</strong> <span className="text-gray-300">{tenant.fatherName || "N/A"} - {tenant.fatherMobile || "N/A"}</span></p>
                <p><strong className="text-orange-300">Mother:</strong> <span className="text-gray-300">{tenant.motherName || "N/A"} - {tenant.motherMobile || "N/A"}</span></p>
                <p><strong className="text-orange-300">Address:</strong> <span className="text-gray-300">{tenant.permanentAddress || "N/A"}</span></p>
                <p><strong className="text-orange-300">Joined:</strong> <span className="text-gray-300">
                  {tenant.createdAt
                    ? new Date(tenant.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </span></p>
                <p><strong className="text-orange-300">Accommodation:</strong> <span className="text-gray-300">
                  {tenant.bookingRequests?.length > 0
                    ? tenant.bookingRequests.map((req, index) => (
                        <span key={index}>
                          {req.propertyName || req.propertyId || "N/A"} → Room {req.roomName || req.roomId || "N/A"}
                          {req.bedId ? ` → Bed ${req.bedName || req.bedId || "N/A"}` : ""}
                          {index < tenant.bookingRequests.length - 1 ? "; " : ""}
                        </span>
                      ))
                    : tenant.accommodations?.length > 0
                    ? tenant.accommodations.map((acc, index) => (
                        <span key={index}>
                          {acc.propertyName || acc.propertyId || "N/A"} → Room {acc.roomName || acc.roomId || "N/A"}
                          {acc.bedId ? ` → Bed ${acc.bedName || acc.bedId || "N/A"}` : ""}
                          {index < tenant.accommodations.length - 1 ? "; " : ""}
                        </span>
                      ))
                    : "N/A"}
                </span></p>
              </div>
            </div>

            {/* Bills Section - Compact */}
            {tenant.bills?.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-orange-300 mb-6">Bills History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tenant.bills.map((bill, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20">
                      <p><strong>Type:</strong> {bill.type || "N/A"}</p>
                      <p><strong>Property:</strong> {bill.propertyName || bill.propertyId || "N/A"}</p>
                      <p><strong>Amount:</strong> ₹{bill.amount || "N/A"}</p>
                      <p><strong>Due:</strong> {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-GB") : "N/A"}</p>
                      <p><strong>Status:</strong> <span className={bill.paid ? "text-teal-400" : "text-red-400"}>{bill.paid ? "Paid" : "Pending"}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Upload Section - Compact */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-orange-300 mb-6">Upload Document</h3>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-200 mb-2">Document Name *</label>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                      required
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-200 mb-2">Select File *</label>
                    <input
                      type="file"
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                      className="block w-full text-base text-gray-300 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-orange-600/80 file:text-white hover:file:bg-orange-500"
                      disabled={isUploading}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="w-5 h-5 text-orange-500 rounded"
                      disabled={isUploading}
                    />
                    <label className="text-base text-gray-300">Visible to tenant</label>
                  </div>
                  {isUploading && (
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      <p className="text-center mt-2">{uploadProgress}%</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3 bg-orange-600/80 text-white font-semibold rounded-xl hover:bg-orange-500 disabled:opacity-60 transition"
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </button>
                </form>
              </div>
            </div>

            {/* Landlord & Tenant Documents - Compact */}
            <div className="mt-12 space-y-12">
              <div>
                <h3 className="text-2xl font-bold text-orange-300 mb-6">Landlord Documents</h3>
                {documents.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-white">{doc.name}</p>
                          <p className="text-gray-400 text-sm">{doc.date}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const filePath = doc.raw?.filePath || "";
                              const url = filePath.startsWith("http") ? filePath : `https://api.gharzoreality.com${filePath}`;
                              if (filePath) window.open(url, "_blank");
                            }}
                            className="p-3 bg-orange-600/80 rounded-lg hover:bg-orange-500 transition"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          <button onClick={() => handleDelete(doc.id)} className="p-3 bg-red-600/80 rounded-lg hover:bg-red-500 transition">
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-orange-300 mb-6">Tenant Uploaded Documents</h3>
                {tenantDocuments.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No documents uploaded by tenant.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tenantDocuments.map((doc) => (
                      <div key={doc.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-white">{doc.name}</p>
                          <p className="text-gray-400 text-sm">{doc.date}</p>
                        </div>
                        <button
                          onClick={() => handleViewTenantDocument(doc.url)}
                          className="p-3 bg-orange-600/80 rounded-lg hover:bg-orange-500 transition"
                        >
                          <FaEye className="text-lg" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="mt-12 flex justify-center gap-8">
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 bg-orange-600/80 text-white font-semibold rounded-xl hover:bg-orange-500 transition shadow-xl flex items-center gap-3"
              >
                <FaEdit className="text-lg" />
                Edit Tenant
              </button>
              <button
                onClick={() => setIsDeleting(true)}
                className="px-8 py-3 bg-red-600/80 text-white font-semibold rounded-xl hover:bg-red-500 transition shadow-xl flex items-center gap-3"
              >
                <FaTrash className="text-lg" />
                Delete Tenant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDetails;