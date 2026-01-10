import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../../BaseUrl";

// Icons
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaImage,
  FaHome,
  FaClock,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

// Brand colors
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";

const Dues = () => {
  const [data, setData] = useState({ subOwner: {}, tenants: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subOwnerId, setSubOwnerId] = useState(null);
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Current date for overdue check (as of January 10, 2026)
  const currentDate = new Date("2026-01-10T00:00:00.000Z");

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < currentDate;
  };

  // Fetch sub-owner profile
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
          `${baseurl}api/sub-owner/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: source.token,
          }
        );

        if (response.data.success && response.data.subOwner?.id) {
          setSubOwnerId(response.data.subOwner.id);
          setData((prev) => ({
            ...prev,
            subOwner: {
              name: response.data.subOwner?.name || "—",
              email: response.data.subOwner?.email || "—",
              assignedProperties: response.data.subOwner?.assignedProperties || [],
            },
          }));
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => source.cancel();
  }, [token]);

  // Fetch dues summary
  useEffect(() => {
    let source = axios.CancelToken.source();

    const fetchDues = async () => {
      if (!subOwnerId || !token) return;

      try {
        const response = await axios.get(
          `${baseurl}api/subowner/dues/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: source.token,
          }
        );

        if (response.data.tenants) {
          setData((prev) => ({
            ...prev,
            tenants: response.data.tenants || [],
          }));
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || "Failed to load dues");
          toast.error("Failed to load dues summary");
        }
      }
    };

    if (subOwnerId) fetchDues();

    return () => source.cancel();
  }, [subOwnerId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-16 h-16 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#172554] font-medium text-lg">Loading dues summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 shadow-xl max-w-lg w-full text-center border-t-4 border-red-500">
          <div className="text-red-500 text-6xl mb-6">
            <FaExclamationCircle />
          </div>
          <h2 className="text-2xl font-bold text-[#172554] mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        {/* <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
            GHARZO <span className="text-[#F97316]">Dues</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Overview of pending dues and tenant payments
          </p>
        </div> */}

        {/* Sub-Owner Info Card */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#F97316] p-8">
            <h2 className="text-2xl font-bold text-[#172554] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                <FaUser className="text-[#F97316] text-xl" />
              </div>
              Sub-Owner Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-lg font-medium text-[#172554]">
                  {data.subOwner?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-lg font-medium text-[#172554] break-all">
                  {data.subOwner?.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Properties</p>
                <p className="text-lg font-medium text-[#172554]">
                  {data.subOwner?.assignedProperties?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Dues Section */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#172554] mb-8">
          Tenant Dues Overview
        </h2>

        {data.tenants.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <FaMoneyBillWave className="mx-auto text-7xl text-[#F97316]/30 mb-6" />
            <h3 className="text-2xl font-semibold text-[#172554] mb-3">
              No dues recorded
            </h3>
            <p className="text-gray-600">
              Tenant payment dues will appear here once available
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.tenants.map((tenantInfo) => (
              <div
                key={tenantInfo.tenant.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-[#F97316]/40 transition-all duration-300"
              >
                {/* Tenant Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#172554]">
                        {tenantInfo.tenant.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tenantInfo.tenant.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-orange-50 px-5 py-2.5 rounded-full">
                      <span className="text-sm font-medium text-[#F97316]">
                        Total Due:
                      </span>
                      <span className="text-xl font-bold text-[#F97316]">
                        ₹{tenantInfo.totalAmount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dues Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-4 text-left font-medium text-gray-700">
                          Due Name
                        </th>
                        <th className="px-6 py-4 text-left font-medium text-gray-700">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left font-medium text-gray-700">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantInfo.dues.map((due, index) => (
                        <tr
                          key={index}
                          className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                            isOverdue(due.dueDate) ? "bg-red-50/40" : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-medium text-[#172554]">
                            {due.name || "Unnamed Due"}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#F97316]">
                            ₹{due.amount || 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                due.status === "PENDING"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {due.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatDate(due.dueDate)}
                            {isOverdue(due.dueDate) && (
                              <span className="ml-2 text-red-500 text-xs font-medium">
                                Overdue
                              </span>
                            )}
                          </td>
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
};

export default Dues;