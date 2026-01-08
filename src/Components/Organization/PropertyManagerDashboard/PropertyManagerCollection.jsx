import React, { useState, useEffect } from "react";
import { FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

function PropertyManagerCollection() {
  const [summary, setSummary] = useState({});
  const [forecast, setForecast] = useState({});
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reusable API fetcher
  const fetchApi = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token missing. Please log in again.");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    if (!response.ok) {
      let message = text;
      try {
        const err = JSON.parse(text);
        message = err.message || message;
      } catch {}
      throw new Error(response.status === 401 ? "Session expired. Please log in again." : message);
    }

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Invalid response from server.");
    }

    if (data.success === false) throw new Error(data.message || "API request failed.");
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, forecastRes] = await Promise.all([
          fetchApi("https://api.gharzoreality.com/api/pm/collections/summary"),
          fetchApi("https://api.gharzoreality.com/api/pm/collections/forecast"),
        ]);

        setSummary(summaryRes.summary || {});
        const forecastData = forecastRes.forecast || {};
        setForecast(forecastData);

        const breakdown = forecastData.breakdown || [];
        if (breakdown.length > 0) {
          const propertyIds = [...new Set(breakdown.map((b) => b.propertyId))];
          const results = await Promise.allSettled(
            propertyIds.map((id) =>
              fetchApi(`https://api.gharzoreality.com/api/pm/collections/report/${id}`)
                .then((data) => ({ id, report: data.report }))
                .catch(() => ({ id, report: null }))
            )
          );

          const reportsMap = {};
          results.forEach((res) => {
            if (res.status === "fulfilled" && res.value.report) {
              reportsMap[res.value.id] = res.value.report;
            }
          });
          setReports(reportsMap);
        }
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="p-4 min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg h-24"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-white rounded-lg"></div>
              <div className="h-32 bg-white rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 min-h-screen bg-gray-100"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 text-gray-800"
        >
          <FaWallet className="text-blue-600" /> Collections Forecast
        </motion.h2>
        <p className="text-gray-600 mb-6">Track rent, payments, and collection efficiency.</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Properties", value: summary.totalProperties ?? 0, color: "blue" },
            { label: "Total Collected", value: `₹${(summary.totalCollected ?? 0).toLocaleString()}`, color: "green" },
            { label: "Projected Efficiency", value: `${forecast.projectedEfficiency ?? 0}%`, color: "purple" },
            { label: "Recent Payments", value: summary.recentPayments?.length ?? 0, color: "indigo" },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`bg-white p-4 rounded-lg shadow-md border-l-4 border-${card.color}-500`}
            >
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Collection by Category */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Collection by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {["rent", "maintenance", "security", "electricity", "water", "other"].map((cat) => {
              const amt = summary.collectionByCategory?.[cat] ?? 0;
              return (
                <motion.div
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center"
                >
                  <p className="text-xs capitalize">{cat}</p>
                  <p className="font-bold">₹{amt.toLocaleString()}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Projected Collections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[forecast.currentMonth, forecast.nextMonth, forecast.twoMonthsAhead].map((m, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-4 rounded-lg text-center"
            >
              <h3 className="font-semibold">{m?.month || "—"}</h3>
              <p className="text-2xl font-bold">₹{(m?.projectedCollection ?? 0).toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        {/* Current Month by Property */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Current Month Collection by Property
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(forecast.currentMonth?.byProperty || []).map((p) => {
              const actual = reports[p.propertyId]?.totalCollected ?? 0;
              return (
                <motion.div
                  key={p.propertyId}
                  whileHover={{ y: -4 }}
                  className="bg-white p-4 rounded-lg shadow border"
                >
                  <p className="font-medium text-gray-700 truncate">{p.propertyName}</p>
                  <p className="text-lg font-bold text-blue-600">₹{(p.expected ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Actual: ₹{actual.toLocaleString()}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <h3 className="p-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold text-lg">
            Collection Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700 text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-3 py-2">Property</th>
                  <th className="px-3 py-2">Rent</th>
                  <th className="px-3 py-2">Maint.</th>
                  <th className="px-3 py-2">Elec.</th>
                  <th className="px-3 py-2">Water</th>
                  <th className="px-3 py-2">Other</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Actual</th>
                  <th className="px-3 py-2">Tenants</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(forecast.breakdown || []).length > 0 ? (
                  forecast.breakdown.map((item) => {
                    const actual = reports[item.propertyId]?.totalCollected ?? 0;
                    return (
                      <motion.tr
                        key={item.propertyId}
                        whileHover={{ backgroundColor: "#f8faff" }}
                        className="hover:bg-blue-50"
                      >
                        <td className="px-3 py-2 truncate max-w-[120px] font-medium">
                          {item.propertyName}
                        </td>
                        <td className="px-3 py-2">₹{(item.rentAmount ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2">₹{(item.maintenanceAmount ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2">₹{(item.electricityAmount ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2">₹{(item.waterAmount ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2">₹{(item.otherAmount ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2 font-bold text-blue-600">
                          ₹{(item.totalAmount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-bold text-red-600">
                          ₹{actual.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center">{item.tenantCount ?? 0}</td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-gray-500 italic">
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Efficiency */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h3 className="p-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold text-lg">
            Past Collection Efficiency
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700 text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Collected</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(forecast.pastCollectionEfficiency || []).length > 0 ? (
                  forecast.pastCollectionEfficiency.map((item, i) => (
                    <motion.tr
                      key={i}
                      whileHover={{ backgroundColor: "#f8faff" }}
                      className="hover:bg-blue-50"
                    >
                      <td className="px-4 py-3 font-medium">{item.month}</td>
                      <td className="px-4 py-3">₹{(item.collected ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">₹{(item.expected ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        {(item.efficiency ?? 0).toFixed(1)}%
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                      No historical data.
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
}

export default PropertyManagerCollection;