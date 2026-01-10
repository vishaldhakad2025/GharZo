import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaHome,
  FaCalendar,
  FaRupeeSign,
  FaShieldAlt,
  FaTimes,
  FaSpinner,
  FaImage,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instaUser from "../../../../assets/Images/instaUser.jpg";
import baseurl from "../../../../../BaseUrl";

// Brand colors
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";

const TenantList = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, [propertyId]);

  const fetchTenants = async () => {
    if (!propertyId) {
      toast.error("Property ID is required.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        return;
      }

      const response = await axios.get(
        `${baseurl}api/sub-owner/properties/${propertyId}/tenants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to fetch tenants.");
    } finally {
      setLoading(false);
    }
  };

  const handleTenantClick = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      ...tenant,
      joinDate: tenant.joinDate
        ? new Date(tenant.joinDate).toISOString().split("T")[0]
        : "",
      moveInDate: tenant.moveInDate
        ? new Date(tenant.moveInDate).toISOString().split("T")[0]
        : "",
      moveOutDate: tenant.moveOutDate
        ? new Date(tenant.moveOutDate).toISOString().split("T")[0]
        : "",
    });
    setShowModal(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTenant(null);
    setIsEditing(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !formData.tenantId) {
        toast.error("Invalid request");
        return;
      }

      const payload = {
        name: formData.name || "",
        email: formData.email || "",
        aadhaar: formData.aadhaar || "",
        mobile: formData.mobile || "",
        permanentAddress: formData.permanentAddress || "",
        joinDate: formData.joinDate ? `${formData.joinDate}T00:00:00.000Z` : "",
        moveInDate: formData.moveInDate ? `${formData.moveInDate}T00:00:00.000Z` : "",
        moveOutDate: formData.moveOutDate ? `${formData.moveOutDate}T00:00:00.000Z` : null,
        rentAmount: parseFloat(formData.rentAmount) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        pendingDues: parseFloat(formData.pendingDues) || 0,
        totalRentPaid: parseFloat(formData.totalRentPaid) || 0,
        roomId: formData.roomId || "",
        bedId: formData.bedId || "",
      };

      const response = await axios.put(
        `${baseurl}api/sub-owner/updateTenant/${formData.tenantId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Tenant updated successfully");
      setIsEditing(false);
      fetchTenants();
    } catch (error) {
      toast.error("Failed to update tenant");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !selectedTenant?.tenantId) return;

      await axios.delete(
        `${baseurl}api/sub-owner/deleteTenant/${selectedTenant.tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Tenant deleted successfully");
      closeModal();
      setShowConfirmModal(false);
      fetchTenants();
    } catch (error) {
      toast.error("Failed to delete tenant");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#172554] font-medium">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          {/* <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
              GHARZO <span className="text-[#F97316]">Tenants</span>
            </h1>
            <p className="text-gray-600 mt-1.5">Manage tenant profiles & details</p>
          </div> */}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="bg-[#172554] hover:bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2 transition-colors"
          >
            <FaTimes size={18} />
            Back
          </motion.button>
        </div>

        {/* Tenant Grid */}
        {tenants.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <FaUser className="mx-auto text-7xl text-[#F97316]/30 mb-6" />
            <h3 className="text-2xl font-semibold text-[#172554] mb-3">No tenants found</h3>
            <p className="text-gray-600 mb-6">No tenants are currently registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tenants.map((tenant) => (
              <motion.div
                key={tenant.tenantId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-[#F97316]/40 transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => handleTenantClick(tenant)}
              >
                {/* Top accent bar */}
                <div className="h-2 bg-gradient-to-r from-[#F97316] to-[#ea580c]" />

                <div className="p-5 flex flex-col flex-grow">
                  {/* Photo & Name */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#F97316]/30 shadow-sm flex-shrink-0">
                      <img
                        src={tenant.photo || instaUser}
                        alt={tenant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = instaUser)}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-[#172554] truncate">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {tenant.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FaPhone className="text-green-600" />
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Mobile</span>
                        <span className="font-medium text-[#172554]">{tenant.mobile}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <FaRupeeSign className="text-[#F97316]" />
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Rent</span>
                        <span className="font-medium text-[#F97316]">
                          ₹{tenant.rentAmount || 0}/mo
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <FaCalendar className="text-teal-600" />
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Move-in</span>
                        <span className="font-medium text-[#172554]">
                          {tenant.moveInDate
                            ? new Date(tenant.moveInDate).toLocaleDateString("en-IN")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTenant(tenant);
                        setShowConfirmModal(true);
                      }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTenantClick(tenant);
                        setIsEditing(true);
                      }}
                      className="flex-1 bg-[#172554] hover:bg-[#1e3a8a] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Detail Modal */}
      <AnimatePresence>
        {showModal && selectedTenant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.92, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 px-6 sm:px-8 py-5 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                    <FaUser size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#172554]">
                      {selectedTenant.name}
                    </h2>
                    <p className="text-sm text-gray-600">{selectedTenant.email || "—"}</p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Photo */}
                  <div className="md:col-span-2 flex justify-center mb-6">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-[#F97316]/20 shadow-lg">
                      <img
                        src={selectedTenant.photo || instaUser}
                        alt={selectedTenant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = instaUser)}
                      />
                    </div>
                  </div>

                  <TenantInfoItem
                    icon={<FaUser />}
                    label="Full Name"
                    value={selectedTenant.name}
                  />

                  <TenantInfoItem
                    icon={<FaPhone />}
                    label="Mobile Number"
                    value={selectedTenant.mobile}
                  />

                  <TenantInfoItem
                    icon={<FaEnvelope />}
                    label="Email Address"
                    value={selectedTenant.email || "—"}
                  />

                  <TenantInfoItem
                    icon={<FaIdCard />}
                    label="Aadhaar Number"
                    value={selectedTenant.aadhaar || "—"}
                  />

                  <TenantInfoItem
                    icon={<FaHome />}
                    label="Permanent Address"
                    value={selectedTenant.permanentAddress || "—"}
                    fullWidth
                  />

                  <TenantInfoItem
                    icon={<FaCalendar />}
                    label="Move-in Date"
                    value={
                      selectedTenant.moveInDate
                        ? new Date(selectedTenant.moveInDate).toLocaleDateString("en-IN")
                        : "—"
                    }
                  />

                  <TenantInfoItem
                    icon={<FaRupeeSign />}
                    label="Monthly Rent"
                    value={`₹${selectedTenant.rentAmount || 0}`}
                    accent
                  />

                  <TenantInfoItem
                    icon={<FaShieldAlt />}
                    label="Security Deposit"
                    value={`₹${selectedTenant.securityDeposit || 0}`}
                    accent
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t px-6 sm:px-8 py-5 flex justify-end gap-4">
                <button
                  onClick={openConfirmModal}
                  className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
                >
                  Delete Tenant
                </button>

                {isEditing ? (
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-2.5 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-lg font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[#172554] mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-8">
                Are you sure you want to permanently delete this tenant record?
              </p>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Tenant
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable info item component
const TenantInfoItem = ({ icon, label, value, accent = false, fullWidth = false }) => (
  <div className={`flex items-start gap-4 ${fullWidth ? "md:col-span-2" : ""}`}>
    <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] flex-shrink-0 mt-1">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm text-gray-500 mb-0.5">{label}</div>
      <div className={`text-base font-medium ${accent ? "text-[#F97316]" : "text-[#172554]"} break-words`}>
        {value}
      </div>
    </div>
  </div>
);

export default TenantList;