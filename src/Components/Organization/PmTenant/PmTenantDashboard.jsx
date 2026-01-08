import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaBuilding,
  FaRupeeSign,
  FaExclamationTriangle,
  FaBullhorn,
  FaHandHoldingUsd,
  FaFileAlt,
  FaCouch,
  FaExchangeAlt,
  FaUserCircle,
  FaChartLine,
  FaBell,
  FaSearch,
  FaPager,
} from "react-icons/fa";

const TenantDashboard = () => {
  const [tenantInfo, setTenantInfo] = useState({ name: "", property: "" });
  const [totalDue, setTotalDue] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenantId, setTenantId] = useState(
    localStorage.getItem("tenantId") ||
      JSON.parse(localStorage.getItem("tenant"))?.tenantId ||
      ""
  );

  // Fetch tenant profile and accommodations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        // Fetch profile for name
        const profileRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch accommodations for property
        const accRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (profileRes.data.success && accRes.data.success) {
          setTenantInfo({
            name: profileRes.data.tenant.name || "",
            property:
              accRes.data.accommodations?.[0]?.propertyName || "Not Provided",
          });

          const fetchedTenantId = accRes.data.accommodations?.[0]?.tenantId;
          if (fetchedTenantId && fetchedTenantId !== tenantId) {
            localStorage.setItem("tenantId", fetchedTenantId);
            setTenantId(fetchedTenantId);
            return; // Exit early to refetch with updated tenantId
          }

          // Fetch dues
          const accommodation = accRes.data.accommodations?.[0];
          if (accommodation) {
            const lId = accommodation.landlordId;
            const duesRes = await axios.get(
              `https://api.gharzoreality.com/api/dues/tenant/${tenantId}/${lId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const allBills = duesRes.data || [];
            const pendingBills = allBills.filter(
              (bill) => bill.status === "Unpaid"
            );
            const totalDuesAmount = pendingBills.reduce(
              (sum, bill) => sum + bill.amount,
              0
            );
            setTotalDue(totalDuesAmount);
          }

          // Fetch complaints
          const complaintsRes = await axios.get(
            `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const complaints = complaintsRes.data || [];
          const activeComplaints = complaints.filter(
            (c) => c.status !== "Resolved" && c.status !== "Rejected"
          ).length;
          setOpenComplaints(activeComplaints);

          // Fetch announcements
          let landlordAnns = [];
          try {
            const landlordAnnRes = await axios.get(
              `https://api.gharzoreality.com/api/announcement/tenant/${tenantId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            landlordAnns = landlordAnnRes.data.announcements || [];
          } catch (err) {
            console.error("Failed to fetch landlord announcements:", err);
          }
          const totalAnns = landlordAnns.length;
          setAnnouncementsCount(totalAnns);
        } else {
          setError(
            profileRes.data.message ||
              accRes.data.message ||
              "Failed to fetch data."
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error.response?.data?.message ||
            "An error occurred while fetching data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  // Dynamic dashboard metrics
  const dashboardMetrics = useMemo(
    () => ({
      totalDue: `₹${totalDue.toLocaleString()}`,
      totalComplaints: openComplaints,
      totalAnnouncements: announcementsCount,
      upcomingRent: "Due on 20th Oct",
    }),
    [totalDue, openComplaints, announcementsCount]
  );

  const dashboardData = [
    {
      icon: <FaBuilding className="text-blue-500 text-3xl" />,
      title: "My Property",
      subtitle: tenantInfo.property,
      link: "/pm_tenant/property",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      color: "text-blue-700",
    },
    {
      icon: <FaExclamationTriangle className="text-orange-500 text-3xl" />,
      title: "Open Complaints",
      subtitle: `${dashboardMetrics.totalComplaints} Active`,
      link: `/pm_tenant/complaints/${tenantId}`,
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      color: "text-orange-700",
    },
    {
      icon: <FaBullhorn className="text-purple-500 text-3xl" />,
      title: "Announcements",
      subtitle: `${dashboardMetrics.totalAnnouncements} New`,
      link: `/pm_tenant/announcements/${tenantId}`,
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      border: "border-purple-200",
      color: "text-purple-700",
    },
    {
      icon: <FaHandHoldingUsd className="text-green-500 text-3xl" />,
      title: "Pay Rent",
      subtitle: dashboardMetrics.upcomingRent,
      link: `/pm_tenant/rent-payments/${tenantId}`,
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      border: "border-green-200",
      color: "text-green-700",
    },
    {
      icon: <FaFileAlt className="text-indigo-500 text-3xl" />,
      title: "Documents",
      subtitle: "Lease & Bills",
      link: "/pm_tenant/documents",
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      color: "text-indigo-700",
    },
    {
      icon: <FaCouch className="text-teal-500 text-3xl" />,
      title: "Facilities",
      subtitle: "Book Amenities",
      link: "/pm_tenant/facilities",
      bg: "bg-gradient-to-br from-teal-50 to-teal-100",
      border: "border-teal-200",
      color: "text-teal-700",
    },
    {
      icon: <FaExchangeAlt className="text-pink-500 text-3xl" />,
      title: "Room Switch",
      subtitle: "Request Change",
      link: "/pm_tenant/room-switch",
      bg: "bg-gradient-to-br from-pink-50 to-pink-100",
      border: "border-pink-200",
      color: "text-pink-700",
    },
    {
      icon: <FaPager className="text-pink-500 text-3xl" />,
      title: "AGREEMENT",
      subtitle: "My RENT AGREEMENT",
      link: "/pm_tenant/rent-agreement",
      bg: "bg-gradient-to-br from-pink-70 to-pink-100",
      border: "border-pink-200",
      color: "text-pink-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
  //         <p>{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaUserCircle className="text-3xl text-gray-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {tenantInfo.name || "Tenant"}!
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your tenancy with ease
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <FaBell className="text-xl text-gray-600 cursor-pointer hover:text-blue-500" />
              <FaChartLine className="text-xl text-gray-600 cursor-pointer hover:text-blue-500" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardData.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden border ${item.border} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${item.bg}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300`}
                    >
                      {React.cloneElement(item.icon, {
                        className: `${item.icon.props.className} group-hover:scale-110 transition-transform duration-300`,
                      })}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    {item.title}
                  </h3>
                  <p className={`text-xl font-bold ${item.color} group-hover:underline`}>
                    {item.subtitle}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <ul className="space-y-4">
              <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaBuilding className="text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Property Inspection Scheduled
                  </p>
                  <p className="text-sm text-gray-600">October 15, 2025</p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaRupeeSign className="text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Rent Payment Confirmed
                  </p>
                  <p className="text-sm text-gray-600">October 1, 2025</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TenantDashboard;
