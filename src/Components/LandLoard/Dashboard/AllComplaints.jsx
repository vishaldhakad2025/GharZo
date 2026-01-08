import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaHome,
  FaMapMarkerAlt,
  FaClock,
  FaUserCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

const AllComplaints = () => {
  const [data, setData] = useState({
    totalComplaints: 0,
    complaintsByStatus: {
      Pending: [],
      Accepted: [],
      InProgress: [],
      Resolved: [],
      Rejected: [],
    },
    complaintsByProperty: [],
    allComplaints: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Detect sidebar hover state
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Fetch complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://api.gharzoreality.com/api/landlord/analytics/complaints",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch complaints: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Colorful 3D Icon Component
  const Colorful3DIcon = ({
    icon: Icon,
    color,
    size = "lg",
    className = "",
  }) => (
    <motion.div
      className={`relative p-3 rounded-2xl shadow-lg bg-gradient-to-br ${color} transform hover:scale-110 hover:rotate-3 transition-all duration-300 perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ y: -5 }}
    >
      <Icon className={`text-white text-${size} drop-shadow-lg`} />
      <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="text-center">
          <Colorful3DIcon
            icon={FaSpinner}
            color="from-blue-500 to-purple-600"
            size="2xl"
          />
          <p className="mt-4 text-lg font-semibold text-gray-600">
            Loading Complaints...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Colorful3DIcon
            icon={FaExclamationTriangle}
            color="from-red-500 to-orange-500"
          />
          <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Complaints Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage and track tenant complaints efficiently
          </p>
        </div>

        {/* Total Complaints Stat */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <Colorful3DIcon
              icon={FaExclamationTriangle}
              color="from-blue-500 to-indigo-600"
            />
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Complaints
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {data.totalComplaints || 0}
              </p>
            </div>
          </div>

          {/* By Status Cards */}
          {Object.entries(data.complaintsByStatus || {}).map(
            ([status, complaints]) => (
              <div key={status} className="bg-white rounded-2xl p-6 shadow-lg">
                <Colorful3DIcon
                  icon={
                    status === "Resolved"
                      ? FaCheckCircle
                      : status === "Pending"
                      ? FaClock
                      : FaUserCircle
                  }
                  color={
                    status === "Resolved"
                      ? "from-green-500 to-emerald-600"
                      : status === "Pending"
                      ? "from-yellow-500 to-orange-600"
                      : "from-red-500 to-pink-600"
                  }
                />
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide capitalize">
                    {status}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {(complaints || []).length}
                  </p>
                  {(complaints || []).length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Latest: {formatDate((complaints || [])[0].createdAt)}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Complaints by Property */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Colorful3DIcon
              icon={FaHome}
              color="from-purple-500 to-pink-600"
              size="sm"
            />
            Complaints by Property
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {(data.complaintsByProperty || []).map((property) => (
              <div
                key={property.propertyId}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Colorful3DIcon
                    icon={FaMapMarkerAlt}
                    color="from-indigo-500 to-blue-600"
                    size="sm"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {property.propertyName}
                  </h3>
                </div>
                <div className="space-y-3">
                  {(property.complaints || []).map((complaint) => (
                    <div
                      key={complaint._id}
                      className="bg-gray-50 p-4 rounded-xl border-l-4 border-blue-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {complaint.subject}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            complaint.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : complaint.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {complaint.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>By: {complaint.tenantName}</span>
                        <span>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {(property.complaints || []).length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No complaints for this property
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* All Complaints List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Colorful3DIcon
              icon={FaClock}
              color="from-orange-500 to-red-600"
              size="sm"
            />
            All Complaints
          </h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.allComplaints || []).map((complaint) => (
                    <tr
                      key={complaint._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complaint.propertyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.roomId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {complaint.subject}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                        title={complaint.description}
                      >
                        {complaint.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.tenantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            complaint.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : complaint.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            complaint.priority === "High"
                              ? "bg-red-100 text-red-800"
                              : complaint.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(complaint.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllComplaints;