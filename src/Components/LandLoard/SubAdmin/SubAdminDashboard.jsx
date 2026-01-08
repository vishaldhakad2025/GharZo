import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubAdminList from "./SubAdminList";
import AddSubAdmin from "./AddSubAdmin";

const SubAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Sidebar hover effect
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
        theme="dark"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Glassmorphic Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10">
          {/* Header with Gharzo Style */}
          <div className="text-center mb-10">
            <div className="inline-block mb-6">
              <div className="text-5xl sm:text-6xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-indigo-300 via-white to-gray-300 bg-clip-text text-transparent">
                  GHARZO
                </span>
              </div>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-orange-400 to-transparent rounded-full mt-2"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              Landlord Sub-Owner
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 inline-flex border border-white/20 shadow-lg">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-8 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  activeTab === "list"
                    ? "bg-indigo-600/80 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Sub-Owner List
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`px-8 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  activeTab === "add"
                    ? "bg-indigo-600/80 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Add Sub-Owner
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "list" ? <SubAdminList /> : <AddSubAdmin />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;