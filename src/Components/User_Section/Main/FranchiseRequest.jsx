import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, DollarSign, Headphones, Users, Phone, MessageCircle } from 'lucide-react';

const FranchiseRequest = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: '',
    investment: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const investmentRanges = [
    '₹5–10 Lakhs',
    '₹10–25 Lakhs',
    '₹25–50 Lakhs',
    '₹50+ Lakhs'
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Proven Business Model',
      description: 'Join a tested framework with consistent growth metrics'
    },
    {
      icon: DollarSign,
      title: 'Low Investment, High Returns',
      description: 'Start with minimal capital and maximize your ROI'
    },
    {
      icon: Headphones,
      title: 'Complete Marketing & Tech Support',
      description: 'Get full operational and technological assistance'
    },
    {
      icon: Users,
      title: 'Fast-Growing Real Estate Network',
      description: 'Be part of an expanding nationwide presence'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.investment) newErrors.investment = 'Please select investment range';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden" style={{ height: '65vh' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://i.pinimg.com/1200x/fe/1a/b2/fe1ab2ef033b07fae81753b25abad94c.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-orange-900/70"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Become a Franchise Partner
            </h1>
            <p className="text-lg md:text-2xl mb-6 text-blue-50 max-w-3xl mx-auto">
              Start your own real estate business with a trusted and growing brand
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full"
            >
              <p className="text-sm md:text-base font-semibold">
                ⚡ Limited franchise opportunities available
              </p>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Why Franchise Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Franchise With Us?
            </h2>
            <p className="text-gray-600 text-lg">
              Join hundreds of successful partners across India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-blue-500 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                    Request Franchise Information
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and our team will reach out to you
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:outline-none transition-colors text-lg`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.mobile ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:outline-none transition-colors text-lg`}
                      placeholder="10-digit mobile number"
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-lg"
                      placeholder="your.email@example.com (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.city ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:outline-none transition-colors text-lg`}
                      placeholder="Your city"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Investment Range <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="investment"
                      value={formData.investment}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.investment ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:outline-none transition-colors text-lg bg-white`}
                    >
                      <option value="">Select investment range</option>
                      {investmentRanges.map((range, idx) => (
                        <option key={idx} value={range}>{range}</option>
                      ))}
                    </select>
                    {errors.investment && (
                      <p className="text-red-500 text-sm mt-1">{errors.investment}</p>
                    )}
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Submit Franchise Request
                  </motion.button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    🔒 We respect your privacy. No spam.
                  </p>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-block mb-6"
                >
                  <CheckCircle className="w-24 h-24 text-green-500" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Thank you for your interest!
                </h3>
                <p className="text-xl text-gray-600 mb-8">
                  Our team will contact you within 24 hours.
                </p>
                <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-gray-700 font-semibold mb-2">Your Details:</p>
                  <p className="text-gray-600">Name: {formData.fullName}</p>
                  <p className="text-gray-600">Mobile: {formData.mobile}</p>
                  <p className="text-gray-600">City: {formData.city}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <motion.a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-colors z-50"
      >
        <MessageCircle className="w-7 h-7" />
      </motion.a>

      <motion.a
        href="tel:+919876543210"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-600 transition-colors z-50"
      >
        <Phone className="w-7 h-7" />
      </motion.a>
    </div>
  );
};

export default FranchiseRequest;