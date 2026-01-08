import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaSpinner, FaArrowLeft, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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

      console.log("Full API Response:", response.data);
      console.log("Token used:", token);

      const tenantData =
        response.data.tenants || response.data.data || response.data || [];
      if (!Array.isArray(tenantData)) {
        throw new Error("Invalid tenant data format");
      }
      console.log("Processed Tenants:", tenantData);

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
      console.error("Fetch Error:", error);
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

  const viewDetails = (tenantId) => {
    if (!tenantId) {
      toast.error("Invalid tenant ID.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    navigate(`/landlord/tenant-details/${tenantId}`);
    console.log("Navigating to tenant:", tenantId);
  };

  const addNewTenant = () => {
    navigate("/landlord/add-tenant");
  };

  return (
    <div
      className="min-h-screen py-8 px-4 text-gray-100 lg:ml-20"
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
      }}
    >
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-extrabold text-orange-300 drop-shadow-2xl">
            Tenant List
          </h2>
          <p className="text-gray-300 mt-3 text-lg">
            Manage and view all your registered tenants
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-10 max-w-2xl mx-auto"
        >
          <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl text-orange-400" />
          <input
            type="text"
            className="w-full pl-16 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition shadow-xl"
            placeholder="Search by name, mobile, or email..."
            value={searchTerm}
            onChange={handleSearch}
            disabled={loading}
          />
        </motion.div>

        {/* Tenant Grid */}
        <div className="min-h-[60vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-6xl text-orange-400 mb-6" />
              <p className="text-2xl text-gray-300">Loading tenants...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl inline-block mb-8">
                <p className="text-3xl font-bold text-gray-300 mb-4">
                  No tenants found
                </p>
                <p className="text-gray-400 mb-8">
                  {searchTerm ? "Try adjusting your search" : "Start by adding your first tenant"}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNewTenant}
                className="flex items-center gap-4 mx-auto px-10 py-5 bg-orange-600/80 text-white text-xl font-bold rounded-2xl shadow-2xl hover:bg-orange-500 transition backdrop-blur-sm"
              >
                <FaPlus className="text-2xl" />
                Add Your First Tenant
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredTenants.map((tenant, index) => (
                <motion.div
                  key={tenant.tenantId || tenant.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col justify-between hover:shadow-orange-500/30 transition-all duration-500"
                >
                  <div>
                    <h5 className="text-2xl font-bold text-orange-300 mb-4 truncate">
                      {tenant.name || "Unnamed Tenant"}
                    </h5>
                    <div className="space-y-3 text-gray-300">
                      <p className="text-sm">
                        <strong>Mobile:</strong> {tenant.mobile || "N/A"}
                      </p>
                      <p className="text-sm truncate">
                        <strong>Email:</strong> {tenant.email || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Work:</strong> {tenant.work || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>DOB:</strong>{" "}
                        {tenant.dob
                          ? new Date(tenant.dob).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong>{" "}
                        <span className="capitalize text-orange-400">
                          {tenant.maritalStatus || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 w-full bg-orange-600/80 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition shadow-xl backdrop-blur-sm"
                    onClick={() => viewDetails(tenant.tenantId || tenant.id)}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-16 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/landlord")}
            className="flex items-center gap-4 px-10 py-5 bg-white/10 backdrop-blur-xl text-white text-xl font-bold rounded-2xl border border-white/30 hover:bg-white/20 transition shadow-2xl"
          >
            <FaArrowLeft className="text-2xl" />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TenantList;