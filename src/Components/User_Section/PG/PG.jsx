import React, { useState, useEffect } from "react";
import {
  FaBed,
  FaCar,
  FaRulerCombined,
  FaUser,
  FaCalendarAlt,
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

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        const res = await fetch("https://api.gharzoreality.com/api/public/properties/PG", {
          headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjI4MjBiMjNkMTBlNjgwODZiMWRjMSIsInJvbGUiOiJsYW5kbG9yZCIsIm1vYmlsZSI6IjcwNDk0MzM1MjAiLCJlbWFpbCI6InJhdGhvcmVzdW11MTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NTcwNTQyODIsImV4cCI6MTc1OTY0NjI4Mn0.oWTceC9jnmKZzK1FfAa9Sg3tWiXOxroaG4VrMVdET9g",
          },
        });
        const json = await res.json();
        // No need to filter for "room" as all properties are "PG"
        setPgData(json.properties || []);
        setFilteredData(json.properties || []);
      } catch (err) {
        console.error("Failed to fetch PG data:", err);
      }
    };

    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const filtered = pgData.filter((pg) => {
      const cityMatch = formData.city
        ? pg.location?.city?.toLowerCase().includes(formData.city.toLowerCase())
        : true;

      const bedrooms = Math.round(pg.totalBeds / pg.totalRooms);
      const bedroomMatch = formData.bedrooms
        ? formData.bedrooms === "4"
          ? bedrooms >= 4
          : bedrooms === parseInt(formData.bedrooms)
        : true;

      const price = parseInt(pg.lowestPrice);
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
    setFilteredData(pgData);
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

  return (
    <div className="min-h-screen bg-[#f6f8fa] px-4 py-10 md:px-10">
      <h2
        className="text-3xl font-bold text-center mb-6 text-blue-700"
        data-aos="fade-down"
      >
        Discover Our PG Listings
      </h2>

      {/* Filter Section */}
      <div
        className="max-w-5xl mx-auto mb-8 bg-white/30 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-4 flex flex-wrap items-center gap-4 justify-center"
        style={{ boxShadow: "0 0 12px rgba(59,130,246,0.6)", minHeight: "80px" }}
        data-aos="fade-up"
      >
        <input
          type="text"
          name="city"
          placeholder="Search by city"
          value={formData.city}
          onChange={handleFormChange}
          className="border border-blue-500/50 p-2 rounded w-56 bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minWidth: 180 }}
        />

        <select
          name="bedrooms"
          value={formData.bedrooms}
          onChange={handleFormChange}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Bedrooms</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>

        <select
          name="priceRange"
          value={formData.priceRange}
          onChange={handleFormChange}
          className="border border-blue-500/50 p-2 rounded w-44 bg naturally/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Prices</option>
          <option value="1000-5000">Rs 1K - 5K</option>
          <option value="5000-10000">Rs 5K - 10K</option>
          <option value="10000-20000">Rs 10K - 20K</option>
          <option value="30000-40000">Rs 30K - 40K</option>
          <option value="50000-100000">Rs 50K - 100K</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 shadow-lg"
          style={{ height: 42 }}
        >
          Search
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
          style={{ height: 42 }}
        >
          Reset
        </button>
      </div>

      {/* PG Cards */}
      <div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-12"
        data-aos="fade-up"
      >
        {filteredData.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No PGs found.</p>
        ) : (
          filteredData.map((pg, index) => (
            <div
              key={pg.id}
              onClick={() => handlePgClick(pg)}
              className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={
                    pg.images?.[0] ||
                    "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2024/Nov/13/full_photo/GR2-471613-2308051.jpeg"
                  }
                  alt={pg.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{pg.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {pg.location?.city}, {pg.location?.state}
                </p>

                <div className="flex flex-wrap text-sm text-gray-700 gap-4 mb-2">
                  <span className="flex items-center gap-1">
                    <FaBed /> {Math.round(pg.totalBeds / pg.totalRooms) || "N/A"} Beds/Room
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCar /> Parking: N/A
                  </span>
                  <span className="flex items-center gap-1">
                    <FaRulerCombined /> Size: N/A
                  </span>
                </div>

                <div className="text-base font-semibold text-black mb-1">
                  ₹ {pg.lowestPrice || "N/A"}
                </div>
                <div className="text-yellow-500 text-sm mb-1">
                  ★★★★★ <span className="text-gray-500">(0 reviews)</span>
                </div>
                <div className="text-sm font-medium text-gray-600 mb-3">
                  Type: {pg.type}
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaUser /> {pg.landlordInfo?.name || "Admin"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
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