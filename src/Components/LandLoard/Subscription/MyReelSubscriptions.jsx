// MyReelSubscriptions.jsx - Updated with dialog for no active plans
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaVideo, FaTimes } from 'react-icons/fa';

const MyReelSubscriptions = () => {
  const navigate = useNavigate();
  const [myReelSubscriptions, setMyReelSubscriptions] = useState([]);
  const [totalReels, setTotalReels] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNoPlanDialog, setShowNoPlanDialog] = useState(false);

  const getLandlordIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  const fetchMyReelSubscriptions = async () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching reel subscriptions...');
      const response = await fetch('https://api.gharzoreality.com/api/landlord/reel-subscriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Reel subscriptions response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Non-OK response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      console.log('My reel subscriptions response:', data);
      if (data.success) {
        setMyReelSubscriptions(data.data || []);
      }
    } catch (err) {
      console.error('Full error fetching reel subscriptions:', err);
      // Do NOT set error state here — we'll show dialog instead
    }
  };

  const fetchTotalReels = async () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) return;

    try {
      console.log('Fetching total reels...');
      const response = await fetch('https://api.gharzoreality.com/api/reels/landlord/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Total reels response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Non-OK response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      console.log('Total reels response:', data);
      if (data.success && data.pagination) {
        setTotalReels(data.pagination.totalReels || 0);
      } else {
        console.error('No pagination data in response');
      }
    } catch (err) {
      console.error('Full error fetching total reels:', err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchMyReelSubscriptions(), fetchTotalReels()]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    // Show dialog only if no subscriptions AND not loading
    if (!loading && myReelSubscriptions.length === 0) {
      setShowNoPlanDialog(true);
    }
  }, [loading, myReelSubscriptions]);

  const handleBedsClick = () => {
    const landlordId = getLandlordIdFromToken();
    if (landlordId) {
      navigate(`/landlord/my-subscriptions/${landlordId}`);
    } else {
      console.error('No landlord ID available for navigation');
    }
  };

  const formatPrice = (price) => `₹${price}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  console.log('Rendering Reels - loading:', loading, 'reel subs:', myReelSubscriptions.length, 'totalReels:', totalReels);

  const activeSubs = myReelSubscriptions.filter(sub => sub.status === 'active');
  const totalFreeReelsAvailable = activeSubs.reduce((sum, sub) => sum + (sub.remainingReels || 0), 0);

  const activeButton = 'px-6 py-3 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 font-semibold rounded-xl shadow-lg';
  const inactiveButton = 'px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition';

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-lg text-gray-400">Loading...</div></div>;
  }

  const renderedReelSubs = myReelSubscriptions.map((sub) => {
    const planName = sub.planName || 'Unknown Plan';
    const planPrice = sub.pricePerReel || 0;
    const description = sub.description || '';
    const remainingReels = sub.remainingReels || 0;
    const reelLimit = sub.reelLimit || 1;

    if (!planName && sub.reelsUploaded > 0) {
      return (
        <div key={sub.id} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Trial Plan</h2>
          <div className="mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent">
              Free
            </span>
            <span className="text-base text-gray-400 block">/1 reel</span>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            sub.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
          }`}>
            {sub.status.toUpperCase()}
          </span>
          <ul className="text-left mb-6 space-y-3 text-sm text-gray-300 mt-4">
            <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />Start: {formatDate(sub.startDate)}</li>
            <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />End: {formatDate(sub.endDate)}</li>
            <li className="flex items-center"><FaVideo className="text-[#00C2FF] mr-2 w-4 h-4" />Reels Uploaded: {sub.reelsUploaded}/1</li>
            <li className="flex items-center"><FaVideo className="text-green-400 mr-2 w-4 h-4" />Remaining Free: {remainingReels}</li>
          </ul>
          <button className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition">Manage</button>
        </div>
      );
    }

    if (!planName) {
      return <div key={sub.id} className="col-span-full text-yellow-400 p-4">Plan missing for sub {sub.id}</div>;
    }

    return (
      <div key={sub.id} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">{planName}</h2>
        {description && <p className="text-gray-400 text-sm mb-2">{description}</p>}
        <div className="mb-4">
          <span className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent">
            {formatPrice(planPrice)}
          </span>
          <span className="text-base text-gray-400 block">/reel (after free limit)</span>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
          sub.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
        }`}>
          {sub.status.toUpperCase()}
        </span>
        <ul className="text-left mb-6 space-y-3 text-sm text-gray-300 mt-4">
          <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />Start: {formatDate(sub.startDate)}</li>
          <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />End: {formatDate(sub.endDate)}</li>
          <li className="flex items-center"><FaVideo className="text-[#00C2FF] mr-2 w-4 h-4" />Reels Uploaded: {sub.reelsUploaded}/{reelLimit}</li>
          <li className="flex items-center"><FaVideo className="text-green-400 mr-2 w-4 h-4" />Remaining Free: {remainingReels}</li>
        </ul>
        <button className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition">Manage</button>
      </div>
    );
  });

  const reelsContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {renderedReelSubs.length > 0 ? renderedReelSubs : null}
    </div>
  );

  return (
    <>
      {/* No Active Plan Dialog */}
      {showNoPlanDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700 relative animate-fadeIn">
            <button
              onClick={() => setShowNoPlanDialog(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] rounded-full flex items-center justify-center">
                <FaVideo className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Reel Subscriptions</h3>
              <p className="text-gray-400 text-sm mb-6">
                Subscribe to a plan to start creating and uploading reels.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNoPlanDialog(false);
                    navigate('/landlord/subscription-plans');
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 font-semibold rounded-xl hover:from-[#00AEEA] hover:to-[#00E099] transition"
                >
                  View Reel Plans
                </button>
                <button
                  onClick={() => setShowNoPlanDialog(false)}
                  className="flex-1 py-2.5 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent mb-4">My Subscriptions</h1>
            <p className="text-lg text-gray-300">View and manage your active subscriptions.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300">Total Reels Uploaded</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent">{totalReels}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300">Total Free Reels Available</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent">{totalFreeReelsAvailable}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={handleBedsClick} 
              className={inactiveButton}
            >
              Beds
            </button>
            <button 
              className={activeButton}
            >
              Reels
            </button>
          </div>
          {reelsContent}
          <div className="text-center mt-12">
            <p className="text-xs text-gray-500">Manage easily.</p>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/landlord/subscription-plans')}
              className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 hover:from-[#00AEEA] hover:to-[#00E099]"
            >
              View Reel Plans
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyReelSubscriptions;