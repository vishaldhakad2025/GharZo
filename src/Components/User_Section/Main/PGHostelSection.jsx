import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import axios from "axios";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { BedDouble, Bath, CarFront, MapPin, Search, Home, IndianRupee } from "lucide-react";

const PGHostelSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://api.gharzoreality.com/api/public/all-properties");
        const pgHostels = (res.data.properties || [])
          .filter(
            (p) =>
              (p.type?.toLowerCase() === "pg" || p.type?.toLowerCase() === "hostel") &&
              p.isActive === true
          );
        setProperties(pgHostels);
        setFilteredProperties(pgHostels);
      } catch (error) {
        console.error("Error fetching PG & Hostel properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Search filtering (unchanged logic)
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    let minPrice = 0;
    let maxPrice = Infinity;
    let textQuery = q;

    const singlePriceMatch = q.match(/\b(\d+)\b/);
    const priceRangeMatch = q.match(/(?:price:)?(\d+)-(\d+)/);

    if (priceRangeMatch) {
      minPrice = parseFloat(priceRangeMatch[1]) || 0;
      maxPrice = parseFloat(priceRangeMatch[2]) || Infinity;
      textQuery = q.replace(priceRangeMatch[0], "").trim();
    } else if (singlePriceMatch) {
      minPrice = parseFloat(singlePriceMatch[1]) || 0;
      maxPrice = minPrice + 1000;
      textQuery = q.replace(singlePriceMatch[0], "").trim();
    }

    const filtered = properties.filter((property) => {
      const price = parseFloat(property.lowestPrice) || 0;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const matchesText =
        !textQuery ||
        property.name?.toLowerCase().includes(textQuery) ||
        property.type?.toLowerCase().includes(textQuery) ||
        property.location?.city?.toLowerCase().includes(textQuery) ||
        property.location?.area?.toLowerCase().includes(textQuery) ||
        property.location?.state?.toLowerCase().includes(textQuery);

      return matchesPrice && matchesText;
    });
    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchQuery, properties]);

  const handlePropertyClick = (propertyId) => {
    if (isAuthenticated) {
      navigate(`/property/${propertyId}`);
    } else {
      navigate("/login", { state: { from: `/property/${propertyId}` } });
    }
  };

  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
<section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-amber-50/50 to-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
          <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91]  bg-clip-text text-transparent">
            Affordable PGs & Hostels
          </span>
        </h2>
        <p className="mt-4 text-lg text-gray-600">Find comfortable stays with great amenities in top locations</p>
      </motion.div>

      {/* Reference-Style Search Bar */}
      <div className="max-w-5xl mx-auto mb-12">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
            <input
              type="text"
              placeholder="Type Locality or Project/Society or Builder"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-gray-700"
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-300" />

          <div className="flex items-center gap-4 ">
            <button className="flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700">
              <Home size={18} />
              Property Type
            </button>

            <button className="flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700">
              <IndianRupee size={18} />
              Budget Range
            </button>

            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center gap-3">
              <Search size={20} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-20 h-20 border-6 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-500 py-20 text-xl">No PGs/Hostels found matching your search.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {currentProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03 }}
                onClick={() => handlePropertyClick(property.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative">
                  <img
                    src={property.images?.[0] || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCQILdjI6IvkmXukmIVc7iLEkoa_lt8vcUOyoE8SMWJebAiB_NUaWD_j-4m7Wls1v-fqk&usqp=CAU"}
                    alt={property.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Price Badge */}
                  <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    ₹{property.lowestPrice || "N/A"}/mo
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{property.name}</h3>
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin size={18} className="text-orange-500 mr-1" />
                    <span className="text-sm">{property.location?.city}, {property.location?.area}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 text-center text-gray-700">
                    <div>
                      <BedDouble size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property.totalBeds || "N/A"} Beds</p>
                    </div>
                    <div>
                      <Bath size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">{property.totalRooms || "N/A"} Baths</p>
                    </div>
                    <div>
                      <CarFront size={20} className="mx-auto text-orange-500" />
                      <p className="text-sm mt-1">Parking</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-orange-600 uppercase tracking-wider">
                    {property.type}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-white border border-orange-500 text-orange-600 rounded-xl disabled:opacity-50 hover:bg-orange-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-5 py-3 rounded-xl ${currentPage === i + 1 ? "bg-orange-600 text-white" : "bg-white border border-orange-300 text-orange-600 hover:bg-orange-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-white border border-orange-500 text-orange-600 rounded-xl disabled:opacity-50 hover:bg-orange-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PGHostelSection;