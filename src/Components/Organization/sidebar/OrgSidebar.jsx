import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Building2,
  LogOut,
  Plus,
  UserPlus,
  X,
  Home,
  Menu,
  DollarSign,
  BadgeCheck
} from "lucide-react";
import { FaBoxOpen, FaMoneyBill, FaTeamspeak } from "react-icons/fa";
import gsap from "gsap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx"; // Adjust path as needed
import logo from "../../../assets/logo/logo.png"; // Fallback logo
import dd from "../../../assets/logo/dd.png"; // Collapsed logo

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

const OrgSidebar = ({ setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profile, setProfile] = useState({ organizationName: '', logoUrl: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();

  // GSAP refs
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const logoutRef = useRef(null);
  const toggleRef = useRef(null);

  // Load orgId from localStorage (assuming orgtoken contains orgId)
 

  const navItems = [
    { text: "Home", to: "/", icon: Home, gradient: "from-indigo-500 to-purple-600" },    
    { text: "Dashboard", to: "/organization", icon: LayoutDashboard, gradient: "from-blue-500 to-blue-700" },
    { text: "Police Verification", to: "orgpolice-verification", icon: BadgeCheck, gradient: "from-blue-500 to-blue-700" },
    { text: "Properties", to: "/organization/property-list", icon: Building2, gradient: "from-green-500 to-emerald-600" },
    { text: "Add Property", to: "/organization/add-property", icon: Building2, gradient: "from-orange-500 to-red-600" },
    { text: "Add Regional Manager", to: "/organization/add-regionalManager", icon: Plus, gradient: "from-purple-500 to-pink-600" },
    { text: "Add Tenant", to: "/organization/tenant-form", icon: UserPlus, gradient: "from-cyan-500 to-teal-600" },
    { text: "Expenses", to: "/organization/expenses", icon: FaMoneyBill, gradient: "from-red-500 to-rose-600" },
    { text: "Dues Packages", to: "/organization/dues-packages", icon: FaMoneyBill, gradient: "from-yellow-500 to-amber-600" },
     { text: "Dues", to: "/organization/dues", icon: DollarSign, gradient: "from-yellow-500 to-amber-600" },
    { text: "Announcements", to: "/organization/announcements", icon: FaMoneyBill, gradient: "from-pink-500 to-rose-600" },
    
   
    { text: "Reels", to: "/organization/reels", icon: FaBoxOpen, gradient: "from-violet-500 to-indigo-600" },
    // { text: "Org Website Portal", to: `/${orgId}/org-website`, icon: Building2, gradient: "from-emerald-500 to-green-600" },
    { text: "OrganizationWeb", to: "/organization/organizationweb", icon: User, gradient: "from-amber-500 to-yellow-600" },
     { text: "Profile", to: "/organization/profile", icon: User, gradient: "from-slate-500 to-gray-600" },
  
  ];

  // Fetch organization data
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = localStorage.getItem('orgToken');
        if (!token) {
          console.error('No orgToken found');
          return;
        }

        const response = await fetch('https://api.gharzoreality.com/api/organization/my-website', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          const fullLogoUrl = data.data.logoUrl ? `https://api.gharzoreality.com${data.data.logoUrl}` : '';
          setProfile({
  
            logoUrl: fullLogoUrl,
          });
        } else {
          throw new Error(data.message || 'Failed to fetch organization data');
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast.error('Failed to load organization details');
      }
    };

    fetchOrgData();
  }, []);

  // Update sidebar width for desktop only
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarWidth(0); // Mobile: no space for sidebar
    } else {
      setSidebarWidth(isHovered ? 224 : 80); // Desktop: 224px expanded, 80px collapsed
    }
  }, [isHovered, setSidebarWidth]);

  // Animations
  useEffect(() => {
    // Logo animation
    gsap.fromTo(
      logoRef.current,
      { scale: 0, rotateY: -90, opacity: 0 },
      { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
    );

    // Nav items animation
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

    // Logout button animation
    gsap.fromTo(
      logoutRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" }
    );

    // Toggle button animation
    gsap.fromTo(
      toggleRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.4, ease: "power3.out" }
    );
  }, []); 

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
     {
      try {
        localStorage.removeItem("orgToken");
          localStorage.removeItem("orgData");
            localStorage.removeItem("id");
        await logout();
        toast.success("Logged out successfully!");
        setIsMobileOpen(false);
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

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
            className="p-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white shadow-lg transition-all duration-300"
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
        ></div>
      )}

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4"
            onClick={() => setShowLogoutDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                  <button
                    onClick={() => setShowLogoutDialog(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowLogoutDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Sidebar */}
      <nav
        style={{ background: "linear-gradient(180deg, #ceb86fff, #625da7ff, #c8eb67ff)" }}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
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
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute right-4 top-4 text-white"
          >
            <X size={24} />
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 p-4">
          <img
            ref={logoRef}
            src={(isHovered || isMobileOpen) ? (profile.logoUrl || logo) : (profile.logoUrl ? profile.logoUrl : dd)}
            alt="Logo"
            className={`object-contain rounded-md shadow-md transition-all duration-500 ${
              isHovered || isMobileOpen ? "w-28" : "w-10 h-10"
            }`}
            onClick={() => navigate("/organization")}
          />
          {(isHovered || isMobileOpen) && (
            <h2 className="text-xl font-bold tracking-wide text-sky-300">
              {profile.organizationName}
            </h2>
          )}
        </div>

        {/* Menu */}
        <ul className="space-y-2 mt-6 px-2">
          {navItems.map((item, i) => (
            <li key={item.text}>
              <NavLink
                ref={(el) => (iconRefs.current[i] = el)}
                to={item.to}
                onClick={handleNavLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-300 relative group ${
                    isActive ? "bg-sky-700 text-white" : "hover:bg-sky-600 hover:text-white"
                  }`
                }
              >
                <span className="group-hover:drop-shadow-md">
                  <Colorful3DIcon icon={item.icon} gradient={item.gradient} size={18} />
                </span>
                {(isHovered || isMobileOpen) && (
                  <span className="group-hover:text-sky-300">{item.text}</span>
                )}
                {(isHovered || isMobileOpen) && (
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 group-hover:w-full transition-all duration-300"></span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout */}
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

export default OrgSidebar;