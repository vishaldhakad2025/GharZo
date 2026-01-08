import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view properties", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/sub_owner_login");
          return;
        }

        const response = await fetch(
          "https://api.gharzoreality.com/api/sub-owner/properties",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          setProperties(data.properties);
        } else {
          toast.error("Failed to fetch properties", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("An error occurred while fetching properties", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate]);

  const handleCardClick = (propertyId) => {
    navigate(`/sub_owner/property/${propertyId}`);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">
        Properties
      </h1>

      {loading ? (
        <div className="text-center text-gray-600">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center text-gray-600">No properties found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => handleCardClick(property.id)}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
            >
              {/* Carousel */}
              <div className="relative h-32 sm:h-48">
                <Carousel
                  autoPlay
                  infiniteLoop
                  showThumbs={false}
                  showStatus={false}
                  interval={3000}
                  showArrows={false}
                  className="h-full"
                >
                  {property.images.map((image, index) => (
                    <div key={index} className="h-32 sm:h-48">
                      <img
                        src={image}
                        alt={`${property.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </Carousel>
              </div>

              {/* Property Details */}
              <div className="p-3 sm:p-4 flex justify-between items-start">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-1">
                    {property.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-1">
                    {property.city}
                  </p>
                </div>
                <span className="bg-green-500 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                  {property.type}
                </span>
              </div>

              {/* Assigned Date */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <span className="bg-orange-500 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-md">
                  Assigned:{" "}
                  {new Date(
                    property.assignment.assignedDate
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Property;
