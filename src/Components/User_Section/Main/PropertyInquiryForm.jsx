import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, IndianRupee } from 'lucide-react';

export default function PropertyInquiryForm() {
  const [formData, setFormData] = useState({
    inquiryType: '',
    propertyType: '',
    name: '',
    mobile: '',
    email: '',
    location: '',
    district: '',
    pinCode: '',
    city: '',
    maxPrice: '',
    minSize: '',
    message: '',
    agree: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.agree) {
      alert('Please agree to the terms to submit');
      return;
    }
    
    const requiredFields = ['inquiryType', 'propertyType', 'name', 'mobile', 'email', 'location', 'district', 'pinCode', 'city', 'maxPrice', 'minSize'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Please fill all required fields');
      return;
    }
    
    console.log('Form submitted:', formData);
    alert('Inquiry submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2344] via-[#0b4f91] to-[#1a3c6e] py-8 px-4 md:px-6 lg:px-8">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE - Clean dark background, NO image */}
          <div className="text-white space-y-6 lg:space-y-8 px-4 lg:px-0">
            <div className="flex items-center gap-4">
              <Building2 className="w-12 h-12 md:w-16 md:h-16 text-orange-400" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Find Your <span className="text-orange-400">Dream Property</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Discover premium residential and commercial properties in Indore and nearby areas. 
              Let us help you find the perfect home or investment opportunity.
            </p>

            <div className="space-y-4 text-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-orange-400" />
                </div>
                <span>Quick & Free Consultation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <span>Best Locations in Indore</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-orange-400" />
                </div>
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form with background image + dark overlay */}
          <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            {/* Background Image + Overlay only for form section */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD50ig-1yJkfMC66gTEkQC3WUbtnjK5CYqDQ&s')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c2344]/85 via-[#0b4f91]/80 to-orange-900/65 mix-blend-multiply"></div>
            </div>

            {/* Form Content - Glass effect */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#0c2344]/90 to-[#0b4f91]/90 p-6 text-white">
                <h2 className="text-4xl font-bold flex items-center gap-3">
                  <Building2 className="w-7 h-7" />
                   Property Inquiry
                </h2>
                <p className="text-blue-100 mt-1 text-8">
                  Fill details & we'll get back to you within 24 hours
                </p>
              </div>

              {/* Form Fields */}
              <div className="p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Inquiry Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                    >
                      <option value="">Select Type</option>
                      <option value="rent" className='text-black'>Rent</option>
                      <option value="buy" className='text-black'>Buy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Property Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                    >
                      <option value="">Select Property</option>
                      <option value="flat"  className='text-black'>Flat/Apartment</option>
                      <option value="house" className='text-black'>Independent House</option>
                      <option value="commercial" className='text-black'>Commercial</option>
                      <option value="pg" className='text-black'>PG/Hostel</option>
                    </select>
                  </div>
                </div>

                {/* Rest of the form fields with white text & glass style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">Name <span className="text-red-400">*</span></label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                      placeholder="Full Name" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">Mobile <span className="text-red-400">*</span></label>
                    <input 
                      type="tel" 
                      name="mobile" 
                      value={formData.mobile} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder:text-gray-300"
                      placeholder="10-digit number" 
                      maxLength={10} 
                    />
                  </div>
                </div>

                {/* ... remaining fields with same glass + white text style ... */}

                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 resize-none placeholder:text-gray-300"
                    placeholder="Any specific requirements..."
                  />
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                  <input
                    type="checkbox"
                    name="agree"
                    id="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-orange-600 border-white/40 rounded focus:ring-orange-500 bg-white/10"
                  />
                  <label htmlFor="agree" className="text-sm text-gray-200">
                    I agree to the terms & conditions and allow contact regarding this inquiry
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-lg font-medium text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}