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

    // API success check
    if (response.data.success && Array.isArray(response.data.documents)) {
      const documents = response.data.documents.map((doc) => {
        // Safe URL building – filePath starts with "/"
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
          raw: doc, // full object for debugging or future use
        };
      });

      setTenantDocuments(documents);
    } else {
      setTenantDocuments([]);
    }
  } catch (error) {
    console.error("fetchTenantDocuments error:", error);

    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Session expired. Please login again.");
        // Optional: redirect to login
      } else if (error.response.status === 404) {
        setTenantDocuments([]);
        // toast.info("No documents found.");
      } else {
        toast.error("Failed to load tenant documents.");
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("Something went wrong.");
    }

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

    // Enrich accommodations
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

    // Enrich bookingRequests
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

        // Enrich with property/room/bed names
        tenantData = await enrichAccommodations(tenantData, token);

        setTenant(tenantData);

        // Determine landlordId from tenant data safely
        let extractedLandlordId =
          tenantData.accommodations?.[0]?.landlordId ||
          tenantData.landlordId ||
          response.data.landlordId ||
          null;

        // Set landlordId (for UI/state) and fetch documents using the extracted id directly
        setLandlordId(extractedLandlordId);

        // First fetch landlord documents list (for upload/delete list)
        await fetchDocuments();

        // Then fetch tenant documents for this landlord id (pass id to avoid stale state)
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
        // refresh lists
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

        // reset file input visually (if you want)
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
        // also refresh tenant documents just in case
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
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Delete Tenant</h2>
          {missingData && (
            <p className="text-red-500 text-sm mb-4">
              Some accommodation details are missing. Please verify or enter manually.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Move Out Date</label>
              <input
                type="date"
                name="moveOutDate"
                value={formData.moveOutDate}
                onChange={handleChange}
                min={today}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                required
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
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
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Tenant</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-In Date</label>
            <input
              type="date"
              name="moveInDate"
              value={formData.moveInDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-Out Date</label>
            <input
              type="date"
              name="moveOutDate"
              value={formData.moveOutDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar</label>
            <input
              type="text"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work</label>
            <input
              type="text"
              name="work"
              value={formData.work}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father's Mobile</label>
            <input
              type="tel"
              name="fatherMobile"
              value={formData.fatherMobile}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother's Mobile</label>
            <input
              type="tel"
              name="motherMobile"
              value={formData.motherMobile}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
            <input
              type="text"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            >
              <option value="">Select</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-4 justify-end mt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">No tenant details found.</p>
          <button
            onClick={() => navigate("/landlord/tenant-list")}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" /> Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/landlord/tenant-list")}
          className="mb-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Tenant List
        </button>
        {isEditing ? (
          <EditTenantForm tenant={tenant} onCancel={handleEditToggle} />
        ) : isDeleting ? (
          <DeleteTenantForm tenantId={tenantId} onCancel={handleDeleteToggle} tenant={tenant} navigate={navigate} />
        ) : (
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="flex flex-col items-center">
              {tenant.photo ? (
                <img
                  src={tenant.photo}
                  alt="Tenant"
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-indigo-100"
                />
              ) : (
                <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg">
                  <FaUser />
                </div>
              )}
              <h2 className="text-3xl font-bold mt-4 text-gray-800">{tenant.name || "N/A"}</h2>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
              <div className="space-y-4">
                <p>
                  <strong>Email:</strong> {tenant.email || "N/A"}
                </p>
                <p>
                  <strong>Aadhaar:</strong> {tenant.aadhaar || "N/A"}
                </p>
                <p>
                  <strong>Work:</strong> {tenant.work || "N/A"}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {tenant.dob
                    ? new Date(tenant.dob).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p>
                  <strong>Marital Status:</strong> {tenant.maritalStatus || "N/A"}
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  <strong>Father:</strong> {tenant.fatherName || "N/A"} - {tenant.fatherMobile || "N/A"}
                </p>
                <p>
                  <strong>Mother:</strong> {tenant.motherName || "N/A"} - {tenant.motherMobile || "N/A"}
                </p>
                <p>
                  <strong>Permanent Address:</strong> {tenant.permanentAddress || "N/A"}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {tenant.createdAt
                    ? new Date(tenant.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p>
                  <strong>Accommodations:</strong>{" "}
                  {tenant.bookingRequests?.length > 0
                    ? tenant.bookingRequests.map((req, index) => (
                        <span key={index}>
                          Property: {req.propertyName || req.propertyId || "N/A"}, Room: {req.roomName || req.roomId || "N/A"}
                          {req.bedId ? `, Bed: ${req.bedName || req.bedId || "N/A"}` : ""}
                          {index < tenant.bookingRequests.length - 1 ? "; " : ""}
                        </span>
                      ))
                    : tenant.accommodations?.length > 0
                    ? tenant.accommodations.map((acc, index) => (
                        <span key={index}>
                          Property: {acc.propertyName || acc.propertyId || "N/A"}, Room: {acc.roomName || acc.roomId || "N/A"}
                          {acc.bedId ? `, Bed: ${acc.bedName || acc.bedId || "N/A"}` : ""}
                          {index < tenant.accommodations.length - 1 ? "; " : ""}
                        </span>
                      ))
                    : "N/A"}
                </p>
              </div>
            </div>

            {tenant.bills?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Bills</h3>
                <div className="space-y-4">
                  {tenant.bills.map((bill, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <p>
                        <strong>Bill Type:</strong> {bill.type || "N/A"}
                      </p>
                      <p>
                        <strong>Property:</strong> {bill.propertyName || "N/A"} (ID: {bill.propertyId || "N/A"})
                      </p>
                      <p>
                        <strong>Room ID:</strong> {bill.roomId || "N/A"}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{bill.amount || "N/A"}
                      </p>
                      <p>
                        <strong>Due Date:</strong>{" "}
                        {bill.dueDate
                          ? new Date(bill.dueDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Paid:</strong> {bill.paid ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Description:</strong> {bill.description || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📄 Upload New Document</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Document Name</label>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                      placeholder="Enter document name"
                      required
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select File</label>
                    <input
                      type="file"
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                      disabled={isUploading}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      disabled={isUploading}
                    />
                    <span className="text-sm text-gray-700">Visible to Tenants?</span>
                  </div>
                  {isUploading && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{uploadProgress}%</div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </button>
                </form>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">📑 Landlord Uploaded Documents</h3>
              {documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet.</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border text-sm font-medium text-gray-700">Name</th>
                      <th className="p-3 border text-sm font-medium text-gray-700">Date</th>
                      <th className="p-3 border text-sm font-medium text-gray-700">Visible</th>
                      <th className="p-3 border text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="p-3 border text-sm">{doc.name}</td>
                        <td className="p-3 border text-sm">{doc.date}</td>
                        <td className="p-3 border text-sm">{doc.visible ? "Yes" : "No"}</td>
                        <td className="p-3 border flex space-x-3">
                          <button
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={() => {
                              // If landlord doc has a path, open it
                              const filePath = doc.raw?.filePath || "";
                              const url = filePath.startsWith("http") ? filePath : `https://api.gharzoreality.com${filePath}`;
                              if (filePath) window.open(url, "_blank");
                              else toast.error("File URL not available.");
                            }}
                          >
                            <FaEye />
                          </button>
                          <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(doc.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-8">📑 Tenant Uploaded Documents</h3>
              {tenantDocuments.length === 0 ? (
                <p className="text-gray-500">No documents uploaded by the tenant.</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border text-sm font-medium text-gray-700">Name</th>
                      <th className="p-3 border text-sm font-medium text-gray-700">Date</th>
                      <th className="p-3 border text-sm font-medium text-gray-700">Visible</th>
                      <th className="p-3 border text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="p-3 border text-sm">{doc.name}</td>
                        <td className="p-3 border text-sm">{doc.date}</td>
                        <td className="p-3 border text-sm">{doc.visible ? "Yes" : "No"}</td>
                        <td className="p-3 border flex space-x-3">
                          <button onClick={() => handleViewTenantDocument(doc.url)} className="text-indigo-600 hover:text-indigo-800">
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={handleEditToggle}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
              <button
                onClick={handleDeleteToggle}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDetails;
