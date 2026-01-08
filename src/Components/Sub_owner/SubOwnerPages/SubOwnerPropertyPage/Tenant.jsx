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
  FaExclamationCircle,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaImage,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instaUser from "../../../../assets/Images/instaUser.jpg";

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
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/tenants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched tenants:", response.data.tenants); // Debug: Log tenant data
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch tenants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTenantClick = (tenant) => {
    console.log("Selected tenant:", tenant); // Debug: Log selected tenant
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

  const preparePayload = (data) => {
    return {
      name: data.name || "",
      email: data.email || "",
      aadhaar: data.aadhaar || "",
      mobile: data.mobile || "",
      permanentAddress: data.permanentAddress || "",
      photo: data.photo || "",
      propertyId: data.propertyId || propertyId,
      roomId: data.roomId || "",
      bedId: data.bedId || "",
      joinDate: data.joinDate ? `${data.joinDate}T00:00:00.000Z` : "",
      moveInDate: data.moveInDate ? `${data.moveInDate}T00:00:00.000Z` : "",
      moveOutDate: data.moveOutDate
        ? `${data.moveOutDate}T00:00:00.000Z`
        : null,
      rentAmount: parseFloat(data.rentAmount) || 0,
      securityDeposit: parseFloat(data.securityDeposit) || 0,
      pendingDues: parseFloat(data.pendingDues) || 0,
      totalRentPaid: parseFloat(data.totalRentPaid) || 0,
    };
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        return;
      }
      if (!formData.tenantId) {
        toast.error("Invalid tenant ID. Cannot update tenant.");
        console.error("Missing tenantId in formData:", formData);
        return;
      }
      const payload = preparePayload(formData);
      console.log("Update payload:", payload); // Debug: Log update payload
      const response = await axios.put(
        `https://api.gharzoreality.com/api/sub-owner/updateTenant/${formData.tenantId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message || "Tenant updated successfully.");
      setIsEditing(false);
      setSelectedTenant(response.data.tenant);
      fetchTenants();
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update tenant. Please try again."
      );
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        return;
      }
      if (!selectedTenant.tenantId) {
        toast.error("Invalid tenant ID. Cannot delete tenant.");
        console.error("Missing tenantId in selectedTenant:", selectedTenant);
        return;
      }
      console.log("Deleting tenant with tenantId:", selectedTenant.tenantId); // Debug: Log tenantId
      const response = await axios.delete(
        `https://api.gharzoreality.com/api/sub-owner/deleteTenant/${selectedTenant.tenantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message || "Tenant deleted successfully.");
      closeModal();
      setShowConfirmModal(false);
      fetchTenants();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete tenant. Please try again."
      );
    }
  };

  const openConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-blue-500"
        >
          <FaSpinner />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-0">
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
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <FaTimes className="mr-2" />
          Back
        </motion.button>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <motion.span
            initial={{ rotateY: 0 }}
            whileHover={{ rotateY: 360 }}
            className="mr-2 text-blue-500"
          >
            <FaUser className="text-3xl" />
          </motion.span>
          Tenants List
        </h1>
        {tenants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaUser className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">No tenants found.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <motion.div
                key={tenant.tenantId} // Changed to tenantId for unique key
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
                onClick={() => handleTenantClick(tenant)}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                  <img
                    src={tenant.photo ? tenant.photo : instaUser}
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg"
                  >
                    <FaImage className="text-gray-600" />
                  </motion.div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {tenant.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span
                        initial={{ rotateY: 0 }}
                        whileHover={{ rotateY: 180 }}
                        className="mr-2 text-green-500"
                      >
                        <FaPhone />
                      </motion.span>
                      {tenant.mobile}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span
                        initial={{ rotateY: 0 }}
                        whileHover={{ rotateY: 180 }}
                        className="mr-2 text-blue-500"
                      >
                        <FaRupeeSign />
                      </motion.span>
                      ₹{tenant.rentAmount}/month
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span
                        initial={{ rotateY: 0 }}
                        whileHover={{ rotateY: 180 }}
                        className="mr-2 text-purple-500"
                      >
                        <FaCalendar />
                      </motion.span>
                      {new Date(tenant.moveInDate).toLocaleDateString()}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    View Profile
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Profile Modal */}
      <AnimatePresence>
        {showModal && selectedTenant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b rounded-t-2xl p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <motion.span
                    initial={{ rotateY: 0 }}
                    whileHover={{ rotateY: 360 }}
                    className="mr-2 text-blue-500"
                  >
                    <FaUser className="text-2xl" />
                  </motion.span>
                  {selectedTenant.name}'s Profile
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  <FaTimes />
                </motion.button>
              </div>
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ rotateY: 0 }}
                    whileHover={{ rotateY: 360 }}
                    className="relative mx-auto w-32 h-32 mb-4"
                  >
                    <img
                      src={
                        selectedTenant.photo ? selectedTenant.photo : instaUser
                      }
                      alt={selectedTenant.name}
                      className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white"
                    />
                  </motion.div>
                </div>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <input
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <input
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Mobile
                      </label>
                      <input
                        name="mobile"
                        value={formData.mobile || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Aadhaar
                      </label>
                      <input
                        name="aadhaar"
                        value={formData.aadhaar || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Permanent Address
                      </label>
                      <input
                        name="permanentAddress"
                        value={formData.permanentAddress || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Join Date
                      </label>
                      <input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Move In Date
                      </label>
                      <input
                        type="date"
                        name="moveInDate"
                        value={formData.moveInDate || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Move Out Date
                      </label>
                      <input
                        type="date"
                        name="moveOutDate"
                        value={formData.moveOutDate || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Rent Amount
                      </label>
                      <input
                        type="number"
                        name="rentAmount"
                        value={formData.rentAmount || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Security Deposit
                      </label>
                      <input
                        type="number"
                        name="securityDeposit"
                        value={formData.securityDeposit || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Pending Dues
                      </label>
                      <input
                        type="number"
                        name="pendingDues"
                        value={formData.pendingDues || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Total Rent Paid
                      </label>
                      <input
                        type="number"
                        name="totalRentPaid"
                        value={formData.totalRentPaid || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Room ID
                      </label>
                      <input
                        name="roomId"
                        value={formData.roomId || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">
                        Bed ID
                      </label>
                      <input
                        name="bedId"
                        value={formData.bedId || ""}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard
                      icon={<FaUser className="text-indigo-500" />}
                      label="Full Name"
                      value={selectedTenant.name}
                    />
                    <DetailCard
                      icon={<FaEnvelope className="text-green-500" />}
                      label="Email"
                      value={selectedTenant.email || "N/A"}
                    />
                    <DetailCard
                      icon={<FaPhone className="text-blue-500" />}
                      label="Mobile"
                      value={selectedTenant.mobile}
                    />
                    <DetailCard
                      icon={<FaIdCard className="text-red-500" />}
                      label="Aadhaar"
                      value={selectedTenant.aadhaar}
                    />
                    <DetailCard
                      icon={<FaHome className="text-purple-500" />}
                      label="Permanent Address"
                      value={selectedTenant.permanentAddress}
                      fullWidth
                    />
                    {/* <DetailCard
                      icon={<FaCalendar className="text-orange-500" />}
                      label="Join Date"
                      value={new Date(
                        selectedTenant.joinDate
                      ).toLocaleDateString()}
                    /> */}
                    <DetailCard
                      icon={<FaCalendar className="text-teal-500" />}
                      label="Move In Date"
                      value={new Date(
                        selectedTenant.moveInDate
                      ).toLocaleDateString()}
                    />
                    {/* <DetailCard
                      icon={<FaCalendar className="text-pink-500" />}
                      label="Move Out Date"
                      value={
                        selectedTenant.moveOutDate
                          ? new Date(
                              selectedTenant.moveOutDate
                            ).toLocaleDateString()
                          : "N/A"
                      }
                    /> */}
                    {/* <DetailCard
                      icon={<FaRupeeSign className="text-green-500" />}
                      label="Rent Amount"
                      value={`₹${selectedTenant.rentAmount}`}
                    /> */}
                    {/* <DetailCard
                      icon={<FaShieldAlt className="text-yellow-500" />}
                      label="Security Deposit"
                      value={`₹${selectedTenant.securityDeposit}`}
                    /> */}
                    {/* <DetailCard
                      icon={<FaExclamationCircle className="text-red-500" />}
                      label="Pending Dues"
                      value={`₹${selectedTenant.pendingDues}`}
                    /> */}
                    {/* <DetailCard
                      icon={<FaCheckCircle className="text-green-500" />}
                      label="Total Rent Paid"
                      value={`₹${selectedTenant.totalRentPaid}`}
                    /> */}
                    {/* <DetailCard
                      icon={<FaHome className="text-indigo-500" />}
                      label="Room ID"
                      value={selectedTenant.roomId || "N/A"}
                    /> */}
                    {/* <DetailCard
                      icon={<FaHome className="text-indigo-500" />}
                      label="Bed ID"
                      value={selectedTenant.bedId || "N/A"}
                    /> */}
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-white border-t rounded-b-2xl p-6 flex justify-end space-x-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openConfirmModal}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Delete
                </motion.button>
                {isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Save
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Edit
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeConfirmModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this tenant?
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeConfirmModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailCard = ({ icon, label, value, fullWidth = false }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    className={`bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500 ${
      fullWidth ? "md:col-span-2" : ""
    }`}
  >
    <div className="flex items-center">
      <motion.span
        whileHover={{ rotateY: 180, scale: 1.1 }}
        className="mr-3 p-2 bg-white rounded-full shadow-md"
      >
        {icon}
      </motion.span>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default TenantList;
