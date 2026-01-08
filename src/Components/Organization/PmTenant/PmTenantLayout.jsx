import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, Bell, X } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  User,
  Home,
  CreditCard,
  FileText,
  Receipt,
  Megaphone,
  Move,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import PmTenantSidebar from "./PmTenantSidebar";// Adjust path as needed

const TenantLayout = () => {
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState(null);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(80); // Desktop default collapsed

  // Assume tenantId is stored in localStorage or fetched from an API
  // Fallback for demo
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login", { replace: true });
          return;
        }

        const res = await axios.get("https://api.gharzoreality.com/api/tenant/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          console.log("Profile data:", res.data);
          setTenantId(res.data.tenant.tenantId);
          localStorage.setItem("tenantId", res.data.tenant.tenantId);

          // Fetch notifications after profile
          fetchNotifications();
        } else {
          setError(res.data.message || "Failed to fetch profile.");
          if (res.data.error === "User is not a registered tenant") {
            navigate("/login", { replace: true }); // Redirect to login
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.response?.data?.message || "An error occurred while fetching profile.");
        if (error.response?.data?.error === "User is not a registered tenant") {
          navigate("/login", { replace: true }); // Redirect to login
        }
      } finally {
       
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) return;

        const res = await axios.get("https://api.gharzoreality.com/api/tenant/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setNotifications(res.data.notifications || []);
          setNotificationCount(res.data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PmTenantSidebar setSidebarWidth={setSidebarWidth} tenantId={tenantId} />

      {/* Main Content with Header */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header */}
        <header className="bg-white shadow p-4 flex items-center justify-between sticky top-0 z-10">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/pm_tenant")}
            className="text-2xl font-bold text-gray-800 cursor-pointer"
          >
            Tenant Dashboard
          </motion.h1>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="p-2 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg"
            >
              <Home className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white shadow-lg"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/pm_tenant/profile")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-3 py-2 rounded-xl shadow-lg text-sm font-medium"
            >
              <User className="w-5 h-5 drop-shadow-md" />
              <span className="hidden sm:inline">Profile</span>
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Notifications Modal */}
      {isNotificationModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsNotificationModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 sm:right-8 z-50 max-w-sm w-full max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200"
          >
            <div className="p-4 sm:p-6 sticky top-0 bg-white border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Notifications</h2>
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No any notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm text-gray-800 break-words">
                        {notif.message || notif.title || notif.content || "New notification"}
                      </p>
                      {notif.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default TenantLayout;