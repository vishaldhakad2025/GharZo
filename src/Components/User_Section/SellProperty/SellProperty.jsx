import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

function SellProperty() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch real properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get('https://api.gharzoreality.com/api/seller/sellerproperties');

        if (res.data.success) {
          // Clean and prepare properties data
          const cleanedProperties = res.data.properties.map((prop) => ({
            ...prop,
            // Filter valid images (remove "undefined" paths) and take first one for card
            image: (() => {
              const validImg = prop.images?.filter((img) => img && !img.includes("undefined")).slice(0, 1)[0];
              if (!validImg) return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500"; // Fallback placeholder
              return validImg.startsWith('http') ? validImg : `${baseurl}${validImg}`;
            })(),
            location: `${prop.address || ""}, ${prop.city || ""}, ${prop.state || ""}`.replace(/, /g, " ").trim(),
            amenitiesText: prop.amenities ? prop.amenities.join(", ") : "None",
          }));
          setProperties(cleanedProperties);
          setFilteredProperties(cleanedProperties);
        } else {
          setError(res.data.message || "Failed to fetch properties.");
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch properties."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on search (real-time)
  useEffect(() => {
    const filtered = properties.filter((property) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        property.name.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower) ||
        property.state?.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower)
      );
    });
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  const handleReset = () => {
    setSearchTerm('');
    setError(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] py-12 px-4 flex justify-center items-center">
        <div className="text-center text-red-600 font-semibold">
          {error}
          <button
            onClick={handleReset}
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-6" data-aos="fade-down">
        My Properties
      </h1>

      {/* Filter Section (Simplified: Only Search) */}
      <div className="max-w-5xl mx-auto mb-8 bg-white/30 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-4 flex flex-wrap items-center gap-4 justify-center">
        <input
          type="text"
          placeholder="Search by name, address, city, or state"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-80 bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
          <p className="text-center text-gray-500">
            {searchTerm ? "No properties match your search." : "No properties found."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property, index) => (
              <div
                key={property._id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={() =>
                  navigate(`/sell/${property._id}`, { state: property })
                }
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500";
                  }}
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800">{property.name}</h2>
                  <p className="text-sm text-gray-600 mb-1">{property.location}</p>
                  <p className="text-gray-700 font-semibold mb-1">
                    {property.type} • {property.amenitiesText}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">{property.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellProperty;