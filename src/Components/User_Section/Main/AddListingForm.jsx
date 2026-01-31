import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowLeft,
  CheckCircle,
  Loader,
  Phone,
  Mail,
  User
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://api.gharzoreality.com/api/v2';

const AddListingForm = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyId, setPropertyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Property Type
    category: '',
    propertyType: '',
    listingType: 'Sale',
    
    // Step 2: Basic Details
    title: '',
    description: '',
    bhk: '',
    bathrooms: '',
    balconies: '',
    price: '',
    negotiable: true,
    maintenanceCharges: '',
    maintenanceFrequency: 'Monthly',
    securityDeposit: '',
    carpetArea: '',
    builtUpArea: '',
    areaUnit: 'sqft',
    currentFloor: '',
    totalFloors: '',
    propertyAge: '',
    availableFrom: '',
    
    // Step 3: Features
    furnishingType: 'Unfurnished',
    amenitiesList: [],
    powerBackup: '',
    waterSupply: '',
    gatedSecurity: false,
    liftAvailable: false,
    
    // Step 4: Location
    address: '',
    city: '',
    locality: '',
    subLocality: '',
    landmark: '',
    pincode: '',
    state: '',
    latitude: '',
    longitude: '',
    
    // Step 5: Images
    images: [],
    
    // Step 6: Contact Info
    contactName: '',
    contactPhone: '',
    alternatePhone: '',
    contactEmail: '',
    preferredCallTime: 'Evening (5PM-9PM)'
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const steps = [
    { number: 1, title: 'Property Type' },
    { number: 2, title: 'Basic Details' },
    { number: 3, title: 'Features' },
    { number: 4, title: 'Location' },
    { number: 5, title: 'Photos' },
    { number: 6, title: 'Contact Info' }
  ];

  const categoryOptions = ['Residential', 'Commercial'];
  
  const propertyTypeOptions = {
    Residential: ['Apartment', 'Villa', 'House', 'Plot'],
    Commercial: ['Shop', 'Office', 'Showroom', 'Warehouse'],
    Agricultural: ['Farm Land', 'Farm House']
  };

  const amenitiesOptions = [
    'CCTV', 'Power Backup', 'Visitor Parking', 'Security', 
    'Gym', 'Swimming Pool', 'Club House', 'Garden',
    'Kids Play Area', 'Lift', 'Water Purifier', 'Intercom'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenitiesList: prev.amenitiesList.includes(amenity)
        ? prev.amenitiesList.filter(a => a !== amenity)
        : [...prev.amenitiesList, amenity]
    }));
  };

  // Handle image input selection and create previews
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Optional: basic validation (size < 10MB)
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };


  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke object URL to avoid memory leaks
    setImagePreviews(prev => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('usertoken') || localStorage.getItem('token');
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // API Calls
  const createDraft = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        setError('Please login to continue');
        return false;
      }

      const response = await axios.post(
        `${API_BASE_URL}/properties/create-draft`, 
        {
          category: formData.category,
          propertyType: formData.propertyType,
          listingType: formData.listingType
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setPropertyId(response.data.data.propertyId);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create draft');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBasicDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        title: formData.title,
        description: formData.description,
        bhk: parseInt(formData.bhk),
        bathrooms: parseInt(formData.bathrooms),
        balconies: parseInt(formData.balconies),
        price: {
          amount: parseFloat(formData.price),
          negotiable: formData.negotiable,
          maintenanceCharges: {
            amount: parseFloat(formData.maintenanceCharges) || 0,
            frequency: formData.maintenanceFrequency
          },
          securityDeposit: parseFloat(formData.securityDeposit) || 0
        },
        area: {
          carpet: parseFloat(formData.carpetArea),
          builtUp: parseFloat(formData.builtUpArea),
          unit: formData.areaUnit
        },
        floor: {
          current: parseInt(formData.currentFloor),
          total: parseInt(formData.totalFloors)
        },
        propertyAge: formData.propertyAge,
        availableFrom: formData.availableFrom
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/basic-details`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update basic details');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFeatures = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        furnishing: { type: formData.furnishingType },
        amenitiesList: formData.amenitiesList,
        propertyFeatures: {
          powerBackup: formData.powerBackup,
          waterSupply: formData.waterSupply,
          gatedSecurity: formData.gatedSecurity,
          liftAvailable: formData.liftAvailable
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/features`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update features');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        location: {
          address: formData.address,
          city: formData.city,
          locality: formData.locality,
          subLocality: formData.subLocality,
          landmark: formData.landmark,
          pincode: formData.pincode,
          state: formData.state,
          coordinates: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          }
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/location`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Create FormData
      const formDataToSend = new FormData();
      
      // FIXED: Append each image with the correct field name
      // Option 1: If backend expects 'photos' field (array)
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      // Option 2: If backend expects 'images' field (array) - uncomment if needed
      // formData.images.forEach(image => {
      //   formDataToSend.append('images', image);
      // });
      
      // Debug: Log FormData contents
      console.log('Uploading images:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/properties/${propertyId}/upload-photos`,
        formDataToSend,
        {
          headers: {
              Authorization: `Bearer ${token}`

          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        }
      );

      return response.data.success;
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to upload photos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        contactInfo: {
          name: formData.contactName,
          phone: formData.contactPhone,
          alternatePhone: formData.alternatePhone,
          email: formData.contactEmail,
          preferredCallTime: formData.preferredCallTime
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/properties/${propertyId}/contact-info`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update contact info');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitProperty = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE_URL}/properties/${propertyId}/submit`,
        {},
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        alert('Property submitted successfully! It will be reviewed within 24-48 hours.');
        navigate('/properties');
      }
      return response.data.success;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit property');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    let success = true;

    switch(currentStep) {
      case 1:
        success = await createDraft();
        break;
      case 2:
        success = await updateBasicDetails();
        break;
      case 3:
        success = await updateFeatures();
        break;
      case 4:
        success = await updateLocation();
        break;
      case 5:
        if (formData.images.length > 0) {
          success = await uploadPhotos();
        } else {
          // Skip if no images
          success = true;
        }
        break;
      case 6:
        success = await updateContactInfo();
        if (success) {
          await submitProperty();
          return;
        }
        break;
      default:
        break;
    }

    if (success && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Property Type</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              >
                <option value="">Select Category</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {formData.category && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  {propertyTypeOptions[formData.category]?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

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
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Details</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Spacious 2BHK Flat in Vijay Nagar"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your property..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none resize-none transition-colors"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  BHK *
                </label>
                <input
                  type="number"
                  name="bhk"
                  value={formData.bhk}
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
                  Balconies *
                </label>
                <input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter price"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="Enter security deposit"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maintenance Charges (₹)
                </label>
                <input
                  type="number"
                  name="maintenanceCharges"
                  value={formData.maintenanceCharges}
                  onChange={handleChange}
                  placeholder="Enter maintenance charges"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  name="maintenanceFrequency"
                  value={formData.maintenanceFrequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Carpet Area (sqft) *
                </label>
                <input
                  type="number"
                  name="carpetArea"
                  value={formData.carpetArea}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Built-up Area (sqft) *
                </label>
                <input
                  type="number"
                  name="builtUpArea"
                  value={formData.builtUpArea}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Floor *
                </label>
                <input
                  type="number"
                  name="currentFloor"
                  value={formData.currentFloor}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Floors *
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Age *
                </label>
                <select
                  name="propertyAge"
                  value={formData.propertyAge}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Select Age</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-5 years">1-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Available From *
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
                className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
              />
              <label className="text-sm font-medium text-gray-700">Price Negotiable</label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Features</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Furnishing Type *
              </label>
              <select
                name="furnishingType"
                value={formData.furnishingType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully-Furnished">Fully-Furnished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesOptions.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.amenitiesList.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                    />
                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Power Backup
                </label>
                <select
                  name="powerBackup"
                  value={formData.powerBackup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Partial">Partial</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Water Supply
                </label>
                <select
                  name="waterSupply"
                  value={formData.waterSupply}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                <input
                  type="checkbox"
                  name="gatedSecurity"
                  checked={formData.gatedSecurity}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                />
                <span className="text-sm font-medium text-gray-700">Gated Security</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#FF6B00] transition-colors">
                <input
                  type="checkbox"
                  name="liftAvailable"
                  checked={formData.liftAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00]"
                />
                <span className="text-sm font-medium text-gray-700">Lift Available</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location Details</h2>
            
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
                placeholder="Plot No, Street, Area"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Indore"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Madhya Pradesh"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Locality *
                </label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Vijay Nagar"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Locality
                </label>
                <input
                  type="text"
                  name="subLocality"
                  value={formData.subLocality}
                  onChange={handleChange}
                  placeholder="e.g., Scheme 54"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near C21 Mall"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="6-digit pincode"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 22.7532"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 75.8937"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Photos</h2>
            
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FF6B00] transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-lg text-gray-600 font-semibold">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
                  <p className="text-xs text-gray-400 mt-1">You can upload multiple images</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Uploaded Images ({imagePreviews.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline mr-2" size={18} />
                Full Name *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={18} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline mr-2" size={18} />
                Email Address *
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Call Time
              </label>
              <select
                name="preferredCallTime"
                value={formData.preferredCallTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6B00] focus:outline-none"
              >
                <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                <option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</option>
                <option value="Evening (5PM-9PM)">Evening (5PM-9PM)</option>
                <option value="Anytime">Anytime</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-8 px-4">
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
            <p className="text-gray-600 mt-1">Complete all steps to list your property</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${currentStep > step.number ? 'bg-green-500 text-white' : 
                      currentStep === step.number ? 'bg-[#FF6B00] text-white' : 
                      'bg-gray-200 text-gray-500'}
                    transition-all duration-300
                  `}>
                    {currentStep > step.number ? <CheckCircle size={20} /> : step.number}
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2 hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
                    transition-all duration-300
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Mobile step title */}
          <div className="md:hidden text-center mt-4">
            <p className="text-sm font-semibold text-gray-700">
              Step {currentStep}: {steps[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                Back
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-[#0b4f91] to-[#FF6B00] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : currentStep === 6 ? (
                'Submit Property'
              ) : (
                'Next'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListingForm;