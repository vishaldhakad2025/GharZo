import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Roomswitch = () => {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    currentRoomId: '',
    currentBedId: '',
    requestedRoomId: '',
    requestedBedId: ''
  });
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accommodationsLoading, setAccommodationsLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  // Fetch accommodations and validate token
  useEffect(() => {
    const token = localStorage.getItem('tenanttoken');
    if (!token) {
      setError('No authentication token found. Please log in as tenant.');
      navigate('/login');
      return;
    }
    const fetchAccommodations = async () => {
      try {
        setAccommodationsLoading(true);
        const res = await fetch('https://api.gharzoreality.com/api/tenant/accommodations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.accommodations)) {
          setAccommodations(data.accommodations);
          if (data.accommodations.length === 0) {
            setError('No accommodations available.');
          }
        } else {
          setAccommodations([]);
          setError(data.message || 'Could not fetch accommodations.');
        }
      } catch (err) {
        setError('Failed to fetch accommodations. Please try again later.');
        setAccommodations([]);
      } finally {
        setAccommodationsLoading(false);
      }
    };
    fetchAccommodations();
  }, [navigate]);

  // Fetch available rooms when propertyId changes
  useEffect(() => {
    if (!formData.propertyId) {
      setAvailableRooms([]);
      return;
    }
    const token = localStorage.getItem('tenanttoken');
    if (!token) return;
    const fetchAvailableRooms = async () => {
      try {
        setRoomsLoading(true);
        const res = await fetch(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/available`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.rooms)) {
          setAvailableRooms(data.rooms);
          if (data.rooms.length === 0) {
            setError('No available rooms found for this property.');
          }
        } else {
          setAvailableRooms([]);
          setError(data.message || 'Could not fetch available rooms.');
        }
      } catch (err) {
        setError('Failed to fetch available rooms.');
        setAvailableRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchAvailableRooms();
  }, [formData.propertyId]);

  // Fetch available beds when requestedRoomId changes
  useEffect(() => {
    if (!formData.propertyId || !formData.requestedRoomId) {
      setAvailableBeds([]);
      return;
    }
    const token = localStorage.getItem('tenanttoken');
    if (!token) return;
    const fetchAvailableBeds = async () => {
      try {
        setBedsLoading(true);
        const res = await fetch(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.requestedRoomId}/available-beds`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.beds)) {
          setAvailableBeds(data.beds);
          if (data.beds.length === 0) {
            setError('No available beds found for this room.');
          }
        } else {
          setAvailableBeds([]);
          setError(data.message || 'Could not fetch available beds.');
        }
      } catch (err) {
        setError('Failed to fetch available beds.');
        setAvailableBeds([]);
      } finally {
        setBedsLoading(false);
      }
    };
    fetchAvailableBeds();
  }, [formData.propertyId, formData.requestedRoomId]);

  // Fetch room switch requests from NEW API
  useEffect(() => {
    const token = localStorage.getItem('tenanttoken');
    if (!token) return;
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const res = await fetch('https://api.gharzoreality.com/api/tenant/room-switch/pm/my-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.requests)) {
          setRequests(data.requests);
        } else {
          setRequests([]);
          setError(data.message || 'Could not fetch room switch requests.');
        }
      } catch (err) {
        setError('Failed to fetch room switch requests.');
        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Helper to get unique properties
  const getProperties = () => {
    const uniqueProperties = [];
    const seen = new Set();
    accommodations.forEach((acc) => {
      if (!seen.has(acc.propertyId)) {
        seen.add(acc.propertyId);
        uniqueProperties.push({
          propertyId: acc.propertyId,
          propertyName: acc.propertyName,
          propertyAddress: acc.propertyAddress,
          propertyCity: acc.propertyCity
        });
      }
    });
    return uniqueProperties;
  };

  // Helper to get rooms for selected property (for current room)
  const getCurrentRooms = (propertyId) => {
    return accommodations
      .filter((acc) => acc.propertyId === propertyId)
      .map((acc) => ({
        roomId: acc.roomId,
        roomName: acc.roomName,
        roomType: acc.roomType
      }))
      .filter((room, index, self) =>
        index === self.findIndex((r) => r.roomId === room.roomId)
      );
  };

  // Helper to get beds for selected property and room (for current bed)
  const getCurrentBeds = (propertyId, roomId) => {
    return accommodations
      .filter((acc) => acc.propertyId === propertyId && acc.roomId === roomId)
      .map((acc) => ({
        bedId: acc.bedId,
        bedName: acc.bedName
      }))
      .filter((bed, index, self) =>
        index === self.findIndex((b) => b.bedId === bed.bedId)
      );
  };

  // Helper to check if tenant has a pending request within the last month
  const hasRecentPendingRequest = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return requests.some(req => {
      const reqDate = new Date(req.requestDate);
      return reqDate > oneMonthAgo && req.status === 'pending';
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'propertyId') {
      setFormData({
        ...formData,
        propertyId: value,
        currentRoomId: '',
        currentBedId: '',
        requestedRoomId: '',
        requestedBedId: ''
      });
    } else if (name === 'currentRoomId') {
      setFormData({
        ...formData,
        currentRoomId: value,
        currentBedId: ''
      });
    } else if (name === 'requestedRoomId') {
      setFormData({
        ...formData,
        requestedRoomId: value,
        requestedBedId: ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    // Check for recent pending request before submitting
    if (hasRecentPendingRequest()) {
      setError('You can only make one room switch request per month. Please wait for your current pending request to be processed.');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('tenanttoken');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('https://api.gharzoreality.com/api/tenant/room-switch/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
        // Refresh requests after successful submission using NEW API
        const requestsRes = await fetch('https://api.gharzoreality.com/api/tenant/room-switch/pm/my-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const requestsData = await requestsRes.json();
        if (requestsRes.ok && requestsData.success && Array.isArray(requestsData.requests)) {
          setRequests(requestsData.requests);
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-500';
      case 'approved': return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-emerald-500';
      case 'rejected': return 'bg-gradient-to-r from-rose-400 to-red-500 text-white border-rose-500';
      default: return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  // Disable submit if there's a recent pending request
  const isSubmitDisabled = loading || accommodationsLoading || roomsLoading || bedsLoading || !formData.propertyId || !formData.currentRoomId || !formData.currentBedId || !formData.requestedRoomId || !formData.requestedBedId || hasRecentPendingRequest();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <span className="text-2xl mr-2">Room</span>
              <span className="text-blue-100 text-lg font-semibold">Room Switch Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Request Room Switch
              <span className="block text-xl font-light text-blue-100 mt-3">Find your perfect living space</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl mx-auto leading-relaxed">
              Seamlessly request to switch to a different room or bed within our properties.
              Our team will review and process your request promptly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl text-white">Swap</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">New Room Switch Request</h2>
                <p className="text-slate-600 text-sm">Fill in the details to request a room switch</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8">
            {accommodationsLoading ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-t-4 border-t-blue-300/50"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Your Accommodations</h3>
                    <p className="text-slate-600">Fetching your current living arrangements...</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-blue-600">Building</span>
                    Select Property
                  </label>
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    className="w-full p-4 pl-10 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-slate-50 to-blue-50 text-slate-700 placeholder-slate-400 appearance-none"
                    required
                  >
                    <option value="">Choose your property</option>
                    {getProperties().map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>
                        {p.propertyName} - {p.propertyAddress}, {p.propertyCity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Room */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-green-600">Room</span>
                    Current Room
                  </label>
                  <select
                    name="currentRoomId"
                    value={formData.currentRoomId}
                    onChange={handleChange}
                    className="w-full p-4 pl-10 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-gradient-to-r from-slate-50 to-emerald-50 text-slate-700 placeholder-slate-400 appearance-none disabled:opacity-50"
                    required
                    disabled={!formData.propertyId}
                  >
                    <option value="">{formData.propertyId ? 'Select your current room' : 'Select property first'}</option>
                    {getCurrentRooms(formData.propertyId).map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        {r.roomName} ({r.roomType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Bed */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-green-600">Bed</span>
                    Current Bed
                  </label>
                  <select
                    name="currentBedId"
                    value={formData.currentBedId}
                    onChange={handleChange}
                    className="w-full p-4 pl-10 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-gradient-to-r from-slate-50 to-emerald-50 text-slate-700 placeholder-slate-400 appearance-none disabled:opacity-50"
                    required
                    disabled={!formData.currentRoomId}
                  >
                    <option value="">{formData.currentRoomId ? 'Select your current bed' : 'Select room first'}</option>
                    {getCurrentBeds(formData.propertyId, formData.currentRoomId).map((b) => (
                      <option key={b.bedId} value={b.bedId}>
                        {b.bedName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requested Room */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-purple-600">Target</span>
                    Requested Room (Available)
                  </label>
                  <select
                    name="requestedRoomId"
                    value={formData.requestedRoomId}
                    onChange={handleChange}
                    className="w-full p-4 pl-10 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-gradient-to-r from-slate-50 to-purple-50 text-slate-700 placeholder-slate-400 appearance-none disabled:opacity-50"
                    required
                    disabled={!formData.propertyId || roomsLoading}
                  >
                    <option value="">
                      {roomsLoading ? 'Loading available rooms...' :
                       formData.propertyId ? 'Select available room' : 'Select property first'}
                    </option>
                    {availableRooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        {r.name} ({r.type}) - {r.availableBeds}/{r.totalBeds} beds available
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requested Bed */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-purple-600">Bed</span>
                    Requested Bed (Available)
                  </label>
                  <select
                    name="requestedBedId"
                    value={formData.requestedBedId}
                    onChange={handleChange}
                    className="w-full p-4 pl-10 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-gradient-to-r from-slate-50 to-purple-50 text-slate-700 placeholder-slate-400 appearance-none disabled:opacity-50"
                    required
                    disabled={!formData.requestedRoomId || bedsLoading}
                  >
                    <option value="">
                      {bedsLoading ? 'Loading available beds...' :
                       formData.requestedRoomId ? 'Select available bed' : 'Select room first'}
                    </option>
                    {availableBeds.map((b) => (
                      <option key={b.bedId} value={b.bedId}>
                        Bed {b.bedId} - ₹{b.price}/month
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-2 pt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="flex-1 group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-3.042 1.135-5.824 3-7.938v2.177c0 .077.02.155.056.232C6.206 4.387 6.02 4.5 6 4.5c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v3c0 .2.1.4.2.5.1.1.3.2.5.2.02 0 .04-.01.06-.02.036-.01.07-.03.1-.05.03-.02.06-.04.09-.06z"></path>
                          </svg>
                          Processing Request...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2 group-hover:mr-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Submit Room Switch Request
                        </>
                      )}
                      <div className="absolute inset-0 bg-blue-700/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                   
                    <button
                      type="button"
                      onClick={() => setShowRequests(!showRequests)}
                      className="flex-1 group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white font-semibold rounded-2xl hover:from-slate-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-slate-200 shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                      <svg className="w-5 h-5 mr-2 group-hover:mr-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showRequests ? "M6 18L18 6M6 6l12 12" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                      </svg>
                      {showRequests ? 'Hide My Requests' : 'View My Requests'}
                      <div className="absolute inset-0 bg-slate-700/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Requests Section */}
        {showRequests && (
          <div className="space-y-6">
            {/* Requests Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl text-white">List</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">My Room Switch Requests</h2>
                      <p className="text-slate-600 text-sm">Track the status of your submitted requests</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('pending')}`}>
                    {requests.filter(req => req.status === 'pending').length} Pending
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {requestsLoading ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-amber-600"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Your Requests</h3>
                      <p className="text-slate-600">Fetching your room switch request history...</p>
                    </div>
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl flex items-center justify-center">
                      <span className="text-4xl">Empty</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No Requests Yet</h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        You haven't submitted any room switch requests yet.
                        Use the form above to make your first request!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Request ID</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Property</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Current</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Requested</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.map((req, index) => (
                          <tr key={req.requestId} className="hover:bg-slate-50/50 transition-all duration-200">
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">{req.requestId}</div>
                                  <div className="text-slate-500 text-xs">Request ID</div>
                                </div>
                              </div>
                            </td>
                           
                            <td className="px-6 py-6 hidden md:table-cell">
                              <div className="max-w-xs">
                                <div className="font-semibold text-slate-900 truncate">{req.propertyId?.name || 'N/A'}</div>
                                <div className="text-slate-500 text-sm truncate">{req.propertyId?.address || ''}</div>
                              </div>
                            </td>
                           
                            <td className="px-6 py-6 hidden sm:table-cell">
                              <div className="bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                                <span className="text-green-800 font-medium text-sm">
                                  R{req.currentRoomId?.split('-R')[1] || req.currentRoomId}B{req.currentBedId?.split('-B')[1] || req.currentBedId}
                                </span>
                              </div>
                            </td>
                           
                            <td className="px-6 py-6 hidden sm:table-cell">
                              <div className="bg-purple-50 px-3 py-2 rounded-xl border border-purple-200">
                                <span className="text-purple-800 font-medium text-sm">
                                  R{req.requestedRoomId?.split('-R')[1] || req.requestedRoomId}B{req.requestedBedId?.split('-B')[1] || req.requestedBedId}
                                </span>
                              </div>
                            </td>
                           
                            <td className="px-6 py-6 whitespace-nowrap">
                              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-sm ${getStatusColor(req.status)}`}>
                                <span className="mr-2">{getStatusIcon(req.status)}</span>
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </span>
                            </td>
                           
                            <td className="px-6 py-6 hidden md:table-cell text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Date</span>
                                <span>{new Date(req.requestDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 
                  {/* Table Footer */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
                      <div>
                        Showing <span className="font-semibold text-slate-900">{requests.length}</span> total requests
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Refresh</span>
                        <span>Last updated {new Date().toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Response Messages */}
        {response && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">Check</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-900 mb-2">Request Submitted Successfully!</h3>
                <p className="text-emerald-800 mb-4">{response.message}</p>
                <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 mb-2">Request Details:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-emerald-600">Property:</span> {response.request?.propertyId?.name || 'N/A'}</div>
                    <div><span className="text-emerald-600">From:</span> R{response.request?.currentRoomId}B{response.request?.currentBedId}</div>
                    <div><span className="text-emerald-600">To:</span> R{response.request?.requestedRoomId}B{response.request?.requestedBedId}</div>
                    <div><span className="text-emerald-600">Status:</span> <span className="font-semibold">Pending</span></div>
                  </div>
                </div>
                <button
                  onClick={() => setResponse(null)}
                  className="mt-4 inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Create Another Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-3xl p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">Warning</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-rose-900 mb-2">Oops! Something went wrong</h3>
                <p className="text-rose-800 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default Roomswitch;