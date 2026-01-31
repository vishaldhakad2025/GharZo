import React from "react";
import { motion } from "framer-motion";
import { 
  FaHome, 
  FaUserFriends, 
  FaBuilding, 
  FaHandshake,
  FaCheckCircle,
  FaAward,
  FaGlobe,
  FaHeart
} from "react-icons/fa";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const AboutUs = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-20 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "5%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "10%", right: "5%" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="inline-block text-orange-500 font-semibold text-sm uppercase tracking-wider mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover GharZo
          </motion.span>
          
          <h1 className="text-xl sm:text-6xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-[#1E3A5F] via-[#2a4f7a] to-orange-600 bg-clip-text text-transparent drop-shadow-2xl">
            About GharZo
          </h1>

          <motion.p 
            className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            GharZo is your one-stop destination for renting, buying, and booking
            spaces — from cozy PGs and hostels to premium properties. We blend
            technology with real estate to make your property search smart,
            simple, and seamless.
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            className="w-32 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-8 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>

        {/* Mission + Vision - Enhanced Cards */}
        <div className="grid md:grid-cols-2 gap-10 mb-20">
          {[
            {
              title: "Our Mission",
              text: "To simplify the property experience by connecting users with verified listings and agents. Whether you're a student, family, or event organizer, GharZo is committed to delivering trust, transparency, and convenience.",
              icon: <FaHeart size={30} />,
              gradient: "from-orange-500 to-orange-600",
              bgGradient: "from-orange-50 to-orange-100/50",
            },
            
            {
              title: "Our Vision",
              text: "To become India's most reliable platform for discovering and booking rental and commercial properties by blending innovation, integrity, and intelligent service.",
              icon: <FaGlobe size={30} />,
              gradient: "from-blue-600 to-blue-700",
              bgGradient: "from-blue-50 to-blue-100/50",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`relative bg-white rounded-3xl shadow-2xl border-t-4 ${
                i === 0 ? "border-orange-500" : "border-blue-600"
              } hover:shadow-orange-200 transition-all duration-500 overflow-hidden group`}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 p-10">
                {/* Icon */}
                <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg mb-6`}>
                  {item.icon}
                </div>
                
                <h3 className="text-3xl font-bold text-[#1E3A5F] mb-5">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {item.text}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-transparent to-orange-100/20 rounded-bl-full" />
            </motion.div>
          ))}
        </div>

        {/* What We Offer */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-4 inline-block">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7a] bg-clip-text text-transparent mb-4">
            What We Offer
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tailored property solutions for every stage of life and every need.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full" />
        </motion.div>

        {/* Service Cards with Icons */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-20 ">
          {[
            { 
              title: "PGs & Hostels", 
              icon: <FaHome size={36} />, 
              color: "from-blue-500 to-blue-600",
              description: "Comfortable living spaces"
            },
            { 
              title: "Flats & Apartments", 
              icon: <FaBuilding size={36} />, 
              color: "from-green-500 to-green-600",
              description: "Modern residential units"
            },
            { 
              title: "Trusted Agents", 
              icon: <FaHandshake size={36} />, 
              color: "from-orange-500 to-orange-600",
              description: "Professional support"
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              whileHover={{ y: -12, scale: 1.05 }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10 text-center">
                {/* Icon Container */}
                <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {item.icon}
                </div>
                
                <h4 className="text-xl font-bold text-[#1E3A5F] mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section - Enhanced Design */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-4 inline-block">
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl pb-2 font-bold bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7a] bg-clip-text text-transparent mb-4">
            Numbers That Speak
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { 
              label: "Happy Customers", 
              value: "25,000+", 
              icon: <FaHeart />,
              color: "from-pink-500 to-red-500"
            },
            { 
              label: "Verified Listings", 
              value: "8,000+", 
              icon: <FaCheckCircle />,
              color: "from-green-500 to-emerald-600"
            },
            { 
              label: "Cities Covered", 
              value: "50+", 
              icon: <FaGlobe />,
              color: "from-blue-500 to-cyan-600"
            },
            { 
              label: "Agents Onboard", 
              value: "500+", 
              icon: <FaAward />,
              color: "from-orange-500 to-amber-600"
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border-t-4 border-orange-500"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className={`inline-flex text-3xl mb-4 text-transparent bg-gradient-to-br ${stat.color} bg-clip-text`}>
                  {stat.icon}
                </div>
                
                {/* Value */}
                <motion.h3 
                  className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#1E3A5F] to-orange-600 bg-clip-text text-transparent"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5, type: "spring" }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.h3>
                
                {/* Label */}
                <p className="text-gray-600 font-medium text-lg">
                  {stat.label}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-orange-100/30 rounded-tl-full" />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-20 text-center bg-gradient-to-r from-[#1E3A5F] via-[#2a4f7a] to-orange-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Find Your Perfect Space?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their ideal property with GharZo.
            </p>
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#1E3A5F] px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-300"
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;