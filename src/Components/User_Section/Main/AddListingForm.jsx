import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  IndianRupee, 
  Upload, 
  X,
  BedDouble,
  Bath,
  Square,
  Users,
  Wifi,
  Car,
  ArrowLeft
} from 'lucide-react';

const AddListingForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    propertyType: '',
    listingType: 'rent',
    name: '',
    price: '',
    city: '',
    area: '',
    address: '',
    pinCode: '',
    description: '',
    images: [],
    
    // For Rent/Sale
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    parking: false,
    
    // For Rooms
    roomType: '',
    capacity: '',
    
    // For PG/Hostel
    gender: '',
    totalRooms: '',
    totalBeds: '',
    mess: false,
    laundry: false,
    
    // Common Amenities
    wifi: false,
    ac: false,
    gym: false,
    security: false,
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Listing added successfully! (This is a demo)');
    // Here you would send data to your API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-[#0b4f91] to-[#FF6B00] bg-clip-text text-transparent">
                Add Your Property
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Fill in the details to list your property</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="space-y-6">
            
            {/* Property Type & Listing Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Home className="inline mr-2" size={18} />
                  Property Type *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
                >
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="room">Room</option>
                  <option value="pg">PG</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Listing For *
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
                >
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
              </div>
            </div>

            {/* Basic Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Luxury 3BHK Apartment"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <IndianRupee className="inline mr-2" size={18} />
                Price * ({formData.listingType === 'rent' ? 'per month' : 'total'})
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Enter price"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="inline mr-2" size={18} />
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Indore"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area/Locality *
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Vijay Nagar"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter complete address"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pin Code *
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                required
                pattern="[0-9]{6}"
                placeholder="6-digit pin code"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            {/* Dynamic Fields Based on Property Type */}
            
            {/* For Apartment/Villa (Rent/Sale) */}
            {(formData.propertyType === 'apartment' || formData.propertyType === 'villa') && (
              <div className="space-y-6 p-6 bg-blue-50 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BedDouble size={20} className="text-[#FF6B00]" />
                  Property Specifications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Square className="inline mr-1" size={16} />
                      Area (sq ft) *
                    </label>
                    <input
                      type="number"
                      name="area_sqft"
                      value={formData.area_sqft}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* For Rooms */}
            {formData.propertyType === 'room' && (
              <div className="space-y-6 p-6 bg-purple-50 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BedDouble size={20} className="text-[#FF6B00]" />
                  Room Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Room Type *
                    </label>
                    <select
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="single">Single Sharing</option>
                      <option value="double">Double Sharing</option>
                      <option value="triple">Triple Sharing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="inline mr-1" size={16} />
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      max="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* For PG/Hostel */}
            {(formData.propertyType === 'pg' || formData.propertyType === 'hostel') && (
              <div className="space-y-6 p-6 bg-orange-50 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Home size={20} className="text-[#FF6B00]" />
                  {formData.propertyType === 'pg' ? 'PG' : 'Hostel'} Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender Preference *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="boys">Boys Only</option>
                      <option value="girls">Girls Only</option>
                      <option value="coed">Co-ed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Rooms *
                    </label>
                    <input
                      type="number"
                      name="totalRooms"
                      value={formData.totalRooms}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Beds *
                    </label>
                    <input
                      type="number"
                      name="totalBeds"
                      value={formData.totalBeds}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="p-6 bg-green-50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wifi size={20} className="text-[#FF6B00]" />
                Amenities
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                  />
                  <span className="text-sm font-medium text-gray-700">WiFi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ac"
                    checked={formData.ac}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                  />
                  <span className="text-sm font-medium text-gray-700">AC</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                  />
                  <span className="text-sm font-medium text-gray-700">Parking</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="security"
                    checked={formData.security}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                  />
                  <span className="text-sm font-medium text-gray-700">Security</span>
                </label>

                {(formData.propertyType === 'pg' || formData.propertyType === 'hostel') && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="mess"
                        checked={formData.mess}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                      />
                      <span className="text-sm font-medium text-gray-700">Mess</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="laundry"
                        checked={formData.laundry}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                      />
                      <span className="text-sm font-medium text-gray-700">Laundry</span>
                    </label>
                  </>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="gym"
                    checked={formData.gym}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                  />
                  <span className="text-sm font-medium text-gray-700">Gym</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your property..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none resize-none transition-colors"
              ></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Upload className="inline mr-2" size={18} />
                Property Images
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FF6B00] transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-[#0b4f91] to-[#FF6B00] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Submit Listing
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListingForm;