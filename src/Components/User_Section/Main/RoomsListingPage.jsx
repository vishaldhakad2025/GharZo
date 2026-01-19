import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble,
  Bath,
  MapPin,
  Home,
  IndianRupee,
  ChevronDown,
  Plus,
  Users,
  Wifi,
} from "lucide-react";

const RoomsListingPage = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const propertiesPerPage = 9;

  // Dummy Data for Rooms
  const roomsProperties = [
    {
      id: 201,
      name: "Single Private Room",
      type: "Single",
      price: 8000,
      location: { city: "Indore", area: "Vijay Nagar" },
      capacity: 1,
      amenities: ["WiFi", "AC", "Attached Bath"],
      area: "120 sq ft",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
    },
    {
      id: 202,
      name: "Double Sharing Room",
      type: "Double",
      price: 6000,
      location: { city: "Indore", area: "Palasia" },
      capacity: 2,
      amenities: ["WiFi", "Fan", "Common Bath"],
      area: "150 sq ft",
      image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500",
    },
    {
      id: 203,
      name: "Triple Sharing Room",
      type: "Triple",
      price: 5000,
      location: { city: "Indore", area: "AB Road" },
      capacity: 3,
      amenities: ["WiFi", "Fan", "Common Bath"],
      area: "180 sq ft",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500",
    },
    {
      id: 204,
      name: "Luxury Single AC Room",
      type: "Single",
      price: 12000,
      location: { city: "Indore", area: "MG Road" },
      capacity: 1,
      amenities: ["WiFi", "AC", "Attached Bath", "TV"],
      area: "140 sq ft",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500",
    },
    {
      id: 205,
      name: "Budget Double Room",
      type: "Double",
      price: 4500,
      location: { city: "Indore", area: "Nipania" },
      capacity: 2,
      amenities: ["WiFi", "Fan"],
      area: "130 sq ft",
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500",
    },
    {
      id: 206,
      name: "Premium Single Room",
      type: "Single",
      price: 10000,
      location: { city: "Indore", area: "Scheme 54" },
      capacity: 1,
      amenities: ["WiFi", "AC", "Attached Bath", "Geyser"],
      area: "125 sq ft",
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500",
    },
  ];

  const [filteredProperties] = useState(roomsProperties);

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-purple-50/50 to-white min-h-screen">
      {/* Top Navigation Buttons */}
      <div className="text-center mb-8">
        <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6">
          <button 
            onClick={() => navigate('/rent')}
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
          >
            Rent
          </button>
          <button 
            onClick={() => navigate('/sale')}
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
          >
            Sale
          </button>
          <button 
            onClick={() => navigate('/rooms')}
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-br from-[#0b4f91] via-[#0c2344] to-[#1565c0] text-white shadow-2xl min-w-[120px]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">Rooms</span>
          </button>
          <button 
            onClick={() => navigate('/pg')}
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
          >
            PG
          </button>
          <button 
            onClick={() => navigate('/hostels')}
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg bg-white border-2 border-[#0b4f91] text-[#0b4f91] hover:bg-[#0b4f91] hover:text-white transition-all min-w-[120px]"
          >
            Hostels
          </button>
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
              Rooms for Rent
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Find affordable rooms with great amenities</p>
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
              {selectedType || "Room Type"}
              <ChevronDown size={18} />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-40 bg-white shadow-md rounded-lg border p-2">
                {["Single", "Double", "Triple"].map((t) => (
                  <p
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-orange-50 rounded-md"
                  >
                    {t} Sharing
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
                {["Under 5K", "5K-8K", "8K-12K", "Above 12K"].map((b) => (
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
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                ₹{property.price.toLocaleString()}/mo
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Users size={14} />
                {property.capacity} Person
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

              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities.slice(0, 3).map((amenity, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5 text-center text-gray-700">
                <div>
                  <BedDouble size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">{property.area}</p>
                </div>
                <div>
                  <Wifi size={20} className="mx-auto text-orange-500" />
                  <p className="text-sm mt-1">WiFi</p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-purple-600 uppercase tracking-wider">
                {property.type} Sharing
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
            className="px-6 py-3 bg-white border border-purple-500 text-purple-600 rounded-xl disabled:opacity-50 hover:bg-purple-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-5 py-3 rounded-xl ${
                currentPage === i + 1
                  ? "bg-purple-600 text-white"
                  : "bg-white border border-purple-300 text-purple-600 hover:bg-purple-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white border border-purple-500 text-purple-600 rounded-xl disabled:opacity-50 hover:bg-purple-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default RoomsListingPage;