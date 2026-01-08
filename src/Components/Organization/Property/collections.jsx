import React, { useEffect, useState } from "react";
import { FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

const OrgCollections = () => {
  const [collectionsData, setCollectionsData] = useState({
    currentMonth: { month: "", expected: 0, byProperty: [], projectedCollection: 0 },
    nextMonth: { month: "", expected: 0, byProperty: [], projectedCollection: 0 },
    twoMonthsAhead: { month: "", expected: 0, byProperty: [], projectedCollection: 0 },
    breakdown: [],
    pastCollectionEfficiency: [],
    projectedEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionsData = async () => {
      try {
        console.log("Fetching collections forecast data...");
        const token = localStorage.getItem("orgToken");

        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        const response = await fetch(
          "https://api.gharzoreality.com/api/landlord/analytics/collections/forecast",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const rawResponse = await response.text();
        console.log("Raw API Response:", rawResponse);

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(rawResponse);
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${rawResponse || "Unknown error"}`
            );
          }
          if (response.status === 401) {
            throw new Error("Unauthorized: Invalid or expired token. Please login again.");
          }
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        let data;
        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          throw new Error("Invalid JSON response from server.");
        }
        console.log("Parsed API Response:", data);

        if (!data || typeof data !== "object") {
          throw new Error("Unexpected response format from server.");
        }

        setCollectionsData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.message ||
            "Failed to fetch collections data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionsData();
  }, []);

  if (loading)
    return <p className="text-black text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="p-2 md:p-4 min-h-screen bg-gray-100 w-full flex justify-center"
    >
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8">
        {/* Header */}
        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2 sm:gap-3 text-black"
        >
          <FaWallet className="text-green-600" /> Collections Forecast
        </motion.h2>
        <p className="mb-4 text-sm sm:text-base md:text-lg text-gray-600">
          Track and manage expected rent and payments for your properties.
        </p>

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-200 to-green-400 p-2 sm:p-3 md:p-4 rounded-lg shadow-md"
          >
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
              {collectionsData.currentMonth.month}
            </h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">
              ₹{collectionsData.currentMonth.projectedCollection.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-blue-200 to-blue-400 p-2 sm:p-3 md:p-4 rounded-lg shadow-md"
          >
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
              {collectionsData.nextMonth.month}
            </h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">
              ₹{collectionsData.nextMonth.projectedCollection.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-200 to-purple-400 p-2 sm:p-3 md:p-4 rounded-lg shadow-md"
          >
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
              {collectionsData.twoMonthsAhead.month}
            </h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900">
              ₹{collectionsData.twoMonthsAhead.projectedCollection.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Collection by Property */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2 sm:mb-3">
            Collection by Property (Current Month)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {collectionsData.currentMonth.byProperty.map((property) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={property.propertyId}
                className="bg-white p-2 sm:p-3 rounded-lg shadow-md border"
              >
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {property.propertyName}
                </p>
                <p className="text-base sm:text-lg md:text-xl font-semibold text-black">
                  ₹{property.expected.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="w-full overflow-x-auto mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2 sm:mb-3 px-2 sm:px-4 pt-2 sm:pt-4">
            Collection Breakdown
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max text-xs sm:text-sm md:text-base text-left text-black">
              <thead className="bg-gray-200 text-gray-700 uppercase text-xxs sm:text-xs md:text-sm">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Property</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Rent</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Maintenance</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Electricity</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Water</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Other</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Total</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Tenants</th>
                </tr>
              </thead>
              <tbody>
                {collectionsData.breakdown.length > 0 ? (
                  collectionsData.breakdown.map((item) => (
                    <motion.tr
                      key={item.propertyId}
                      whileHover={{ scale: 1.01, backgroundColor: "#f0f9ff" }}
                      className="border-b border-gray-300 transition"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        {item.propertyName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.rentAmount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.maintenanceAmount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.electricityAmount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.waterAmount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.otherAmount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                        ₹{item.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{item.tenantCount}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-2 sm:py-4 text-gray-500 italic"
                    >
                      No breakdown data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Collection Efficiency */}
        <div className="w-full overflow-x-auto">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2 sm:mb-3 px-2 sm:px-4 pt-2 sm:pt-4">
            Past Collection Efficiency
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max text-xs sm:text-sm md:text-base text-left text-black">
              <thead className="bg-gray-200 text-gray-700 uppercase text-xxs sm:text-xs md:text-sm">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Month</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Collected</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Expected</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {collectionsData.pastCollectionEfficiency.length > 0 ? (
                  collectionsData.pastCollectionEfficiency.map((item, index) => (
                    <motion.tr
                      key={index}
                      whileHover={{ scale: 1.01, backgroundColor: "#f0f9ff" }}
                      className="border-b border-gray-300 transition"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        {item.month}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.collected.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        ₹{item.expected.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {item.efficiency.toFixed(2)}%
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-2 sm:py-4 text-gray-500 italic"
                    >
                      No past efficiency data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrgCollections;