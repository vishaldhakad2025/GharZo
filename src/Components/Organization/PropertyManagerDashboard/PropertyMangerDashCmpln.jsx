import React, { useState, useEffect, useMemo } from "react";
import {
  FaHome,
  FaExclamationTriangle,
  FaChartBar,
  FaSpinner,
  FaExclamationCircle,
  FaTimes,
  FaTools,
  FaUserPlus,
  FaComments,
  FaStar,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PropertyMangerDashCmpln() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState(null);
  const [selectedComplaintForFeedback, setSelectedComplaintForFeedback] = useState(null);

  /* ------------------------------------------------------------------ */
  /* FETCH COMPLAINTS + WORKERS */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const complaintsRes = await axios.get(
          "https://api.gharzoreality.com/api/pm/complaints/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const workersRes = await axios.get(
          "https://api.gharzoreality.com/api/pm/workers",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (complaintsRes.data.success) {
          setAllComplaints(complaintsRes.data.complaints || []);
        } else {
          setError("Failed to fetch complaints.");
        }

        if (workersRes.data.success) {
          setWorkers(workersRes.data.workers || []);
        } else {
          toast.warn("Could not load workers list.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ------------------------------------------------------------------ */
  /* MEMOIZED PROPERTY SUMMARY */
  /* ------------------------------------------------------------------ */
  const properties = useMemo(() => {
    const map = {};
    allComplaints.forEach((c) => {
      const pid = c.propertyId;
      if (!map[pid]) {
        map[pid] = {
          propertyId: pid,
          propertyName: c.propertyName,
          totalComplaints: 0,
          complaintsByStatus: {},
          ratingSummary: { averageRating: 0, totalRatings: 0 },
          commentCount: 0,
        };
      }
      map[pid].totalComplaints++;
      const status = c.status;
      map[pid].complaintsByStatus[status] = (map[pid].complaintsByStatus[status] || 0) + 1;

      if (c.resolution?.rating) {
        const r = map[pid].ratingSummary;
        r.totalRatings++;
        r.averageRating =
          (r.averageRating * (r.totalRatings - 1) + c.resolution.rating) / r.totalRatings;
      }
      if (c.resolution?.feedback) map[pid].commentCount++;
    });
    return Object.values(map);
  }, [allComplaints]);

  const selectedComplaints = useMemo(() => {
    if (!selectedProperty) return [];
    return allComplaints.filter((c) => c.propertyId === selectedProperty.propertyId);
  }, [allComplaints, selectedProperty]);

  /* ------------------------------------------------------------------ */
  /* STATUS CHANGE (PATCH) */
  /* ------------------------------------------------------------------ */
  const handleStatusChange = async (complaintId, status) => {
    try {
      const token = localStorage.getItem("token");
      const complaint = allComplaints.find((c) => c.complaintId === complaintId);
      if (!complaint || !complaint.tenantId) {
        toast.error("Tenant ID not found for this complaint.");
        return;
      }

      const url = `https://api.gharzoreality.com/api/pm/complaints/update/${complaint.tenantId}/${complaintId}`;

      const response = await axios.patch(
        url,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updated = response.data.complaint;

        setAllComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === complaintId
              ? {
                  ...c,
                  status: updated.status,
                  resolvedAt: updated.resolvedAt || c.resolvedAt,
                }
              : c
          )
        );

        toast.success(`Status updated to ${updated.status}`);
      }
    } catch (err) {
        console.error("Status update error:", err.response?.data);
        toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  /* ------------------------------------------------------------------ */
  /* ASSIGN WORKER (PATCH) */
  /* ------------------------------------------------------------------ */
  const handleAssign = async (complaintId, workerId, estimatedTime, notes) => {
    try {
      const token = localStorage.getItem("token");
      const complaint = allComplaints.find((c) => c.complaintId === complaintId);
      if (!complaint) throw new Error("Complaint not found");

      const url = `https://api.gharzoreality.com/api/pm/complaints/properties/${complaint.propertyId}/complaints/${complaintId}/assign-worker`;

      const response = await axios.patch(
        url,
        {
          workerId,
          estimatedResolutionTime: new Date(estimatedTime).toISOString(),
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

     if (response.data.success) {
  const { complaint: updated } = response.data;

  setAllComplaints((prev) =>
    prev.map((c) =>
      c.complaintId === complaintId
        ? {
            ...c,
            status: updated.status || "Accepted",
            assignedWorker: {
              workerId,
              workerName: workers.find((w) => w.id === workerId)?.name || "Worker",
              workerRole: "Maintenance",
              assignedAt: new Date().toISOString(),
            },
            estimatedResolutionTime: updated.estimatedResolutionTime,
            notes: notes,
          }
        : c
    )
  );

  setSelectedComplaintForAssign(null);
  toast.success(`Worker assigned successfully! 👷‍♂️`);
}
    } catch (err) {
      console.error("Assign error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to assign worker.");
    }
  };

  /* ------------------------------------------------------------------ */
  /* FEEDBACK (PATCH) */
  /* ------------------------------------------------------------------ */
  const handleFeedback = async (complaintId, rating, feedback, propertyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/pm/complaints/properties/${propertyId}/complaints/${complaintId}/feedback`,
        { rating, feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setAllComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === complaintId
              ? { ...c, resolution: { rating, feedback } }
              : c
          )
        );
        setSelectedComplaintForFeedback(null);
        toast.success("Feedback submitted!");
      }
    } catch (err) {
      console.error("Feedback error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    }
  };

  /* ------------------------------------------------------------------ */
  /* 3D ICON COMPONENT */
  /* ------------------------------------------------------------------ */
  const Colorful3DIcon = ({ icon: Icon, color = "from-blue-600 to-green-500", size = "lg", className = "" }) => (
    <motion.div
      className={`relative p-3 rounded-xl shadow-lg bg-gradient-to-br ${color} transform hover:scale-110 hover:rotate-3 transition-all duration-300 perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ y: -5 }}
    >
      <Icon className={`text-white text-${size} drop-shadow-lg`} />
      <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );

  /* ------------------------------------------------------------------ */
  /* LOADING / ERROR STATES */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Colorful3DIcon icon={FaSpinner} size="2xl" color="from-blue-500 to-purple-600" />
          <p className="mt-4 text-lg font-semibold text-gray-600">Loading Complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Colorful3DIcon icon={FaExclamationCircle} color="from-red-500 to-orange-500" />
          <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* MAIN RENDER */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
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

        {/* Total Complaints */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <Colorful3DIcon icon={FaExclamationTriangle} color="from-red-500 to-pink-600" />
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Complaints
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {properties.reduce((sum, p) => sum + p.totalComplaints, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.propertyId}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Colorful3DIcon icon={FaHome} color="from-blue-500 to-teal-500" size="xl" />
                <h3 className="text-lg font-bold text-gray-800">{property.propertyName}</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Colorful3DIcon icon={FaExclamationTriangle} color="from-red-500 to-pink-600" size="sm" />
                  <span>Total: {property.totalComplaints}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon icon={FaChartBar} color="from-purple-500 to-indigo-600" size="sm" />
                  <span>
                    Status:
                    <ul className="ml-4 list-disc">
                      {Object.entries(property.complaintsByStatus).map(([s, c]) => (
                        <li key={s}>
                          {s}: {c}
                        </li>
                      ))}
                    </ul>
                  </span>
                </p>
               {/*<p className="flex items-center gap-2">
                  <Colorful3DIcon icon={FaStar} color="from-yellow-500 to-orange-600" size="sm" />
                  <span>Avg Rating: {property.ratingSummary.averageRating.toFixed(1)}</span>
                </p> 
                <p className="flex items-center gap-2">
                  <Colorful3DIcon icon={FaComments} color="from-green-500 to-emerald-600" size="sm" />
                  <span>Comments: {property.commentCount}</span>
                </p>*/} 
              </div>
              <button
                onClick={() => setSelectedProperty(property)}
                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                View & Manage
              </button>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white rounded-2xl shadow-lg">
            No complaint data available.
          </div>
        )}
      </div>

      {/* ---------- Complaints Modal ---------- */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Complaints for {selectedProperty.propertyName}
              </h2>
              <button onClick={() => setSelectedProperty(null)}>
                <FaTimes size={24} className="text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedComplaints.map((c) => (
  <div key={c.complaintId} className="bg-white border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
    
    {/* New Heading - Subject as Title */}
    <div className="flex items-start gap-3 mb-4">
      <Colorful3DIcon icon={FaTools} color="from-orange-500 to-red-500" size="sm" />
      <div>
        <h3 className="text-lg font-bold text-gray-800 leading-tight">
          {c.subject}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
         {c.priority} Priority
        </p>
      </div>
    </div>

    {/* Status */}
    <div className="mb-3">
      <label className="text-sm font-medium text-gray-600">Status:</label>
      <select
        value={c.status}
        onChange={(e) => handleStatusChange(c.complaintId, e.target.value)}
        className="ml-2 border rounded-md px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-blue-500"
      >
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="Resolved">Resolved</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    {/* Description */}
    {c.description && (
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {c.description}
      </p>
    )}

    {/* Tenant Info */}
    <div className="text-sm text-gray-600 space-y-1 mb-4">
      <p>Tenant: <span className="font-medium">{c.tenantName}</span></p>
      <p>Mobile: {c.tenantMobile}</p>
      <p>Created: {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
    </div>

    {/* Assigned Worker */}
    {c.assignedWorker && (
      <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium mb-3">
        Assigned to {c.assignedWorker.workerName}
      </div>
    )}

    {/* Estimated Time */}
    {c.estimatedResolutionTime && (
      <p className="text-sm text-gray-600">
        Est. Resolution: {new Date(c.estimatedResolutionTime).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short"
        })}
      </p>
    )}

    {/* Resolution Feedback */}
    {c.resolution && (
      <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mt-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < c.resolution.rating ? "text-yellow-500" : "text-gray-300"} />
          ))}
          <span className="ml-2 font-medium">{c.resolution.rating}/5</span>
        </div>
        <p className="mt-1 italic">"{c.resolution.feedback}"</p>
      </div>
    )}

    {/* Action Buttons */}
    <div className="mt-5 flex flex-wrap gap-3">

      {/* Assign Worker Button */}
      {c.status === "Accepted" && !c.assignedWorker && (
        <button
          onClick={() => setSelectedComplaintForAssign(c)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
        >
          <FaUserPlus /> Assign Worker
        </button>
      )}

      {/* Feedback Button */}
      {c.status === "Resolved" && !c.resolution && (
        <button
          onClick={() => setSelectedComplaintForFeedback(c)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium transition"
        >
          <FaComments /> Give Feedback
        </button>
      )}

      {/* Already Assigned Tag */}
      {c.assignedWorker && c.status !== "Resolved" && (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          Worker Assigned
        </span>
      )}

    </div>
  </div>
))}
            </div>

            {selectedComplaints.length === 0 && (
              <p className="text-center text-gray-600">No complaints.</p>
            )}
          </div>
        </div>
      )}

      {/* ---------- Assign Modal ---------- */}
      {selectedComplaintForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Worker</h2>
              <button onClick={() => setSelectedComplaintForAssign(null)}>
                <FaTimes size={20} />
              </button>
            </div>
            <AssignForm
              complaint={selectedComplaintForAssign}
              workers={workers}
              onAssign={handleAssign}
            />
          </div>
        </div>
      )}

      {/* ---------- Feedback Modal ---------- */}
      {selectedComplaintForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Give Feedback</h2>
              <button onClick={() => setSelectedComplaintForFeedback(null)}>
                <FaTimes size={20} />
              </button>
            </div>
            <FeedbackForm
              complaintId={selectedComplaintForFeedback.complaintId}
              propertyId={selectedComplaintForFeedback.propertyId}
              onSubmit={handleFeedback}
            />
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ASSIGN FORM */
/* ------------------------------------------------------------------ */
const AssignForm = ({ complaint, workers, onAssign }) => {
  const [workerId, setWorkerId] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workerId || !estimatedTime) {
      toast.error("Select worker & estimated time.");
      return;
    }
    onAssign(complaint.complaintId, workerId, estimatedTime, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Worker</label>
        <select
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose Worker --</option>
          {workers?.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Estimated Resolution Time</label>
        <input
          type="datetime-local"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Task details..."
          className="mt-1 w-full p-2 border rounded-md h-20 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Assign Worker
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* FEEDBACK FORM */
/* ------------------------------------------------------------------ */
const FeedbackForm = ({ complaintId, onSubmit, propertyId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || !feedback.trim()) {
      toast.error("Rating & feedback required.");
      return;
    }
    onSubmit(complaintId, rating, feedback, propertyId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Rating</label>
        <div className="flex mt-1 space-x-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <FaStar
              key={s}
              size={28}
              className={`cursor-pointer ${s <= rating ? "text-yellow-500" : "text-gray-300"}`}
              onClick={() => setRating(s)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500"
          placeholder="How was the service?"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default PropertyMangerDashCmpln;