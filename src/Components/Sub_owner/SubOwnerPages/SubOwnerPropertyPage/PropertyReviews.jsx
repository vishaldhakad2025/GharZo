import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaTrash, FaUserCircle, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import baseurl from "../../../../../BaseUrl";

// ──────────────────────────────────────────────────────────────
//  BRAND COLORS
// ──────────────────────────────────────────────────────────────
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";

const PropertyFeedback = () => {
  const { propertyId } = useParams(); // Preferred: from URL
  const [comments, setComments] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [propertyName, setPropertyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) throw new Error("Authentication token missing");

        const effectivePropertyId = propertyId || localStorage.getItem("propertyId");
        if (!effectivePropertyId) throw new Error("Property ID not found");

        // Fetch ratings & comments
        const [ratingsRes, commentsRes] = await Promise.all([
          axios.get(`${baseurl}api/subowner/ratings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseurl}api/subowner/comments/${effectivePropertyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process ratings
        let stats = null;
        let propertyRatings = [];

        if (ratingsRes.data.success && ratingsRes.data.propertyStats) {
          stats = ratingsRes.data.propertyStats.find(
            (p) => p.propertyId === effectivePropertyId
          );
          propertyRatings = (ratingsRes.data.ratings || [])
            .filter((r) => r.propertyId === effectivePropertyId)
            .map((r) => ({
              ...r,
              comment: r.review,
              type: "rating",
              _id: r._id || r.id,
            }));
        }

        // Process comments
        let propertyComments = [];
        if (commentsRes.data.success && commentsRes.data.comments) {
          propertyComments = commentsRes.data.comments.map((c) => ({
            ...c,
            type: "comment",
            _id: c._id || c.id,
          }));
        }

        // Combine & set state
        setComments([...propertyRatings, ...propertyComments]);
        setAvgRating(stats?.averageRating || 0);
        setTotalRatings(stats?.totalRatings || 0);
        setPropertyName(stats?.propertyName || "Property");

      } catch (err) {
        console.error("Feedback fetch error:", err);
        const msg =
          err.response?.status === 401
            ? "Session expired. Please log in again."
            : err.message || "Failed to load feedback";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [propertyId, token]);

  const handleDelete = async (itemId, type) => {
    try {
      const endpoint =
        type === "rating" ? "ratings" : "comments";

      await axios.delete(
        `${baseurl}api/subowner/${endpoint}/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`${type === "rating" ? "Rating" : "Comment"} deleted`);
      // Refresh list
      setComments((prev) => prev.filter((c) => c._id !== itemId));
    } catch (err) {
      toast.error("Failed to delete item");
      console.error("Delete error:", err);
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`text-xl transition-transform ${
            i < Math.round(rating)
              ? "text-yellow-400 drop-shadow-sm"
              : "text-gray-300"
          } hover:scale-110`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
            {propertyName} <span className="text-[#F97316]">Feedback</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Reviews & ratings from tenants
          </p>
        </div>

        {/* Rating Summary Card */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#F97316] p-8 text-center">
            <div className="flex justify-center gap-2 mb-4">
              {renderStars(avgRating)}
            </div>
            <div className="text-5xl sm:text-6xl font-extrabold text-[#172554] mb-2">
              {avgRating.toFixed(1)}
            </div>
            <p className="text-xl text-gray-600 font-medium">out of 5</p>
            <p className="text-gray-500 mt-2">
              Based on {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
            </p>
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#172554] font-medium">Loading feedback...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 shadow-lg text-center border-t-4 border-red-500">
            <div className="text-red-500 text-6xl mb-6">
              <FaExclamationCircle />
            </div>
            <h2 className="text-2xl font-bold text-[#172554] mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <FaStar className="mx-auto text-7xl text-[#F97316]/30 mb-6" />
            <h3 className="text-2xl font-semibold text-[#172554] mb-3">
              No feedback yet
            </h3>
            <p className="text-gray-600">
              Tenant ratings and comments will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {comments.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-[#F97316]/40 transition-all duration-300"
                >
                  {/* Top accent */}
                  <div className="h-2 bg-gradient-to-r from-[#F97316] to-[#ea580c]" />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#F97316]/10 flex items-center justify-center text-[#F97316] flex-shrink-0">
                          <FaUserCircle size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#172554]">
                            {item.userName || "Anonymous"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Rating Stars */}
                      {item.type === "rating" && item.rating && (
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-xl ${
                                i < item.rating
                                  ? "text-yellow-400 drop-shadow-sm"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Comment/Rating Text */}
                    <p className="text-gray-700 leading-relaxed">
                      {item.comment || item.review || "No comment provided"}
                    </p>

                    {/* Delete Button */}
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => handleDelete(item._id, item.type)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        <FaTrash size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFeedback;