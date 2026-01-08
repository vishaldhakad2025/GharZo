import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaRupeeSign,
  FaBuilding,
  FaSpinner,
  FaExclamationCircle,
  FaCalendarAlt,
  FaPercentage,
  FaArrowUp,
  FaHistory,
} from "react-icons/fa";
import { motion } from "framer-motion";
// import axios from "axios"; // Commented out since API calls are disabled

const ForecastSummary = () => {
  const [data, setData] = useState({
    success: true,
    forecast: {
      currentMonth: { 
        month: "October 2025", 
        expected: 520000, 
        byProperty: [
          { propertyId: 1, propertyName: "Urban Heights", expected: 280000 },
          { propertyId: 2, propertyName: "River View Apartments", expected: 240000 }
        ], 
        projectedCollection: 468000 
      },
      nextMonth: { 
        month: "November 2025", 
        expected: 550000, 
        byProperty: [
          { propertyId: 1, propertyName: "Urban Heights", expected: 295000 },
          { propertyId: 2, propertyName: "River View Apartments", expected: 255000 }
        ], 
        projectedCollection: 495000 
      },
      twoMonthsAhead: { 
        month: "December 2025", 
        expected: 580000, 
        byProperty: [
          { propertyId: 1, propertyName: "Urban Heights", expected: 310000 },
          { propertyId: 2, propertyName: "River View Apartments", expected: 270000 }
        ], 
        projectedCollection: 522000 
      },
      breakdown: [
        { 
          propertyId: 1, 
          propertyName: "Urban Heights", 
          rentAmount: 200000, 
          maintenanceAmount: 25000, 
          electricityAmount: 15000, 
          waterAmount: 8000, 
          otherAmount: 5000, 
          totalAmount: 253000,
          tenantCount: 15 
        },
        { 
          propertyId: 2, 
          propertyName: "River View Apartments", 
          rentAmount: 180000, 
          maintenanceAmount: 22000, 
          electricityAmount: 12000, 
          waterAmount: 7000, 
          otherAmount: 4000, 
          totalAmount: 225000,
          tenantCount: 12 
        }
      ],
      pastCollectionEfficiency: [
        { month: "September 2025", collected: 480000, expected: 520000, efficiency: 92 },
        { month: "August 2025", collected: 450000, expected: 500000, efficiency: 90 },
        { month: "July 2025", collected: 420000, expected: 480000, efficiency: 88 }
      ],
      projectedEfficiency: 90,
    },
  });
  const [loading, setLoading] = useState(false); // Set to false since using dummy data
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Commented out API call for now
        /*
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
        console.log("Retrieved token:", token); // Debug log
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch forecast data with token in Authorization header
        const response = await axios.get(
          "https://api.gharzoreality.com/api/subowner/collections/forecast",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API response:", response.data); // Debug log
        if (response.data.success) {
          setData(response.data);
          setError(null);
        } else {
          setError("Failed to fetch forecast data.");
        }
        */

        // Use dummy data for demo
        // setData({ ... }); // Already set in initial state
      } catch (err) {
        console.error("API error:", err); // Debug log
        if (err.response?.status === 404) {
          setError("Forecast endpoint not found. Please check the API URL or contact support.");
        } else if (err.response?.status === 401) {
          setError("Unauthorized request. Please check your authentication token.");
        } else {
          setError(err.response?.data?.message || "Failed to fetch data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Colorful 3D Icon Component
  const Colorful3DIcon = ({
    icon: Icon,
    color,
    size = "xl",
    className = "",
  }) => (
    <motion.div
      className={`relative p-3 rounded-2xl shadow-lg bg-gradient-to-br ${color} transform hover:scale-110 hover:rotate-3 transition-all duration-300 perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ y: -5 }}
    >
      <Icon className={`text-white text-${size} drop-shadow-lg`} />
      <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center transition-all duration-500">
        <div className="text-center">
          <Colorful3DIcon
            icon={FaSpinner}
            color="from-green-500 to-blue-600"
            size="2xl"
          />
          <p className="mt-4 text-lg font-semibold text-gray-600">
            Loading Forecast Summary...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center transition-all duration-500">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Colorful3DIcon
            icon={FaExclamationCircle}
            color="from-red-500 to-orange-500"
          />
          <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const { forecast } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800 transition-all duration-500">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Collection Forecast
          </h1>
          <p className="text-xl text-gray-600">
            Projected collections for upcoming months
          </p>
        </div>

        {/* Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <Colorful3DIcon
                icon={FaCalendarAlt}
                color="from-green-500 to-teal-500"
                size="xl"
              />
              <h3 className="text-lg font-bold text-gray-800">
                {forecast.currentMonth.month}
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaRupeeSign}
                  color="from-blue-500 to-indigo-600"
                  size="sm"
                />
                <span>Expected: ₹{forecast.currentMonth.expected.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaArrowUp}
                  color="from-purple-500 to-pink-600"
                  size="sm"
                />
                <span>Projected: ₹{forecast.currentMonth.projectedCollection.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaBuilding}
                  color="from-yellow-500 to-orange-600"
                  size="sm"
                />
                <span>By Property:</span>
                <ul className="ml-4 list-disc">
                  {forecast.currentMonth.byProperty.map((prop) => (
                    <li key={prop.propertyId} className="mt-1">
                      {prop.propertyName}: ₹{prop.expected.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </motion.div>

          {/* Next Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <Colorful3DIcon
                icon={FaCalendarAlt}
                color="from-blue-500 to-indigo-500"
                size="xl"
              />
              <h3 className="text-lg font-bold text-gray-800">
                {forecast.nextMonth.month}
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaRupeeSign}
                  color="from-blue-500 to-indigo-600"
                  size="sm"
                />
                <span>Expected: ₹{forecast.nextMonth.expected.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaArrowUp}
                  color="from-purple-500 to-pink-600"
                  size="sm"
                />
                <span>Projected: ₹{forecast.nextMonth.projectedCollection.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaBuilding}
                  color="from-yellow-500 to-orange-600"
                  size="sm"
                />
                <span>By Property:</span>
                <ul className="ml-4 list-disc">
                  {forecast.nextMonth.byProperty.map((prop) => (
                    <li key={prop.propertyId} className="mt-1">
                      {prop.propertyName}: ₹{prop.expected.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </motion.div>

          {/* Two Months Ahead */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <Colorful3DIcon
                icon={FaCalendarAlt}
                color="from-purple-500 to-pink-500"
                size="xl"
              />
              <h3 className="text-lg font-bold text-gray-800">
                {forecast.twoMonthsAhead.month}
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaRupeeSign}
                  color="from-blue-500 to-indigo-600"
                  size="sm"
                />
                <span>Expected: ₹{forecast.twoMonthsAhead.expected.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaArrowUp}
                  color="from-purple-500 to-pink-600"
                  size="sm"
                />
                <span>Projected: ₹{forecast.twoMonthsAhead.projectedCollection.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Colorful3DIcon
                  icon={FaBuilding}
                  color="from-yellow-500 to-orange-600"
                  size="sm"
                />
                <span>By Property:</span>
                <ul className="ml-4 list-disc">
                  {forecast.twoMonthsAhead.byProperty.map((prop) => (
                    <li key={prop.propertyId} className="mt-1">
                      {prop.propertyName}: ₹{prop.expected.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Breakdown Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Breakdown by Property
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forecast.breakdown.map((prop, index) => (
              <motion.div
                key={prop.propertyId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Colorful3DIcon
                    icon={FaBuilding}
                    color="from-orange-500 to-red-500"
                    size="xl"
                  />
                  <h3 className="text-lg font-bold text-gray-800">
                    {prop.propertyName}
                  </h3>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Colorful3DIcon
                      icon={FaRupeeSign}
                      color="from-green-500 to-emerald-600"
                      size="sm"
                    />
                    <span>Rent: ₹{prop.rentAmount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Colorful3DIcon
                      icon={FaRupeeSign}
                      color="from-blue-500 to-indigo-600"
                      size="sm"
                    />
                    <span>Maintenance: ₹{prop.maintenanceAmount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Colorful3DIcon
                      icon={FaRupeeSign}
                      color="from-purple-500 to-pink-600"
                      size="sm"
                    />
                    <span>Electricity: ₹{prop.electricityAmount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Colorful3DIcon
                      icon={FaRupeeSign}
                      color="from-yellow-500 to-orange-600"
                      size="sm"
                    />
                    <span>Water: ₹{prop.waterAmount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Colorful3DIcon
                      icon={FaRupeeSign}
                      color="from-red-500 to-pink-600"
                      size="sm"
                    />
                    <span>Other: ₹{prop.otherAmount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-2 font-bold text-lg">
                    <Colorful3DIcon
                      icon={FaChartLine}
                      color="from-green-500 to-blue-600"
                      size="sm"
                    />
                    <span>Total: ₹{prop.totalAmount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Colorful3DIcon
                      icon={FaPercentage}
                      color="from-indigo-500 to-purple-600"
                      size="sm"
                    />
                    <span>Tenants: {prop.tenantCount}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Efficiency Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Past Collection Efficiency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <Colorful3DIcon
                icon={FaHistory}
                color="from-red-500 to-orange-500"
                size="xl"
              />
              <h3 className="text-lg font-bold text-gray-800">
                Past Collection Efficiency
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600 max-h-64 overflow-y-auto">
              {forecast.pastCollectionEfficiency.map((eff, index) => (
                <motion.p 
                  key={eff.month} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <Colorful3DIcon
                    icon={FaPercentage}
                    color="from-purple-500 to-indigo-600"
                    size="sm"
                  />
                  <span>
                    {eff.month}: Collected ₹{eff.collected.toLocaleString()} / Expected ₹{eff.expected.toLocaleString()} ({eff.efficiency}%)
                  </span>
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* Projected Efficiency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <Colorful3DIcon
                icon={FaArrowUp}
                color="from-green-500 to-emerald-500"
                size="xl"
              />
              <h3 className="text-lg font-bold text-gray-800">
                Projected Efficiency
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center justify-center gap-2 text-4xl font-bold text-green-600">
                <Colorful3DIcon
                  icon={FaPercentage}
                  color="from-blue-500 to-green-600"
                  size="lg"
                />
                <span>{forecast.projectedEfficiency}%</span>
              </p>
              <p className="text-center text-gray-500">Based on historical trends</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForecastSummary;