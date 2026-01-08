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
        return 'bg-gradient-to-br from-[#5C4EFF] to-[#1fc9b2] text-white border-[#1fc9b2]';
      case 'approved':
        return 'bg-gradient-to-br from-[#1fc9b2] to-[#5C4EFF] text-white border-[#5C4EFF]';
      case 'rejected':
        return 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white border-[#B91C1C]';
      default:
        return 'bg-gradient-to-br from-[#4B5563] to-[#374151] text-white border-[#374151]';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-lg" />;
      case 'approved':
        return <FaCheckCircle className="text-lg" />;
      case 'rejected':
        return <FaTimesCircle className="text-lg" />;
      default:
        return <FaClock className="text-lg" />;
    }
  };

  const getTabStyles = (tabId) => {
    switch (tabId) {
      case 'pending':
        return {
          active: 'bg-gradient-to-br from-[#5C4EFF] to-[#1fc9b2] text-white border-b-2 border-[#1fc9b2]',
          inactive: 'text-[#4B5563] hover:bg-[#5C4EFF]/10 hover:text-[#1fc9b2]',
          iconBg: 'bg-gradient-to-br from-[#5C4EFF] to-[#1fc9b2]',
        };
      case 'approved':
        return {
          active: 'bg-gradient-to-br from-[#1fc9b2] to-[#5C4EFF] text-white border-b-2 border-[#5C4EFF]',
          inactive: 'text-[#4B5563] hover:bg-[#1fc9b2]/10 hover:text-[#5C4EFF]',
          iconBg: 'bg-gradient-to-br from-[#1fc9b2] to-[#5C4EFF]',
        };
      case 'rejected':
        return {
          active: 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white border-b-2 border-[#B91C1C]',
          inactive: 'text-[#4B5563] hover:bg-[#DC2626]/10 hover:text-[#B91C1C]',
          iconBg: 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C]',
        };
      default:
        return {
          active: 'bg-gradient-to-br from-[#4B5563] to-[#374151] text-white border-b-2 border-[#374151]',
          inactive: 'text-[#4B5563] hover:bg-[#4B5563]/10 hover:text-[#374151]',
          iconBg: 'bg-gradient-to-br from-[#4B5563] to-[#374151]',
        };
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7] p-4 md:p-6 relative text-gray-800 transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5C4EFF] to-[#1fc9b2] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Room Switch Requests</h1>
              {/* <p className="text-[#e0f7f3] mt-1">Manage tenant room switch requests efficiently</p> */}
            </div>
            
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex border-b border-[#E5E7EB]">
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
                  className={`relative flex-1 py-4 px-6 text-center font-semibold flex items-center justify-center gap-2 transition duration-300 ${
                    activeTab === tab.id ? styles.active : styles.inactive
                  }`}
                >
                  <span
                    className={`p-2 ${styles.iconBg} text-white rounded-full shadow-md transform ${
                      activeTab === tab.id ? 'scale-110' : 'scale-100'
                    } transition duration-300 perspective-1000`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>
        {/* Date Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition duration-300 bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition duration-300 bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB]"
              />
            </div>
          </div>
        </div>
        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-[#93C5FD] rounded-full animate-spin border-t-[#3B82F6]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] rounded-full shadow-md transform scale-75 perspective-1000" style={{ transformStyle: 'preserve-3d' }}></div>
              </div>
              <p className="text-lg font-semibold text-[#4B5563]">Loading requests...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg shadow-lg p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white rounded-full shadow-md transform hover:scale-110 transition duration-300 perspective-1000" style={{ transformStyle: 'preserve-3d' }}>
                <FaTimesCircle className="text-2xl" />
              </div>
              <p className="text-[#DC2626] mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="relative bg-[#DC2626] text-white px-6 py-2 rounded-lg hover:bg-[#B91C1C] transition duration-300 transform hover:scale-105 shadow-md"
              >
                <span className="relative z-10">Retry</span>
                <div className="absolute inset-0 bg-[#991B1B] opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#4B5563] to-[#374151] text-white rounded-full shadow-md transform hover:scale-110 transition duration-300 perspective-1000" style={{ transformStyle: 'preserve-3d' }}>
                <FaClock className="text-2xl" />
              </div>
              <p className="text-[#4B5563] mb-4">No requests found for the selected criteria.</p>
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setActiveTab('pending');
                }}
                className="relative bg-[#3B82F6] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition duration-300 transform hover:scale-105 shadow-md"
              >
                <span className="relative z-10">Clear Filters</span>
                <div className="absolute inset-0 bg-[#1E40AF] opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-[#E5E7EB] w-[1000px]"> {/* Fixed min width to force scroll if needed */}
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden lg:table-cell w-48">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden md:table-cell w-40">
                    Current Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden md:table-cell w-40">
                    Requested Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden lg:table-cell w-32">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden xl:table-cell w-32">
                    Response
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider w-56">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#F3F4F6] transition duration-200">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden lg:table-cell">
                      {req.propertyId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden md:table-cell">
                      R{req.currentRoomId} • B{req.currentBedId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden md:table-cell">
                      R{req.requestedRoomId} • B{req.requestedBedId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-md transform hover:scale-105 transition duration-300 perspective-1000 ${getStatusColor(
                          req.status
                        )}`}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {getStatusIcon(req.status)} <span className="ml-1">{req.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden lg:table-cell">
                      {new Date(req.requestDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden xl:table-cell">
                      {req.responseDate
                        ? new Date(req.responseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {req.status === 'pending' ? (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-3 space-x-0">
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
                            className="relative bg-gradient-to-br from-[#1fc9b2] to-[#5C4EFF] text-white px-3 py-2 rounded-lg hover:from-[#5C4EFF] hover:to-[#1fc9b2] disabled:bg-[#b2f7e7]/50 transition duration-300 transform hover:scale-105 shadow-md flex-shrink-0 w-full sm:w-auto"
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              {actionLoading[req._id] ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-3.042 1.135-5.824 3-7.938v2.177c0 .077.02.155.056.232C6.206 4.387 6.02 4.5 6 4.5c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v3c0 .2.1.4.2.5.1.1.3.2.5.2.02 0 .04-.01.06-.02.036-.01.07-.03.1-.05.03-.02.06-.04.09-.06z"
                                    ></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle className="mr-2" />
                                  Approve
                                </>
                              )}
                            </span>
                            <div className="absolute inset-0 bg-[#034E3B] opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                          </button>
                          <button
                            onClick={() => openRejectModal(req._id)}
                            disabled={actionLoading[req._id]}
                            className="relative bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white px-3 py-2 rounded-lg hover:from-[#991B1B] hover:to-[#7F1D1D] disabled:bg-[#FCA5A5]/50 transition duration-300 transform hover:scale-105 shadow-md flex-shrink-0 w-full sm:w-auto"
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              {actionLoading[req._id] ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-3.042 1.135-5.824 3-7.938v2.177c0 .077.02.155.056.232C6.206 4.387 6.02 4.5 6 4.5c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v3c0 .2.1.4.2.5.1.1.3.2.5.2.02 0 .04-.01.06-.02.036-.01.07-.03.1-.05.03-.02.06-.04.09-.06z"
                                    ></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="mr-2" />
                                  Reject
                                </>
                              )}
                            </span>
                            <div className="absolute inset-0 bg-[#7F1D1D] opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#9CA3AF]">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white rounded-full mr-3">
                    <FaTimesCircle className="text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Room Switch Request</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this request:</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] transition duration-300 resize-vertical min-h-[100px]"
                  rows={4}
                />
                <div className="flex space-x-3 mt-6 justify-end">
                  <button
                    onClick={closeRejectModal}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(currentRequestId, 'reject')}
                    disabled={!rejectReason.trim() || actionLoading[currentRequestId]}
                    className="px-4 py-2 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white rounded-lg hover:from-[#991B1B] hover:to-[#7F1D1D] disabled:opacity-50 transition duration-300 disabled:cursor-not-allowed"
                  >
                    {actionLoading[currentRequestId] ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-3.042 1.135-5.824 3-7.938v2.177c0 .077.02.155.056.232C6.206 4.387 6.02 4.5 6 4.5c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v3c0 .2.1.4.2.5.1.1.3.2.5.2.02 0 .04-.01.06-.02.036-.01.07-.03.1-.05.03-.02.06-.04.09-.06z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Reject'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordSwitchRequests;