import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaExclamationTriangle,
  FaSpinner,
  FaExclamationCircle,
  FaChartBar,
  FaUserPlus,
  FaComments,
  FaTimes,
  FaTools,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl";

// Modern brand icon component (same as ForecastSummary)
const BrandIcon = ({ icon: Icon, accent = false, size = "xl", className = "" }) => (
  <motion.div
    className={`relative p-5 rounded-2xl shadow-lg bg-gradient-to-br ${
      accent ? "from-[#FF6600] to-[#FF994D]" : "from-[#003366] to-[#336699]"
    } transform hover:scale-110 hover:rotate-2 transition-all duration-300 ${className}`}
    whileHover={{ y: -6, rotate: 3 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className={`text-white text-${size} drop-shadow-md`} />
  </motion.div>
);

const ComplaintsSummary = () => {
  const [data, setData] = useState({ success: false, properties: [] });
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(null);
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState(null);
  const [selectedComplaintForFeedback, setSelectedComplaintForFeedback] = useState(null);

  // Fetch properties & workers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please log in.");

        const [summaryRes, workersRes] = await Promise.all([
          axios.get(`${baseurl}api/sub-owner/properties/complaints/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseurl}api/sub-owner/workers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (summaryRes.data.success) setData(summaryRes.data);
        if (workersRes.data.success) setWorkers(workersRes.data.workers || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchComplaints = async (propertyId) => {
    setComplaintsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseurl}api/sub-owner/properties/${propertyId}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      } else {
        setComplaintsError("Failed to load complaints");
      }
    } catch (err) {
      setComplaintsError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleStatusChange = async (propertyId, complaintId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${baseurl}api/sub-owner/properties/${propertyId}/complaints/${complaintId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        fetchComplaints(propertyId);
        toast.success("Status updated successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAssign = async (propertyId, complaintId, workerId, estimatedTime, notes) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${baseurl}api/sub-owner/properties/${propertyId}/complaints/${complaintId}/assign`,
        {
          workerId,
          estimatedResolutionTime: new Date(estimatedTime).toISOString(),
          notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSelectedComplaintForAssign(null);
        fetchComplaints(propertyId);
        toast.success("Worker assigned successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign worker");
    }
  };

  const handleFeedback = async (propertyId, complaintId, rating, feedback) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${baseurl}api/sub-owner/properties/${propertyId}/complaints/${complaintId}/feedback`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSelectedComplaintForFeedback(null);
        fetchComplaints(propertyId);
        toast.success("Feedback submitted successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          >
            <BrandIcon icon={FaSpinner} size="6xl" accent={true} />
          </motion.div>
          <p className="mt-6 text-xl font-medium text-gray-700">Loading GHARZO Complaints Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg w-full text-center border border-red-100">
          <BrandIcon icon={FaExclamationCircle} size="6xl" accent={true} />
          <p className="mt-6 text-xl font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const totalComplaints = data.properties.reduce((sum, p) => sum + p.totalComplaints, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold">
            <span className="text-[#003366]">GHARZO</span>
            <span className="bg-gradient-to-r from-[#FF6600] to-[#FF994D] bg-clip-text text-transparent ml-3">
              Complaints
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">Track, manage and resolve property complaints</p>
        </div>

        {/* Total Complaints Card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16"
        >
          <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-xl border border-gray-200">
            <div className="flex justify-center mb-6">
              <BrandIcon icon={FaExclamationTriangle} size="6xl" accent={true} />
            </div>
            <h2 className="text-7xl md:text-8xl font-black text-[#003366] mb-3">
              {totalComplaints}
            </h2>
            <p className="text-2xl md:text-3xl font-medium text-gray-600">
              Active Complaints
            </p>
          </div>
        </motion.div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.properties.map((property) => (
            <motion.div
              key={property.propertyId}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
            >
              <div className="flex items-center gap-5 mb-6">
                <BrandIcon icon={FaHome} size="4xl" />
                <h3 className="text-2xl font-bold text-[#003366] truncate">
                  {property.propertyName}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <BrandIcon icon={FaExclamationTriangle} size="2xl" accent={true} />
                  <div>
                    <p className="text-sm text-gray-500">Total Complaints</p>
                    <p className="text-4xl font-bold text-[#FF6600]">{property.totalComplaints}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <BrandIcon icon={FaChartBar} size="2xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-3">Status Breakdown</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(property.complaintsByStatus).map(([status, count]) => (
                        <div
                          key={status}
                          className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                        >
                          <span className="text-gray-600">{status}</span>
                          <span className="float-right font-bold text-[#003366]">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedProperty(property);
                  fetchComplaints(property.propertyId);
                }}
                className="mt-10 w-full bg-gradient-to-r from-[#003366] to-[#336699] text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-300"
              >
                MANAGE COMPLAINTS →
              </button>
            </motion.div>
          ))}
        </div>

        {data.properties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-3xl mt-12 border border-gray-200 shadow-lg"
          >
            <FaExclamationTriangle className="mx-auto text-8xl text-gray-300 mb-8" />
            <p className="text-3xl font-bold text-gray-700">No Properties Found</p>
            <p className="mt-4 text-xl text-gray-500">No complaint data available yet</p>
          </motion.div>
        )}
      </div>

      {/* Complaints Modal - Light version */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 md:p-6 z-50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-5xl max-h-[94vh] overflow-y-auto shadow-2xl border border-gray-200"
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#003366] to-[#336699] z-10 px-8 py-6 border-b text-white flex justify-between items-center rounded-t-3xl">
              <h2 className="text-3xl font-bold">
                {selectedProperty.propertyName}
                <span className="text-[#FF994D] ml-3">Complaints</span>
              </h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-3 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <FaTimes size={28} />
              </button>
            </div>

            <div className="p-8">
              {complaintsLoading ? (
                <div className="text-center py-20">
                  <BrandIcon icon={FaSpinner} size="6xl" accent={true} />
                </div>
              ) : complaintsError ? (
                <p className="text-center text-red-600 py-16 text-xl font-medium">{complaintsError}</p>
              ) : complaints.length === 0 ? (
                <p className="text-center text-gray-600 py-16 text-xl">No complaints registered yet</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {complaints.map((complaint) => (
                    <motion.div
                      key={complaint.complaintId}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#FF6600]/40 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <BrandIcon icon={FaTools} size="3xl" accent={true} />
                        <div>
                          <p className="font-bold text-xl text-[#003366]">{complaint.complaintId}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(complaint.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-5 line-clamp-3">
                        {complaint.description || "No description provided"}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-5">
                        <select
                          value={complaint.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(selectedProperty.propertyId, complaint.complaintId, e.target.value)
                          }
                          className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600] outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        {complaint.status === "Accepted" && !complaint.assignedWorker && (
                          <button
                            onClick={() => setSelectedComplaintForAssign(complaint)}
                            className="flex items-center gap-2 bg-[#FF6600] text-white px-5 py-2 rounded-lg hover:bg-[#FF994D] transition-colors shadow-sm"
                          >
                            <FaUserPlus /> Assign
                          </button>
                        )}

                        {complaint.status === "Resolved" && !complaint.resolution && (
                          <button
                            onClick={() => setSelectedComplaintForFeedback(complaint)}
                            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                          >
                            <FaComments /> Feedback
                          </button>
                        )}
                      </div>

                      {complaint.assignedWorker && (
                        <div className="text-sm bg-green-50 p-4 rounded-xl mt-3 border border-green-200">
                          <p className="font-medium text-green-800">
                            Assigned to: {complaint.assignedWorker.workerName}
                          </p>
                          <p className="text-green-700 mt-1">
                            {new Date(complaint.assignedWorker.assignedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        theme="light"
        toastClassName="!rounded-xl !shadow-lg"
        progressClassName="!bg-gradient-to-r !from-[#FF6600] !to-[#FF994D]"
      />
    </div>
  );
};

export default ComplaintsSummary;