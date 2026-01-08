import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Roomswitch = () => {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: "",
    currentRoomId: "",
    currentBedId: "",
    requestedRoomId: "",
    requestedBedId: "",
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
    const token = localStorage.getItem("tenanttoken");
    if (!token) {
      setError("No authentication token found. Please log in as tenant.");
      navigate("/login");
      return;
    }

    const fetchAccommodations = async () => {
      try {
        setAccommodationsLoading(true);
        const res = await fetch(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.accommodations)) {
          setAccommodations(data.accommodations);
          if (data.accommodations.length === 0) {
            setError("No accommodations available.");
          }
        } else {
          setAccommodations([]);
          setError(data.message || "Could not fetch accommodations.");
        }
      } catch (err) {
        setError("Failed to fetch accommodations. Please try again later.");
        setAccommodations([]);
      } finally {
        setAccommodationsLoading(false);
      }
    };

    fetchAccommodations();
  }, [navigate]);

  // Auto-fill current property, room, and bed when accommodations are loaded
  useEffect(() => {
    if (accommodations.length > 0 && !formData.propertyId) {
      const current = accommodations[0];
      setFormData((prev) => ({
        ...prev,
        propertyId: current.propertyId,
        currentRoomId: current.roomId,
        currentBedId: current.bedId,
      }));
    }
  }, [accommodations, formData.propertyId]);

  // Fetch available rooms when propertyId changes
  useEffect(() => {
    if (!formData.propertyId) {
      setAvailableRooms([]);
      return;
    }

    const token = localStorage.getItem("tenanttoken");
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
            setError("No available rooms found for this property.");
          }
        } else {
          setAvailableRooms([]);
          setError(data.message || "Could not fetch available rooms.");
        }
      } catch (err) {
        setError("Failed to fetch available rooms.");
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

    const token = localStorage.getItem("tenanttoken");
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
            setError("No available beds found for this room.");
          }
        } else {
          setAvailableBeds([]);
          setError(data.message || "Could not fetch available beds.");
        }
      } catch (err) {
        setError("Failed to fetch available beds.");
        setAvailableBeds([]);
      } finally {
        setBedsLoading(false);
      }
    };

    fetchAvailableBeds();
  }, [formData.propertyId, formData.requestedRoomId]);

  // Fetch room switch requests
  useEffect(() => {
    const token = localStorage.getItem("tenanttoken");
    if (!token) return;

    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const res = await fetch(
          "https://api.gharzoreality.com/api/room-switch/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setRequests(data);
        } else {
          setRequests([]);
          setError(data.message || "Could not fetch room switch requests.");
        }
      } catch (err) {
        setError("Failed to fetch room switch requests.");
        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Helper to check if tenant has a pending request within the last month
  const hasRecentPendingRequest = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return requests.some((req) => {
      const reqDate = new Date(req.requestDate);
      return reqDate > oneMonthAgo && req.status === "pending";
    });
  };

  // Handle form input changes (only for requested fields)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "requestedRoomId") {
      setFormData({
        ...formData,
        requestedRoomId: value,
        requestedBedId: "",
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

    if (hasRecentPendingRequest()) {
      setError(
        "You can only make one room switch request per month. Please wait for your current pending request to be processed."
      );
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("tenanttoken");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        "https://api.gharzoreality.com/api/room-switch/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
        const requestsRes = await fetch(
          "https://api.gharzoreality.com/api/room-switch/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const requestsData = await requestsRes.json();
        if (requestsRes.ok && Array.isArray(requestsData)) {
          setRequests(requestsData);
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-500";
      case "approved":
        return "bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-emerald-500";
      case "rejected":
        return "bg-gradient-to-r from-rose-400 to-red-500 text-white border-rose-500";
      default:
        return "bg-gray-200 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const isSubmitDisabled =
    loading ||
    accommodationsLoading ||
    roomsLoading ||
    bedsLoading ||
    !formData.propertyId ||
    !formData.currentRoomId ||
    !formData.currentBedId ||
    !formData.requestedRoomId ||
    !formData.requestedBedId ||
    hasRecentPendingRequest();

  const currentAcc = accommodations[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

<div className="max-w-6xl mx-auto p">
  {/* Background decorative elements */}
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
  </div>

  {/* Main Form Card with Glass Morphism */}
  <div className="relative">
    {/* Floating badges */}
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-purple-500/30">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        Room Switch Request Portal
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
      </div>
    </div>

    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative z-10">
      {/* Header with gradient */}
      <div className="relative px-8 py-8 bg-gradient-to-r from-purple-50 via-white to-blue-50 border-b border-slate-100/50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-xs font-bold text-white">1</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
              New Room Switch Request
            </h2>
            <p className="text-slate-600 mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
              Fill in the details below to submit your room switch request
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {accommodationsLoading ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-200 rounded-full animate-spin border-t-blue-600 border-r-purple-600"></div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-transparent rounded-full animate-ping border-t-4 border-t-blue-300/50"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent mb-3">
                  Loading Your Accommodations
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Fetching your current living arrangements and available options...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Current Information Section */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800">Current Accommodation</h3>
                <div className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">Currently Occupied</span>
                </div>
              </div>

              {/* Current Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Property Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg shadow-purple-100/30 group-hover:shadow-xl group-hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0l2 2m-2-2l-2 2" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">PROPERTY</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      {currentAcc ? currentAcc.propertyName : "Not Assigned"}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {currentAcc ? `${currentAcc.propertyAddress}` : "No property information available"}
                    </p>
                  </div>
                </div>

                {/* Room Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg shadow-blue-100/30 group-hover:shadow-xl group-hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14s1.5 2 4 2 4-2 4-2m-.5-8H16a2 2 0 012 2v2m-8-4h8" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">ROOM</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      {currentAcc ? currentAcc.roomName : "Not Assigned"}
                    </h4>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                        {currentAcc ? currentAcc.roomType : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bed Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg shadow-indigo-100/30 group-hover:shadow-xl group-hover:shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-1.5-1.5M20 7l-1.5 1.5M20 7H4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">BED</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      {currentAcc ? currentAcc.bedName : "Not Assigned"}
                    </h4>
                    <div className="mt-4">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 text-center">Your Current Spot</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Request Section */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800">Request New Accommodation</h3>
                <div className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">Select Available Options</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Requested Room */}
                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0l2 2m-2-2l-2 2" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">Requested Room</div>
                        <div className="text-xs text-slate-500">Select an available room</div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      name="requestedRoomId"
                      value={formData.requestedRoomId}
                      onChange={handleChange}
                      className="w-full p-5 pl-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all duration-300 text-slate-700 shadow-lg appearance-none disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:border-blue-300"
                      required
                      disabled={roomsLoading}
                    >
                      <option value="">{roomsLoading ? "Loading available rooms..." : "Select a room"}</option>
                      {availableRooms.map((r) => (
                        <option key={r.roomId} value={r.roomId}>
                          {r.name} ({r.type}) - {r.availableBeds} of {r.totalBeds} beds available
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Requested Bed */}
                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-1.5-1.5M20 7l-1.5 1.5M20 7H4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">Requested Bed</div>
                        <div className="text-xs text-slate-500">Select an available bed</div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      name="requestedBedId"
                      value={formData.requestedBedId}
                      onChange={handleChange}
                      className="w-full p-5 pl-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all duration-300 text-slate-700 shadow-lg appearance-none disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:border-indigo-300"
                      required
                      disabled={!formData.requestedRoomId || bedsLoading}
                    >
                      <option value="">{bedsLoading ? "Loading available beds..." : "Select a bed"}</option>
                      {availableBeds.map((b) => (
                        <option key={b.bedId} value={b.bedId}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="group relative flex-1 inline-flex items-center justify-center px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Room Switch Request
                    </>
                  )}
                  <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRequests(!showRequests)}
                  className="group relative flex-1 inline-flex items-center justify-center px-8 py-5 bg-gradient-to-r from-slate-600 to-gray-700 text-white font-bold rounded-2xl hover:from-slate-700 hover:to-gray-800 focus:outline-none focus:ring-4 focus:ring-slate-200 shadow-xl hover:shadow-2xl hover:shadow-slate-500/30 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {showRequests ? "Hide My Requests" : "View My Requests"}
                  <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>
              </div>

              {/* Form Status Indicators */}
              <div className="flex items-center justify-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentAcc ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm text-slate-600">Current Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${formData.requestedRoomId ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm text-slate-600">Room Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${formData.requestedBedId ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm text-slate-600">Bed Selected</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>

  {/* Enhanced Requests Section */}
  {showRequests && (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-amber-500/30">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Your Request History
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
          {/* Requests Header */}
          <div className="relative px-8 py-8 bg-gradient-to-r from-amber-50 via-white to-orange-50 border-b border-slate-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{requests.length}</span>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                    My Room Switch Requests
                  </h2>
                  <p className="text-slate-600 mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                    Track the status of your submitted requests
                  </p>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">Requests Status</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-slate-700">
                        {requests.filter(r => r.status === 'approved').length} Approved
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-slate-700">
                        {requests.filter(r => r.status === 'pending').length} Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Content */}
          <div className="p-8">
            {requestsLoading ? (
              <div className="py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-spin border-t-amber-600 border-r-orange-600"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Loading Your Requests</h3>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No Requests Yet</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                  You haven't submitted any room switch requests yet. Start by filling out the form above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req, index) => (
                  <div key={req.requestId} className="group bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">Request #{req.requestId.slice(0, 8)}</div>
                          <div className="text-sm text-slate-500">
                            Submitted on {new Date(req.requestDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-slate-500">From</div>
                            <div className="font-semibold text-slate-800">R{req.currentRoomId}</div>
                          </div>
                          <div className="text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500">To</div>
                            <div className="font-semibold text-slate-800">R{req.requestedRoomId}</div>
                          </div>
                        </div>
                        
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(req.status)}`}>
                          <span className="mr-2">{getStatusIcon(req.status)}</span>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Additional Info on Hover */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-slate-50/50 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Property</div>
                        <div className="font-medium text-slate-800">{req.propertyId?.name || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50/50 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Current Bed</div>
                        <div className="font-medium text-slate-800">B{req.currentBedId}</div>
                      </div>
                      <div className="bg-slate-50/50 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Requested Bed</div>
                        <div className="font-medium text-slate-800">B{req.requestedBedId}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Enhanced Response Messages */}
  {response && (
    <div className="relative animate-slide-up">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200/50 rounded-3xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">Request Submitted Successfully!</h3>
            <p className="text-emerald-800 mb-6">{response.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setResponse(null)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30"
              >
                Create Another Request
              </button>
              <button
                onClick={() => setShowRequests(true)}
                className="px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                View All Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {error && (
    <div className="relative animate-slide-up">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-red-400/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200/50 rounded-3xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-rose-900 mb-3">Oops! Something Went Wrong</h3>
            <p className="text-rose-800 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-8 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-rose-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
