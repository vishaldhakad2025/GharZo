import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";

const OrganizationPropertyFeedback = () => {
  const [comments, setComments] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get propertyId from URL params
  const { id } = useParams();

  // Get token from localStorage
  const token = localStorage.getItem("orgToken");

  useEffect(() => {
    const fetchRatingsAndComments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch ratings
        const ratingsResponse = await axios.get(
          `https://api.gharzoreality.com/api/property/${id}/ratings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ratingsResponse.data.success) {
          setAvgRating(ratingsResponse.data.stats?.averageRating || 0);
          setTotalRatings(ratingsResponse.data.stats?.totalRatings || 0);
        } else {
          setAvgRating(0);
          setTotalRatings(0);
          setError("No ratings data available.");
        }

        // Fetch comments
        const commentsResponse = await axios.get(
          `https://api.gharzoreality.com/api/property/${id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (commentsResponse.data.success) {
          setComments(commentsResponse.data.comments || []);
        } else {
          setComments([]);
          setError("No comments data available.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error.response?.status === 401
            ? "Unauthorized: Invalid or missing token."
            : error.response?.status === 304
            ? "Data not modified, using cached data."
            : "Failed to load ratings or comments. Please try again later.";
        setError(errorMessage);
        setComments([]);
        setAvgRating(0);
        setTotalRatings(0);
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    if (!id) {
      setError("Property ID is missing.");
      setLoading(false);
      return;
    }

    fetchRatingsAndComments();
  }, [token, id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-sans">
            Property Feedback
          </h1>
          <div className="flex justify-center items-center gap-3 mb-3">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`text-2xl transition-colors duration-200 ${
                  index < Math.round(avgRating)
                    ? "text-yellow-400 hover:text-yellow-500"
                    : "text-gray-300 hover:text-gray-400"
                }`}
              />
            ))}
          </div>
          <div className="inline-flex items-center bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-1 rounded-full">
            {avgRating.toFixed(1)} / 5
          </div>
          <p className="text-sm text-gray-500 mt-2">{totalRatings} Ratings</p>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-200" />

        {/* Error State */}
        {error && (
          <div className="text-center bg-red-100 text-red-600 p-4 rounded-lg mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading feedback...</p>
          </div>
        ) : (
          <>
            {/* Comments Section */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Comments
              </h2>
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar Placeholder */}
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                          {comment.userName?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {comment.userName || "Anonymous"}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {comment.createdAt
                                ? new Date(comment.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "Unknown date"}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {comment.comment || "No comment provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center text-lg">
                  No comments yet for this property.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationPropertyFeedback;