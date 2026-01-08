// PropertyManagerSidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  DollarSign,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Receipt,
  ArrowLeftRight,
  BadgeCheck
} from "lucide-react";
import { FaMoneyBillWave, FaUserTie } from "react-icons/fa";
import gsap from "gsap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Colorful3DIcon = ({ icon: Icon, gradient, size = 20 }) => (
  <motion.div
    className="relative p-2 rounded-full shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 perspective-1000"
    style={{ transformStyle: "preserve-3d" }}
    whileHover={{ y: -2 }}
  >
    <div className={`bg-gradient-to-br ${gradient} rounded-full p-1 shadow-md`}>
      <Icon size={size} className="text-white drop-shadow-lg" />
    </div>
    <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
  </motion.div>
);

const PropertyManagerSidebar = ({ setSidebarWidth = () => {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [orgName, setOrgName] = useState("");

  const navigate = useNavigate();
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const logoutRef = useRef(null);
  const toggleRef = useRef(null);

  /* -------------------------------------------------
     FETCH ORGANIZATION DETAILS (reads token each call)
  ------------------------------------------------- */
  useEffect(() => {
    const fetchOrgDetails = async () => {
      const token = localStorage.getItem("orgToken");
      if (!token) return;

      try {
        const response = await fetch(
          "https://api.gharzoreality.com/api/organization/my-website",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await response.json();
        if (json.success) {
          setLogoUrl(
            json.data.logoUrl
              ? `https://api.gharzoreality.com${json.data.logoUrl}`
              : ""
          );
          setOrgName(json.data.organizationName || "Property Manager");
        }
      } catch (err) {
        console.error("Failed to load org details:", err);
      }
    };

    fetchOrgDetails();
  }, []);

  /* -------------------------------------------------
     UPDATE SIDEBAR WIDTH
  ------------------------------------------------- */
  useEffect(() => {
    const updateWidth = () => {
      if (typeof setSidebarWidth === "function") {
        if (window.innerWidth < 768) {
          setSidebarWidth(0);
        } else {
          setSidebarWidth(isHovered ? 224 : 80);
        }
      }
    };
    updateWidth();
  }, [isHovered, setSidebarWidth]);

  /* -------------------------------------------------
     GSAP ANIMATIONS
  ------------------------------------------------- */
  useEffect(() => {
    gsap.fromTo(
      logoRef.current,
      { scale: 0, rotateY: -90, opacity: 0 },
      { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
    );

    iconRefs.current.forEach((icon, i) => {
      gsap.fromTo(
        icon,
        { scale: 0, rotateY: 90, opacity: 0 },
        {
          scale: 1,
          rotateY: 0,
          opacity: 1,
          delay: i * 0.1,
          duration: 0.6,
          ease: "back.out(1.7)",
        }
      );
    });

    gsap.fromTo(
      logoutRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" }
    );
    gsap.fromTo(
      toggleRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.4, ease: "power3.out" }
    );
  }, []);

  /* -------------------------------------------------
     MENU ITEMS – Home at the top
  ------------------------------------------------- */
  const menuItems = [
    
    {
      text: "Dashboard",
      to: "/property-manager/dashboard",
      icon: LayoutDashboard,
      gradient: "from-blue-500 to-blue-700",
    },
    {
      text: "Properties",
      to: "/property-manager/propertylist",
      icon: Building2,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      text: "Tenants",
      to: "/property-manager/pmadd-tenant",
      icon: UserPlus,
      gradient: "from-cyan-500 to-teal-600",
    },
    {
      text: "Collections",
      to: "/property-manager/collection",
      icon: Receipt,
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      text: "Dues",
      to: "/property-manager/dues",
      icon: DollarSign,
      gradient: "from-yellow-500 to-amber-600",
    },
    {
      text: "Expenses",
      to: "/property-manager/expenses",
      icon: FaMoneyBillWave,
      gradient: "from-red-500 to-rose-600",
    },
    {
      text: "Workers",
      to: "/property-manager/add_workers",
      icon: FaUserTie,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      text: "Documents",
      to: "/property-manager/dashdocument",
      icon: FileText,
      gradient: "from-slate-500 to-gray-600",
    },
    {
      text: "Room Switch",
      to: "/property-manager/roomswitch",
      icon: ArrowLeftRight,
      gradient: "from-orange-500 to-red-600",
    },
    // {
    //   text: "Police Verification",
    //   to: "/property-manager/police-verfication",
    //   icon:  BadgeCheck,
    //   gradient: "from-purple-400 to-pink-500",
    // },
    {
      text: "Profile",
      to: "/property-manager/profile",
      icon: Users,
      gradient: "from-amber-500 to-yellow-600",
    },
  ];

  /* -------------------------------------------------
     LOGOUT HANDLER – ALWAYS reads token from localStorage
  ------------------------------------------------- */
 const handleLogout = () => {
  // Remove stored items
  localStorage.removeItem('token');
  // localStorage.removeItem('user');
  // localStorage.removeItem('adminToken'); // if you have one

  // (Optional) Clear everything:
  // localStorage.clear();

  setShowLogoutDialog(true); // show your logout confirmation dialog
};

  const confirmLogout = async () => {
    const token = localStorage.getItem("orgToken");

    // No token → already logged out
    if (!token) {
      toast.info("You are already logged out.");
      localStorage.removeItem("orgToken");
      navigate("/Property_manager_login"); // Redirect to login
      setShowLogoutDialog(false);
      setIsMobileOpen(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.gharzoreality.com/api/property-managers/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();

      if (!response.ok || json.success === false) {
        const msg = json.message || "Session expired or invalid";
        if (msg.includes("Unauthorized") || msg.includes("inactive")) {
          toast.warn("Session expired or account inactive. Logging out…");
        } else {
          toast.error(msg);
        }
      } else {
        toast.success("Logged out successfully!");
      }
    } catch (err) {
      console.error("Logout network error:", err);
      toast.warn("Network error. Logging out locally…");
    } finally {
      // ALWAYS clear token & redirect to login page
      localStorage.removeItem("orgToken");
      localStorage.removeItem("subdomain"); // Optional: clear subdomain
      navigate("/Property_manager_login"); // Redirect to login
      setShowLogoutDialog(false);
      setIsMobileOpen(false);
    }
  };

  /* -------------------------------------------------
     NAVIGATION HELPERS
  ------------------------------------------------- */
  const handleNavClick = () => {
    if (window.innerWidth < 768) setIsMobileOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-300 relative group ${
      isActive ? "bg-sky-700 text-white" : "hover:bg-sky-600 hover:text-white"
    }`;

  const handleExternalHome = () => {
    const subdomain = localStorage.getItem("subdomain") || "ridhhi-org";
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const baseUrl = isDev ? "http://localhost:5173" : "https://drazeapp.com";
    window.location.href = `${baseUrl}/website/${subdomain}`;
  };

  /* -------------------------------------------------
     RENDER
  ------------------------------------------------- */
  return (
    <>
      {/* Mobile Toggle Button */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[10000]">
          <motion.button
            ref={toggleRef}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white shadow-lg"
          >
            <Menu size={22} />
          </motion.button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4"
          onClick={() => setShowLogoutDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
              <button onClick={() => setShowLogoutDialog(false)}>
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <nav
        style={{
          background:
            "linear-gradient(180deg, #ceb86fff, #625da7ff, #c8eb67ff)",
        }}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
          fixed top-0 left-0 h-screen text-white shadow-2xl transition-all duration-500 z-[9999]
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isHovered ? "md:w-56" : "md:w-20"}
          flex flex-col overflow-y-auto scrollbar-hide
        `}
      >
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute right-4 top-4 text-white"
          >
            <X size={24} />
          </button>
        )}

        {/* Logo Section */}
        <div className="flex items-center justify-center gap-2 p-4">
          <img
            ref={logoRef}
            src={
              (isHovered || isMobileOpen)
                ? logoUrl || "/src/assets/logo/logo.png"
                : logoUrl || "/src/assets/logo/dd.png"
            }
            alt="Logo"
            className={`object-contain rounded-md shadow-md transition-all duration-500 ${
              isHovered || isMobileOpen ? "w-28" : "w-10 h-10"
            }`}
            onClick={() => navigate("/property-manager/dashboard")}
          />
          
        </div>

        {/* Navigation Menu */}
        <ul className="space-y-2 mt-6 px-2">
          {menuItems.map((item, i) => (
            <li key={item.text}>
              {item.isExternal ? (
                <button
                  onClick={handleExternalHome}
                  className="flex w-full items-center gap-3 py-2 px-3 rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white relative group"
                >
                  <span className="group-hover:drop-shadow-md">
                    <Colorful3DIcon
                      icon={item.icon}
                      gradient={item.gradient}
                      size={18}
                    />
                  </span>
                  {(isHovered || isMobileOpen) && (
                    <span className="group-hover:text-sky-300">
                      {item.text}
                    </span>
                  )}
                  {(isHovered || isMobileOpen) && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 group-hover:w-full transition-all duration-300"></span>
                  )}
                </button>
              ) : (
                <NavLink
                  ref={(el) => (iconRefs.current[i] = el)}
                  to={item.to}
                  onClick={handleNavClick}
                  className={linkClass}
                >
                  <span className="group-hover:drop-shadow-md">
                    <Colorful3DIcon
                      icon={item.icon}
                      gradient={item.gradient}
                      size={18}
                    />
                  </span>
                  {(isHovered || isMobileOpen) && (
                    <span className="group-hover:text-sky-300">
                      {item.text}
                    </span>
                  )}
                  {(isHovered || isMobileOpen) && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 group-hover:w-full transition-all duration-300"></span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="p-4 mt-auto" ref={logoutRef}>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-300"
          >
            <LogOut size={18} className="drop-shadow-lg" />
            {(isHovered || isMobileOpen) && <span>Logout</span>}
          </motion.button>
        </div>
      </nav>
    </>
  );
};

export default PropertyManagerSidebar;