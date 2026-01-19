import React from "react";
import { Home, Building2, ClipboardCheck, Smartphone } from "lucide-react";
import appads from "../../../assets/appads.png";
import googlePlayBadge from "../../../assets/play.png";     // ← Google Play button image
import appStoreBadge from "../../../assets/app.png";       // ← App Store button image

const DownloadApp = () => {
  return (
    <section className="w-full bg-gradient-to-b from-orange-50 via-white to-gray-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-b from-blue-200 via-white to-orange-300 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-orange-100/60">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 p-6 sm:p-10 lg:p-12 xl:p-16">
            {/* LEFT CONTENT */}
            <div className="w-full lg:w-1/2 space-y-7 lg:space-y-9 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Download
                </span>{" "}
                <span className="text-[#0c2344]">Gharzo App</span>
              </h2>

              <p className="text-gray-700 text-lg sm:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Find your dream home, plot, rental, PG or hostel with ease —{" "}
                <span className="font-semibold text-[#0c2344]">everything in one trusted place</span>.
              </p>

              {/* Feature Icons */}
              <div className="flex items-center justify-center lg:justify-start gap-5 sm:gap-7">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c2344] to-[#1a3a6e] text-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <Home size={28} />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c2344] to-[#1a3a6e] text-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <Building2 size={28} />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c2344] to-[#1a3a6e] text-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <ClipboardCheck size={28} />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c2344] to-[#1a3a6e] text-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <Smartphone size={28} />
                </div>
              </div>

              {/* Download Buttons - Using Official Badge Images */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-6">
                {/* Google Play Button */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <img
                    src={googlePlayBadge}
                    alt="Get it on Google Play"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </a>

                {/* App Store Button */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <img
                    src={appStoreBadge}
                    alt="Download on the App Store"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </a>
              </div>
            </div>

            {/* RIGHT - APP MOCKUP */}
            <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
              <div className="relative mr-12 border-4 border-[#0c2344]/30 rounded-3xl max-w-[280px] sm:max-w-[320px] md:max-w-[360px] w-full">
                <img
                  src={appads}
                  alt="Gharzo App Mockup"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-[#0c2344]/30 transform hover:scale-[1.04] transition-all duration-500"
                />
                {/* Decorative ring */}
                <div className="absolute -inset-6 sm:-inset-8 lg:-inset-10 rounded-full bg-gradient-to-r from-[#0c2344]/20 via-orange-500/15 to-[#0c2344]/20 blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;