import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaExclamationTriangle,
  FaStar,
  FaComment,
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ComplaintsSummary = () => {
  const [data, setData] = useState({
    success: false,
    properties: [],
  });
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(null);
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] =
    useState(null);
  const [selectedComplaintForFeedback, setSelectedComplaintForFeedback] =
    useState(null);

  // Fetch complaint summary data and workers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch summary
        const summaryResponse = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/properties/complaints/summary",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (summaryResponse.data.success) {
          setData(summaryResponse.data);
          setError(null);
        } else {
          setError("Failed to fetch complaint summary.");
        }

        // Fetch workers
        const workersResponse = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/workers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (workersResponse.data.success) {
          setWorkers(workersResponse.data.workers);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchComplaints = async (propertyId) => {
    setComplaintsLoading(true);
    setComplaintsError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/complaints`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
      } else {
        setComplaintsError("Failed to fetch complaints.");
      }
    } catch (err) {
      setComplaintsError(
        err.response?.data?.message || "Failed to fetch complaints."
      );
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleStatusChange = async (propertyId, complaintId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/complaints/${complaintId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        fetchComplaints(propertyId);
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update complaint status."
      );
    }
  };

  // UPDATED: Removed auto "Resolved" status change
  const handleAssign = async (
    propertyId,
    complaintId,
    workerId,
    estimatedTime,
    notes
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/complaints/${complaintId}/assign`,
        { 
          workerId, 
          estimatedResolutionTime: new Date(estimatedTime).toISOString(), 
          notes 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setSelectedComplaintForAssign(null);
        await fetchComplaints(propertyId); // Refresh list only
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign worker.");
    }
  };

  const handleFeedback = async (propertyId, complaintId, rating, feedback) => {
    if (!complaintId) {
      toast.error("Invalid complaint ID. Please try again.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/complaints/${complaintId}/feedback`,
        { rating, feedback },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setSelectedComplaintForFeedback(null);
        fetchComplaints(propertyId);
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add feedback.");
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center transition-all duration-500">
        <div className="text-center">
          <Colorful3DIcon
            icon={FaSpinner}
            color="from-blue-500 to-purple-600"
            size="2xl"
          />
          <p className="mt-4 text-lg font-semibold text-gray-600">
            Loading Complaint Summary...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center transition-all duration-500">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Colorful3DIcon
            icon={FaExclamationCircle}
            color="from-red-500 to-orange-500"
          />
          <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 transition-all duration-500">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Complaints Summary
          </h1>
          <p className="text-xl text-gray-600">
            Overview of complaints across all properties
          </p>
        </div>

        {/* Total Complaints Stat */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <Colorful3DIcon
              icon={FaExclamationTriangle}
              color="from-red-500 to-pink-600"
            />
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Complaints
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {data.properties.reduce(
                  (sum, prop) => sum + prop.totalComplaints,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Property Complaint Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.properties.map((property) => (
            <div
              key={property.propertyId}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Colorful3DIcon
                  icon={FaHome}
                  color="from-blue-500 to-teal-500"
                  size="xl"
                />
                <h3 className="text-lg font-bold text-gray-800">
                  {property.propertyName}
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaExclamationTriangle}
                    color="from-red-500 to-pink-600"
                    size="sm"
                  />
                  <span>Total Complaints: {property.totalComplaints}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaChartBar}
                    color="from-purple-500 to-indigo-600"
                    size="sm"
                  />
                  <span>
                    Complaints by Status:
                    <ul className="ml-4 list-disc">
                      {Object.entries(property.complaintsByStatus).map(
                        ([status, count]) => (
                          <li key={status}>
                            {status}: {count}
                          </li>
                        )
                      )}
                    </ul>
                  </span>
                </p>
                {/* <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaStar}
                    color="from-yellow-500 to-orange-600"
                    size="sm"
                  />
                  <span>
                    Average Rating:{" "}
                    {property.ratingSummary.averageRating.toFixed(1)}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaComment}
                    color="from-green-500 to-emerald-600"
                    size="sm"
                  />
                  <span>Comment Count: {property.commentCount}</span>
                </p>*/}
              </div>
              <button
                onClick={() => {
                  setSelectedProperty(property);
                  fetchComplaints(property.propertyId);
                }}
                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                View & Manage Complaints
              </button>
            </div>
          ))}
        </div>

        {data.properties.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white rounded-2xl shadow-lg">
            No complaint data available for properties.
          </div>
        )}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Complaints for {selectedProperty.propertyName}
              </h2>
              <button onClick={() => setSelectedProperty(null)}>
                <FaTimes
                  size={24}
                  className="text-gray-600 hover:text-gray-800"
                />
              </button>
            </div>
            {complaintsLoading && (
              <p className="text-center">Loading complaints...</p>
            )}
            {complaintsError && (
              <p className="text-center text-red-600">{complaintsError}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-gray-50 rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Colorful3DIcon
                      icon={FaTools}
                      color="from-orange-500 to-red-500"
                      size="sm"
                    />
                    <h3 className="font-bold">{complaint.complaintId}</h3>
                  </div>
                  <p>
                    Status:{" "}
                    <select
                      value={complaint.status || "Pending"}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedProperty.propertyId,
                          complaint.complaintId,
                          e.target.value
                        )
                      }
                      className="border rounded-md p-1 bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </p>
                  <p>Description: {complaint.description || "N/A"}</p>
                  {complaint.assignedWorker && (
                    <>
                      <p>
                        Assigned to: {complaint.assignedWorker.workerName} (
                        {complaint.assignedWorker.workerRole}) at{" "}
                        {new Date(
                          complaint.assignedWorker.assignedAt
                        ).toLocaleString()}
                      </p>
                      {complaint.notes && <p>Notes: {complaint.notes}</p>}
                    </>
                  )}
                  {complaint.estimatedResolutionTime && (
                    <p>
                      Estimated Resolution:{" "}
                      {new Date(
                        complaint.estimatedResolutionTime
                      ).toLocaleString()}
                    </p>
                  )}
                  {complaint.resolution && (
                    <p>
                      Rating: {complaint.resolution.rating} - Feedback:{" "}
                      {complaint.resolution.feedback}
                    </p>
                  )}
                  <div className="mt-4 space-x-2">
                    {complaint.status === "Accepted" &&
                      !complaint.assignedWorker && (
                        <button
                          onClick={() =>
                            setSelectedComplaintForAssign(complaint)
                          }
                          className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                        >
                          <FaUserPlus className="mr-2" /> Assign Worker
                        </button>
                      )}
                    {complaint.status === "Resolved" &&
                      !complaint.resolution && (
                        <button
                          onClick={() =>
                            setSelectedComplaintForFeedback(complaint)
                          }
                          className="flex items-center bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600"
                        >
                          <FaComments className="mr-2" /> Give Feedback
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
            {complaints.length === 0 && (
              <p className="text-center text-gray-600">No complaints found.</p>
            )}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {selectedComplaintForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Assign Worker to {selectedComplaintForAssign.complaintId}
              </h2>
              <button onClick={() => setSelectedComplaintForAssign(null)}>
                <FaTimes size={20} />
              </button>
            </div>
            <AssignForm
              propertyId={selectedProperty.propertyId}
              complaintId={selectedComplaintForAssign.complaintId}
              workers={workers}
              onAssign={handleAssign}
            />
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedComplaintForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Feedback for {selectedComplaintForFeedback.complaintId}
              </h2>
              <button onClick={() => setSelectedComplaintForFeedback(null)}>
                <FaTimes size={20} />
              </button>
            </div>
            <FeedbackForm
              propertyId={selectedProperty.propertyId}
              complaintId={selectedComplaintForFeedback.complaintId}
              onSubmit={handleFeedback}
            />
          </div>
        </div>
      )}
      <ToastContainer position="top-center" />
    </div>
  );
};

const AssignForm = ({ propertyId, complaintId, workers, onAssign }) => {
  const [workerId, setWorkerId] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workerId && estimatedTime) {
      onAssign(propertyId, complaintId, workerId, estimatedTime, notes);
    } else {
      toast.error("Please select a worker and estimated resolution time.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Worker
        </label>
        <select
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose Worker</option>
          {workers.map((w) => (
            <option key={w._id || w.id} value={w._id || w.id}>
              {w.name} ({w.role})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Estimated Resolution Time
        </label>
        <input
          type="datetime-local"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for the worker (e.g., task details)"
          className="mt-1 w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        Assign
      </button>
    </form>
  );
};

const FeedbackForm = ({ propertyId, complaintId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating && feedback) {
      onSubmit(propertyId, complaintId, rating, feedback);
    } else {
      toast.error("Please provide a rating and feedback.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Rating (1-5)
        </label>
        <div className="flex mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={24}
              className={`cursor-pointer ${
                star <= rating ? "text-yellow-500" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600"
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default ComplaintsSummary;