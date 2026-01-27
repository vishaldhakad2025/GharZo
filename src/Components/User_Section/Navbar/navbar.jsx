import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Home,
  Building2,
  Info,
  Phone,
  Video,
  LogOut,
  UserCircle,
  Smartphone,
  ChevronDown,
  Calendar,
  UserPlus,
  Landmark,
  Briefcase,
  Users,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../../../assets/logo/logo.png";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";

// Download App Button Component
const DownloadAppButton = () => (
  <motion.a
    href="#"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.06, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className={`
      flex items-center gap-2 px-3 py-3 
      bg-gradient-to-r from-blue-600 via-blue-800 to-blue-600  
      text-white text-sm font-semibold 
      rounded-full shadow-lg hover:shadow-xl 
      transition-all duration-300
      hover:from-orange-600 hover:via-orange-600 hover:to-purple-700
    `}
  >
    <Smartphone size={18} />
    <span className="hidden sm:inline">Download App</span>
    <span className="sm:hidden">Download App</span>
  </motion.a>
);

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [hasToken, setHasToken] = useState(false);

  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const buttonRef = useRef(null);
  const moreMenuRef = useRef(null);

  const navItems = [
    { text: "Home", to: "/", icon: <Home size={18} /> },
    { text: "Properties", to: "/properties", icon: <Building2 size={18} />, protected: true },
    { text: "Reels", to: "/reels", icon: <Video size={18} />, protected: true, onClick: () => setIsOpen(false) },
    { text: "About Us", to: "/about", icon: <Info size={18} /> },
    { text: "Contact", to: "/contact", icon: <Phone size={18} /> },
  ];

  const moreMenuItems = [
    { text: "My Visits", to: "/my-visits", icon: <Calendar size={18} />, protected: true },
    { text: "Add Channel Partner", to: "/add-channel-partner", icon: <UserPlus size={18} />, protected: true },
    { text: "Home Loan", to: "/home-loan", icon: <Landmark size={18} />, protected: true },
    { text: "Franchise Request", to: "/franchise-request", icon: <Briefcase size={18} />, protected: false },
    // { text: "Login", to: "/login", icon: <User size={18} />, protected: false, hideIfAuth: true },
    // { text: "Sub Owner", to: "/sub-owner", icon: <Users size={18} />, protected: true },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Token check
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("usertoken");
      setHasToken(!!token);
    };

    checkToken();

    const handleStorageChange = (e) => {
      if (e.key === "usertoken") checkToken();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // GSAP animations
  useEffect(() => {
    if (currentPath !== "/reels") {
      gsap.fromTo(
        logoRef.current,
        { scale: 0, rotateY: -90, opacity: 0 },
        { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
      );

      iconRefs.current.forEach((icon, i) => {
        if (icon) {
          gsap.fromTo(
            icon,
            { scale: 0, rotateY: 90, opacity: 0 },
            { scale: 1, rotateY: 0, opacity: 1, delay: i * 0.1, duration: 0.6, ease: "back.out(1.7)" }
          );
        }
      });

      gsap.fromTo(
        buttonRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power3.out" }
      );
    }
  }, [currentPath]);

  const handleLogout = () => {
    setShowUserMenu(false);
    setIsOpen(false);
    localStorage.removeItem('usertoken');
    setHasToken(false);
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setIsOpen(false);
    navigate("/user/");
  };

  const shouldReduceMotion = useReducedMotion();
  const buttonVariants = shouldReduceMotion
    ? {}
    : { whileHover: { scale: 1.05, y: -2 }, whileTap: { scale: 0.98 } };

  const filteredMoreMenuItems = moreMenuItems.filter(
    (item) => !(item.hideIfAuth && hasToken)
  );

  if (currentPath === "/reels") return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-100 shadow-xl border-b-2 border-gradient-to-r from-blue-400 via-purple-400 to-orange-400">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.div
              ref={logoRef}
              whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <NavLink to="/" className="block">
                <img
                  src={logo}
                  alt="GharZo"
                  className="h-11 sm:h-14 w-auto object-contain drop-shadow-lg"
                />
              </NavLink>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item, i) => {
                const isActive = currentPath === item.to;
                const linkTo = item.protected && !hasToken ? "/login" : item.to;
                const linkState = item.protected && !hasToken ? { from: item.to } : null;

                return (
                  <NavLink
                    key={item.text}
                    ref={(el) => (iconRefs.current[i] = el)}
                    to={linkTo}
                    state={linkState}
                    onClick={() => item.onClick?.()}
                    className={`relative group flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-300 text-sm font-semibold ${
                      isActive
                        ? "bg-gradient-to-r from-blue-900 via-blue-900 to-blue-600 text-white shadow-xl shadow-purple-500/40 scale-105"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-105"
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'} transition-colors transform group-hover:scale-110 duration-200`}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.text}</span>
                    {!isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-orange-600 via-orange-600 to-oragne-600 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                    )}
                  </NavLink>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 text-sm font-semibold ${
                    showMoreMenu
                      ? "bg-gradient-to-r from-blue-900 via-blue-900 to-blue-800 text-white shadow-xl shadow-purple-500/40"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  }`}
                >
                  <Menu size={18} className={showMoreMenu ? 'text-white' : 'text-purple-600'} />
                  <span>More</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${showMoreMenu ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-2xl py-3 w-64 border-2 border-purple-100 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                      {filteredMoreMenuItems.map((item, index) => {
                        const linkTo = item.protected && !hasToken ? "/login" : item.to;
                        const linkState = item.protected && !hasToken ? { from: item.to } : null;
                        const isActive = currentPath === item.to;

                        return (
                          <NavLink
                            key={item.text}
                            to={linkTo}
                            state={linkState}
                            onClick={() => setShowMoreMenu(false)}
                            className={`flex items-center gap-3 px-5 py-3.5 transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 font-semibold"
                                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                            }`}
                          >
                            <span className={isActive ? "text-purple-600" : "text-blue-500"}>{item.icon}</span>
                            <span className="font-medium">{item.text}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right section - Auth + Download App + Mobile menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Auth Button */}
              <div ref={buttonRef} className="relative">
                <motion.button
                  {...buttonVariants}
                  onClick={() => {
                    if (hasToken) setShowUserMenu(!showUserMenu);
                    else navigate("/login");
                  }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-orange-500 via-oragne-500 to-orange-600 text-white shadow-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 font-semibold text-sm"
                  aria-label={hasToken ? "User Menu" : "Login"}
                >
                  <User size={18} className="drop-shadow-lg" />
                  <span className="hidden sm:inline tracking-wide">{hasToken ? "Account" : "Login"}</span>
                </motion.button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {hasToken && showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-2xl py-3 w-60 z-50 border-2 border-purple-100 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100"></div>
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-6 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all flex items-center gap-3 group"
                      >
                        <UserCircle size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">My Profile</span>
                      </button>
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-4 text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 group"
                      >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Download App Button */}
              <div className="hidden sm:block">
                <DownloadAppButton />
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  {isOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-gradient-to-b from-white via-purple-50/30 to-blue-50/30 border-t-2 border-purple-200 shadow-2xl"
            >
              <div className="px-4 py-6 space-y-2 max-w-7xl mx-auto">
                {navItems.map((item) => {
                  const linkTo = item.protected && !hasToken ? "/login" : item.to;
                  const linkState = item.protected && !hasToken ? { from: item.to } : null;
                  const isActive = currentPath === item.to;

                  return (
                    <NavLink
                      key={item.text}
                      to={linkTo}
                      state={linkState}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-800 via-purple-600 to-blue-600 text-white shadow-lg"
                          : "text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-purple-600"}>{item.icon}</span>
                      <span className="font-semibold">{item.text}</span>
                    </NavLink>
                  );
                })}

                {/* More Section in Mobile */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <Menu size={20} className="text-purple-600" />
                      <span>More Options</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 text-purple-600 ${
                        showMobileMoreMenu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showMobileMoreMenu && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2 pl-4"
                      >
                        {filteredMoreMenuItems.map((item) => {
                          const linkTo = item.protected && !hasToken ? "/login" : item.to;
                          const linkState = item.protected && !hasToken ? { from: item.to } : null;
                          const isActive = currentPath === item.to;

                          return (
                            <NavLink
                              key={item.text}
                              to={linkTo}
                              state={linkState}
                              onClick={() => {
                                setShowMobileMoreMenu(false);
                                setIsOpen(false);
                              }}
                              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all ${
                                isActive
                                  ? "bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 text-white shadow-md"
                                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                              }`}
                            >
                              <span className={isActive ? "text-white" : "text-blue-500"}>{item.icon}</span>
                              <span className="font-medium text-sm">{item.text}</span>
                            </NavLink>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-4">
                  {/* Download App in mobile menu */}
                  <div className="mb-4 sm:hidden">
                    <DownloadAppButton />
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent my-4" />

                  {hasToken ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                      >
                        <User size={20} className="text-purple-600" />
                        <span className="font-semibold">Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut size={20} />
                        <span className="font-semibold">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/login");
                      }}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <User size={20} />
                      Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default Navbar;