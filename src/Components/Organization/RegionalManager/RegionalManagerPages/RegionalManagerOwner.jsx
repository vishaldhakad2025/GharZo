import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser ,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";

const MyOwner = () => {
  const [landlord, setLandlord] = useState(null);
  const [properties, setProperties] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // API call commented out as requested
        /*
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login first.");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/auth/profile",
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
        */

        // Dummy data for UI display
        setLandlord({
          id: "LND123456",
          name: "John Doe",
          email: "john.doe@example.com",
          mobile: "+91 9876543210",
        });

        setProperties([
          {
            id: "P001",
            name: "Sunshine Apartments",
            address: "123, MG Road",
            city: "Mumbai",
            pinCode: "400001",
            type: "Apartment",
            totalRooms: 10,
            totalBeds: 20,
            agreementStartDate: "2023-01-01",
            agreementEndDate: "2025-01-01",
            agreementDuration: { years: 2, months: 0 },
            status: "Active",
          },
          {
            id: "P002",
            name: "Greenwood Villas",
            address: "45, Palm Street",
            city: "Pune",
            pinCode: "411001",
            type: "Villa",
            totalRooms: 8,
            totalBeds: 16,
            agreementStartDate: "2022-06-15",
            agreementEndDate: "2024-06-15",
            agreementDuration: { years: 2, months: 0 },
            status: "Inactive",
          },
        ]);

        setPermissions([
          {
            id: "perm1",
            name: "view_properties",
            description: "Can view properties assigned",
          },
          {
            id: "perm2",
            name: "edit_profile",
            description: "Can edit profile details",
          },
          {
            id: "perm3",
            name: "manage_tenants",
            description: "Can manage tenant information",
          },
        ]);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <ToastContainer />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl text-indigo-600 drop-shadow-lg"
        >
          <FaSpinner />
        </motion.div>
      </div>
    );
  }

  if (error || !landlord) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-red-100 via-red-200 to-red-300 flex items-center justify-center">
        <ToastContainer />
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto">
          <p className="text-red-600 text-xl mb-6 font-semibold">{error || "No landlord data available."}</p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
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
          className="text-4xl font-extrabold text-indigo-900 mb-10 flex items-center"
        >
          <motion.span
            whileHover={{ rotateY: 360 }}
            className="mr-3 text-indigo-600 drop-shadow-lg"
          >
            <FaUser  className="text-5xl" />
          </motion.span>
          Landlord Profile
        </motion.h1>

        {/* Landlord Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.25)" }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-indigo-200 max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 10 }}
              className="w-36 h-36 rounded-full bg-indigo-100 flex items-center justify-center shadow-lg"
            >
              <FaUser  className="text-6xl text-indigo-600 drop-shadow-md" />
            </motion.div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-semibold text-indigo-900">{landlord.name}</h2>
              <div className="mt-4 space-y-3 text-lg">
                <div className="flex items-center justify-center sm:justify-start text-indigo-700">
                  <FaEnvelope className="mr-3 text-indigo-500 drop-shadow" />
                  <span>{landlord.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-indigo-700">
                  <FaPhone className="mr-3 text-indigo-500 drop-shadow" />
                  <span>{landlord.mobile}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-indigo-700">
                  <FaShieldAlt className="mr-3 text-indigo-500 drop-shadow" />
                  <span>ID: {landlord.id}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assigned Properties */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold text-indigo-900 mb-6 flex items-center justify-center sm:justify-start"
        >
          <FaBuilding className="mr-3 text-indigo-600 drop-shadow-lg" />
          Assigned Properties
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.07, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-indigo-200"
            >
              <h3 className="text-2xl font-semibold text-indigo-900 mb-4">{prop.name}</h3>
              <div className="space-y-3 text-indigo-700 text-lg">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-indigo-500 drop-shadow" />
                  <span>
                    {prop.address}, {prop.city}, {prop.pinCode}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="mr-3 text-indigo-500 drop-shadow" />
                  <span>Type: {prop.type}</span>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="mr-3 text-indigo-500 drop-shadow" />
                  <span>
                    {prop.totalRooms} Rooms, {prop.totalBeds} Beds
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-indigo-500 drop-shadow" />
                  <span>
                    Agreement: {new Date(prop.agreementStartDate).toLocaleDateString()} -{" "}
                    {new Date(prop.agreementEndDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-indigo-500 drop-shadow" />
                  <span>
                    Duration: {prop.agreementDuration.years} years, {prop.agreementDuration.months} months
                  </span>
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-3 text-indigo-500 drop-shadow" />
                  <span
                    className={`text-sm font-semibold ${
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
          className="text-3xl font-semibold text-indigo-900 mb-6 flex items-center justify-center sm:justify-start"
        >
          <FaShieldAlt className="mr-3 text-indigo-600 drop-shadow-lg" />
          Permissions
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {permissions.map((perm, index) => (
            <motion.div
              key={perm.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-200 flex items-center gap-4"
            >
              <FaShieldAlt className="text-indigo-600 text-4xl drop-shadow" />
              <div>
                <span className="text-indigo-900 font-semibold capitalize">
                  {perm.name.replace(/_/g, " ")}
                </span>
                <p className="text-indigo-700 mt-1">{perm.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOwner;
