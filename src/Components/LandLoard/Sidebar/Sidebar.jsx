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
import logo from "../../../assets/logo/logo.png";
import dd from "../../../assets/logo/dd.png";
import { useAuth } from "../../User_Section/Context/AuthContext";

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
    if (window.innerWidth < 768) {
      setSidebarWidth(0);
    } else {
      setSidebarWidth(isHovered ? 224 : 80);
    }
  }, [isHovered, setSidebarWidth]);

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

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

  const links = [
    // {
    //   to: "/",
    //   icon: Home,
    //   label: "Home",
    //   exact: true,
    //   gradient: "from-blue-400 to-indigo-500",
    // },
    {
      to: "/landlord",
      icon: FaTachometerAlt,
      label: "Dashboard",
      exact: true,
      gradient: "from-orange-600 to-blue-500",
    },
    //   { 
    //   to: "police-verification", 
    //   icon: BadgeCheck, 
    //   label: "Police Verification",
    //   gradient: "from-blue-600 to-orange-500",
    // },
    { 
      to: "/landlord/property", 
      icon: FaBuilding, 
      label: "Properties",
      gradient: "from-orange-600 to-blue-500",
    },
    { 
      to: "/landlord/add-property", 
      icon: FaPlus, 
      label: "Add Property",
      gradient: "from-blue-600 to-orange-500",
    },
    {
      to: `/landlord/tenant-form`,
      icon: FaUserPlus,
      label: "Add Tenant",
      gradient: "from-orange-600 to-blue-500",
    },
    {
      to: `/landlord/duespackages`,
      icon: FaBoxOpen,
      label: "Dues Packages",
      gradient: "from-blue-600 to-orange-500",
    },
    {
      to: `/landlord/expenses`,
      icon: FaMoneyBillWave,
      label: "Expenses",
      gradient: "from-orange-600 to-blue-500",
    },
    {
      to: `/landlord/dues`,
      icon: FaFileInvoice,
      label: "Dues",
      gradient: "from-blue-600 to-orange-500",
    },
    {
      to: `/landlord/switch-requests`,
      icon: FaExchangeAlt,
      label: "Switch Requests",
      gradient: "from-blue-600 to-orange-500",
    },
    { 
      to: "/landlord/landlord-profile", 
      icon: FaUser, 
      label: "Profile",
      gradient: "from-blue-600 to-orange-500",
    },
    { 
      to: "/landlord/landlord_reels", 
      icon: FaVideo, 
      label: "Reels",
      gradient: "from-blue-600 to-orange-500",
    },
    {
      to: "/landlord/landlord_subadmin",
      icon: FaUserCircle,
      label: "SubOwner",
      gradient: "from-blue-600 to-orange-500",
    },
    {
      to: "/landlord/announcement",
      icon: FaDiagnoses,
      label: "Announcements",
      gradient: "from-orange-600 to-blue-500",
    },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[10000]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-blue-900 text-white rounded-md shadow-lg"
          >
            <FaBars size={22} />
          </motion.button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setIsMobileOpen(false)}
        ></motion.div>
      )}

      {/* Sidebar */}
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
          sidebar fixed top-0 left-0 h-screen text-white shadow-2xl transition-all duration-500 ease-in-out z-[9999]
          ${
            isMobileOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-0 md:translate-x-0"
          }
          ${isHovered ? "md:w-56" : "md:w-20"}
          flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden
        `}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className=""
        >
          <img
            src={isHovered || isMobileOpen ? logo : logo}
            alt="Logo"
            onClick={() => navigate("/")}
            className={`transition-all duration-500 ease-in-out object-contain cursor-pointer ${
  isHovered || isMobileOpen
    ? "w-60 h-16"
    : "w-80 h-10"
}`}

          />
          {(isHovered || isMobileOpen) && (
            <motion.h2 
              className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              
            </motion.h2>
          )}
        </motion.div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col justify-between px-2 py-6 relative">
          <ul className="space-y-2 pb-16">
            {links.map(({ to, icon: Icon, label, gradient }) => (
              <li key={label} className="z-0">
                <NavLink
                  to={to}
                  end={to === "/landlord"}
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `${linkClass} ${
                      isActive ? activeClass : ""
                    } ${
                      isHovered || isMobileOpen
                        ? "gap-4 px-4 py-3 justify-start"
                        : "justify-center py-3"
                    }`
                  }
                >
                  <Colorful3DIcon
                    icon={Icon}
                    gradient={gradient}
                  />
                  {(isHovered || isMobileOpen) && (
                    <span className="text-sm sm:text-base font-medium">
                      {label}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Logout Button - Fixed at Bottom, No Red BG */}
          <div className="sticky bottom-0 left-0 w-full bg-transparent z-10 py-2 px-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={`
                w-full flex items-center transition-all duration-300 rounded-lg
                ${isHovered || isMobileOpen ? "gap-4 px-4 py-3 justify-start" : "justify-center py-3"}
                hover:bg-white/20 backdrop-blur-sm border border-white/30
              `}
            >
              <Colorful3DIcon
                icon={FaSignOutAlt}
                gradient="from-gray-400 to-gray-600"
              />
              {(isHovered || isMobileOpen) && (
                <span className="text-sm sm:text-base font-medium">Logout</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;