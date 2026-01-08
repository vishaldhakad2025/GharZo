import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Home,
  MapPin,
  Building,
  BedDouble,
  Layers,
  Landmark,
  LocateFixed,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaRupeeSign, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import RoomOverview from "./RoomOverview";
import Tenant from "../Tenant/Tenant";
import TenantDues from "./TenantDues";
import Complaints from "./LandlordComplaints";
import PropertyReviews from "./PropertyReviews";
import PropertyExpenses from "./PropertyExpenses";

import baseurl from "../../../../BaseUrl";

const tabList = [
  "Details",
  "Rooms",
  "Tenant",
  "TenantDues",
  "Complaints",
  "PropertyReviews",
  "PropertyExpenses",
];

// 3D Icon Wrapper - GTharzo themed
const Icon3D = ({ children }) => (
  <motion.div
    className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl 
               bg-gradient-to-br from-[#003366] to-[#004999]
               shadow-[0_10px_30px_rgba(255,107,53,0.4)] border-2 border-[#FF6B35]/50"
    whileHover={{ y: -3, rotateX: 5, rotateY: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 18 }}
  >
    <div className="text-white text-2xl drop-shadow-lg">{children}</div>
  </motion.div>
);

// Detail item with 3D icon - GTharzo themed
const DetailItem = ({ icon, label, value }) => (
  <motion.div
    className="flex items-center gap-4 p-4 rounded-xl 
               bg-white border-2 border-[#FF6B35]/30
               shadow-lg hover:shadow-xl"
    whileHover={{ y: -2, borderColor: "rgba(255, 107, 53, 0.6)" }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon3D>{icon}</Icon3D>
    <div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-[#003366]">{value || "N/A"}</p>
    </div>
  </motion.div>
);

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const res = await axios.get(`${baseurl}api/public/property/${id}`);
        setProperty(res.data.property);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [id]);

  // Auto-slide effect (only for Details tab)
  useEffect(() => {
    if (activeTab === "Details" && property?.images?.length > 1) {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) =>
          prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeTab, property?.images]);

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setActiveImageIndex(index);
  };

  // Image Carousel - Only for Details tab
  const ImageCarousel = () => (
    <div className="relative overflow-hidden rounded-2xl border-4 border-[#FF6B35] mb-8 shadow-2xl group">
      {property.images?.length > 0 ? (
        <div className="relative w-full h-96">
          <AnimatePresence>
            <motion.img
              key={activeImageIndex}
              src={
                property.images[activeImageIndex] ||
                "https://via.placeholder.com/600x400?text=No+Image"
              }
              alt={`${property.name} - Image ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/600x400?text=No+Image")
              }
            />
          </AnimatePresence>
          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <motion.button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#003366]/90 text-white p-3 rounded-full hover:bg-[#003366] border-2 border-[#FF6B35] shadow-xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={24} />
              </motion.button>
              <motion.button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#003366]/90 text-white p-3 rounded-full hover:bg-[#003366] border-2 border-[#FF6B35] shadow-xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={24} />
              </motion.button>
            </>
          )}
          {/* Navigation Dots */}
          {property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full border-2 ${
                    activeImageIndex === index
                      ? "bg-[#FF6B35] border-[#FF6B35] scale-125"
                      : "bg-white/50 border-white"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
          No Image Available
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Details":
        return (
          <>
            {/* Image Carousel ONLY in Details tab */}
            <ImageCarousel />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
              <DetailItem icon={<Home />} label="Type" value={property?.type} />
              <DetailItem
                icon={<MapPin />}
                label="Address"
                value={property?.location?.address || property?.address}
              />
              <DetailItem
                icon={<Building />}
                label="City"
                value={property?.location?.city || property?.city}
              />
              <DetailItem
                icon={<Landmark />}
                label="State"
                value={property?.location?.state || property?.state}
              />
              <DetailItem
                icon={<LocateFixed />}
                label="Pin Code"
                value={property?.location?.pinCode || property?.pinCode}
              />
              <DetailItem
                icon={<Layers />}
                label="Total Rooms"
                value={property?.totalRooms}
              />
              <DetailItem
                icon={<BedDouble />}
                label="Total Beds"
                value={property?.totalBeds}
              />
              <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-xl border-2 border-[#FF6B35]/30 shadow-md">
                <h6 className="text-[#003366] font-bold text-lg mb-3 flex items-center">
                  <span className="w-1 h-6 bg-[#FF6B35] mr-3 rounded"></span>
                  Description
                </h6>
                <p className="text-gray-700 leading-relaxed">
                  {property?.description || "No description available"}
                </p>
              </div>
            </div>
          </>
        );

      case "Rooms":
        return <RoomOverview />;

      case "TenantDues":
        return (
          // <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <TenantDues />
          // </div>
        );

      case "Tenant":
        return (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <Tenant />
          </div>
        );
      
      case "Complaints":
        return (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <Complaints />
          </div>
        );
    
      case "PropertyReviews":
        return (
          // <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <PropertyReviews />
          // </div>
        );
      
      case "PropertyExpenses":
        return (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35]/30 shadow-xl">
            <PropertyExpenses />
          </div>
        );

      default:
        return <div className="text-gray-600 p-4">Tab content...</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="border-t-4 border-[#FF6B35] w-14 h-14 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-lg text-red-600 font-semibold">Property not found</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen transition-all duration-500 min-w-0 relative ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      {/* Navbar - GTharzo themed */}
      <nav className="bg-white border-b-4 border-[#FF6B35] sticky top-0 z-10 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B35] rounded-full text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-wide">{property.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabList.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                  activeTab === tab
                    ? "bg-[#FF6B35] text-black border-[#FF6B35] shadow-lg scale-105"
                    : "bg-white text-[#003366] border-blue hover:bg-[#FF6B35]/10 hover:border-[#FF6B35]"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Image Carousel removed from here – now only inside Details tab */}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Back + Edit Buttons at bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            to="/landlord/property"
            className="flex items-center gap-2 text-[#003366] hover:text-[#FF6B35] font-semibold text-sm transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;