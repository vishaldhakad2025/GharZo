// src/pages/ServicesPage.jsx
import React, { useState } from 'react';
import { PlusCircle, X, Building, Sofa, Wrench, Zap, Paintbrush, Home, ThermometerSun, Sparkles, Shield, Bug, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const servicesData = [
  {
    id: 1,
    category: "Construction",
    title: "Construction & Renovation",
    provider: "Vishal Builders & Co.",
    description: "Complete home construction, renovation, painting & waterproofing",
    startingPrice: "₹50,000+",
    location: "Vijay Nagar, Indore",
    rating: 4.8,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
  },
  {
    id: 2,
    category: "Furniture",
    title: "Custom Furniture",
    provider: "Elite WoodCraft",
    description: "Modular kitchen, wardrobes, sofa sets & custom designs",
    startingPrice: "₹15,000+",
    location: "Palasia, Indore",
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  },
  {
    id: 3,
    category: "Plumbing",
    title: "Plumbing Services",
    provider: "QuickFix Plumbing",
    description: "24×7 emergency plumbing & bathroom fittings",
    startingPrice: "₹500+",
    location: "AB Road, Indore",
    rating: 4.6,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800",
  },
  {
    id: 4,
    category: "Electrical",
    title: "Electrical Work",
    provider: "SafeWire Solutions",
    description: "Complete wiring, inverter & LED installation",
    startingPrice: "₹800+",
    location: "Scheme 54, Indore",
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1581092160560-2f3e3e8d2b3c?w=800",
  },
  {
    id: 5,
    category: "Painting",
    title: "Home Painting",
    provider: "Color Masters",
    description: "Interior, exterior & texture painting",
    startingPrice: "₹2,000+",
    location: "Nipania, Indore",
    rating: 4.8,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1581092162387-7e9d8c2b3c4d?w=800",
  },
  {
    id: 6,
    category: "Interior",
    title: "Interior Designing",
    provider: "DreamSpace Interiors",
    description: "Complete home & office interior design",
    startingPrice: "₹25,000+",
    location: "Vijay Nagar, Indore",
    rating: 4.9,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1618221195710-dd2dabb60b29?w=800",
  },
  {
    id: 7,
    category: "AC",
    title: "AC Installation & Service",
    provider: "CoolTech AC Experts",
    description: "Split/Window AC installation & repair",
    startingPrice: "₹1,200+",
    location: "MR-10, Indore",
    rating: 4.5,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1581092160560-2f3e3e8d2b3c?w=800",
  },
  {
    id: 8,
    category: "Cleaning",
    title: "Home Cleaning Services",
    provider: "Sparkle Cleaners",
    description: "Deep cleaning & post-construction cleaning",
    startingPrice: "₹999+",
    location: "Rau, Indore",
    rating: 4.6,
    reviews: 231,
    image: "https://images.unsplash.com/photo-1581578731543-6e8c6d10f22f?w=800",
  },
  {
    id: 9,
    category: "PestControl",
    title: "Pest Control Services",
    provider: "PestGuard Solutions",
    description: "Cockroach, termite & rat control",
    startingPrice: "₹1,500+",
    location: "Dewas Naka, Indore",
    rating: 4.7,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1581092162387-7e9d8c2b3c4d?w=800",
  },
  {
    id: 10,
    category: "Security",
    title: "Home Security & CCTV",
    provider: "SecureHome Systems",
    description: "CCTV, video door phone & alarm systems",
    startingPrice: "₹8,000+",
    location: "Rau, Indore",
    rating: 4.8,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1558002038-105aeadf8a6c?w=800",
  },
];

const ServiceCard = ({ service }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
    <div className="relative h-48 overflow-hidden">
      <img
        src={service.image}
        alt={service.title}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
        ★ {service.rating}
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {service.title}
      </h3>
      <p className="text-gray-600 font-medium mb-3">{service.provider}</p>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {service.description}
      </p>

      <div className="flex justify-between items-center text-sm mb-5">
        <span className="font-semibold text-green-600">{service.startingPrice}</span>
        <span className="text-gray-500">{service.location}</span>
      </div>

      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg">
        Contact Provider
      </button>
    </div>
  </div>
);

const AddServiceForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    serviceName: '',
    description: '',
    startingPrice: '',
    location: '',
    contactNumber: '',
    whatsapp: '',
  });

  const categories = [
    "Construction", "Furniture", "Plumbing", "Electrical", "Painting",
    "Interior Designing", "AC Service", "Cleaning", "Pest Control", "Security & CCTV"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Service submitted successfully! (This is demo)");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">Add Your Service</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
              placeholder="e.g., Modular Kitchen Specialist"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your service in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              required
              placeholder="e.g., 15000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Vijay Nagar, Indore"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="Same as contact number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-300"
            >
              Submit Your Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServicesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className=" bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                Home Services in Indore
              </h1>
              <p className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
                Professional & trusted service providers for all your home needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {servicesData.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      
      {/* Add Service Modal */}
      <ServiceModal isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};

// Rename AddServiceForm to ServiceModal for clarity
const ServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">Add Your Service</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <AddServiceFormContent onClose={onClose} />
      </div>
    </div>
  );
};

const AddServiceFormContent = ({ onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    serviceName: '',
    description: '',
    startingPrice: '',
    location: '',
    contactNumber: '',
    whatsapp: '',
  });

  const categories = [
    "Construction", "Furniture", "Plumbing", "Electrical", "Painting",
    "Interior Designing", "AC Service", "Cleaning", "Pest Control", "Security & CCTV"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Service submitted successfully! (This is demo)");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Service Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="serviceName"
          value={formData.serviceName}
          onChange={handleChange}
          required
          placeholder="e.g., Modular Kitchen Specialist"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe your service in detail..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Price & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="startingPrice"
            value={formData.startingPrice}
            onChange={handleChange}
            required
            placeholder="e.g., 15000"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Area <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g., Vijay Nagar, Indore"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            placeholder="10-digit mobile number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="Same as contact"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-300"
        >
          Submit Service Listing
        </button>
      </div>
    </form>
  );
};

export default ServicesPage;