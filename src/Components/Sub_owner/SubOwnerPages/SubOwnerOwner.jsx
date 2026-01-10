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
import baseurl from "../../../../BaseUrl";

const BrandIcon = ({ icon: Icon, accent = false, size = "xl", className = "" }) => (
  <motion.div
    className={`relative p-4 rounded-2xl shadow-lg bg-gradient-to-br ${
      accent ? "from-[#FF6600] to-[#FF994D]" : "from-[#003366] to-[#336699]"
    } transform hover:scale-110 hover:rotate-2 transition-all duration-300 ${className}`}
    whileHover={{ y: -6, rotate: 3 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className={`text-white text-${size} drop-shadow-md`} />
  </motion.div>
);

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
          `${baseurl}api/sub-owner/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const subOwner = response.data.subOwner;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <BrandIcon icon={FaSpinner} size="6xl" accent={true} />
          </motion.div>
          <p className="mt-6 text-xl font-medium text-gray-700">
            Loading Landlord Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !landlord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg w-full text-center border border-red-100">
          <BrandIcon icon={FaSpinner} size="6xl" accent={true} />
          <p className="mt-6 text-xl font-medium text-red-700">
            {error || "No landlord data available."}
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            className="mt-6 bg-[#FF6600] text-white px-8 py-3 rounded-xl font-medium shadow-md hover:bg-[#FF994D] transition-colors"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 pb-16">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-12"
        >
          <span className="text-[#003366]">Landlord</span>
          <span className="bg-gradient-to-r from-[#FF6600] to-[#FF994D] bg-clip-text text-transparent ml-3">
            Profile
          </span>
        </motion.h1>

        {/* Landlord Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-10 mb-12 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <BrandIcon icon={FaUser} size="6xl" accent={true} />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                <FaShieldAlt className="text-[#003366] text-xl" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#003366] mb-4">
                {landlord.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <FaEnvelope className="text-[#FF6600] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{landlord.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <FaPhone className="text-[#FF6600] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{landlord.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <FaShieldAlt className="text-[#FF6600] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Landlord ID</p>
                    <p className="font-medium">{landlord.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assigned Properties */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#003366] mb-8 flex items-center gap-3"
        >
          <BrandIcon icon={FaBuilding} size="4xl" />
          Assigned Properties
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-[#003366] mb-5 truncate">
                {prop.name}
              </h3>

              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-[#FF6600] text-xl mt-1" />
                  <span>{prop.address}, {prop.city}, {prop.pinCode}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaBuilding className="text-[#FF6600] text-xl" />
                  <span>Type: {prop.type}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaBuilding className="text-[#FF6600] text-xl" />
                  <span>{prop.totalRooms} Rooms • {prop.totalBeds} Beds</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-[#FF6600] text-xl" />
                  <span>
                    {new Date(prop.agreementStartDate).toLocaleDateString()} —{" "}
                    {new Date(prop.agreementEndDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-[#FF6600] text-xl" />
                  <span>
                    Duration: {prop.agreementDuration.years} years,{" "}
                    {prop.agreementDuration.months} months
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <span className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                    prop.status === "Active" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {prop.status}
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
          className="text-3xl font-bold text-[#003366] mb-8 flex items-center gap-3"
        >
          <BrandIcon icon={FaShieldAlt} size="4xl" accent={true} />
          Permissions
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {permissions.map((perm, index) => (
            <motion.div
              key={perm.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex items-start gap-4"
            >
              <BrandIcon icon={FaShieldAlt} size="3xl" accent={true} />
              <div>
                <h4 className="font-semibold text-lg text-[#003366] capitalize mb-2">
                  {perm.name.replace(/_/g, " ")}
                </h4>
                <p className="text-gray-600">{perm.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;