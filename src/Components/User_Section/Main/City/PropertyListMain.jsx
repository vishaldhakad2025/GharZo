import React, { useState, useEffect } from "react";
import { MapPin, Search, Heart, BedDouble, DoorOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const PropertyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [liked, setLiked] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Extract city from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const selectedCity = queryParams.get("city") || "";

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://api.gharzoreality.com/api/public/all-properties",
          {
            cache: "no-cache",
          }
        );
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter properties (only show active ones)
  const filteredProperties = properties
    .filter((property) => property.isActive === true)
    .filter((property) => {
      const matchesSearch =
        property.name?.toLowerCase().includes(search.toLowerCase()) ||
        property.location?.address
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(search.toLowerCase());

      const matchesType = selectedType
        ? property.type?.toLowerCase() === selectedType.toLowerCase()
        : true;

      const matchesMinPrice = minPrice
        ? property.lowestPrice >= Number(minPrice)
        : true;
      const matchesMaxPrice = maxPrice
        ? property.lowestPrice <= Number(maxPrice)
        : true;
      const matchesCity = selectedCity
        ? property.location?.city?.toLowerCase() === selectedCity.toLowerCase()
        : true;

      return (
        matchesSearch &&
        matchesType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesCity
      );
    });

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Reset filters
  const handleReset = () => {
    setSearch("");
    setSelectedType("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] px-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Explore All Properties
      </h1>

      {/* Filter Section */}
      <div className="max-w-5xl mx-auto mb-12 p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <div className="relative w-full sm:w-56">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, city, or address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border p-2 rounded-full w-full"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border p-2 rounded-full w-full sm:w-44"
          >
            <option value="">All Types</option>
            <option value="PG">PG</option>
            <option value="Hostel">Hostel</option>
            <option value="Villas">Villas</option>
            <option value="Rental">Rental</option>
            <option value="Luxury Bungalows">Luxury Bungalows</option>
            <option value="4 BHK">4 BHK</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border p-2 rounded-full w-full sm:w-28"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border p-2 rounded-full w-full sm:w-28"
          />

          <button
            onClick={handleReset}
            className="bg-red-400 px-4 py-2 rounded-full text-white font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-500">No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => {
                if (property.id) {
                  navigate(`/details/${property.id}`);
                }
              }}
            >
              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(property.id);
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:scale-110 transition"
              >
                <Heart
                  className={
                    liked.includes(property.id)
                      ? "text-red-500"
                      : "text-gray-400"
                  }
                  size={18}
                  fill={liked.includes(property.id) ? "red" : "none"}
                />
              </button>

              {/* Carousel */}
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="w-full h-56"
              >
                {property.images && property.images.length > 0 ? (
                  property.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        alt={property.name}
                        className="w-full h-56 object-cover"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <img
                      src="https://via.placeholder.com/400x250"
                      alt="No Image"
                      className="w-full h-56 object-cover"
                    />
                  </SwiperSlide>
                )}
              </Swiper>

              {/* Details */}
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  {property.name}
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    AVAILABLE
                  </span>
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin size={14} className="text-gray-400" />
                  {property.location?.address}, {property.location?.city}
                </p>

                

                <p className="text-sm text-gray-600 font-medium mt-1">
                  {property.type}
                </p>

                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-gray-700 text-sm font-medium">
                    <DoorOpen className="text-blue-500" size={18} />
                    {property.totalRooms} Rooms
                  </span>
                  <span className="flex items-center gap-1 text-gray-700 text-sm font-medium">
                    <BedDouble className="text-purple-500" size={18} />
                    {property.totalBeds} Beds
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
