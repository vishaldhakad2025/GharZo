import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import {
  FaBed,
  FaBath,
  FaCar,
  FaRulerCombined,
  FaCalendarAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaTrash,
} from "react-icons/fa";
import { Heart, Star, MapPin, Share2, CheckCircle2 } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ScheduleTourBox from "../ScheduleTour/ScheduleTourBox";
import user from "../../../assets/images/user.jpg";

// Facility key mapping for display
const facilityKeyMapping = {
  roomEssentials: {
    bed: "Bed",
    mattress: "Mattress",
    pillow: "Pillow",
    blanket: "Blanket",
    fan: "Fan",
    light: "Light",
    chargingPoint: "Charging Point",
    cupboardWardrobe: "Wardrobe",
    tableStudyDesk: "Study Desk",
    chair: "Chair",
    roomLock: "Room Lock",
  },
  comfortFeatures: {
    ac: "Air Conditioner",
    cooler: "Cooler",
    heater: "Heater",
    ceilingFan: "Ceiling Fan",
    window: "Window",
    balcony: "Balcony",
    ventilation: "Ventilation",
    curtains: "Curtains",
  },
  washroomHygiene: {
    attachedBathroom: "Attached Bathroom",
    commonBathroom: "Common Bathroom",
    westernToilet: "Western Toilet",
    indianToilet: "Indian Toilet",
    geyser: "Geyser",
    water24x7: "24x7 Water",
    washBasins: "Wash Basins",
    mirror: "Mirror",
    bucketMug: "Bucket & Mug",
    cleaningService: "Cleaning Service",
  },
  utilitiesConnectivity: {
    wifi: "WiFi",
    powerBackup: "Power Backup",
    electricityIncluded: "Electricity Included",
    waterIncluded: "Water Included",
    gasIncluded: "Gas Included",
    maintenanceIncluded: "Maintenance Included",
    tv: "TV",
    dthCable: "DTH Cable",
  },
  laundryHousekeeping: {
    washingMachine: "Washing Machine",
    laundryArea: "Laundry Area",
    dryingSpace: "Drying Space",
    ironTable: "Iron Table",
  },
  securitySafety: {
    cctv: "CCTV",
    biometricEntry: "Biometric Entry",
    securityGuard: "Security Guard",
    visitorRestricted: "Visitor Restricted",
    fireSafety: "Fire Safety",
  },
  parkingTransport: {
    bikeParking: "Bike Parking",
    carParking: "Car Parking",
    coveredParking: "Covered Parking",
    nearBus: "Near Bus Stop",
    nearMetro: "Near Metro",
  },
  propertySpecific: {
    sharingType: "Sharing Type",
    genderSpecific: "Gender Specific",
    curfewTiming: "Curfew Timing",
    guestAllowed: "Guest Allowed",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    hall: "Hall",
    modularKitchen: "Modular Kitchen",
    furnishingType: "Furnishing Type",
    propertyFloor: "Property Floor",
    liftAvailable: "Lift Available",
    separateEntry: "Separate Entry",
  },
  nearbyFacilities: {
    grocery: "Grocery",
    hospital: "Hospital",
    gym: "Gym",
    park: "Park",
    schoolCollege: "School/College",
    marketMall: "Market/Mall",
  },
};

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [roomImagesMap, setRoomImagesMap] = useState({});
  const [bedImagesMap, setBedImagesMap] = useState({});
  const [reels, setReels] = useState([]);
  const [postedDays, setPostedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedRooms, setExpandedRooms] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialSlide, setInitialSlide] = useState(0);
  const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

  // Reset states on unmount to ensure clean reload when navigating away and back
  useEffect(() => {
    return () => {
      setProperty(null);
      setRoomImagesMap({});
      setBedImagesMap({});
      setReels([]);
      setPostedDays(0);
      setLoading(true);
      setReelsLoading(true);
      setLiked(false);
      setActiveTab("overview");
      setExpandedRooms({});
      setShowModal(false);
      setSelectedImages([]);
      setInitialSlide(0);
    };
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `https://api.gharzoreality.com/api/public/property/${id}?_=${timestamp}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const found = response.data?.property;

        if (!found) {
          console.error("No property found in response");
          setProperty(null);
          return;
        }

        // Calculate posted days
        const calculatedPostedDays = Math.floor(
          (new Date() - new Date(found.createdAt)) / (1000 * 60 * 60 * 24)
        );

        // Add a dynamic description based on fetched data
        const updatedProperty = {
          ...found,
          description:
            found?.description ||
            `${found.name} is a premium ${
              found.type?.toLowerCase?.() || "property"
            } located at ${found.location?.address || ""}, ${
              found.location?.city || ""
            }, ${found.location?.state || ""}. This property offers ${
              found.totalRooms || 0
            } rooms and ${found.totalBeds || 0} beds, managed by ${
              found.landlord?.name || "the manager"
            }.`,
        };

        setProperty(updatedProperty);
        setPostedDays(calculatedPostedDays);
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchReels = async () => {
      setReelsLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `https://api.gharzoreality.com/api/reels?propertyId=${id}&_=${timestamp}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setReels(response.data.reels || []);
        } else {
          console.error("Failed to fetch reels:", response.data.message);
          setReels([]);
        }
      } catch (err) {
        console.error("Error fetching reels:", err);
        setReels([]);
      } finally {
        setReelsLoading(false);
      }
    };

    if (id) {
      fetchProperty();
      fetchReels();
    } else {
      // If no id, navigate back to list to prevent staying on invalid page
      navigate("/", { replace: true });
    }
  }, [id, navigate]);

  // Fetch room-specific images after property is loaded
  useEffect(() => {
    if (property && property.rooms) {
      const fetchRoomImages = async (roomId) => {
        try {
          const timestamp = new Date().getTime();
          const response = await axios.get(
            `https://api.gharzoreality.com/api/public/properties/${id}/rooms/${roomId}/images?_=${timestamp}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.success) {
            setRoomImagesMap((prev) => ({
              ...prev,
              [roomId]: response.data.images || [],
            }));
          } else {
            setRoomImagesMap((prev) => ({
              ...prev,
              [roomId]: [],
            }));
          }
        } catch (err) {
          console.error(`Error fetching images for room ${roomId}:`, err);
          setRoomImagesMap((prev) => ({
            ...prev,
            [roomId]: [],
          }));
        }
      };

      property.rooms.forEach((room) => fetchRoomImages(room.roomId));
    }
  }, [property, id]);

  // Fetch bed-specific images after property is loaded
  useEffect(() => {
    if (property && property.rooms) {
      const fetchBedImages = async (roomId, bedId) => {
        try {
          const timestamp = new Date().getTime();
          const response = await axios.get(
            `https://api.gharzoreality.com/api/public/properties/${id}/rooms/${roomId}/beds/${bedId}/images?_=${timestamp}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.success) {
            setBedImagesMap((prev) => ({
              ...prev,
              [`${roomId}-${bedId}`]: response.data.images || [],
            }));
          } else {
            setBedImagesMap((prev) => ({
              ...prev,
              [`${roomId}-${bedId}`]: [],
            }));
          }
        } catch (err) {
          console.error(`Error fetching images for bed ${bedId}:`, err);
          setBedImagesMap((prev) => ({
            ...prev,
            [`${roomId}-${bedId}`]: [],
          }));
        }
      };

      property.rooms.forEach((room) => {
        room.beds?.forEach((bed) => {
          fetchBedImages(room.roomId, bed.bedId);
        });
      });
    }
  }, [property, id]);

  const openImageModal = (images, index = 0) => {
    setSelectedImages(images);
    setInitialSlide(index);
    setShowModal(true);
  };

  const closeImageModal = () => {
    setShowModal(false);
    setSelectedImages([]);
    setInitialSlide(0);
  };

  if (loading || reelsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    // Instead of showing error, navigate back to list
    useEffect(() => {
      navigate("/", { replace: true });
    }, [navigate]);
    return null; // Or a brief loading/error message
  }

  // Map facilities to a readable format
  const features = [];
  const facilityCategories = [
    "roomEssentials",
    "comfortFeatures",
    "washroomHygiene",
    "utilitiesConnectivity",
    "laundryHousekeeping",
    "securitySafety",
    "parkingTransport",
    "propertySpecific",
    "nearbyFacilities",
  ];

  // Check commonFacilities array
  property.commonFacilities?.forEach((facility) => {
    facilityCategories.forEach((category) => {
      if (facilityKeyMapping[category]?.[facility]) {
        features.push(facilityKeyMapping[category][facility]);
      }
    });
  });

  // Check facilitiesDetail for property-wide facilities
  facilityCategories.forEach((category) => {
    const facilities = property.facilitiesDetail?.[category];
    if (facilities && Object.keys(facilities).length > 0) {
      Object.entries(facilities).forEach(([key, value]) => {
        if (
          value?.available &&
          !features.includes(facilityKeyMapping[category][key])
        ) {
          const displayText = facilityKeyMapping[category][key];
          features.push(
            `${displayText} (Available in ${value.count || ""} rooms, ${
              value.percentage || ""
            }%)`
          );
        }
      });
    }
  });

  // Toggle facility view for a specific room
  const toggleRoomFacilities = (roomId) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  // helper to safely get images
  const images =
    property.images && property.images.length > 0 ? property.images : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 py-6 max-w-7xl mx-auto">
      <style>
        {`
          .animate-3d-check {
            animation: spin3D 2s infinite ease-in-out;
            transform-style: preserve-3d;
          }
          @keyframes spin3D {
            0% { transform: rotateY(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
            50% { transform: rotateY(180deg) scale(1.05); filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.4)); }
            100% { transform: rotateY(360deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
          }
          .modal-swiper .swiper-button-next,
          .modal-swiper .swiper-button-prev {
            color: white !important;
            background: rgba(59, 130, 246, 0.8) !important;
            border-radius: 50% !important;
            width: 48px !important;
            height: 48px !important;
            margin-top: -24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 0.3s ease !important;
          }
          .modal-swiper .swiper-button-next:hover,
          .modal-swiper .swiper-button-prev:hover {
            background: rgba(59, 130, 246, 1) !important;
          }
          .modal-swiper .swiper-button-next::after,
          .modal-swiper .swiper-button-prev::after {
            font-size: 18px !important;
            font-weight: bold !important;
          }
          .modal-swiper .swiper-pagination-bullet {
            background: rgba(147, 51, 234, 0.5) !important;
            opacity: 1 !important;
            width: 12px !important;
            height: 12px !important;
            margin: 0 4px !important;
            border-radius: 50% !important;
          }
          .modal-swiper .swiper-pagination-bullet-active {
            background: rgba(147, 51, 234, 1) !important;
          }
          .modal-swiper .swiper-slide img {
            border-radius: 12px !important;
          }
        `}
      </style>
      {/* Top: carousel + sticky schedule + overview column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carousel & basic details (left two cols on large screens) */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden"
            >
              {images.length > 0 ? (
                images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={img}
                      alt={`Property ${i}`}
                      className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl"
                    />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <img
                    src={placeholderImage}
                    alt="No Image"
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl"
                  />
                </SwiperSlide>
              )}
            </Swiper>

            <button
              onClick={() => navigate(-1)}
              className="absolute top-3 left-3 bg-white rounded-full p-2 shadow hover:scale-105 transition"
            >
              <FaArrowLeft size={18} />
            </button>

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="bg-white rounded-full p-2 shadow hover:scale-105 transition"
              >
                <Heart
                  size={18}
                  className={liked ? "text-red-500" : "text-gray-400"}
                  fill={liked ? "red" : "none"}
                />
              </button>
              <button className="bg-white rounded-full p-2 shadow hover:scale-105 transition">
                <Share2 size={18} className="text-gray-600" />
              </button>
              <button
                className="bg-white rounded-full p-2 shadow hover:scale-105 transition"
                onClick={() => {
                  if (property.location?.address) {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${property.location.address}, ${property.location.city}, ${property.location.state}`
                      )}`,
                      "_blank"
                    );
                  }
                }}
                disabled={!property.location?.address}
              >
                <MapPin
                  size={18}
                  className={
                    property.location?.address
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                />
              </button>
            </div>

            {property.availability?.hasAvailableRooms && (
              <span className="absolute top-3 left-20 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                AVAILABLE ({property.availability.availableRoomCount} rooms,{" "}
                {property.availability.availableBedCount} beds)
              </span>
            )}
          </div>

          {/* Basic info */}
          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {property.name}
            </h2>
            <div className="flex items-center text-sm text-gray-500 mt-2 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                <span>
                  {property.location?.address}, {property.location?.city},{" "}
                  {property.location?.state}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(property.rating || 0)
                          ? "fill-yellow-400"
                          : ""
                      }
                    />
                  ))}
                </div>
                <span>
                  {(property.rating || 0).toFixed(1)} (
                  {property.reviews?.length || 0} reviews)
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Posted {postedDays} days ago
              </div>
            </div>

            <p className="text-gray-700 mt-3 text-sm sm:text-base">
              {property.shortDescription || property.description}
            </p>
          </div>

          {/* Overview boxes + Tabs moved under Overview boxes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<FaBed />}
              label="Rooms"
              value={`${property.totalRooms || 0}`}
            />
            <InfoItem
              icon={<FaRulerCombined />}
              label="Area"
              value={`${property.area ? property.area + " sqft" : "N/A"}`}
            />
            <InfoItem
              icon={<FaBuilding />}
              label="Property Type"
              value={property.type || "N/A"}
            />
            <InfoItem
              icon={<FaCar />}
              label="Parking"
              value={
                property.availability?.parking ? "Available" : "Not Mentioned"
              }
            />
          </div>

          {/* Tabs placed AFTER overview boxes (for mobile they will stack) */}
          <div className="mt-6 border-b pb-2 flex gap-4 text-gray-600 overflow-x-auto">
            <button
              className={`pb-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-orange-500 font-medium text-orange-600"
                  : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`pb-2 whitespace-nowrap ${
                activeTab === "gallery"
                  ? "border-b-2 border-orange-500 font-medium text-orange-600"
                  : ""
              }`}
              onClick={() => setActiveTab("gallery")}
            >
              Gallery
            </button>
            <button
              className={`pb-2 whitespace-nowrap ${
                activeTab === "rooms"
                  ? "border-b-2 border-orange-500 font-medium text-orange-600"
                  : ""
              }`}
              onClick={() => setActiveTab("rooms")}
            >
              Rooms
            </button>
            <button
              className={`pb-2 whitespace-nowrap ${
                activeTab === "review"
                  ? "border-b-2 border-orange-500 font-medium text-orange-600"
                  : ""
              }`}
              onClick={() => setActiveTab("review")}
            >
              Reviews
            </button>
            <button
              className={`pb-2 whitespace-nowrap ${
                activeTab === "reels"
                  ? "border-b-2 border-orange-500 font-medium text-orange-600"
                  : ""
              }`}
              onClick={() => setActiveTab("reels")}
            >
              Reels
            </button>
          </div>

          {/* Tab content area */}
          <div className="mt-4">
            {activeTab === "overview" && (
              <div>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {property.description}
                </p>
                {features.length > 0 ? (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg">Facilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {features.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center text-gray-700 text-sm"
                        >
                          <CheckCircle2 className="text-green-500 mr-2 animate-3d-check" />
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-4">
                    No facilities available.
                  </p>
                )}
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.length > 0 ? (
                  images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Gallery ${i}`}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => openImageModal(images, i)}
                    />
                  ))
                ) : (
                  <img
                    src={placeholderImage}
                    alt="No Image"
                    className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg col-span-full cursor-pointer"
                    onClick={() => openImageModal([placeholderImage], 0)}
                  />
                )}
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="mt-4 space-y-4">
                {property.rooms?.length > 0 ? (
                  property.rooms.map((room) => {
                    // Map room facilities to a readable format
                    const roomFeatures = [];
                    // First, check the facilities array
                    room.facilities?.forEach((facility) => {
                      facilityCategories.forEach((category) => {
                        if (facilityKeyMapping[category]?.[facility]) {
                          roomFeatures.push(facilityKeyMapping[category][facility]);
                        }
                      });
                    });
                    // Then, check allFacilities object
                    facilityCategories.forEach((category) => {
                      const facilities = room.allFacilities?.[category];
                      if (facilities && Object.keys(facilities).length > 0) {
                        Object.entries(facilities).forEach(([key, value]) => {
                          if (
                            value === true &&
                            !roomFeatures.includes(facilityKeyMapping[category][key])
                          ) {
                            roomFeatures.push(facilityKeyMapping[category][key]);
                          }
                        });
                      }
                    });

                    // Use room-specific images with fallback to property images
                    const roomImages = roomImagesMap[room.roomId] || (images.length > 0 ? images : [placeholderImage]);

                    return (
                      <div
                        key={room.roomId}
                        className={`bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex flex-col ${
                          expandedRooms[room.roomId] ? "scale-105" : ""
                        }`}
                      >
                        {/* Room Images Carousel */}
                        {roomImages.length > 0 && (
                          <div className="mb-3 self-start">
                            <Swiper
                              modules={[Navigation, Pagination]}
                              navigation
                              pagination={{ clickable: true }}
                              spaceBetween={10}
                              slidesPerView={1}
                              className="w-64 h-48"
                            >
                              {roomImages.map((img, i) => (
                                <SwiperSlide key={i}>
                                  <img
                                    src={img}
                                    alt={`${room.name} ${i}`}
                                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                    onClick={() => openImageModal(roomImages, i)}
                                  />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}

                        <h3 className="font-semibold text-lg">
                          {room.name} ({room.type})
                        </h3>
                        <p className="text-red-500 font-bold">
                          ₹{room.price?.toLocaleString() || "N/A"}/month
                        </p>
                        <p className="text-gray-600 text-sm">
                          Capacity: {room.capacity || "N/A"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Beds: {room.availableBeds || 0} available out of{" "}
                          {room.totalBeds || 0}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Status: {room.status || "N/A"}
                        </p>

                        <button
                          onClick={() => toggleRoomFacilities(room.roomId)}
                          className="mt-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-1 rounded-full text-sm hover:scale-105 transition"
                        >
                          {expandedRooms[room.roomId]
                            ? "Hide Facilities"
                            : "View Facilities"}
                        </button>

                        {expandedRooms[room.roomId] &&
                          roomFeatures.length > 0 && (
                            <div className="mt-4">
                              <p className="font-medium text-sm">Facilities:</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {roomFeatures.map((feat, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center text-gray-700 text-sm"
                                  >
                                    <CheckCircle2 className="text-green-500 mr-2 animate-3d-check" />
                                    {feat}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {expandedRooms[room.roomId] &&
                          roomFeatures.length === 0 && (
                            <p className="text-gray-500 text-sm mt-2">
                              No facilities available for this room.
                            </p>
                          )}

                        {room.beds?.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-sm">Beds:</p>
                            <ul className="list-none pl-0 text-gray-600 text-sm space-y-2">
                              {room.beds.map((bed) => {
                                const bedImages = bedImagesMap[`${room.roomId}-${bed.bedId}`] || [];
                                const bedImageSrc = bedImages.length > 0 ? bedImages[0] : (roomImages.length > 0 ? roomImages[0] : placeholderImage);
                                const modalImages = bedImages.length > 0 ? bedImages : (roomImages.length > 0 ? roomImages : [placeholderImage]);
                                return (
                                  <li key={bed.bedId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                    {/* Bed Image */}
                                    <img
                                      src={bedImageSrc}
                                      alt={bed.name}
                                      className="w-12 h-12 object-cover rounded cursor-pointer"
                                      onClick={() => openImageModal(modalImages, 0)}
                                    />
                                    <div className="flex-1">
                                      <span className="font-medium">{bed.name}:</span> ₹{bed.price?.toLocaleString() || "N/A"}
                                      /month ({bed.status || "N/A"})
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center">
                    No room details available.
                  </p>
                )}
              </div>
            )}

            {activeTab === "review" && (
              <div className="mt-4 space-y-4">
                <RatingAndComments propertyId={id} />
              </div>
            )}

            {activeTab === "reels" && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {reels.length > 0 ? (
                  reels.map((reel, i) => (
                    <div
                      key={i}
                      className="video-container rounded-lg overflow-hidden"
                    >
                      <video
                        src={reel.videoUrl}
                        controls
                        muted
                        playsInline
                        className="w-full h-64 object-cover rounded-lg bg-black"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center col-span-full">
                    No reels available for this property.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Schedule (sticky) + Manager Info */}
        <div className="w-full">
          {/* Make schedule sticky on large screens */}
          <div className="lg:sticky lg:top-6">
            <ScheduleTourBox />

            <div className="mt-6 bg-gray-100 p-4 rounded-xl shadow-md">
              <h2 className="font-semibold mb-2">Area Manager</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{property.landlord?.name}</p>
                  <p className="text-sm text-gray-600">
                    {property.location?.city}, {property.location?.state}
                  </p>
                  <p className="text-sm text-gray-600">{property.landlord?.email}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-1 transition flex-1 sm:flex-none"
                    onClick={() =>
                      (window.location.href = `tel:${property.landlord?.contactNumber}`)
                    }
                  >
                    <FaPhone size={16} /> Call
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-1 transition flex-1 sm:flex-none"
                    onClick={() =>
                      (window.location.href = `mailto:${property.landlord?.email}`)
                    }
                  >
                    <FaEnvelope size={16} /> Email
                  </button>
                </div>
              </div>
            </div>

            {/* Price & Interested CTA for small screens inside sticky right column */}
            
          </div>
        </div>
      </div>

      {/* Bottom sticky bar for larger interaction (keeps at bottom) */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 z-30">
        <p className="text-xl sm:text-2xl font-bold text-red-500">
          ₹{property.pricing?.rooms?.min?.toLocaleString?.() || "N/A"} - ₹
          {property.pricing?.rooms?.max?.toLocaleString?.() || "N/A"}/month
        </p>
        
      </div>

      {/* Full Screen Image Modal */}
      {showModal && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-3xl z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
            >
              &times;
            </button>
            <Swiper
              initialSlide={initialSlide}
              modules={[Navigation, Pagination]}
              navigation={true}
              pagination={{ clickable: true }}
              className="modal-swiper w-full h-[90vh] max-h-[90vh]"
              style={{ height: '90vh' }}
            >
              {selectedImages.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="flex items-center justify-center h-full">
                    <img
                      src={img}
                      alt={`Full view ${i}`}
                      className="max-w-full max-h-full object-contain cursor-zoom-in"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== Rating & Comments Component ====================== */
function RatingAndComments({ propertyId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Always get token from localStorage
  const getToken = () => localStorage.getItem("usertoken");

  // Create axios instance with dynamic token
  const createAxiosInstance = () => {
    const token = getToken();
    return axios.create({
      baseURL: "https://api.gharzoreality.com/api",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  // Fetch ratings, comments, and stats
  const fetchData = async () => {
    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      // Fetch stats (public, no auth required)
      const timestamp = new Date().getTime();
      const statsResponse = await axios.get(
        `https://api.gharzoreality.com/api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      } else {
        setError("Failed to fetch rating stats.");
      }

      // Fetch ratings and comments only if token exists
      if (getToken()) {
        // Fetch ratings
        try {
          const ratingsResponse = await axiosInstance.get(
            `/property/${propertyId}/ratings`
          );
          const ratingList = ratingsResponse.data.success
            ? ratingsResponse.data.ratings.map((r) => ({
                id: r._id,
                username: r.userName || r.fullName || r.userId || "Anonymous",
                profilePic: r.profilePic || user,
                text: r.review,
                rating: r.rating,
                createdAt: r.createdAt,
                type: "rating",
              }))
            : [];

          // Fetch comments
          const commentsResponse = await axiosInstance.get(
            `/property/${propertyId}/comments?page=1&limit=10`
          );
          const commentList = commentsResponse.data.success
            ? commentsResponse.data.comments.map((c) => ({
                id: c._id,
                username: c.userName || c.fullName || c.userId || "Anonymous",
                profilePic: c.profilePic || user,
                text: c.comment,
                createdAt: c.createdAt,
                type: "comment",
              }))
            : [];

          // Combine and sort by createdAt descending
          const combinedList = [...ratingList, ...commentList].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setComments(combinedList);

          // Set current user from token
          const token = getToken();
          if (token) {
            try {
              const decoded = jwtDecode(token);
              setCurrentUser(
                decoded.userName || decoded.fullName || decoded.id
              );
            } catch (err) {
              console.error("Error decoding token:", err);
            }
          }
        } catch (err) {
          if (err.response?.status === 401) {
            setError(
              "Unauthorized: Invalid or expired token. Please enter a new token."
            );
            setShowTokenInput(true);
          } else {
            setError("Error fetching ratings or comments. Please try again.");
          }
        }
      } else {
        setError("No token provided. Please enter a new token to view reviews.");
        setShowTokenInput(true);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data. Please check your connection.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    if (!getToken()) {
      setError("No token. Please enter a token first.");
      setShowTokenInput(true);
      return;
    }

    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      let newItem;
      if (rating > 0) {
        // Post to ratings API
        const response = await axiosInstance.post(
          `/property/${propertyId}/ratings`,
          {
            rating,
            review: comment,
          }
        );
        if (response.data.success) {
          newItem = {
            id: response.data.rating._id,
            username:
              response.data.rating.userName ||
              response.data.rating.fullName ||
              response.data.rating.userId ||
              "Anonymous",
            profilePic: response.data.rating.profilePic || user,
            text: response.data.rating.review,
            rating: response.data.rating.rating,
            createdAt: response.data.rating.createdAt,
            type: "rating",
          };
        } else {
          throw new Error(response.data.message || "Failed to submit rating.");
        }
      } else {
        // Post to comments API
        const response = await axiosInstance.post(
          `/property/${propertyId}/comments`,
          {
            comment,
          }
        );
        if (response.data.success) {
          newItem = {
            id: response.data.comment._id,
            username:
              response.data.comment.userName ||
              response.data.comment.fullName ||
              response.data.comment.userId ||
              "Anonymous",
            profilePic: response.data.comment.profilePic || user,
            text: response.data.comment.comment,
            createdAt: response.data.comment.createdAt,
            type: "comment",
          };
        } else {
          throw new Error(response.data.message || "Failed to submit comment.");
        }
      }

      // Update comments state with the new item
      setComments((prev) => [newItem, ...prev]);

      // Refetch stats
      const timestamp = new Date().getTime();
      const statsResponse = await axios.get(
        `https://api.gharzoreality.com/api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      // Clear inputs
      setComment("");
      setRating(0);
    } catch (err) {
      console.error("Error submitting:", err);
      if (err.response?.status === 401) {
        setError(
          "Unauthorized: Invalid or expired token. Please enter a new token."
        );
        setShowTokenInput(true);
      } else {
        setError(
          `Error submitting ${rating > 0 ? "rating" : "comment"}: ${
            err.response?.data?.message || err.message || "Please try again"
          }`
        );
      }
    }
  };

  const handleDelete = async (id, type) => {
    if (!getToken()) {
      setError("No token. Cannot delete.");
      return;
    }

    try {
      setError(null);
      const axiosInstance = createAxiosInstance();

      // Delete rating or comment
      const endpoint = type === "rating" ? `/ratings/${id}` : `/comments/${id}`;
      const response = await axiosInstance.delete(endpoint);

      if (response.data.success) {
        // Remove deleted item from comments
        setComments((prev) => prev.filter((item) => item.id !== id));
        // Refetch stats
        const timestamp = new Date().getTime();
        const statsResponse = await axios.get(
          `https://api.gharzoreality.com/api/public/ratings/property/${propertyId}/rating-stats?_=${timestamp}`
        );
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
      } else {
        setError(
          `Failed to delete ${type}: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      if (err.response?.status === 401) {
        setError(
          "Unauthorized: Invalid or expired token. Please enter a new token."
        );
        setShowTokenInput(true);
      } else if (err.response?.status === 403) {
        setError("You are not authorized to delete this item.");
      } else if (err.response?.status === 404) {
        setError(`${type.charAt(0).toUpperCase() + type.slice(1)} not found.`);
      } else {
        setError(
          `Error deleting ${type}: ${
            err.response?.data?.message || "Please try again"
          }`
        );
      }
    }
  };

  const handleTokenSubmit = () => {
    if (newToken.trim()) {
      localStorage.setItem("usertoken", newToken);
      setShowTokenInput(false);
      setNewToken("");
      setError(null);
      // Refetch data after token update
      fetchData();
    } else {
      setError("Token cannot be empty.");
    }
  };

  return (
    <div className="bg-white p-6 border rounded-lg shadow">
      <h4 className="text-xl font-semibold mb-4">Rate & Comment</h4>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      {showTokenInput && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter new token"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleTokenSubmit}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Submit Token
          </button>
        </div>
      )}

      {stats && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm sm:text-base">
            Average Rating: {stats.averageRating.toFixed(1)} (
            {stats.totalRatings} reviews)
          </p>
        </div>
      )}

      {/* Star Rating */}
      <div className="flex space-x-1 mb-4">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <span
              key={i}
              onClick={() => setRating(starValue)}
              className={`cursor-pointer text-2xl ${
                starValue <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          );
        })}
      </div>

      {/* Comment Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddComment}
          className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-lg text-sm"
          disabled={!getToken()}
        >
          Post
        </button>
      </div>

      {comments.length > 0 ? (
        comments.map((c) => (
          <div key={c.id} className="flex items-start gap-3 mb-4">
            <img
              src={c.profilePic}
              alt={c.username}
              className="w-10 h-10 rounded-full border border-black p-0.5 object-cover"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">
                  {c.username || "Unknown User"}
                </p>
                {/* Delete button only if current user matches */}
                {currentUser && c.username === currentUser && (
                  <button
                    onClick={() => handleDelete(c.id, c.type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm">{c.text}</p>
              {c.rating && (
                <div className="flex space-x-1 mt-1">
                  {[...Array(c.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-500 text-xs">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No reviews or comments yet.</p>
      )}
    </div>
  );
}

/* ====================== Info Item Component ====================== */
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-gray-600 bg-white p-3 rounded-xl shadow-sm">
      <div className="text-lg sm:text-xl text-blue-500">{icon}</div>
      <div>
        <div className="text-base sm:text-lg font-medium">{value}</div>
        <div className="text-xs sm:text-sm">{label}</div>
      </div>
    </div>
  );
}

export default PropertyDetails;