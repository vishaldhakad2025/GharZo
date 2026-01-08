import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Bed, MapPin, DollarSign, Calendar, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../User_Section/Context/AuthContext";

export default function PropertyPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [accommodations, setAccommodations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        setError("No authentication token found. Please log in.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const accRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (accRes.data.success) {
          setAccommodations(accRes.data.accommodations || []);

          const tenantId =
            accRes.data.accommodations?.[0]?.tenantId ||
            localStorage.getItem("tenantId");

          if (tenantId) localStorage.setItem("tenantId", tenantId);

          if (tenantId) {
            const roomsRes = await axios.get(
              `https://api.gharzoreality.com/api/tenant/${tenantId}/my-rooms`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (roomsRes.data.success) {
              setRooms(roomsRes.data.rooms || []);
            }
          }
        } else {
          setError(accRes.data.message || "Failed to fetch accommodations.");
          if (accRes.data.error === "User is not a registered tenant") {
            localStorage.removeItem("tenanttoken");
            logout();
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching data."
        );
        if (err.response?.data?.error === "User is not a registered tenant") {
          localStorage.removeItem("tenanttoken");
          logout();
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, logout]);

  const hasRooms = rooms.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-600 font-medium">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 text-center border border-red-100"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full p-3 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 px-8 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
              >
                <Home size={32} />
              </motion.div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">My Properties</h1>
                <p className="text-blue-100 font-medium">Manage your accommodations and rooms effortlessly</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className={hasRooms ? "grid lg:grid-cols-2 gap-8" : ""}>
              {/* Accommodations Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={hasRooms ? "lg:col-span-1" : ""}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Accommodations</h2>
                </div>
                {accommodations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accommodations.map((item, index) => (
                      <motion.div
                        key={item.propertyId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-blue-200"
                      >
                        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <MapPin size={48} className="text-blue-500 opacity-60 group-hover:opacity-100 transition" />
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-1">
                            {item.propertyName}
                          </h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Bed size={16} className="text-blue-500" />
                              Flat/Room: {item.roomName}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={16} className="text-green-500" />
                              {item.propertyCity}, {item.propertyAddress}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign size={16} className="text-yellow-500" />
                              Rent: ₹{item.rentAmount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign size={16} className="text-orange-500" />
                              Security: ₹{item.securityDeposit.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} className="text-purple-500" />
                              Move-in: {new Date(item.moveInDate).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 bg-gray-50 rounded-2xl"
                  >
                    <Building2 size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Accommodations Yet</h3>
                    <p className="text-gray-500">Your properties will appear here once added.</p>
                  </motion.div>
                )}
              </motion.section>

              {/* Rooms Section */}
              {hasRooms && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="lg:col-span-1"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
                      <Bed size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">My Rooms</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rooms.map((room, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-green-200"
                      >
                        <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                          <Bed size={48} className="text-green-500 opacity-60 group-hover:opacity-100 transition" />
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-xl text-gray-800 mb-3">
                            {room.roomName}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 flex items-center gap-2">
                                <Building2 size={16} className="text-blue-500" />
                                Status
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                room.status === 'Active' || room.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {room.status ? room.status : (room.isActive ? "Active" : "Inactive")}
                              </span>
                            </div>
                            {room.floor !== undefined && room.floor !== null && room.floor !== "" && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 size={16} className="text-purple-500" />
                                Floor: {room.floor}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign size={16} className="text-yellow-500" />
                              Rent: ₹{room.rentAmount ? room.rentAmount.toLocaleString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12 flex justify-center"
            >
              <Link
                to="/tenant"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-green-500 hover:via-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span>⬅</span>
                Back to Dashboard
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}