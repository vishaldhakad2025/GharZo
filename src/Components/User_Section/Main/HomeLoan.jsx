import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaCalculator, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUser,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaUniversity,
  FaWhatsapp
} from 'react-icons/fa';

const HomeLoanCalculator = () => {
  const [selectedBank, setSelectedBank] = useState('');
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [tenure, setTenure] = useState(10);
  const [interestRate, setInterestRate] = useState(9);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [processingFees, setProcessingFees] = useState(25000);
  const [showInquiry, setShowInquiry] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    propertyValue: '',
    downPayment: ''
  });

  const banks = [
    { name: 'State Bank of India', rate: 8.5, imageUrl: 'https://i.pinimg.com/1200x/8a/c8/25/8ac825651cdd379fd25e9a8bea5f76bf.jpg' },
    { name: 'HDFC Bank', rate: 8.75, imageUrl: 'https://i.pinimg.com/1200x/3d/07/64/3d0764bf519e0ae62a43f818f832ca11.jpg' },
    { name: 'ICICI Bank', rate: 8.9, imageUrl: 'https://i.pinimg.com/736x/05/77/0b/05770b37ae535a178b27ab0c666f8f88.jpg' },
    { name: 'Axis Bank', rate: 9.0, imageUrl: 'https://i.pinimg.com/736x/76/aa/bd/76aabd7ec028d2927d5af281e82d9394.jpg' },
    { name: 'Punjab National Bank', rate: 8.65, imageUrl: 'https://i.pinimg.com/1200x/e6/93/92/e693927f0626a7823e87edc86e785d16.jpg' },
    { name: 'Bank of Baroda', rate: 8.7, imageUrl: 'https://i.pinimg.com/1200x/c5/5f/ca/c55fca4d3d4d8087d1dde731c7722810.jpg' },
    { name: 'Kotak Mahindra Bank', rate: 8.95, imageUrl: 'https://i.pinimg.com/736x/55/d4/c5/55d4c540f262df3e54aaa94f94893336.jpg' },
    { name: 'IDFC First Bank', rate: 9.1, imageUrl: 'https://i.pinimg.com/736x/5a/78/24/5a78247d843aed1eaaf1085572ac81c4.jpg' }
  ];

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, tenure, interestRate]);

  const calculateEMI = () => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    if (r === 0) {
      const monthlyEMI = P / n;
      setEmi(Math.round(monthlyEMI));
      setTotalInterest(0);
    } else {
      const monthlyEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalAmount = monthlyEMI * n;
      const interest = totalAmount - P;
      
      setEmi(Math.round(monthlyEMI));
      setTotalInterest(Math.round(interest));
    }
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank.name);
    setInterestRate(bank.rate);
  };

  const handleInquiryChange = (e) => {
    setInquiryData({
      ...inquiryData,
      [e.target.name]: e.target.value
    });
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowInquiry(false);
      setInquiryData({
        name: '',
        email: '',
        phone: '',
        address: '',
        propertyValue: '',
        downPayment: ''
      });
    }, 3000);
  };

  const totalAmount = loanAmount + totalInterest + processingFees;
  const principalPercentage = (loanAmount / totalAmount) * 100;
  const interestPercentage = (totalInterest / totalAmount) * 100;
  const feesPercentage = (processingFees / totalAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 relative">
      {/* Floating Buttons */}
<div className="fixed left-4 bottom-6 flex flex-col gap-3 z-40">
        <motion.a
          href="https://wa.me/1234567890" // Replace with actual WhatsApp link
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          className="bg-green-500 text-white p-3 rounded-full shadow-md hover:bg-green-600 transition-all animate-glow"
        >
          <FaWhatsapp className="text-2xl" />
        </motion.a>
        <motion.a
          href="tel:+911234567890" // Replace with actual phone number
          whileHover={{ scale: 1.1 }}
          className="bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition-all animate-glow"
        >
          <FaPhoneAlt className="text-2xl" />
        </motion.a>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                <span className="text-blue-100">G</span>
                <span className="text-orange-400">harZo</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/30"></div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FaHome className="text-orange-400" />
                Home Loan EMI Calculator
              </h1>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Side - Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Bank Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-200">
              <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUniversity className="text-orange-500" />
                Select Bank (Optional)
              </label>
              
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                {banks.map((bank, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBankSelect(bank)}
                    className={`p-4 rounded-xl border transition-all shadow-sm hover:shadow-md ${
                      selectedBank === bank.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img 
                      src={bank.imageUrl} 
                      alt={bank.name} 
                      className="w-12 h-12 mx-auto mb-2 object-contain rounded-full"
                    />
                    <div className="text-xs font-semibold text-gray-700 line-clamp-2 text-center">{bank.name}</div>
                    <div className="text-xs text-orange-600 font-bold mt-1 text-center">{bank.rate}%</div>
                  </motion.button>
                ))}
              </div>

              {selectedBank && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 text-center"
                >
                  <strong>Selected:</strong> {selectedBank} @ {interestRate}% p.a.
                </motion.div>
              )}
            </div>

            {/* Calculator Inputs */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaCalculator className="text-blue-600" />
                Calculate Your EMI
              </h2>

              {/* Loan Amount */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Loan Amount (₹)
                  </label>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-lg font-bold text-blue-900">
                      ₹{loanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="50000000"
                  step="100000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((loanAmount - 100000) / (50000000 - 100000)) * 100}%, #dbeafe ${((loanAmount - 100000) / (50000000 - 100000)) * 100}%, #dbeafe 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹1L</span>
                  <span>₹5Cr</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Tenure (Years)
                  </label>
                  <div className="bg-orange-50 px-4 py-2 rounded-lg">
                    <span className="text-lg font-bold text-orange-900">
                      {tenure} Years
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((tenure - 2) / (30 - 2)) * 100}%, #fed7aa ${((tenure - 2) / (30 - 2)) * 100}%, #fed7aa 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>2 Years</span>
                  <span>30 Years</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Rate of Interest (%)
                  </label>
                  <div className="bg-purple-50 px-4 py-2 rounded-lg">
                    <span className="text-lg font-bold text-purple-900">
                      {interestRate}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="7"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((interestRate - 7) / (15 - 7)) * 100}%, #e9d5ff ${((interestRate - 7) / (15 - 7)) * 100}%, #e9d5ff 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>7%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Apply Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInquiry(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaHome />
                Apply for Home Loan
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side - Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* EMI Display */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
              <div className="text-center">
                <p className="text-sm font-semibold mb-2 text-blue-200">Your EMI Per Month</p>
                <motion.div
                  key={emi}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl font-black mb-4"
                >
                  ₹{emi.toLocaleString('en-IN')}
                </motion.div>
                <div className="h-px bg-white/20 my-4"></div>
                <div className="text-sm text-blue-100">
                  Total Payment: ₹{(emi * tenure * 12).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Payment Breakdown</h3>
              
              <div className="flex justify-center mb-6">
                <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Principal */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray={`${principalPercentage * 5.03} 503`}
                  />
                  {/* Interest */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="40"
                    strokeDasharray={`${interestPercentage * 5.03} 503`}
                    strokeDashoffset={-principalPercentage * 5.03}
                  />
                  {/* Processing Fees */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="40"
                    strokeDasharray={`${feesPercentage * 5.03} 503`}
                    strokeDashoffset={-(principalPercentage + interestPercentage) * 5.03}
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-gray-700">Loan Amount</span>
                  </div>
                  <span className="font-bold text-blue-900">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="font-semibold text-gray-700">Total Interest</span>
                  </div>
                  <span className="font-bold text-purple-900">₹{totalInterest.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="font-semibold text-gray-700">Processing Fees</span>
                  </div>
                  <span className="font-bold text-orange-900">₹{processingFees.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-xl p-6 border border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Us?</h3>
              <div className="space-y-3">
                {[
                  'Lowest Interest Rates',
                  'Quick Loan Approval',
                  'Flexible Repayment Options',
                  'Minimal Documentation'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FaCheckCircle className="text-orange-500 text-lg flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-t-2xl z-10 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Home Loan Inquiry</h2>
                  <button
                    onClick={() => setShowInquiry(false)}
                    className="text-2xl hover:bg-white/20 w-8 h-8 rounded-full transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {!isSubmitted ? (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={inquiryData.name}
                            onChange={handleInquiryChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={inquiryData.phone}
                            onChange={handleInquiryChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={inquiryData.email}
                          onChange={handleInquiryChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Property Address
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-4 text-gray-400" />
                        <textarea
                          name="address"
                          value={inquiryData.address}
                          onChange={handleInquiryChange}
                          rows="3"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="Enter property address"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Property Value (₹)
                        </label>
                        <input
                          type="number"
                          name="propertyValue"
                          value={inquiryData.propertyValue}
                          onChange={handleInquiryChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="5000000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Down Payment (₹)
                        </label>
                        <input
                          type="number"
                          name="downPayment"
                          value={inquiryData.downPayment}
                          onChange={handleInquiryChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="1000000"
                        />
                      </div>
                    </div>

                    {/* Loan Details Summary */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
                      <h3 className="font-bold text-blue-900 mb-3">Selected Loan Details</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Loan Amount:</span>
                          <div className="font-bold text-gray-900">₹{loanAmount.toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Monthly EMI:</span>
                          <div className="font-bold text-gray-900">₹{emi.toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tenure:</span>
                          <div className="font-bold text-gray-900">{tenure} Years</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest Rate:</span>
                          <div className="font-bold text-gray-900">{interestRate}%</div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4"
                    >
                      Submit Inquiry
                    </motion.button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h3>
                    <p className="text-gray-600">Our team will contact you within 24 hours.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); }
          50% { box-shadow: 0 0 20px rgba(0, 0, 0, 0.4); }
          100% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomeLoanCalculator;