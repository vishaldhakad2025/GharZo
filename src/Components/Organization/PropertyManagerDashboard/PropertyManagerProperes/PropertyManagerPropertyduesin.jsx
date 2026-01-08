import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PropertyManagerPropertyduesin() {
  const [data, setData] = useState({ propertyManager: {}, tenants: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyManagerId, setPropertyManagerId] = useState(null);
  const token = localStorage.getItem("token");
  const location = useLocation();
  const currentDate = new Date("2025-09-16T00:00:00.000Z");

  // ---------- Helper functions ----------
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < currentDate;
  };

  // ---------- Calculate grand total of ALL dues ----------
  const grandTotal = data.tenants.reduce((accTenant, tenantInfo) => {
    return (
      accTenant +
      tenantInfo.dues.reduce((accDue, due) => accDue + due.amount, 0)
    );
  }, 0);

  // ---------- Fetch profile ----------
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchProfile = async () => {
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          "https://api.gharzoreality.com/api/property-managers/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
            cancelToken: source.token,
          }
        );
        const responseData = response.data;
        if (responseData.success && responseData.data?.id) {
          setPropertyManagerId(responseData.data.id);
          setData({
            propertyManager: {
              name: responseData.data?.name || "N/A",
              email: responseData.data?.email || "N/A",
              properties: responseData.data?.properties || [],
            },
            tenants: [],
          });
          setError(null);
        } else {
          setError("Invalid profile data received.");
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Profile fetch cancelled");
        } else if (error.code === "ECONNABORTED") {
          setError("Request timed out. Please try again later.");
          toast.error("Request timed out. Please try again later.");
        } else {
          setError(
            error.response?.data?.message ||
              "An error occurred while fetching the profile"
          );
          toast.error(
            error.response?.data?.message ||
              "An error occurred while fetching the profile"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => source.cancel("Component unmounted");
  }, [token]);

  // ---------- Fetch dues ----------
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchDues = async () => {
      if (!propertyManagerId || !token) {
        setError("Missing property manager ID or authentication token");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.gharzoreality.com/api/pm/dues/assigned/${propertyManagerId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
            cancelToken: source.token,
          }
        );

        if (response.data.success && response.data.tenants) {
          setData((prev) => ({
            ...prev,
            propertyManager: {
              name: response.data.pm?.name || prev.propertyManager.name,
              email: response.data.pm?.email || prev.propertyManager.email,
              properties: prev.propertyManager.properties,
            },
            tenants: response.data.tenants || [],
          }));
          setError(null);
        } else {
          throw new Error(response.data.message || "Failed to fetch dues");
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Dues fetch cancelled");
        } else if (err.code === "ECONNABORTED") {
          setError("Dues request timed out. Please try again later.");
          toast.error("Dues request timed out. Please try again later.");
        } else {
          setError(err.message || "Failed to fetch dues");
          toast.error(err.message || "Failed to fetch dues");
        }
      } finally {
        setLoading(false);
      }
    };

    if (propertyManagerId) fetchDues();
    return () => source.cancel("Component unmounted");
  }, [propertyManagerId, token]);

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-semibold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-red-600 text-center font-medium max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 p-4 sm:p-6 md:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="max-w-6xl mx-auto">
        {/* ---------- Property Manager Section (with grand total) ---------- */}
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl transform hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Property Manager Details
          </h1>
          <div className="space-y-3 text-gray-700">
            <p className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">Name:</span>
              <span className="px-3 py-1 bg-blue-100 rounded-full">
                {data.propertyManager?.name || "N/A"}
              </span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">Email:</span>
              <span className="px-3 py-1 bg-blue-100 rounded-full">
                {data.propertyManager?.email || "N/A"}
              </span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">
                Assigned Properties:
              </span>
              <span className="px-3 py-1 bg-blue-100 rounded-full">
                {data.propertyManager?.properties?.length > 0
                  ? data.propertyManager.properties
                      .map((prop) => prop.name)
                      .join(", ")
                  : "None"}
              </span>
            </p>

            {/* <<< GRAND TOTAL ADDED HERE >>> */}
            <p className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">
                Total Dues (All Tenants):
              </span>
              <span className="px-3 py-1 bg-green-100 rounded-full font-bold text-green-800">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        </div>

        {/* ---------- Tenants Section (unchanged) ---------- */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Tenant Dues
        </h1>
        {data.tenants.length === 0 ? (
          <p className="text-gray-500 text-center italic bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
            No dues found for tenants.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
            {data.tenants.map((tenantInfo) => (
              <div
                key={tenantInfo.tenant.id}
                className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {tenantInfo.tenant.name}
                </h2>
                <p className="text-gray-600 mt-1 flex items-center">
                  <span className="font-semibold mr-2">Email:</span>
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    {tenantInfo.tenant.email}
                  </span>
                </p>
                <p className="text-gray-600 mt-1 flex items-center">
                  <span className="font-semibold mr-2">Total Dues:</span>
                  <span className="px-2 py-1 bg-green-100 rounded-full">
                    ₹{tenantInfo.totalAmount || 0}
                  </span>
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mt-4">
                  Dues Details
                </h3>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border-collapse text-sm sm:text-base">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-800">
                        <th className="p-3 text-left font-semibold rounded-tl-lg">
                          Name
                        </th>
                        <th className="p-3 text-left font-semibold">Amount</th>
                        <th className="p-3 text-left font-semibold">Status</th>
                        <th className="p-3 text-left font-semibold rounded-tr-lg">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantInfo.dues.map((due, dueIndex) => (
                        <tr
                          key={dueIndex}
                          className={`${
                            isOverdue(due.dueDate)
                              ? "bg-red-50/80"
                              : "bg-white/80"
                          } hover:bg-blue-50/50 backdrop-blur-sm transition-colors duration-200`}
                        >
                          <td className="p-3">{due.name || "Unnamed Due"}</td>
                          <td className="p-3">₹{due.amount}</td>
                          <td
                            className={`p-3 ${
                              due.status === "PENDING"
                                ? "text-red-600 font-medium bg-red-100/50 rounded-full px-2 inline-block"
                                : "text-green-600 bg-green-100/50 rounded-full px-2 inline-block"
                            }`}
                          >
                            {due.status}
                          </td>
                          <td className="p-3">{formatDate(due.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyManagerPropertyduesin;