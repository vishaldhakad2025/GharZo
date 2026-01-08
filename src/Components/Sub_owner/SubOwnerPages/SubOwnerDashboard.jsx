import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaBuilding,
  FaBed,
  FaUsers,
  FaExclamationTriangle,
  FaDollarSign,
  FaMoneyBillWave,
  FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    totalTenants: 0,
    totalWorkers: 0,
    monthlyCollection: 0,
    pendingDues: 0,
    totalComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Smooth zoom effect
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch properties data
        const propertiesResponse = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch workers data
        const workersResponse = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/workers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch dues summary data
        const duesResponse = await axios.get(
          "https://api.gharzoreality.com/api/subowner/dues/summary",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch complaints summary data
        const complaintsResponse = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/properties/complaints/summary",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (
          propertiesResponse.data.success &&
          workersResponse.data.success &&
          duesResponse.data.tenants &&
          complaintsResponse.data.success
        ) {
          const properties = propertiesResponse.data.properties || [];
          const workers = workersResponse.data.workers || [];
          const tenantsWithDues = duesResponse.data.tenants || [];
          const complaintProperties = complaintsResponse.data.properties || [];

          // Calculate total stats
          const totalProperties = properties.length;
          const totalRooms = properties.reduce(
            (sum, prop) => sum + (prop.stats?.totalRooms || 0),
            0
          );
          const totalBeds = properties.reduce(
            (sum, prop) => sum + (prop.stats?.totalBeds || 0),
            0
          );
          const totalTenants = properties.reduce(
            (sum, prop) => sum + (prop.stats?.occupancy?.occupied || 0),
            0
          );
          const totalWorkers = workers.length;
          const monthlyCollection = properties.reduce(
            (sum, prop) => sum + (prop.stats?.monthlyCollection || 0),
            0
          );
          const pendingDues = tenantsWithDues.reduce(
            (sum, tenantInfo) => sum + (tenantInfo.totalAmount || 0),
            0
          );
          const totalComplaints = complaintProperties.reduce(
            (sum, prop) => sum + (prop.totalComplaints || 0),
            0
          );

          setDashboardStats({
            totalProperties,
            totalRooms,
            totalBeds,
            totalTenants,
            totalWorkers,
            monthlyCollection,
            pendingDues,
            totalComplaints,
          });
        } else {
          setError("Failed to fetch dashboard data.");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Sub Owner 
      </h1>
      

      {/* Big Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Properties Card */}
        <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/sub_owner_property")}
          className="p-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl shadow-lg cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Properties</h2>
            <FaHome className="text-3xl" />
          </div>
          <p className="text-sm mt-2">Manage your listed properties easily.</p>
          <h3 className="text-2xl font-bold mt-3">
            {dashboardStats.totalProperties}
          </h3>
        </motion.div>

        
       
        {/* Total Property */}
        <motion.div
          className="p-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Total Property</h2>
            <FaBuilding className="text-3xl" />
          </div>
          <h3 className="text-3xl font-bold mt-2">
            {dashboardStats.totalProperties}
          </h3>
        </motion.div>

        {/* Total Rooms & Beds */}
        <motion.div
          className="p-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Total Rooms</h2>
            <FaBed className="text-3xl" />
          </div>
          <h1 className="text-3xl font-bold">
            {dashboardStats.totalRooms} Rooms
          </h1>
        </motion.div>

        {/* Total Workers */}
        <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/sub_owner_workers_list")}
          className="p-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl shadow-lg cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Total Workers</h2>
            <FaUsers className="text-3xl" />
          </div>
          <h3 className="text-3xl font-bold mt-2">
            {dashboardStats.totalWorkers}
          </h3>
        </motion.div>

        {/* Total Complaints */}
        <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/complaints")}
          className="p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Total Complaints</h2>
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <h3 className="text-3xl font-bold mt-2">
            {dashboardStats.totalComplaints}
          </h3>
        </motion.div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
        {/* Monthly Collection */}
        <motion.div
          className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Monthly Collection</h2>
            <FaMoneyBillWave className="text-3xl" />
          </div>
          <p className="text-sm mt-2">Total monthly collections</p>
          <h3 className="text-3xl font-bold mt-3">
            ₹{dashboardStats.monthlyCollection.toLocaleString()}
          </h3>
        </motion.div>
        

        {/* Pending Dues */}
        <motion.div
          className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Pending Dues</h2>
            <FaDollarSign className="text-3xl" />
          </div>
          <p className="text-sm mt-2">Outstanding payments</p>
          <h3 className="text-3xl font-bold mt-3">
            ₹{dashboardStats.pendingDues.toLocaleString()}
          </h3>
        </motion.div>
      </div>

      {/* Small Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {/* Complaints */}
        <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/complaints")}
          className="p-4 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl shadow-md cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-2xl mb-2" />
            <h3 className="text-sm font-semibold">Complaints</h3>
          </div>
        </motion.div>

        {/* Dues */}
        <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/dues")}
          className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-md cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-col items-center">
            <FaDollarSign className="text-2xl mb-2" />
            <h3 className="text-sm font-semibold">Dues</h3>
          </div>
        </motion.div>

{/* Collection  */}
     <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/collections")}
          className="p-4 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl shadow-md cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-2xl mb-2" />
            <h3 className="text-sm font-semibold">Collection</h3>
          </div>
        </motion.div>

        {/* My Owner */}
        <motion.div
          role="button"
          onClick={() => navigate("/sub_owner/my_owner")}
          className="p-4 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-xl shadow-md cursor-pointer"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-col items-center">
            <FaUserTie className="text-2xl mb-2" />
            <h3 className="text-sm font-semibold">My Owner</h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;