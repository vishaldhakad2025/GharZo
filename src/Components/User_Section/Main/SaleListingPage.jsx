import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  CarFront,
  MapPin,
  Home,
  IndianRupee,
  ChevronDown,
  Plus,
  Square,
  ArrowLeft,
} from "lucide-react";

const SaleListingPage = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const propertiesPerPage = 9;

  // Dummy Data for Sale
  const saleProperties = [
    {
      id: 101,
      name: "Luxurious 4BHK Villa",
      type: "Villa",
      price: 12500000,
      location: { city: "Indore", area: "Super Corridor" },
      bedrooms: 4,
      bathrooms: 4,
      area: "3500 sq ft",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500",
    },
    {
      id: 102,
      name: "Premium 3BHK Apartment",
      type: "Apartment",
      price: 6500000,
      location: { city: "Indore", area: "Scheme 78" },
      bedrooms: 3,
      bathrooms: 3,
      area: "1850 sq ft",
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=500",
    },
    {
      id: 103,
      name: "Modern Duplex House",
      type: "Duplex",
      price: 8500000,
      location: { city: "Indore", area: "Nipania" },
      bedrooms: 5,
      bathrooms: 4,
      area: "2800 sq ft",
      image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=500",
    },
    {
      id: 104,
      name: "Elegant Penthouse",
      type: "Penthouse",
      price: 15000000,
      location: { city: "Indore", area: "Vijay Nagar" },
      bedrooms: 5,
      bathrooms: 5,
      area: "4200 sq ft",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500",
    },
    {
      id: 105,
      name: "Spacious Farmhouse",
      type: "Farmhouse",
      price: 25000000,
      location: { city: "Indore", area: "Bypass Road" },
      bedrooms: 6,
      bathrooms: 5,
      area: "6000 sq ft",
      image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=500",
    },
    {
      id: 106,
      name: "Cozy 2BHK Flat",
      type: "Apartment",
      price: 4200000,
      location: { city: "Indore", area: "AB Road" },
      bedrooms: 2,
      bathrooms: 2,
      area: "1100 sq ft",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500",
    },
  ];

  const [filteredProperties] = useState(saleProperties);

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-green-50/50 to-white min-h-screen">
      {/* Back Button + Top Navigation Buttons */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="flex-1 text-center">
          {/* You can add category navigation buttons here later if needed */}
        </div>
      </div>

      {/* Header with Add Listing Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Properties for Sale
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Invest in your dream property</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/add-listing')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Add Your Listing
        </motion.button>
      </div>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
            <input
              type="text"
              placeholder="Search by city, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-300" />

          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700"
            >
              <Home size={18} />
              {selectedType || "Property Type"}
              <ChevronDown size={18} />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-md rounded-lg border p-2">
                {["Villa", "Apartment", "Duplex", "Penthouse", "Farmhouse"].map((t) => (
                  <p
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md"
                  >
                    {t}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700"
            >
              <IndianRupee size={18} />
              {selectedBudget || "Budget"}
              <ChevronDown size={18} />
            </button>
            {showBudgetDropdown && (
              <div className="absolute z-50 mt-2 w-48 bg-white shadow-md rounded-lg border p-2">
                {["Under 50L", "50L-1Cr", "1Cr-2Cr", "Above 2Cr"].map((b) => (
                  <p
                    key={b}
                    onClick={() => {
                      setSelectedBudget(b);
                      setShowBudgetDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {currentProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.03 }}
            onClick={() => handlePropertyClick(property.id)}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500"
          >
            <div className="relative">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                ₹{(property.price / 100000).toFixed(1)}L
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Square size={14} />
                {property.area}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {property.name}
              </h3>

              <div className="flex items-center text-gray-600 mt-2">
                <MapPin size={18} className="text-orange-500 mr-1" />
                <span className="text-sm">
                  {property.location.city}, {property.location.area}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5 text-center text-gray-700">
                <div>
                  <BedDouble size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">{property.bedrooms} Beds</p>
                </div>
                <div>
                  <Bath size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">{property.bathrooms} Baths</p>
                </div>
                <div>
                  <CarFront size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">Parking</p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-green-600 uppercase tracking-wider">
                {property.type}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-3 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 bg-white border border-green-500 text-green-600 rounded-xl disabled:opacity-50 hover:bg-green-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-5 py-3 rounded-xl ${
                currentPage === i + 1
                  ? "bg-green-600 text-white"
                  : "bg-white border border-green-300 text-green-600 hover:bg-green-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white border border-green-500 text-green-600 rounded-xl disabled:opacity-50 hover:bg-green-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default SaleListingPage;