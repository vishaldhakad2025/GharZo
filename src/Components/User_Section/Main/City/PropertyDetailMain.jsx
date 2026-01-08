import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  MapPin,
  Phone,
  MessageCircle,
  ArrowLeft,
  Star,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import axios from "axios";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PropertyDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: "User",
    profilePic:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpGIEIrBlxuFjJfpK_a6hEbf6sSJK-hnjUMBLsCa3BZfZbbL1GGLQPApvV3PHB88d9g7Q&usqp=CAU",
  });

  // Add CSS for 3D animations
  const styles = `
    .animate-3d-check {
      animation: spin3D 2s infinite ease-in-out;
      transform-style: preserve-3d;
    }
    @keyframes spin3D {
      0% { transform: rotateY(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
      50% { transform: rotateY(180deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.5)); }
      100% { transform: rotateY(360deg) scale(1); filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3)); }
    }
    .animate-scale {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .animate-scale:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .animate-pulse:hover {
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/auth/user/profile", {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yjk1ZTU2MWE4NDllNGUyNGYzNTY1YiIsInJvbGUiOiJ1c2VyIiwibW9iaWxlIjoiODgyMTk5MTU3MiIsImVtYWlsIjoidmlzaGFsQGdtYWlsLmNvbSIsImlhdCI6MTc1Njk3OTQ3OCwiZXhwIjoxNzU5NTcxNDc4fQ.Bl--VZBIcLqC8v2MAIaFkjlljfwTwTK4ByLA4eWM6pY",
          },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUserProfile({
            username: data.user.name || "User",
            profilePic:
              data.user.profilePic ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpGIEIrBlxuFjJfpK_a6hEbf6sSJK-hnjUMBLsCa3BZfZbbL1GGLQPApvV3PHB88d9g7Q&usqp=CAU",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.gharzoreality.com/api/public/property/${decodeURIComponent(
            name
          )}`,
          { cache: "no-cache" }
        );
        const data = await res.json();
        if (data.success && data.property) {
          setProperty({
            ...data.property,
            postedDays: Math.floor(
              (new Date() - new Date(data.property.createdAt)) /
                (1000 * 60 * 60 * 24)
            ),
            location: `${data.property.location.address}, ${data.property.location.city}, ${data.property.location.state}, ${data.property.location.pinCode}`,
            manager: {
              name: data.property.landlord.name,
              contactNumber: data.property.landlord.contactNumber,
              email: data.property.landlord.email,
              location: `${data.property.location.city}, ${data.property.location.state}`,
            },
            lowestPrice: data.property.pricing.rooms.min,
          });
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [name]);

  // Fetch reels data
  useEffect(() => {
    const fetchReels = async () => {
      if (!property?.id) return;
      setReelsLoading(true);
      try {
        const response = await axios.get(
          `https://api.gharzoreality.com/api/reels?propertyId=${property.id}`,
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

    if (property) {
      fetchReels();
    }
  }, [property]);

  // RatingAndComments Component
  function RatingAndComments({ propertyId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Get token from localStorage
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
    useEffect(() => {
      const fetchData = async () => {
        try {
          setError(null);
          const axiosInstance = createAxiosInstance();

          // Fetch stats (public, no auth required)
          const statsResponse = await axios.get(
            `https://api.gharzoreality.com/api/public/ratings/property/${propertyId}/rating-stats`
          );
          if (statsResponse.data.success) {
            setStats(statsResponse.data.stats);
          } else {
            setError("Failed to fetch rating stats.");
          }

          // Fetch ratings
          try {
            const ratingsResponse = await axiosInstance.get(
              `/property/${propertyId}/ratings`
            );
            const ratingList = ratingsResponse.data.success
              ? ratingsResponse.data.ratings.map((r) => ({
                  id: r._id,
                  username: r.userName || r.fullName || r.userId,
                  profilePic: r.profilePic || userProfile.profilePic,
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
                  username: c.userName || c.fullName || c.userId,
                  profilePic: c.profilePic || userProfile.profilePic,
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
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error fetching data. Please check your connection or token.");
          setShowTokenInput(true);
        }
      };

      if (getToken()) {
        fetchData();
      } else {
        setError("No token provided. Please enter a new token to proceed.");
        setShowTokenInput(true);
      }
    }, [propertyId]);

    const handleAddComment = async () => {
      if (!comment.trim()) {
        setError("Comment cannot be empty.");
        return;
      }

      try {
        setError(null);
        const axiosInstance = createAxiosInstance();

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
            const newRating = {
              id: response.data.rating._id,
              username:
                response.data.rating.userName ||
                response.data.rating.fullName ||
                response.data.rating.userId,
              profilePic: response.data.rating.profilePic || userProfile.profilePic,
              text: response.data.rating.review,
              rating: response.data.rating.rating,
              createdAt: response.data.rating.createdAt,
              type: "rating",
            };

            // Refetch stats
            const statsResponse = await axios.get(
              `https://api.gharzoreality.com/api/public/ratings/property/${propertyId}/rating-stats`
            );
            if (statsResponse.data.success) {
              setStats(statsResponse.data.stats);
            }

            // Refetch ratings
            const ratingsResponse = await axiosInstance.get(
              `/property/${propertyId}/ratings`
            );
            const ratingList = ratingsResponse.data.success
              ? ratingsResponse.data.ratings.map((r) => ({
                  id: r._id,
                  username: r.userName || r.fullName || r.userId,
                  profilePic: r.profilePic || userProfile.profilePic,
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
                  username: c.userName || c.fullName || c.userId,
                  profilePic: c.profilePic || userProfile.profilePic,
                  text: c.comment,
                  createdAt: c.createdAt,
                  type: "comment",
                }))
              : [];

            const combinedList = [...ratingList, ...commentList].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setComments(combinedList);
          } else {
            setError("Failed to submit rating.");
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
            const newComment = {
              id: response.data.comment._id,
              username:
                response.data.comment.userName ||
                response.data.comment.fullName ||
                response.data.comment.userId,
              profilePic: response.data.comment.profilePic || userProfile.profilePic,
              text: response.data.comment.comment,
              createdAt: response.data.comment.createdAt,
              type: "comment",
            };

            // Refetch ratings
            const ratingsResponse = await axiosInstance.get(
              `/property/${propertyId}/ratings`
            );
            const ratingList = ratingsResponse.data.success
              ? ratingsResponse.data.ratings.map((r) => ({
                  id: r._id,
                  username: r.userName || r.fullName || r.userId,
                  profilePic: r.profilePic || userProfile.profilePic,
                  text: r.review,
                  rating: r.rating,
                  createdAt: r.createdAt,
                  type: "rating",
                }))
              : [];

            // Refetch comments
            const commentsResponse = await axiosInstance.get(
              `/property/${propertyId}/comments?page=1&limit=10`
            );
            const commentList = commentsResponse.data.success
              ? commentsResponse.data.comments.map((c) => ({
                  id: c._id,
                  username: c.userName || c.fullName || c.userId,
                  profilePic: c.profilePic || userProfile.profilePic,
                  text: c.comment,
                  createdAt: c.createdAt,
                  type: "comment",
                }))
              : [];

            const combinedList = [...ratingList, ...commentList].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setComments(combinedList);
          } else {
            setError("Failed to submit comment.");
          }
        }
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
          setError("Error submitting rating or comment. Please try again.");
        }
      }
    };

    const handleDelete = async (id, type) => {
      try {
        setError(null);
        const axiosInstance = createAxiosInstance();

        // Delete rating or comment
        const endpoint = type === "rating" ? `/ratings/${id}` : `/comments/${id}`;
        const response = await axiosInstance.delete(endpoint);

        if (response.data.success) {
          // Refetch stats
          const statsResponse = await axios.get(
            `https://api.gharzoreality.com/api/public/ratings/property/${propertyId}/rating-stats`
          );
          if (statsResponse.data.success) {
            setStats(statsResponse.data.stats);
          }

          // Refetch ratings
          const ratingsResponse = await axiosInstance.get(
            `/property/${propertyId}/ratings`
          );
          const ratingList = ratingsResponse.data.success
            ? ratingsResponse.data.ratings.map((r) => ({
                id: r._id,
                username: r.userName || r.fullName || r.userId,
                profilePic: r.profilePic || userProfile.profilePic,
                text: r.review,
                rating: r.rating,
                createdAt: r.createdAt,
                type: "rating",
              }))
            : [];

          // Refetch comments
          const commentsResponse = await axiosInstance.get(
            `/property/${propertyId}/comments?page=1&limit=10`
          );
          const commentList = commentsResponse.data.success
            ? commentsResponse.data.comments.map((c) => ({
                id: c._id,
                username: c.userName || c.fullName || c.userId,
                profilePic: c.profilePic || userProfile.profilePic,
                text: c.comment,
                createdAt: c.createdAt,
                type: "comment",
              }))
            : [];

          const combinedList = [...ratingList, ...commentList].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setComments(combinedList);
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

    return (
      <div className="mt-8 bg-white p-6 border rounded-lg shadow animate-scale">
        <h4 className="text-xl font-semibold mb-4">Rate & Comment</h4>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

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
                className={`cursor-pointer text-2xl animate-scale ${
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
            className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-lg text-sm animate-scale"
          >
            Post
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
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
                  {currentUser && c.username === currentUser && (
                    <button
                      onClick={() => handleDelete(c.id, c.type)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{c.text}</p>
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
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center text-gray-500">
        Property not found for {decodeURIComponent(name)}.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 py-10 max-w-7xl mx-auto">
      <style>{styles}</style>
      {/* Image Carousel */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-56 sm:h-64 md:h-80 lg:h-96"
        >
          {property.images.length > 0 ? (
            property.images.map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`Property ${i}`}
                  className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <img
                src="https://via.placeholder.com/400x250?text=No+Image"
                alt="No Image"
                className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl"
              />
            </SwiperSlide>
          )}
        </Swiper>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-2 left-2 bg-white rounded-full p-2 shadow animate-scale"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="bg-white rounded-full p-2 shadow animate-pulse"
          >
            <Heart
              size={18}
              className={liked ? "text-red-500" : "text-gray-400"}
              fill={liked ? "red" : "none"}
            />
          </button>
          <button className="bg-white rounded-full p-2 shadow animate-pulse">
            <Share2 size={18} className="text-gray-600" />
          </button>
          <button
            className="bg-white rounded-full p-2 shadow animate-pulse"
            onClick={() => {
              if (property.location) {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    property.location
                  )}`,
                  "_blank"
                );
              }
            }}
            disabled={!property.location}
          >
            <MapPin
              size={18}
              className={property.location ? "text-green-600" : "text-gray-400"}
            />
          </button>
        </div>
        {property.availability.hasAvailableRooms && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded animate-scale">
            AVAILABLE ({property.availability.availableRoomCount} rooms,{" "}
            {property.availability.availableBedCount} beds)
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {property.name}
        </h1>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPin size={16} className="mr-1 text-red-500" />
          {property.location}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 border-b mt-4 text-gray-600 overflow-x-auto">
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "description"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "gallery"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "rooms"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("rooms")}
          >
            Rooms
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "review"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("review")}
          >
            Reviews
          </button>
          <button
            className={`pb-2 whitespace-nowrap ${
              activeTab === "reels"
                ? "border-b-2 border-orange-500 font-medium text-orange-600"
                : ""
            } animate-scale`}
            onClick={() => setActiveTab("reels")}
          >
            Reels
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "description" && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {property.description}
            </p>
            <h3 className="mt-4 font-semibold text-lg">Facilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {Object.entries(property.facilitiesDetail).flatMap(
                ([category, facilities]) =>
                  Object.entries(facilities).map(([key, value]) =>
                    value.available ? (
                      <div
                        key={`${category}-${key}`}
                        className="flex items-center text-gray-700 text-sm"
                      >
                        <CheckCircle2 className="text-green-500 mr-2 animate-3d-check" />
                        {key.charAt(0).toUpperCase() +
                          key
                            .slice(1)
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        : Available in {value.count} rooms ({value.percentage}%)
                      </div>
                    ) : null
                  )
              )}
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {property.images.length > 0 ? (
              property.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="gallery"
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg animate-scale"
                />
              ))
            ) : (
              <img
                src="https://via.placeholder.com/400x250?text=No+Image"
                alt="No Image"
                className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg col-span-full animate-scale"
              />
            )}
          </div>
        )}

        {activeTab === "reels" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reelsLoading ? (
              <div className="flex justify-center items-center min-h-[200px] col-span-full">
                <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              </div>
            ) : reels.length > 0 ? (
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

        {activeTab === "rooms" && (
          <div className="mt-4 space-y-4">
            {property.rooms.map((room) => (
              <div
                key={room.roomId}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg animate-scale"
              >
                <h3 className="font-semibold text-lg">
                  {room.name} ({room.type})
                </h3>
                <p className="text-red-500 font-bold">
                  ₹{room.price.toLocaleString()}/month
                </p>
                <p className="text-gray-600 text-sm">
                  Capacity: {room.capacity}
                </p>
                <p className="text-gray-600 text-sm">
                  Beds: {room.availableBeds} available out of {room.totalBeds}
                </p>
                <p className="text-gray-600 text-sm">Status: {room.status}</p>
                {room.facilities.length > 0 && (
                  <div>
                    <p className="font-medium mt-2 text-sm">Facilities:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {room.facilities.map((facility, i) => (
                        <div
                          key={i}
                          className="flex items-center text-gray-700 text-sm"
                        >
                          <CheckCircle2 className="text-green-500 mr-2 animate-3d-check" />
                          {facility}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {room.beds && room.beds.length > 0 && (
                  <div>
                    <p className="font-medium mt-2 text-sm">Beds:</p>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                      {room.beds.map((bed) => (
                        <li key={bed.bedId}>
                          {bed.name}: ₹{bed.price.toLocaleString()}/month (
                          {bed.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "review" && (
          <div className="mt-4 space-y-4">
            <RatingAndComments propertyId={property.id} />
          </div>
        )}

        {/* Manager Info */}
        <div className="mt-6 bg-gray-100 p-4 rounded-xl shadow-md animate-scale">
          <h2 className="font-semibold mb-2">Area Manager</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{property.manager.name}</p>
              <p className="text-sm text-gray-600">
                {property.manager.location}
              </p>
              <p className="text-sm text-gray-600">{property.manager.email}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-1 animate-scale"
                onClick={() =>
                  (window.location.href = `tel:${property.manager.contactNumber}`)
                }
              >
                <Phone size={16} /> Call
              </button>
              <button
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-2 rounded-full flex items-center gap-1 animate-scale"
                onClick={() =>
                  (window.location.href = `mailto:${property.manager.email}`)
                }
              >
                <MessageCircle size={16} /> Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xl sm:text-2xl font-bold text-red-500">
          ₹{property.pricing.rooms.min.toLocaleString()} - ₹
          {property.pricing.rooms.max.toLocaleString()}/month
        </p>
        <button className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-6 py-2 rounded-full animate-scale w-full sm:w-auto">
          I'm Interested
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;