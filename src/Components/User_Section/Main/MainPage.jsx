import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import CardCarousel from "../Card_Carousel/CardCarousel";
import PGHostelSection from "./PGHostelSection";
import RentalPropety from "./RentalPropety";
import {
  FaQuoteLeft,
  FaPhoneAlt,
  FaEnvelope,
  FaLinkedin,
  FaHome,
  FaBed,
  FaRulerCombined,
  FaUser,
  FaRupeeSign,
  FaCheckCircle,
  FaTags,
  FaHotel,
  FaGlassCheers,
  FaUserFriends,
  FaSchool,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "./RentalSlider.css";
import { useNavigate, useLocation } from "react-router-dom";
import "./Main.css";
import pg_hostelData from "./pg-hostel";
import home from "../../../assets/Images/home.jpg";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchFilter from "./SearchFilter";
import ExploreCities from "./ExploreCities";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import PropertyInquiryForm from "./PropertyInquiryForm.jsx";
import PlotsHome from "./PlotsHome.jsx";
import DownloadAppSection from "./DownloadAppSection.jsx";
import HeroSection from "./HeroSection.jsx";

function MainPage() { 
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const BASE_URL = "https://api.gharzoreality.com/";

  // 🎬 Hero Background Images Array - Cinematic & Luxury Real Estate
  const heroImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=80",
  ];

  // Mock data for fallback
  const mockProperties = [
    {
      id: 1,
      name: "Greenview PG",
      title: "Modern 2BHK Apartment",
      location: "Koramangala, Bangalore",
      rent: 9500,
      area: 450,
      type: "PG",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      description: "Fully furnished PG with Wi-Fi, meals, and daily cleaning.",
    },
    {
      id: 2,
      name: "Urban Nest Flats",
      title: "Luxury Studio Apartment",
      location: "Andheri West, Mumbai",
      rent: 23000,
      area: 850,
      type: "1BHK Apartment",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
      description: "1BHK apartment with modular kitchen and security services.",
    },
    {
      id: 3,
      name: "Cozy Hostel",
      title: "Family 3BHK Flat",
      location: "Sector 62, Noida",
      rent: 7000,
      area: 300,
      type: "Hostel",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&auto=format&fit=crop&q=60",
      description:
        "Affordable hostel accommodation for students and professionals.",
    },
    {
      id: 4,
      name: "Lake View Rooms",
      location: "Salt Lake, Kolkata",
      title: "Cozy 1BHK in City Center",
      rent: 12000,
      area: 600,
      type: "Room",
      image:
        "https://media.istockphoto.com/id/1438437647/photo/christmas-celebration-at-luxury-lake-house.webp?a=1&b=1&s=612x612&w=0&k=20&c=vBeyQjLc4DwX9qRa3SqtfdnxjH2Oj47buIRVGn3Xn38=",
      description:
        "Spacious room near lake with natural light and attached washroom.",
    },
    {
      id: 5,
      name: "Studio Stay",
      location: "Gachibowli, Hyderabad",
      title: "PG for Girls - AC Rooms",
      rent: 18000,
      area: 550,
      type: "Studio Apartment",
      image:
        "https://images.unsplash.com/photo-1610224353475-f589ea4993f6?w=600&auto=format&fit=crop&q=60",
      description:
        "Modern studio apartment with fully equipped kitchen and AC.",
    },
    {
      id: 6,
      name: "Girls PG Heaven",
      title: "Modern 2BHK Apartment",
      location: "Viman Nagar, Pune",
      rent: 8500,
      area: 400,
      type: "PG",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
      description: "Safe and hygienic girls PG with food and laundry services.",
    },
    {
      id: 7,
      name: "Greenview PG",
      title: "Modern 2BHK Apartment",
      location: "Koramangala, Bangalore",
      rent: 9500,
      area: 450,
      type: "PG",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      description: "Fully furnished PG with Wi-Fi, meals, and daily cleaning.",
    },
    {
      id: 8,
      name: "Urban Nest Flats",
      title: "Luxury Studio Apartment",
      location: "Andheri West, Mumbai",
      rent: 23000,
      area: 850,
      type: "1BHK Apartment",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
      description: "1BHK apartment with modular kitchen and security services.",
    },
  ];

  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (err) {
        console.error("Error parsing authData:", err);
        return null;
      }
    }
    return null;
  };

  const getToken = () => {
    const authData = getAuthData();
    return authData ? authData.token : null;
  };

  const fetchProperties = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let response = await fetch(`${BASE_URL}api/public/all-properties`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      if (!response.ok) {
        console.warn(
          "Primary properties API failed, trying property-districts..."
        );
        response = await fetch(PROPERTY_DISTRICTS_API, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();
      setProperties(data?.data || data || mockProperties);
    } catch (error) {
      console.error("Error fetching properties:", error.message);
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Auto-slide effect for hero background images
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, heroImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => prev + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Mouse movement for interactivity
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 40;
    const y = (e.clientY / innerHeight - 0.5) * 40;
    setMousePos({ x, y });
  };

  // ─── Keyboard Arrow Keys Support ───────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) =>
          prev === 0 ? heroImages.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) =>
          prev === heroImages.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [heroImages.length]);

  // ─── Touch Swipe Support (Mobile) ──────────────────────────────
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    };

    const handleGesture = () => {
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) { // minimum swipe distance
        if (diff > 0) {
          // Swipe Left → Next image
          setCurrentImageIndex((prev) =>
            prev === heroImages.length - 1 ? 0 : prev + 1
          );
        } else {
          // Swipe Right → Previous image
          setCurrentImageIndex((prev) =>
            prev === 0 ? heroImages.length - 1 : prev - 1
          );
        }
      }
    };

    const hero = document.querySelector(".hero-section");

    if (hero) {
      hero.addEventListener("touchstart", handleTouchStart, { passive: true });
      hero.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (hero) {
        hero.removeEventListener("touchstart", handleTouchStart);
        hero.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [heroImages.length]);

  const testimonials = [
    {
      id: 1,
      name: "Ravi Kumar",
      role: "Tenant - PG",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      feedback:
        "Great experience! I found a clean and affordable PG within 24 hours. Highly recommend this platform.",
    },
    {
      id: 2,
      name: "Meena Joshi",
      role: "Landlord - Hostel",
      avatar: "https://randomuser.me/api/portraits/women/58.jpg",
      feedback:
        "As a landlord, it was super easy to list my property. Got multiple inquiries within a day!",
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Rental  Owner",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      feedback:
        "The platform made it easy to promote my Rental Property. Bookings have significantly increased!",
    },
    {
      id: 4,
      name: "Neha Verma",
      role: "Flat Renter",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      feedback:
        "I loved the user interface and how fast I could schedule property visits. Kudos to the team!",
    },
    {
      id: 5,
      name: "Suraj Singh",
      role: "Student - Hostel",
      avatar: "https://randomuser.me/api/portraits/men/21.jpg",
      feedback:
        "I moved from a different city and found the perfect hostel within budget. Everything was transparent!",
    },
    {
      id: 6,
      name: "Pooja Thakur",
      role: "Banquet Customer",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      feedback:
        "Booking a banquet for my brother's wedding was so easy here. Got a great deal and quick support!",
    },
  ];

  const agents = [
    {
      id: 1,
      name: "Rahul Mehta",
      role: "Senior Property Advisor",
      image: "https://randomuser.me/api/portraits/men/65.jpg",
      phone: "+91 9876543210",
      email: "rahul@estatehub.com",
      linkedin: "https://linkedin.com/in/rahulmehta",
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Hostel Specialist",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      phone: "+91 8123456789",
      email: "priya@estatehub.com",
      linkedin: "https://linkedin.com/in/priyasharma",
    },
    {
      id: 3,
      name: "Amit Chauhan",
      role: "Rental Owner",
      image: "https://randomuser.me/api/portraits/men/78.jpg",
      phone: "+91 9988776655",
      email: "amit@estatehub.com",
      linkedin: "https://linkedin.com/in/amitchauhan",
    },
  ];

  const images = [
    "https://plus.unsplash.com/premium_photo-1682377521697-bc598b52b08a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://media.istockphoto.com/id/2204602504/photo/luxurious-lakeside-residence-with-manicured-gardens-and-dock-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=lXYF230RtZORap6gkZwcTsh1KPKeqIh1fKmNZfMzFZI=",
    "https://plus.unsplash.com/premium_photo-1661883964999-c1bcb57a7357?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://media.istockphoto.com/id/187324934/photo/repetitive-neighborhood.jpg?s=612x612&w=0&k=20&c=EdV51hq5ynKvncQ8rEHFQjzrsU0rMx7T-CAcPo859B8=",
  ];

  const handleNavigation = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: path } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ marginTop: "-20px" }}>
      {/* 🎬 HERO SECTION WITH CINEMATIC BACKGROUND SLIDER */}
      <HeroSection />
      <PGHostelSection />

      <RentalPropety />
      <PlotsHome />
      <ExploreCities />

      <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      </section>

      {/* Trusted Agents Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 leading-tight pb-2 bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7a] bg-clip-text text-transparent">
              Meet Our Trusted Agents
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto mt-6">
              Dedicated professionals ready to guide you in every step of your
              property journey—whether you're looking to rent, buy, or celebrate.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-2">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 pt-20 pb-8 px-8 text-center border-t-4 border-orange-500 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-100/0 group-hover:from-orange-50/50 group-hover:to-orange-100/30 transition-all duration-300 rounded-2xl" />
                
                <div className="relative z-10">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-xl -mt-16 mb-4 bg-white ring-4 ring-orange-100"
                  />
                  <h4 className="text-xl font-bold text-[#1E3A5F]">
                    {agent.name}
                  </h4>
                  <p className="text-sm text-orange-600 font-semibold mt-1">{agent.role}</p>
                  <p className="text-gray-600 mt-3 italic text-sm">
                    "Here to make your property experience seamless."
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PropertyInquiryForm />

      <DownloadAppSection />

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent font-semibold text-sm uppercase tracking-wider">
              Testimonials
            </span>

            <h2 className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent text-4xl md:text-5xl font-bold mt-4">
              Hear from our satisfied buyers, tenants, owners and dealers
            </h2>

            <div className="w-32 h-1.5 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] mx-auto mt-8 rounded-full" />
          </motion.div>

          <motion.div
            className="flex gap-6"
            animate={{ x: ["0%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            whileHover={{ animationPlayState: "paused" }}
          >
            {[...testimonials, ...testimonials].map((testimonial, i) => (
              <div
                key={i}
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 min-w-[300px] flex-shrink-0 transform hover:scale-105 hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-radial from-orange-300/40 to-transparent rounded-full animate-pulse" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-radial from-pink-300/30 to-transparent animate-ping delay-1000" />
                </div>

                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {testimonial.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mt-3">
                    {testimonial.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {testimonial.role}
                  </p>
                </div>

                <div className="relative text-center">
                  <p className="text-gray-700 text-sm italic leading-relaxed mt-6">
                    "{testimonial.feedback}"
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default MainPage;