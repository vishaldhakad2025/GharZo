// Sidebar.jsx (with added "Add Property" button)
import dd from "../../../../assets/logo/dd.png";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Building2,
  LogOut,
  Plus,
  UserPlus,
  X,
  Home,
  Menu, // Added Menu icon for mobile toggle
} from "lucide-react";
import { FaBoxOpen, FaMoneyBill, FaTeamspeak } from "react-icons/fa";

const Sidebar = ({ setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const navigate = useNavigate();

  const linkClass =
    "flex items-center gap-3 py-2 px-3 rounded-md hover:bg-indigo-600 hover:text-white transition-all duration-300";
  const activeClass = "bg-indigo-700 text-white shadow-lg";

  // Icon Wrapper for 3D Colorful Effect
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

  // Update sidebar width for desktop only
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0); // mobile: no space for sidebar
    } else {
      setSidebarWidth(isHovered ? 224 : 80);
    }
  }, [isHovered, setSidebarWidth]);

  useEffect(() => {
    const fetchOrg = async () => {
      const token = localStorage.getItem('orgToken');
      if (!token) return;
      try {
        const res = await fetch('https://api.gharzoreality.com/api/organization/my-website', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setOrgData(data.data);
            localStorage.setItem('subdomain', data.data.subdomain);
          }
        }
      } catch (e) { console.error(e); }
    };
    fetchOrg();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/regional_manager_login");
        return;
      }

      const response = await fetch("https://api.gharzoreality.com/api/regional-managers/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        // Assuming no body is needed for logout; if email/password is required, adjust accordingly
        // but since password isn't stored, using token-based auth is standard
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("regionalManager");
          navigate("/regional_manager_login");
        } else {
          // Even if API fails, remove token for security
          localStorage.removeItem("token");
          localStorage.removeItem("regionalManager");
          navigate("/regional_manager_login");
        }
      } else {
        // Fallback: remove token anyway
        localStorage.removeItem("token");
        localStorage.removeItem("regionalManager");
        navigate("/regional_manager_login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: remove token anyway
      localStorage.removeItem("token");
      localStorage.removeItem("regionalManager");
      navigate("/regional_manager_login");
    }
    setIsMobileOpen(false); // Hide sidebar on logout (mobile)
  };

  // Function to handle NavLink clicks and hide sidebar on mobile
  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false); // Hide sidebar on mobile when any NavLink is clicked
    }
  };

  // Render Sidebar Content only when open on mobile or always on desktop
  const renderSidebarContent = () => (
    <>
      {/* Mobile Close Button - Only visible on mobile */}
      {isMobileOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute right-4 top-4 text-white"
        >
          <X size={24} />
        </motion.button>
      )}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 p-4"
      >
        <img
          src={orgData?.logoUrl ? `https://api.gharzoreality.com${orgData.logoUrl}` : dd}
          alt={orgData?.organizationName || "Logo"}
          className="w-10 h-10 object-contain rounded-md shadow-lg hover:scale-110 transition-transform duration-300"
        />
        {(isHovered || isMobileOpen) && (
          <motion.h2 
            className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {orgData?.organizationName || "Regional Manager"}
          </motion.h2>
        )}
      </motion.div>

      {/* Menu */}
      <ul className="space-y-2 mt-6 px-2">
        {/* <li>
          <NavLink
            to={`/website/${localStorage.getItem('subdomain') || 'ridhhi-org'}`}
            className={linkClass} // No activeClass for Home
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={Home}
              gradient="from-blue-400 to-indigo-500"
            />
            {(isHovered || isMobileOpen) && <span>Home</span>}
          </NavLink>
        </li> */}
        <li>
          <NavLink
            to="/regional_manager/dashboard"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={LayoutDashboard}
              gradient="from-indigo-400 to-purple-500"
            />
            {(isHovered || isMobileOpen) && <span>Dashboard</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/regional_manager/regional_manager_property"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={Building2}
              gradient="from-purple-400 to-pink-500"
            />
            {(isHovered || isMobileOpen) && <span>Property</span>}
          </NavLink>
        </li>

        {/* New Add Property Button */}
        <li>
          <NavLink
            to="/regional_manager/add_property"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={Plus}
              gradient="from-green-400 to-teal-500"
            />
            {(isHovered || isMobileOpen) && <span>Add Property</span>}
          </NavLink>
        </li>

        {/* <li>
          <NavLink
            to="/regional_manager/regional_manager_add_tenant"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={UserPlus}
              gradient="from-green-400 to-teal-500"
            />
            {(isHovered || isMobileOpen) && <span>Tenant</span>}
          </NavLink>
        </li> */}
        {/* <li>
          <NavLink
            to="/regional_manager/dues"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={FaBoxOpen}
              gradient="from-yellow-400 to-amber-500"
            />
            {(isHovered || isMobileOpen) && <span>Dues</span>}
          </NavLink>
        </li> */}
        <li>
          <NavLink
            to="/regional_manager/regional_manager_expenses"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={FaMoneyBill}
              gradient="from-emerald-400 to-green-500"
            />
            {(isHovered || isMobileOpen) && <span>Expenses</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/regional_manager/team_management"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={FaTeamspeak}
              gradient="from-emerald-400 to-green-500"
            />
            {(isHovered || isMobileOpen) && <span>Team Management </span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/regional_manager/regional_manager_profile"
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass}` : linkClass
            }
            onClick={handleNavLinkClick}
          >
            <Colorful3DIcon
              icon={User }
              gradient="from-pink-400 to-rose-500"
            />
            {(isHovered || isMobileOpen) && <span>Profile</span>}
          </NavLink>
        </li>
      </ul>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full py-3 px-3 rounded-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white transition-all shadow-lg"
        >
          <Colorful3DIcon
            icon={LogOut}
            gradient="from-red-400 to-rose-500"
          />
          {(isHovered || isMobileOpen) && <span>Logout</span>}
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile when sidebar is closed */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[10000]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow-lg"
          >
            <Menu size={22} /> {/* Changed to Menu icon for better UX as toggle */}
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

      {/* Sidebar - Hidden by default on mobile, always visible on desktop */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        style={{ background: "linear-gradient(180deg, #ceb86fff, #625da7ff, #c8eb67ff)" }}
        className={`
          fixed top-0 left-0 h-screen text-white shadow-2xl transition-all duration-500 ease-in-out z-[9999]
          ${
            isMobileOpen
              ? "translate-x-0 w-64" // Full sidebar width on mobile when open
              : "-translate-x-full md:translate-x-0" // Hidden on mobile, shown on desktop
          }
          ${isHovered ? "md:w-56" : "md:w-20"} // Desktop: collapsed/expanded width
          flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden
        `}
      >
        {/* Render sidebar content conditionally for mobile to avoid rendering when closed */}
        {(isMobileOpen || window.innerWidth >= 768) && renderSidebarContent()}
      </motion.div>
    </>
  );
};

export default Sidebar;