// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Home, Calendar, Store, Video } from "lucide-react";
// import { toast } from "react-toastify";
// import axios from "axios";

// const SellerSubscription = () => {
//   const navigate = useNavigate();
//   const [propertyPlans, setPropertyPlans] = useState([]);
//   const [reelPlans, setReelPlans] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [selectedType, setSelectedType] = useState("properties"); // "properties" or "reels"
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sellerId, setSellerId] = useState(null);
//   const [seller, setSeller] = useState({ name: "", email: "", phone: "" });

//   useEffect(() => {
//     const fetchProfileAndPlans = async () => {
//       const token = localStorage.getItem("sellertoken");
//       if (!token) {
//         toast.error("Please log in to view subscription plans.");
//         navigate("/seller_login");
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         // Fetch Seller Profile
//         const profileRes = await axios.get("https://api.gharzoreality.com/api/seller/profile", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (profileRes.data.success) {
//           const profile = profileRes.data.seller;
//           setSellerId(profile._id);
//           localStorage.setItem("sellerId", profile._id);
//           setSeller({
//             name: profile.name || "N/A",
//             email: profile.email || "N/A",
//             phone: profile.mobile || profile.phone || "N/A",
//           });
//         }

//         // Fetch Property Plans
//         const propertyPlansRes = await axios.get("https://api.gharzoreality.com/api/seller/subscription/plans", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (propertyPlansRes.data.success) {
//           const fetchedPropertyPlans = propertyPlansRes.data.data
//             // Removed .filter(p => p.isActive) — backend not sending this field
//             .map((plan) => ({
//               name: plan.planName,
//               displayPrice: plan.price === 0 ? "Free" : `₹${plan.price}`,
//               priceNum: plan.price,
//               duration: plan.price === 0 ? "/ 7-day Trial" : `/ ${plan.durationDays} days`,
//               features: [
//                 { text: `List up to ${plan.propertyLimit} properties`, icon: Home },
//                 { text: `${plan.durationDays}-day duration`, icon: Calendar },
//                 { text: plan.isTrial ? "Free Trial Plan" : `${plan.planName} Plan`, icon: Store },
//               ],
//               gradient: getGradient(plan.planName),
//               id: plan._id,
//               type: "property",
//             }));
//           setPropertyPlans(fetchedPropertyPlans);
//         }

//         // Fetch Reel Plans
//         const reelPlansRes = await axios.get("https://api.gharzoreality.com/api/reel-subscription/seller/available-plans", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (reelPlansRes.data.success) {
//           const fetchedReelPlans = reelPlansRes.data.plans
//             .filter((p) => p.isActive)
//             .map((plan) => ({
//               name: plan.name.trim(),
//               displayPrice: `₹${plan.pricePerReel}`,
//               priceNum: plan.pricePerReel,
//               duration: "/ 30 days",
//               features: [
//                 { text: plan.description.trim(), icon: Video },
//                 { text: `${plan.freeReels} Free Reels Included`, icon: Home },
//                 { text: `Extra reels at ₹${plan.pricePerReel} each`, icon: Store },
//               ],
//               gradient: getGradientReel(plan.name.trim()),
//               id: plan._id,
//               type: "reel",
//             }));
//           setReelPlans(fetchedReelPlans);
//         }
//       } catch (err) {
//         const status = err.response?.status;
//         if (status === 401) {
//           toast.error("Session expired. Please log in again.");
//           localStorage.removeItem("sellertoken");
//           localStorage.removeItem("role");
//           navigate("/seller_login");
//         } else {
//           setError(err.response?.data?.message || "Failed to load plans.");
//           toast.error("Failed to load subscription plans.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfileAndPlans();
//   }, [navigate]);

//   // Update displayed plans when tab changes
//   useEffect(() => {
//     setPlans(selectedType === "properties" ? propertyPlans : reelPlans);
//   }, [selectedType, propertyPlans, reelPlans]);

//   const getGradient = (name) => {
//     const gradients = {
//       test: "from-sky-400 to-sky-600",
//       Basic: "from-orange-400 to-orange-600",
//       Silver: "from-purple-400 to-purple-600",
//       Gold: "from-green-400 to-green-600",
//       "Free Trial": "from-teal-400 to-teal-600",
//     };
//     return gradients[name] || "from-gray-400 to-gray-600";
//   };

