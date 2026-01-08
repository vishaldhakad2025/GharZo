import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Home,
  User,
  FileText,
  Clock,
  Shield,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  PhoneCall,
  Key,
} from "lucide-react";

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OTP Verification Section States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!token) {
        toast.error("Please login to view complaints.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          "https://api.gharzoreality.com/api/workers/assigned-complaints",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setComplaints(res.data.complaints || []);
        } else {
          toast.error("No complaints found.");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load complaints.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  // Open OTP Modal — Pass full complaint object
  const openOtpModal = (complaint) => {
    setSelectedComplaintId(complaint.complaintId); // Use custom complaintId (COMP-xxx)
    setOtp("");
    setShowOtpModal(true);
  };

  // Close OTP Modal
  const closeOtpModal = () => {
    setShowOtpModal(false);
    setSelectedComplaintId(null);
    setOtp("");
  };

  // Verify OTP — Send complaintId (custom ID)
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/workers/verify-otp",
        {
          complaintId: selectedComplaintId, // ← CORRECT: COMP-xxx
          otp: otp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Complaint resolved successfully!");
        // Update local state using complaintId
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === selectedComplaintId
              ? { ...c, status: "Resolved", otp: { verified: true } }
              : c
          )
        );
        closeOtpModal();
      } else {
        toast.error(res.data.message || "Invalid OTP.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to verify OTP.";
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading Complaints...
          </p>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-700">Error</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Key className="w-6 h-6 text-indigo-600" />
                Verify OTP to Resolve
              </h3>
              <button
                onClick={closeOtpModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit OTP sent to the tenant to mark this complaint
                as <strong>Resolved</strong>.
              </p>

              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
              />

              <div className="flex gap-3">
                <button
                  onClick={closeOtpModal}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyOtp}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Resolve"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
              My Assigned Complaints
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Total:{" "}
              <span className="font-bold text-blue-600">
                {complaints.length}
              </span>
            </p>
          </div>

          {/* Complaints Grid */}
          {complaints.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-600">
                No complaints assigned yet.
              </p>
              <p className="text-gray-500 mt-2">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((complaint, index) => (
                <div
                  key={complaint._id || index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header: Status + Priority */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(complaint.status)}
                        <span className="font-semibold">{complaint.status}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Tenant Info */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{complaint.tenantName}</p>
                        <p className="text-sm text-gray-500">Tenant</p>
                      </div>
                    </div>

                    {/* Call Button with Number */}
                    <div className="flex items-center justify-between text-gray-700 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium">
                          {complaint.tenantMobile}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCall(complaint.tenantMobile)}
                        className="bg-green-500 hover:bg-green-600 p-2 rounded-full text-white transition-all"
                        title="Call Tenant"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <p className="text-sm truncate">{complaint.tenantEmail}</p>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Property Info */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <Home className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-sm">
                          <strong>Room:</strong> {complaint.roomId || "N/A"}
                        </p>
                        {complaint.bedId && (
                          <p className="text-sm">
                            <strong>Bed:</strong> {complaint.bedId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject & Description */}
                    <div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {complaint.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(complaint.createdAt)}</span>
                      </div>
                      {complaint.updatedAt !== complaint.createdAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Updated: {formatDate(complaint.updatedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Resolve with OTP Button */}
                    {complaint.status === "Accepted" && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openOtpModal(complaint)} // Pass full complaint
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Key className="w-5 h-5" />
                          Resolve with OTP
                        </button>
                      </div>
                    )}

                    {complaint.status === "Resolved" && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                        <p className="text-sm font-medium text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Resolved on {formatDate(complaint.resolvedAt || complaint.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignedComplaints;