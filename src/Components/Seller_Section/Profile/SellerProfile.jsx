import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerProfileManager = () => {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const BASE_URL = 'https://api.gharzoreality.com/api';
  const DOMAIN = 'https://api.gharzoreality.com'; // For static assets
  const token = localStorage.getItem('sellertoken');

  useEffect(() => {
    if (!token) {
      alert('No token found. Please login first.');
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/seller/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      setCurrentProfile(data.seller);
      setFormData({
        name: data.seller.name,
        email: data.seller.email,
        address: data.seller.address,
      });

      console.log('Fetched Profile:', data.seller);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormData({
        name: currentProfile.name,
        email: currentProfile.email,
        address: currentProfile.address,
      });
      setImagePreview('');
      setSelectedFile(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const submitFormData = new FormData();
    submitFormData.append('name', formData.name);
    submitFormData.append('email', formData.email);
    submitFormData.append('address', formData.address);
    if (selectedFile) {
      submitFormData.append('profileImage', selectedFile);
    }

    try {
      const response = await fetch(`${BASE_URL}/seller/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Update failed');
      }

      setCurrentProfile(data.seller);
      setSuccess(data.message || 'Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);

      console.log('Updated profile:', data.seller);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed Image URL construction
  const getImageUrl = () => {
    const imagePath = currentProfile.profileImage;
    if (!imagePath) return 'https://via.placeholder.com/128?text=No+Image';

    // If imagePath starts with '/', it's probably fine
    if (imagePath.startsWith('/')) return `${DOMAIN}${imagePath}`;

    // Otherwise, assume it's just a filename and needs /uploads/
    return `${DOMAIN}/uploads/${imagePath}`;
  };

  const imgSrc = getImageUrl();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4">
  //     <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
  //       <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-8 text-center relative overflow-hidden">
  //         <h2 className="text-2xl font-bold">Seller Profile</h2>
  //       </div>

  //       <div className="p-8">
  //         {error && (
  //           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  //             {error}
  //           </div>
  //         )}
  //         {success && (
  //           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
  //             {success}
  //           </div>
  //         )}

  //         {!isEditing && (
  //           <div className="text-center mb-6">
  //             <img
  //               src={imgSrc}
  //               alt="Profile"
  //               className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-purple-500 mb-4 transition-transform duration-300 hover:scale-105 hover:rotate-3 shadow-lg"
  //               onError={(e) => {
  //                 e.target.src = 'https://via.placeholder.com/128?text=No+Image';
  //               }}
  //             />
  //             <div className="space-y-2">
  //               <h3 className="text-2xl font-bold text-gray-800">{currentProfile.name}</h3>
  //               <p className="text-gray-600">{currentProfile.email}</p>
  //               <p className="text-gray-600">{currentProfile.address}</p>
  //               <p className="text-gray-600">{currentProfile.mobile}</p>
  //               {currentProfile.isVerified && (
  //                 <p className="text-green-600 font-medium">Verified</p>
  //               )}
  //             </div>
  //           </div>
  //         )}

  //         <button
  //           onClick={handleEditToggle}
  //           className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-purple-700 hover:scale-105"
  //         >
  //           {isEditing ? 'View Profile' : 'Edit Profile'}
  //         </button>

  //         {isEditing && (
  //           <form onSubmit={handleSubmit} className="mt-6 space-y-4">
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
  //               <input
  //                 type="text"
  //                 name="name"
  //                 value={formData.name}
  //                 onChange={handleInputChange}
  //                 required
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  //               />
  //             </div>

  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
  //               <input
  //                 type="email"
  //                 name="email"
  //                 value={formData.email}
  //                 onChange={handleInputChange}
  //                 required
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  //               />
  //             </div>


  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
  //               <input
  //                 type="email"
  //                 name="email"
  //                 value={formData.email}
  //                 onChange={handleInputChange}
  //                 required
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  //               />
  //             </div>

  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
  //               <input
  //                 type="text"
  //                 name="address"
  //                 value={formData.address}
  //                 onChange={handleInputChange}
  //                 required
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  //               />
  //             </div>

  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
  //               <input
  //                 type="file"
  //                 name="profileImage"
  //                 onChange={handleFileChange}
  //                 accept="image/*"
  //                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
  //               />
  //               <p className="text-xs text-gray-500 mt-1">Accepted: JPG, PNG (Max 2MB)</p>
  //               {imagePreview && (
  //                 <img 
  //                   src={imagePreview} 
  //                   alt="Preview" 
  //                   className="w-24 h-24 mt-2 rounded-lg object-cover border-2 border-gray-200" 
  //                 />
  //               )}
  //             </div>

  //             <button
  //               type="submit"
  //               disabled={loading}
  //               className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-green-700 hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
  //             >
  //               {loading ? (
  //                 <>
  //                   <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  //                   <span>Updating...</span>
  //                 </>
  //               ) : (
  //                 <span>Update Profile</span>
  //               )}
  //             </button>

  //             <button
  //               type="button"
  //               onClick={handleEditToggle}
  //               className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-red-700 hover:scale-105 flex items-center justify-center space-x-2"
  //             >
  //               <span>Cancel</span>
  //             </button>
  //           </form>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 flex items-center justify-center px-4 py-10">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-3xl">

      {/* Enhanced Header with gradient */}
      <div className="relative px-8 pt-8 pb-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300"></div>
        
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {currentProfile?.name?.[0]?.toUpperCase() || "S"}
              </span>
            </div>
            {currentProfile?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Seller Profile</h2>
            <p className="text-sm text-gray-500 font-medium">Manage your account details</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">Active Now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">

        {/* Enhanced Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200 shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Enhanced VIEW MODE */}
        {!isEditing && (
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur-md opacity-30 animate-pulse"></div>
                <img
                  src={imgSrc}
                  alt="Profile"
                  className="relative w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-xl"
                  onError={(e) =>
                    (e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face")
                  }
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentProfile.name}
            </h3>
            
            <div className="space-y-3 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="font-medium">{currentProfile.email}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{currentProfile.address}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="font-medium">{currentProfile.mobile}</span>
              </div>
            </div>

            {currentProfile.isVerified && (
              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 shadow-sm">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-green-700">Verified Seller</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Toggle Button */}
        <button
          onClick={handleEditToggle}
          className="w-full mb-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
        >
          {isEditing ? (
            <>
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View Profile
            </>
          ) : (
            <>
              Edit Profile
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </>
          )}
        </button>

        {/* Enhanced EDIT MODE */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-3 focus:ring-orange-100 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-3 focus:ring-orange-100 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Address
                </span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-3 focus:ring-orange-100 outline-none transition-all"
                placeholder="123 Main Street, City, Country"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Profile Image
                </span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-all hover:border-orange-400 hover:bg-orange-50/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG (Max 2MB)
                  </p>
                </label>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 group"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleEditToggle}
                className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
);
};

export default SellerProfileManager;