//   const getGradientReel = (name) => {
//     return name.toLowerCase().includes("reel")
//       ? "from-blue-500 to-cyan-600"
//       : "from-pink-500 to-purple-600";
//   };

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handleSubscribe = async (plan) => {
//     if (!sellerId) {
//       toast.error("Seller ID not found. Please try again.");
//       return;
//     }

//     if (plan.priceNum === 0) {
//       toast.info("Free trial activated automatically!");
//       // Optional: Call API to activate free trial
//       return;
//     }

//     const res = await loadRazorpayScript();
//     if (!res) {
//       toast.error("Failed to load payment gateway. Check internet.");
//       return;
//     }

//     const options = {
//       key: "rzp_test_RRfW6t8CvR90od",
//       amount: plan.priceNum * 100,
//       currency: "INR",
//       name: "Draze App",
//       description: `Subscription: ${plan.name}`,
//       handler: async (response) => {
//         try {
//           const token = localStorage.getItem("sellertoken");
//           const body = {
//             razorpay_payment_id: response.razorpay_payment_id,
//             planId: plan.id,
//             amount: plan.priceNum,
//           };

//           const captureUrl =
//             plan.type === "reel"
//               ? "https://api.gharzoreality.com/api/reel-payment/seller/capture"
//               : "https://api.gharzoreality.com/api/seller/payment/capture";

//           if (plan.type === "reel") body.sellerId = sellerId;

//           const postRes = await axios.post(captureUrl, body, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           });

//           if (postRes.data.success) {
//             toast.success(postRes.data.message || "Subscription activated!");
//             navigate(plan.type === "reel" ? "/seller/my-reel-subscriptions" : "/seller/my-subscriptions");
//           }
//         } catch (err) {
//           toast.error("Payment failed. Please contact support.");
//         }
//       },
//       prefill: {
//         name: seller.name,
//         email: seller.email,
//         contact: seller.phone,
//       },
//       theme: { color: "#00C2FF" },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   const handleMyPlansClick = () => {
//     if (!sellerId) {
//       toast.error("Please wait, loading your profile...");
//       return;
//     }
//     navigate(selectedType === "reels" ? "/seller/my-reel-subscriptions" : "/seller/my-subscriptions");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
//           <p className="text-white text-xl">Loading Plans...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
//         <div className="text-center max-w-md mx-auto p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
//           <p className="text-red-400 text-2xl mb-4">Error</p>
//           <p className="text-gray-300 mb-6">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-900 transition"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 py-16">
//       <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-white drop-shadow-lg">
//         Choose Your Plan
//       </h2>

//       {/* Tabs */}
//       <div className="flex justify-center mb-10">
//         <button
//           onClick={() => setSelectedType("properties")}
//           className={`px-8 py-3 rounded-l-lg font-bold text-lg transition-all ${
//             selectedType === "properties"
//               ? "bg-gradient-to-r from-purple-600 to-indigo-800 shadow-xl scale-105"
//               : "bg-gray-700 hover:bg-gray-600"
//           }`}
//         >
//           Properties
//         </button>
//         <button
//           onClick={() => setSelectedType("reels")}
//           className={`px-8 py-3 rounded-r-lg font-bold text-lg transition-all ${
//             selectedType === "reels"
//               ? "bg-gradient-to-r from-purple-600 to-indigo-800 shadow-xl scale-105"
//               : "bg-gray-700 hover:bg-gray-600"
//           }`}
//         >
//           Reels
//         </button>
//       </div>

//       {/* Plans Grid */}
//       <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
//         {plans.length === 0 ? (
//           <div className="col-span-full text-center py-20">
//             <p className="text-gray-400 text-xl">No {selectedType === "properties" ? "property" : "reel"} plans available right now.</p>
//           </div>
//         ) : (
//           plans.map((plan, index) => (
//             <motion.div
//               key={plan.id}
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="rounded-2xl overflow-hidden bg-gray-900/90 backdrop-blur border border-gray-700 shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-105"
//             >
//               <div className={`bg-gradient-to-r ${plan.gradient} py-8 text-white text-center`}>
//                 <h3 className="text-2xl font-bold">{plan.name}</h3>
//                 <div className="mt-3">
//                   <span className="text-4xl font-extrabold">{plan.displayPrice}</span>
//                   <span className="text-lg opacity-90">{plan.duration}</span>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <ul className="space-y-4 mb-8">
//                   {plan.features.map((feature, i) => {
//                     const Icon = feature.icon;
//                     return (
//                       <motion.li
//                         key={i}
//                         initial={{ x: -20, opacity: 0 }}
//                         animate={{ x: 0, opacity: 1 }}
//                         transition={{ delay: i * 0.1 }}
//                         className="flex items-center gap-3 text-gray-200"
//                       >
//                         <div className="p-2 bg-gray-800 rounded-full">
//                           <Icon className="w-5 h-5 text-purple-400" />
//                         </div>
//                         <span>{feature.text}</span>
//                       </motion.li>
//                     );
//                   })}
//                 </ul>

//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => handleSubscribe(plan)}
//                   className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
//                     plan.priceNum === 0
//                       ? "bg-green-600 hover:bg-green-700"
//                       : "bg-gradient-to-r from-purple-600 to-indigo-800 hover:from-purple-700 hover:to-indigo-900 shadow-lg"
//                   }`}
//                 >
//                   {plan.priceNum === 0 ? "Activate Free Trial" : "Buy Now"}
//                 </motion.button>
//               </div>
//             </motion.div>
//           ))
//         )}
//       </div>

//       {/* View My Plans */}
//       <div className="text-center mt-16">
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={handleMyPlansClick}
//           className="px-10 py-4 rounded-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-800 shadow-xl hover:shadow-2xl transition"
//         >
//           View My Active Plans
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// export default SellerSubscription;




import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, Store, Video } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const SellerSubscription = () => {
  const navigate = useNavigate();
  const [propertyPlans, setPropertyPlans] = useState([]);
  const [reelPlans, setReelPlans] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedType, setSelectedType] = useState("properties");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerId, setSellerId] = useState(null);
  const [seller, setSeller] = useState({ name: "", email: "", phone: "" });
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false); // ← NEW: Trial used status

  useEffect(() => {
    const fetchProfileAndPlans = async () => {
      const token = localStorage.getItem("sellertoken");
      if (!token) {
        toast.error("Please log in to view subscription plans.");
        navigate("/seller_login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch Profile (includes trial status)
        const profileRes = await axios.get("https://api.gharzoreality.com/api/seller/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.data.success) {
          const profile = profileRes.data.seller;
          setSellerId(profile._id);
          localStorage.setItem("sellerId", profile._id);

          // ← IMPORTANT: Check if free trial is already used
          setHasUsedFreeTrial(profile.hasUsedTrial || profile.trialUsed || profile.freeTrialUsed || false);

          setSeller({
            name: profile.name || "N/A",
            email: profile.email || "N/A",
            phone: profile.mobile || profile.phone || "N/A",
          });
        }

        // Fetch Property Plans
        const propertyPlansRes = await axios.get(
          "https://api.gharzoreality.com/api/seller/subscription/plans",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (propertyPlansRes.data.success) {
          const fetchedPropertyPlans = propertyPlansRes.data.data.map((plan) => ({
            name: plan.planName,
            displayPrice: plan.price === 0 ? "Free" : `₹${plan.price}`,
            priceNum: plan.price,
            duration: plan.price === 0 ? "/ 7-day Trial" : `/ ${plan.durationDays} days`,
            features: [
              { text: `List up to ${plan.propertyLimit} properties`, icon: Home },
              { text: `${plan.durationDays}-day duration`, icon: Calendar },
              { text: plan.isTrial ? "Free Trial Plan" : `${plan.planName} Plan`, icon: Store },
            ],
            gradient: getGradient(plan.planName),
            id: plan._id,
            type: "property",
            isFreeTrial: plan.price === 0, // ← Mark free trial plan
          }));
          setPropertyPlans(fetchedPropertyPlans);
        }

        // Fetch Reel Plans
        const reelPlansRes = await axios.get(
          "https://api.gharzoreality.com/api/reel-subscription/seller/available-plans",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (reelPlansRes.data.success) {
          const fetchedReelPlans = reelPlansRes.data.plans
            .filter((p) => p.isActive)
            .map((plan) => ({
              name: plan.name.trim(),
              displayPrice: `₹${plan.pricePerReel}`,
              priceNum: plan.pricePerReel,
              duration: "/ 30 days",
              features: [
                { text: plan.description.trim(), icon: Video },
                { text: `${plan.freeReels} Free Reels Included`, icon: Home },
                { text: `Extra reels at ₹${plan.pricePerReel} each`, icon: Store },
              ],
              gradient: "from-blue-500 to-cyan-600",
              id: plan._id,
              type: "reel",
              isFreeTrial: false,
            }));
          setReelPlans(fetchedReelPlans);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("sellertoken");
          navigate("/seller_login");
        } else {
          setError("Failed to load plans. Please try again.");
          toast.error("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPlans();
  }, [navigate]);

  useEffect(() => {
    setPlans(selectedType === "properties" ? propertyPlans : reelPlans);
  }, [selectedType, propertyPlans, reelPlans]);

  const getGradient = (name) => {
    const map = {
      test: "from-sky-400 to-sky-600",
      Basic: "from-orange-400 to-orange-600",
      Silver: "from-purple-400 to-purple-600",
      Gold: "from-green-400 to-green-600",
      "Free Trial": "from-teal-500 to-emerald-600",
    };
    return map[name] || "from-gray-500 to-gray-700";
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    if (!sellerId) return toast.error("Loading profile...");

    // Free Trial Already Used → Block
    if (plan.isFreeTrial && hasUsedFreeTrial) {
      toast.info("You have already used your free trial.");
      return;
    }

    if (plan.priceNum === 0) {
      toast.success("Free trial activated successfully!");
      navigate("/seller/my-subscriptions");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) return toast.error("Payment gateway failed to load.");

    const options = {
      key: "rzp_test_RRfW6t8CvR90od",
      amount: plan.priceNum * 100,
      currency: "INR",
      name: "Draze App",
      description: `Purchase: ${plan.name}`,
      handler: async (response) => {
        try {
          const token = localStorage.getItem("sellertoken");
          const body = {
            razorpay_payment_id: response.razorpay_payment_id,
            planId: plan.id,
            amount: plan.priceNum,
          };
          if (plan.type === "reel") body.sellerId = sellerId;

          const url =
            plan.type === "reel"
              ? "https://api.gharzoreality.com/api/reel-payment/seller/capture"
              : "https://api.gharzoreality.com/api/seller/payment/capture";

          const res = await axios.post(url, body, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.success) {
            toast.success("Payment successful! Plan activated.");
            navigate(plan.type === "reel" ? "/seller/my-reel-subscriptions" : "/seller/my-subscriptions");
          }
        } catch (err) {
          toast.error("Payment failed. Please try again.");
        }
      },
      prefill: { name: seller.name, email: seller.email, contact: seller.phone },
      theme: { color: "#8b5cf6" },
    };

    new window.Razorpay(options).open();
  };

  const handleMyPlansClick = () => {
    if (!sellerId) return toast.error("Loading...");
    navigate(selectedType === "reels" ? "/seller/my-reel-subscriptions" : "/seller/my-subscriptions");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading Plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8 bg-gray-900/80 rounded-2xl border border-gray-700">
          <p className="text-red-400 text-2xl mb-4">Error</p>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-800 text-white rounded-lg font-bold hover:scale-105 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 py-16">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-white">
        Choose Your Plan
      </h2>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => setSelectedType("properties")}
          className={`px-10 py-4 rounded-l-xl font-bold text-lg transition-all ${
            selectedType === "properties"
              ? "bg-gradient-to-r from-purple-600 to-indigo-800 shadow-2xl scale-105"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setSelectedType("reels")}
          className={`px-10 py-4 rounded-r-xl font-bold text-lg transition-all ${
            selectedType === "reels"
              ? "bg-gradient-to-r from-purple-600 to-indigo-800 shadow-2xl scale-105"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Reels
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {plans.length === 0 ? (
          <p className="col-span-full text-center text-gray-400 text-xl py-20">
            No {selectedType === "properties" ? "property" : "reel"} plans available.
          </p>
        ) : (
          plans.map((plan, i) => {
            const isFreeTrialUsed = plan.isFreeTrial && hasUsedFreeTrial;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl hover:shadow-purple-600/30 transition hover:scale-105"
              >
                <div className={`bg-gradient-to-r ${plan.gradient} py-8 text-white text-center`}>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-extrabold">{plan.displayPrice}</span>
                    <span className="block text-lg mt-2 opacity-90">{plan.duration}</span>
                  </div>
                </div>

                <div className="p-8">
                  <ul className="space-y-5 mb-10">
                    {plan.features.map((f, idx) => {
                      const Icon = f.icon;
                      return (
                        <li key={idx} className="flex items-center gap-4 text-gray-300">
                          <div className="p-2 bg-purple-900/50 rounded-lg">
                            <Icon className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="text-base">{f.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <motion.button
                    whileHover={!isFreeTrialUsed ? { scale: 1.05 } : {}}
                    whileTap={!isFreeTrialUsed ? { scale: 0.95 } : {}}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isFreeTrialUsed}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                      isFreeTrialUsed
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : plan.isFreeTrial
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-gradient-to-r from-purple-600 to-indigo-800 hover:shadow-xl"
                    }`}
                  >
                    {isFreeTrialUsed
                      ? "Already Used"
                      : plan.isFreeTrial
                      ? "Activate Free Trial"
                      : "Buy Now"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="text-center mt-16">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMyPlansClick}
          className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-purple-500/50 transition"
        >
          View My Active Plans
        </motion.button>
      </div>
    </div>
  );
};

export default SellerSubscription;