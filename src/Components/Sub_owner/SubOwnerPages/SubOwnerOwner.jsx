
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaCity,
  FaCalendarAlt,
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";

const LandlordProfile = () => {
  const navigate = useNavigate();
  const [landlord, setLandlord] = useState(null);
  const [properties, setProperties] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login first.");
          navigate("/login");
          return;
        }

        console.log("Fetching profile with Token:", token);
        setLoading(true);
        const response = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const subOwner = response.data.subOwner;
          // Assuming landlord details are same for all properties
          const landlordData = subOwner.assignedProperties[0]?.landlord;
          if (!landlordData) {
            throw new Error("Landlord data not found in response.");
          }
          setLandlord({
            id: landlordData.id,
            name: landlordData.name,
            email: landlordData.email,
            mobile: landlordData.mobile,
          });
          setProperties(
            subOwner.assignedProperties.map((prop) => ({
              ...prop.property,
              agreementStartDate: prop.agreementStartDate,
              agreementEndDate: prop.agreementEndDate,
              agreementDuration: prop.agreementDuration,
              status: prop.status,
            }))
          );
          setPermissions(subOwner.permissions);
        } else {
          toast.error("Failed to fetch profile data.");
          setError("Failed to load profile. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err);
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching profile."
        );
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer />
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

  if (error || !landlord) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer />
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || "No landlord data available."}</p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
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
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-8 flex items-center"
        >
          <motion.span
            whileHover={{ rotateY: 360 }}
            className="mr-2 text-blue-500"
          >
            <FaUser className="text-3xl" />
          </motion.span>
          Landlord Profile
        </motion.h1>

        {/* Landlord Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <FaUser className="text-4xl text-blue-500" />
            </motion.div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-800">{landlord.name}</h2>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-center sm:justify-start">
                  <FaEnvelope className="text-blue-500 mr-2" />
                  <span className="text-gray-600">{landlord.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <FaPhone className="text-blue-500 mr-2" />
                  <span className="text-gray-600">{landlord.mobile}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <FaShieldAlt className="text-blue-500 mr-2" />
                  <span className="text-gray-600">ID: {landlord.id}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assigned Properties */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"
        >
          <FaBuilding className="mr-2 text-blue-500" />
          Assigned Properties
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800">{prop.name}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-blue-500 mr-2" />
                  <span className="text-gray-600">
                    {prop.address}, {prop.city}, {prop.pinCode}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="text-blue-500 mr-2" />
                  <span className="text-gray-600">Type: {prop.type}</span>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="text-blue-500 mr-2" />
                  <span className="text-gray-600">
                    {prop.totalRooms} Rooms, {prop.totalBeds} Beds
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  <span className="text-gray-600">
                    Agreement: {new Date(prop.agreementStartDate).toLocaleDateString()} -{" "}
                    {new Date(prop.agreementEndDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  <span className="text-gray-600">
                    Duration: {prop.agreementDuration.years} years,{" "}
                    {prop.agreementDuration.months} months
                  </span>
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="text-blue-500 mr-2" />
                  <span
                    className={`text-sm font-medium ${
                      prop.status === "Active" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Status: {prop.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Permissions */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"
        >
          <FaShieldAlt className="mr-2 text-blue-500" />
          Permissions
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.map((perm, index) => (
            <motion.div
              key={perm.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 shadow border border-gray-200 flex items-center"
            >
              <FaShieldAlt className="text-blue-500 mr-3" />
              <div>
                <span className="text-gray-800 font-medium capitalize">
                  {perm.name.replace(/_/g, " ")}
                </span>
                <p className="text-sm text-gray-600">{perm.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;