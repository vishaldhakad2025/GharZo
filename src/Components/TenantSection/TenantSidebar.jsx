// TenantSidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Building2,
  LogOut,
  Home,
  CreditCard,
  FileText,
  Megaphone,
  Receipt,
  Move,
  Menu,
  X,
} from "lucide-react";

import logo from "../../assets/logo/logo.png";
import dd from "../../assets/logo/icon.png";

const TenantSidebar = ({ setSidebarWidth, tenantId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass =
    "flex items-center gap-3 py-2 px-3 rounded-md hover:bg-indigo-600 hover:text-white transition-all duration-300";
  const activeClass = "bg-indigo-700 text-white shadow-lg";

  const Colorful3DIcon = ({ icon: Icon, gradient, size = 20 }) => (
    <motion.div
      className={`relative p-2 rounded-full shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 perspective-1000`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ y: -2 }}
    >
      <div
        className={`bg-gradient-to-br ${gradient} rounded-full p-1 shadow-md`}
      >
        <Icon size={size} className="text-white drop-shadow-lg" />
      </div>
      <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0);
    } else {
      setSidebarWidth(isHovered ? 224 : 80);
    }
  }, [isHovered, setSidebarWidth]);

  // Helper function: सभी relevant localStorage items को clear करो (सही keys के साथ)
  const clearLocalStorage = () => {
    localStorage.removeItem("tenantId");
    localStorage.removeItem("tenanttoken");
    localStorage.removeItem("tenant");

    // Razorpay specific keys (सही names - underscore और rzp_ prefix के साथ)
    localStorage.removeItem("rzp_checkout_anon_id");
    localStorage.removeItem("rzp_device_id");
    localStorage.removeItem("rzp_stored_checkout_id");

    console.log("LocalStorage cleared: All tenant & Razorpay items removed."); // Debug log - production में हटा सकते हो
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        clearLocalStorage();
        navigate("/");
        setIsMobileOpen(false);
        return;
      }

      const response = await fetch(
        "https://api.gharzoreality.com/api/tenant/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // हमेशा clear करो, API success/fail पर depend न करो
      clearLocalStorage();

      if (response.ok) {
        const result = await response.json();
        if (!result.success) {
          console.warn(
            "Logout API returned non-success, but storage cleared anyway."
          );
        }
      } else {
        console.warn(
          "Logout API failed (not ok response), but storage cleared anyway."
        );
      }

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Catch में भी clear (अगर try block fail हो जाए)
      clearLocalStorage();
      navigate("/");
    }
    setIsMobileOpen(false);
  };

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/tenant",
      icon: Home,
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      name: "Properties",
      path: "/tenant/property",
      icon: Building2,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      name: "Rent Payments",
      path: tenantId
        ? `/tenant/rent-payments/${tenantId}`
        : "/tenant/rent-payments",
      icon: CreditCard,
      gradient: "from-green-400 to-teal-500",
    },
    {
      name: "Complaints",
      path: tenantId ? `/tenant/complaints/${tenantId}` : "/tenant/complaints",
      icon: FileText,
      gradient: "from-yellow-400 to-amber-500",
    },
    {
      name: "Announcements",
      path: tenantId
        ? `/tenant/announcements/${tenantId}`
        : "/tenant/announcements",
      icon: Megaphone,
      gradient: "from-emerald-400 to-green-500",
    },
    {
      name: "Documents",
      path: "/tenant/documents",
      icon: Receipt,
      gradient: "from-indigo-400 to-purple-500",
    },
    {
      name: "Roomswitch",
      path: "/tenant/room-switch",
      icon: Move,
      gradient: "from-pink-400 to-rose-500",
    },
    {
      name: "Profile",
      path: "/tenant/profile",
      icon: User,
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      name: "Police Verification ",
      path: "/tenant/police-verification",
      icon: User,
      gradient: "from-cyan-400 to-blue-500",
    },
  ];

  const renderSidebarContent = () => (
    <>
      {isMobileOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute right-4 top-4 text-white"
        >
          <X size={24} />
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-2 p-4"
      >
        <img
          src={dd}
          alt="Logo"
          className="w-20 shadow-2xl h-15 object-contain rounded-md shadow-lg hover:scale-110 transition-transform duration-300"
        />
        {(isHovered || isMobileOpen) && (
          <motion.h2
            className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          ></motion.h2>
        )}
      </motion.div>

      <ul className="space-y-2 mt-6 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? `${linkClass} ${activeClass}` : linkClass
                }
                onClick={handleNavLinkClick}
              >
                <Colorful3DIcon icon={Icon} gradient={item.gradient} />
                {(isHovered || isMobileOpen) && <span>{item.name}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="p-4 mt-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full py-3 px-3 rounded-md shadow-xl    hover:from-red-700 hover:to-rose-700 text-white transition-all shadow-lg"
        >
          <Colorful3DIcon icon={LogOut} gradient="from-red-400 to-rose-500" />
          {(isHovered || isMobileOpen) && <span>Logout</span>}
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[10000]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow-lg"
          >
            <Menu size={22} />
          </motion.button>
        </div>
      )}

      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setIsMobileOpen(false)}
        ></motion.div>
      )}

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        style={{
          background: `
    radial-gradient(circle at bottom, rgba(245,124,0,0.35), transparent 60%),
    linear-gradient(180deg, #071a2f 0%, #0d2f52 45%, #123e6b 75%, #0b2a4a 100%)
  `,
        }}
        className={`
          fixed top-0 left-0 h-screen text-white shadow-2xl transition-all duration-500 ease-in-out z-[9999]
          ${
            isMobileOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0"
          }
          ${isHovered ? "md:w-56" : "md:w-20"}
          flex flex-col overflow-y-auto scrollbar-hide
        `}
      >
        {(isMobileOpen || window.innerWidth >= 768) && renderSidebarContent()}
      </motion.div>
    </>
  );
};

export default TenantSidebar;
