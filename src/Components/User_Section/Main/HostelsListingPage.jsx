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
  Utensils,
  Shield,
  Wifi,
  Dumbbell,
  WashingMachine,
  ArrowLeft,
} from "lucide-react";

const HostelsListingPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const propertiesPerPage = 9;

  // ────────────────────────────── Better Dummy Hostel Data ──────────────────────────────
  const hostelsProperties = [
    {
      id: 501,
      name: "Vijay Nagar Premium Boys Hostel",
      type: "Boys",
      price: 8500,
      location: { city: "Indore", area: "Vijay Nagar" },
      totalBeds: 48,
      totalRooms: 16,
      amenities: ["AC", "WiFi", "Mess", "Laundry", "CCTV", "Gym"],
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      rating: 4.7,
      isVerified: true,
    },
    {
      id: 502,
      name: "Palasia Girls Luxury Hostel",
      type: "Girls",
      price: 9200,
      location: { city: "Indore", area: "Palasia" },
      totalBeds: 36,
      totalRooms: 12,
      amenities: ["AC", "WiFi", "Food", "Security 24×7", "Washing Machine"],
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      rating: 4.8,
      isVerified: true,
    },
    {
      id: 503,
      name: "Scheme 54 Co-living Hostel",
      type: "Co-ed",
      price: 10500,
      location: { city: "Indore", area: "Scheme 54" },
      totalBeds: 64,
      totalRooms: 24,
      amenities: ["WiFi", "Mess", "Gym", "Gaming Zone", "Study Room"],
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
      rating: 4.6,
      isVerified: true,
    },
    // ... rest of your hostel data remains unchanged ...
  ];

  const filteredProperties = hostelsProperties.filter((prop) => {
    const matchesSearch = searchQuery
      ? prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.area.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesType = selectedType ? prop.type === selectedType : true;

    const matchesBudget = (() => {
      if (!selectedBudget) return true;
      if (selectedBudget === "Under 7K") return prop.price <= 7000;
      if (selectedBudget === "7K-9K") return prop.price > 7000 && prop.price <= 9000;
      if (selectedBudget === "9K-11K") return prop.price > 9000 && prop.price <= 11000;
      if (selectedBudget === "Above 11K") return prop.price > 11000;
      return true;
    })();

    return matchesSearch && matchesType && matchesBudget;
  });

  const indexOfLast = currentPage * propertiesPerPage;
  const indexOfFirst = indexOfLast - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-orange-50/50 to-white min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Top Category Navigation */}
      <div className="text-center mb-8">
        
      </div>

      {/* Header + Action Buttons */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Best Hostels in Indore
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Safe • Comfortable • Affordable hostel accommodation
            </p>
          </div>

          {/* Action Buttons - Left: Tenant Login | Right: List Property */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate("/tenant_login")}
              className="flex-1 px-7 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 min-w-[220px]"
            >
              <Users size={20} />
              Login as Tenant
            </button>

            <button
              onClick={() => navigate("/landlord_login")}
              className="flex-1 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 min-w-[220px]"
            >
              <Plus size={20} />
              List Your Property
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-5 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
            <input
              type="text"
              placeholder="Search by city, area, landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-300" />

          {/* Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700 min-w-[160px]"
            >
              <Home size={18} />
              {selectedType || "Hostel Type"}
              <ChevronDown size={18} />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-50 mt-2 w-44 bg-white shadow-lg rounded-xl border p-2">
                {["Boys", "Girls", "Co-ed"].map((t) => (
                  <p
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className="p-2.5 cursor-pointer hover:bg-orange-50 rounded-lg"
                  >
                    {t}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Budget Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 hover:border-orange-400 text-gray-700 min-w-[160px]"
            >
              <IndianRupee size={18} />
              {selectedBudget || "Budget"}
              <ChevronDown size={18} />
            </button>
            {showBudgetDropdown && (
              <div className="absolute z-50 mt-2 w-52 bg-white shadow-lg rounded-xl border p-2">
                {["Under 7K", "7K-9K", "9K-11K", "Above 11K"].map((b) => (
                  <p
                    key={b}
                    onClick={() => {
                      setSelectedBudget(b);
                      setShowBudgetDropdown(false);
                    }}
                    className="p-2.5 cursor-pointer hover:bg-orange-50 rounded-lg"
                  >
                    {b}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hostel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-7xl mx-auto">
        {currentProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -10, scale: 1.03 }}
            onClick={() => handlePropertyClick(property.id)}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 border border-gray-100"
          >
            <div className="relative">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                ₹{property.price.toLocaleString()}/mo
              </div>

              {property.isVerified && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                  <Shield size={14} />
                  Verified
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {property.name}
              </h3>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={18} className="text-orange-500 mr-1.5" />
                <span className="text-sm">
                  {property.location.city} • {property.location.area}
                </span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-5">
                {property.amenities.slice(0, 4).map((amenity, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium flex items-center gap-1"
                  >
                    {amenity.includes("WiFi") && <Wifi size={14} />}
                    {amenity.includes("Mess") && <Utensils size={14} />}
                    {amenity.includes("Laundry") && <WashingMachine size={14} />}
                    {amenity.includes("Gym") && <Dumbbell size={14} />}
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center text-gray-700 mb-5">
                <div>
                  <BedDouble size={22} className="mx-auto text-orange-500 mb-1" />
                  <p className="text-sm font-semibold">{property.totalBeds} Beds</p>
                </div>
                <div>
                  <Home size={22} className="mx-auto text-orange-500 mb-1" />
                  <p className="text-sm font-semibold">{property.totalRooms} Rooms</p>
                </div>
                <div>
                  <Users size={22} className="mx-auto text-orange-500 mb-1" />
                  <p className="text-sm font-semibold">{property.type}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-yellow-500">
                  {"★".repeat(Math.floor(property.rating))}
                  <span className="text-gray-500 text-xs ml-1">({property.rating})</span>
                </div>
                <button className="text-orange-600 font-medium text-sm hover:underline">
                  View Details →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-16 gap-3 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-8 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl disabled:opacity-40 hover:bg-orange-50 transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                currentPage === i + 1
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-white border border-orange-200 text-orange-600 hover:bg-orange-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-8 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl disabled:opacity-40 hover:bg-orange-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default HostelsListingPage;