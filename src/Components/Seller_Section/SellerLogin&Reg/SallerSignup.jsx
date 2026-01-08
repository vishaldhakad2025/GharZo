import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import baseurl from "../../../../BaseUrl.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import seller from "../../../assets/Images/seller.jpg";
import logo from "../../../assets/logo/logo.png";

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const mobileFromLogin = location.state?.mobile || "";

  const [form, setForm] = useState({
    name: "",
    mobile: mobileFromLogin,
    email: "",
    address: "",
    profileImage: null,
  });

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      setForm((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, email: value }));
    setEmailVerified(false);
    setShowCodeInput(false);
    setVerificationCode("");
  };

  // Send Email Verification
  const sendVerification = async () => {
    const emailRegex = /^[A-Za-z0-9]+@gmail\.com$/;
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Email must be a valid Gmail address (e.g., user@gmail.com)");
      return;
    }
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/organization/send-verification",
        { email: form.email.trim() },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setShowCodeInput(true);
        toast.success(res.data.message);
      } else {
        toast.error("Failed to send verification email");
      }
    } catch (error) {
      console.error("Send verification error:", error);
      toast.error(error.response?.data?.message || "Error sending verification email");
    }
  };

  // Verify Email Code
  const verifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Valid 6-digit code is required");
      return;
    }
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/organization/verify-email",
        { email: form.email.trim(), code: verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setEmailVerified(true);
        setShowCodeInput(false);
        setVerificationCode("");
        toast.success(res.data.message);
      } else {
        toast.error("Failed to verify email");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      toast.error(error.response?.data?.message || "Error verifying email");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Email verification check
    if (!emailVerified) {
      toast.error("Email verification is required");
      return;
    }

    // Full Name: at least two words, only letters
    const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!fullNameRegex.test(form.name.trim())) {
      toast.error("Enter your full name (first and last name, letters only)");
      return;
    }

    // Email: must contain @gmail.com, only letters/numbers before @
    const emailRegex = /^[A-Za-z0-9]+@gmail\.com$/;
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Email must be a valid Gmail address (e.g., user@gmail.com)");
      return;
    }

    // Mobile: 10 digits only
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    // Address: must contain both letters and numbers
    const addressRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9\s,.-]+$/;
    if (!form.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!addressRegex.test(form.address.trim())) {
      toast.error("Address must contain both letters and numbers");
      return;
    }

    if (!form.profileImage) {
      toast.error("Please upload a profile image");
      return;
    }

    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("mobile", form.mobile);
    formData.append("email", form.email);
    formData.append("address", form.address);
    formData.append("profileImage", form.profileImage);

    try {
      const response = await axios.post(`${baseurl}api/seller/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, token, seller } = response.data;
      if (success) {
        localStorage.setItem("sellertoken", token);
        localStorage.setItem("role", "seller");
        toast.success("Registration successful!");
        navigate("/seller");
      } else {
        toast.error("Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error while registering");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="relative w-full max-w-6xl min-h-[700px] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

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

        {/* LEFT SIDE - Beautiful image background */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block lg:w-[48%] relative overflow-hidden"
        >
          {/* Background image with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${seller})`,
            }}
          >
            {/* Gradient overlay for depth and text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-cyan-900/20 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          </div>

          {/* Content overlay on image */}
          <div className="relative h-full flex flex-col justify-center p-10 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-xl"
            >
              <div className="mb-10"> 
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Start Selling Today
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Join thousands of successful sellers. Register now to reach more customers and grow your business effortlessly.
              </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT SIDE - Registration Form */}
       <div className="w-full lg:w-[52%] bg-white relative overflow-y-auto flex items-center justify-center  sm:p-8 lg:p-5">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="lg:hidden mb-6 text-center">
              <img 
                src={logo} 
                alt="GharZo" 
                className="h-12 w-auto object-contain mx-auto" 
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Seller Registration
              </h2>
              <p className="text-slate-600 text-sm">
                Create your account to start selling
              </p>
            </motion.div>

            <form onSubmit={handleSignup} className="space-y-4" encType="multipart/form-data">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-slate-100 rounded-l-xl border border-r-0 border-slate-300 text-slate-700 font-semibold select-none">
                    +91
                  </span>
                  <input
                    name="mobile"
                    placeholder="10-digit mobile number"
                    value={form.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^\+?91/, '').replace(/\D/g, '').slice(0, 10);
                      setForm((prev) => ({ ...prev, mobile: val }));
                    }}
                    maxLength="10"
                    className="w-full px-4 py-3 border border-slate-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your Gmail address"
                  value={form.email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </motion.div>

              {/* Email Verification */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                {!emailVerified ? (
                  <div className="space-y-2">
                    {!showCodeInput ? (
                      <button
                        type="button"
                        onClick={sendVerification}
                        disabled={!form.email || !/^[A-Za-z0-9]+@gmail\.com$/.test(form.email.trim())}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                      >
                        Send Verification Code
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={verifyEmail}
                          disabled={verificationCode.length !== 6}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center justify-between">
                    <span className="font-medium">✓ Email Verified</span>
                    <span className="text-xs text-green-600">({form.email})</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address
                </label>
                <input
                  name="address"
                  placeholder="Enter your complete address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                  required
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={!emailVerified}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all mt-6"
              >
                Register Now
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-sm text-center text-slate-600"
            >
              Already have an account?{" "}
              <button
                onClick={() => navigate("/seller_login", { state: { mobile: form.mobile } })}
                className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
              >
                Login here
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Signup;