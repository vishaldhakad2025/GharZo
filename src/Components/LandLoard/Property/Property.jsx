import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCouch,
  FaTrash,
  FaEdit,
  FaDoorOpen,
  FaEye,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../BaseUrl.js";

// Compact Image Slider Component
const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-48 bg-gradient-to-b from-black/30 to-transparent overflow-hidden rounded-t-2xl group">
      <img
        src={images[current]}
        alt="property"
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
      />
      {/* Subtle Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Arrows - smaller & subtle */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        ❯
      </button>

      {/* Dots - compact */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? "bg-orange-400 w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    type: "",
    maxRent: "",
    furnished: "",
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Detect sidebar hover state
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

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        setProperties([]);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${baseurl}api/landlord/properties`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        if (Array.isArray(data.properties)) {
          setProperties(data.properties);
        } else if (Array.isArray(data)) {
          setProperties(data);
        } else {
          setProperties([]);
          toast.error("No properties found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch properties.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Handle scroll for filter bar visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Delete property
  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    setDeletingId(propertyId);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      setDeletingId(null);
      return;
    }

    try {
      const response = await axios.delete(
        `${baseurl}api/landlord/properties/${propertyId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200 || response.status === 204) {
        setProperties((prev) => prev.filter((prop) => prop._id !== propertyId));
        toast.success("Property deleted successfully!");
      } else {
        toast.error("Failed to delete property.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting property.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    return (
      (!filters.city ||
        prop.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
        prop.name?.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.type || prop.type === filters.type) &&
      (!filters.maxRent ||
        (prop.rent && prop.rent <= Number(filters.maxRent))) &&
      (!filters.furnished || prop.furnished?.toString() === filters.furnished)
    );
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div
      className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `
          radial-gradient(circle at center bottom, rgba(245,124,0,0.35), transparent 60%),
          linear-gradient(180deg, rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)
        `,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
            My Properties
          </h2>
          <p className="text-gray-400 text-base mt-2">
            Manage your real estate portfolio
          </p>
        </motion.div>

        {/* Property Cards */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-20 h-20 border-6 border-white/20 border-t-orange-400 rounded-full"></div>
              <div className="absolute inset-0 w-20 h-20 border-6 border-white/20 border-t-indigo-400 rounded-full animate-spin [animation-delay:0.2s]"></div>
            </motion.div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 inline-block border border-white/20">
              <p className="text-2xl font-semibold text-gray-300 mb-4">
                No properties found
              </p>
              <p className="text-gray-400">
                {properties.length === 0
                  ? "Add your first property to get started"
                  : "Try different filters"}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col border border-white/20 shadow-xl hover:shadow-orange-500/30 transition-all duration-400 relative"
              >
                {/* Deactivated Overlay */}
                {!property.isActive && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">DEACTIVATED</p>
                      <p className="text-sm text-gray-300 mt-2">
                        Admin has deactivated this property
                      </p>
                    </div>
                  </div>
                )}

                <ImageSlider images={property.images} />

                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xl font-bold text-white line-clamp-2">
                      {property.name}
                    </h5>
                    <span className="bg-orange-600/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {property.type}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-300 text-sm">
                    <FaMapMarkerAlt className="mr-2 text-orange-400 flex-shrink-0" />
                    <p className="truncate">
                      {property.address}, {property.city}
                    </p>
                  </div>

                  {/* Compact Stats */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl py-3 px-4 border border-white/20">
                      <FaDoorOpen className="mx-auto text-lg text-indigo-300 mb-1" />
                      <p className="text-xl font-bold text-white">{property.totalRooms}</p>
                      <p className="text-xs text-gray-400">Rooms</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl py-3 px-4 border border-white/20">
                      <FaBed className="mx-auto text-lg text-indigo-300 mb-1" />
                      <p className="text-xl font-bold text-white">{property.totalBeds}</p>
                      <p className="text-xs text-gray-400">Beds</p>
                    </div>
                  </div>

                  {/* Compact Action Buttons */}
                  {property.isActive && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <Link
                        to={`/landlord/property/${property._id}`}
                        className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-md text-white py-3 rounded-xl text-center hover:from-indigo-500 hover:to-purple-500 transition font-medium shadow-lg flex items-center justify-center"
                      >
                        <FaEye className="text-base" />
                      </Link>
                      <Link
                        to={`/landlord/property/edit/${property._id}`}
                        className="bg-gradient-to-r from-orange-600/80 to-amber-600/80 backdrop-blur-md text-white py-3 rounded-xl text-center hover:from-orange-500 hover:to-amber-500 transition font-medium shadow-lg flex items-center justify-center"
                      >
                        <FaEdit className="text-base" />
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id)}
                        disabled={deletingId === property._id}
                        className={`bg-gradient-to-r from-red-600/80 to-rose-600/80 backdrop-blur-md text-white py-3 rounded-xl text-center hover:from-red-500 hover:to-rose-500 transition font-medium shadow-lg flex items-center justify-center ${
                          deletingId === property._id ? "opacity-60" : ""
                        }`}
                      >
                        {deletingId === property._id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <FaTrash className="text-base" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Property;