import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Video, // Added for Reels icon
  MessageCircle,
  User,
  CreditCard,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { FaTachometerAlt } from "react-icons/fa";
import gsap from "gsap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import logo from "../../../assets/logo/logo.png"; // Use the same logo as SellerNavbar
import dd from "../../../assets/logo/dd.png"; // Collapsed logo

const Sidebar = ({ setSidebarWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  // GSAP refs
  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const logoutRef = useRef(null);
  const toggleRef = useRef(null);

  const navItems = [
    // { text: "Home", to: "/", icon: <Home size={18} /> },
    { text: "Seller Dashboard", to: "/seller/home", icon: <FaTachometerAlt size={18} /> },
    { text: "My Listings", to: "/seller/property", icon: <Building2 size={18} /> },
    { text: "Reels", to: "/seller/reels", icon: <Video size={18} /> }, // Added Reels
    { text: "Enquiries", to: "/seller/enquiries", icon: <MessageCircle size={18} /> },
    { text: "Profile", to: "/seller/seller-profile", icon: <User size={18} /> },
    { text: "Subscription", to: "/seller/subscription", icon: <CreditCard size={18} /> },
  ];

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

  const handleLogout = () => {
    localStorage.removeItem("sellertoken");
    localStorage.removeItem("sellerId");
    localStorage.removeItem("seller");
    localStorage.removeItem("role");
    toast.success("Logged out successfully!");
    console.log("Logged out, redirecting to /");
    setIsMobileOpen(false);
    navigate("/");
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

      {/* Sidebar */}
    <nav
  onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
  onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
  style={{
    background: `
      radial-gradient(circle at bottom, rgba(245,124,0,0.35), transparent 60%),
      linear-gradient(180deg, #071a2f 0%, #0d2f52 45%, #123e6b 75%, #0b2a4a 100%)
    `
  }}
  className={`
    fixed top-0 left-0 h-screen backdrop-blur-md shadow-2xl
    transition-all duration-500 ease-in-out z-[9999]
    ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
    ${isHovered ? "md:w-56" : "md:w-20"}
    flex flex-col text-white overflow-y-auto
    [&::-webkit-scrollbar]:hidden
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
        <div className="flex items-center gap-2 p-4">
          <img
            ref={logoRef}
            src={isHovered || isMobileOpen ? logo : dd}
            alt="Logo"
            className={`object-contain rounded-md shadow-md transition-all duration-500 ${
              isHovered || isMobileOpen ? "w-28" : "w-10 h-10"
            }`}
            onClick={() => navigate("/seller/home")}
          />
          {(isHovered || isMobileOpen) && (
            <h2 className="text-xl font-bold tracking-wide text-sky-300">Seller</h2>
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
                <span className="text-sky-400 group-hover:drop-shadow-md">{item.icon}</span>
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

export default Sidebar;
