import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaChartLine, FaShieldAlt, FaHeadset, FaLock, FaCrown, FaVideo, FaTimes as FaClose } from 'react-icons/fa';

const OrgSubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landlordId, setLandlordId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const showDialog = (title, message) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const authToken = localStorage.getItem('orgToken');

    if (!authToken) {
      setError('Authentication token is required');
      setLoading(false);
      return;
    }

    // Fetch profile to get landlordId
   const profileData= fetch('https://api.gharzoreality.com/api/organization/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.json())
    .then((profileData) => {
        console.log('Fetching profile with token:', profileData);
        if (profileData) {
          const id = profileData.id;
          setLandlordId(id);
         console.log('Fetched landlordId:', id);
        } else {
          setError('Failed to fetch profile');
        }
      })
      .catch((err) => {
        setError('Error fetching profile');
      })
      .finally(() => {
        fetchPlans(authToken);
      });
  }, []);

  const fetchPlans = (authToken) => {
    setPlans([]);
    setLoading(true);
    setError(null);
    const url = 'https://api.gharzoreality.com/api/reel/reel-subscription-plans/active';

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlans(data.data);
        } else {
          setError('Failed to fetch reels plans');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching reels plans');
        setLoading(false);
      });
  };

  const handleMyPlansClick = () => {
    if (landlordId) {
      navigate(`/organization/my-reel-subscriptions`);
    } else {
      setError('Landlord ID not available');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    const captureUrl = "https://api.gharzoreality.com/api/reels/subscription/capture";

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        showDialog("Razorpay Error", "Razorpay SDK failed to load. Are you online?");
        return;
      }

      const price = plan.pricePerReel;

      const options = {
        key: "rzp_test_RRfW6t8CvR90od",
        amount: price * 100, // Amount in paise
        currency: "INR",
        name: "Draze App",
        description: `Subscription to ${plan.name}`,
        handler: async function (response) {
          try {
            const token = localStorage.getItem("orgToken");
            const body = {
              razorpay_payment_id: response.razorpay_payment_id,
              amount: price,
              landlordId: landlordId,
              planId: plan._id,
            };

            const postRes = await fetch(captureUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
            const postData = await postRes.json();
            if (postData.success) {
              showDialog("Success", `${postData.message} Payment ID: ${response.razorpay_payment_id}`);
              // Close modal after a delay to allow user to see it, then navigate
              setTimeout(() => {
                closeModal();
                navigate(`/organization/my-reel-subscriptions`);
              }, 2000);
            } else {
              showDialog("Subscription Error", "Subscription capture failed.");
            }
          } catch (err) {
            console.error("Error capturing subscription payment:", err);
            showDialog("Subscription Error", "Error capturing subscription. Please try again.");
          }
        },
        prefill: {
          name: "Landlord Name", // Can be fetched from profile
          email: "landlord@example.com", // Can be fetched from profile
          contact: "9999999999", // Can be fetched from profile
        },
        theme: {
          color: "#00C2FF",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Subscription initiation failed:", error);
      showDialog("Subscription Error", "Subscription failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  const formatDuration = (days) => {
    if (days === 30) return '1 Month';
    if (days === 10) return '10 Days';
    return `${days} Days`;
  };

  const formatPrice = (price) => `₹${price}`;

  const features = [
    { icon: FaChartLine, name: 'Advanced Analytics' },
    { icon: FaShieldAlt, name: 'Secure Payments' },
    { icon: FaHeadset, name: '24/7 Support' },
    { icon: FaLock, name: 'Data Encryption' },
    { icon: FaCrown, name: 'Priority Access' },
  ];

  const getPlanFields = (plan) => {
    return {
      duration: 'Per Reel',
      max: plan.firstReelFree ? '1 Free Reel' : 'No Free',
      desc: plan.description,
      price: plan.pricePerReel,
    };
  };

  const isPopular = (plan) => {
    return plan.pricePerReel === Math.max(...plans.map(p => p.pricePerReel));
  };

  return (
    <>
      {/* Dialog Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeModal}></div>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full border ${
              modalContent.title === 'Success' ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">{modalContent.title}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FaClose />
                </button>
              </div>
              <p className={`text-sm ${modalContent.title === 'Success' ? 'text-green-300' : 'text-red-300'}`}>
                {modalContent.message}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-md font-semibold ${
                    modalContent.title === 'Success'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent mb-4">
              Subscription Plans - Reels
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
              Unlock the full potential of your reels business with our tailored subscription plans. Choose wisely and grow smarter.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center text-gray-400">No plans available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {plans.map((plan, index) => {
                const fields = getPlanFields(plan);
                const popular = isPopular(plan);
                return (
                  <div
                    key={plan._id}
                    className={`group bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border ${
                      popular 
                        ? 'ring-2 ring-orange-500 scale-102 border-orange-500' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="p-6 text-center relative z-10">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full mb-4 ${
                        popular ? 'bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900' : 'bg-gray-700 text-gray-300'
                      }`}>
                        <span className="text-xs font-medium">{fields.duration}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3">{plan.name}</h2>
                      <div className="mb-6">
                        <span className="text-4xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent">
                          {formatPrice(fields.price)}
                        </span>
                      </div>
                      <ul className="text-left mb-6 space-y-3">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
                          <span className="text-sm text-gray-300">Max: {fields.max}</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
                          <span className="text-sm text-gray-300">{fields.desc}</span>
                        </li>
                        {features.slice(0, 2).map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start">
                            <feature.icon className="text-[#00C2FF] mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
                            <span className="text-sm text-gray-300">{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white py-3 rounded-xl shadow-lg hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300 transform hover:scale-105 font-semibold`}
                      >
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-xs text-gray-500">All plans include a 30-day money-back guarantee. No questions asked.</p>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={handleMyPlansClick}
              className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300"
            >
              My Plans
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrgSubscriptionPlans;