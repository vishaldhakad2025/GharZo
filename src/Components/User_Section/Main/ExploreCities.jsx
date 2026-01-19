import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";

function ExploreCities() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);

  const cities = [
    {
      id: 1,
      name: "Vijay Nagar",
      description: "Premium residential & commercial hub with malls and offices",
      image: "https://images.crowdspring.com/blog/wp-content/uploads/2017/08/23163415/pexels-binyamin-mellish-106399.jpg",
    },
    {
      id: 2,
      name: "Super Corridor",
      description: "Fast developing IT & business corridor of Indore",
      image: "https://assets-news.housing.com/news/wp-content/uploads/2022/03/31010142/Luxury-house-design-Top-10-tips-to-add-luxury-to-your-house-FEATURE-compressed-686x400.jpg",
    },
    {
      id: 3,
      name: "Rajwada",
      description: "Historic heart of Indore with palace & vibrant street markets",
      image: "https://content.jdmagicbox.com/comp/kolar/a8/9999p8152.8152.170605163316.t1a8/catalogue/qvc-hills-kolar-builders-and-developers-dcc35tq4w8.jpg",
    },
    {
      id: 4,
      name: "AB Road",
      description: "Main commercial artery with hotels, showrooms & restaurants",
      image: "https://images.unsplash.com/photo-1603366615786-558f7687464a?w=1200&auto=format",
    },
    {
      id: 5,
      name: "Bhawarkua",
      description: "Popular student & middle-class residential area",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format",
    },
    {
      id: 6,
      name: "Palasia",
      description: "Upscale area known for high-end shopping & dining",
      image: "https://images.unsplash.com/photo-1583608205776-b77a0a53f81e?w=1200&auto=format",
    },
    {
      id: 7,
      name: "MR-10",
      description: "Emerging residential & plotted area with good connectivity",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format",
    },
    {
      id: 8,
      name: "Annapurna",
      description: "Calm residential locality with good schools & markets",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format",
    },
    {
      id: 9,
      name: "Pipliyahana",
      description: "Developing area with affordable housing & new projects",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format",
    },
    {
      id: 10,
      name: "LIG Colony",
      description: "Well-planned, peaceful & value-for-money residential area",
      image: "https://images.unsplash.com/photo-1598928508446-7d1a19e5e8a3?w=1200&auto=format",
    },
  ];

  const itemsPerView = {
    sm: 1,
    md: 2,
    lg: 4,
  };

  const getItemsPerView = () => {
    if (window.innerWidth >= 1024) return itemsPerView.lg;
    if (window.innerWidth >= 768) return itemsPerView.md;
    return itemsPerView.sm;
  };

  const [visibleCount, setVisibleCount] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      const newCount = getItemsPerView();
      setVisibleCount(newCount);
      setCurrentIndex((prev) => Math.min(prev, cities.length - newCount));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = cities.length - visibleCount;

  // Auto slide every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleCityClick = (cityName) => {
    const destination = `/toparea?city=${encodeURIComponent(cityName)}`;
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate("/login", { state: { from: destination } });
    }
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
            <span className="bg-gradient-to-r from-[#0c2344] via-[#0b4f91] to-[#0c2344] bg-clip-text text-transparent">
              Explore Indore's Best Areas
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg bg-yellow-400 rounded-2xl text-black max-w-3xl mx-auto">
            Discover premium localities, modern developments & classic neighborhoods
          </p>
          <div className="w-28 sm:w-32 h-1.5 bg-gradient-to-r from-[#0c2344] to-[#0b4f91] mx-auto mt-6 rounded-full" />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="flex-shrink-0 px-3 sm:px-4 w-full sm:w-1/2 lg:w-1/4 "
                >
                  <div
                    onClick={() => handleCityClick(city.name)}
                    className="group bg-white border-2 border-orange-400 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-4 "
                  >
                    <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                    </div>

                    <div className="p-5 sm:p-6 text-center">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#0b4f91] transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 line-clamp-2">
                        {city.description}
                      </p>

                      <button className="inline-flex items-center px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#0c2344] to-[#0b4f91] text-white font-medium rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base">
                        Explore Area →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Navigation Buttons */}
          {cities.length > visibleCount && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300 shadow-xl z-10 border border-white/10"
              >
                <span className="text-2xl font-bold">←</span>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300 shadow-xl z-10 border border-white/10"
              >
                <span className="text-2xl font-bold">→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ExploreCities;