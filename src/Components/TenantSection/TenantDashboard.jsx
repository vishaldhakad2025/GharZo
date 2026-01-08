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
  FaReceipt,
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
            property: accRes.data.accommodations?.[0]?.propertyName || "Not Assigned",
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
            const pendingBills = (duesRes.data || []).filter(bill => bill.status === "Unpaid");
            setTotalDue(pendingBills.reduce((sum, bill) => sum + bill.amount, 0));
          }

          // Fetch complaints
          const complaintsRes = await axios.get(
            `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`, // ✅ Fixed
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const activeComplaints = (complaintsRes.data?.complaints || [])
            .filter(c => c.status !== "Resolved" && c.status !== "Rejected").length;
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
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // === Main UI ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm  z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#FF6B00] rounded-xl flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, <span className="text-[#1E3A8A]">{tenantInfo.name || "Tenant"}!</span>
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FaHome className="text-gray-500" /> {tenantInfo.property || "No property assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#FF6B00] rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white rounded-xl border border-gray-200">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-12 pr-4 py-2.5 w-64 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>
              <button className="relative p-2.5 bg-white rounded-xl border border-gray-200 hover:shadow-md">
                <FaBell className="text-xl text-gray-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B00] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto  py-5"> 
        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {[
    {
      title: "Total Due",
      value: `₹${totalDue.toLocaleString()}`,
      icon: <FaRupeeSign />,
      accent: "#f57c00",
      bg: "#fff7ed",
    },
    {
      title: "Open Complaints",
      value: openComplaints,
      icon: <FaExclamationTriangle />,
      accent: "#d97706",
      bg: "#fffbeb",
    },
    {
      title: "Announcements",
      value: announcementsCount,
      icon: <FaBullhorn />,
      accent: "#0b2a4a",
      bg: "#f1f5f9",
    },
  ].map((stat, i) => (
    <div
      key={i}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
    >
      {/* Accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: stat.accent }}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-md  font-medium text-gray-500">
            {stat.title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {stat.value}
          </p>
        </div>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: stat.bg, color: stat.accent }}
        >
          <span className="text-xl">{stat.icon}</span>
        </div>
      </div>
    </div>
  ))}
</div>


        {/* Quick Actions */}
           <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#FF6B00] text-transparent bg-clip-text  mb-2 px-5">Quick Action</h2>
          <section className="mb-5 pb-3  shadow bg-white px-5 py-2 rounded ">
        
           
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className={`group relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${item.bg}`}
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.subtitle}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
              ))}
            </div>
          </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#FF6B00] text-transparent bg-clip-text  mb-2 px-5">Recent Activity</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="space-y-4">
              {[
                { icon: <FaCalendarAlt className="text-blue-500" />, title: "Property Inspection", desc: "Scheduled for Oct 15", time: "2 hours ago" },
                { icon: <FaReceipt className="text-green-500" />, title: "Rent Payment", desc: "October payment confirmed", time: "1 day ago" },
                { icon: <FaShieldAlt className="text-purple-500" />, title: "Police Verification", desc: "Documents updated", time: "3 days ago" },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-white rounded-lg shadow-sm">{act.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{act.title}</p>
                    <p className="text-sm text-gray-600">{act.desc}</p>
                  </div>
                  <span className="text-xs text-gray-500">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TenantDashboard;