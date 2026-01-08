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

  // --- UI Colors ---
  const logoPrimary = "#5C4EFF";
  const logoAccent = "#1fc9b2";
  const logoBg = "bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7]";

  if (loading) {
    return (
      <div
        className={`min-h-screen ${logoBg} flex items-center justify-center transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-[#3B82F6]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#1E3A8A] font-semibold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${logoBg} flex items-center justify-center p-4 transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-[#DC2626] text-center font-medium max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${logoBg} text-[#374151] p-2 sm:p-4 transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-center border-b-4 border-[#5C4EFF] text-center sm:text-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5C4EFF] tracking-tight">
              Dues Management
            </h1>
            <p className="text-[#1fc9b2] mt-1 text-lg font-semibold">
              Total Outstanding: ₹{grandTotal}
            </p>
            {/* <p className="text-[#1fc9b2] mt-1 text-sm">
              Track all pending and cleared dues for your tenants.
            </p> */}
          </div>
        </header>

        {/* Landlord Section */}
        <div className="mb-8 p-6 bg-white/95 rounded-xl shadow-lg border-l-8 border-[#5C4EFF]">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#5C4EFF] mb-4">
            Landlord Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#374151]">
            <div>
              <span className="font-medium">Name:</span>
              <span className="ml-2 px-3 py-1 bg-[#e7eaff] rounded-full">
                {data.landlord?.name || "N/A"}
              </span>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <span className="ml-2 px-3 py-1 bg-[#e7eaff] rounded-full">
                {data.landlord?.email || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Tenants Section */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#5C4EFF] mb-4">
          Tenant Dues
        </h2>
        {data.tenants.length === 0 ? (
          <div className="text-center text-[#6B7280] bg-white/90 p-6 rounded-xl shadow border-l-4 border-[#1fc9b2]">
            No dues found for tenants.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {data.tenants.map((tenantInfo) => (
              <div
                key={tenantInfo.tenant.id}
                className="p-4 sm:p-6 bg-white/95 rounded-xl shadow-lg border-l-8 border-[#1fc9b2] hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1fc9b2]">
                      {tenantInfo.tenant.name}
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      <span className="font-medium">Email:</span>
                      <span className="ml-2 px-2 py-1 bg-[#e7eaff] rounded-full">
                        {tenantInfo.tenant.email}
                      </span>
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className="font-medium text-[#374151]">
                      Total Dues:
                    </span>
                    <span className="ml-2 px-4 py-2 bg-[#5C4EFF] text-white rounded-full font-bold text-lg shadow inline-block">
                      ₹{tenantInfo.totalAmount || 0}
                    </span>
                  </div>
                </div>
                <h4 className="text-base sm:text-lg font-medium text-[#374151] mt-4 mb-2">
                  Dues Details
                </h4>
                <div>
                  {tenantInfo.dues.length === 0 ? (
                    <div className="text-[#6B7280] text-sm">
                      No dues for this tenant.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {tenantInfo.dues.map((due, dueIndex) => (
                        <div
                          key={dueIndex}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border ${
                            isOverdue(due.dueDate)
                              ? "bg-[#ffeaea] border-[#DC2626]/30"
                              : "bg-[#f8fafc] border-[#e7eaff]"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-[#374151]">
                              {due.name || "Unnamed Due"}
                            </div>
                            <div className="text-xs text-[#6B7280]">
                              Due Date: {formatDate(due.dueDate)}
                            </div>
                          </div>
                          <div className="flex flex-row flex-wrap gap-2 items-center">
                            <span className="px-3 py-1 rounded-full font-semibold text-xs sm:text-sm bg-[#5C4EFF] text-white border border-[#5C4EFF]">
                              ₹{due.amount}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${
                                due.status === "PENDING"
                                  ? "bg-[#5C4EFF] text-white border border-[#5C4EFF]"
                                  : "bg-[#1fc9b2] text-white border border-[#1fc9b2]"
                              }`}
                              style={{ minWidth: 80, textAlign: "center" }}
                            >
                              {due.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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