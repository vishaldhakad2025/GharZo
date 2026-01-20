import { useEffect, useState, useRef } from "react";

const AdsPopup = () => {
  // 🔹 Enhanced Ads List with descriptions
  const ads = [
    {
      id: 1,
      image: "https://i.pinimg.com/1200x/53/dd/cc/53ddccd3c7469ac82355e64650522c5b.jpg",
      title: "Premium Property",
      description: "Experience crystal clear sound with 50% off on premium Property",
      link: "https://example.com",
      cta: "Shop Now"
    },
    {
      id: 2,
      image: "https://i.pinimg.com/1200x/a9/16/56/a916560e8bee028392e38596c17eda6d.jpg",
      title: "Find Your Home",
      description: "Track your fitness goals with our latest smartwatch collection",
      link: "https://example.com",
      cta: "Explore"
    },
    {
      id: 3,
      image: "https://i.pinimg.com/736x/00/b8/86/00b88672bdcfbd033854357dd4a5d2ce.jpg",
      title: "Real Estate",
      description: "Real Estate Design for Social Media",
      link: "https://example.com",
      cta: "Browse Collection"
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const firstTimer = useRef(null);
  const closeTimer = useRef(null);
  const nextAdTimer = useRef(null);

  // 🔥 First ad after 3 seconds (reduced for demo)
  useEffect(() => {
    firstTimer.current = setTimeout(() => {
      openAd();
    }, 3000);

    return () => clearAllTimers();
  }, []);

  const openAd = () => {
    setIsOpen(true);
    setShowClose(false);
    setImageLoaded(false);

    // 🔒 Enable close after 12 seconds
    closeTimer.current = setTimeout(() => {
      setShowClose(true);
    }, 12000);
  };

  const closeAd = () => {
    setIsOpen(false);
    setShowClose(false);
    setImageLoaded(false);

    // 🔁 Rotate ad
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);

    // ⏳ Next ad after 20 seconds
    nextAdTimer.current = setTimeout(() => {
      openAd();
    }, 20000);
  };

  const clearAllTimers = () => {
    clearTimeout(firstTimer.current);
    clearTimeout(closeTimer.current);
    clearTimeout(nextAdTimer.current);
  };

  if (!isOpen) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-black rounded-2xl max-w-md w-full max-h-[85vh] shadow-2xl overflow-hidden transform transition-all animate-slideUp">
        {/* ❌ Close Button */}
        {showClose && (
          <button
            onClick={closeAd}
            className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Close ad"
          >
            ✕
          </button>
        )}

        {/* 📢 Ad Content - Full Image with Overlay Text */}
        <div className="relative h-full">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-gray-700 to-gray-900 animate-pulse" />
          )}
          
          {/* Ad Image - Full Size */}
          <a 
            href={currentAd.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block relative"
          >
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className={`w-full h-full min-h-[500px] max-h-[85vh] object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x1000/4F46E5/FFFFFF?text=Advertisement';
                setImageLoaded(true);
              }}
            />

            {/* Bottom Gradient Blur Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/70 to-transparent backdrop-blur-[2px]" />
          </a>

          {/* Ad Details - Positioned Over Image */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {currentAd.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-100 mb-4 leading-relaxed drop-shadow-md">
              {currentAd.description}
            </p>

            {/* CTA Button */}
            <a
              href={currentAd.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              {currentAd.cta} →
            </a>

            {/* Timer Indicator */}
            {!showClose && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <p className="text-xs text-gray-200">
                  Ad closes in a few seconds...
                </p>
              </div>
            )}

            {/* Ad Counter */}
            <div className="flex justify-center gap-1.5 mt-3">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentAdIndex 
                      ? 'w-8 bg-white' 
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdsPopup;