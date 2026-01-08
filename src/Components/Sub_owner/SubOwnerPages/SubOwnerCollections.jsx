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
import axios from "axios";

const ForecastSummary = () => {
  const [data, setData] = useState({
    success: false,
    forecast: {
      currentMonth: { month: "", expected: 0, byProperty: [], projectedCollection: 0 },
      nextMonth: { month: "", expected: 0, byProperty: [], projectedCollection: 0 },
      twoMonthsAhead: { month: "", expected: 0, byProperty: [], projectedCollection: 0 },
      breakdown: [],
      pastCollectionEfficiency: [],
      projectedEfficiency: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    size = "[5px]",
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
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    <li key={prop.propertyId}>
                      {prop.propertyName}: ₹{prop.expected.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </div>

          {/* Next Month */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    <li key={prop.propertyId}>
                      {prop.propertyName}: ₹{prop.expected.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </div>

          {/* Two Months Ahead */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    <li key={prop.propertyId}>
                      {prop.propertyName}: ₹{prop.expected.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Breakdown by Property
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forecast.breakdown.map((prop) => (
              <div
                key={prop.propertyId}
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
                  <p className="flex items-center gap-2 font-bold">
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
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Past Collection Efficiency */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
            <div className="space-y-3 text-sm text-gray-600">
              {forecast.pastCollectionEfficiency.map((eff) => (
                <p key={eff.month} className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaPercentage}
                    color="from-purple-500 to-indigo-600"
                    size="sm"
                  />
                  <span>
                    {eff.month}: Collected ₹{eff.collected.toLocaleString()} / Expected ₹{eff.expected.toLocaleString()} ({eff.efficiency}%)
                  </span>
                </p>
              ))}
            </div>
          </div>

          {/* Projected Efficiency */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
              <p className="flex items-center gap-2 text-2xl font-bold">
                <Colorful3DIcon
                  icon={FaPercentage}
                  color="from-blue-500 to-green-600"
                  size="lg"
                />
                <span>{forecast.projectedEfficiency}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastSummary;