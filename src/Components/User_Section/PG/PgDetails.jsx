import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import ScheduleTourBox from "../ScheduleTour/ScheduleTourBox";
import {
  FaBed,
  FaDoorOpen,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaListUl,
  FaBuilding,
  FaCalendarAlt,
  FaCouch,
} from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";

const PGDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [roomImagesMap, setRoomImagesMap] = useState({});
  const [bedImagesMap, setBedImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialSlide, setInitialSlide] = useState(0);

  const navigate = useNavigate();
  const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

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

  const fetchPGDetails = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await axios.get(
        `https://api.gharzoreality.com/api/public/property/${id}?_=${timestamp}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const found = res.data?.property;

      if (!found) {
        console.error("No PG found in response");
        setPg(location.state || null);
        return;
      }

      setPg(found);
    } catch (error) {
      console.error("API fetch failed:", error);
      setPg(location.state || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPGDetails();
  }, [id, location.state]);

  // Fetch room-specific images after PG is loaded
  useEffect(() => {
    if (pg && pg.rooms) {
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

      pg.rooms.forEach((room) => fetchRoomImages(room.roomId));
    }
  }, [pg, id]);

  // Fetch bed-specific images after PG is loaded
  useEffect(() => {
    if (pg && pg.rooms) {
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

      pg.rooms.forEach((room) => {
        room.beds?.forEach((bed) => {
          fetchBedImages(room.roomId, bed.bedId);
        });
      });
    }
  }, [pg, id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-lg font-semibold text-gray-700">
        Loading PG Details...
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="text-center mt-10 text-lg font-semibold text-red-500">
        PG not found.
      </div>
    );
  }

  const images = pg.images && pg.images.length > 0 ? pg.images : [placeholderImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12 font-sans">
      <style>
        {`
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
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-[#5C4EFF] text-white rounded-md hover:bg-[#483bd4] transition duration-200 inline-flex items-center gap-2 text-sm font-medium"
      >
        Back
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: PG Details */}
        <div className="flex-1 bg-white shadow-2xl rounded-2xl p-8 transform hover:scale-[1.01] transition-transform duration-300" data-aos="fade-up">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-tight" data-aos="zoom-in">
            {pg.name}
          </h1>

          <div className="w-full h-80 overflow-hidden rounded-2xl mb-8 shadow-lg" data-aos="fade-up">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-gray-600">Loading image...</p>
              </div>
            ) : (
              <img
                src={pg.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                alt={pg.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </div>

          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800 mb-10">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-right">
              <FaMapMarkerAlt className="text-2xl text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                <p className="text-gray-600">{pg.location?.address}, {pg.location?.city}, {pg.location?.state} - {pg.location?.pinCode}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-right" data-aos-delay="100">
              <FaRupeeSign className="text-2xl text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Rent Range</h2>
                <p className="text-gray-600">
                  Beds: ₹ {pg.pricing?.beds.min} - ₹ {pg.pricing?.beds.max}/month
                  <br />
                  Rooms: ₹ {pg.pricing?.rooms.min} - ₹ {pg.pricing?.rooms.max}/month
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-right" data-aos-delay="200">
              <FaDoorOpen className="text-2xl text-purple-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Total Rooms</h2>
                <p className="text-gray-600">{pg.totalRooms}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-left">
              <FaBed className="text-2xl text-indigo-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Total Beds</h2>
                <p className="text-gray-600">{pg.totalBeds}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-left" data-aos-delay="100">
              <FaBed className="text-2xl text-teal-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Available Beds</h2>
                <p className="text-gray-600">{pg.availability?.availableBedCount}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Property Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800 mb-10">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-right">
              <FaBuilding className="text-2xl text-orange-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Property Type</h2>
                <p className="text-gray-600">{pg.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-right" data-aos-delay="100">
              <FaCheckCircle className="text-2xl text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
                <p className="text-gray-600">{pg.availability?.hasAvailableRooms ? "Available" : "Not Available"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors" data-aos="fade-right" data-aos-delay="200">
              <FaCalendarAlt className="text-2xl text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Created On</h2>
                <p className="text-gray-600">{pg.createdAt ? new Date(pg.createdAt).toLocaleDateString() : "Not available"}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Rooms Details */}
          <div className="text-gray-800 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3" data-aos="fade-up">
              <FaCouch className="text-3xl text-purple-600" />
              Room Details
            </h2>
            {pg.rooms?.map((room, index) => {
              // Use room-specific images with fallback to property images
              const roomImages = roomImagesMap[room.roomId] || images;

              return (
                <div key={index} className="border border-gray-200 rounded-xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-shadow" data-aos="fade-up" data-aos-delay={index * 100}>
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

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{room.name} ({room.type})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <FaRupeeSign className="text-xl text-green-600" />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Room Price (Total)</h4>
                        <p className="text-gray-600">₹ {room.price}/month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <FaBed className="text-xl text-indigo-600" />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Total Beds</h4>
                        <p className="text-gray-600">{room.totalBeds}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <FaBed className="text-xl text-teal-600" />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Available Beds</h4>
                        <p className="text-gray-600">{room.availableBeds}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <FaCheckCircle className="text-xl text-green-600" />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Status</h4>
                        <p className="text-gray-600">{room.status}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 col-span-2">
                      <FaListUl className="text-xl text-blue-600 mt-1" />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Facilities</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {room.facilities.length > 0 ? (
                            room.facilities.map((facility, i) => <li key={i}>{facility}</li>)
                          ) : (
                            <li>No facilities listed</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 col-span-2">
                      <FaBed className="text-xl text-indigo-600 mt-1" />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Bed Details (Per Bed)</h4>
                        <ul className="list-none pl-0 text-gray-600 space-y-2">
                          {room.beds.length > 0 ? (
                            room.beds.map((bed, i) => {
                              const bedImages = bedImagesMap[`${room.roomId}-${bed.bedId}`] || [];
                              const bedImageSrc = bedImages.length > 0 ? bedImages[0] : (roomImages.length > 0 ? roomImages[0] : placeholderImage);
                              const modalImages = bedImages.length > 0 ? bedImages : (roomImages.length > 0 ? roomImages : [placeholderImage]);
                              return (
                                <li key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                  <img
                                    src={bedImageSrc}
                                    alt={bed.name}
                                    className="w-12 h-12 object-cover rounded cursor-pointer"
                                    onClick={() => openImageModal(modalImages, 0)}
                                  />
                                  <div className="flex-1">
                                    {bed.name} - ₹ {bed.price}/month ({bed.status})
                                  </div>
                                </li>
                              );
                            })
                          ) : (
                            <li>No beds listed</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {room.beds.length === 0 && room.totalBeds === 0 && (
                    <p className="text-red-500 text-sm mt-2">Note: No beds are listed for this room.</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 4: Amenities & Facilities */}
          <div className="text-gray-800">
            <div className="flex items-start gap-4 mb-6" data-aos="fade-up">
              <FaListUl className="text-2xl text-blue-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Common Facilities</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {(pg.commonFacilities || []).length > 0 ? (
                    pg.commonFacilities.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <p>No common facilities listed.</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6" data-aos="fade-up" data-aos-delay="100">
              <FaListUl className="text-2xl text-blue-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Facilities Overview</h2>
                {Object.entries(pg.facilitiesDetail || {}).map(([category, details]) => (
                  <div key={category} className="mt-4">
                    <h3 className="text-md font-medium text-gray-800 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {Object.entries(details).map(([feature, { available, count }]) =>
                        available ? (
                          <li key={`${category}-${feature}`}>
                            {feature.replace(/([A-Z])/g, ' $1').trim()} ({count})
                          </li>
                        ) : null
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4" data-aos="fade-up" data-aos-delay="200">
              <MdDescription className="text-2xl text-purple-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="text-gray-600 leading-relaxed">{pg.description || "No description available."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Schedule Tour Box */}
        <div className="lg:w-1/3">
          <ScheduleTourBox />
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showModal && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-3xl z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
            >
              ×
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
};

export default PGDetails;