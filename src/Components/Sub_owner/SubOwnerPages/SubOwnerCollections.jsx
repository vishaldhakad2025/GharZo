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
import baseurl from "../../../../BaseUrl";

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
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${baseurl}api/subowner/collections/forecast`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setData(response.data);
          setError(null);
        } else {
          setError("Failed to fetch forecast data.");
        }
      } catch (err) {
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

  // Modern brand icon component
  const BrandIcon = ({ icon: Icon, accent = false, size = "xl", className = "" }) => (
    <motion.div
      className={`relative p-4 rounded-2xl shadow-lg bg-gradient-to-br ${
        accent ? "from-[#FF6600] to-[#FF994D]" : "from-[#003366] to-[#336699]"
      } transform hover:scale-110 hover:rotate-2 transition-all duration-300 ${className}`}
      whileHover={{ y: -6, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className={`text-white text-${size} drop-shadow-md`} />
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          >
            <BrandIcon icon={FaSpinner} size="6xl" accent={true} />
          </motion.div>
          <p className="mt-6 text-xl font-medium text-gray-700">Loading Collection Forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg w-full text-center border border-red-100">
          <BrandIcon icon={FaExclamationCircle} size="6xl" accent={true} />
          <p className="mt-6 text-xl font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const { forecast } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold">
            <span className="text-[#003366]">Collection</span>
            <span className="bg-gradient-to-r from-[#FF6600] to-[#FF994D] bg-clip-text text-transparent ml-3">
              Forecast
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Projected rent & maintenance collections overview
          </p>
        </div>

        {/* 3-Month Forecast Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {[
            { title: forecast.currentMonth.month, data: forecast.currentMonth, accent: true },
            { title: forecast.nextMonth.month, data: forecast.nextMonth, accent: false },
            { title: forecast.twoMonthsAhead.month, data: forecast.twoMonthsAhead, accent: false },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <BrandIcon icon={FaCalendarAlt} size="4xl" accent={item.accent} />
                <h3 className="text-2xl font-bold text-[#003366]">{item.title}</h3>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-600">Expected</span>
                  <span className="text-xl font-bold text-gray-800">
                    ₹{item.data.expected.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-600">Projected</span>
                  <span className="text-xl font-bold text-[#FF6600]">
                    ₹{item.data.projectedCollection.toLocaleString()}
                  </span>
                </div>

                <div className="pt-3">
                  <p className="text-sm text-gray-500 mb-3 font-medium">By Property:</p>
                  <div className="space-y-2 text-sm">
                    {item.data.byProperty.map((prop) => (
                      <div
                        key={prop.propertyId}
                        className="flex justify-between bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-700 truncate">{prop.propertyName}</span>
                        <span className="font-semibold text-gray-800">
                          ₹{prop.expected.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Breakdown Section */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 text-[#003366]">
            Property-wise Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {forecast.breakdown.map((prop) => (
              <motion.div
                key={prop.propertyId}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-6">
                  <BrandIcon icon={FaBuilding} size="4xl" />
                  <h3 className="text-2xl font-bold text-[#003366] truncate">
                    {prop.propertyName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-m">
                  {[
                    { label: "Rent", value: prop.rentAmount, color: "text-blue-600" },
                    { label: "Maintenance", value: prop.maintenanceAmount, color: "text-cyan-600" },
                    { label: "Electricity", value: prop.electricityAmount, color: "text-purple-600" },
                    { label: "Water", value: prop.waterAmount, color: "text-teal-600" },
                    { label: "Other", value: prop.otherAmount, color: "text-orange-600" },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-m mb-1">{item.label}</p>
                      <p className={`font-bold text-lg ${item.color}`}>
                        ₹{item.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Total Amount</p>
                    <p className="text-xl font-bold text-[#FF6600]">
                      ₹{prop.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tenants</p>
                    <p className="text-xl font-bold text-gray-800">{prop.tenantCount}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Efficiency Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Past Efficiency */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4 mb-8">
              <BrandIcon icon={FaHistory} size="4xl" accent={true} />
              <h3 className="text-3xl font-bold text-[#003366]">Past Collection Efficiency</h3>
            </div>
            <div className="space-y-4">
              {forecast.pastCollectionEfficiency.map((eff) => (
                <div
                  key={eff.month}
                  className="flex justify-between items-center bg-gray-50 rounded-xl p-5 border border-gray-200"
                >
                  <div>
                    <p className="text-gray-700 font-medium">{eff.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Collected ₹{eff.collected.toLocaleString()}
                    </p>
                    <p className="text-xl font-bold text-[#003366]">
                      {eff.efficiency}% <span className="text-gray-500 text-base">of expected</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projected Efficiency */}
          <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-200 flex flex-col justify-center items-center text-center">
            <BrandIcon icon={FaArrowUp} size="6xl" accent={true} className="mb-8" />
            <h3 className="text-3xl font-bold text-[#003366] mb-6">Projected Efficiency</h3>
            <div className="text-7xl md:text-9xl font-black text-[#FF6600]">
              {forecast.projectedEfficiency}%
            </div>
            <p className="mt-6 text-xl text-gray-600">Expected performance next period</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastSummary;