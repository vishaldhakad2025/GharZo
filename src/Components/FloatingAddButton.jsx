import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingAddButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  // Property related icons
  const icons = [
    // Home icon
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />,
    // Plus icon
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />,
    // Building icon
    <path
     strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />,
    // Key icon
    <path
     strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  ];

  // Change icon every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-[1000] cursor-pointer"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative group">
          {/* Main Button Circle - Expands on hover */}
          <motion.div 
            className="relative h-20 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center"
            animate={{
              width: isHovered ? '240px' : '80px',
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            {/* "Add Property" text that slides in - LEFT SIDE */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ 
                    opacity: 0,
                    x: 20
                  }}
                  animate={{ 
                    opacity: 1,
                    x: 0
                  }}
                  exit={{ 
                    opacity: 0,
                    x: 20
                  }}
                  transition={{ 
                    duration: 0.2,
                    delay: 0.1
                  }}
                  className="absolute left-4 text-white text-sm font-bold whitespace-nowrap"
                >
                  Add Property
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rotating Property Icons - RIGHT SIDE */}
            <motion.div
              className="absolute"
              animate={{
                right: isHovered ? '16px' : '50%',
                x: isHovered ? '0%' : '50%',
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              <motion.svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                key={currentIconIndex}
                initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {icons[currentIconIndex]}
              </motion.svg>
            </motion.div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          </motion.div>
        </div>

        {/* Pulse Ring Effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-orange-400/40"
          animate={{
            scale: [1, 1.45, 1],
            opacity: [0.5, 0.1, 0.5],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0c2344] to-[#0b4f91] text-white p-6 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-2xl font-bold">Add New Property</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-orange-300 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Looking For *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Select Purpose</option>
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Select Property Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input 
                    type="text" 
                    placeholder="Enter location"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input 
                      type="number" 
                      placeholder="Enter price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft) *</label>
                    <input 
                      type="number" 
                      placeholder="Enter area"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input 
                      type="number" 
                      placeholder="Number of bedrooms"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input 
                      type="number" 
                      placeholder="Number of bathrooms"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter property description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/40 transition-all"
                  >
                    Submit Property
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAddButton;