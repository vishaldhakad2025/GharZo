import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTachometerAlt,
  FaPlus,
  FaBuilding,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaVideo,
  FaUserCircle,
  FaExchangeAlt,
  FaUserPlus,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileInvoice,
  FaShoppingBasket,
  FaDiagnoses,
} from "react-icons/fa";
import { Home, BadgeCheck } from "lucide-react";
import { useAuth } from "../../User_Section/Context/AuthContext";
import logo from "../../../assets/logo/logo.png"; // Full GHARZO logo (expanded)
import dd from "../../../assets/logo/dd.png";     // Small "dd" icon (collapsed)

const Sidebar = ({ propertyId, setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { landlordlogout } = useAuth();
  const id = propertyId || useParams().id;

  const handleLogout = async () => {
    localStorage.removeItem("addedDues");
    localStorage.removeItem("id");
    localStorage.removeItem("landlord");
    localStorage.removeItem("userLocation");
    localStorage.removeItem("landlordId");
    localStorage.removeItem("linkedLandord");
    localStorage.removeItem("propertyId");

    try {
      await landlordlogout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("landlordId");
      console.log("Force cleared 'landlordId' in catch. Now:", localStorage.getItem("landlordId"));
      navigate("/");
    }
    setIsMobileOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarWidth(0);
      } else {
        setSidebarWidth(isHovered ? 260 : 80);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isHovered, setSidebarWidth]);

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  const linkClass =
    "flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm";
  const activeClass = "bg-white/25 text-white shadow-xl backdrop-blur-md border border-white/30";

  const Colorful3DIcon = ({ icon: Icon, gradient, size = 22 }) => (
    <motion.div
      className="relative p-2 rounded-full shadow-lg"
      whileHover={{ scale: 1.15, rotate: 8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`bg-gradient-to-br ${gradient} rounded-full p-2`}>
        <Icon size={size} className="text-white drop-shadow-md" />
      </div>
    </motion.div>
  );

  const links = [
    {
      to: "/",
      icon: Home,
      label: "Home",
      gradient: "from-blue-600 to-indigo-800",
    },
    {
      to: "/landlord",
      icon: FaTachometerAlt,
      label: "Dashboard",
      gradient: "from-indigo-600 to-blue-800",
    },
    {
      to: "police-verification",
      icon: BadgeCheck,
      label: "Police Verification",
      gradient: "from-blue-700 to-indigo-900",
    },
    {
      to: "/landlord/property",
      icon: FaBuilding,
      label: "Properties",
      gradient: "from-indigo-700 to-blue-900",
    },
    {
      to: "/landlord/add-property",
      icon: FaPlus,
      label: "Add Property",
      gradient: "from-blue-600 to-indigo-800",
    },
    {
      to: `/landlord/tenant-form`,
      icon: FaUserPlus,
      label: "Add Tenant",
      gradient: "from-indigo-600 to-blue-800",
    },
    {
      to: `/landlord/duespackages`,
      icon: FaBoxOpen,
      label: "Dues Packages",
      gradient: "from-blue-700 to-indigo-900",
    },
    {
      to: `/landlord/expenses`,
      icon: FaMoneyBillWave,
      label: "Expenses",
      gradient: "from-indigo-700 to-blue-900",
    },
    {
      to: `/landlord/dues`,
      icon: FaFileInvoice,
      label: "Dues",
      gradient: "from-blue-600 to-indigo-800",
    },
    {
      to: `/landlord/switch-requests`,
      icon: FaExchangeAlt,
      label: "Switch Requests",
      gradient: "from-indigo-600 to-blue-800",
    },
    {
      to: "/landlord/landlord-profile",
      icon: FaUser,
      label: "Profile",
      gradient: "from-blue-700 to-indigo-900",
    },
    {
      to: "/landlord/landlord_reels",
      icon: FaVideo,
      label: "Reels",
      gradient: "from-indigo-700 to-blue-900",
    },
    {
      to: "/landlord/landlord_subadmin",
      icon: FaUserCircle,
      label: "SubOwner",
      gradient: "from-blue-600 to-indigo-800",
    },
    {
      to: "/landlord/announcement",
      icon: FaDiagnoses,
      label: "Announcements",
      gradient: "from-indigo-600 to-blue-800",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[10000]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileOpen(true)}
            className="p-3 bg-gradient-to-r from-indigo-700 to-blue-900 text-white rounded-xl shadow-2xl"
          >
            <FaBars size={24} />
          </motion.button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Dark Blue Glassmorphism Theme */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-screen z-[9999] flex flex-col
          backdrop-blur-2xl bg-gradient-to-b from-blue-900/30 to-indigo-950/40
          border-r border-white/20 shadow-2xl transition-all duration-500 ease-out
          ${isMobileOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full md:w-auto md:translate-x-0"}
          ${isHovered ? "md:w-72" : "md:w-20"}
          overflow-hidden
        `}
        style={{
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-white/20 backdrop-blur-xl bg-gradient-to-b from-blue-900/40 to-transparent">
          <motion.div
            className="flex items-center justify-center md:justify-start gap-3 cursor-pointer"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={isHovered || isMobileOpen ? logo : dd}
              alt="Gharzo Logo"
              className={`
                object-contain transition-all duration-500
                ${isHovered || isMobileOpen ? "h-12" : "h-10"}
              `}
            />
            {(isHovered || isMobileOpen) && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white drop-shadow-lg"
              >
                GHARZO
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto">
          <ul className="space-y-3">
            {links.map(({ to, icon: Icon, label, gradient }) => (
              <motion.li
                key={label}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <NavLink
                  to={to}
                  end={to === "/landlord"}
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ""} ${
                      isHovered || isMobileOpen ? "justify-start" : "justify-center"
                    }`
                  }
                >
                  <Colorful3DIcon icon={Icon} gradient={gradient} />
                  {(isHovered || isMobileOpen) && (
                    <span className="font-medium text-white drop-shadow">
                      {label}
                    </span>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20 backdrop-blur-xl bg-gradient-to-t from-blue-900/40 to-transparent">
          <motion.button
            whileHover={{ scale: 1.03, x: 6 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`
              w-full flex items-center rounded-xl py-3 px-4
              backdrop-blur-sm border border-white/30
              hover:bg-white/20 transition-all duration-300
              ${isHovered || isMobileOpen ? "justify-start gap-4" : "justify-center"}
            `}
          >
            <Colorful3DIcon icon={FaSignOutAlt} gradient="from-red-600 to-rose-800" />
            {(isHovered || isMobileOpen) && (
              <span className="font-medium text-white">Logout</span>
            )}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;