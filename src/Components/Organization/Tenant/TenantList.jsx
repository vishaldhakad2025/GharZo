import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrganizationTenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("orgToken");

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.gharzoreality.com/api/landlord/tenant",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tenantData =
        response.data.tenants || response.data.data || response.data || [];
      if (!Array.isArray(tenantData)) {
        throw new Error("Invalid tenant data format");
      }
      setTenants(tenantData);
      setFilteredTenants(tenantData);
      if (tenantData.length === 0) {
        toast.warn("No tenants found for this landlord.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch tenants. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSearch = (e) => {
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

  const viewDetails = (tenantId) => {
    if (!tenantId) {
      toast.error("Invalid tenant ID.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    navigate(`/organization/tenant-details/${tenantId}`);
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
        />
        <FaSearch className="absolute top-3.5 left-3 text-gray-500" />
      </div>

      {/* Tenant List */}
      <div className="flex-grow">
        {loading ? (
          <div className="text-center text-gray-600 flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" /> Loading tenants...
          </div>
        ) : filteredTenants.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No tenants found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTenants.map((tenant, index) => (
              <motion.div
                key={tenant.tenantId || tenant.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                    <strong>Address:</strong> {tenant.permanentAddress || "N/A"}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white px-4 py-2 rounded-lg  transition-colors"
                  onClick={() => viewDetails(tenant.tenantId || tenant.id)}
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button (Bottom) */}
      <div className="mt-10 flex justify-center">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate("/organization")}  // ← Ye change kar diya
    className="flex items-center gap-2 text-white px-6 py-3 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 transition-colors"
  >
    <FaArrowLeft className="text-lg" />
    <span className="hidden sm:inline">Back</span>
  </motion.button>
</div>
    </div>
  );
};

export default OrganizationTenantList;