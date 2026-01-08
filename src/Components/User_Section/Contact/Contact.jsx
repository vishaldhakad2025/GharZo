import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Contact() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    message: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time validation on change after first touch
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "fullName" && !value.trim()) {
      error = "Full name is required";
    }
    if (name === "email") {
      if (!value.trim()) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email";
    }
    if (name === "phone") {
      const cleaned = value.replace(/\s/g, "");
      if (!value.trim()) error = "Phone number is required";
      else if (!/^\d{10}$/.test(cleaned)) error = "Must be a valid 10-digit number";
    }
    if (name === "message" && !value.trim()) {
      error = "Message is required";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: !formData.fullName.trim() ? "Full name is required" : "",
      email: !formData.email.trim()
        ? "Email is required"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ? "Enter a valid email"
        : "",
      phone: !formData.phone.trim()
        ? "Phone number is required"
        : !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))
        ? "Must be a valid 10-digit number"
        : "",
      message: !formData.message.trim() ? "Message is required" : "",
    };

    setErrors(newErrors);

    // Show toast only if any field is invalid
    const hasError = Object.values(newErrors).some((err) => err !== "");
    if (hasError) {
      const firstError = Object.values(newErrors).find((err) => err !== "");
      toast.error(firstError || "Please fill all fields correctly.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        className: "bg-red-500 text-white",
      });
    }

    return !hasError;
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      message: true,
    });

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.gharzoreality.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message sent successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          className: "bg-sky-500 text-white",
        });
        setFormData({ fullName: "", email: "", phone: "", message: "" });
        setErrors({});
        setTouched({});
      } else {
        toast.error("Failed to send message. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          className: "bg-red-500 text-white",
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center px-4 py-16 md:py-20"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/2175973016/photo/modern-luxury-home-exterior-at-sunset.webp?a=1&b=1&s=612x612&w=0&k=20&c=B2e-gEujpM7UNHX3uMHqvyh_bHC5sHFYfxf0ldEc6R0=')",
      }}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] backdrop-blur-sm"></div>
      
      <ToastContainer />
      
      {/* Main container with enhanced glassmorphism */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Contact Form */}
            <motion.div 
              data-aos="fade-right" 
              className="p-8 md:p-12 lg:p-14 bg-gradient-to-br from-white/5 to-transparent"
            >
              <div className="mb-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold mb-3 text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                >
                  Get In Touch
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-300 text-base"
                >
                  We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </motion.p>
              </div>

              <div className="space-y-5">
                {/* Full Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block mb-2 text-sm font-semibold text-slate-200 tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter Full Name"
                    className={`w-full px-5 py-3.5 rounded-xl bg-white/5 backdrop-blur-sm border-2 ${
                      errors.fullName ? "border-red-400/60" : "border-white/20"
                    } text-white placeholder-slate-400 focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all duration-300 shadow-lg shadow-black/10`}
                  />
                  {errors.fullName && touched.fullName && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {errors.fullName}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block mb-2 text-sm font-semibold text-slate-200 tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="name@gmail.com"
                    className={`w-full px-5 py-3.5 rounded-xl bg-white/5 backdrop-blur-sm border-2 ${
                      errors.email ? "border-red-400/60" : "border-white/20"
                    } text-white placeholder-slate-400 focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all duration-300 shadow-lg shadow-black/10`}
                  />
                  {errors.email && touched.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Phone */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block mb-2 text-sm font-semibold text-slate-200 tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    className={`w-full px-5 py-3.5 rounded-xl bg-white/5 backdrop-blur-sm border-2 ${
                      errors.phone ? "border-red-400/60" : "border-white/20"
                    } text-white placeholder-slate-400 focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all duration-300 shadow-lg shadow-black/10`}
                  />
                  {errors.phone && touched.phone && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {errors.phone}
                    </motion.p>
                  )}
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block mb-2 text-sm font-semibold text-slate-200 tracking-wide">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Tell us about your property needs..."
                    className={`w-full px-5 py-3.5 h-36 rounded-xl bg-white/5 backdrop-blur-sm border-2 ${
                      errors.message ? "border-red-400/60" : "border-white/20"
                    } text-white placeholder-slate-400 focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all duration-300 resize-none shadow-lg shadow-black/10`}
                  ></textarea>
                  {errors.message && touched.message && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {errors.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`w-full mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 px-8 py-4 rounded-xl text-white text-lg font-bold tracking-wide ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Right: Contact Info */}
            <motion.div 
              data-aos="fade-left" 
              className="p-8 md:p-12 lg:p-14 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent relative overflow-hidden"
            >
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold mb-4 text-white"
                >
                  Let's Connect
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-slate-300 mb-10 leading-relaxed"
                >
                  Whether you're looking to rent, buy, or just need advice — we're here to help you find your dream property.
                </motion.p>

                <div className="space-y-6">
                  {[
                    { icon: <MapPin className="w-6 h-6" />, text: "123 Gharzo Street, Indore, MP", label: "Visit Us" },
                    { icon: <Phone className="w-6 h-6" />, text: "+91 98765 43210", label: "Call Us" },
                    { icon: <Mail className="w-6 h-6" />, text: "support@Gharzo.com", label: "Email Us" },
                    { icon: <Clock className="w-6 h-6" />, text: "Mon - Sat: 9am – 7pm", label: "Working Hours" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ x: 8, transition: { duration: 0.2 } }}
                      className="group"
                    >
                      <div className="flex items-start gap-5 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-sky-400/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-500/20 text-sky-400 group-hover:from-sky-400/30 group-hover:to-blue-500/30 transition-all duration-300 shadow-lg shadow-sky-500/20">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {item.label}
                          </p>
                          <p className="text-white font-medium text-base break-words">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Additional trust element */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-400/20 backdrop-blur-sm"
                >
                  <p className="text-sm text-slate-300 text-center leading-relaxed">
                    <span className="text-sky-400 font-semibold">Trusted by 10,000+ clients</span> for exceptional real estate services and professional guidance.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;