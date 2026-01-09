import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaSearch,
  FaFilter,FaTimes ,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaHome,
  FaCheckCircle ,FaEye ,  FaCalendarAlt ,FaBuilding,FaChevronDown,FaSlidersH,FaSort,FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const SellerProperty = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [images, setImages] = useState({});
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [propertyType, setPropertyType] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("sellertoken");
        if (!token) return;

        // Fetch properties
        const propRes = await axios.get(`${baseurl}api/seller/getproperties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (propRes.data && Array.isArray(propRes.data.properties)) {
          setProperties(propRes.data.properties);
        } else {
          setProperties([]);
        }

        // Fetch subscription
        const subRes = await axios.get(`${baseurl}api/seller/subscription/my-subscription`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (subRes.data && subRes.data.success) {
          setSubscription(subRes.data.data);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setProperties([]);
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (properties.length > 0 && !loadingSubscription) {
      const token = localStorage.getItem("sellertoken");
      if (!token) return;

      const fetchAllImages = async () => {
        const imagesMap = new Map();
        await Promise.all(
          properties.map(async (prop) => {
            if (prop._id) {
              try {
                const imgRes = await axios.get(
                  `${baseurl}api/seller/get-image/${prop._id}/images`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (imgRes.data.success && imgRes.data.images) {
                  const validImages = imgRes.data.images.filter(
                    (img) => img && img !== "/uploads/properties/undefined"
                  );
                  imagesMap.set(prop._id, validImages);
                } else {
                  imagesMap.set(prop._id, []);
                }
              } catch (err) {
                console.error(`Error fetching images for ${prop._id}:`, err);
                imagesMap.set(prop._id, []);
              }
            }
          })
        );
        setImages(Object.fromEntries(imagesMap));
      };

      fetchAllImages();
    }
  }, [properties, loadingSubscription]);

  const handleAddProperty = () => {
    if (loadingSubscription) {
      // Optionally show a loading toast or wait
      return;
    }

    if (!subscription || !subscription.isActive) {
      navigate("/seller/subscription");
      return;
    }

    if (properties.length >= subscription.propertyLimit) {
      setShowLimitModal(true);
      return;
    }

    // Navigate to add property page (adjust path as needed)
    navigate("/seller/add-property");
  };

  const handleSubscribeNow = () => {
    setShowLimitModal(false);
    navigate("/seller/subscription");
  };

  const handleCloseModal = () => {
    setShowLimitModal(false);
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name?.toLowerCase().includes(search.toLowerCase()) ||
      prop.address?.toLowerCase().includes(search.toLowerCase()) ||
      prop.city?.toLowerCase().includes(search.toLowerCase());

    // If price is not present, always show (or you can skip)
    const price = prop.price || 0;
    const matchesPrice = price >= minPrice && price <= maxPrice;

    const matchesType =
      !propertyType || prop.type?.toLowerCase() === propertyType.toLowerCase();

    return matchesSearch && matchesPrice && matchesType;
  });

  const PropertyCarousel = ({ propertyId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const propertyImages = images[propertyId] || [];
    const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

    if (propertyImages.length === 0) {
      return (
        <img
          src={placeholderImage}
          alt="No Image"
          className="h-full w-full object-cover rounded-t-[16px]"
        />
      );
    }

    const currentImage = propertyImages[currentIndex] ? `${baseurl}${propertyImages[currentIndex]}` : placeholderImage;

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    };

    return (
      <div className="relative h-48 overflow-hidden rounded-t-[16px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`Property image ${currentIndex + 1}`}
            className="absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        </AnimatePresence>

        {propertyImages.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              <FaArrowRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
              {propertyImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // return (
  //   <div className="pt-24 px-4 md:px-8 bg-gray-100 min-h-screen">
  //     <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#333]]">
  //       Available Properties
  //     </h2>

  //     {/* Add Property Button */}
  //     <div className="flex justify-end mb-4">
  //       <motion.button
  //         onClick={handleAddProperty}
  //         whileHover={{ scale: 1.05 }}
  //         whileTap={{ scale: 0.95 }}
  //         disabled={loadingSubscription}
  //         className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 ${
  //           loadingSubscription
  //             ? "bg-gray-400 cursor-not-allowed"
  //             : "bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] hover:shadow-xl"
  //         }`}
  //       >
  //         <FaPlus className="w-4 h-4" />
  //         Add New Property
  //       </motion.button>
  //     </div>

  //     <div className="grid md:grid-cols-4 gap-6">
  //       {/* Sidebar Filter */}
  //       <div className="bg-white p-4 md:p-5 shadow rounded-lg h-fit sticky top-24 border border-gray-200">
  //         <h3 className="text-lg font-semibold mb-4 md:mb-5 flex items-center gap-2">
  //           <FaFilter className="text-[#5c4eff]" /> Filter Properties
  //         </h3>

  //         {/* Search */}
  //         <div className="mb-4">
  //           <label className="block text-sm font-medium text-gray-700">Search</label>
  //           <div className="flex items-center gap-2 mt-1 border border-gray-300 rounded-lg px-2 focus-within:border-[#5c4eff]">
  //             <FaSearch className="text-gray-400" />
  //             <input
  //               type="text"
  //               value={search}
  //               onChange={(e) => setSearch(e.target.value)}
  //               placeholder="Name, Address, City"
  //               className="w-full p-2 outline-none text-gray-800"
  //             />
  //           </div>
  //         </div>

  //         {/* Property Type */}
  //         <div className="mb-4">
  //           <label className="block text-sm font-medium text-gray-700">Property Type</label>
  //           <select
  //             value={propertyType}
  //             onChange={(e) => setPropertyType(e.target.value)}
  //             className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:border-[#5c4eff] outline-none"
  //           >
  //             <option value="">Select Property Type</option>
  //             <option value="PG">PG</option>
  //             <option value="Flat">Flat</option>
  //             <option value="Hostel">Hostel</option>
  //           </select>
  //         </div>

  //         {/* Min Price */}
  //       </div>

  //       {/* Property Cards */}
  //       <div className="md:col-span-3 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
  //         {filteredProperties.length > 0 ? (
  //           filteredProperties.map((prop, index) => (
  //             <div
  //               key={prop._id || index}
  //               className="bg-white border border-gray-200 rounded-[16px] overflow-hidden shadow-lg hover:shadow-xl transition duration-300 w-full max-w-[700px] transform hover:-translate-y-1"
  //             >
  //               {/* Image Carousel */}
  //               <div className="relative h-48">
  //                 <PropertyCarousel propertyId={prop._id} />
  //                 <span className="absolute top-4 left-4 bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] text-white text-sm px-3 py-1 rounded-full font-semibold shadow-md">
  //                   For Sale
  //                 </span>
  //               </div>

  //               {/* Content */}
  //               <div className="p-6">
                 

  //                 <h3 className="text-2xl font-semibold text-gray-800 mt-1 mb-2">
  //                   {prop.name || "Untitled Property"}
  //                 </h3>

  //                 <p className="text-sm text-gray-500 mb-4">
  //                   {prop.address || "Location not specified"}
  //                 </p>

  //                 {/* Details */}
  //                 <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-3 mb-5">
  //                   <div className="flex items-center gap-2 hover:scale-110 transition transform">
  //                     <FaBed className="text-[#5c4eff] text-lg" /> {prop.totalBeds || 0} Beds
  //                   </div>
  //                   <div className="flex items-center gap-2 hover:scale-110 transition transform">
  //                     <FaBath className="text-[#5c4eff] text-lg" /> {prop.totalRooms || 0} Rooms
  //                   </div>
  //                   <div className="flex items-center gap-2 hover:scale-110 transition transform">
  //                     <FaRulerCombined className="text-[#5c4eff] text-lg" /> {prop.totalCapacity || "-"} Capacity
  //                   </div>
  //                 </div>

  //                 {/* Button */}
  //                 <Link
  //                   to={`/seller/property/${prop._id || index}`}
  //                   className="block text-center bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] text-white py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#4a3de6] hover:to-[#7a6bff] transition-all duration-300 hover:scale-105 font-semibold"
  //                 >
  //                   View Details
  //                 </Link>
  //               </div>
  //             </div>
  //           ))
  //         ) : (
  //           <p className="text-gray-500 col-span-full text-center">No properties match your filters.</p>
  //         )}
  //       </div>
  //     </div>

  //     {/* Limit Reached Modal */}
  //     <AnimatePresence>
  //       {showLimitModal && (
  //         <motion.div
  //           initial={{ opacity: 0 }}
  //           animate={{ opacity: 1 }}
  //           exit={{ opacity: 0 }}
  //           className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  //         >
  //           <motion.div
  //             initial={{ scale: 0.95, opacity: 0 }}
  //             animate={{ scale: 1, opacity: 1 }}
  //             exit={{ scale: 0.95, opacity: 0 }}
  //             className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
  //           >
  //             <div className="flex items-center gap-3 mb-4">
  //               <FaExclamationTriangle className="text-yellow-500 w-5 h-5" />
  //               <h3 className="text-lg font-bold text-gray-800">Property Limit Reached!</h3>
  //             </div>
  //             <p className="text-gray-600 mb-6">
  //               You have reached your current subscription limit of {subscription?.propertyLimit || 0} properties. To add more properties, please subscribe to a higher plan.
  //             </p>
  //             <div className="flex gap-3">
  //               <button
  //                 onClick={handleCloseModal}
  //                 className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
  //               >
  //                 Cancel
  //               </button>
  //               <button
  //                 onClick={handleSubscribeNow}
  //                 className="flex-1 py-2 px-4 bg-gradient-to-r from-[#5c4eff] to-[#8b7bff] text-white rounded-lg hover:from-[#4a3de6] hover:to-[#7a6bff] transition font-semibold"
  //               >
  //                 Subscribe Now
  //               </button>
  //             </div>
  //           </motion.div>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </div>
  // );


