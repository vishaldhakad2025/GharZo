import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Star,
  User,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Megaphone,
  FileText,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { FaRupeeSign, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AssignedRoomOverview from "./AssignedRoomOverview"; // New import for rooms component
import AssignedRoomTenant from "./AssignedRoomTenant"; // New import for tenants component

const API_BASE = "https://api.gharzoreality.com";

const tabList = [
  "Details",
  "Rooms",
  "Tenant",
  "Expenses",
  "Dues",
  //"Complaints",
  //"PropertyReviews",
  //"Announcements",
];

// Updated 3D Icon Wrapper with different gradient
const Icon3D = ({ children }) => (
  <motion.div
    className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl 
               bg-gradient-to-br from-purple-500 via-pink-500 to-red-500
               shadow-[0_8px_25px_rgba(0,0,0,0.3)] border border-purple-400/50 hover:border-purple-400/80"
    whileHover={{ y: -4, rotateX: 8, rotateY: -8, scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 15 }}
  >
    <div className="text-white text-2xl drop-shadow-md">{children}</div>
  </motion.div>
);

// Updated Detail item with new gradient and layout
const DetailItem = ({ icon, label, value }) => (
  <motion.div
    className="flex items-center gap-4 p-5 rounded-2xl 
               bg-gradient-to-r from-purple-50 to-pink-50 
               border border-purple-200/50 hover:border-purple-300/70 shadow-sm hover:shadow-md"
    whileHover={{ y: -3, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
  >
    <Icon3D>{icon}</Icon3D>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value || "N/A"}</p>
    </div>
  </motion.div>
);

const AssignedPropertyDetail = () => {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchAssignedPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view assigned property details", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/sub_owner_login");
          return;
        }

        const response = await fetch(`${API_BASE}/api/regional-managers/assigned-properties`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok && data.success && data.data) {
          const foundProperty = data.data.find(p => p._id === assignmentId);
          if (!foundProperty) {
            toast.error("Assigned property not found", {
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }

          // Adapt the response to match the expected structure
          const adaptedProperty = {
            ...foundProperty,
            stats: {
              totalRooms: foundProperty.totalRooms || 0,
              totalBeds: foundProperty.totalBeds || 0,
              monthlyCollection: foundProperty.monthlyCollection || 0,
              occupancyRate: (foundProperty.occupiedSpace && foundProperty.totalCapacity ? (foundProperty.occupiedSpace / foundProperty.totalCapacity * 100).toFixed(2) : 0),
            },
            location: {
              address: foundProperty.address,
              city: foundProperty.city,
              state: foundProperty.state,
              pinCode: foundProperty.pinCode,
            },
          };
          setProperty(adaptedProperty);
        } else {
          toast.error("Failed to fetch assigned property details", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching assigned property:", error);
        toast.error("An error occurred while fetching assigned property details", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedPropertyDetails();
  }, [assignmentId, navigate]);

  // Auto-slide effect
  useEffect(() => {
    if (property?.images?.length > 1 && activeTab === "Details") {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) =>
          prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [property?.images, activeTab]);

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

  const renderTabContent = () => {
    const actualPropertyId = property?.propertyId;
    const allTenants = property?.rooms?.flatMap(room => room.beds?.flatMap(bed => bed.tenants)) || [];

    switch (activeTab) {
      case "Details":
        return (
          <div className="space-y-8">
            {/* Image Slider - Only in Details tab */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-purple-200/50 group shadow-2xl">
              {property.images?.length > 0 ? (
                <div className="relative w-full h-96 md:h-[500px]">
                  <AnimatePresence>
                    <motion.img
                      key={activeImageIndex}
                      src={
                        property.images[activeImageIndex] ||
                        "https://via.placeholder.com/800x500?text=No+Image"
                      }
                      alt={`${property.name} - Image ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover rounded-3xl"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/800x500?text=No+Image")
                      }
                    />
                  </AnimatePresence>
                  {/* Navigation Arrows */}
                  {property.images.length > 1 && (
                    <>
                      <motion.button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 rounded-2xl hover:from-purple-600 hover:to-pink-600 shadow-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft size={24} />
                      </motion.button>
                      <motion.button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 rounded-2xl hover:from-purple-600 hover:to-pink-600 shadow-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight size={24} />
                      </motion.button>
                    </>
                  )}
                  {/* Navigation Dots */}
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      {property.images.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleDotClick(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            activeImageIndex === index
                              ? "bg-gradient-to-r from-blue-500 to-green-500 scale-125"
                              : "bg-white/50 hover:bg-white/70"
                          }`}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 1.1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 md:h-[500px] bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center text-white rounded-3xl">
                  <p className="text-2xl font-bold drop-shadow-lg">
                    No Image Available
                  </p>
                </div>
              )}
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<Home />} label="Type" value={property?.type} />
              <DetailItem  
                icon={<MapPin />}
                label="Address"
                value={
                  property?.address || property?.location?.address || "N/A"
                }
              />
              <DetailItem
                icon={<Building />}
                label="City"
                value={property?.city || property?.location?.city || "N/A"}
              />
              <DetailItem
                icon={<Landmark />}
                label="State"
                value={property?.state || property?.location?.state || "N/A"}
              />
              <DetailItem
                icon={<LocateFixed />}
                label="Pin Code"
                value={
                  property?.pinCode || property?.location?.pinCode || "N/A"
                }
              />
              <DetailItem
                icon={<Layers />}
                label="Total Rooms"
                value={property?.stats?.totalRooms}
              />
              <DetailItem
                icon={<BedDouble />}
                label="Total Beds"
                value={property?.stats?.totalBeds}
              />
              <DetailItem
                icon={<Star />}
                label="Average Rating"
                value={`${property?.ratingSummary?.averageRating || 0}/5 (${property?.ratingSummary?.totalRatings || 0} reviews)`}
              />
              <motion.div 
                className="md:col-span-2 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -2 }}
              >
                <p className="mb-3 flex items-center text-gray-800">
                  <FaRupeeSign className="mr-2 text-purple-500 text-xl" />
                  <span className="text-2xl font-bold">
                    Monthly Collection:{" "}
                  </span>
                  <span className="ml-2">
                    {property?.stats?.monthlyCollection > 0
                      ? `₹${property.stats.monthlyCollection.toLocaleString()}`
                      : "₹0"}
                  </span>
                </p>
                <p className="mb-3 text-gray-700">
                  <span className="font-semibold">Occupancy Rate: </span>
                  <span>{property?.stats?.occupancyRate || "0"}%</span>
                </p>
                <p className="mb-3 text-gray-700">
                  <span className="font-semibold">Pending Dues: </span>
                  <span>₹{property?.pendingDues?.toLocaleString() || "0"}</span>
                </p>
                <p className="text-gray-800 leading-relaxed mt-4">
                  <span className="font-bold text-lg block mb-2">Description:</span>
                  {property?.description || "No description available"}
                </p>
              </motion.div>
            </div>
          </div>
        );

      case "Rooms":
        return <AssignedRoomOverview propertyId={actualPropertyId} />;

      case "Tenant":
        return <AssignedRoomTenant tenants={allTenants} propertyId={actualPropertyId} />;

      case "Expenses":
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText size={28} />
              Expenses
            </h2>
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4" />
              <p>No expenses data available at the moment.</p>
            </div>
          </div>
        );

      case "Dues":
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign size={28} />
              Dues
            </h2>
            <div className="text-center py-12 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4" />
              <p>Total Pending Dues: ₹{property?.pendingDues || 0}</p>
              <p className="text-sm mt-2">No detailed dues breakdown available.</p>
            </div>
          </div>
        );

      case "Complaints":
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertCircle size={28} />
              Complaints
            </h2>
            <div className="text-center py-12 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>No complaints reported yet.</p>
            </div>
          </div>
        );

      case "PropertyReviews":
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Star size={28} />
              Property Reviews
            </h2>
            <div className="text-center py-12 text-gray-500">
              <Star size={48} className="mx-auto mb-4" />
              <p>Average Rating: {property?.ratingSummary?.averageRating || 0}/5</p>
              <p className="text-sm mt-2">Total Reviews: {property?.ratingSummary?.totalRatings || 0}</p>
              <p className="text-sm">No detailed reviews available.</p>
            </div>
          </div>
        );

      case "Announcements":
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Megaphone size={28} />
              Announcements
            </h2>
            <div className="text-center py-12 text-gray-500">
              <Megaphone size={48} className="mx-auto mb-4" />
              <p>No announcements posted yet.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-300 p-8 rounded-2xl">Tab content...</div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="border-t-4 border-purple-400 w-12 h-12 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-xl text-white font-bold">Assigned property not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <ToastContainer theme="colored" position="top-right" />
      {/* Updated Navbar with new gradient */}
      <nav className="bg-gradient-to-r from-green-800 to-blue-800 border-b opacity-100 rounded-2xl border-purple-500/40 top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 bg-white/20 rounded-2xl text-white shadow-md"
              whileHover={{ scale: 1.1 }}
            >
              <Building2 size={24} />
            </motion.div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Assigned: {property.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {tabList.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border-2 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-green-500 text-white border-purple-400 shadow-lg shadow-purple-500/25"
                    : "bg-white/20 hover:bg-white/30 text-white border-purple-400/50"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Updated Back Button */}
        <div className="mt-12 flex justify-between items-center">
          <Link
            to="/regional_manager/regional_manager_property"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            ← Back to Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssignedPropertyDetail;