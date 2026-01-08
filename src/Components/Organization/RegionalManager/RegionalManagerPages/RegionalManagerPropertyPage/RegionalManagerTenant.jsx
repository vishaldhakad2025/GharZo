import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  FaTimes,
  FaSpinner,
  FaImage,
  FaEdit,
  FaTrash,
  FaBed,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instaUser from "../../../../../assets/Images/instaUser.jpg";

const TenantList = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchPropertyAndTenants = async () => {
      if (!token) {
        toast.error("Please login to continue");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.gharzoreality.com/api/rm/properties/${propertyId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch property details");
        }

        const result = await response.json();
        if (!result.success || !result.property) {
          throw new Error("Property not found");
        }

        const property = result.property;
        const allTenants = [];

        // Extract tenants from all beds
        property.rooms.forEach((room) => {
          room.beds.forEach((bed) => {
            if (bed.tenants && bed.tenants.length > 0) {
              bed.tenants.forEach((tenant) => {
                allTenants.push({
                  ...tenant,
                  roomName: room.name,
                  bedName: bed.name || "Unnamed Bed",
                  propertyName: property.name,
                  photo: tenant.photo || null,
                });
              });
            }
          });
        });

        setTenants(allTenants);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyAndTenants();
    }
  }, [propertyId, token]);

  const handleTenantClick = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name || "",
      email: tenant.email || "",
      mobile: tenant.mobile || "",
      aadhaar: tenant.aadhaar || "",
      maritalStatus: tenant.maritalStatus || "",
      rentAmount: tenant.rentAmount || "",
      securityDeposit: tenant.securityDeposit || 0,
      pendingDues: tenant.pendingDues || 0,
      noticePeriod: tenant.noticePeriod || "",
      remarks: tenant.remarks || "",
      referredBy: tenant.referredBy || "",
      joinDate: tenant.joinDate ? new Date(tenant.joinDate).toISOString().split("T")[0] : "",
      moveInDate: tenant.moveInDate ? new Date(tenant.moveInDate).toISOString().split("T")[0] : "",
      moveOutDate: tenant.moveOutDate ? new Date(tenant.moveOutDate).toISOString().split("T")[0] : "",
      roomName: tenant.roomName || "",
      bedName: tenant.bedName || "",
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

  const handleUpdate = () => {
    toast.success(`${selectedTenant.name}'s profile updated successfully!`);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setTenants((prev) => prev.filter((t) => t.tenantId !== selectedTenant.tenantId));
    toast.success(`${selectedTenant.name} removed successfully.`);
    closeModal();
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <FaSpinner className="text-6xl text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center p-8">
        <div>
          <FaExclamationCircle className="text-8xl text-red-500 mx-auto mb-6" />
          <p className="text-2xl text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-0">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

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
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <FaUser className="mx-auto text-9xl text-gray-300 mb-8" />
            <h2 className="text-4xl font-bold text-gray-600 mb-4">
              No Tenants Available
            </h2>
            <p className="text-xl text-gray-500">
              This property currently has no registered tenants.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <motion.div
                key={tenant.tenantId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
                onClick={() => handleTenantClick(tenant)}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                  <img
                    src={tenant.photo || instaUser}
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
                      <FaPhone className="mr-2 text-green-500" />
                      {tenant.mobile}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaHome className="mr-2 text-blue-500" />
                      {tenant.roomName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaBed className="mr-2 text-purple-500" />
                      {tenant.bedName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaRupeeSign className="mr-2 text-green-600" />
                      ₹{tenant.rentAmount}/month
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendar className="mr-2 text-orange-500" />
                      {tenant.moveInDate
                        ? new Date(tenant.moveInDate).toLocaleDateString()
                        : "N/A"}
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
                  <motion.span className="mr-2 text-blue-500">
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
                  <motion.div className="relative mx-auto w-32 h-32 mb-4">
                    <img
                      src={selectedTenant.photo || instaUser}
                      alt={selectedTenant.name}
                      className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white"
                    />
                  </motion.div>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <input name="name" value={formData.name || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <input name="email" value={formData.email || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Mobile</label>
                      <input name="mobile" value={formData.mobile || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Aadhaar</label>
                      <input name="aadhaar" value={formData.aadhaar || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Room</label>
                      <input name="roomName" value={formData.roomName || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Bed</label>
                      <input name="bedName" value={formData.bedName || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Rent Amount</label>
                      <input type="number" name="rentAmount" value={formData.rentAmount || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                      <input type="number" name="securityDeposit" value={formData.securityDeposit || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Move In Date</label>
                      <input type="date" name="moveInDate" value={formData.moveInDate || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Join Date</label>
                      <input type="date" name="joinDate" value={formData.joinDate || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard icon={<FaUser />} label="Name" value={selectedTenant.name} />
                    <DetailCard icon={<FaEnvelope />} label="Email" value={selectedTenant.email || "N/A"} />
                    <DetailCard icon={<FaPhone />} label="Mobile" value={selectedTenant.mobile} />
                    <DetailCard icon={<FaIdCard />} label="Aadhaar" value={selectedTenant.aadhaar || "N/A"} />
                    <DetailCard icon={<FaHome />} label="Room" value={selectedTenant.roomName} />
                    <DetailCard icon={<FaBed />} label="Bed" value={selectedTenant.bedName} />
                    <DetailCard icon={<FaRupeeSign />} label="Rent" value={`₹${selectedTenant.rentAmount}/month`} />
                    <DetailCard icon={<FaShieldAlt />} label="Security Deposit" value={`₹${selectedTenant.securityDeposit || 0}`} />
                    <DetailCard icon={<FaExclamationCircle />} label="Pending Dues" value={`₹${selectedTenant.pendingDues || 0}`} />
                    <DetailCard icon={<FaCalendar />} label="Move-In" value={new Date(selectedTenant.moveInDate).toLocaleDateString()} />
                    <DetailCard icon={<FaCalendar />} label="Join Date" value={new Date(selectedTenant.joinDate).toLocaleDateString()} />
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t rounded-b-2xl p-6 flex justify-end space-x-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmModal(true)}
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
                    Save Changes
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete <strong>{selectedTenant?.name}</strong>?
              </p>
              <div className="flex justify-center gap-6">
                <button onClick={() => setShowConfirmModal(false)} className="px-8 py-3 bg-gray-300 rounded-lg font-bold">
                  Cancel
                </button>
                <button onClick={handleDelete} className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
    <div className="flex items-center">
      <span className="mr-3 text-indigo-600 text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

export default TenantList;