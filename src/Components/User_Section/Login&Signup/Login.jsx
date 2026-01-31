import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupbg from "../../../assets/Images/signupbg.jpg";
import logo from "../../../assets/logo/logo.png";

const API_BASE_URL = "https://api.gharzoreality.com";

function Login({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect after login
  const { from = "/user" } = location.state || {};

  // Available roles for registration
  const roles = [
    { value: "user", label: "User" },
    { value: "owner", label: "Owner" },
    { value: "tenant", label: "Tenant" },
    { value: "agent", label: "Agent" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    const userStr = localStorage.getItem("user");
    let userRole = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userRole = user.role;
      } catch {}
    }
    if (token && userRole) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  // Reset states when phone changes
  useEffect(() => {
    setResendAttempts(0);
    setCountdown(0);
    setOtpSent(false);
    setOtp("");
    setName("");
    setIsNewUser(false);
  }, [phone]);

  // Clear OTP when name/role fields appear (new user registration)
  useEffect(() => {
    if (isNewUser && otpSent) {
      setOtp("");
    }
  }, [isNewUser]);

  // Countdown timer for resend
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/send-otp`,
        { phone },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setOtpSent(true);
        toast.success(response.data.message || "OTP sent successfully!");
        setResendAttempts(0);
        setCountdown(10); // Changed from 10 to 30 seconds
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP with rate limiting
  const handleResendOtp = async (e) => {
    e.preventDefault();
    
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds before resending OTP`);
      return;
    }
    
    if (isResending) {
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/resend-otp`,
        { phone },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "New OTP sent successfully!");
        setResendAttempts((prev) => prev + 1);
        setCountdown(30); // 30 seconds cooldown
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to resend OTP";
      toast.error(errorMsg);
      
      // Handle rate limit error - backend se jo wait time aaye use karo
      if (error.response?.data?.waitTime) {
        setCountdown(error.response.data.waitTime);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    // Check if new user needs to provide name
    if (isNewUser && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsVerifying(true);
    try {
      const payload = {
        phone,
        otp
      };

      // Add name and role only if it's a new user
      if (isNewUser) {
        payload.name = name.trim();
        payload.role = role;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        const { user, token, isNewUser: newUser } = response.data.data;

        // Store token and user info
        if (token) {
          localStorage.setItem("usertoken", token);
        }
        
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", user.role);
        }

        // Update auth context
        login({
          phone: user.phone,
          role: user.role,
          isRegistered: true,
          fullName: user.name,
          email: user.email,
        });

        const successMsg = newUser 
          ? "Registration successful! Welcome to GharZo!" 
          : "Login successful!";
        
        toast.success(successMsg);

        setTimeout(() => {
          onClose?.();
          navigate(from, { replace: true });
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to verify OTP";
      
      // Check if it's a new user registration error
      if (errorMsg.includes("Name is required") || errorMsg.includes("registration")) {
        setIsNewUser(true);
        toast.error("Please enter your name to complete registration");
      } else {
        toast.error(errorMsg);
        
        // Show attempts left if available
        if (error.response?.data?.attemptsLeft !== undefined) {
          toast.warning(`${error.response.data.attemptsLeft} attempts remaining`);
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!otpSent) {
        handleSendOtp(e);
      } else {
        handleVerifyOtp(e);
      }
    }
  };

  const particlesInit = async (main) => await loadFull(main);

  // Handle Change Number button - Reset countdown timer
  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp("");
    setName("");
    setIsNewUser(false);
    setCountdown(0); // Important: Clear the countdown timer
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="relative w-full max-w-5xl h-[650px] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex">
        
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover={false}
          toastClassName="backdrop-blur-xl bg-slate-800/95 shadow-2xl rounded-xl border border-cyan-500/20"
          bodyClassName="text-white font-medium"
        />

        {/* LEFT SIDE - Dark sidebar with form */}
        <div className="w-full lg:w-[45%] bg-gradient-to-b from-[#0c2344] to-[#0b4f91] relative overflow-hidden flex items-center justify-center p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
          
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
              background: { color: { value: "transparent" } },
              fpsLimit: 60,
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                  resize: true,
                },
                modes: { 
                  grab: { 
                    distance: 120, 
                    links: { opacity: 0.3 }
                  } 
                },
              },
              particles: {
                color: { value: "#06b6d4" },
                links: {
                  color: "#06b6d4",
                  distance: 150,
                  enable: true,
                  opacity: 0.15,
                  width: 1,
                },
                move: { 
                  enable: true, 
                  speed: 0.5,
                },
                number: { 
                  value: 40,
                  density: {
                    enable: true,
                    area: 800
                  }
                },
                opacity: { value: 0.3 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 2 } },
              },
              detectRetina: true,
            }}
            className="absolute inset-0"
          />

          {/* Form container */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-md z-10"
          >
            {/* Logo/Icon area */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-15 h-15 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <img 
                    src={logo} 
                    alt="GharZo" 
                    className="h-17 w-[150px] object-contain" 
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {!otpSent ? "Welcome back" : isNewUser ? "Complete Registration" : "Verify OTP"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {!otpSent ? (
                    <>
                      New user?{" "}
                      {/* <button
                        onClick={() => {
                          setIsNewUser(true);
                          if (phone.length === 10) {
                            handleSendOtp({ preventDefault: () => {} });
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                      >
                        Sign up here →
                      </button> */}
                    </>
                  ) : isNewUser ? (
                    <span>Please provide your details to continue</span>
                  ) : (
                    <span>Enter the 6-digit code sent to your phone</span>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Form content with step transitions */}
            <AnimatePresence mode="wait">
              {!otpSent ? (
                // Phone input step
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your 10-digit phone number"
                      maxLength="10"
                      className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: isSendingOtp ? 1 : 1.01 }}
                    whileTap={{ scale: isSendingOtp ? 1 : 0.99 }}
                    disabled={isSendingOtp || phone.length !== 10}
                    className={`w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 ${
                      (isSendingOtp || phone.length !== 10) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleSendOtp}
                  >
                    {isSendingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </motion.button>

                  <button
                    className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-6">
                    By continuing, you agree to our Terms & Conditions
                  </p>
                </motion.div>
              ) : (
                // OTP verification step
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Phone confirmation */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">
                      OTP sent to <span className="text-white font-semibold">+91 {phone}</span>
                    </span>
                  </motion.div>

                  {/* Show name and role fields for new users */}
                  {isNewUser && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          FULL NAME <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          ROLE
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      VERIFICATION CODE
                    </label>
                    <input
                      type="text"
                      placeholder="• • • • • •"
                      maxLength="6"
                      className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-center text-2xl font-semibold tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  {/* Resend OTP Button - Now positioned above Verify button */}
                  <button
                    disabled={countdown > 0 || isResending}
                    className={`w-full py-3.5 font-medium rounded-xl transition-all duration-300 ${
                      countdown > 0 || isResending
                        ? "bg-slate-800/30 border border-slate-700 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300"
                    }`}
                    onClick={handleResendOtp}
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resending...
                      </span>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </button>

                  <motion.button
                    whileHover={{ scale: isVerifying ? 1 : 1.01 }}
                    whileTap={{ scale: isVerifying ? 1 : 0.99 }}
                    disabled={isVerifying}
                    className={`w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 ${
                      isVerifying ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleVerifyOtp}
                  >
                    {isVerifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      isNewUser ? 'Complete Registration' : 'Verify & Continue'
                    )}
                  </motion.button>

                  <button
                    className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                    onClick={handleChangeNumber}
                  >
                    ← Change Number
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Beautiful image background */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block lg:w-[55%] relative overflow-hidden"
        >
          {/* Background image with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${signupbg})`,
            }}
          >
            {/* Gradient overlay for depth and text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-cyan-900/20 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          </div>

          {/* Content overlay on image */}
          <div className="relative h-full flex flex-col justify-end p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-xl"
            >
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Find Your Perfect Home
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Discover rental properties, PGs & more — designed for your comfort. Join thousands of happy residents today.
              </p>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-4"
            >
            </motion.div>
          </div>

          {/* Floating expand button (decorative) */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
          >
            <svg
              className="w-6 h-6 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;