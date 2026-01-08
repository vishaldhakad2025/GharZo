import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";

const PropertyFeedback = () => {
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [activeTab, setActiveTab] = useState("reviews");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) {
        setError("Missing token or property ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const ratingsRes = await axios.get(
          `https://api.gharzoreality.com/api/property/${id}/ratings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (ratingsRes.data.success) {
          setRatings(ratingsRes.data.ratings || []);
          setAvgRating(ratingsRes.data.stats?.averageRating || 0);
          setTotalRatings(ratingsRes.data.stats?.totalRatings || 0);
        }

        const commentsRes = await axios.get(
          `https://api.gharzoreality.com/api/property/${id}/comments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (commentsRes.data.success) {
          setComments(commentsRes.data.comments || []);
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`text-lg ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Property Feedback</h1>
          <div className="flex justify-center gap-1 mb-2">
            {renderStars(Math.round(avgRating))}
          </div>
          <p className="text-4xl font-extrabold">{avgRating.toFixed(1)}</p>
          <p className="text-lg opacity-90">({totalRatings} reviews)</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-5 text-lg font-bold transition-all ${
              activeTab === "reviews"
                ? "text-indigo-600 border-b-4 border-indigo-600 bg-white"
                : "text-gray-600"
            }`}
          >
            Reviews ({ratings.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex-1 py-5 text-lg font-bold transition-all ${
              activeTab === "comments"
                ? "text-indigo-600 border-b-4 border-indigo-600 bg-white"
                : "text-gray-600"
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>

        <div className="p-6">

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {ratings.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-12">No reviews yet</p>
              ) : (
                ratings.map((r) => (
                  <div key={r._id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        {r.userName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        {/* User Name - Bada aur Clear */}
                        <h3 className="text-xl font-extrabold text-gray-800">
                          {r.userName || "Anonymous User"}
                        </h3>

                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <div className="flex gap-1">
                            {renderStars(r.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            • {new Date(r.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <p className="text-gray-700 text-lg leading-relaxed">
                          {r.review || "No review text"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-12">No comments yet</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        {c.userName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        {/* Comment mein bhi naam bold aur clear */}
                        <h3 className="text-xl font-extrabold text-gray-800">
                          {c.userName || "Anonymous User"}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 mb-3">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <p className="text-gray-800 text-lg font-medium bg-white px-4 py-3 rounded-xl inline-block shadow-sm">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyFeedback;