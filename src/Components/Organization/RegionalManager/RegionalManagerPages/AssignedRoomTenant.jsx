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
  FaCheckCircle,
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
import instaUser from "../../../../assets/Images/instaUser.jpg";

const AssignedRoomTenant = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
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
    const fetchTenantsData = async () => {
      if (!token) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("https://api.gharzoreality.com/api/regional-managers/assigned-properties", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch property data");

        const result = await response.json();
        if (!result.success || !result.data || result.data.length === 0) {
          throw new Error("No properties assigned");
        }

        const property = result.data.find(p => p.propertyId === propertyId) || result.data[0];
        if (!property || !property.rooms) {
          setTenants([]);
          setLoading(false);
          return;
        }

        const allTenants = [];

        property.rooms.forEach(room => {
          room.beds.forEach(bed => {
            if (bed.tenants && bed.tenants.length > 0) {
              bed.tenants.forEach(tenant => {
                allTenants.push({
                  ...tenant,
                  roomName: room.name,
                  bedName: bed.name || "Unnamed Bed",
                  photo: tenant.photo || null,
                  propertyName: property.name,
                });
              });
            }
          });
        });

        setTenants(allTenants);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError(err.message || "Failed to load tenants");
        setLoading(false);
      }
    };

    fetchTenantsData();
  }, [propertyId, token]);

  const handleTenantClick = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name || "",
      email: tenant.email || "",
      mobile: tenant.mobile || "",
      aadhaar: tenant.aadhaar || "",
      roomName: tenant.roomName || "",
      bedName: tenant.bedName || "",
      rentAmount: tenant.rentAmount || "",
      securityDeposit: tenant.securityDeposit || 0,
      pendingDues: tenant.pendingDues || 0,
      moveInDate: tenant.moveInDate ? new Date(tenant.moveInDate).toISOString().split("T")[0] : "",
      joinDate: tenant.joinDate ? new Date(tenant.joinDate).toISOString().split("T")[0] : "",
      moveOutDate: tenant.moveOutDate ? new Date(tenant.moveOutDate).toISOString().split("T")[0] : "",
      noticePeriod: tenant.noticePeriod || "",
      remarks: tenant.remarks || "",
      referredBy: tenant.referredBy || "",
      rentalFrequency: tenant.rentalFrequency || "Monthly",
      rentOnDate: tenant.rentOnDate || "",
      agreementPeriod: tenant.agreementPeriod || "",
      agreementPeriodType: tenant.agreementPeriodType || "months",
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    toast.success(`${selectedTenant.name}'s profile updated successfully!`);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setTenants(prev => prev.filter(t => t.tenantId !== selectedTenant.tenantId));
    toast.success(`${selectedTenant.name} has been removed from the property.`);
    closeModal();
    setShowConfirmModal(false);
  };

  const openConfirmModal = () => setShowConfirmModal(true);
  const closeConfirmModal = () => setShowConfirmModal(false);

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <FaUser className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">No tenants found.</p>
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
                      <motion.span className="mr-2 text-green-500">
                        <FaPhone />
                      </motion.span>
                      {tenant.mobile}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span className="mr-2 text-blue-500">
                        <FaHome />
                      </motion.span>
                      {tenant.roomName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span className="mr-2 text-purple-500">
                        <FaBed />
                      </motion.span>
                      {tenant.bedName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span className="mr-2 text-green-600">
                        <FaRupeeSign />
                      </motion.span>
                      ₹{tenant.rentAmount}/month
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <motion.span className="mr-2 text-orange-500">
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
                      <label className="text-sm font-medium text-gray-500">Move In Date</label>
                      <input type="date" name="moveInDate" value={formData.moveInDate || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Join Date</label>
                      <input type="date" name="joinDate" value={formData.joinDate || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Notice Period (days)</label>
                      <input name="noticePeriod" value={formData.noticePeriod || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Remarks</label>
                      <textarea name="remarks" value={formData.remarks || ""} onChange={handleInputChange} className="mt-1 p-2 border rounded" rows="3" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard icon={<FaUser />} label="Full Name" value={selectedTenant.name} />
                    <DetailCard icon={<FaEnvelope />} label="Email" value={selectedTenant.email || "N/A"} />
                    <DetailCard icon={<FaPhone />} label="Mobile" value={selectedTenant.mobile} />
                    <DetailCard icon={<FaIdCard />} label="Aadhaar" value={selectedTenant.aadhaar} />
                    <DetailCard icon={<FaHome />} label="Room" value={selectedTenant.roomName} />
                    <DetailCard icon={<FaBed />} label="Bed" value={selectedTenant.bedName} />
                    <DetailCard icon={<FaRupeeSign />} label="Rent Amount" value={`₹${selectedTenant.rentAmount}`} />
                    <DetailCard icon={<FaCalendar />} label="Move In Date" value={new Date(selectedTenant.moveInDate).toLocaleDateString()} />
                    <DetailCard icon={<FaCalendar />} label="Join Date" value={new Date(selectedTenant.joinDate).toLocaleDateString()} />
                    <DetailCard icon={<FaCalendar />} label="Move Out Date" value={selectedTenant.moveOutDate ? new Date(selectedTenant.moveOutDate).toLocaleDateString() : "N/A"} />
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
              <div className="text-center mb-6">
                <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Confirm Delete</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete this tenant?
                </p>
              </div>
              <div className="flex justify-center space-x-4">
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
    className={`bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500 ${fullWidth ? "md:col-span-2" : ""}`}
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

export default AssignedRoomTenant;