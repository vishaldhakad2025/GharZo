import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaHome,
  FaCalendar,
  FaMoneyBillWave,
  FaBed,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Tenant = () => {
  const location = useLocation();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [propertyId] = useState(
    location.state?.propertyId || "68c2d141304b00ee9c1e1c18"
  ); // Assume propertyId from state or default

  useEffect(() => {
    fetchTenants();
  }, [propertyId]);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/tenants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTenants(response.data.tenants || []);
    } catch (error) {
      toast.error("Failed to fetch tenants. Please try again.");
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantClick = (tenant) => {
    setSelectedTenant(tenant);
    setShowProfileModal(true);
  };

  const closeModal = () => {
    setShowProfileModal(false);
    setSelectedTenant(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-blue-500"
        >
          <FaUser />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mr-2"
          >
            <FaUser className="text-3xl text-blue-500" />
          </motion.span>
          Tenants List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <motion.div
              key={tenant.id}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5, rotateX: 5, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => handleTenantClick(tenant)}
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200">
                {tenant.photo ? (
                  <img
                    src={`https://api.gharzoreality.com${tenant.photo}`}
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaUser className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {tenant.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaPhone className="mr-2 text-blue-500" />
                    {tenant.mobile}
                  </div>
                  <div className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-500" />₹
                    {tenant.rentAmount}/month
                  </div>
                  <div className="flex items-center">
                    <FaCalendar className="mr-2 text-purple-500" />
                    {new Date(tenant.moveInDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {tenants.length === 0 && (
          <div className="text-center py-12">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tenants found.</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                {selectedTenant.name}'s Profile
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                {selectedTenant.photo ? (
                  <img
                    src={`https://api.gharzoreality.com${selectedTenant.photo}`}
                    alt={selectedTenant.name}
                    className="w-32 h-32 object-cover rounded-full mx-auto mb-4 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FaUser className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaUser className="mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Name</strong>
                      <span className="text-gray-900">
                        {selectedTenant.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaEnvelope className="mr-3 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Email</strong>
                      <span className="text-gray-900">
                        {selectedTenant.email || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="mr-3 text-purple-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Mobile</strong>
                      <span className="text-gray-900">
                        {selectedTenant.mobile}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaIdCard className="mr-3 text-red-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Aadhaar</strong>
                      <span className="text-gray-900">
                        {selectedTenant.aadhaar}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <FaHome className="mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-gray-700">
                        Permanent Address
                      </strong>
                      <span className="text-gray-900">
                        {selectedTenant.permanentAddress}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaBed className="mr-3 text-orange-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Room</strong>
                      <span className="text-gray-900">
                        {selectedTenant.room || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaBed className="mr-3 text-teal-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Bed</strong>
                      <span className="text-gray-900">
                        {selectedTenant.bed || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaCalendar className="mr-3 text-pink-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">Join Date</strong>
                      <span className="text-gray-900">
                        {new Date(selectedTenant.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaCalendar className="mr-3 text-yellow-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">
                        Move In Date
                      </strong>
                      <span className="text-gray-900">
                        {new Date(
                          selectedTenant.moveInDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaCalendar className="mr-3 text-gray-500 flex-shrink-0" />
                    <div>
                      <strong className="block text-gray-700">
                        Move Out Date
                      </strong>
                      <span className="text-gray-900">
                        {selectedTenant.moveOutDate
                          ? new Date(
                              selectedTenant.moveOutDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <FaMoneyBillWave className="mr-3 text-green-600 flex-shrink-0" />
                      <div>
                        <strong className="block text-gray-700">
                          Rent Amount
                        </strong>
                        <span className="text-gray-900">
                          ₹{selectedTenant.rentAmount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <FaMoneyBillWave className="mr-3 text-blue-600 flex-shrink-0" />
                      <div>
                        <strong className="block text-gray-700">
                          Security Deposit
                        </strong>
                        <span className="text-gray-900">
                          ₹{selectedTenant.securityDeposit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-red-50 rounded-lg">
                      <FaMoneyBillWave className="mr-3 text-red-600 flex-shrink-0" />
                      <div>
                        <strong className="block text-gray-700">
                          Pending Dues
                        </strong>
                        <span className="text-gray-900">
                          ₹{selectedTenant.pendingDues}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-indigo-50 rounded-lg md:col-span-3">
                      <FaMoneyBillWave className="mr-3 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="block text-gray-700">
                          Total Rent Paid
                        </strong>
                        <span className="text-gray-900">
                          ₹{selectedTenant.totalRentPaid}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tenant;
