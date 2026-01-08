import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OrgSwitchRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch all requests
  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        const token = localStorage.getItem('orgToken');
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

  // Update room and bed status to Available
  const updateRoomAndBedStatus = async (token, propertyId, roomId, bedId) => {
    try {
      await fetch(
        `https://api.gharzoreality.com/api/landlord/properties/${propertyId}/rooms/${roomId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'Available', notes: 'Room vacated after switch' }),
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
          body: JSON.stringify({ status: 'Available', notes: 'Bed vacated after switch' }),
        }
      );
    } catch (err) {
      console.error('Failed to update room/bed status:', err);
      setError('Room switch succeeded, but failed to update room/bed status.');
    }
  };

  // Handle Approve or Reject action
  const handleAction = async (requestId, action, propertyId, currentRoomId, currentBedId) => {
    try {
      const token = localStorage.getItem('orgToken');
      if (!token) {
        setError('No authentication token found. Please log in as landlord.');
        navigate('/login');
        return;
      }
      setActionLoading((prev) => ({ ...prev, [requestId]: true }));
      let body = {};
      if (action === 'reject') {
        const reason = prompt('Please enter the reason for rejecting this request:');
        if (!reason) {
          setError('Rejection reason is required.');
          setActionLoading((prev) => ({ ...prev, [requestId]: false }));
          return;
        }
        body = { reason };
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
          await updateRoomAndBedStatus(token, propertyId, currentRoomId, currentBedId);
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
    <div className="min-h-screen bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5C4EFF] to-[#1fc9b2] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Room Switch Requests</h1>
              {/* <p className="text-[#e0f7f3] mt-1">Manage tenant room switch requests efficiently</p> */}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="relative bg-[#5C4EFF] hover:bg-[#1fc9b2] text-white px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow-md"
            >
              <span className="relative z-10">Back to Dashboard</span>
              <div className="absolute inset-0 bg-[#1fc9b2] opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Pending Requests', count: requests.filter((req) => req.status === 'pending').length, color: 'from-[#FBBF24] to-[#D4A017]', icon: <FaClock className="text-3xl" /> },
              { title: 'Approved Requests', count: requests.filter((req) => req.status === 'approved').length, color: 'from-[#10B981] to-[#047857]', icon: <FaCheckCircle className="text-3xl" /> },
              { title: 'Rejected Requests', count: requests.filter((req) => req.status === 'rejected').length, color: 'from-[#DC2626] to-[#B91C1C]', icon: <FaTimesCircle className="text-3xl" /> },
            ].map((stat) => (
              <div
                key={stat.title}
                className="relative bg-white rounded-lg shadow-lg p-6 transition duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#4B5563] uppercase">{stat.title}</p>
                    <p className="text-3xl font-bold text-[#1F2937]">{stat.count}</p>
                  </div>
                  <div
                    className={`relative p-3 bg-gradient-to-br ${stat.color} text-white rounded-full shadow-md transform hover:scale-110 hover:-translate-y-1 transition duration-300 perspective-1000`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {stat.icon}
                    <div className="absolute inset-0 bg-black opacity-10 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden lg:table-cell">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden md:table-cell">
                    Current Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden md:table-cell">
                    Requested Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden xl:table-cell">
                    Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#F3F4F6] transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">
                      {req.requestId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden lg:table-cell">
                      {req.propertyId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden md:table-cell">
                      R{req.currentRoomId} • B{req.currentBedId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden md:table-cell">
                      R{req.requestedRoomId} • B{req.requestedBedId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-md transform hover:scale-105 transition duration-300 perspective-1000 ${getStatusColor(
                          req.status
                        )}`}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {getStatusIcon(req.status)} <span className="ml-1">{req.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden lg:table-cell">
                      {new Date(req.requestDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] hidden xl:table-cell">
                      {req.responseDate
                        ? new Date(req.responseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {req.status === 'pending' ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              handleAction(req._id, 'approve', req.propertyId._id, req.currentRoomId, req.currentBedId)
                            }
                            disabled={actionLoading[req._id]}
                            className="relative bg-gradient-to-br from-[#1fc9b2] to-[#5C4EFF] text-white px-4 py-2 rounded-lg hover:from-[#5C4EFF] hover:to-[#1fc9b2] disabled:bg-[#b2f7e7]/50 transition duration-300 transform hover:scale-105 shadow-md"
                          >
                            <span className="relative z-10 flex items-center">
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
                            onClick={() => handleAction(req._id, 'reject')}
                            disabled={actionLoading[req._id]}
                            className="relative bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white px-4 py-2 rounded-lg hover:from-[#991B1B] hover:to-[#7F1D1D] disabled:bg-[#FCA5A5]/50 transition duration-300 transform hover:scale-105 shadow-md"
                          >
                            <span className="relative z-10 flex items-center">
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
      </main>
    </div>
  );
};

export default OrgSwitchRequests;