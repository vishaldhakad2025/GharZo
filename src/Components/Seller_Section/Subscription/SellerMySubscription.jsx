import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { FaCheckCircle, FaCalendar, FaHome } from "react-icons/fa";

const SellerMySubscriptions = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // sellerId from route, but API doesn't need it
  const [subscription, setSubscription] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        toast.error("Please log in to view subscriptions.");
        navigate("/seller_login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch subscription
        const subRes = await axios.get("https://api.gharzoreality.com/api/seller/subscription/my-subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subRes.data.success) {
          setSubscription(subRes.data.data);
        } else {
          setSubscription(null);
        }

        // Fetch properties
        const propRes = await axios.get("https://api.gharzoreality.com/api/seller/getproperties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (propRes.data.success) {
          setProperties(propRes.data.properties || []);
        } else {
          setProperties([]);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("sellertoken");
          localStorage.removeItem("role");
          navigate("/seller_login");
        } else {
          setError(err.response?.data?.message || "Error loading data.");
          toast.error("Failed to load data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const propertyCount = properties.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl">Loading Subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
          <div className="text-red-500 mb-4">Error</div>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-900 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">My Subscriptions</h2>
          <p className="text-gray-300 mb-8">No active subscription found.</p>
          <motion.button
            onClick={() => navigate("/seller/subscription")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-800 shadow-lg hover:shadow-xl transition"
          >
            Choose a Plan
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
          <h2 className="text-4xl font-extrabold text-center mb-8 text-white drop-shadow-lg">
            My Active Subscription
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-xl border border-orange-500/30">
              <h3 className="text-2xl font-bold text-white">{subscription.planName}</h3>
              <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold">
                Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FaHome className="text-[#00C2FF] w-5 h-5" />
                  <span className="text-gray-300 font-medium">Property Limit</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {propertyCount} / {subscription.propertyLimit}
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FaCalendar className="text-[#00C2FF] w-5 h-5" />
                  <span className="text-gray-300 font-medium">Duration</span>
                </div>
                <p className="text-2xl font-bold text-white">{subscription.durationDays} days</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FaCheckCircle className="text-green-500 w-5 h-5" />
                  <span className="text-gray-300 font-medium">Price</span>
                </div>
                <p className="text-2xl font-bold text-white">₹{subscription.price}</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FaCheckCircle className="text-green-500 w-5 h-5" />
                  <span className="text-gray-300 font-medium">Payment Status</span>
                </div>
                <p className="text-2xl font-bold text-white">{subscription.paymentStatus}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <FaCalendar className="text-[#00C2FF] w-5 h-5" />
                <span className="text-gray-300 font-medium">Validity Period</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Start Date</p>
                  <p className="text-lg font-bold text-white">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">End Date</p>
                  <p className="text-lg font-bold text-white">{formatDate(subscription.endDate)}</p>
                </div>
              </div>
            </div>
            {subscription.description && (
              <div className="p-4 bg-gray-800 rounded-xl">
                <p className="text-gray-300 italic">{subscription.description}</p>
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <motion.button
              onClick={() => navigate("/seller/subscription")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] shadow-lg hover:shadow-xl transition"
            >
              Upgrade Plan
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerMySubscriptions;