import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, User, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../../BaseUrl";

// Brand colors
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";

const Complaints = () => {
  const { propertyId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async (page = 1) => {
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      if (!propertyId) {
        toast.error("No property ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${baseurl}api/sub-owner/properties/${propertyId}/complaints?page=${page}&limit=${pagination.limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch complaints");
        }

        const { complaints: fetchedComplaints, pagination: paginationData } = response.data;

        setComplaints(fetchedComplaints || []);
        setPagination({
          total: paginationData.total || 0,
          page: paginationData.page || 1,
          limit: paginationData.limit || 10,
          pages: paginationData.pages || 0,
        });

        if (fetchedComplaints.length === 0) {
          setError("No complaints found for this property.");
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
        toast.error(err.response?.data?.message || "Failed to fetch complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [propertyId, token, pagination.limit]);

  const handleResolve = async (complaintId) => {
    const landlordResponse = responseText[complaintId] || "Issue resolved";

    try {
      const response = await axios.patch(
        `${baseurl}api/sub-owner/properties/${propertyId}/complaints/${complaintId}`,
        { status: "Resolved", notes: landlordResponse },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update complaint");
      }

      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === complaintId ? { ...c, ...response.data.complaint } : c
        )
      );

      setResponseText((prev) => {
        const newResponses = { ...prev };
        delete newResponses[complaintId];
        return newResponses;
      });

      toast.success("Complaint marked as resolved", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve complaint");
    }
  };

  const handleResponseChange = (complaintId, value) => {
    setResponseText((prev) => ({
      ...prev,
      [complaintId]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#172554] font-medium">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center border-t-4 border-red-500"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#172554] mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        {/* <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
            GHARZO <span className="text-[#F97316]">Complaints..</span>
          </h1>
          <p className="text-gray-600 mt-3">View and resolve tenant complaints</p>
        </div> */}

        {complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
          >
            <AlertCircle className="w-16 h-16 text-[#F97316]/40 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-[#172554] mb-3">
              No complaints yet
            </h3>
            <p className="text-gray-600">
              All complaints for this property will appear here
            </p>
          </motion.div>
        ) : (
          <>
            {/* Complaints Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {complaints.map((complaint, idx) => (
                <motion.div
                  key={complaint.complaintId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-[#F97316]/40 transition-all duration-300"
                >
                  {/* Top status bar */}
                  <div
                    className={`h-2 ${
                      complaint.status === "Resolved"
                        ? "bg-green-500"
                        : "bg-[#F97316]"
                    }`}
                  />

                  <div className="p-6">
                    {/* Subject */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="mt-0.5">
                        {complaint.status === "Resolved" ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-[#F97316]" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-[#172554] flex-1">
                        {complaint.subject || "Untitled Complaint"}
                      </h3>
                    </div>

                    {/* Tenant & Description */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-[#F97316]" />
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Tenant</span>
                          <span className="font-medium text-[#172554]">
                            {complaint.tenantName || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {complaint.description || "No description provided"}
                      </p>
                    </div>

                    {/* Response / Resolve Section */}
                    {complaint.status === "Pending" && (
                      <div className="space-y-4">
                        <textarea
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] outline-none resize-none"
                          value={responseText[complaint.complaintId] || ""}
                          onChange={(e) =>
                            handleResponseChange(complaint.complaintId, e.target.value)
                          }
                          placeholder="Type your resolution notes here..."
                        />

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleResolve(complaint.complaintId)}
                          className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Mark as Resolved
                        </motion.button>
                      </div>
                    )}

                    {/* Status Badge (when resolved) */}
                    {complaint.status === "Resolved" && (
                      <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mt-4">
                        <CheckCircle size={16} />
                        Resolved
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <motion.button
                  whileHover={{ scale: pagination.page === 1 ? 1 : 1.05 }}
                  whileTap={{ scale: pagination.page === 1 ? 1 : 0.95 }}
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pagination.page === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#172554] text-white hover:bg-[#1e3a8a]"
                  }`}
                >
                  Previous
                </motion.button>

                <span className="px-6 py-3 bg-white border rounded-xl text-[#172554] font-medium shadow-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <motion.button
                  whileHover={{
                    scale: pagination.page === pagination.pages ? 1 : 1.05,
                  }}
                  whileTap={{
                    scale: pagination.page === pagination.pages ? 1 : 0.95,
                  }}
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pagination.page === pagination.pages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#172554] text-white hover:bg-[#1e3a8a]"
                  }`}
                >
                  Next
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Complaints;