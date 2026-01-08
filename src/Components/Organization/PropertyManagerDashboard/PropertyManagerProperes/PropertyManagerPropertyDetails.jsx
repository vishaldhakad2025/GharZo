import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PropertyManagerRoomOwerview from "./PropertyManagerRoomOwerView";
import PropertyManagerRoomTenant from "./PropertyManagerRoomTenant";
import PropertyManagerPropertyAnnouncements from "./PropertyManagerPropertyAnnouncements";
import PropertyManagerPropertyComplaints from "./PropertyManagerPropertyComplaints";
import PropertyManagerPropertyduesIn from "./PropertyManagerPropertyduesin";
import PropertyManagerPropertyDocuments from "./PropertyManagerPropertyDocuments";
import { motion } from "framer-motion";
import { HomeIcon, BuildingOfficeIcon, UserIcon, HomeModernIcon } from "@heroicons/react/24/outline";
import PropertyManagerExpenses from "./PropertyManagerExpenses";
import PropertyManagerPropertyExpenses from "./PropertyManagerPropertyExpenses";

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const propertyResponse = await axios.get(
          `https://api.gharzoreality.com/api/pm/properties/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (propertyResponse.data?.success && propertyResponse.data.property) {
          setProperty(propertyResponse.data.property);
        } else {
          throw new Error("Invalid property details API response");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        if (err.message.includes("No authentication token")) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Unauthorized access. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.message || "Failed to fetch property details. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [propertyId, navigate]);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "roomowerview", label: "Rooms" },
    { id: "tenant", label: "Tenants" },
    { id: "duesin", label: "Dues" },
    //{ id: "complaints", label: "Complaints" },
    { id: "announcements", label: "Announcements" },
    { id: "pm-expenses", label: "Expenses" },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-700">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-8 p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-red-600">{error}</h2>
          <button
            onClick={() => navigate("/properties")}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:from-blue-700 hover:to-green-600 hover:shadow-lg transition-all duration-300"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-2xl font-medium text-gray-600">No property details found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 font-sans text-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden transition-all duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center md:text-left mb-8 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            {property.name}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto md:mx-0 leading-relaxed">
            Explore and manage all details of your property with a seamless and intuitive interface.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-500 hover:text-white hover:shadow-md"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8"
        >
          <div className="flex justify-start mb-6">
            {/* <button
              onClick={() => navigate("/properties")}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-green-600 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button> */}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "details" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-8 border-b-2 border-blue-100 pb-3 text-gray-800 flex items-center">
                    <span className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md">
                      <HomeIcon className="w-8 h-8" />
                    </span>
                    <span className="ml-3">Property Details</span>
                  </h2>
                </motion.div>

                {/* Equal 2-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {/* Left Column */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <h3 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                      <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                        <BuildingOfficeIcon className="w-7 h-7" />
                      </span>
                      <span className="ml-3">Basic Information</span>
                    </h3>

                    <div className="space-y-6 text-gray-600">
                      <div className="flex items-center text-base lg:text-lg">
                        <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                          <HomeIcon className="w-8 h-8" />
                        </span>
                        <strong className="text-gray-700 w-32 ml-3">Name:</strong>
                        <span className="ml-2 font-medium">{property.name}</span>
                      </div>

                      <div className="flex items-center text-base lg:text-lg">
                        <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                          <BuildingOfficeIcon className="w-8 h-8" />
                        </span>
                        <strong className="text-gray-700 w-32 ml-3">Type:</strong>
                        <span className="ml-2 font-medium">{property.type}</span>
                      </div>

                      <div className="flex items-center text-base lg:text-lg">
                        <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <strong className="text-gray-700 w-32 ml-3">Address:</strong>
                        <span className="ml-2 font-medium">{property.address}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Column */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <h3 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800 flex items-center opacity-0">
                      <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                        <BuildingOfficeIcon className="w-7 h-7" />
                      </span>
                      <span className="ml-3">Metrics</span>
                    </h3>

                    <div className="space-y-6 text-gray-600">
                      <div className="flex items-center text-base lg:text-lg">
                        <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                          <UserIcon className="w-8 h-8" />
                        </span>
                        <strong className="text-gray-700 w-32 ml-3">Total Beds:</strong>
                        <span className="ml-2 font-medium">{property.metrics?.totalBeds || 0}</span>
                      </div>

                      <div className="flex items-center text-base lg:text-lg">
                        <span className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm">
                          <HomeModernIcon className="w-8 h-8" />
                        </span>
                        <strong className="text-gray-700 w-32 ml-3">Total Rooms:</strong>
                        <span className="ml-2 font-medium">{property.metrics?.totalRooms || 0}</span>
                      </div>

                      {/* Available Rooms REMOVED */}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === "roomowerview" && <PropertyManagerRoomOwerview />}
            {activeTab === "tenant" && <PropertyManagerRoomTenant />}
            {activeTab === "duesin" && <PropertyManagerPropertyduesIn />}
            {activeTab === "complaints" && <PropertyManagerPropertyComplaints />}
            {activeTab === "announcements" && <PropertyManagerPropertyAnnouncements />}
            {activeTab === "pm-expenses" && <PropertyManagerPropertyExpenses />}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDetail;