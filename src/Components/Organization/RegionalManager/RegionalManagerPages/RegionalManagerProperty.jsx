import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://api.gharzoreality.com";

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // 'my' or 'assign'
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view properties", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/sub_owner_login");
          return;
        }

        if (activeTab === "my") {
          // Fetch my properties
          const response = await fetch(`${API_BASE}/api/rm/properties`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok && data.success) {
            setProperties(data.properties);
          } else {
            toast.error("Failed to fetch my properties", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } else {
          // Fetch assigned properties
          const response = await fetch(`${API_BASE}/api/regional-managers/assigned-properties`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok && data.success && data.data) {
            setProperties(data.data);
          } else {
            toast.error("Failed to fetch assigned properties", {
              position: "top-right",
              autoClose: 3000,
            });
          }
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

    fetchData();
  }, [activeTab, navigate]);

  const handleCardClick = (propertyId) => {
    console.log("Clicked propertyId:", propertyId);
    if (activeTab === "my") {
      navigate(`/regional_manager/property/${propertyId}`, { state: { type: activeTab } });
    } else {
      navigate(`/regional_manager/assigned-property/${propertyId}`);
    }
  };

  const handleEditClick = (property) => {
    // Pass the full property data via state to prefill the edit form
    navigate("/regional_manager/edit-property", { state: { property } });
  };

  const openDeleteModal = (propertyId, propertyName) => {
    setPropertyToDelete({ id: propertyId, name: propertyName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await fetch(`${API_BASE}/api/rm/properties/${propertyToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete.id));
        toast.success(`"${propertyToDelete.name}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(data.message || "Failed to delete property", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("An error occurred while deleting property", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      closeDeleteModal();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        closeDeleteModal();
      }
    };
    if (showDeleteModal) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [showDeleteModal]);

  return (
    <>
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <ToastContainer />
        <div className="flex justify-center mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 mx-2 rounded-md font-semibold transition-colors ${
              activeTab === "my"
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-700 border border-teal-300 hover:bg-teal-50"
            }`}
          >
            My Property
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-6 py-2 mx-2 rounded-md font-semibold transition-colors ${
              activeTab === "assign"
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-700 border border-teal-300 hover:bg-teal-50"
            }`}
          >
            Assign Property
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6 text-center">
          {activeTab === "my" ? "My Properties" : "Assigned Properties"}
        </h1>

        {loading ? (
          <div className="text-center text-gray-600">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center text-gray-600">No properties found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                onClick={() => handleCardClick(property._id)}
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
                    {property.images && property.images.length > 0 ? (
                      property.images.map((image, index) => (
                        <div key={index} className="h-32 sm:h-48">
                          <img
                            src={image}
                            alt={`${property.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="h-32 sm:h-48 bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600">No images</span>
                      </div>
                    )}
                  </Carousel>
                </div>

                {/* Property Details */}
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-1">
                        {property.name}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 line-clamp-1">
                        {property.city}
                      </p>
                    </div>
                    <span className="bg-green-500 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ml-2">
                      {property.type}
                    </span>
                  </div>

                  {/* Edit and Delete Buttons - Only for My Properties */}
                  {activeTab === "my" && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(property);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(property._id, property.name);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <span className="bg-orange-500 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-md">
                    Created:{" "}
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 sm:mx-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Property;