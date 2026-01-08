// CreateWebsite.jsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const CreateWebsite = () => {
  const token = localStorage.getItem("orgToken");
  const [formData, setFormData] = useState({
    websiteName: '',
    about: '',
    themeColor: '#ff6600',
    facebook: '',
    instagram: '',
    linkedin: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');

  if (!token) {
    return <Navigate to="/organization/login" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Sending request with data:', formData); // Debug log for request payload

      // Use the correct API endpoint
      const apiUrl = 'https://api.gharzoreality.com/api/organization/website';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status, response.statusText); // Debug log for response status
      console.log('Response URL:', response.url); // Log the actual URL hit

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText); // Debug log for error body
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to create website'}`);
      }

      const result = await response.json();
      console.log('Success response:', result); // Debug log for success body

      if (result.success) {
        setSuccess(true);
        setCreatedUrl(result.data.url);
      } else {
        setError(result.message || 'Creation failed');
      }
    } catch (err) {
      console.error('Fetch error:', err); // Debug log for any other errors
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Organization Website</h1>
          <p className="text-gray-600">Set up a professional landing page for your organization in minutes.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website Name */}
            <div>
              <label htmlFor="websiteName" className="block text-sm font-medium text-gray-700 mb-2">
                Website Name *
              </label>
              <input
                id="websiteName"
                type="text"
                name="websiteName"
                value={formData.websiteName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your organization website name"
              />
            </div>

            {/* About */}
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                About Your Organization *
              </label>
              <textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tell us about your organization..."
              />
            </div>

            {/* Theme Color */}
            <div>
              <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700 mb-2">
                Theme Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  id="themeColor"
                  type="color"
                  name="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 focus:border-blue-500 cursor-pointer transition-all duration-200"
                />
                <span className="text-sm text-gray-500">Choose a primary color for your site</span>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                Social Media Links
              </h3>
              <div className="space-y-4">
                {/* Facebook */}
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">📘</span> Facebook URL
                  </label>
                  <input
                    id="facebook"
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/your-org"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">📷</span> Instagram URL
                  </label>
                  <input
                    id="instagram"
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/your-org"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">💼</span> LinkedIn URL
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/your-org"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 transform ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Website...
                </>
              ) : (
                <>
                  Create Website
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Website Created Successfully!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Your professional website is now live and ready to share.
                </p>
                {/* <a 
                  href={createdUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Visit Your Site
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>*/}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWebsite;