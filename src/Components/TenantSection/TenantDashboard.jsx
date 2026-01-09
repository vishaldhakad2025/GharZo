// import React, { useEffect, useState, useMemo } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import {
//   FaBuilding,
//   FaRupeeSign,
//   FaExclamationTriangle,
//   FaBullhorn,
//   FaHandHoldingUsd,
//   FaFileAlt,
//   FaCouch,
//   FaExchangeAlt,
//   FaUserCircle,
//   FaChartLine,
//   FaBell,
//   FaSearch,
//   FaPagelines,
//   FaPager,
// } from "react-icons/fa";

// const TenantDashboard = () => {
//   const [tenantInfo, setTenantInfo] = useState({ name: "", property: "" });
//   const [totalDue, setTotalDue] = useState(0);
//   const [openComplaints, setOpenComplaints] = useState(0);
//   const [announcementsCount, setAnnouncementsCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [tenantId, setTenantId] = useState(
//     localStorage.getItem("tenantId") ||
//       JSON.parse(localStorage.getItem("tenant"))?.tenantId ||
//       ""
//   );

//   // Fetch tenant profile and accommodations
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("tenanttoken");
//         if (!token) {
//           setError("No authentication token found. Please log in.");
//           return;
//         }

//         // Fetch profile for name
//         const profileRes = await axios.get(
//           "https://api.gharzoreality.com/api/tenant/profile",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         // Fetch accommodations for property
//         const accRes = await axios.get(
//           "https://api.gharzoreality.com/api/tenant/accommodations",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (profileRes.data.success && accRes.data.success) {
//           setTenantInfo({
//             name: profileRes.data.tenant.name || "",
//             property:
//               accRes.data.accommodations?.[0]?.propertyName || "Not Provided",
//           });

//           const fetchedTenantId = accRes.data.accommodations?.[0]?.tenantId;
//           if (fetchedTenantId && fetchedTenantId !== tenantId) {
//             localStorage.setItem("tenantId", fetchedTenantId);
//             setTenantId(fetchedTenantId);
//             return; // Exit early to refetch with updated tenantId
//           }

//           // Fetch dues
//           const accommodation = accRes.data.accommodations?.[0];
//           if (accommodation) {
//             const lId = accommodation.landlordId;
//             const duesRes = await axios.get(
//               `https://api.gharzoreality.com/api/dues/tenant/${tenantId}/${lId}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );
//             const allBills = duesRes.data || [];
//             const pendingBills = allBills.filter(
//               (bill) => bill.status === "Unpaid"
//             );
//             const totalDuesAmount = pendingBills.reduce(
//               (sum, bill) => sum + bill.amount,
//               0
//             );
//             setTotalDue(totalDuesAmount);
//           }

//           // Fetch complaints
//           const complaintsRes = await axios.get(
//             `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           const complaints = complaintsRes.data || [];
//           console.log("complaints", complaints.complaints);
//           const activeComplaints = complaints.complaints.filter(
//             (c) => c.status !== "Resolved" && c.status !== "Rejected"
//           ).length;
//           setOpenComplaints(activeComplaints);

//           // Fetch announcements
//           let landlordAnns = [];
//           try {
//             const landlordAnnRes = await axios.get(
//               `https://api.gharzoreality.com/api/announcement/tenant/${tenantId}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );
//             landlordAnns = landlordAnnRes.data.announcements || [];
//           } catch (err) {
//             console.error("Failed to fetch landlord announcements:", err);
//           }
//           const totalAnns = landlordAnns.length;
//           setAnnouncementsCount(totalAnns);
//         } else {
//           setError(
//             profileRes.data.message ||
//               accRes.data.message ||
//               "Failed to fetch data."
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError(
//           error.response?.data?.message ||
//             "An error occurred while fetching data."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (tenantId) {
//       fetchData();
//     }
//   }, [tenantId]);

//   // Dynamic dashboard metrics
//   const dashboardMetrics = useMemo(
//     () => ({
//       totalDue: `₹${totalDue.toLocaleString()}`,
//       totalComplaints: openComplaints,
//       totalAnnouncements: announcementsCount,
//       upcomingRent: "Due on 20th Oct",
//     }),
//     [totalDue, openComplaints, announcementsCount]
//   );

//   const dashboardData = [
//     {
//       icon: <FaBuilding className="text-blue-500 text-3xl" />,
//       title: "My Property",
//       subtitle: tenantInfo.property,
//       link: "/tenant/property",
//       bg: "bg-gradient-to-br from-blue-50 to-blue-100",
//       border: "border-blue-200",
//       color: "text-blue-700",
//     },
//     {
//       icon: <FaExclamationTriangle className="text-orange-500 text-3xl" />,
//       title: "Open Complaints",
//       //subtitle: `${dashboardMetrics.totalComplaints} Active`,
//       link: `/tenant/complaints/${tenantId}`,
//       bg: "bg-gradient-to-br from-orange-50 to-orange-100",
//       border: "border-orange-200",
//       color: "text-orange-700",
//     },
//     {
//       icon: <FaBullhorn className="text-purple-500 text-3xl" />,
//       title: "Announcements",
//       // subtitle: `${dashboardMetrics.totalAnnouncements} New`,
//       link: `/tenant/announcements/${tenantId}`,
//       bg: "bg-gradient-to-br from-purple-50 to-purple-100",
//       border: "border-purple-200",
//       color: "text-purple-700",
//     },
//     {
//       icon: <FaHandHoldingUsd className="text-green-500 text-3xl" />,
//       title: "Pay Rent",
//       //subtitle: dashboardMetrics.upcomingRent,
//       link: `/tenant/rent-payments/${tenantId}`,
//       bg: "bg-gradient-to-br from-green-50 to-green-100",
//       border: "border-green-200",
//       color: "text-green-700",
//     },
//     {
//       icon: <FaFileAlt className="text-indigo-500 text-3xl" />,
//       title: "Documents",
//       subtitle: "Lease & Bills",
//       link: "/tenant/documents",
//       bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
//       border: "border-indigo-200",
//       color: "text-indigo-700",
//     },
//     {
//       icon: <FaCouch className="text-teal-500 text-3xl" />,
//       title: "Facilities",
//       subtitle: "Book Amenities",
//       link: "/tenant/facilities",
//       bg: "bg-gradient-to-br from-teal-50 to-teal-100",
//       border: "border-teal-200",
//       color: "text-teal-700",
//     },
//     {
//       icon: <FaExchangeAlt className="text-pink-500 text-3xl" />,
//       title: "Room Switch",
//       subtitle: "Request Change",
//       link: "/tenant/room-switch",
//       bg: "bg-gradient-to-br from-pink-50 to-pink-100",
//       border: "border-pink-200",
//       color: "text-pink-700",
//     },
//     {
//       icon: <FaPager className="text-pink-500 text-3xl" />,
//       title: "AGREEMENT",
//       subtitle: "My RENT AGREEMENT",
//       link: "/tenant/rent-agreement",
//       bg: "bg-gradient-to-br from-pink-70 to-pink-100",
//       border: "border-pink-200",
//       color: "text-pink-700",
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//         <p className="text-lg text-gray-600">Loading...</p>
//       </div>
//     );
//   }

//   // if (error) {
//   //   return (
//   //     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//   //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//   //         <p>{error}</p>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//       {/* Header Section */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <FaUserCircle className="text-3xl text-gray-600" />
//               <div>
//                 <h1 className="text-xl font-semibold text-gray-900">
//                   Welcome back, {tenantInfo.name || "Tenant"}!
//                 </h1>
//                 <p className="text-sm text-gray-600">
//                   Manage your tenancy with ease
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <FaBell className="text-xl text-gray-600 cursor-pointer hover:text-blue-500" />
//               <FaChartLine className="text-xl text-gray-600 cursor-pointer hover:text-blue-500" />
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Quick Actions Grid */}
//         <section className="mb-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">
//             Quick Actions
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {dashboardData.map((item, index) => (
//               <Link
//                 key={index}
//                 to={item.link}
//                 className={`group bg-white rounded-2xl shadow-lg overflow-hidden border ${item.border} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${item.bg}`}
//               >
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div
//                       className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300`}
//                     >
//                       {React.cloneElement(item.icon, {
//                         className: `${item.icon.props.className} group-hover:scale-110 transition-transform duration-300`,
//                       })}
//                     </div>
//                   </div>
//                   <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
//                     {item.title}
//                   </h3>
//                   <p
//                     className={`text-xl font-bold ${item.color} group-hover:underline`}
//                   >
//                     {item.subtitle}
//                   </p>
//                 </div>
//                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
//               </Link>
//             ))}
//           </div>
//         </section>

//         {/* Recent Activity - Placeholder for Enhancement */}
//         <section>
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">
//             Recent Activity
//           </h2>
//           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//             <ul className="space-y-4">
//               <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <FaBuilding className="text-blue-500" />
//                 <div>
//                   <p className="font-medium text-gray-900">
//                     Property Inspection Scheduled
//                   </p>
//                   <p className="text-sm text-gray-600">October 15, 2025</p>
//                 </div>
//               </li>
//               <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <FaRupeeSign className="text-green-500" />
//                 <div>
//                   <p className="font-medium text-gray-900">
//                     Rent Payment Confirmed
//                   </p>
//                   <p className="text-sm text-gray-600">October 1, 2025</p>
//                 </div>
//               </li>
//             </ul>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default TenantDashboard;

import React, { useEffect, useState } from "react";
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
  FaBell,
  FaSearch,
  FaFileContract,
  FaShieldAlt,
  FaHome,
  FaCalendarAlt,
  FaReceipt,FaArrowRight ,FaTools , FaClock ,FaChevronRight ,
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

  // === API Fetching (FIXED URL SPACING) ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const profileRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/profile", // ✅ Fixed
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const accRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations", // ✅ Fixed
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (profileRes.data.success && accRes.data.success) {
          setTenantInfo({
            name: profileRes.data.tenant.name || "",
            property:
              accRes.data.accommodations?.[0]?.propertyName || "Not Assigned",
          });

          const fetchedTenantId = accRes.data.accommodations?.[0]?.tenantId;
          if (fetchedTenantId && fetchedTenantId !== tenantId) {
            localStorage.setItem("tenantId", fetchedTenantId);
            setTenantId(fetchedTenantId);
            return;
          }

          // Fetch dues
          const accommodation = accRes.data.accommodations?.[0];
          if (accommodation) {
            const lId = accommodation.landlordId;
            const duesRes = await axios.get(
              `https://api.gharzoreality.com/api/dues/tenant/${tenantId}/${lId}`, // ✅ Fixed
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const pendingBills = (duesRes.data || []).filter(
              (bill) => bill.status === "Unpaid"
            );
            setTotalDue(
              pendingBills.reduce((sum, bill) => sum + bill.amount, 0)
            );
          }

          // Fetch complaints
          const complaintsRes = await axios.get(
            `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`, // ✅ Fixed
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const activeComplaints = (
            complaintsRes.data?.complaints || []
          ).filter(
            (c) => c.status !== "Resolved" && c.status !== "Rejected"
          ).length;
          setOpenComplaints(activeComplaints);

          // Fetch announcements
          const annRes = await axios.get(
            `https://api.gharzoreality.com/api/announcement/tenant/${tenantId}`, // ✅ Fixed
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAnnouncementsCount(annRes.data?.announcements?.length || 0);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchData();
  }, [tenantId]);

  // === Card Data with Brand Colors ===
  const dashboardData = [
    {
      icon: <FaBuilding className="text-white text-2xl" />,
      title: "My Property",
      subtitle: tenantInfo.property,
      link: "/tenant/property",
      bg: "bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF]",
    },
    {
      icon: <FaHandHoldingUsd className="text-white text-2xl" />,
      title: "Pay Rent",
      subtitle: `₹${totalDue.toLocaleString()} Due`,
      link: `/tenant/rent-payments/${tenantId}`,
      bg: "bg-gradient-to-br from-[#FF6B00] to-[#FF8C00]",
    },
    {
      icon: <FaExclamationTriangle className="text-white text-2xl" />,
      title: "Complaints",
      subtitle: `${openComplaints} Active`,
      link: `/tenant/complaints/${tenantId}`,
      bg: "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
    },
    {
      icon: <FaBullhorn className="text-white text-2xl" />,
      title: "Announcements",
      subtitle: `${announcementsCount} New`,
      link: `/tenant/announcements/${tenantId}`,
      bg: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]",
    },
    {
      icon: <FaFileAlt className="text-white text-2xl" />,
      title: "Documents",
      subtitle: "Lease & Bills",
      link: "/tenant/documents",
      bg: "bg-gradient-to-br from-[#0D9488] to-[#0F766E]",
    },
    {
      icon: <FaCouch className="text-white text-2xl" />,
      title: "Facilities",
      subtitle: "Book Amenities",
      link: "/tenant/facilities",
      bg: "bg-gradient-to-br from-[#EC4899] to-[#DB2777]",
    },
    {
      icon: <FaExchangeAlt className="text-white text-2xl" />,
      title: "Room Switch",
      subtitle: "Request Change",
      link: "/tenant/room-switch",
      bg: "bg-gradient-to-br from-[#7C2D12] to-[#9A3412]",
    },
    {
      icon: <FaFileContract className="text-white text-2xl" />,
      title: "Rent Agreement",
      subtitle: "View & Download",
      link: "/tenant/rent-agreement",
      bg: "bg-gradient-to-br from-[#1E40AF] to-[#1D4ED8]",
    },
  ];

  // === Loading State ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // === Main UI ===
 // === Main UI ===
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
    {/* Enhanced Header */}
    <header className="bg-white border-b border-gray-100 shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaUserCircle className="text-2xl text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-[3px] border-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 bg-clip-text text-transparent">
                Welcome back,{" "}
                <span className="text-gray-900">
                  {tenantInfo.name || "Tenant"}! 👋
                </span>
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <FaHome className="text-blue-500" />
                  <span>{tenantInfo.property || "No property assigned"}</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaCalendarAlt className="text-blue-400" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

       
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            title: "Total Due Amount",
            value: `₹${totalDue.toLocaleString()}`,
            icon: <FaRupeeSign />,
            change: "+₹2,500",
            trend: "up",
            color: "from-orange-500 to-amber-500",
            bg: "bg-gradient-to-br from-orange-50 to-amber-50",
            border: "border-orange-200"
          },
          {
            title: "Open Complaints",
            value: openComplaints,
            icon: <FaExclamationTriangle />,
            change: "-2 this week",
            trend: "down",
            color: "from-red-500 to-rose-500",
            bg: "bg-gradient-to-br from-red-50 to-rose-50",
            border: "border-red-200"
          },
          {
            title: "Active Announcements",
            value: announcementsCount,
            icon: <FaBullhorn />,
            change: "3 new today",
            trend: "up",
            color: "from-blue-600 to-indigo-600",
            bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
            border: "border-blue-200"
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative group overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="relative flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/10`}>
                <span className="text-2xl text-white">{stat.icon}</span>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="relative mt-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions Section with Clean White Design */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg">
          
          {/* Section Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  Quick Actions
                </h2>
                <p className="text-gray-600">Everything you need, just a click away</p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardData.map((item, index) => {
              // Define color themes for each card
              const colorThemes = [
                { from: "#3b82f6", to: "#1d4ed8", text: "#2563eb", bg: "#eff6ff", border: "#dbeafe" }, // Blue
                { from: "#10b981", to: "#059669", text: "#059669", bg: "#f0fdf4", border: "#dcfce7" }, // Green
                { from: "#8b5cf6", to: "#7c3aed", text: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" }, // Purple
                { from: "#f59e0b", to: "#d97706", text: "#d97706", bg: "#fffbeb", border: "#fef3c7" }  // Amber
              ];

              const theme = colorThemes[index % colorThemes.length];

              return (
                <Link
                  key={index}
                  to={item.link}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.bg} 0%, white 100%)`,
                    border: `2px solid ${theme.border}`,
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {/* Hover gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`
                    }}
                  ></div>

                  {/* Card content */}
                  <div className="relative p-6">
                    {/* Icon section */}
                    <div className="flex items-start justify-between mb-6">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
                        }}
                      >
                        <div className="text-white text-2xl">{item.icon}</div>
                      </div>

                      {/* Animated arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-6 h-6" style={{ color: theme.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="space-y-2">
                      <h3 
                        className="text-xl font-bold transition-colors duration-300 group-hover:text-gray-900"
                        style={{ color: theme.text }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Progress indicator on hover */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${theme.from} 0%, ${theme.to} 100%)`,
                      }}
                    ></div>
                  </div>

                  {/* Floating particles */}
                  <div 
                    className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 animate-ping"
                    style={{
                      backgroundColor: theme.from,
                      animationDelay: '200ms'
                    }}
                  ></div>

                  {/* Corner accent */}
                  <div 
                    className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
                      clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                    }}
                  ></div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>All services active</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="text-sm text-gray-500">
                  Last updated: Just now
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Click any card to get started
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Recent Activity Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 bg-clip-text text-transparent">
              Recent Activity
            </h2>
            <p className="text-gray-600">Your latest updates and notifications</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 border border-gray-200 transition-all hover:shadow-md">
            View All
            <FaArrowRight className="text-xs" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  icon: <FaCalendarAlt className="text-blue-500" />,
                  title: "Property Inspection Scheduled",
                  desc: "Annual inspection scheduled for October 15th at 2:00 PM",
                  time: "2 hours ago",
                  status: "upcoming",
                  color: "bg-blue-100 border-blue-200"
                },
                {
                  icon: <FaReceipt className="text-green-500" />,
                  title: "Rent Payment Confirmed",
                  desc: "October rent payment of ₹15,000 successfully processed",
                  time: "1 day ago",
                  status: "completed",
                  color: "bg-green-100 border-green-200"
                },
                {
                  icon: <FaShieldAlt className="text-purple-500" />,
                  title: "Police Verification Updated",
                  desc: "Documents have been verified and updated in the system",
                  time: "3 days ago",
                  status: "verified",
                  color: "bg-purple-100 border-purple-200"
                },
                {
                  icon: <FaTools className="text-amber-500" />,
                  title: "Maintenance Request",
                  desc: "Plumbing issue reported - Technician assigned",
                  time: "5 days ago",
                  status: "in-progress",
                  color: "bg-amber-100 border-amber-200"
                }
              ].map((act, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-5 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <div className="relative">
                    <div className={`p-3 rounded-xl ${act.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {act.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {act.title}
                        </h4>
                        <p className="text-sm text-gray-600">{act.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {act.status}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {act.time}
                        </span>
                      </div>
                    </div>
                    
                    {act.status === "in-progress" && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">75% complete</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>In Progress</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>Showing 4 of 12 activities</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
);
};

export default TenantDashboard;
