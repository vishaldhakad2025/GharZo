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
  Building2,
  Hotel,
  Briefcase,
  ShoppingCart,
  BadgeIndianRupee,
  Landmark,
  PlusCircle,
  Projector,
  ProjectorIcon,
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
        !selectedType || property.type?.toLowerCase() === selectedType.toLowerCase();

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
  const goToHomeLoan = () => navigate("/home-loan");

  const goToAddProject = () => {
    if (isAuthenticated) {
      navigate("/add-project");
    } else {
      navigate("/login", { state: { from: "/add-project" } });
    }
  };

  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const categoryButtons = [
    { label: "Rent", onClick: goToRent, icon: Home },
    { label: "Buy", onClick: goToSale, icon: ShoppingCart },
    { label: "Commercial", onClick: goToCommercial, icon: Building2 },
    { label: "PG/Hostel", onClick: goToPG, isActive: true, icon: Hotel },
    { label: "Hotels / Banquets", onClick: goToHostels, icon: Briefcase },
    { label: "Services", onClick: goToServices, icon: BadgeIndianRupee },
    { label: "Home Loan", onClick: goToHomeLoan, icon: Landmark },
    { label: "Project", onClick: goToCommercial, icon: ProjectorIcon },
  ];

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-5 lg:px-6 bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white min-h-screen">
      <div className="text-center mb-6 md:mb-8">
        {/* Ultra Compact & Attractive Gradient Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 max-w-7xl mx-auto px-1">
          {categoryButtons.map((btn, index) => {
            const IconComponent = btn.icon;
            return (
              <motion.button
                key={btn.label}
                onClick={btn.onClick}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className={`
                  group relative overflow-hidden
                  px-2 sm:px-2.5 py-2 sm:py-2.5 
                  rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs
                  min-h-[58px] sm:min-h-[62px] 
                  flex flex-col items-center justify-center gap-0.5 sm:gap-1
                  border transition-all duration-300
                  ${
                    btn.isActive
                      ? "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white border-orange-400/50 shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-600/50"
                      : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white/95 border-slate-600/40 shadow-md shadow-slate-800/30 hover:shadow-lg hover:shadow-slate-700/40 hover:text-white"
                  }
                `}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                {/* Top Glow */}
                <div className={`absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-lg sm:rounded-xl transition-opacity duration-300`} />

                {/* Bottom Shadow Glow */}
                <div className={`absolute -inset-1 ${btn.isActive ? 'bg-slate-600/20' : 'bg-slate-600/20'} blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl`} />

                <span className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
                  <IconComponent
                    size={16}
                    className={`transition-all duration-300 group-hover:scale-125 ${
                      btn.isActive 
                        ? "drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]" 
                        : "group-hover:drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]"
                    }`}
                  />
                  <span className="text-center leading-tight font-bold tracking-wide drop-shadow-sm">
                    {btn.label}
                  </span>
                </span>

                {/* Active Indicator Pulse */}
                {btn.isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Search + Filters */}
      {/* <div className="max-w-5xl mx-auto mb-7 md:mb-9">
        <div className="bg-white/75 backdrop-blur-xl border border-blue-200/40 rounded-xl shadow-xl p-3 flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
            <input
              type="text"
              placeholder="City, area, landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-400/60 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 bg-white/80 text-sm"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-blue-200/50" />

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-xl border border-blue-400/60 text-gray-700 bg-white/80 hover:bg-blue-50/60 transition-colors text-sm"
            >
              <Home size={17} />
              <span className="whitespace-nowrap">{selectedType || "Type"}</span>
              <ChevronDown size={16} />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-44 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl border border-blue-200/40 p-2">
                {["Rent", "Buy", "Rooms", "Commercial", "PG", "Hostels", "Services"].map((t) => (
                  <p
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-blue-50 rounded-lg text-sm"
                  >
                    {t}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-xl border border-blue-400/60 text-gray-700 bg-white/80 hover:bg-blue-50/60 transition-colors text-sm"
            >
              <IndianRupee size={17} />
              <span className="whitespace-nowrap">{selectedBudget || "Budget"}</span>
              <ChevronDown size={16} />
            </button>
            {showBudgetDropdown && (
              <div className="absolute z-50 mt-2 w-44 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl border border-blue-200/40 p-2">
                {["Under 5000", "5000-8000", "8000-12000", "Above 12000"].map((b) => (
                  <p
                    key={b}
                    onClick={() => {
                      setSelectedBudget(b);
                      setShowBudgetDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-blue-50 rounded-lg text-sm"
                  >
                    {b}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div> */}

      {/* Property cards section */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-600 py-16 text-base sm:text-lg">
          No PG/Hostel found matching your filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-7xl mx-auto">
            {currentProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.45 }}
                whileHover={{ y: -6, scale: 1.03 }}
                onClick={() => handlePropertyClick(property.id)}
                className="group bg-white/85 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 border border-blue-100/60"
              >
                <div className="relative">
                  <img
                    src={property.images?.[0] || "https://via.placeholder.com/400x260"}
                    alt={property.name}
                    className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-md backdrop-blur-sm">
                    ₹{property.lowestPrice}/mo
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                    {property.name}
                  </h3>

                  <div className="flex items-center text-gray-600 mt-1.5 text-xs sm:text-sm">
                    <MapPin size={14} className="text-blue-600 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {property?.location?.city}, {property?.location?.area}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-gray-700 text-xs sm:text-sm">
                    <div>
                      <BedDouble size={18} className="mx-auto text-blue-600" />
                      <p className="mt-1">{property.totalBeds || "N/A"} Beds</p>
                    </div>
                    <div>
                      <Bath size={18} className="mx-auto text-blue-600" />
                      <p className="mt-1">{property.totalRooms || "N/A"} Baths</p>
                    </div>
                    <div>
                      <CarFront size={18} className="mx-auto text-blue-600" />
                      <p className="mt-1">Parking</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">
                    {property.type}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 sm:mt-10 gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 sm:px-5 py-2 bg-white/80 backdrop-blur-sm border border-blue-400 text-blue-700 rounded-xl disabled:opacity-50 hover:bg-blue-50 text-sm transition-all"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-sm min-w-[38px] sm:min-w-[44px] transition-all ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-white/80 backdrop-blur-sm border border-blue-300 text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 sm:px-5 py-2 bg-white/80 backdrop-blur-sm border border-blue-400 text-blue-700 rounded-xl disabled:opacity-50 hover:bg-blue-50 text-sm transition-all"
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