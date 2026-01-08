// New Component: src/components/SellerMyReelSubscriptions.jsx (or appropriate path)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Calendar, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const SellerMyReelSubscription = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [totalReels, setTotalReels] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReelSubscription = async () => {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        toast.error("Please log in to view your subscriptions.");
        navigate("/seller_login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [subRes, reelsRes] = await Promise.all([
          axios.get("https://api.gharzoreality.com/api/reel-subscription/seller/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://api.gharzoreality.com/api/seller/reels", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (subRes.data.success) {
          setSubscription(subRes.data.subscription);
        } else {
          throw new Error("Failed to fetch subscription");
        }

        if (reelsRes.data.success) {
          setTotalReels(reelsRes.data.reels ? reelsRes.data.reels.length : 0);
        } else {
          console.warn("Failed to fetch reels");
          setTotalReels(0);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("sellertoken");
          localStorage.removeItem("role");
          navigate("/seller_login");
        } else {
          setError(err.response?.data?.message || err.message || "Error loading subscription.");
          toast.error("Failed to load subscription.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReelSubscription();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl">Loading Your Reel Subscriptions...</p>
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

  const plan = subscription ? subscription.planId : null;
  const remainingFreeReels = plan ? plan.freeReels - subscription.usedFreeReels : 0;
  const totalCapacity = plan ? plan.freeReels + subscription.totalPaidReels : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 py-16">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
          My Reel Subscriptions
        </h2>
        <p className="text-gray-400 text-lg">Manage your active reel plans</p>
      </motion.div>

      {!subscription ? (
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
          <p className="text-gray-300 mb-6">No active subscription found.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/seller/subscription")}
            className="py-3 px-8 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-800 shadow-lg hover:shadow-xl transition"
          >
            Subscribe Now
          </motion.button>
        </div>
      ) : (
        <>
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="max-w-2xl mx-auto rounded-2xl shadow-2xl bg-gray-900/80 backdrop-blur-lg border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-center py-8 shadow-lg">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">{plan.name}</h3>
              <p className="text-blue-100 mt-2">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold">₹{plan.pricePerReel}</span>
                <span className="ml-1 text-lg font-medium">per additional reel</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6">
              {/* Reels Status */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-800 rounded-xl border border-gray-600">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Free Reels</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {remainingFreeReels > 0 ? `${remainingFreeReels} remaining` : "0 remaining"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Used: {subscription.usedFreeReels}/{plan.freeReels}
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-800 rounded-xl border border-gray-600">
                  <div className="flex items-center justify-center mb-2">
                    <Video className="w-6 h-6 text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Paid Reels</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{subscription.totalPaidReels}</div>
                  <div className="text-xs text-gray-400 mt-1">Total purchased</div>
                </div>

                <div className="text-center p-4 bg-gray-800 rounded-xl border border-gray-600">
                  <div className="flex items-center justify-center mb-2">
                    <Video className="w-6 h-6 text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Total Uploaded</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{totalReels}</div>
                  <div className="text-xs text-gray-400 mt-1">All time</div>
                </div>
              </div>

              {/* Balance */}
              <div className="text-center p-6 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-500/30">
                <h4 className="text-lg font-semibold text-white mb-2">Current Balance</h4>
                <div className="text-3xl font-bold text-purple-400">{subscription.balance} reels</div>
                <p className="text-gray-300 mt-2 text-sm">Ready to upload</p>
              </div>

              {/* Capacity */}
              <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                <h4 className="text-lg font-semibold text-white mb-2">Total Capacity</h4>
                <div className="text-3xl font-bold text-green-400">{totalCapacity}</div>
                <p className="text-gray-300 mt-2 text-sm">Maximum reels allowed</p>
              </div>

              {/* Duration */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">Active since {new Date(subscription.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-400 text-sm">Plan expires in 30 days</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/seller/subscription")}
                  className="flex-1 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-800 shadow-lg hover:shadow-xl transition"
                >
                  Upgrade Plan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/seller/reels")}
                  className="flex-1 py-3 rounded-lg font-bold text-gray-700 bg-white shadow-lg hover:shadow-xl transition"
                >
                  Upload Reel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SellerMyReelSubscription;