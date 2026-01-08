import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaDoorOpen,
  FaBed,
  FaMoneyBillWave,
  FaWarehouse,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const RoomOverview = () => {
  const { id } = useParams(); // Property ID from route
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Change API_BASE to get all rooms (not just available)
  const API_BASE = `${baseurl}api/landlord/properties/${id}/rooms`;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No access token found in localStorage");
        }

        // Use the all rooms API
        const response = await axios.get(API_BASE, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.rooms)) {
          data = response.data.rooms;
        } else {
          data = [];
        }

        // Log the response data for debugging
        console.log("Fetched rooms:", data);

        // Map and transform data to ensure capacity is available
        const transformedRooms = data.map((room) => ({
          ...room,
          capacity:
            room.capacity || room.totalBeds || room.roomData?.capacity || 0,
          name:
            room.name ||
            room.roomId ||
            `Room ${Date.now().toString().slice(-4)}`,
          price: room.price || room.roomData?.price || 0,
          status: room.status || "N/A",
          type: room.type || "N/A",
          beds: room.beds || [],
        }));

        setRooms(transformedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError(
          error.response?.data?.message ||
            "Failed to fetch rooms. Please check your authentication or network."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [id]);

  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce(
    (sum, room) => sum + (room.beds?.length || 0),
    0
  );
  const vacantRooms = rooms.filter(
    (room) => room.status === "Available"
  ).length;

  const roomStats = [
    {
      label: "Total Rooms",
      count: totalRooms,
      type: "ALL",
      icon: <FaWarehouse />,
      color:
        "from-[#003366] to-[#004999]",
    },
    {
      label: "Total Beds",
      count: totalBeds,
      type: "ALL",
      icon: <FaBed />,
      color:
        "from-[#003366] to-[#005099]",
    },
    {
      label: "Vacant Rooms",
      count: vacantRooms,
      type: "VACANT",
      icon: <FaMoneyBillWave />,
      color:
        "from-[#FF6B35] to-[#FF8C42]",
    },
  ];

  const filteredRooms = rooms
    .filter(
      (room) =>
        !searchTerm ||
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ""
    )
    .filter((room) => {
      if (filterType === "VACANT") return room.status === "Available";
      return true;
    });

  // Log filtered rooms for debugging
  console.log("Filtered rooms:", filteredRooms);

  return (
    <div className="p-6 w-full bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen rounded-2xl shadow-2xl border-2 border-[#FF6B35]/30">
      <motion.h3
        className="text-xl sm:text-2xl font-bold mb-6 text-[#003366] flex items-center"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="w-2 h-6 bg-[#FF6B35] mr-4 rounded"></span>
        Room Overview
      </motion.h3>

      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {roomStats.map((stat, index) => (
          <motion.div
            key={index}
            className={`cursor-pointer bg-gradient-to-br ${stat.color} text-white rounded-2xl shadow-xl p-4 text-center hover:shadow-2xl transition-all border-2 border-white/20`}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilterType(stat.type)}
          >
            <div className="flex justify-center mb-3 text-5xl drop-shadow-lg">{stat.icon}</div>
            <h2 className="text-3xl font-bold mb-1">{stat.count}</h2>
            <p className="text-sm opacity-90 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search Room by Name..."
          className="w-full sm:w-96 px-5 py-3 border-2 border-[#FF6B35] bg-white text-[#003366] rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none shadow-md font-medium placeholder-gray-400"
        />
      </motion.div>

      <motion.div
        className="overflow-x-auto bg-white rounded-2xl shadow-xl border-2 border-[#FF6B35]/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="text-center py-10">
            <div className="border-t-4 border-[#FF6B35] w-12 h-12 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading rooms...</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-[#003366] to-[#004999] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-center font-semibold">Capacity</th>
                <th className="px-6 py-4 text-center font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Rent</th>
                <th className="px-6 py-4 text-center font-semibold">Type</th>
                <th className="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8 font-medium">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, idx) => (
                  <motion.tr
                    key={room._id || idx}
                    className="text-center border-b border-gray-200 hover:bg-blue-50 transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="px-6 py-4 text-left font-semibold text-[#003366]">{room.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{room.capacity || "-"}</td>
                    <td className="px-6 py-4">
                      {room.status === "Available" ? (
                        <span className="inline-block px-3 py-1 bg-[#FF6B35] text-white font-semibold rounded-full text-xs">
                          Vacant
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-green-500 text-white font-semibold rounded-full text-xs">
                          {room.status || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#003366] font-bold">₹{room.price || 0}</td>
                    <td className="px-6 py-4 text-gray-700">{room.type || "-"}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/landlord/property/${id}/add-room?roomId=${room._id}`}
                        className="inline-block px-4 py-2 bg-gradient-to-r from-[#003366] to-[#004999] text-white font-semibold rounded-lg hover:from-[#004999] hover:to-[#003366] transition-all shadow-md hover:shadow-lg"
                      >
                        View
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      <motion.div
        className="mt-8 text-right"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to={`/landlord/property/${id}/add-room`}>
          <motion.button
            className="inline-flex items-center bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-[#FF8C42] hover:to-[#FF6B35] transition-all font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaDoorOpen className="mr-2 text-lg" />
            Add New Room
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default RoomOverview;