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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-8 text-center relative overflow-hidden">
          <h2 className="text-2xl font-bold">Seller Profile</h2>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {!isEditing && (
            <div className="text-center mb-6">
              <img
                src={imgSrc}
                alt="Profile"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-purple-500 mb-4 transition-transform duration-300 hover:scale-105 hover:rotate-3 shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                }}
              />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">{currentProfile.name}</h3>
                <p className="text-gray-600">{currentProfile.email}</p>
                <p className="text-gray-600">{currentProfile.address}</p>
                <p className="text-gray-600">{currentProfile.mobile}</p>
                {currentProfile.isVerified && (
                  <p className="text-green-600 font-medium">Verified</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleEditToggle}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-purple-700 hover:scale-105"
          >
            {isEditing ? 'View Profile' : 'Edit Profile'}
          </button>

          {isEditing && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <input
                  type="file"
                  name="profileImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted: JPG, PNG (Max 2MB)</p>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 mt-2 rounded-lg object-cover border-2 border-gray-200" 
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-green-700 hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Profile</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleEditToggle}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-red-700 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Cancel</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfileManager;