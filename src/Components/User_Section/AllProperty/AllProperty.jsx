import React, { useEffect, useState, useRef } from "react";
import { BedDouble, MapPin, Home, Users, Search, RotateCcw, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { motion } from "framer-motion";
import baseurl from "../../../../BaseUrl";

function AllProperty() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [purpose, setPurpose] = useState("");          // Rent / Buy
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;

  const searchIconRef = useRef(null);

  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${baseurl}api/public/all-properties`,
          {
            cache: "no-cache",
          }
        );
        const data = await res.json();
        console.log("API Response:", data);
        const raw = data;

        if (raw?.properties && Array.isArray(raw.properties)) {
          const availableProps = raw.properties.filter(
            (item) => item.isActive === true
          );

          const formatted = availableProps.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.images?.[0] || "",
            images: item.images || [],
            address: item.location?.address || "",
            city: item.location?.city || "",
            state: item.location?.state || "",
            location: `${item.location?.city}, ${item.location?.state}`,
            price: item.lowestPrice || item.price || 0,
            bedrooms: item.totalBeds,
            area: item.area || "",
            description: item.description || "",
            propertyType: item.type,
            totalRooms: item.totalRooms,
            totalBeds: item.totalBeds,
            createdAt: item.createdAt || new Date().toISOString(),
            purpose: item.purpose || "rent", // assuming some default
          }));
          setProperties(formatted);
          setFilteredProperties(formatted);
        } else {
          console.error("Unexpected API response:", raw);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Animate search icon
  useEffect(() => {
    if (searchIconRef.current) {
      gsap.to(searchIconRef.current, {
        y: -2,
        scale: 1.2,
        duration: 0.6,
        ease: "elastic.out(1,0.3)",
        repeat: -1,
        yoyo: true,
      });
    }
  }, []);

  // Auto Filter handler
  useEffect(() => {
    const filtered = properties.filter((property) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        property.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesPurpose = purpose
        ? property.purpose?.toLowerCase() === purpose.toLowerCase()
        : true;

      const matchesType = propertyType
        ? property.propertyType?.toLowerCase() === propertyType.toLowerCase()
        : true;

      const price = property.price || 0;
      const matchesPrice = (() => {
        if (priceRange === "0-5000") return price <= 5000;
        if (priceRange === "5000-10000") return price > 5000 && price <= 10000;
        if (priceRange === "10000-20000") return price > 10000 && price <= 20000;
        if (priceRange === "20000-50000") return price > 20000 && price <= 50000;
        if (priceRange === "50000+") return price > 50000;
        return true;
      })();

      return matchesSearch && matchesPurpose && matchesType && matchesPrice;
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [debouncedSearchTerm, purpose, propertyType, priceRange, properties]);

  // Reset handler
  const handleReset = () => {
    setSearchTerm("");
    setPurpose("");
    setPropertyType("");
    setPriceRange("");
  };

  // Pagination logic
  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Back Button */}
      <div className="max-w-full mx-auto px-4 pt-6 pb-2 bg-gradient-to-r from-[#002B5C] via-[#003A75] to-[#002B5C]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>
      
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-r from-[#002B5C] via-[#003A75] to-[#002B5C] py-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Your Perfect Home
          </h1>
          <p className="text-blue-200 text-lg">
            Browse through {filteredProperties.length} amazing properties
          </p>
        </motion.div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search
                ref={searchIconRef}
                size={22}
                className="absolute left-5 top-1/3 -translate-y-1/2 text-[#FF6B00]"
              />
              <input
                type="text"
                placeholder="Search by property name, city, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all text-lg"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Looking For (Rent/Buy) */}
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-700 font-medium focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="">🔍 Looking for</option>
              <option value="rent">Rent</option>
              <option value="buy">Buy</option>
            </select>

            {/* Property Type */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-700 font-medium focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="">🏠 Property Type</option>
              <option value="room">Room</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="flat/apartment">Flat/Apartment</option>
              <option value="plot/land">Plot/Land</option>
              <option value="commercial">Commercial</option>
              <option value="office space">Office Space</option>
              <option value="shop">Shop</option>
              <option value="warehouse">Warehouse</option>
              <option value="pg/hostel">PG/Hostel</option>
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-700 font-medium focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="">💰 Price Range</option>
              <option value="0-5000">Up to ₹5,000</option>
              <option value="5000-10000">₹5,000 - ₹10,000</option>
              <option value="10000-20000">₹10,000 - ₹20,000</option>
              <option value="20000-50000">₹20,000 - ₹50,000</option>
              <option value="50000+">₹50,000+</option>
            </select>

            <button
              onClick={handleReset}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </motion.div>
      </div>

      {/* Properties Grid - remains exactly the same */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters to see more results</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {currentProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/property/${property.id}`}>
                    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100">
                      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                        <img
                          src={
                            property.images?.[0] ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCQILdjI6IvkmXukmIVc7iLEkoa_lt8vcUOyoE8SMWJebAiB_NUaWD_j-4m7Wls1v-fqk&usqp=CAU"
                          }
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-[#002B5C] shadow-lg">
                          {property.propertyType}
                        </div>
                      </div>

                      <div className="p-5">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                          {property.name}
                        </h2>
                        <div className="flex items-start gap-2 text-gray-600 mb-4">
                          <MapPin size={16} className="mt-1 text-[#FF6B00] flex-shrink-0" />
                          <p className="text-sm line-clamp-2">
                            {property.address}, {property.city}, {property.state}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                              <BedDouble size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Rooms</p>
                              <p className="text-sm font-bold text-gray-900">{property.totalRooms || "N/A"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                              <Home size={18} className="text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Beds</p>
                              <p className="text-sm font-bold text-gray-900">{property.totalBeds || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="w-full py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white text-center rounded-xl font-semibold">
                            View Details
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 border-2 border-[#FF6B00]/0 group-hover:border-[#FF6B00]/50 rounded-2xl transition-all duration-300 pointer-events-none" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center items-center mt-12 gap-2"
              >
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-11 h-11 rounded-full font-semibold transition-all ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white shadow-lg scale-110"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AllProperty;