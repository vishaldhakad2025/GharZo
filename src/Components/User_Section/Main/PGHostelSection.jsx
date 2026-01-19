import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import axios from "axios";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  BedDouble,
  Bath,
  CarFront,
  MapPin,
  Home,
  IndianRupee,
  ChevronDown,
} from "lucide-react";
import baseurl from "../../../../BaseUrl.js";

const PGHostelSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseurl}api/public/all-properties`);
        const pgHostels = (res.data.properties || []).filter(
          (p) =>
            (p.type?.toLowerCase() === "pg" ||
              p.type?.toLowerCase() === "hostel") &&
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

  useEffect(() => {
    let q = searchQuery.toLowerCase().trim();
    let minPrice = 0;
    let maxPrice = Infinity;
    let textQuery = q;

    const singlePriceMatch = q.match(/\b(\d+)\b/);
    const priceRangeMatch = q.match(/(\d+)-(\d+)/);

    if (priceRangeMatch) {
      minPrice = parseFloat(priceRangeMatch[1]);
      maxPrice = parseFloat(priceRangeMatch[2]);
      textQuery = q.replace(priceRangeMatch[0], "").trim();
    } else if (singlePriceMatch) {
      minPrice = parseFloat(singlePriceMatch[1]);
      maxPrice = minPrice + 1000;
      textQuery = q.replace(singlePriceMatch[0], "").trim();
    }

    let filtered = properties.filter((property) => {
      const price = parseFloat(property.lowestPrice) || 0;

      const matchesPrice = price >= minPrice && price <= maxPrice;

      const matchesText =
        !textQuery ||
        property.name?.toLowerCase().includes(textQuery) ||
        property.type?.toLowerCase().includes(textQuery) ||
        property.location?.city?.toLowerCase().includes(textQuery) ||
        property.location?.area?.toLowerCase().includes(textQuery) ||
        property.location?.state?.toLowerCase().includes(textQuery);

      const matchesType =
        !selectedType ||
        property.type?.toLowerCase() === selectedType.toLowerCase();

      const matchesBudget =
        !selectedBudget ||
        (selectedBudget === "Under 5000" && price <= 5000) ||
        (selectedBudget === "5000-8000" && price >= 5000 && price <= 8000) ||
        (selectedBudget === "8000-12000" && price >= 8000 && price <= 12000) ||
        (selectedBudget === "Above 12000" && price >= 12000);

      return matchesPrice && matchesText && matchesType && matchesBudget;
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedBudget, properties]);

  const handleSearch = () => {
    setSearchQuery((prev) => prev.trim());
  };

  const handlePropertyClick = (id) => {
    if (isAuthenticated) navigate(`/property/${id}`);
    else navigate("/login", { state: { from: `/property/${id}` } });
  };

  // Navigation handlers
  const goToRent = () => navigate("/rent");
  const goToSale = () => navigate("/sale");
  const goToCommercial = () => navigate("/commercial");
  const goToPG = () => navigate("/pg");
  const goToHostels = () => navigate("/hostels");
  const goToServices = () => navigate("/services");

  // Pagination
  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const categoryButtons = [
    { label: "Rent", onClick: goToRent },
    { label: "Buy", onClick: goToSale },
    { label: "Commercial", onClick: goToCommercial },
    { label: "PG/Hostel", onClick: goToPG, isActive: true },
    { label: "Hotels / Banquets", onClick: goToHostels },
    { label: "Services", onClick: goToServices },
  ];

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-amber-50/50 to-white min-h-screen">
      <div className="text-center mb-8 md:mb-10">
        {/* Category Buttons - Responsive Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto px-2">
          {categoryButtons.map((btn) => (
           <button
  key={btn.label}
  onClick={btn.onClick}
  className={`
    group relative 
    px-3 sm:px-5 lg:px-4 py-3 sm:py-4 lg:py-2   /* desktop padding reduced */
    rounded-xl sm:rounded-2xl 
    font-medium sm:font-semibold 
    text-sm sm:text-base
    transition-all duration: 0.5 
    hover:scale-105 active:scale-120
    delay: index * 0.1
    min-h-[72px] sm:min-h-[88px] lg:min-h-[64px]
    flex items-center justify-center
    overflow-hidden

    shadow-[0_8px_25px_rgba(0,0,0,0.35)] 
    hover:shadow-[0_12px_35px_rgba(0,0,0,0.45)]   /* custom box shadow */

    ${
      btn.isActive
        ? "bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-blue-600/50"
        : "bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white hover:shadow-blue-500/50"
    }
  `}
>

              <span className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                {/* You can add icons back here if you want */}
                <span className="text-center">{btn.label}</span>
              </span>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto mb-10 md:mb-12">
        <div className="bg-white border-2 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4">
          {/* Location Search */}
          <div className="flex-1 relative w-full">
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by city, area, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-orange-500 text-gray-700 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-300" />

          {/* Type Filter */}
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 rounded-xl border border-orange-400 text-gray-700"
            >
              <Home size={18} />
              <span className="whitespace-nowrap">{selectedType || "Type"}</span>
              <ChevronDown size={18} />
            </button>

            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-lg rounded-lg border p-2 left-0 md:left-auto right-0 md:right-auto">
                {["Rent", "Buy", "Rooms", "Commercial", "PG", "Hostels", "Services"].map((t) => (
                  <p
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md text-sm"
                  >
                    {t}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Budget Filter */}
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 rounded-xl border border-orange-400 text-gray-700"
            >
              <IndianRupee size={18} />
              <span className="whitespace-nowrap">{selectedBudget || "Budget"}</span>
              <ChevronDown size={18} />
            </button>

            {showBudgetDropdown && (
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-lg rounded-lg border p-2 left-0 md:left-auto right-0 md:right-auto">
                {["Under 5000", "5000-8000", "8000-12000", "Above 12000"].map((b) => (
                  <p
                    key={b}
                    onClick={() => {
                      setSelectedBudget(b);
                      setShowBudgetDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md text-sm"
                  >
                    {b}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-500 py-20 text-lg">
          No PG/Hostel found matching your filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-7xl mx-auto">
            {currentProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onClick={() => handlePropertyClick(property.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
              >
                <div className="relative">
                  <img
                    src={property.images?.[0] || "https://via.placeholder.com/400x300"}
                    alt={property.name}
                    className="w-full h-56 sm:h-60 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                    ₹{property.lowestPrice}/mo
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                    {property.name}
                  </h3>

                  <div className="flex items-center text-gray-600 mt-2 text-sm">
                    <MapPin size={16} className="text-orange-500 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {property?.location?.city}, {property?.location?.area}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-5 text-center text-gray-700 text-sm">
                    <div>
                      <BedDouble size={20} className="mx-auto text-orange-500" />
                      <p className="mt-1">{property.totalBeds || "N/A"} Beds</p>
                    </div>
                    <div>
                      <Bath size={20} className="mx-auto text-orange-500" />
                      <p className="mt-1">{property.totalRooms || "N/A"} Baths</p>
                    </div>
                    <div>
                      <CarFront size={20} className="mx-auto text-orange-500" />
                      <p className="mt-1">Parking</p>
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
            <div className="flex justify-center mt-10 sm:mt-12 gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white border border-orange-500 text-orange-600 rounded-xl disabled:opacity-50 hover:bg-orange-50 text-sm sm:text-base"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base min-w-[40px] sm:min-w-[48px] ${
                    currentPage === i + 1
                      ? "bg-orange-600 text-white"
                      : "bg-white border border-orange-300 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white border border-orange-500 text-orange-600 rounded-xl disabled:opacity-50 hover:bg-orange-50 text-sm sm:text-base"
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