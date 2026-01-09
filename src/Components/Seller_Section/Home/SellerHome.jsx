import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaHome,
  FaList,
  FaUserTie,
  FaLightbulb,
  FaPlayCircle,
  FaBuilding,
  FaUsers,
  FaCalendarCheck,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaEdit,
  FaEye,FaArrowRight ,FaHistory,FaClock,FaUser,FaCalendar ,FaCamera ,FaSyncAlt ,
  FaChartLine,
  FaBolt,
  FaChartBar,
  FaComments,
  FaFileAlt,
  FaHeadset,
  FaExclamationTriangle,
  FaCreditCard,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const SellerHome = () => {
  const navigate = useNavigate();
  const [seller, setSeller] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalEnquiries: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        toast.error("Please log in to view dashboard.");
        navigate("/seller_login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch profile
        const profileRes = await axios.get(`${baseurl}api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.data.success) {
          const { seller: profile } = profileRes.data;
          setSeller({
            name: profile.name || "N/A",
            email: profile.email || "N/A",
            phone: profile.mobile || "N/A",
          });
        }

        // Fetch properties using the same API as SellerProperty
        const propertiesRes = await axios.get(
          `${baseurl}api/seller/getproperties`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const totalProperties = propertiesRes.data?.properties?.length || 0;

        // Fetch enquiries (visits)
        const enquiriesRes = await axios.get(
          `${baseurl}api/seller/getallvisits`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const totalEnquiries = enquiriesRes.data?.visits?.length || 0;

        setStats({
          totalProperties,
          totalEnquiries,
        });

        // Generate recent activities based on fetched data
        setRecentActivities([
          {
            id: 1,
            text: `Listed ${
              totalProperties > 0
                ? `${totalProperties} property${
                    totalProperties !== 1 ? "ies" : ""
                  }`
                : "no properties"
            }`,
            date: new Date().toLocaleDateString(),
          },
          {
            id: 2,
            text: `Received ${totalEnquiries} enquiry${
              totalEnquiries !== 1 ? "s" : ""
            }`,
            date: new Date().toLocaleDateString(),
          },
        ]);
      } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("sellertoken");
          localStorage.removeItem("role");
          navigate("/seller_login");
        } else {
          setError(
            error.response?.data?.message || "Error loading dashboard data."
          );
          toast.error("Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2FF] mb-4"></div>
          <p className="text-[#00C2FF] text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white px-8 py-3 rounded-lg hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  //   return (
  //     <div className="min-h-screen px-4 py-8 md:px-10 lg:px-16 bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
  //       {/* Header */}
  //       <header className="flex flex-col items-center justify-center mb-8 gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
  //         <div className="flex items-center gap-4">
  //           <div className="p-2 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] rounded-xl">
  //             <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
  //               <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  //             </svg>
  //           </div>
  //           <div className="text-center">
  //   <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#00FFAA] to-[#00E099] bg-clip-text text-transparent">
  //     Seller Dashboard
  //   </h1>
  //   <p className="text-sm font-bold text-[#00C2FF]">Welcome back, {seller.name.split(' ')[0]}!</p>
  // </div>
  //         </div>
  //       </header>

  //       {/* Quick Actions */}
  //       <section className="mb-8">
  //         <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
  //           <FaList className="text-[#00C2FF]" />
  //           Quick Actions
  //         </h3>
  //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  //           {[

  //             {
  //               title: "Reels",
  //               desc: "Create short videos",
  //               icon: FaPlayCircle,
  //               color: "from-[#00FFAA] to-[#00E099]",
  //               link: "/seller/reels",
  //             },
  //             {
  //               title: "Manage Enquiries",
  //               desc: "View and respond to visits",
  //               icon: FaCalendarCheck,
  //               color: "from-[#00E099] to-[#00C2FF]",
  //               link: "/seller/enquiries",
  //             },
  //             {
  //               title: "All Properties",
  //               desc: "View your listings",
  //               icon: FaHome,
  //                 color: "from-[#00E099] to-[#00C2FF]",
  //               link: "/seller/property",
  //             },
  //             {
  //               title: "Subscription Plans",
  //               desc: "View and manage your plans",
  //               icon: FaCreditCard,
  //               color: "from-[#00E099] to-[#00FFAA]",
  //               link: "/seller/subscription",
  //             },
  //           ].map((action, index) => {
  //             const Icon = action.icon;
  //             return (
  //               <Link
  //                 key={index}
  //                 to={action.link}
  //                 className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#00C2FF] text-center hover:bg-gradient-to-br hover:from-gray-50"
  //               >
  //                 <div className={`p-4 rounded-lg bg-gradient-to-r ${action.color} mx-auto mb-4 w-fit group-hover:scale-110 transition-all duration-300`}>
  //                   <Icon className="text-2xl text-white" />
  //                 </div>
  //                 <h4 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-[#00C2FF] transition-colors">{action.title}</h4>
  //                 <p className="text-sm text-gray-500">{action.desc}</p>
  //               </Link>
  //             );
  //           })}
  //         </div>
  //       </section>

  //       {/* Recent Activity & Profile Summary */}
  //       <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  //         {/* Recent Activity */}
  //         <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
  //           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //             <FaUsers className="text-[#00C2FF]" />
  //             Recent Status
  //           </h3>
  //           <div className="space-y-4">
  //             {recentActivities.length > 0 ? (
  //               recentActivities.map((activity) => (
  //                 <div key={activity.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl border-l-4 border-[#00C2FF]">
  //                   <div className="p-2 bg-[#00C2FF] rounded-full">
  //                     <FaCheckCircle className="text-white" />
  //                   </div>
  //                   <div className="flex-1">
  //                     <p className="text-sm text-gray-700 font-medium">{activity.text}</p>
  //                     <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
  //                   </div>
  //                 </div>
  //               ))
  //             ) : (
  //               <div className="text-center py-12">
  //                 <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
  //                 <p className="text-gray-500">No recent activity to show.</p>
  //               </div>
  //             )}
  //           </div>
  //         </div>

  //         {/* Profile Summary */}
  //         <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
  //           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //             <FaUserTie className="text-[#00FFAA]" />
  //             Profile Summary
  //           </h3>
  //           <div className="space-y-4">
  //             <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-xl border border-[#00C2FF]">
  //               <div className="flex items-center gap-3">
  //                 <span className="w-3 h-3 bg-[#00C2FF] rounded-full"></span>
  //                 <strong className="text-gray-700">Name</strong>
  //               </div>
  //               <span className="text-gray-600 font-medium">{seller.name}</span>
  //             </div>
  //             <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#00C2FF]50 to-[#00FFAA]50 rounded-xl border border-[#00C2FF]">
  //               <div className="flex items-center gap-3">
  //                 <FaEnvelope className="text-[#00C2FF]" />
  //                 <strong className="text-gray-700">Email</strong>
  //               </div>
  //               <span className="text-gray-600 font-medium">{seller.email}</span>
  //             </div>
  //             <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
  //               <div className="flex items-center gap-3">
  //                 <FaPhone className="text-[#00FFAA]" />
  //                 <strong className="text-gray-700">Phone</strong>
  //               </div>
  //               <span className="text-gray-600 font-medium">{seller.phone}</span>
  //             </div>
  //           </div>

  //         </div>
  //       </section>

  //       {/* Quick Tips */}
  //       <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
  //         <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
  //           <FaLightbulb className="text-[#00C2FF]" />
  //           Quick Tips for Better Listings
  //         </h3>
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //           <ul className="space-y-4">
  //             <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
  //               <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
  //               <div>
  //                 <p className="font-medium text-gray-700">Use High-Quality Images</p>
  //                 <p className="text-sm text-gray-600">Capture clear photos from multiple angles to attract more tenants.</p>
  //               </div>
  //             </li>
  //             <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#00C2FF]50 to-[#00FFAA]50 rounded-xl border border-[#00C2FF]">
  //               <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
  //               <div>
  //                 <p className="font-medium text-gray-700">Add Clear Rental Terms</p>
  //                 <p className="text-sm text-gray-600">Specify rent, deposit, and notice period to avoid confusion.</p>
  //               </div>
  //             </li>
  //           </ul>
  //           <ul className="space-y-4">
  //             <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
  //               <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
  //               <div>
  //                 <p className="font-medium text-gray-700">Highlight Unique Features</p>
  //                 <p className="text-sm text-gray-600">Mention nearby landmarks and special amenities.</p>
  //               </div>
  //             </li>
  //             <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#00FFAA]50 to-[#00E099]50 rounded-xl border border-[#00FFAA]">
  //               <FaCheckCircle className="text-[#00C2FF] mt-1 flex-shrink-0 text-xl" />
  //               <div>
  //                 <p className="font-medium text-gray-700">Update Details Regularly</p>
  //                 <p className="text-sm text-gray-600">Keep your listings fresh to stay competitive.</p>
  //               </div>
  //             </li>
  //           </ul>
  //         </div>
  //       </section>
  //     </div>
  //   );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 px-4 py-6 md:px-8 lg:px-12">
      {/* Header - Enhanced */}
      <header className="mb-10">
        <div className="bg-gradient-to-r from-white to-orange-50 rounded-3xl p-8 border border-orange-100 shadow-md relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full -translate-y-20 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100/20 to-orange-100/10 rounded-full translate-y-10 -translate-x-10"></div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h10a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Dashboard Overview
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-medium text-orange-600">
                    Welcome back,{" "}
                    <span className="font-bold">
                      {seller.name.split(" ")[0]}
                    </span>{" "}
                    👋
                  </p>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                    Verified Seller
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  Here's what's happening with your properties today
                </p>
              </div>
            </div>

            {/* Date Display */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards - New Section */}
      {/* <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Properties",
              value: "24",
              change: "+12%",
              icon: FaHome,
              color: "from-blue-500 to-indigo-500",
              bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
            },
            {
              title: "Active Enquiries",
              value: "18",
              change: "+5",
              icon: FaCalendarCheck,
              color: "from-green-500 to-emerald-500",
              bg: "bg-gradient-to-br from-green-50 to-emerald-50",
            },
            {
              title: "Monthly Views",
              value: "2.4K",
              change: "+24%",
              icon: FaEye,
              color: "from-orange-500 to-amber-500",
              bg: "bg-gradient-to-br from-orange-50 to-amber-50",
            },
            {
              title: "Response Rate",
              value: "92%",
              change: "+8%",
              icon: FaChartLine,
              color: "from-purple-500 to-violet-500",
              bg: "bg-gradient-to-br from-purple-50 to-violet-50",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bg} rounded-3xl p-6 border border-gray-100 shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="text-white text-lg" />
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-green-600 border border-green-200">
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </section> */}

      {/* Quick Actions - Enhanced */}
      <section className="mb-10">
        <div className="flex items-center bg-white border border-gray-100 shadow-sm rounded-3xl p-6 gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
            <FaBolt className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600">
              Frequently used features at your fingertips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Create Reels",
              desc: "Short video promotions",
              icon: FaPlayCircle,
              link: "/seller/reels",
              color: "from-purple-500 to-pink-500",
              badge: "New",
            },
            {
              title: "Enquiries",
              desc: "Manage all requests",
              icon: FaCalendarCheck,
              link: "/seller/enquiries",
              color: "from-green-500 to-emerald-500",
            },
            {
              title: "Properties",
              desc: "View all listings",
              icon: FaHome,
              link: "/seller/property",
              color: "from-blue-500 to-indigo-500",
              badge: "12 Active",
            },
            {
              title: "Subscription",
              desc: "Upgrade your plan",
              icon: FaCreditCard,
              link: "/seller/subscription",
              color: "from-orange-500 to-amber-500",
            },
           
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Hover effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    "--tw-gradient-from": action.color
                      .split(" ")[1]
                      .replace("from-", ""),
                    "--tw-gradient-to": action.color
                      .split(" ")[3],
                      // .replace("to-", ""),
                    opacity: "0.03",
                  }}
                ></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
                    >
                      <Icon className="text-white text-xl" />
                    </div>
                    {action.badge && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Quick Access</span>
                    <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity & Profile - Enhanced */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Recent Activity - Enhanced */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <FaHistory className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Activity
                </h3>
                <p className="text-gray-600">Latest updates and interactions</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200 transition-all duration-300">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-orange-50 hover:to-amber-50/50 border border-gray-100 hover:border-orange-200 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      {activity.date}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <FaHistory className="text-gray-400 text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No Recent Activity
                </h4>
                <p className="text-gray-600 mb-4">
                  Start by adding a property or creating your first reel!
                </p>
                <button className="px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg transition-all">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary - Enhanced */}
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl p-8 border border-gray-100 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
              <FaUserTie className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Profile Summary
              </h3>
              <p className="text-gray-600">Your account details</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {[
              { label: "Name", value: seller.name, icon: FaUser },
              { label: "Email", value: seller.email, icon: FaEnvelope },
              { label: "Phone", value: seller.phone, icon: FaPhone },
              { label: "Member Since", value: "Jan 2024", icon: FaCalendar },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <item.icon className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profile Completion */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-blue-900">Profile Strength</p>
                <p className="text-sm text-blue-600">
                  Complete your profile for better visibility
                </p>
              </div>
              <span className="text-lg font-bold text-blue-700">85%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-4/5"></div>
            </div>
            <button className="w-full mt-4 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all">
              Complete Profile
            </button>
          </div>
        </div>
      </section>

      {/* Quick Tips - Enhanced */}
      <section className="bg-gradient-to-r from-white to-orange-50 rounded-3xl p-8 border border-orange-100 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
            <FaLightbulb className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Pro Tips for Success
            </h3>
            <p className="text-gray-600">
              Boost your property visibility and engagement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "High-Quality Visuals",
              desc: "Upload clear, well-lit photos and create property reels",
              icon: FaCamera,
            },
            {
              title: "Detailed Descriptions",
              desc: "Highlight unique features and nearby amenities",
              icon: FaFileAlt,
            },
            {
              title: "Quick Responses",
              desc: "Respond to enquiries within 2 hours for better conversion",
              icon: FaClock,
            },
            {
              title: "Regular Updates",
              desc: "Keep pricing and availability current",
              icon: FaSyncAlt,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-all">
                <tip.icon className="text-orange-600 text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {tip.title}
                </h4>
                <p className="text-sm text-gray-600">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-600 mb-4">Need personalized guidance?</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <FaHeadset className="text-white" />
            Schedule a Consultation
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellerHome;
