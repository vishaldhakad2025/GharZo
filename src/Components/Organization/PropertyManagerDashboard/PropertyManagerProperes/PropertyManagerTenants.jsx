import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Global Axios Interceptor to handle HTML responses (like login page)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.trim().startsWith("<")
    ) {
      return Promise.reject(
        new Error("Invalid response from server. Please login again.")
      );
    }
    return Promise.reject(error);
  }
);

const PropertyManagerTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [propertyId, setPropertyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch Tenants
  const fetchTenants = async () => {
    if (!token) {
      toast.error("Please log in to continue.", { theme: "colored" });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.gharzoreality.com/api/pm/tenants",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const tenantData =
        response.data.tenants || response.data.data || response.data || [];
      if (!Array.isArray(tenantData)) {
        throw new Error("Invalid tenant data format");
      }
    let propertyId = null;
    if (tenantData.length > 0 && tenantData[0].accommodations?.length > 0) {
      propertyId = tenantData[0].accommodations[0].propertyId;
    }
      setPropertyId(propertyId);
      setTenants(tenantData);
      setFilteredTenants(tenantData);

      if (tenantData.length === 0) {
        toast.info("No tenants found.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      const msg = error.message.includes("Invalid response")
        ? "Session expired. Please login again."
        : error.response?.data?.message || "Failed to load tenants.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      if (msg.includes("Session")) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Search
  const handleSearch = (e) => {
    if (loading) return;
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = tenants.filter(
      (tenant) =>
        tenant.name?.toLowerCase().includes(value) ||
        tenant.mobile?.includes(value) ||
        tenant.email?.toLowerCase().includes(value)
    );
    setFilteredTenants(filtered);
  };

  // View Details
const viewDetails = (propertyId, tenantId) => {
  console.log("VIEW PROPERTY ID:", propertyId);

  if (!propertyId) {
    toast.error("Invalid property ID.", { theme: "colored" });
    return;
  }

  // ✅ Correct usage
  navigate(`/property-manager/tenant-details/${propertyId}/${tenantId}`);
};

  // Add Tenant
  const addNewTenant = () => {
    navigate("/landlord/add-tenant");
  };

  // === FINAL ROBUST DELETE FUNCTION (Same as first component) ===
  const deleteTenant = async (tenantId) => {
    if (!tenantId) {
      toast.error("Invalid tenant ID.", { theme: "colored" });
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to remove this tenant from the property?\nThis action cannot be undone."
    );
    if (!confirmDelete) return;

    if (!token) {
      toast.error("Authentication missing. Please login again.", { theme: "colored" });
      navigate("/login");
      return;
    }

    setDeletingId(tenantId);

    try {
      // Find tenant to get propertyId
      const tenant = tenants.find((t) => (t.tenantId || t.id) === tenantId);
      if (!tenant?.accommodations?.[0]?.propertyId) {
        throw new Error("Property ID not found for this tenant.");
      }

      const propertyId = tenant.accommodations[0].propertyId;
      const moveOutDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const payload = { tenantId, propertyId, moveOutDate };

      console.log("DELETE TENANT PAYLOAD:", payload);

      const response = await axios.post(
        "https://api.gharzoreality.com/api/pm/tenants/remove",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // SUCCESS
      const updatedTenants = tenants.filter((t) => (t.tenantId || t.id) !== tenantId);
      setTenants(updatedTenants);
      setFilteredTenants(updatedTenants);

      toast.success(response.data.message || "Tenant removed successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      console.log("DELETE SUCCESS:", response.data);
    } catch (error) {
      console.error("DELETE ERROR:", error);
      const msg = error.message.includes("Invalid response")
        ? "Session expired. Please login again."
        : error.response?.data?.message || "Failed to remove tenant.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      if (msg.includes("Session")) navigate("/login");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-20 py-10 bg-gray-100 min-h-screen flex flex-col">
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

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-700">
          Tenant List
        </h2>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800 text-base"
          placeholder="Search by name, mobile, or email"
          value={searchTerm}
          onChange={handleSearch}
          disabled={loading}
        />
        <FaSearch className="absolute top-3.5 left-3 text-gray-500" />
      </div>

      {/* Tenant List */}
      <div className="flex-grow">
        {loading ? (
          <div className="text-center text-gray-600 flex items-center justify-center py-10">
            <FaSpinner className="animate-spin mr-2" /> Loading tenants...
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <p className="text-lg mb-4">No tenants found.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addNewTenant}
              className="flex items-center gap-2 mx-auto text-white px-6 py-3 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 transition-colors"
            >
              <FaPlus className="text-lg" />
              <span>Add Your First Tenant</span>
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTenants.map((tenant, index) => {
              const tenantId = tenant.tenantId || tenant.id;
              const isDeleting = deletingId === tenantId;

              return (
                <motion.div
                  key={tenantId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="text-xl font-semibold text-indigo-700 mb-3">
                      {tenant.name || "Unnamed Tenant"}
                    </h5>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Mobile:</strong> {tenant.mobile || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Email:</strong> {tenant.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Work:</strong> {tenant.work || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Address:</strong>{" "}
                      {tenant.permanentAddress || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>DOB:</strong>{" "}
                      {tenant.dob
                        ? new Date(tenant.dob).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Marital Status:</strong>{" "}
                      {tenant.maritalStatus || "N/A"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => viewDetails(propertyId, tenantId)}
                      disabled={isDeleting}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      View Details
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteTenant(tenantId)}
                      disabled={isDeleting}
                      className={`p-2 rounded-lg text-white transition-all ${
                        isDeleting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                      title="Remove Tenant"
                    >
                      {isDeleting ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-10 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 transition-colors"
        >
          <FaArrowLeft className="text-lg" />
          <span className="hidden sm:inline">Back</span>
        </motion.button>
      </div>
    </div>
  );
};

export default PropertyManagerTenants;