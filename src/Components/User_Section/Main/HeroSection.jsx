import { FaAngleDown } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaMapMarkerAlt, FaHome, FaBuilding, 
  FaWarehouse, FaTimes, FaUserAlt, FaUserTie, FaTools 
} from "react-icons/fa";

const HeroSection = () => {
  // States
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Rent");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const heroImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80",
  ];

  // Categories as per Video
  const categories = [
    { id: "Buy", label: "Buy", icon: FaHome },
    { id: "Rent", label: "Rent", icon: FaBuilding },
    { id: "PG", label: "PG", icon: FaUserAlt },
    { id: "Plot", label: "Plot", icon: FaWarehouse },
    { id: "Commercial", label: "Commercial", icon: FaBuilding },
  ];

  // Dynamic Options for Dropdowns - Updated with new property types
  const propertyTypes = [
    "Buy",
    "Rent", 
    "PG",
    "Plot",
    "Commercial",
    "Hostel",
    "Hotel",
    "Banquet"
  ];

  // Background Slider Logic
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, heroImages.length]);

  return (
    <section className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[65vh] flex items-center justify-center text-white overflow-hidden hero-section pt-16 sm:pt-10 pb-8">
      
      {/* Clean Background Slider - No Effects */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageIndex}
            src={heroImages[currentImageIndex]}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        
        {/* Simple Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-30 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        
        {/* Title Section - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-cyan-100 to-orange-200 bg-clip-text text-transparent drop-shadow-lg">
            Welcome to GharZo
          </motion.h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 px-4">
            Your one-stop solution to rent, buy, and sell property
          </p>
        </motion.div>

        {/* Enhanced Dynamic Search Bar Container - Fully Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/25 shadow-2xl"
        >
          
          {/* Top Nav with "Post Property" - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4 border-b border-white/20 pb-4">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide w-full sm:w-auto pb-2 sm:pb-0">
<h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
  Find Your Perfect <span className="text-orange-400">Property</span>
</h1>
            </div>

            {/* Highlighted Post Property Button - Mobile Optimized */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-gradient-to-r from-orange-600 to-orange-600 hover:from-white/25 hover:to-orange-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/30 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Add Property
              </span>
              <motion.span 
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-orange-300 font-bold"
              >
                FREE
              </motion.span>
            </button>
          </div>

          {/* Search Inputs - Fully Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
            
            {/* Location Input - Mobile Friendly */}
            <div className="sm:col-span-2 lg:col-span-5 relative">
              <FaMapMarkerAlt className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-orange-400 text-sm sm:text-base z-10" />
              <input 
                type="text" 
                placeholder="Enter City, Locality..."
                className="w-full bg-white/20 border border-white/30 rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 outline-none focus:ring-2 ring-orange-500/50 focus:bg-white/25 transition-all text-white placeholder:text-white/60 text-sm sm:text-base backdrop-blur-sm"
              />
            </div>

            {/* Property Type Dropdown - Mobile Optimized */}
            <div className="sm:col-span-1 lg:col-span-3 relative">
              <select className="w-full bg-white/20 border border-white/30 rounded-xl py-3 sm:py-3.5 px-3 sm:px-4 outline-none appearance-none cursor-pointer text-white text-sm sm:text-base backdrop-blur-sm focus:ring-2 ring-orange-500/50 focus:bg-white/25 transition-all">
                <option className="text-black bg-white">Property Type</option>
                {propertyTypes.map(type => (
                  <option key={type} className="text-black bg-white">{type}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Budget Input - Mobile Friendly */}
            <div className="sm:col-span-1 lg:col-span-2">
              <input 
                type="text" 
                placeholder="Budget" 
                className="w-full bg-white/20 border border-white/30 rounded-xl py-3 sm:py-3.5 px-3 sm:px-4 outline-none text-white placeholder:text-white/60 text-sm sm:text-base backdrop-blur-sm focus:ring-2 ring-orange-500/50 focus:bg-white/25 transition-all"
              />
            </div>

            {/* Search Button - Full Width on Mobile */}
            <button className="sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base">
              <FaSearch className="text-sm sm:text-base" /> 
              <span>Search</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal - Post Property - Mobile Responsive */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 sm:p-8 text-center relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes size={20} className="sm:w-6 sm:h-6" />
                </button>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 pr-8">
                  Reach out to 15 Lac Buyers & Tenants
                </h2>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 font-medium">
                  Post your property in just 5 minutes!
                </p>
                
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {[
                    { label: "Owner", icon: FaUserAlt },
                    { label: "Agent", icon: FaUserTie },
                    { label: "Builder", icon: FaTools }
                  ].map((role) => (
                    <button 
                      key={role.label} 
                      className="group flex flex-col items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all active:scale-95"
                    >
                      <role.icon className="text-xl sm:text-2xl mb-1.5 sm:mb-2 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      <span className="text-xs sm:text-sm font-bold text-gray-700">{role.label}</span>
                    </button>
                  ))}
                </div>

                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95">
                  Continue to Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Indicator - Hidden on Mobile */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center items-start pt-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-white text-xs"
          >
            <FaAngleDown />
          </motion.div>
        </div>
      </motion.div>

    </section>
  );
};

export default HeroSection;