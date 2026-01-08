import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaWifi,
  FaSnowflake,
  FaTv,
  FaBed,
  FaShower,
  FaParking,
  FaUtensils,
  FaTshirt,
} from "react-icons/fa";
import axios from "axios";

const facilityIconMap = {
  wifi: <FaWifi />,
  "wi-fi": <FaWifi />,
  ac: <FaSnowflake />,
  "air conditioning": <FaSnowflake />,
  tv: <FaTv />,
  television: <FaTv />,
  bed: <FaBed />,
  "comfortable bed": <FaBed />,
  shower: <FaShower />,
  bathroom: <FaShower />,
  "attached bathroom": <FaShower />,
  parking: <FaParking />,
  kitchen: <FaUtensils />,
  laundry: <FaTshirt />,
};

const facilityColorMap = {
  wifi: "from-blue-400 to-blue-600",
  "wi-fi": "from-blue-400 to-blue-600",
  ac: "from-cyan-400 to-cyan-600",
  "air conditioning": "from-cyan-400 to-cyan-600",
  tv: "from-yellow-400 to-yellow-600",
  television: "from-yellow-400 to-yellow-600",
  bed: "from-pink-400 to-pink-600",
  "comfortable bed": "from-pink-400 to-pink-600",
  shower: "from-green-400 to-green-600",
  bathroom: "from-green-400 to-green-600",
  "attached bathroom": "from-green-400 to-green-600",
  parking: "from-purple-400 to-purple-600",
  kitchen: "from-orange-400 to-orange-600",
  laundry: "from-indigo-400 to-indigo-600",
};

export default function RoomFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("tenanttoken");
        const res = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Assume facilities are in accommodations[0].facilities or similar
        let facArr = [];
        if (
          res.data &&
          Array.isArray(res.data.accommodations) &&
          res.data.accommodations.length > 0
        ) {
          // Try to get facilities from the first accommodation
          const acc = res.data.accommodations[0];
          if (Array.isArray(acc.facilities)) {
            facArr = acc.facilities;
          } else if (typeof acc.facilities === "string") {
            // If facilities is a comma-separated string
            facArr = acc.facilities.split(",").map((f) => f.trim());
          }
        }
        setFacilities(facArr);
      } catch {
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Room Facilities
      </h2>
      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Loading facilities...
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No facilities found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {facilities.map((facility, idx) => {
            // Normalize for icon/color mapping
            const key = facility.toLowerCase().trim();
            const icon = facilityIconMap[key] || <FaBed />;
            const color = facilityColorMap[key] || "from-gray-400 to-gray-600";
            return (
              <motion.div
                key={facility + idx}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg bg-gradient-to-br ${color} text-white cursor-pointer`}
                whileHover={{ scale: 1.1, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-5xl mb-3 drop-shadow-lg">{icon}</div>
                <p className="text-lg font-semibold text-center">{facility}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
