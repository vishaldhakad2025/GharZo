import React, { useState } from "react";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupbg from "../../../assets/Images/signupbg.jpg";
import logo from "../../../assets/logo/logo.png";

function PropertyOwnerLogin() {
  const navigate = useNavigate();
  const [useremail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Particles init
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://api.gharzoreality.com/api/worker/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: useremail,
          password: password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.message === "Login successful") {
          const { token, data } = result;
          
          // Store token and propertyOwner data in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("propertyOwner", JSON.stringify(data));
          
          toast.success("Login successful!", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          navigate("/dr-worker-dashboard/dashboard");
        } else {
          toast.error(result.message || "Login failed. Please check your credentials.", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Login failed. Server error.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch("https://api.gharzoreality.com/api/organization/my-website", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const subdomain = result.data.subdomain;
          navigate(`/website/${subdomain}`);
        } else {
          navigate('/website/ridhhi-org');
        }
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
      navigate(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="relative w-full max-w-5xl h-[650px] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex">

        {/* Modern toast styling */}
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
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
          
          {/* Animated particles background */}
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
                  Worker Dashboard Login
                </h2>
                <p className="text-slate-400 text-sm">
                  Enter your credentials to access your workspace
                </p>
              </div>
            </motion.div>

            {/* Form content */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                  value={useremail}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300"
                >
                  Login
                </motion.button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </motion.div>

              <p className="text-xs text-white text-center mt-6">
                By continuing, you agree to our Terms & Conditions
              </p>
            </form>
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
                Your Work Hub Awaits
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Access your worker dashboard to manage tasks, track progress & collaborate with your team. Streamline your workflow today.
              </p>
            </motion.div>

            {/* Decorative stats placeholder */}
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

export default PropertyOwnerLogin;