import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Dues = () => {
  const [data, setData] = useState({ landlord: {}, tenants: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landlordId, setLandlordId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const token = localStorage.getItem("token");
  const location = useLocation();
  const currentDate = new Date("2025-09-16T00:00:00.000Z");

  // Detect sidebar hover state
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);

      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Check if due date is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < currentDate;
  };

  // Calculate grand total across all tenants
  const grandTotal = data.tenants.reduce((sum, tenant) => sum + (tenant.totalAmount || 0), 0);

  // Fetch landlord profile to get landlordId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          "https://api.gharzoreality.com/api/landlord/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setLandlordId(data.landlord?._id);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch profile: ${errorData.message || "Unauthorized"}`
          );
          setLoading(false);
        }
      } catch (error) {
        setError("An error occurred while fetching the profile");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch dues once landlordId is available
  useEffect(() => {
    const fetchDues = async () => {
      if (!landlordId || !token) {
        setError("Missing landlord ID or authentication token");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/dues/getdue/${landlordId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dues");
        }

        const responseData = await response.json();
        setData(responseData || { landlord: {}, tenants: [] });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (landlordId) {
      fetchDues();
    }
  }, [landlordId, token]);

  if (loading) {
    return (
      <div
        className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{
          background: `
            radial-gradient(circle at bottom, rgba(245,124,0,0.35), transparent 60%),
            linear-gradient(180deg, #071a2f 0%, #0d2f52 45%, #123e6b 75%, #0b2a4a 100%)
          `,
        }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin [animation-delay:0.15s] [animation-duration:1.5s]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{
          background: `
            radial-gradient(circle at bottom, rgba(245,124,0,0.35), transparent 60%),
            linear-gradient(180deg, #071a2f 0%, #0d2f52 45%, #123e6b 75%, #0b2a4a 100%)
          `,
        }}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/10 backdrop-blur-md border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-200 text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `
          radial-gradient(circle at bottom, rgba(245,124,0,0.35), transparent 60%),
          linear-gradient(180deg, #071a2f 0%, #0d2f52 45%, #123e6b 75%, #0b2a4a 100%)
        `,
      }}
    >
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl mb-8 p-6 sm:p-8 border border-white/20 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
            Dues Management
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-bold text-indigo-300">
            Total Outstanding: ₹{grandTotal.toLocaleString()}
          </p>
        </header>

        {/* Landlord Section */}
        <div className="mb-8 p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-3">
            Landlord Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-300 font-medium">Name:</span>
              <span className="px-4 py-2 bg-indigo-500/30 rounded-full text-white font-semibold border border-indigo-400/50">
                {data.landlord?.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 font-medium">Email:</span>
              <span className="px-4 py-2 bg-indigo-500/30 rounded-full text-white font-semibold border border-indigo-400/50">
                {data.landlord?.email || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Tenants Section */}
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-3">
          Tenant Dues
        </h2>
        {data.tenants.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
            <p className="text-gray-300 text-lg">
              No dues found for tenants.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {data.tenants.map((tenantInfo) => (
              <div
                key={tenantInfo.tenant.id}
                className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-300">
                      {tenantInfo.tenant.name}
                    </h3>
                    <p className="text-gray-300 mt-2">
                      <span className="font-medium">Email:</span>
                      <span className="ml-3 px-4 py-1 bg-indigo-500/30 rounded-full border border-indigo-400/50">
                        {tenantInfo.tenant.email}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 font-medium">Total Dues</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      ₹{tenantInfo.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <h4 className="text-xl font-semibold text-white mb-4 border-b border-white/20 pb-2">
                  Dues Details
                </h4>

                {tenantInfo.dues.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">
                    No dues for this tenant.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenantInfo.dues.map((due, dueIndex) => (
                      <div
                        key={dueIndex}
                        className={`p-4 rounded-2xl border ${
                          isOverdue(due.dueDate)
                            ? "bg-red-500/20 border-red-400/50"
                            : "bg-white/10 border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-white text-lg">
                              {due.name || "Unnamed Due"}
                            </p>
                            <p className="text-sm text-gray-300 mt-1">
                              Due Date: {formatDate(due.dueDate)}
                            </p>
                          </div>
                          <span className="px-4 py-2 bg-indigo-500/40 rounded-full text-white font-bold border border-indigo-400/50">
                            ₹{due.amount}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <span
                            className={`px-4 py-2 rounded-full font-bold text-sm ${
                              due.status === "PENDING"
                                ? "bg-red-500/40 text-red-200 border border-red-400/50"
                                : "bg-green-500/40 text-green-200 border border-green-400/50"
                            }`}
                          >
                            {due.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dues;