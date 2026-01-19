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
  // MapPin,           // commented out
  UserCircle,
  Smartphone,         // added for app icon
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../../../assets/logo/logo.png";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";

// Download App Button Component
const DownloadAppButton = () => (
  <motion.a
    href="#"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.06, y: -1 }}
    className={`
      flex items-center gap-2 px-4 py-2 
      bg-gradient-to-r from-orange-400 to-blue-600  
      text-white text-sm font-medium 
      rounded-full shadow-md hover:shadow-lg 
      transition-all duration-300
    `}
  >
    <Smartphone size={18} />
    Download App
  </motion.a>
);

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [hasToken, setHasToken] = useState(false);

  const logoRef = useRef(null);
  const iconRefs = useRef([]);
  const buttonRef = useRef(null);

  const navItems = [
    { text: "Home", to: "/", icon: <Home size={18} /> },
    { text: "Properties", to: "/properties", icon: <Building2 size={18} />, protected: true },
    { text: "Reels", to: "/reels", icon: <Video size={18} />, protected: true, onClick: () => setIsOpen(false) },
    { text: "About Us", to: "/about", icon: <Info size={18} /> },
    { text: "My Visits", to: "/my-visits", icon: <Smartphone size={18} />, hiddenIfUnauth: true, protected: true },
    { text: "Contact", to: "/contact", icon: <Phone size={18} /> },
  ];

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

  const filteredNavItems = navItems.filter(
    (item) => !(item.hiddenIfUnauth && !hasToken)
  );

  if (currentPath === "/reels") return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <motion.div
              ref={logoRef}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <NavLink to="/" className="block">
                <img
                  src={logo}
                  alt="GharZo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </NavLink>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1.5">
              {filteredNavItems.map((item, i) => {
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
                    className={`relative group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/50"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-blue-500 group-hover:text-blue-600'} transition-colors`}>
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                    {!isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-3/4 transition-all duration-300"></span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Right section - Auth + Download App + Mobile menu */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Auth Button */}
              <div ref={buttonRef} className="relative">
                <motion.button
                  {...buttonVariants}
                  onClick={() => {
                    if (hasToken) setShowUserMenu(!showUserMenu);
                    else navigate("/login");
                  }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 font-medium text-sm"
                  aria-label={hasToken ? "User Menu" : "Login"}
                >
                  <User size={18} className="drop-shadow-lg" />
                  <span className="hidden sm:inline">{hasToken ? "Account" : "Login"}</span>
                </motion.button>

                {/* User Menu Dropdown */}
                {hasToken && showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 w-56 z-50 border border-blue-100"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-5 py-3 text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
                    >
                      <UserCircle size={18} className="text-blue-500" />
                      <span className="font-medium">My Profile</span>
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Download App Button - replaced location */}
              <DownloadAppButton />

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md hover:shadow-lg transition-all"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gradient-to-b from-white to-blue-50 border-t border-blue-100 shadow-lg"
          >
            <div className="px-4 py-5 space-y-2 max-w-7xl mx-auto">
              {filteredNavItems.map((item) => {
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
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md"
                        : "text-gray-800 hover:bg-blue-50"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-blue-600"}>{item.icon}</span>
                    <span className="font-medium">{item.text}</span>
                  </NavLink>
                );
              })}

              <div className="pt-3">
                {/* Download App in mobile menu */}
                <div className="mb-4 px-4">
                  <DownloadAppButton />
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-4" />

                {hasToken ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-800 hover:bg-blue-50 transition-all"
                    >
                      <User size={20} className="text-blue-600" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-xl font-medium shadow-md"
                  >
                    <User size={20} />
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </>
  );
}

export default Navbar;