return (
  <div className="pt-6 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
    {/* PAGE HEADER - Enhanced */}
    <div className="mb-10 bg-gradient-to-r from-white to-orange-50 rounded-3xl p-8 border border-orange-100 shadow-md relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full -translate-y-20 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100/20 to-orange-100/10 rounded-full translate-y-10 -translate-x-10"></div>
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow">
              <FaHome className="text-white text-2xl" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Property Portfolio
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                {filteredProperties.length} Properties
              </span>
            </div>
            <p className="text-gray-600 font-medium">
              Manage, track, and showcase all your listed properties in one dashboard
            </p>
          </div>
        </div>

        {/* Add Property Button - Enhanced */}
        <motion.button
          onClick={handleAddProperty}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          disabled={loadingSubscription}
          className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold shadow-xl transition-all duration-300 overflow-hidden ${
            loadingSubscription
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700"
          }`}
        >
          {/* Button background effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FaPlus className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">
              {loadingSubscription ? "Checking..." : "Add Property"}
            </span>
          </div>
        </motion.button>
      </div>

    
    </div>

    <div className="grid lg:grid-cols-4 gap-8">
      {/* FILTER SIDEBAR - Enhanced */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
              <FaFilter className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-500">Refine your search</p>
            </div>
          </div>

          {/* Search - Enhanced */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FaSearch className="text-orange-500" />
                Search Properties
              </span>
            </label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                <FaSearch className="text-gray-400 text-lg" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, address, or city..."
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Property Type - Enhanced */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FaBuilding className="text-orange-500" />
                Property Type
              </span>
            </label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="relative w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
              >
                <option value="" className="text-gray-400">All Property Types</option>
                <option value="PG" className="text-gray-700">PG / Hostel</option>
                <option value="Flat" className="text-gray-700">Flat / Apartment</option>
                <option value="Hostel" className="text-gray-700">Hostel</option>
                <option value="Villa" className="text-gray-700">Villa</option>
                <option value="House" className="text-gray-700">House</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <FaChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Additional Filters Section */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaSlidersH className="text-gray-400" />
              More Filters
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Beds</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      className="px-3 py-2 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-sm transition-colors"
                    >
                      {num}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          {(search || propertyType) && (
            <button
              onClick={() => {
                setSearch("");
                setPropertyType("");
              }}
              className="w-full mt-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 transition-all duration-300 border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2 group"
            >
              <FaTimes className="text-gray-500 group-hover:text-gray-700 transition-colors" />
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* PROPERTY CARDS - Enhanced */}
      <div className="lg:col-span-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">All Properties</h3>
            <p className="text-gray-600">{filteredProperties.length} properties found</p>
          </div>
          
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((prop, index) => (
              <motion.div
                key={prop._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
              >
                {/* Image Carousel - Enhanced */}
                <div className="relative h-56 overflow-hidden">
                  <PropertyCarousel propertyId={prop._id} />
                  
                  {/* Property Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      {prop.isVerified ? "Verified" : "Active"}
                    </span>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Quick Actions on hover */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md">
                      <FaHeart className="text-gray-600 text-sm" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md">
                      <FaShareAlt className="text-gray-600 text-sm" />
                    </button>
                  </div>
                </div>

                {/* Content - Enhanced */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {prop.name || "Untitled Property"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <FaMapMarkerAlt className="text-gray-400 text-sm" />
                        <p className="text-sm text-gray-500 truncate">
                          {prop.address || "Location not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">₹{prop.price || "0"}</p>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>
                  </div>

                  {/* Property Details - Enhanced */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
                        <FaBed className="text-orange-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{prop.totalBeds || 0}</p>
                      <p className="text-xs text-gray-500">Beds</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                        <FaBath className="text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{prop.totalRooms || 0}</p>
                      <p className="text-xs text-gray-500">Rooms</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                        <FaUsers className="text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{prop.totalCapacity || "-"}</p>
                      <p className="text-xs text-gray-500">Capacity</p>
                    </div>
                  </div>

                  {/* Action Button - Enhanced */}
                  <Link
                    to={`/seller/property/${prop._id || index}`}
                    className="group/btn mt-6 block text-center py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-amber-50 text-gray-700 hover:text-orange-700 border border-gray-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>View Details</span>
                    <FaArrowRight className="text-gray-400 group-hover/btn:text-orange-500 transform group-hover/btn:translate-x-1 transition-all" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 text-center border border-gray-200 shadow-lg">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
              <FaSearch className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any properties matching your current filters. Try adjusting your search criteria or add a new property.
            </p>
            <button
              onClick={handleAddProperty}
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 inline-flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Your First Property
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);


};

export default SellerProperty;