// MyReelSubscriptions.jsx - Updated to handle direct plan fields from API response
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaVideo } from 'react-icons/fa';

const OrgMyReelSubscriptions = () => {
  const navigate = useNavigate();
  const [myReelSubscriptions, setMyReelSubscriptions] = useState([]);
  const [totalReels, setTotalReels] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoSubDialog, setShowNoSubDialog] = useState(false);


  const fetchMyReelSubscriptions = async () => {
    const authToken = localStorage.getItem('orgToken');
    if (!authToken) {
      setError('Missing token');
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

  if (errorText.includes("No active reel subscriptions")) {
    setShowNoSubDialog(true);  // OPEN DIALOG
    return;
  }

  throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
}

      const data = await response.json();
      console.log('My reel subscriptions response:', data);
      if (data.success) {
        setMyReelSubscriptions(data.data || []);
      } else {
        setError(`API said no: ${data.message || 'Unknown API error'}`);
      }
    } catch (err) {
      console.error('Full error fetching reel subscriptions:', err);
      setError(`Fetch failed: ${err.message}`);
    }
  };

  const fetchTotalReels = async () => {
    const authToken = localStorage.getItem('orgToken');
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
      // Don't set error here, as it's secondary
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchMyReelSubscriptions(), fetchTotalReels()]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const formatPrice = (price) => `₹${price}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  console.log('Rendering Reels - loading:', loading, 'error:', error, 'reel subs:', myReelSubscriptions.length, 'totalReels:', totalReels);

  const activeSubs = myReelSubscriptions.filter(sub => sub.status === 'active');
  const totalFreeReelsAvailable = activeSubs.reduce((sum, sub) => sum + (sub.remainingReels || 0), 0); // Use actual remaining from API

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-lg text-gray-400">Loading...</div></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  const renderedReelSubs = myReelSubscriptions.map((sub) => {
    // Extract plan details directly from sub since API returns them inline
    const planName = sub.planName || 'Unknown Plan';
    const planPrice = sub.pricePerReel || 0;
    const description = sub.description || '';
    const remainingReels = sub.remainingReels || 0;
    const reelLimit = sub.reelLimit || 1;

    // If no planName and reelsUploaded > 0, treat as trial (fallback for legacy cases)
    if (!planName && sub.reelsUploaded > 0) {
      return (
        <div key={sub.id} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 text-center">
          {/* Dialog for No Active Subscriptions */}
{showNoSubDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white max-w-sm w-full rounded-xl shadow-xl p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">No Active Subscription</h2>

      <p className="text-gray-600 mb-6 text-base leading-relaxed">
        You don’t have any active reel subscription plan.
      </p>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => setShowNoSubDialog(false)}
          className="px-4 py-2 w-full sm:w-auto rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
        >
          Close
        </button>

        <button
          onClick={() => (window.location.href = "/organization/subscription-plans")}
          className="px-4 py-2 w-full sm:w-auto rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
        >
          Buy Subscription
        </button>
      </div>
    </div>
  </div>
)}

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

    // For cases with no planName at all, show warning
    if (!planName) {
      return <div key={sub.id} className="col-span-full text-yellow-400 p-4">Plan missing for sub {sub.id}</div>;
    }

    // Normal rendering with direct fields
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
        <button
            onClick={() => navigate('/organization/subscription-plans')}
            className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 hover:from-[#00AEEA] hover:to-[#00E099]"
          >
            Get More Plans
          </button>
      </div>
    );
  });

  const reelsContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {renderedReelSubs.length > 0 ? renderedReelSubs : (
        <div className="col-span-full text-center text-gray-400 py-8">No reel subscriptions found. Subscribe to a reel plan!</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent mb-4">My Reel Subscriptions</h1>
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
        {reelsContent}
        <div className="text-center mt-12">
          <p className="text-xs text-gray-500">Manage easily.</p>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/organization/subscription-plans')}
            className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 hover:from-[#00AEEA] hover:to-[#00E099]"
          >
            View Reel Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgMyReelSubscriptions;