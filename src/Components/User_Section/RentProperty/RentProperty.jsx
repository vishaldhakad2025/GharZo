import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBed,
  FaCar,
  FaRulerCombined,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const RentProperty = () => {
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [rooms, setRooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [gender, setGender] = useState("");
  const [propertyType, setPropertyType] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        const res = await axios.get("https://api.gharzoreality.com/api/public/all-properties");
        console.log("API Response:", res.data); // Debug log
        const raw = res.data;

        if (raw?.properties && Array.isArray(raw.properties)) {
          const formatted = raw.properties.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.images?.[0] || "",
            images: item.images || [],
            city: item.location?.city || "",
            state: item.location?.state || "",
            location: `${item.location?.city}, ${item.location?.state}`,
            price: item.lowestPrice || item.price || 0,
            bedrooms: item.totalBeds, // Using totalBeds as a proxy for bedrooms
            area: item.area || "",
            description: item.description || "",
            propertyType: item.type,
            totalRooms: item.totalRooms,
            totalBeds: item.totalBeds,
            createdAt: item.createdAt || new Date().toISOString(),
            gender: item.rooms && item.rooms.length > 0 && item.rooms[0].allFacilities?.propertySpecific?.genderSpecific
              ? item.rooms[0].allFacilities.propertySpecific.genderSpecific.toLowerCase()
              : "unisex",
          }));
          setPropertyData(formatted);
          setFilteredProperties(formatted);
        } else {
          console.error("Unexpected API response:", raw);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-filter on state changes
  useEffect(() => {
    const filtered = propertyData.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesCity = city
        ? property.city.toLowerCase() === city.toLowerCase()
        : true;

      const matchesType = propertyType
        ? property.propertyType.toLowerCase() === propertyType.toLowerCase()
        : true;

      const matchesRooms = rooms
        ? (rooms === "4" ? property.totalRooms >= 4 : property.totalRooms === parseInt(rooms))
        : true;

      const matchesGender = gender
        ? property.gender.toLowerCase() === gender.toLowerCase()
        : true;

      const price = property.price;
      const matchesPrice = (() => {
        if (priceRange === "0-5000") return price <= 5000;
        if (priceRange === "5001-6000") return price > 5000 && price <= 6000;
        if (priceRange === "6001-7000") return price > 6000 && price <= 7000;
        if (priceRange === "7001+") return price > 7000;
        return true;
      })();

      return matchesSearch && matchesCity && matchesType && matchesRooms && matchesGender && matchesPrice;
    });

    setFilteredProperties(filtered);
  }, [debouncedSearchTerm, city, rooms, priceRange, gender, propertyType, propertyData]);

  const handleReset = () => {
    setSearchTerm("");
    setCity("");
    setRooms("");
    setPriceRange("");
    setGender("");
    setPropertyType("");
    // Filtered will auto-update via useEffect
  };

  const handleCardClick = (property) => {
    navigate(`/rent/${property.id}`, { state: property });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">All Rent Properties</h2>

      {/* Filter Section */}
      <div
        className="max-w-5xl mx-auto mb-8 bg-white/30 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-4 flex flex-wrap items-center gap-4 justify-center"
        style={{ boxShadow: "0 0 12px rgba(59,130,246,0.6)", minHeight: "80px" }}
      >
        <input
          type="text"
          placeholder="Search by name, city or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-56 bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {[...new Set(propertyData.map(p => p.propertyType).filter(type => type))].sort().map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {[...new Set(propertyData.map(p => p.city).filter(cityName => cityName))].sort().map(cityName => (
            <option key={cityName} value={cityName}>{cityName}</option>
          ))}
        </select>

        <select
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Rooms</option>
          <option value="1">1 Room</option>
          <option value="2">2 Rooms</option>
          <option value="3">3 Rooms</option>
          <option value="4">4+ Rooms</option>
        </select>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Prices</option>
          <option value="0-5000">₹0 - ₹5,000</option>
          <option value="5001-6000">₹5,001 - ₹6,000</option>
          <option value="6001-7000">₹6,001 - ₹7,000</option>
          <option value="7001+">₹7,001+</option>
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-40 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Genders</option>
          <option value="girl">Girls</option>
          <option value="boy">Boys</option>
          <option value="unisex">Unisex</option>
        </select>

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
        >
          Reset
        </button>
      </div>

      {/* Property Cards */}
      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <p className="text-center text-gray-500">No properties found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                onClick={() => handleCardClick(property)}
                className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={property.images?.[0] || "https://via.placeholder.com/400x300"}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{property.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {property.city}, {property.state}
                  </p>

                  <div className="flex flex-wrap text-sm text-gray-700 gap-4 mb-2">
                    <span className="flex items-center gap-1">
                      <FaBed /> {Math.round(property.totalBeds / property.totalRooms) || "N/A"} Beds/Room
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCar /> Parking: N/A
                    </span>
                    <span className="flex items-center gap-1">
                      <FaRulerCombined /> Size: {property.area || "N/A"}
                    </span>
                  </div>

                  <div className="text-base font-semibold text-black mb-1">
                    ₹ {property.price > 0 ? property.price : "N/A"}
                  </div>

                  <div className="text-sm font-medium text-gray-600 mb-3">
                    Type: {property.propertyType} | {property.gender.charAt(0).toUpperCase() + property.gender.slice(1)}
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentProperty;