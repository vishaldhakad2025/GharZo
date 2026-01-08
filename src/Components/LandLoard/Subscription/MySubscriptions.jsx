// MySubscriptions.jsx - Updated to handle populated planId and calculate totals from subscriptions
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendar, FaBed } from 'react-icons/fa';

const MySubscriptions = () => {
  const { landlordId: paramLandlordId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('beds'); // 'beds' or 'reels' but reels navigates
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [totalBeds, setTotalBeds] = useState(0); // Total properties beds
  const [totalSubscribedBeds, setTotalSubscribedBeds] = useState(0); // Sum of maxBeds from active subscriptions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchTotalBeds = async () => {
    const authToken = localStorage.getItem('token');
    let effectiveLandlordId = paramLandlordId || getLandlordIdFromToken();
    if (!authToken || !effectiveLandlordId) {
      console.error('Missing token or landlord ID for beds count');
      return;
    }

    try {
      console.log('Fetching total beds for ID:', effectiveLandlordId);
      const response = await fetch('https://api.gharzoreality.com/api/landlord/properties/beds/count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Total beds response:', data);
      if (data.success) {
        setTotalBeds(data.totalBeds || 0);
      } else {
        console.error('Failed to fetch total beds:', data.message);
      }
    } catch (err) {
      console.error('Error fetching total beds:', err);
    }
  };

  const fetchMySubscriptions = async () => {
    const authToken = localStorage.getItem('token');
    let effectiveLandlordId = paramLandlordId || getLandlordIdFromToken();
    if (!authToken || !effectiveLandlordId) {
      setError('Missing token or landlord ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching subscriptions for ID:', effectiveLandlordId);
      const response = await fetch(`https://api.gharzoreality.com/api/landlord/subscriptions/my-subscriptions/${effectiveLandlordId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Subscriptions response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Non-OK response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      console.log('My subscriptions response:', data);
      if (data.success) {
        setMySubscriptions(data.data || []);
        // Calculate totals for active subscriptions
        const activeSubs = (data.data || []).filter(sub => sub.status === 'active');
        const subscribedBeds = activeSubs.reduce((sum, sub) => sum + (sub.planId?.maxBeds || 0), 0);
        setTotalSubscribedBeds(subscribedBeds);
      } else {
        setError(`API said no: ${data.message || 'Unknown API error'}`);
      }
    } catch (err) {
      console.error('Full error fetching subscriptions:', err);
      setError(`Fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'beds') {
      console.log('Component mounted with paramLandlordId:', paramLandlordId);
      fetchTotalBeds();
      fetchMySubscriptions();
    }
  }, [paramLandlordId, view]);

  const handleReelsClick = () => {
    navigate(`/landlord/my-reel-subscriptions`);
  };

  const formatPrice = (price) => `₹${price}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  console.log('Rendering - view:', view, 'loading:', loading, 'error:', error, 'subs:', mySubscriptions.length, 'totalBeds:', totalBeds, 'totalSubscribedBeds:', totalSubscribedBeds);

  const activeButton = 'px-6 py-3 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 font-semibold rounded-xl shadow-lg';
  const inactiveButton = 'px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition';

  if (view === 'reels') {
    // This won't render since we navigate, but placeholder
    return null;
  }

  const renderedSubs = mySubscriptions.map((sub) => {
    const plan = sub.planId;
    if (!plan) {
      return (
        <div key={sub._id} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Unknown Plan</h2>
          <div className="mb-4">
            <span className="text-base text-gray-400">N/A</span>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            sub.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
          }`}>
            {sub.status.toUpperCase()}
          </span>
          <ul className="text-left mb-6 space-y-3 text-sm text-gray-300 mt-4">
            <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />Start: {formatDate(sub.startDate)}</li>
            <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />End: {formatDate(sub.endDate)}</li>
            <li className="flex items-center"><FaBed className="text-[#00C2FF] mr-2 w-4 h-4" />Beds: {sub.bedsUsed} / 0</li>
          </ul>
          <button className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition">Manage</button>
        </div>
      );
    }
    return (
      <div key={sub._id} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">{plan.name}</h2>
        <div className="mb-4">
          <span className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent">
            {formatPrice(plan.price)}
          </span>
          <span className="text-base text-gray-400 block">/month</span>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
          sub.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
        }`}>
          {sub.status.toUpperCase()}
        </span>
        <ul className="text-left mb-6 space-y-3 text-sm text-gray-300 mt-4">
          <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />Start: {formatDate(sub.startDate)}</li>
          <li className="flex items-center"><FaCalendar className="text-[#00C2FF] mr-2 w-4 h-4" />End: {formatDate(sub.endDate)}</li>
          <li className="flex items-center"><FaBed className="text-[#00C2FF] mr-2 w-4 h-4" />Beds: {sub.bedsUsed} / {plan.maxBeds}</li>
        </ul>
        <button className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition">Manage</button>
      </div>
    );
  });

  const bedsContent = (
    <>
      {loading && <div className="text-center text-gray-400 py-8">Loading beds subscriptions...</div>}
      {error && (
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchMySubscriptions} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Fetch
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderedSubs.length > 0 ? renderedSubs : (
            <div className="col-span-full text-center text-gray-400 py-8">No bed subscriptions found. Subscribe to a plan!</div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] bg-clip-text text-transparent mb-4">My Subscriptions</h1>
          <p className="text-lg text-gray-300">View and manage your active subscriptions.</p>
        </div>

        {/* Updated Bed Overview with totals from subscriptions */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Bed Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="flex flex-col items-center">
              <FaBed className="text-[#00C2FF] w-8 h-8 mb-2" />
              <span className="text-lg font-semibold text-white">Total Properties Beds</span>
              <span className="text-2xl font-bold text-gray-300">{totalBeds}</span>
            </div>
            <div className="flex flex-col items-center">
              <FaBed className="text-[#00FFAA] w-8 h-8 mb-2" />
              <span className="text-lg font-semibold text-white">Total Subscribed Beds</span>
              <span className="text-2xl font-bold text-gray-300">{totalSubscribedBeds}</span>
            </div>
          </div>
          {totalBeds > totalSubscribedBeds && (
            <p className="text-yellow-400 text-sm">You have more properties beds ({totalBeds - totalSubscribedBeds}) than subscribed. Upgrade your plan to utilize all!</p>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setView('beds')} 
            className={view === 'beds' ? activeButton : inactiveButton}
          >
            Beds
          </button>
          <button 
            onClick={handleReelsClick} 
            className={inactiveButton} // Since it navigates, no active state here
          >
            Reels
          </button>
        </div>
        {view === 'beds' && bedsContent}
        <div className="text-center mt-12">
          <p className="text-xs text-gray-500">Manage easily.</p>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/landlord/subscription-plans')}
            className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-gray-900 hover:from-[#00AEEA] hover:to-[#00E099]"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;