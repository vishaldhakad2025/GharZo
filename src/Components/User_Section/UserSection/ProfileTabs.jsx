import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBuilding, 
  FaVideo, 
  FaCrown, 
  FaMapMarkerAlt, 
  FaRupeeSign,
  FaBed,
  FaBath,
  FaRuler,
  FaPlay,
  FaHeart,
  FaComment,
  FaShare,
  FaEye,
  FaCalendar,
  FaCheckCircle,
  FaUpload,
  FaTimes,
  FaTools,
  FaWrench,
  FaHardHat,
  FaStar // Added for ratings
} from 'react-icons/fa';

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedReel, setSelectedReel] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false); // New for adding service
  const [reelForm, setReelForm] = useState({
    title: '',
    description: '',
    propertyType: '',
    file: null
  });
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: '',
    price: '',
    location: '',
    experience: '',
    description: ''
  });

  // Dummy Data
  const myListings = [
    {
      id: 1,
      title: 'Luxury 3BHK Apartment',
      type: 'Apartment',
      price: '₹85,00,000',
      location: 'Vijay Nagar, Indore',
      bedrooms: 3,
      bathrooms: 2,
      area: '1450 sq ft',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500',
      status: 'Active',
      views: 245,
      inquiries: 12
    },
    {
      id: 2,
      title: 'Commercial Office Space',
      type: 'Office',
      price: '₹45,000/month',
      location: 'MG Road, Indore',
      bedrooms: null,
      bathrooms: 1,
      area: '850 sq ft',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
      status: 'Active',
      views: 189,
      inquiries: 8
    },
    {
      id: 3,
      title: 'Modern Studio Apartment',
      type: 'Studio',
      price: '₹35,00,000',
      location: 'AB Road, Indore',
      bedrooms: 1,
      bathrooms: 1,
      area: '650 sq ft',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
      status: 'Pending',
      views: 156,
      inquiries: 5
    }
  ];

  const myReels = [
    {
      id: 1,
      title: 'Luxury Villa Tour',
      thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500',
      views: 12500,
      likes: 856,
      comments: 42,
      duration: '0:45',
      uploadDate: '2 days ago'
    },
    {
      id: 2,
      title: 'Modern Kitchen Design',
      thumbnail: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
      views: 8900,
      likes: 624,
      comments: 28,
      duration: '0:32',
      uploadDate: '5 days ago'
    },
    {
      id: 3,
      title: 'Dream Home Interior',
      thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500',
      views: 15200,
      likes: 1245,
      comments: 67,
      duration: '1:05',
      uploadDate: '1 week ago'
    }
  ];

  const myServices = [
    {
      id: 1,
      title: 'Interior Designing & Execution',
      category: 'Interior Design',
      price: '₹45,000 - ₹2,50,000',
      location: 'Indore & Nearby',
      rating: 4.8,
      reviews: 67,
      experience: '8+ Years',
      image: 'https://space13design.com/wp-content/uploads/2024/04/Execution-Of-Interior-Designing-Project-In-Vadodara-1024x768.jpg',
      status: 'Available'
    },
    {
      id: 2,
      title: 'Property Legal Consultation',
      category: 'Legal Services',
      price: '₹5,000 - ₹15,000',
      location: 'Indore',
      rating: 4.9,
      reviews: 112,
      experience: '12+ Years',
      image: 'https://aranlaw.in/wp-content/uploads/2024/09/Property-Legal-Advisors-in-Chennai.png',
      status: 'Available'
    },
    {
      id: 3,
      title: 'Home Construction & Renovation',
      category: 'Construction',
      price: 'Custom Quote',
      location: 'Indore & MP',
      rating: 4.6,
      reviews: 89,
      experience: '15+ Years',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSevzSgq9oBAktWFWMDTOS7sXVPwC1X6ASZGw&s',
      status: 'Busy till Feb 15'
    }
  ];

  const mySubscriptions = [
    {
      id: 1,
      plan: 'Premium Pro',
      type: 'Monthly',
      price: '₹999',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: 'Active',
      features: ['Unlimited Listings', 'Featured Ads', 'Priority Support', 'Analytics Dashboard']
    },
    {
      id: 2,
      plan: 'Basic',
      type: 'Yearly',
      price: '₹4,999',
      startDate: '2025-06-15',
      endDate: '2026-06-14',
      status: 'Active',
      features: ['10 Listings/month', 'Email Support', 'Basic Analytics']
    }
  ];

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: <FaBuilding /> },
    { id: 'reels', label: 'My Reels', icon: <FaVideo /> },
    // { id: 'services', label: 'My Services', icon: <FaTools /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <FaCrown /> }
  ];

  const handleReelUpload = (e) => {
    e.preventDefault();
    console.log('Reel uploaded:', reelForm);
    alert('Reel uploaded successfully!');
    setUploadModal(false);
    setReelForm({ title: '', description: '', propertyType: '', file: null });
  };

  const handleServiceUpload = (e) => {
    e.preventDefault();
    console.log('Service added:', serviceForm);
    alert('Service added successfully!');
    setServiceModal(false);
    setServiceForm({ title: '', category: '', price: '', location: '', experience: '', description: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen"> {/* Improved container with bg */}
      {/* Tabs Header */}
      <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border border-gray-200"> {/* Enhanced shadow and border */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{tab.icon}</span> {/* Larger icons */}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'listings' && (
          <motion.div
            key="listings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {myListings.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="relative aspect-[4/3]"> {/* Fixed aspect ratio for images */}
                  <img src={property.image} alt={property.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {property.type}
                    </span>
                  </div>
                </div>
                
                <div className="p-5"> {/* Increased padding */}
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{property.title}</h3> {/* Larger title */}
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <FaMapMarkerAlt className="mr-1 text-blue-500" /> {/* Colored icon */}
                    <span>{property.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <FaBed className="text-indigo-500" /> {property.bedrooms}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FaBath className="text-indigo-500" /> {property.bathrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRuler className="text-indigo-500" /> {property.area}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-blue-600 font-bold text-xl">{property.price}</span> {/* Larger price */}
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FaEye className="text-green-500" /> {property.views}</span>
                      <span className="flex items-center gap-1"><FaComment className="text-purple-500" /> {property.inquiries}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'reels' && (
          <motion.div
            key="reels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-md hover:shadow-xl transition-all duration-300"
              >
                <FaUpload />
                Upload New Reel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReel(reel)}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                  <div className="relative aspect-[9/16]"> {/* Better aspect for reels/thumbnails */}
                    <img src={reel.thumbnail} alt={reel.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <FaPlay className="text-white text-5xl" /> {/* Larger play icon */}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                      {reel.duration}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{reel.title}</h3> {/* Larger title */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1"><FaEye className="text-green-500" /> {reel.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><FaHeart className="text-red-500" /> {reel.likes}</span>
                      </div>
                      <span className="text-xs text-gray-500">{reel.uploadDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setServiceModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full font-semibold shadow-md hover:shadow-xl transition-all duration-300"
              >
                <FaUpload />
                Add New Service
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myServices.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
                >
                  <div className="relative aspect-[4/3]"> {/* Fixed aspect ratio for images */}
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.status === 'Available' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                      {service.title}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <FaMapMarkerAlt className="mr-1 text-indigo-500" />
                      <span>{service.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-4">
                      <div className="flex items-center gap-1">
                        <FaHardHat className="text-amber-600" />
                        <span>{service.experience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" />
                        {service.rating} ({service.reviews})
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-indigo-600 font-bold text-xl">
                        {service.price}
                      </span>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-300">
                        Contact Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'subscriptions' && (
          <motion.div
            key="subscriptions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {mySubscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{sub.plan}</h3>
                    <span className="text-sm text-gray-600">{sub.type} Plan</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    <FaCheckCircle className="inline mr-1" />
                    {sub.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{sub.price}</div>
                  <div className="flex items-center text-sm text-gray-600 gap-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-blue-500" />
                      {sub.startDate}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-blue-500" />
                      {sub.endDate}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Features:</h4>
                  <ul className="space-y-2">
                    {sub.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                  Manage Plan
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Reel Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl my-4" // Added my-4 for vertical spacing on small screens
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Upload Reel</h3>
              <button onClick={() => setUploadModal(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleReelUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={reelForm.title}
                  onChange={(e) => setReelForm({...reelForm, title: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter reel title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={reelForm.description}
                  onChange={(e) => setReelForm({...reelForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder="Describe your reel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <select
                  value={reelForm.propertyType}
                  onChange={(e) => setReelForm({...reelForm, propertyType: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setReelForm({...reelForm, file: e.target.files[0]})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Upload Reel
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Service Modal */}
    {serviceModal && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto"
    onClick={() => setServiceModal(false)} // Close when clicking outside
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
      // Stop click propagation so clicking inside doesn't close modal
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">Add New Service</h3>
        <button 
          onClick={() => setServiceModal(false)}
          className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
        <form onSubmit={handleServiceUpload} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={serviceForm.title}
              onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Enter service title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={serviceForm.category}
              onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            >
              <option value="">Select category</option>
              <option value="Interior Design">Interior Design</option>
              <option value="Legal Services">Legal Services</option>
              <option value="Construction">Construction</option>
              <option value="Architecture">Architecture</option>
              <option value="Vastu Consultant">Vastu Consultant</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
            <input
              type="text"
              value={serviceForm.price}
              onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="e.g. ₹45,000 - ₹2,50,000 or Custom Quote"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              value={serviceForm.location}
              onChange={(e) => setServiceForm({...serviceForm, location: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="e.g. Indore & Nearby Cities"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
            <input
              type="text"
              value={serviceForm.experience}
              onChange={(e) => setServiceForm({...serviceForm, experience: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="e.g. 8+ Years"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={serviceForm.description}
              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
              placeholder="Describe your service, what you offer, typical timeline, etc..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  </div>
)}
      {/* Reel Preview Modal */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setSelectedReel(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedReel.title}</h3>
              <button onClick={() => setSelectedReel(null)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            
            <img src={selectedReel.thumbnail} alt={selectedReel.title} className="w-full h-96 object-cover rounded-xl mb-4 shadow-md" />
            
            <div className="flex justify-between items-center text-gray-600">
              <div className="flex gap-6">
                <span className="flex items-center gap-2"><FaHeart className="text-red-500" /> {selectedReel.likes} Likes</span>
                <span className="flex items-center gap-2"><FaComment className="text-blue-500" /> {selectedReel.comments} Comments</span>
                <span className="flex items-center gap-2"><FaEye className="text-green-500" /> {selectedReel.views.toLocaleString()} Views</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                <FaShare size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfileTabs;