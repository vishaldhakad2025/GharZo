import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const LandlordSwitchRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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

  // Fetch all requests
  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in as landlord.');
          navigate('/login');
          return;
        }
        setLoading(true);
        const res = await fetch('https://api.gharzoreality.com/api/room-switch/all-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setRequests(data);
          setFilteredRequests(data);
          if (data.length === 0) {
            setError('No room switch requests found.');
          }
        } else {
          setRequests([]);
          setFilteredRequests([]);
          setError(data.message || 'Could not fetch requests.');
        }
      } catch (err) {
        setError('Failed to connect to the server. Please try again later.');
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRequests();
  }, [navigate]);

  // Filter requests based on tab and dates
  useEffect(() => {
    let filtered = requests.filter((req) => req.status === activeTab);
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter((req) => new Date(req.requestDate) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter((req) => new Date(req.requestDate) <= to);
    }
    setFilteredRequests(filtered);
  }, [activeTab, fromDate, toDate, requests]);

  // Update room and bed status
  const updateRoomAndBedStatus = async (token, propertyId, roomId, bedId, status, roomNotes, bedNotes) => {
    try {
      await fetch(
        `https://api.gharzoreality.com/api/landlord/properties/${propertyId}/rooms/${roomId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, notes: roomNotes }),
        }
      );
      await fetch(
        `https://api.gharzoreality.com/api/landlord/properties/${propertyId}/rooms/${roomId}/beds/${bedId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, notes: bedNotes }),
        }
      );
    } catch (err) {
      console.error('Failed to update room/bed status:', err);
      setError('Room switch succeeded, but failed to update room/bed status.');
    }
  };

  // Handle Approve or Reject action
  const handleAction = async (requestId, action, opts = {}) => {
    const { propertyId, currentRoomId, currentBedId, requestedRoomId, requestedBedId } = opts;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in as landlord.');
        navigate('/login');
        return;
      }
      setActionLoading((prev) => ({ ...prev, [requestId]: true }));
      let body = {};
      if (action === 'reject') {
        if (!rejectReason.trim()) {
          setError('Rejection reason is required.');
          setActionLoading((prev) => ({ ...prev, [requestId]: false }));
          return;
        }
        body = { reason: rejectReason };
        setRejectReason(''); // Reset reason
        setShowRejectModal(false); // Close modal
      }
      const endpoint = `https://api.gharzoreality.com/api/room-switch/${action}/${requestId}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === 'approve') {
          if (!propertyId || !currentRoomId || !currentBedId || !requestedRoomId || !requestedBedId) {
            setError('Missing required information for approval.');
            setActionLoading((prev) => ({ ...prev, [requestId]: false }));
            return;
          }
          await updateRoomAndBedStatus(
            token,
            propertyId,
            currentRoomId,
            currentBedId,
            'Available',
            'Room vacated after switch',
            'Bed vacated after switch'
          );
          await updateRoomAndBedStatus(
            token,
            propertyId,
            requestedRoomId,
            requestedBedId,
            'Occupied',
            'Room occupied after switch',
            'Bed assigned after switch'
          );
        }
        const refreshRes = await fetch('https://api.gharzoreality.com/api/room-switch/all-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && Array.isArray(refreshData)) {
          setRequests(refreshData);
          if (refreshData.length === 0) {
            setError('No room switch requests found.');
          }
        } else {
          setRequests([]);
          setError(refreshData.message || 'Could not refresh requests.');
        }
      } else {
        setError(data.message || `Failed to ${action} request.`);
      }
    } catch (err) {
      setError(`Failed to ${action} request. Please try again later.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const openRejectModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setCurrentRequestId(null);
    setRejectReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-600/80 text-white';
      case 'approved':
        return 'bg-teal-600/80 text-white';
      case 'rejected':
        return 'bg-red-600/80 text-white';
      default:
        return 'bg-gray-600/80 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-sm" />;
      case 'approved':
        return <FaCheckCircle className="text-sm" />;
      case 'rejected':
        return <FaTimesCircle className="text-sm" />;
      default:
        return <FaClock className="text-sm" />;
    }
  };

  const getTabStyles = (tabId) => {
    switch (tabId) {
      case 'pending':
        return {
          active: 'bg-orange-600/80 text-white border-b-4 border-orange-400',
          inactive: 'text-gray-400 hover:bg-white/10 hover:text-orange-300',
          iconBg: 'bg-orange-600/80',
        };
      case 'approved':
        return {
          active: 'bg-teal-600/80 text-white border-b-4 border-teal-400',
          inactive: 'text-gray-400 hover:bg-white/10 hover:text-teal-300',
          iconBg: 'bg-teal-600/80',
        };
      case 'rejected':
        return {
          active: 'bg-red-600/80 text-white border-b-4 border-red-400',
          inactive: 'text-gray-400 hover:bg-white/10 hover:text-red-300',
          iconBg: 'bg-red-600/80',
        };
      default:
        return {
          active: 'bg-gray-600/80 text-white border-b-4 border-gray-400',
          inactive: 'text-gray-400 hover:bg-white/10',
          iconBg: 'bg-gray-600/80',
        };
    }
  };

  return (
    <div
      className={`min-h-screen p-4 relative text-gray-100 transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-orange-300 drop-shadow-lg">
          Room Switch Requests
        </h2>
        <p className="text-gray-300 mt-2">Manage tenant room switch requests</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-white/10">
            {[
              { id: 'pending', label: 'Pending', count: requests.filter((req) => req.status === 'pending').length, icon: <FaClock className="text-lg" /> },
              { id: 'approved', label: 'Approved', count: requests.filter((req) => req.status === 'approved').length, icon: <FaCheckCircle className="text-lg" /> },
              { id: 'rejected', label: 'Rejected', count: requests.filter((req) => req.status === 'rejected').length, icon: <FaTimesCircle className="text-lg" /> },
            ].map((tab) => {
              const styles = getTabStyles(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-3 transition duration-300 ${
                    activeTab === tab.id ? styles.active : styles.inactive
                  }`}
                >
                  <div className={`p-3 rounded-xl ${styles.iconBg} shadow-lg`}>
                    {tab.icon}
                  </div>
                  <div>
                    <div className="text-lg">{tab.label}</div>
                    <div className="text-sm opacity-80">({tab.count})</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-orange-300 mb-4">Filter by Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="inline-block relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin border-t-orange-400"></div>
            </div>
            <p className="text-xl font-medium text-gray-300 mt-6">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/50 p-10 text-center">
            <div className="p-4 bg-red-600/80 rounded-full inline-block mb-4">
              <FaTimesCircle className="text-4xl" />
            </div>
            <p className="text-xl font-medium text-red-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-orange-600/80 text-white rounded-xl hover:bg-orange-500 transition shadow-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="p-4 bg-orange-600/80 rounded-full inline-block mb-4">
              <FaClock className="text-4xl" />
            </div>
            <p className="text-xl font-medium text-gray-300 mb-6">No requests found</p>
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setActiveTab('pending');
              }}
              className="px-8 py-3 bg-orange-600/80 text-white rounded-xl hover:bg-orange-500 transition shadow-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-orange-300 uppercase">Property</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase">Current</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase">Requested</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {req.propertyId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        Room {req.currentRoomId} • Bed {req.currentBedId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        Room {req.requestedRoomId} • Bed {req.requestedBedId}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg ${getStatusColor(req.status)} backdrop-blur-sm`}>
                          {getStatusIcon(req.status)}
                          <span className="ml-2 capitalize">{req.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(req.requestDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'pending' ? (
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() =>
                                handleAction(req._id, 'approve', {
                                  propertyId: req.propertyId._id,
                                  currentRoomId: req.currentRoomId,
                                  currentBedId: req.currentBedId,
                                  requestedRoomId: req.requestedRoomId,
                                  requestedBedId: req.requestedBedId,
                                })
                              }
                              disabled={actionLoading[req._id]}
                              className="px-5 py-2.5 bg-teal-600/80 text-white text-sm font-medium rounded-xl hover:bg-teal-500 disabled:opacity-60 transition flex items-center gap-2 shadow-lg backdrop-blur-sm"
                            >
                              {actionLoading[req._id] ? 'Processing...' : (
                                <>
                                  <FaCheckCircle />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openRejectModal(req._id)}
                              disabled={actionLoading[req._id]}
                              className="px-5 py-2.5 bg-red-600/80 text-white text-sm font-medium rounded-xl hover:bg-red-500 disabled:opacity-60 transition flex items-center gap-2 shadow-lg backdrop-blur-sm"
                            >
                              <FaTimesCircle />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 max-w-md w-full p-8">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-red-600/80 rounded-xl mr-4">
                  <FaTimesCircle className="text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-orange-300">Reject Request</h3>
              </div>
              <p className="text-gray-300 mb-4">Please provide a reason for rejection:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                rows={5}
              />
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={closeRejectModal}
                  className="px-6 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(currentRequestId, 'reject')}
                  disabled={!rejectReason.trim() || actionLoading[currentRequestId]}
                  className="px-6 py-3 bg-red-600/80 text-white rounded-xl hover:bg-red-500 disabled:opacity-60 transition shadow-lg"
                >
                  {actionLoading[currentRequestId] ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordSwitchRequests;