import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserTie, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaBuilding,
  FaCheckCircle,
  FaHandshake,
  FaTrophy,
  FaChartLine,
  FaShieldAlt,
  FaLightbulb,
  FaUsers,
  FaDollarSign,
  FaClock,
  FaHeadset,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import teamWork from '../../../assets/Images/teamWork.png';

const ChannelPartnerPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const benefits = [
    { icon: FaHandshake, title: "Exclusive Network", desc: "Join our elite partners" },
    { icon: FaTrophy, title: "High Returns", desc: "Lucrative commission structure" },
    { icon: FaChartLine, title: "Growth Support", desc: "Marketing & training support" }
  ];

  const advantages = [
    {
      icon: FaShieldAlt,
      title: "Risk Sharing",
      desc: "Operating as an individual in Real Estate can be risky but sharing the task with a team can make it more manageable. Associates can pool their resources and split the responsibilities, reducing the risk for each individual"
    },
    {
      icon: FaLightbulb,
      title: "Knowledge Sharing",
      desc: "Share expertise and insights with team members"
    },
    {
      icon: FaUsers,
      title: "Exclusive Working on the Project",
      desc: "Dedicated focus on premium projects"
    },
    {
      icon: FaDollarSign,
      title: "Sharing of Media Buying Expertise",
      desc: "Access to advanced marketing strategies"
    },
    {
      icon: FaClock,
      title: "Prompt Payments",
      desc: "Timely commission and reward distribution"
    },
    {
      icon: FaHeadset,
      title: "Unparalleled Service to Customers",
      desc: "Best-in-class customer support and service"
    }
  ];

  const faqs = [
    {
      question: "What are the benefits of becoming a Gharzo channel partner?",
      answer: "As a channel partner, you get access to exclusive projects, competitive commission structures, marketing support, training programs, and dedicated relationship managers."
    },
    {
      question: "What are the eligibility criteria for becoming a Gharzo channel partner?",
      answer: "We welcome real estate professionals, brokers, agents, and firms with a proven track record in property sales and customer service."
    },
    {
      question: "How do I become a Gharzo channel partner?",
      answer: "Click here and fill the form with valid contact details. Our team will get in touch with you to verify your business information. Once all the application formalities are completed you will become an eligible Gharzo channel partner."
    },
    {
      question: "What is the commission structure for Gharzo channel partners?",
      answer: "Our commission structure is competitive and transparent, varying based on project type and sales value. Details will be shared during the onboarding process."
    },
    {
      question: "What is the process for closing a sale as a Gharzo channel partner?",
      answer: "Our team provides end-to-end support from lead generation to deal closure, ensuring smooth transactions and timely documentation."
    }
  ];

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom right, rgba(10, 20, 20, 0.5 ), rgba(30, 64, 175, 0.9), rgba(194, 65, 12, 0.85)), url('https://i.pinimg.com/1200x/1d/71/ae/1d71ae938ebee5391359f2143e3e8b8a.jpg')`
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full p-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Side - Content */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-white space-y-4 sm:space-y-6"
              >
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
                    <span className="text-orange-400">Join the Elite League</span>
                    <br />
                    <span className="text-white">of Channel Partners</span>
                  </h1>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight"
                  style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif" }}
                >
                  <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                    Let Us Unlock The<br />Potential of<br />Working Together
                  </span>
                </motion.h2>

                {/* Description */}
                {/* <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-xl"
                >
                  As the real estate industry undergoes a transformative phase, we invite visionaries like you to become part of our exclusive network of channel partners. Unleash your potential, unlock lucrative prospects, and embark on a journey towards limitless success.
                </motion.p> */}

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm sm:text-base font-semibold text-orange-300"
                >
                  Take the first step now and fill the form to register as a channel partner.
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4"
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-all"
                    >
                      <benefit.icon className="text-2xl text-orange-400 mb-1.5" />
                      <h3 className="font-bold text-xs mb-0.5">{benefit.title}</h3>
                      <p className="text-[10px] text-gray-300">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Side - Registration Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full"
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border-4 border-orange-500/30">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-5 text-center">
                    Register to become Channel Partner
                  </h2>

                  <div className="space-y-4">
                    {/* First Name & Last Name */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          First name<span className="text-orange-500">*</span>
                        </label>
                        <div className="relative">
                          <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900/50 text-sm" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            placeholder="John"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Last name
                        </label>
                        <div className="relative">
                          <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900/50 text-sm" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Phone number<span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900/50 text-sm" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email<span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900/50 text-sm" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Your firm/company name
                      </label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900/50 text-sm" />
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                          placeholder="Your Company Pvt. Ltd."
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                    >
                      {isSubmitted ? (
                        <>
                          <FaCheckCircle className="text-lg" />
                          <span>Submitted Successfully!</span>
                        </>
                      ) : (
                        <>
                          <span>Submit</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Success Message */}
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg text-center"
                    >
                      <p className="text-green-700 font-semibold text-sm">
                        Thank you! We'll contact you soon.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src= {teamWork}
                alt="Team Work" 
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </motion.div>

            {/* Right - Advantages List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Advantages of Working Together
              </h2>

              <div className="space-y-3">
                {advantages.map((advantage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shrink-0">
                        <advantage.icon className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{advantage.title}</h3>
                        <p className="text-gray-600 text-xs leading-relaxed">{advantage.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Partner With Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Left - Stats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="inline-block mb-6">
                <div className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                  25
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                  YEARS OF BUILDING<br />CREDIBILITY
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-blue-900">30+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-blue-900">11000+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Unit Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-blue-900">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">Team Members</div>
                </div>
              </div>
            </motion.div>

            {/* Right - Description */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Gharzo and Associates, your trusted real estate consultant in Indore. Central India's real estate market is undergoing a transformative phase, driven by increasing demand for housing, office spaces, and retail properties. With urbanization, rising incomes, and favorable government policies fueling this growth, it's the perfect time to join forces as business partners.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                By partnering with us, you gain access to a vast portfolio of prestigious projects, personalized support, and cutting-edge resources. Don't miss your chance to shape the future of real estate while reaping remarkable rewards.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <FaChevronUp className="text-orange-500 shrink-0" />
                  ) : (
                    <FaChevronDown className="text-gray-400 shrink-0" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-gray-600 text-xs sm:text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ChannelPartnerPage;