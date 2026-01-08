'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function PropertyManagerRoomSwitch() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [reqRes, sumRes] = await Promise.all([
        fetch('https://api.gharzoreality.com/api/pm/room-switch', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://api.gharzoreality.com/api/pm/room-switch/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const reqData = await reqRes.json();
      const sumData = await sumRes.json();

      if (reqRes.ok && reqData.success && Array.isArray(reqData.requests)) {
        setRequests(reqData.requests);
        setFilteredRequests(reqData.requests);
      } else {
        setRequests([]);
        setFilteredRequests([]);
        setError(reqData.message || 'Could not fetch requests.');
      }

      if (sumRes.ok && sumData.success && sumData.summary) {
        setSummary(sumData.summary);
      } else {
        setSummary({ pending: 0, approved: 0, rejected: 0 });
      }
    } catch (err) {
      setError('Failed to connect to the server.');
      setRequests([]);
      setFilteredRequests([]);
      setSummary({ pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

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

  const handleAction = async (requestId, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      navigate('/login');
      return;
    }
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    let endpoint = '';
    let body = null;

    if (action === 'approve') {
      endpoint = `https://api.gharzoreality.com/api/pm/room-switch/${requestId}/approve`;
    } else if (action === 'reject') {
      const reason = prompt('Please enter the reason for rejecting this request:');
      if (!reason || reason.trim() === '') {
        setError('Rejection reason is required.');
        setActionLoading((prev) => ({ ...prev, [requestId]: false }));
        return;
      }
      endpoint = `https://api.gharzoreality.com/api/pm/room-switch/${requestId}/reject`;
      body = { reason: reason.trim() };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchData();
        setError(null);
      } else {
        setError(data.message || `Failed to ${action} request.`);
      }
    } catch (err) {
      setError(`Failed to ${action} request.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const statusBadge = (status) => {
    const st = status.toLowerCase();
    if (st === 'pending') {
      return (
        <div className="inline-flex items-center gap-2 px-5 py-2 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full shadow-lg shadow-blue-500/30 animate-pulse-slow border border-blue-400">
          <FaClock className="w-5 h-5" />
          PENDING
        </div>
      );
    }
    if (st === 'approved') {
      return (
        <div className="inline-flex items-center gap-2 px-5 py-2 text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 animate-pulse-slow border border-green-400">
          <FaCheckCircle className="w-5 h-5" />
          APPROVED
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2 text-base font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-lg shadow-red-500/30 animate-pulse-slow border border-red-400">
        <FaTimesCircle className="w-5 h-5" />
        REJECTED
      </div>
    );
  };

  // NEW: Format Room ID → "Room R17"
  const formatRoomLabel = (roomId) => {
    if (!roomId) return 'Unknown Room';
    const match = roomId.match(/-R(\d+)$/);
    if (match) {
      return `Room R${match[1]}`;
    }
    return `Room ${roomId.split('-').pop()}`;
  };

  // NEW: Format Bed ID → "Bed edeqgh"
  const formatBedLabel = (bedId) => {
    if (!bedId) return 'Unknown Bed';
    const short = bedId.split('-').pop().substring(0, 6);
    return `Bed ${short}`;
  };

  // NEW: Combine Room + Bed
  const getRoomBedLabel = (roomId, bedId) => {
    const roomLabel = formatRoomLabel(roomId);
    const bedLabel = formatBedLabel(bedId);
    return `${roomLabel} • ${bedLabel}`;
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50" />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div
              className="px-7 py-7 text-white"
              style={{ backgroundImage: 'linear-gradient(to right, #2563eb, #22c55e)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Room Switch Requests</h1>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-7">
              {error && (
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-base">
                  <FaTimesCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="flex border-b border-gray-200">
                  {[
                    { id: 'pending', label: 'Pending', count: summary.pending },
                    { id: 'approved', label: 'Approved', count: summary.approved },
                    { id: 'rejected', label: 'Rejected', count: summary.rejected },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const baseClasses = 'group flex-1 py-4 px-6 text-center font-semibold text-base transition-all duration-300 border-b-2 flex items-center justify-center gap-2';
                    const colors = {
                      pending: {
                        active: 'border-blue-500 text-blue-600 bg-blue-50',
                        hover: 'hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50',
                      },
                      approved: {
                        active: 'border-green-500 text-green-600 bg-green-50',
                        hover: 'hover:border-green-400 hover:text-green-600 hover:bg-green-50',
                      },
                      rejected: {
                        active: 'border-red-500 text-red-600 bg-red-50',
                        hover: 'hover:border-red-400 hover:text-red-600 hover:bg-red-50',
                      },
                    };
                    const statusColor = colors[tab.id];
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${baseClasses} ${
                          isActive ? statusColor.active : `border-transparent text-gray-600 ${statusColor.hover}`
                        }`}
                      >
                        <span
                          className={`p-2 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-current text-white shadow-md scale-110'
                              : 'bg-gray-200 text-gray-500 group-hover:scale-105 group-hover:shadow-sm'
                          }`}
                        >
                          {tab.id === 'pending' && <FaClock className="w-4 h-4" />}
                          {tab.id === 'approved' && <FaCheckCircle className="w-4 h-4" />}
                          {tab.id === 'rejected' && <FaTimesCircle className="w-4 h-4" />}
                        </span>
                        {tab.label} ({tab.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm text-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white shadow-sm text-base"
                  />
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="p-12 bg-gray-50 rounded-2xl text-center">
                  <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-lg font-semibold text-gray-600">Loading requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-12 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-gray-200">
                  <FaClock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl font-bold text-gray-600">No requests found</p>
                  <p className="text-base text-gray-500 mt-2">Try adjusting filters or refresh the page.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Property</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Current</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Requested</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Request Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Response</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((req) => (
                          <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-base text-gray-800 font-medium">
                              {req.propertyId?.name || 'N/A'}
                            </td>

                            {/* Current: Room R17 • Bed edeqgh */}
                            <td className="px-6 py-4 text-base text-gray-600">
                              {getRoomBedLabel(req.currentRoomId, req.currentBedId)}
                            </td>

                            {/* Requested: Room R2 • Bed 3cenu9 */}
                            <td className="px-6 py-4 text-base text-gray-600">
                              {getRoomBedLabel(req.requestedRoomId, req.requestedBedId)}
                            </td>

                            <td className="px-6 py-4">
                              {statusBadge(req.status)}
                            </td>

                            <td className="px-6 py-4 text-base text-gray-600">
                              {new Date(req.requestDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="px-6 py-4 text-base text-gray-600">
                              {req.responseDate
                                ? new Date(req.responseDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>

                            <td className="px-6 py-4">
                              {req.status === 'pending' ? (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleAction(req._id, 'approve')}
                                    disabled={actionLoading[req._id]}
                                    className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                                  >
                                    {actionLoading[req._id] ? (
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <FaCheckCircle className="w-5 h-5" />
                                        Approve
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleAction(req._id, 'reject')}
                                    disabled={actionLoading[req._id]}
                                    className="px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold text-base flex items-center gap-2 hover:from-red-600 hover:to-rose-700 transition-all shadow-lg disabled:opacity-50"
                                  >
                                    {actionLoading[req._id] ? (
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <FaTimesCircle className="w-5 h-5" />
                                        Reject
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-base">No actions</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default PropertyManagerRoomSwitch;