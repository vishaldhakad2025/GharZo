import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, User, CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PropMngrComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [assignData, setAssignData] = useState({});
  const [feedbackData, setFeedbackData] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [activeAction, setActiveAction] = useState({});

  useEffect(() => {
    const fetchData = async (page = 1) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // NEW API: Fetch ALL complaints (no status filter)
        const response = await axios.get(
          `https://api.gharzoreality.com/api/pm/complaints/all?page=${page}&limit=${pagination.limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch complaints");
        }

        const { complaintsByStatus, complaints: allComplaints, pagination: paginationData } = response.data;

        // Flatten only Pending, Accepted, InProgress from grouped data
        const activeComplaints = [
          ...(complaintsByStatus.Pending || []),
          ...(complaintsByStatus.Accepted || []),
          ...(complaintsByStatus.InProgress || []),
        ];

        setComplaints(activeComplaints);
        setPagination({
          total: paginationData.total || 0,
          page: paginationData.page || 1,
          limit: paginationData.limit || 10,
          pages: paginationData.pages || 0,
        });

        // Fetch Workers
        const workersResponse = await axios.get(
          "https://api.gharzoreality.com/api/pm/workers",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkers(workersResponse.data.workers || []);
      } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || "Failed to fetch data.");
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData(pagination.page);
  }, [pagination.page]);

  const handleStatusUpdate = async (complaintId, tenantId, status, landlordResponse = "") => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/pm/complaints/update/${tenantId}/${complaintId}`,
        { status, landlordResponse },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        if (status === "Resolved") {
          setComplaints((prev) => prev.filter((c) => c.complaintId !== complaintId));
          toast.success("Complaint resolved and removed from active list");
        } else {
          setComplaints((prev) =>
            prev.map((c) => (c.complaintId === complaintId ? { ...c, ...response.data.complaint } : c))
          );
          toast.success("Status updated successfully");
        }

        setResponseText((prev) => {
          const newResp = { ...prev };
          delete newResp[complaintId];
          return newResp;
        });
        setActiveAction((prev) => ({ ...prev, [complaintId]: "" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleAssignWorker = async (propertyId, complaintId, workerId, estimatedTime, notes) => {
    const token = localStorage.getItem("token");
    if (!workerId || !estimatedTime) {
      toast.error("Please select a worker and estimated time");
      return;
    }

    try {
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/pm/complaints/properties/${propertyId}/complaints/${complaintId}/assign-worker`,
        {
          workerId,
          estimatedResolutionTime: new Date(estimatedTime).toISOString(),
          notes: notes || "",
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setComplaints((prev) =>
          prev.map((c) => (c.complaintId === complaintId ? { ...c, ...response.data.complaint } : c))
        );
        toast.success("Worker assigned successfully");
        setActiveAction((prev) => ({ ...prev, [complaintId]: "" }));
        setAssignData((prev) => {
          const newData = { ...prev };
          delete newData[complaintId];
          return newData;
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign worker.");
    }
  };

  const handleSubmitFeedback = async (propertyId, complaintId, rating, feedback) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/pm/complaints/properties/${propertyId}/complaints/${complaintId}/feedback`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setComplaints((prev) => prev.filter((c) => c.complaintId !== complaintId));
        toast.success("Feedback submitted - complaint archived");
        setActiveAction((prev) => ({ ...prev, [complaintId]: "" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    }
  };

  const handleResponseChange = (complaintId, value) => {
    setResponseText((prev) => ({ ...prev, [complaintId]: value }));
  };

  const handleAssignChange = (complaintId, field, value) => {
    setAssignData((prev) => ({
      ...prev,
      [complaintId]: { ...prev[complaintId], [field]: value },
    }));
  };

  const handleFeedbackChange = (complaintId, field, value) => {
    setFeedbackData((prev) => ({
      ...prev,
      [complaintId]: { ...prev[complaintId], [field]: value },
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Theme styles (as requested)
  const actionButtonStyle = {
    backgroundImage: "linear-gradient(to right, #2563eb, #22c55e)",
    padding: "1rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 600,
    color: "rgb(255, 255, 255)",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="text-2xl font-semibold text-gray-700"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Clock className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="text-red-500 text-xl font-medium bg-red-100 p-4 rounded-lg shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <AlertCircle className="w-6 h-6 inline mr-2" />
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
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

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
        Active Complaints (Pending / Accepted / In Progress)
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200 max-w-4xl mx-auto"
      >
        {complaints.length === 0 ? (
          <div className="text-center text-gray-600 p-6">No active complaints found.</div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={`${complaint.tenantId}-${complaint.complaintId}`}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {complaint.subject || "No Subject"}
                    </h2>
                  </div>
                  <div className="text-sm text-gray-600 sm:ml-auto">
                    Status:{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                      <Clock className="w-3 h-3 mr-1" />
                      {complaint.status || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Tenant: {complaint.tenantName || "Unknown Tenant"}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Property: {complaint.propertyName || "Unknown Property"}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {complaint.description || "No description provided"}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {complaint.status === "Pending" && (
                    <motion.button
                      style={actionButtonStyle}
                      onClick={() =>
                        setActiveAction((prev) => ({
                          ...prev,
                          [complaint.complaintId]:
                            prev[complaint.complaintId] === "resolve" ? "" : "resolve",
                        }))
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-lg"
                    >
                      Resolve
                    </motion.button>
                  )}
                  {(complaint.status === "Accepted" || complaint.status === "InProgress") &&
                    !complaint.assignedWorker && (
                      <motion.button
                        style={actionButtonStyle}
                        onClick={() =>
                          setActiveAction((prev) => ({
                            ...prev,
                            [complaint.complaintId]:
                              prev[complaint.complaintId] === "assign" ? "" : "assign",
                          }))
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-lg"
                      >
                        Assign Worker
                      </motion.button>
                    )}
                </div>

                {/* Resolve Form */}
                {activeAction[complaint.complaintId] === "resolve" && complaint.status === "Pending" && (
                  <div className="space-y-3">
                    <textarea
                      className="w-full min-h-[80px] p-2 border rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={responseText[complaint.complaintId] || ""}
                      onChange={(e) => handleResponseChange(complaint.complaintId, e.target.value)}
                      placeholder="Enter your response..."
                    />
                    <motion.button
                      style={actionButtonStyle}
                      onClick={() =>
                        handleStatusUpdate(
                          complaint.complaintId,
                          complaint.tenantId,
                          "Resolved",
                          responseText[complaint.complaintId]
                        )
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full rounded-lg"
                    >
                      Mark as Resolved
                    </motion.button>
                  </div>
                )}

                {/* Assign Worker Form */}
                {activeAction[complaint.complaintId] === "assign" &&
                  (complaint.status === "Accepted" || complaint.status === "InProgress") &&
                  !complaint.assignedWorker && (
                    <div className="space-y-3">
                      <select
                        value={assignData[complaint.complaintId]?.workerId || ""}
                        onChange={(e) =>
                          handleAssignChange(complaint.complaintId, "workerId", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose Worker</option>
                        {workers.map((w) => (
                          <option key={w._id || w.id} value={w._id || w.id}>
                            {w.name} ({w.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="datetime-local"
                        value={assignData[complaint.complaintId]?.estimatedTime || ""}
                        onChange={(e) =>
                          handleAssignChange(complaint.complaintId, "estimatedTime", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={assignData[complaint.complaintId]?.notes || ""}
                        onChange={(e) =>
                          handleAssignChange(complaint.complaintId, "notes", e.target.value)
                        }
                        placeholder="Notes..."
                        className="w-full p-2 border rounded-lg min-h-[60px] text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <motion.button
                        style={actionButtonStyle}
                        onClick={() => {
                          const data = assignData[complaint.complaintId] || {};
                          if (!data.workerId || !data.estimatedTime) {
                            toast.error("Please select worker and time");
                            return;
                          }
                          handleAssignWorker(
                            complaint.propertyId,
                            complaint.complaintId,
                            data.workerId,
                            data.estimatedTime,
                            data.notes
                          );
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full rounded-lg"
                      >
                        Assign Worker
                      </motion.button>
                    </div>
                  )}

                {/* Assigned Worker Info */}
                {complaint.assignedWorker && (
                  <div className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded-lg">
                    Assigned: {complaint.assignedWorker.workerName} (
                    {complaint.assignedWorker.workerRole})
                    {complaint.estimatedResolutionTime && (
                      <span className="ml-2 text-xs">
                        | ETA: {new Date(complaint.estimatedResolutionTime).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-wrap justify-center items-center mt-6 gap-2">
            <motion.button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              style={pagination.page === 1 ? { opacity: 0.5 } : actionButtonStyle}
              whileHover={{ scale: pagination.page === 1 ? 1 : 1.05 }}
              whileTap={{ scale: pagination.page === 1 ? 1 : 0.95 }}
              className="px-4 py-2 rounded-lg text-sm"
            >
              Previous
            </motion.button>

            <span className="px-3 py-2 text-gray-800 text-sm font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>

            <motion.button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              style={pagination.page === pagination.pages ? { opacity: 0.5 } : actionButtonStyle}
              whileHover={{ scale: pagination.page === pagination.pages ? 1 : 1.05 }}
              whileTap={{ scale: pagination.page === pagination.pages ? 1 : 0.95 }}
              className="px-4 py-2 rounded-lg text-sm"
            >
              Next
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PropMngrComplaints;