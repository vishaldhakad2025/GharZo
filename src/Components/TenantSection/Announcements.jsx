import React, { useState, useEffect } from "react";
import { MdAnnouncement, MdNotificationsActive } from "react-icons/md";
import { FaBullhorn,FaArrowRight,FaClock,FaShareAlt ,FaBookmark , FaBuilding, FaUserTie } from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const TenantAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { tenantId } = useParams();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("tenanttoken");

        // Fetch landlord announcements
        const landlordRes = await fetch(
          `https://api.gharzoreality.com/api/announcement/tenant/${tenantId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        let landlordData = [];
        if (landlordRes.ok) {
          const data = await landlordRes.json();
          landlordData = data.announcements || data || [];
        }

        // Fetch subowner announcements
        const subownerRes = await fetch(
          `https://api.gharzoreality.com/api/subowner/announcements/tenant/${tenantId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        let subownerData = [];
        if (subownerRes.ok) {
          const data = await subownerRes.json();
          subownerData = data.announcements || [];
        }

        // Merge and sort by createdAt desc
        const allAnnouncements = [...landlordData, ...subownerData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAnnouncements(allAnnouncements);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchAnnouncements();
    }
  }, [tenantId]);

  // Count announcements by type
  const landlordCount = announcements.filter(
    (item) => !item.createdByType || item.createdByType === "LANDLORD"
  ).length;
  
  const subownerCount = announcements.filter(
    (item) => item.createdByType === "SUBOWNER"
  ).length;

 return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-4 sm:p-6">
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50 rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-200/20 to-purple-200/10 rounded-full -translate-y-20 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-200/20 to-emerald-200/10 rounded-full translate-y-10 -translate-x-10"></div>
          
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Section - Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <FaBullhorn className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent">
                      Announcements Hub
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Stay updated with important notices and alerts</p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-indigo-700">Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-teal-700">Latest First</span>
                  </div>
                </div>
              </div>

              {/* Right Section - Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-all"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-purple-400/5 rounded-full -translate-y-4 translate-x-4"></div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                      <FaBuilding className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Landlord</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-indigo-900">{landlordCount}</p>
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="relative overflow-hidden bg-gradient-to-br from-white to-teal-50 rounded-2xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-all"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-400/10 to-emerald-400/5 rounded-full -translate-y-4 translate-x-4"></div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-lg">
                      <FaUserTie className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Subowner</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-teal-900">{subownerCount}</p>
                        <span className="text-xs font-medium px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State - Enhanced */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaBullhorn className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Loading Announcements</h3>
          <p className="text-gray-600 max-w-md text-center">
            Fetching the latest updates from landlords and sub-owners...
          </p>
          <div className="mt-6 w-48 h-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
          </div>
        </motion.div>
      )}

      {/* Error State - Enhanced */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-white to-red-50 rounded-3xl p-8 shadow-2xl border border-red-200"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                <FaExclamationTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Announcements</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FaSync className="w-4 h-4" />
              Try Again
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold border border-gray-300">
              Contact Support
            </button>
          </div>
        </motion.div>
      )}

      {/* Announcement Lists */}
      {!loading && !error && announcements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center py-32"
        >
          <div className="relative mb-10">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-2xl">
              <FaBullhorn className="w-20 h-20 text-indigo-300" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            No Announcements Available
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            You'll see important notices here once landlords or sub-owners post announcements.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl">
            Check Back Later
          </button>
        </motion.div>
      ) : (
        <div className="space-y-16">
          {/* Landlord Announcements Section - Enhanced */}
          <div className="relative">
            {/* Section Header - Enhanced */}
            <div className="relative mb-12">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
                    <FaBuilding className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-bold text-gray-900">
                      Landlord Announcements
                    </h2>
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold shadow-lg">
                      {landlordCount} announcement{landlordCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg">
                    Official updates, policy changes, and important notices from your landlord
                  </p>
                </div>
              </div>
              
              {/* Stats Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm font-medium text-indigo-700">Official Announcements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-purple-700">Priority Updates</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Sorted by: <span className="font-semibold text-indigo-600">Most Recent</span>
                </div>
              </div>
            </div>

            {/* Landlord Announcements Grid - Enhanced */}
            {announcements.filter(item => !item.createdByType || item.createdByType === "LANDLORD").length > 0 ? (
              <motion.div
                layout
                className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              >
                {announcements
                  .filter(item => !item.createdByType || item.createdByType === "LANDLORD")
                  .map((item, index) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative"
                    >
                      {/* Card Background Effects */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                      
                      {/* Main Card */}
                      <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300">
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                              <FaBullhorn className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-xs font-medium">
                                  <FaBuilding className="w-3 h-3" />
                                  Landlord
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                              <FaArrowRight className="w-4 h-4 text-indigo-600" />
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="mb-6">
                          <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">
                            {item.message}
                          </p>
                          
                          {/* Time Details */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div className="flex items-center gap-2">
                              <FaClock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Posted {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-indigo-600">
                              {item.priority === "HIGH" ? "🔴 High Priority" : "🟢 Regular"}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-6 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all text-sm font-medium">
                              View Details
                            </button>
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FaShareAlt className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FaBookmark className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-b-3xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl border-2 border-dashed border-indigo-200">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                  <FaBullhorn className="w-12 h-12 text-indigo-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No Landlord Announcements
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your landlord hasn't posted any announcements yet. Check back later for updates.
                </p>
              </div>
            )}
          </div>

          {/* SubOwner Announcements Section - Enhanced */}
          <div className="relative">
            {/* Section Header - Enhanced */}
            <div className="relative mb-12">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative p-5 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-2xl">
                    <FaUserTie className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-bold text-gray-900">
                      SubOwner Announcements
                    </h2>
                    <span className="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full text-sm font-semibold shadow-lg">
                      {subownerCount} announcement{subownerCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg">
                    Community updates, maintenance notices, and local information from sub-owners
                  </p>
                </div>
              </div>
              
              {/* Stats Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-sm font-medium text-teal-700">Community Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-700">Local Information</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Sorted by: <span className="font-semibold text-teal-600">Most Recent</span>
                </div>
              </div>
            </div>

            {/* SubOwner Announcements Grid - Enhanced */}
            {announcements.filter(item => item.createdByType === "SUBOWNER").length > 0 ? (
              <motion.div
                layout
                className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              >
                {announcements
                  .filter(item => item.createdByType === "SUBOWNER")
                  .map((item, index) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative"
                    >
                      {/* Card Background Effects */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                      
                      {/* Main Card */}
                      <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300">
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl shadow-lg">
                              <FaBullhorn className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 rounded-full text-xs font-medium">
                                  <FaUserTie className="w-3 h-3" />
                                  SubOwner
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 flex items-center justify-center">
                              <FaArrowRight className="w-4 h-4 text-teal-600" />
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="mb-6">
                          <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">
                            {item.message}
                          </p>
                          
                          {/* Time Details */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div className="flex items-center gap-2">
                              <FaClock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Posted {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-teal-600">
                              {item.priority === "HIGH" ? "🔴 Urgent" : "🟢 Standard"}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-6 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <button className="px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 rounded-lg hover:from-teal-100 hover:to-emerald-100 transition-all text-sm font-medium">
                              View Details
                            </button>
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FaShareAlt className="w-4 h-4 text-gray-400 hover:text-teal-500" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FaBookmark className="w-4 h-4 text-gray-400 hover:text-teal-500" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-b-3xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-3xl border-2 border-dashed border-teal-200">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 flex items-center justify-center">
                  <FaBullhorn className="w-12 h-12 text-teal-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No SubOwner Announcements
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Sub-owners haven't posted any announcements yet. Check back for community updates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default TenantAnnouncements;