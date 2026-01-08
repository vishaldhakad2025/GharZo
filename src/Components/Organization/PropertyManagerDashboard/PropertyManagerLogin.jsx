import React, { useState } from "react";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupbg from "../../../assets/Images/signupbg.jpg";

function PropertyManagerLogin() {
  const navigate = useNavigate();
  const [useremail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Particles init
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Handle Submit with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!useremail || !password) {
      toast.error("Please fill in both email and password.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!validateEmail(useremail)) {
      toast.error("Please enter a valid email address.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch("https://api.gharzoreality.com/api/property-managers/login", {
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
          
          localStorage.setItem("token", token);
          localStorage.setItem("propertyManager", JSON.stringify(data));
          
          toast.success("Login successful!", {
            position: "top-right",
            autoClose: 2000,
          });
          
          console.log("Redirecting to dashboard...");
          navigate("/property-manager/dashboard");
        } else {
          toast.error(result.message || "Login failed. Please check your credentials.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Login failed. Server error.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
      <ToastContainer />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${signupbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
        }}
      ></div>

      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#00000050" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
          particles: {
            color: { value: "#5C4EFF" },
            links: {
              color: "#5C4EFF",
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            move: { enable: true, speed: 1.5 },
            number: { value: 50 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 -z-10"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative z-10"
      >
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 1 }}
          className="flex justify-center mb-4"
        >
          <FaUserCircle className="text-7xl text-[#5C4EFF] drop-shadow-lg" />
        </motion.div>

        <h2 className="text-2xl font-bold text-center text-[#5C4EFF] mb-6">
          Login as <span className="text-green-700">Property Manager</span>
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-700 mb-1">User Email</label>
          <input
            type="email"
            placeholder="Enter user email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#5C4EFF]"
            value={useremail}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#5C4EFF]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#5C4EFF] transition"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 hover:from-blue-600 hover:via-cyan-500 hover:to-green-500 text-white py-2 rounded-lg shadow-lg"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleCancel}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg shadow-lg"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default PropertyManagerLogin;