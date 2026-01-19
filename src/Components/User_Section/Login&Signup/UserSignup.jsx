import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo/logo.png";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
// UI UPDATED: Import the real estate image
import signupImage from "../../../assets/Images/Signup.png";
import baseurl from "../../../../BaseUrl.js";

function UserSignup() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const phoneFromLogin = location.state?.phone || "";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Dialog state (kept but not used for email anymore)
  const [dialog, setDialog] = useState({ open: false, title: "", message: "", type: "info" });

  // Regex definitions
  const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const phoneRegex = /^\d{10}$/;
  const ageRegex = /^\d{2}$/;
  const cityRegex = /^[A-Za-z\s]+$/;
  const postalCodeRegex = /^\d{6}$/;

  const validateField = (key, value, isRealTime = false) => {
    const trimmed = (typeof value === 'string' ? value.trim() : value);
    if (!trimmed) {
      return isRealTime ? "" : `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }

    switch (key) {
      case "fullName":
        if (!fullNameRegex.test(trimmed)) {
          return "Enter your full name (first and last name, letters only)";
        }
        break;
      case "email":
        if (!emailRegex.test(trimmed)) {
          return "Email must be a valid Gmail address (e.g., user@gmail.com)";
        }
        break;
      case "phone":
        if (!phoneRegex.test(trimmed)) {
          return "Phone number must be exactly 10 digits";
        }
        break;
      case "age":
        const ageNum = parseInt(trimmed, 10);
        if (!ageRegex.test(trimmed) || ageNum < 13 || ageNum > 99) {
          return "Age must be a valid 2-digit number (13-99)";
        }
        break;
      case "gender":
        return "";
      case "city":
        if (!cityRegex.test(trimmed)) {
          return "City must contain only letters";
        }
        break;
      case "state":
        if (!cityRegex.test(trimmed)) {
          return "State must contain only letters";
        }
        break;
      case "postalCode":
        if (!postalCodeRegex.test(trimmed)) {
          return "Postal code must be exactly 6 digits";
        }
        break;
      case "country":
        if (!cityRegex.test(trimmed)) {
          return "Country must contain only letters";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.fullName = validateField("fullName", form.fullName, false);
    newErrors.email = validateField("email", form.email, false);
    newErrors.phone = validateField("phone", form.phone, false);
    newErrors.age = validateField("age", form.age, false);
    newErrors.gender = validateField("gender", form.gender, false);
    newErrors.street = validateField("street", form.address.street, false);
    newErrors.city = validateField("city", form.address.city, false);
    newErrors.state = validateField("state", form.address.state, false);
    newErrors.postalCode = validateField("postalCode", form.address.postalCode, false);
    newErrors.country = validateField("country", form.address.country, false);

    setFieldErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  const handleFullNameChange = (e) => {
    let value = e.target.value.replace(/[^A-Za-z ]/g, '');
    setForm((prev) => ({ ...prev, fullName: value }));
    setError("");
    const errorMsg = validateField("fullName", value, true);
    setFieldErrors((prev) => ({ ...prev, fullName: errorMsg }));
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, email: value }));
    setError("");
    const errorMsg = validateField("email", value, true);
    setFieldErrors((prev) => ({ ...prev, email: errorMsg }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/^\+?91/, '').replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: numericValue }));
    setError("");
    const errorMsg = validateField("phone", numericValue, true);
    setFieldErrors((prev) => ({ ...prev, phone: errorMsg }));
  };

  const handleAgeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setForm((prev) => ({ ...prev, age: value }));
    setError("");
    const errorMsg = validateField("age", value, true);
    setFieldErrors((prev) => ({ ...prev, age: errorMsg }));
  };

  const handleGenderChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, gender: value }));
    setError("");
    const errorMsg = validateField("gender", value, true);
    setFieldErrors((prev) => ({ ...prev, gender: errorMsg }));
  };

  const handleStreetChange = (e) => {
    let value = e.target.value.replace(/[^A-Za-z0-9\s,.-]/g, '');
    setForm((prev) => ({ ...prev, address: { ...prev.address, street: value } }));
    setError("");
    const errorMsg = validateField("street", value, true);
    setFieldErrors((prev) => ({ ...prev, street: errorMsg }));
  };

  const handleCityChange = (e) => {
    let value = e.target.value.replace(/[^A-Za-z ]/g, '');
    setForm((prev) => ({ ...prev, address: { ...prev.address, city: value } }));
    setError("");
    const errorMsg = validateField("city", value, true);
    setFieldErrors((prev) => ({ ...prev, city: errorMsg }));
  };

  const handleStateChange = (e) => {
    let value = e.target.value.replace(/[^A-Za-z ]/g, '');
    setForm((prev) => ({ ...prev, address: { ...prev.address, state: value } }));
    setError("");
    const errorMsg = validateField("state", value, true);
    setFieldErrors((prev) => ({ ...prev, state: errorMsg }));
  };

  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setForm((prev) => ({ ...prev, address: { ...prev.address, postalCode: numericValue } }));
    setError("");
    const errorMsg = validateField("postalCode", numericValue, true);
    setFieldErrors((prev) => ({ ...prev, postalCode: errorMsg }));
  };

  const handleCountryChange = (e) => {
    let value = e.target.value.replace(/[^A-Za-z ]/g, '');
    setForm((prev) => ({ ...prev, address: { ...prev.address, country: value } }));
    setError("");
    const errorMsg = validateField("country", value, true);
    setFieldErrors((prev) => ({ ...prev, country: errorMsg }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fix the errors below and try again.");
      return;
    }

    try {
      const res = await axios.post(
        `${baseurl}api/auth/user/register`,
        {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\D/g, ''),
          age: parseInt(form.age) || 0,
          gender: form.gender || "",
          address: {
            street: form.address.street.trim(),
            city: form.address.city.trim(),
            state: form.address.state.trim(),
            postalCode: form.address.postalCode.trim(),
            country: form.address.country.trim(),
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200 || res.status === 201) {
        const { token, role } = res.data;
        login({ ...form, isRegistered: true, role });
        if (token) localStorage.setItem("usertoken", token);
        localStorage.setItem("role", role || "user");
        toast.success("Registration successful! Redirecting...");
        setTimeout(() => navigate("/user"), 1500);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error details:", error);
      setError(
        error.message === "Network Error"
          ? "Network error. Check if the server is running."
          : error.response?.data?.message || "Error while registering. Check server status."
      );
    }
  };

  // Check if form is submittable (removed email verification condition)
  const hasErrors = Object.values(fieldErrors).some(err => err);

  return (
    <>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          className: 'backdrop-blur-xl bg-white/95 shadow-2xl rounded-2xl border border-cyan-200/50',
          style: {
            padding: '16px',
          },
        }}
      />
      
      <AnimatePresence>
        {dialog.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    dialog.type === "success" ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  <span className={`text-3xl ${dialog.type === "success" ? "text-green-600" : "text-blue-600"}`}>
                    {dialog.type === "success" ? "✓" : "ℹ"}
                  </span>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{dialog.title}</h3>
                <p className="text-gray-600 mb-6">{dialog.message}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDialog({ ...dialog, open: false })}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-300"
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex flex-col lg:flex-row">
              
              {/* Left Side - Image Panel (unchanged) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:w-2/5 relative overflow-hidden min-h-[300px] lg:min-h-[800px]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${signupImage})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-cyan-900/60 to-blue-900/70"></div>
                </div>

                <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-white rounded-xl p-2 shadow-lg">
                        <img src={logo} alt="GharZo Logo" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">GharZo</h1>
                        <p className="text-blue-300 text-xs">Find Your Perfect Home</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                      Start Your Journey to<br />
                      <span className="text-blue-300">Your Dream Home</span>
                    </h2>
                    <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                      Join thousands of happy residents who found their perfect rental property with us.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {['Verified Properties', 'Secure Platform', 'Best Prices'].map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-sm font-medium"
                        >
                          ✓ {feature}
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-8 flex items-center gap-6"
                    >
                      <div>
                        <div className="text-3xl font-bold text-white">10K+</div>
                        <div className="text-cyan-200 text-sm">Happy Users</div>
                      </div>
                      <div className="w-px h-12 bg-white/30"></div>
                      <div>
                        <div className="text-3xl font-bold text-white">5K+</div>
                        <div className="text-cyan-200 text-sm">Properties</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Side - Form Panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:w-3/5 p-6 sm:p-10 overflow-y-auto max-h-[90vh]"
              >
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Fill in your details to get started with GharZo
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">⚠</span>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
                
                <form onSubmit={handleSignup} className="space-y-6">
                  
                  {/* Section 1 - Personal Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="fullName"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={handleFullNameChange}
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          fieldErrors.fullName
                            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        }`}
                      />
                      {fieldErrors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                        >
                          <span>⚠</span>
                          {fieldErrors.fullName}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Age <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="age"
                          placeholder="Your age"
                          value={form.age}
                          onChange={handleAgeChange}
                          min="13"
                          max="99"
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.age
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        />
                        {fieldErrors.age && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.age}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleGenderChange}
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.gender
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {fieldErrors.gender && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.gender}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Section 2 - Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="yourname@gmail.com"
                          value={form.email}
                          onChange={handleEmailChange}
                          required
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.email
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        />
                        {fieldErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.email}
                          </motion.p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Gmail addresses only</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 bg-gray-200 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-700 font-semibold text-sm">
                            +91
                          </span>
                          <input
                            name="phone"
                            type="tel"
                            placeholder="10-digit number"
                            value={form.phone}
                            onChange={handlePhoneChange}
                            maxLength="10"
                            className={`flex-1 px-4 py-3 bg-gray-50 border-2 rounded-r-xl focus:outline-none transition-all duration-300 ${
                              fieldErrors.phone
                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                            }`}
                          />
                        </div>
                        {fieldErrors.phone && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.phone}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Section 3 - Address Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        3
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Address Details</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="address.street"
                        placeholder="House no., Building, Street"
                        value={form.address.street}
                        onChange={handleStreetChange}
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          fieldErrors.street
                            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        }`}
                      />
                      {fieldErrors.street && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                        >
                          <span>⚠</span>
                          {fieldErrors.street}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="address.city"
                          placeholder="Your city"
                          value={form.address.city}
                          onChange={handleCityChange}
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.city
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        />
                        {fieldErrors.city && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.city}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="address.state"
                          placeholder="Your state"
                          value={form.address.state}
                          onChange={handleStateChange}
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.state
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        />
                        {fieldErrors.state && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.state}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="address.postalCode"
                          type="text"
                          placeholder="6-digit PIN"
                          value={form.address.postalCode}
                          onChange={handlePostalCodeChange}
                          maxLength="6"
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.postalCode
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        />
                        {fieldErrors.postalCode && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.postalCode}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="address.country"
                          placeholder="Your country"
                          value={form.address.country}
                          onChange={handleCountryChange}
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            fieldErrors.country
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                          }`}
                        />
                        {fieldErrors.country && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-600 text-xs mt-1.5 flex items-center gap-1"
                          >
                            <span>⚠</span>
                            {fieldErrors.country}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <motion.button
                    whileHover={!hasErrors ? { scale: 1.01, y: -2 } : {}}
                    whileTap={!hasErrors ? { scale: 0.99 } : {}}
                    type="submit"
                    disabled={hasErrors}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 mt-6 ${
                      hasErrors
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60"
                    }`}
                  >
                    {hasErrors
                      ? "⚠ Fix errors to continue"
                      : "🎉 Complete Registration"}
                  </motion.button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    By registering, you agree to our{" "}
                    <button className="text-cyan-600 hover:text-cyan-700 underline">
                      Terms & Conditions
                    </button>
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default UserSignup;