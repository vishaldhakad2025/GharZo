import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

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

  // Enhanced animation variants
  const cardVariants = {
    initial: { 
      scale: 1, 
      y: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      scale: 1.03,
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
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
          `${baseurl}api/sub-owner/properties`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch workers data
        const workersResponse = await axios.get(
          `${baseurl}api/sub-owner/workers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch dues summary data
        const duesResponse = await axios.get(
          `${baseurl}api/subowner/dues/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch complaints summary data
        const complaintsResponse = await axios.get(
          `${baseurl}api/sub-owner/properties/complaints/summary`,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div 
            className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#003366] border-r-[#FF6B35] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaBuilding className="text-3xl sm:text-4xl text-[#FF6B35]" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-[#003366] mb-2">Loading Dashboard</h3>
            <p className="text-sm sm:text-base text-gray-600">Please wait while we fetch your data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full text-center"
        >
          <motion.div 
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaExclamationTriangle className="text-4xl sm:text-5xl text-red-500" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003366] mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <motion.h1 
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#003366] mb-2 leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Dashboard Overview
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-sm sm:text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back! Here's what's happening today.
              </motion.p>
            </div>
            <motion.div 
              className="lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-[#FF6B35] hover:shadow-2xl transition-shadow duration-300">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Sub Owner Portal</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003366] tracking-tight">Gharzo</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10"
        >
          {/* Properties Card */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
            role="button"
            onClick={() => navigate("/sub_owner/sub_owner_property")}
            className="group relative bg-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-7 cursor-pointer overflow-hidden border border-gray-100 hover:border-[#003366] transition-all duration-300"
            style={{
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            {/* Subtle background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/0 to-[#003366]/0 group-hover:from-[#003366]/5 group-hover:to-[#003366]/10 transition-all duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#003366]/10 rounded-xl flex items-center justify-center group-hover:bg-[#003366] group-hover:scale-110 transition-all duration-300">
                  <FaBuilding className="text-2xl sm:text-3xl text-[#003366] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-700">Active</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-2 font-medium">Total Properties</p>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#003366] mb-4">
                {dashboardStats.totalProperties}
              </h3>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Manage properties</span>
                <div className="w-6 h-6 bg-[#FF6B35]/10 rounded-full flex items-center justify-center group-hover:bg-[#FF6B35] transition-colors duration-300">
                  <span className="text-[#FF6B35] group-hover:text-white text-sm transition-colors duration-300">→</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rooms Card */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
            className="group relative bg-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-7 overflow-hidden border border-gray-100 hover:border-[#FF6B35] transition-all duration-300"
            style={{
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/0 to-[#FF6B35]/0 group-hover:from-[#FF6B35]/5 group-hover:to-[#FF6B35]/10 transition-all duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:scale-110 transition-all duration-300">
                  <FaBed className="text-2xl sm:text-3xl text-[#FF6B35] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                  <FaChartLine className="text-blue-600 text-xs" />
                  <span className="text-xs font-semibold text-blue-700">100%</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-2 font-medium">Total Rooms</p>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#003366] mb-4">
                {dashboardStats.totalRooms}
              </h3>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Across all properties</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workers Card */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
            role="button"
            onClick={() => navigate("/sub_owner/sub_owner_workers_list")}
            className="group relative bg-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-7 cursor-pointer overflow-hidden border border-gray-100 hover:border-[#003366] transition-all duration-300"
            style={{
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/0 to-[#003366]/0 group-hover:from-[#003366]/5 group-hover:to-[#003366]/10 transition-all duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#003366]/10 rounded-xl flex items-center justify-center group-hover:bg-[#003366] group-hover:scale-110 transition-all duration-300">
                  <FaUsers className="text-2xl sm:text-3xl text-[#003366] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors duration-300">
                  <FaCheckCircle className="text-purple-600 text-xs" />
                  <span className="text-xs font-semibold text-purple-700">Team</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-2 font-medium">Total Workers</p>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#003366] mb-4">
                {dashboardStats.totalWorkers}
              </h3>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Active staff members</span>
                <div className="w-6 h-6 bg-[#FF6B35]/10 rounded-full flex items-center justify-center group-hover:bg-[#FF6B35] transition-colors duration-300">
                  <span className="text-[#FF6B35] group-hover:text-white text-sm transition-colors duration-300">→</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Complaints Card */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            initial="initial"
            role="button"
            onClick={() => navigate("/sub_owner/complaints")}
            className="group relative bg-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-7 cursor-pointer overflow-hidden border border-gray-100 hover:border-red-400 transition-all duration-300"
            style={{
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <FaExclamationTriangle className="text-2xl sm:text-3xl text-red-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors duration-300">
                  <FaClock className="text-orange-600 text-xs animate-pulse" />
                  <span className="text-xs font-semibold text-orange-700">Urgent</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-2 font-medium">Total Complaints</p>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#003366] mb-4">
                {dashboardStats.totalComplaints}
              </h3>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Needs attention</span>
                <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors duration-300">
                  <span className="text-red-500 group-hover:text-white text-sm transition-colors duration-300">→</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Financial Overview Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10"
        >
          {/* Monthly Collection Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="relative bg-gradient-to-br from-[#003366] to-[#004d99] rounded-2xl lg:rounded-3xl shadow-xl p-6 sm:p-7 lg:p-8 text-white overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg">
                      <FaMoneyBillWave className="text-xl text-white" />
                    </div>
                    <p className="text-blue-200 font-medium">Monthly Collection</p>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold mb-2">
                    ₹{dashboardStats.monthlyCollection.toLocaleString()}
                  </h2>
                  <p className="text-blue-200 text-sm">Total revenue collected this month</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center bg-green-500/20 px-3 py-1.5 rounded-full">
                  <FaArrowUp className="text-green-300 text-xs mr-2" />
                  <span className="text-green-300 text-xs font-semibold">Active Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-blue-200 text-xs">Live tracking</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pending Dues Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="relative bg-gradient-to-br from-[#FF6B35] to-[#ff8659] rounded-2xl lg:rounded-3xl shadow-xl p-6 sm:p-7 lg:p-8 text-white overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                      <FaDollarSign className="text-xl text-white" />
                    </div>
                    <p className="text-orange-100 font-medium">Pending Dues</p>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold mb-2">
                    ₹{dashboardStats.pendingDues.toLocaleString()}
                  </h2>
                  <p className="text-orange-100 text-sm">Outstanding payments to collect</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center bg-red-500/20 px-3 py-1.5 rounded-full">
                  <FaExclamationTriangle className="text-red-100 text-xs mr-2" />
                  <span className="text-red-100 text-xs font-semibold">Action Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
                  <span className="text-orange-100 text-xs">Follow up needed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003366] mb-2">Quick Actions</h2>
            <p className="text-gray-600 text-sm sm:text-base">Navigate to different sections quickly</p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Complaints Action */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              onClick={() => navigate("/sub_owner/complaints")}
              className="group bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 cursor-pointer border border-gray-100 hover:border-red-400 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <FaExclamationTriangle className="text-2xl sm:text-3xl text-red-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-sm mb-1 group-hover:text-red-500 transition-colors duration-300">Complaints</h3>
                <p className="text-xs text-gray-400">View all</p>
              </div>
            </motion.div>

            {/* Dues Action */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              onClick={() => navigate("/sub_owner/dues")}
              className="group bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 cursor-pointer border border-gray-100 hover:border-yellow-400 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:scale-110 transition-all duration-300">
                  <FaDollarSign className="text-2xl sm:text-3xl text-yellow-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-sm mb-1 group-hover:text-yellow-600 transition-colors duration-300">Dues</h3>
                <p className="text-xs text-gray-400">Manage</p>
              </div>
            </motion.div>

            {/* Collection Action */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              onClick={() => navigate("/sub_owner/collections")}
              className="group bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 cursor-pointer border border-gray-100 hover:border-green-400 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
                  <FaMoneyBillWave className="text-2xl sm:text-3xl text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-sm mb-1 group-hover:text-green-600 transition-colors duration-300">Collection</h3>
                <p className="text-xs text-gray-400">Track</p>
              </div>
            </motion.div>

            {/* My Owner Action */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              onClick={() => navigate("/sub_owner/my_owner")}
              className="group bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 cursor-pointer border border-gray-100 hover:border-purple-400 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                  <FaUserTie className="text-2xl sm:text-3xl text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#003366] font-semibold text-sm mb-1 group-hover:text-purple-600 transition-colors duration-300">My Owner</h3>
                <p className="text-xs text-gray-400">Profile</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;