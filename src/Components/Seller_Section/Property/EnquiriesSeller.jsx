import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUserAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaEdit,
  FaExclamationTriangle,
  FaEye,FaTimes,FaInfo,
  FaFilter ,FaDownload ,
  FaPlus ,FaCalendarCheck ,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const EnquiriesSeller = () => {
  const [allVisits, setAllVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const showDialog = (title, message) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear + i);
  };

  const getStatusConfig = (status) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case "CONFIRMED":
        return {
          icon: FaCheckCircle,
          color: "bg-green-100 text-green-800 border-green-200",
          iconColor: "text-green-600",
          text: "Confirmed"
        };
      case "SCHEDULED":
        return {
          icon: FaHourglassHalf,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          iconColor: "text-yellow-600",
          text: "Scheduled"
        };
      case "CANCELLED":
        return {
          icon: FaTimesCircle,
          color: "bg-red-100 text-red-800 border-red-200",
          iconColor: "text-red-600",
          text: "Cancelled"
        };
      default:
        return {
          icon: FaHourglassHalf,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          iconColor: "text-gray-600",
          text: status || "Pending"
        };
    }
  };

  useEffect(() => {
    const fetchAllVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("sellertoken");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }
        console.log("Fetching visits with token:", token.substring(0, 20) + "...");
        const res = await axios.get(`${baseurl}api/seller/getallvisits`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched visits:", res.data);
        if (res.data && Array.isArray(res.data.visits)) {
          setAllVisits(res.data.visits);
          setFilteredVisits(res.data.visits);
        } else {
          setAllVisits([]);
          setFilteredVisits([]);
          setError("No visits data found in response.");
        }
      } catch (err) {
        console.error("Error fetching visits:", err);
        setAllVisits([]);
        setFilteredVisits([]);
        setError(
          err.response?.status === 401
            ? "Unauthorized access. Please log in again."
            : err.response?.status === 404
            ? "Visits endpoint not found. Please check the API."
            : err.response?.data?.message || err.message || "Failed to fetch visits."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllVisits();
  }, []);

  // Filter visits based on selected date (progressive filtering)
  useEffect(() => {
    const filtered = allVisits.filter((visit) => {
      if (!visit.scheduledDate) return false;
      const visitDate = new Date(visit.scheduledDate);
      const visitYear = visitDate.getFullYear().toString();
      const visitMonth = (visitDate.getMonth() + 1).toString().padStart(2, '0');
      const visitDay = visitDate.getDate().toString().padStart(2, '0');

      // Match year if selected
      if (selectedYear && visitYear !== selectedYear) return false;

      // Match month if selected
      if (selectedMonth && visitMonth !== selectedMonth) return false;

      // Match day if selected
      if (selectedDay && visitDay !== selectedDay) return false;

      return true;
    });
    setFilteredVisits(filtered);
  }, [selectedYear, selectedMonth, selectedDay, allVisits]);

  const openDetailsModal = (visit) => {
    setSelectedVisit(visit);
    setActionError(null);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVisit(null);
    setActionError(null);
  };

  const openConfirmModal = (visit) => {
    setSelectedVisit(visit);
    setConfirmationNotes('');
    setMeetingPoint('');
    setActionError(null);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedVisit(null);
    setConfirmationNotes('');
    setMeetingPoint('');
    setActionError(null);
  };

  const openCancelModal = (visit) => {
    setSelectedVisit(visit);
    setCancelReason('');
    setActionError(null);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedVisit(null);
    setCancelReason('');
    setActionError(null);
  };

  // Cancel visit API call
  const handleCancelVisit = async () => {
    if (!selectedVisit || !cancelReason.trim()) {
      setActionError("Please provide a reason for cancellation.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      console.log("Cancelling visit ID:", selectedVisit._id);
      const res = await axios.post(
        `${baseurl}api/seller/cancel-visit/${selectedVisit._id}`,
        { reason: cancelReason },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Cancel visit response:", res.data);
      if (res.data.success) {
        showDialog("Success", "Visit cancelled successfully!");
        const updatedVisits = allVisits.map(v => v._id === res.data.visit._id ? res.data.visit : v);
        setAllVisits(updatedVisits);
        let filterDate = '';
        if (selectedYear && selectedMonth && selectedDay) {
          filterDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`;
        }
        if (filterDate) {
          const updatedFiltered = updatedVisits.filter(v => {
            const visitDate = new Date(v.scheduledDate).toISOString().split("T")[0];
            return visitDate === filterDate;
          });
          setFilteredVisits(updatedFiltered);
        } else {
          setFilteredVisits(updatedVisits);
        }
        setTimeout(() => {
          closeModal();
          closeCancelModal();
        }, 2000);
      } else {
        setActionError("Failed to cancel visit.");
      }
    } catch (err) {
      console.error("Error cancelling visit:", err);
      setActionError(
        err.response?.status === 500
          ? "Server error while cancelling visit. Please try again or contact support."
          : err.response?.data?.message || err.message || "Failed to cancel visit."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm visit API call
  const handleConfirmVisit = async () => {
    if (!selectedVisit) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      console.log("Confirming visit ID:", selectedVisit._id);
      const res = await axios.post(
        `${baseurl}api/seller/confirm-visit/${selectedVisit._id}`,
        {
          confirmationNotes,
          meetingPoint
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Confirm visit response:", res.data);
      if (res.data.success) {
        showDialog("Success", "Visit confirmed successfully!");
        const updatedVisits = allVisits.map(v => v._id === res.data.visit._id ? res.data.visit : v);
        setAllVisits(updatedVisits);
        let filterDate = '';
        if (selectedYear && selectedMonth && selectedDay) {
          filterDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`;
        }
        if (filterDate) {
          const updatedFiltered = updatedVisits.filter(v => {
            const visitDate = new Date(v.scheduledDate).toISOString().split("T")[0];
            return visitDate === filterDate;
          });
          setFilteredVisits(updatedFiltered);
        } else {
          setFilteredVisits(updatedVisits);
        }
        setTimeout(() => {
          closeModal();
          closeConfirmModal();
        }, 2000);
      } else {
        setActionError("Failed to confirm visit.");
      }
    } catch (err) {
      console.error("Error confirming visit:", err);
      setActionError(
        err.response?.status === 500
          ? "Server error while confirming visit. Please try again or contact support."
          : err.response?.data?.message || err.message || "Failed to confirm visit."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500 text-center">Loading visits...</p>;
    }

    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!filteredVisits?.length) {
      return <p className="text-gray-500 text-center">No visits found for the selected date.</p>;
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisits.map((item, index) => {
          const displayItem = {
            property: item.propertyId?.name || "N/A",
            user: item.name || item.userId?.email || "N/A",
            status: item.status || "Pending",
            date: item.scheduledDate
              ? new Date(item.scheduledDate).toISOString().split("T")[0]
              : null,
            time: item.scheduledDate
              ? new Date(item.scheduledDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            fullData: item,
          };

          const statusConfig = getStatusConfig(displayItem.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-purple-500/20 transition"
            >
              <h3 className="flex items-center gap-2 text-purple-600 text-lg font-semibold mb-2">
                <FaHome className="text-blue-500 drop-shadow-lg" />
                {displayItem.property || "N/A"}
              </h3>
              <p className="flex items-center gap-2 text-gray-700 text-sm">
                <FaUserAlt className="text-green-500 drop-shadow-lg" /> User:{" "}
                {displayItem.user || "N/A"}
              </p>
              {displayItem.date && (
                <p className="flex items-center gap-2 text-gray-700 text-sm">
                  <FaCalendarAlt className="text-yellow-500 drop-shadow-lg" /> Date:{" "}
                  {displayItem.date}
                </p>
              )}
              {displayItem.time && (
                <p className="flex items-center gap-2 text-gray-700 text-sm">
                  <FaClock className="text-pink-500 drop-shadow-lg" /> Time:{" "}
                  {displayItem.time}
                </p>
              )}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${statusConfig.color}`}>
                <StatusIcon className={`mr-2 ${statusConfig.iconColor} drop-shadow-sm`} />
                {statusConfig.text}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => openDetailsModal(displayItem.fullData)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <FaEye /> View Details
                </button>
                {displayItem.status.toUpperCase() === "SCHEDULED" && (
                  <button
                    onClick={() => openConfirmModal(displayItem.fullData)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                  >
                    Confirm Visit
                  </button>
                )}
                {(displayItem.status.toUpperCase() === "SCHEDULED" || displayItem.status.toUpperCase() === "CONFIRMED") && (
                  <button
                    onClick={() => openCancelModal(displayItem.fullData)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                  >
                    Cancel Visit
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderDetailsModal = () => (
    <AnimatePresence>
      {showDetailsModal && selectedVisit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailsModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                <FaInfoCircle /> Visit Details
              </h3>
              <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <FaHome className="text-blue-500" /> <strong>Property:</strong>{" "}
                {selectedVisit.propertyId?.name || "N/A"}<br />
                <FaMapMarkerAlt className="text-green-500 ml-6" />{" "}
                {selectedVisit.propertyId?.address || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaUserAlt className="text-indigo-500" /> <strong>User Name:</strong>{" "}
                {selectedVisit.name || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-orange-500" /> <strong>Email:</strong>{" "}
                {selectedVisit.email || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaPhoneAlt className="text-green-500" /> <strong>Mobile:</strong>{" "}
                {selectedVisit.mobile || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaCalendarAlt className="text-yellow-500" /> <strong>Scheduled Date:</strong>{" "}
                {selectedVisit.scheduledDate
                  ? new Date(selectedVisit.scheduledDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaClock className="text-pink-500" /> <strong>Scheduled Time:</strong>{" "}
                {selectedVisit.scheduledDate
                  ? new Date(selectedVisit.scheduledDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaInfoCircle className="text-purple-500" /> <strong>Purpose:</strong>{" "}
                {selectedVisit.purpose || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaEdit className="text-gray-500" /> <strong>Notes:</strong>{" "}
                {selectedVisit.notes || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle
                  className={
                    selectedVisit.status === "CONFIRMED" ? "text-green-500" : "text-yellow-500"
                  }
                />{" "}
                <strong>Status:</strong> {selectedVisit.status || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <strong>Created:</strong>{" "}
                {selectedVisit.createdAt
                  ? new Date(selectedVisit.createdAt).toLocaleString()
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <strong>Updated:</strong>{" "}
                {selectedVisit.updatedAt
                  ? new Date(selectedVisit.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderConfirmModal = () => (
    <AnimatePresence>
      {showConfirmModal && selectedVisit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeConfirmModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
                <FaCheckCircle /> Confirm Visit
              </h3>
              <button onClick={closeConfirmModal} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            {actionError && (
              <p className="text-red-500 flex items-center gap-2 mb-3">
                <FaExclamationTriangle /> {actionError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Notes</label>
                <textarea
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter confirmation notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Point</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter meeting point..."
                />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVisit}
                disabled={actionLoading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-1"
              >
                {actionLoading ? "Confirming..." : (
                  <>
                    <FaCheckCircle /> Confirm
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderCancelModal = () => (
    <AnimatePresence>
      {showCancelModal && selectedVisit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeCancelModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <FaTimesCircle /> Cancel Visit
              </h3>
              <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            {actionError && (
              <p className="text-red-500 flex items-center gap-2 mb-3">
                <FaExclamationTriangle /> {actionError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={closeCancelModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelVisit}
                disabled={actionLoading || !cancelReason.trim()}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-1"
              >
                {actionLoading ? "Cancelling..." : (
                  <>
                    <FaTimesCircle /> Confirm Cancel
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // return (
  //   <>
  //     {/* Dialog Modal */}
  //     {showModal && (
  //       <>
  //         <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeModal}></div>
  //         <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
  //           <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full border border-green-500">
  //             <div className="flex justify-between items-center mb-4">
  //               <h3 className="text-lg font-bold text-gray-900">{modalContent.title}</h3>
  //               <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
  //                 <FaTimesCircle />
  //               </button>
  //             </div>
  //             <p className="text-sm text-green-600">
  //               {modalContent.message}
  //             </p>
  //             <div className="mt-4 flex justify-end">
  //               <button
  //                 onClick={closeModal}
  //                 className="px-4 py-2 rounded-md font-semibold bg-green-600 hover:bg-green-700 text-white"
  //               >
  //                 OK
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </>
  //     )}

  //     <div className="p-6 sm:p-10 max-w-7xl mx-auto bg-white min-h-screen relative">
  //       <h2 className="text-3xl mt-20 font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 drop-shadow-lg">
  //         All Visits
  //       </h2>

  //       {/* Date Filter */}
  //       <div className="flex justify-center mb-6">
  //         <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
  //           <FaCalendarAlt className="text-gray-500" />
  //           <select
  //             value={selectedYear}
  //             onChange={(e) => setSelectedYear(e.target.value)}
  //             className="outline-none text-gray-700 p-2 border rounded"
  //           >
  //             <option value="">Year</option>
  //             {generateYears().map((year) => (
  //               <option key={year} value={year}>
  //                 {year}
  //               </option>
  //             ))}
  //           </select>
  //           <select
  //             value={selectedMonth}
  //             onChange={(e) => setSelectedMonth(e.target.value)}
  //             className="outline-none text-gray-700 p-2 border rounded"
  //           >
  //             <option value="">Month</option>
  //             {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
  //               const monthValue = String(m).padStart(2, "0");
  //               return (
  //                 <option key={monthValue} value={monthValue}>
  //                   {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
  //                 </option>
  //               );
  //             })}
  //           </select>
  //           <select
  //             value={selectedDay}
  //             onChange={(e) => setSelectedDay(e.target.value)}
  //             className="outline-none text-gray-700 p-2 border rounded"
  //           >
  //             <option value="">Day</option>
  //             {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
  //               const dayValue = String(d).padStart(2, "0");
  //               return (
  //                 <option key={dayValue} value={dayValue}>
  //                   {d}
  //                 </option>
  //               );
  //             })}
  //           </select>
  //           {(selectedYear || selectedMonth || selectedDay) && (
  //             <button
  //               onClick={() => {
  //                 setSelectedYear("");
  //                 setSelectedMonth("");
  //                 setSelectedDay("");
  //               }}
  //               className="text-red-500 hover:text-red-700 ml-2"
  //             >
  //               Clear
  //             </button>
  //           )}
  //         </div>
  //       </div>

  //       <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-2xl">
  //         {renderContent()}
  //       </div>

  //       {renderDetailsModal()}
  //       {renderConfirmModal()}
  //       {renderCancelModal()}
  //     </div>
  //   </>
  // );

return (
  <>
    {/* SUCCESS / INFO MODAL - Enhanced */}
    {showModal && (
      <>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fadeIn"
          onClick={closeModal}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-100 max-w-md w-full transform animate-scaleIn"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                  <FaCalendarAlt className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalContent.title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors group"
              >
                <FaTimesCircle className="text-gray-400 group-hover:text-gray-600 text-lg transition-colors" />
              </button>
            </div>

            <p className="text-gray-600 leading-relaxed mb-2">
              {modalContent.message}
            </p>

            <div className="mt-8 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </>
    )}

    {/* PAGE WRAPPER */}
    <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">

      {/* PAGE HEADER - Enhanced */}
      <div className="mb-5">
        <div className="bg-gradient-to-r from-white to-orange-50 rounded-3xl p-8 border border-orange-100 shadow-xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full -translate-y-20 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100/20 to-orange-100/10 rounded-full translate-y-10 -translate-x-10"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <FaCalendarAlt className="text-white text-2xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Visit Management
                </h2>

              </div>
              <p className="text-gray-600 font-medium">
                Track, manage, and organize all property visit requests in one place
              </p>
             
            </div>
            
            
          </div>
        </div>
      </div>

      {/* DATE FILTER - Enhanced */}
      <div className="mb-5">
        <div className="bg-gradient-to-r from-white to-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Filter Timeline</h3>
                <p className="text-sm text-gray-500">Select specific dates to view visits</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="relative px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-w-[140px]"
                >
                  <option value="" className="text-gray-400">Select Year</option>
                  {generateYears().map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="relative px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-w-[160px]"
                >
                  <option value="" className="text-gray-400">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                    const monthValue = String(m).padStart(2, "0");
                    return (
                      <option key={monthValue} value={monthValue}>
                        {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="relative px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 min-w-[140px]"
                >
                  <option value="" className="text-gray-400">Select Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                    const dayValue = String(d).padStart(2, "0");
                    return (
                      <option key={dayValue} value={dayValue}>{d}</option>
                    );
                  })}
                </select>
              </div>

              {(selectedYear || selectedMonth || selectedDay) && (
                <button
                  onClick={() => {
                    setSelectedYear("");
                    setSelectedMonth("");
                    setSelectedDay("");
                  }}
                  className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 transition-all duration-300 border border-gray-200 hover:border-gray-300 flex items-center gap-2 group"
                >
                  <FaTimes className="text-gray-500 group-hover:text-gray-700 transition-colors" />
                  Clear Filters
                </button>
              )}
              
              <button className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 group">
                <FaFilter className="text-white text-sm" />
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Filter Status Indicator */}
          {(selectedYear || selectedMonth || selectedDay) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaInfo className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Active Filters Applied
                    </p>
                    <p className="text-xs text-blue-600">
                      Showing visits for {selectedYear || "All Years"}, {selectedMonth ? new Date(0, parseInt(selectedMonth)-1).toLocaleString("default", { month: "long" }) : "All Months"}{selectedDay && `, Day ${selectedDay}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-blue-700 border border-blue-200">
                    Filtered
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA - Enhanced */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-bl-3xl"></div>
          
          {/* Content Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Visit Records</h3>
              <p className="text-gray-600">All scheduled property visits and requests</p>
            </div>
           
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Total Visits</p>
                  <p className="text-2xl font-bold text-blue-700">156</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FaCalendarCheck className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">Scheduled</p>
                  <p className="text-2xl font-bold text-green-700">42</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <FaClock className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-5 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-orange-700">18</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <FaHourglassHalf className="text-orange-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-5 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-purple-700">96</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FaCheckCircle className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl border border-gray-200 p-1 shadow-inner">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* OTHER MODALS */}
      {renderDetailsModal()}
      {renderConfirmModal()}
      {renderCancelModal()}

      {/* Add this to your globals.css for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  </>
);

};

export default EnquiriesSeller;