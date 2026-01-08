import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fallbackImage = "https://via.placeholder.com/400x300?text=No+Image+Available";

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("https://api.gharzoreality.com/api/pm/properties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch properties. Please try again later.");
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleImageError = (propertyId) => {
    setImageErrors((prev) => ({ ...prev, [propertyId]: true }));
  };

  const handleViewDetails = (id) => {
    navigate(`/property-manager/propertylist/${id}`);
  };

  // Helper function to calculate total bedrooms and bathrooms
  const calculateRoomDetails = (rooms) => {
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return { bedrooms: 0, bathrooms: 0 };
    }

    const totalBedrooms = rooms.reduce((sum, room) => {
      return sum + (room?.facilities?.propertySpecific?.bedrooms || 0);
    }, 0);

    const totalBathrooms = rooms.reduce((sum, room) => {
      return sum + (room?.facilities?.propertySpecific?.bathrooms || 0);
    }, 0);

    return { bedrooms: totalBedrooms, bathrooms: totalBathrooms };
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Yeh heading add ki hai */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            Assigned Properties
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage and view all properties assigned to you
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-base sm:text-lg md:text-xl italic animate-pulse">
              Loading properties...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500 text-base sm:text-lg md:text-xl italic">{error}</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {properties.map((prop) => {
              const { bedrooms, bathrooms } = calculateRoomDetails(prop.rooms);

              return (
                <div
                  key={prop._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-200">
                    <img
                      src={imageErrors[prop._id] ? fallbackImage : prop.images?.[0] || fallbackImage}
                      alt={prop.name || "Property"}
                      className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
                      onError={() => handleImageError(prop._id)}
                      loading="lazy"
                    />
                    {imageErrors[prop._id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-300 bg-opacity-75">
                        <span className="text-gray-600 text-sm sm:text-base font-medium">
                          Image not available
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center justify-between">
                      <span className="truncate">{prop.name || "Unnamed Property"}</span>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        #{prop.propertyId || "N/A"}
                      </span>
                    </h3>
                    {/* Baaki sab same hai... */}
                    {/* (neeche ka code bilkul same rakha hai jaise tha) */}
                    
                    <p className="text-gray-600 text-sm sm:text-base mb-2 flex items-center space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="font-medium">Address:</span>
                      <span className="truncate">
                        {prop.address
                          ? `${prop.address}, ${prop.city}, ${prop.state} ${prop.pinCode}`
                          : "N/A"}
                      </span>
                    </p>
                   
                    <p className="text-gray-600 text-sm:text-base mb-2 flex items-center space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                        <path d="M0 0h24v24H0z" fill="none" />
                      </svg>
                      <span className="font-medium">Total Rooms:</span>
                      <span>{prop.totalRooms !== undefined ? prop.totalRooms : "N/A"}</span>
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base mb-3 flex items-center space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                        <path d="M0 0h24v24H0z" fill="none" />
                      </svg>
                      <span className="font-medium">Total Beds:</span>
                      <span>{prop.totalBeds !== undefined ? prop.totalBeds : "N/A"}</span>
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mb-4 line-clamp-2">
                      {prop.description || "No description available"}
                    </p>
                    <p className="mb-4">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${
                          prop.rooms?.[0]?.status === "Available"
                            ? "bg-amber-100 text-amber-800"
                            : prop.rooms?.[0]?.status === "Occupied"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {prop.rooms?.[0]?.status || "Unknown"}
                      </span>
                    </p>
                    <button
                      onClick={() => handleViewDetails(prop._id)}
                      className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-base sm:text-lg md:text-xl italic">
              No properties assigned yet. Contact your admin to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;