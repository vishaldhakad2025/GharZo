import React, { useState, useEffect } from "react";
import {
  FaBed,
  FaCar,
  FaRulerCombined,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome,
  FaShieldAlt,
  FaUtensils,
  FaWifi,
  FaShower,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Login from "../Login&Signup/Login";
import Signup from "../Login&Signup/UserSignup";
import AOS from "aos";
import "aos/dist/aos.css";

const PG = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    city: "",
    bedrooms: "",
    priceRange: "",
  });

  const [pgData, setPgData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedPg, setSelectedPg] = useState(null);

  // Enhanced PG data with better sample properties
  const enhancedPGData = [
    {
      id: "1",
      name: "Sunshine PG - Premium Boys Hostel",
      type: "PG",
      lowestPrice: 6500,
      totalBeds: 24,
      totalRooms: 6,
      images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
      location: {
        city: "Indore",
        state: "Madhya Pradesh",
        area: "Vijay Nagar",
        landmark: "Near IIM Indore",
      },
      amenities: ["AC", "Wifi", "Food", "Laundry", "Parking", "Security"],
      rating: 4.8,
      reviews: 127,
      landlordInfo: { name: "Rajesh Sharma" },
      isVerified: true,
      distance: "2.5 km from city center",
    },
    {
      id: "2",
      name: "Prestige Girls PG - Luxury Stay",
      type: "PG",
      lowestPrice: 8500,
      totalBeds: 18,
      totalRooms: 5,
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"],
      location: {
        city: "Indore",
        state: "Madhya Pradesh",
        area: "Palasia",
        landmark: "Near Sarafa Bazaar",
      },
      amenities: ["AC", "Wifi", "Food", "Gym", "Parking", "Security", "Power Backup"],
      rating: 4.9,
      reviews: 89,
      landlordInfo: { name: "Priya Patel" },
      isVerified: true,
      distance: "1.8 km from city center",
    },
    // ... rest of your data remains unchanged ...
  ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });

    setPgData(enhancedPGData);
    setFilteredData(enhancedPGData);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const filtered = enhancedPGData.filter((pg) => {
      const cityMatch = formData.city
        ? pg.location?.city?.toLowerCase().includes(formData.city.toLowerCase())
        : true;

      const bedrooms = Math.round(pg.totalBeds / pg.totalRooms);
      const bedroomMatch = formData.bedrooms
        ? formData.bedrooms === "4"
          ? bedrooms >= 4
          : bedrooms === parseInt(formData.bedrooms)
        : true;

      const price = pg.lowestPrice;
      const priceMatch = (() => {
        if (formData.priceRange === "1000-5000") return price >= 1000 && price <= 5000;
        if (formData.priceRange === "5000-10000") return price > 5000 && price <= 10000;
        if (formData.priceRange === "10000-20000") return price > 10000 && price <= 20000;
        if (formData.priceRange === "30000-40000") return price > 30000 && price <= 40000;
        if (formData.priceRange === "50000-100000") return price > 50000 && price <= 100000;
        return true;
      })();

      return cityMatch && bedroomMatch && priceMatch;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setFormData({ city: "", bedrooms: "", priceRange: "" });
    setFilteredData(enhancedPGData);
  };

  const handlePgClick = (pg) => {
    if (!user) {
      setSelectedPg(pg);
      setShowLogin(true);
    } else if (!user.isRegistered) {
      setSelectedPg(pg);
      setShowSignup(true);
    } else {
      navigate(`/pg/${pg.id}`, { state: pg });
    }
  };

  const handleSignupComplete = () => {
    setShowSignup(false);
    if (selectedPg) {
      navigate(`/pg/${selectedPg.id}`, { state: selectedPg });
    }
  };

  const handleTenantLogin = () => {
    navigate("/tenant_login");
  };

  const handleLandlordLogin = () => {
    navigate("/landlord_login");
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  const renderAmenities = (amenities) => {
    const iconMap = {
      AC: <FaHome className="text-blue-500" />,
      Wifi: <FaWifi className="text-purple-500" />,
      Food: <FaUtensils className="text-green-500" />,
      Laundry: <FaShower className="text-pink-500" />,
      Parking: <FaCar className="text-orange-500" />,
      Security: <FaShieldAlt className="text-red-500" />,
      Gym: <FaRulerCombined className="text-indigo-500" />,
    };

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {amenities.slice(0, 4).map((amenity, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
          >
            {iconMap[amenity] || <FaHome className="text-gray-500" />}
            {amenity}
          </span>
        ))}
        {amenities.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
            +{amenities.length - 4} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-10 md:px-10">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Header with Action Buttons */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          <div className="text-center lg:text-left">
            <h2
              className="text-2xl md:text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
              data-aos="fade-down"
            >
              Discover Premium PG Accommodations
            </h2>
            {/* <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Find your perfect PG stay with modern amenities, prime locations, and exceptional comfort
            </p> */}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleTenantLogin}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <FaUser className="w-5 h-5" />
              Login as Tenant
            </button>

            <button
              onClick={handleLandlordLogin}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <FaHome className="w-5 h-5" />
              List Your Property
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div
        className="max-w-6xl mx-auto mb-12"
        data-aos="fade-up"
      >
        <div className="bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-xl rounded-2xl p-6 flex flex-col lg:flex-row items-center gap-4 justify-center">
          <input
            type="text"
            name="city"
            placeholder="🔍 Search by city or area (e.g., Indore, Vijay Nagar)"
            value={formData.city}
            onChange={handleFormChange}
            className="flex-1 max-w-md border border-blue-300/50 p-3 rounded-xl bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />

          <select
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleFormChange}
            className="w-full max-w-48 border border-blue-300/50 p-3 rounded-xl bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">🏠 All Room Types</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>

          <select
            name="priceRange"
            value={formData.priceRange}
            onChange={handleFormChange}
            className="w-full max-w-48 border border-blue-300/50 p-3 rounded-xl bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">💰 All Prices</option>
            <option value="1000-5000">₹1K - ₹5K</option>
            <option value="5000-10000">₹5K - ₹10K</option>
            <option value="10000-20000">₹10K - ₹20K</option>
            <option value="30000-40000">₹30K - ₹40K</option>
            <option value="50000-100000">₹50K - ₹1L</option>
          </select>

          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap"
          >
            🔍 Search PGs
          </button>

          <button
            onClick={handleReset}
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Enhanced PG Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {filteredData.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaHome className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No PGs Found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          ) : (
            filteredData.map((pg, index) => (
              <div
                key={pg.id}
                onClick={() => handlePgClick(pg)}
                className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Enhanced Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pg.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"}
                    alt={pg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    ₹{pg.lowestPrice}/month
                  </div>

                  {/* Verified Badge */}
                  {pg.isVerified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <FaShieldAlt className="w-3 h-3" />
                      Verified
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    {renderStars(pg.rating)}
                    <span className="text-blue-300">({pg.reviews})</span>
                  </div>
                </div>

                {/* Enhanced Content Section */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {pg.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span className="text-sm font-medium">
                        {pg.location.area}, {pg.location.city}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      📍 {pg.location.landmark} • {pg.distance}
                    </p>
                  </div>

                  {renderAmenities(pg.amenities)}

                  <div className="grid grid-cols-3 gap-3 mt-4 mb-4 text-sm">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <FaBed className="text-blue-500 w-5 h-5 mb-1" />
                      <span className="font-semibold text-gray-800">
                        {Math.round(pg.totalBeds / pg.totalRooms)} Beds/Room
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <FaHome className="text-green-500 w-5 h-5 mb-1" />
                      <span className="font-semibold text-gray-800">
                        {pg.totalRooms} Rooms
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <FaCar className="text-orange-500 w-5 h-5 mb-1" />
                      <span className="font-semibold text-gray-800">
                        {pg.amenities.includes("Parking") ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      <FaHome className="w-3 h-3" />
                      {pg.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FaUser className="w-3 h-3" />
                      {pg.landlordInfo?.name}
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                    View Details & Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="text-center mt-8 py-6 bg-white/50 rounded-xl">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredData.length}</span> 
              out of <span className="font-semibold text-blue-600">{enhancedPGData.length}</span> PG properties
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons Footer (Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 flex gap-4 z-50">
        <button
          onClick={handleTenantLogin}
          className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Tenant Login
        </button>
        <button
          onClick={handleLandlordLogin}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          List Property
        </button>
      </div>

      {showLogin && (
        <Login
          role="User"
          onClose={() => setShowLogin(false)}
          onRegisterClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && <Signup onClose={handleSignupComplete} />}
    </div>
  );
};

export default PG;