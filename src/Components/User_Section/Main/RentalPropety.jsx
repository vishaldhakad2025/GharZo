import { motion } from 'framer-motion';

const PopularRentalProperties = () => {
  // Static dummy data
  const properties = [
    {
      id: 1,
      name: "The Address Lakeview",
      location: { area: "Vijay Nagar", city: "Indore" },
      builder: "DB Realty",
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
    },
    {
      id: 2,
      name: "Astral Park Residency",
      location: { area: "Super Corridor", city: "Indore" },
      builder: "Astral Group",
      images: ["https://images.unsplash.com/photo-1583608205776-b77a0a53f81e?w=800"],
    },
    {
      id: 3,
      name: "Treasure Island Sky",
      location: { area: "MG Road", city: "Indore" },
      builder: "Treasure Vistas",
      images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
    },
    {
      id: 4,
      name: "Crystal Residency",
      location: { area: "Bhawarkua", city: "Indore" },
      builder: "Crystal Builders",
      images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
    },
    {
      id: 5,
      name: "Silver Spring Heights",
      location: { area: "AB Road", city: "Indore" },
      builder: "Silverstone Group",
      images: ["https://images.unsplash.com/photo-1600563438938-a9a78e01d44a?w=800"],
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
            <span className='class="text-orange-400 font-semibold text-sm uppercase tracking-wider"'> Discover Premium Rentals
</span>
          <h2 className="text-5xl md:text-6xl font-bold mt-4">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Popular Rental Properties
            </span>
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full" />
          <p className="mt-6  text-[18px] rounded-2xl text-gray-70 max-w-2xl mx-auto">
Smart rooms that feel like home-comfort, convenience and value in every stay          </p>
        </motion.div>

        {/* Properties Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.7 }}
                className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-96 md:h-[500px] bg-cover bg-center"
                style={{
                  backgroundImage: `url(${property.images[0] || "/placeholder-project.jpg"})`,
                }}
              >
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                  <h3 className="text-2xl md:text-4xl font-bold text-white">
                    {property.name}
                  </h3>

                  <p className="text-lg md:text-xl text-gray-200 mt-2">
                    {property.location.area}, {property.location.city}
                  </p>

                  <div className="flex items-center justify-between mt-8">
                    <p className="text-gray-300 text-base md:text-lg">
                      Interested in this project by{" "}
                      <span className="font-semibold text-white">{property.builder}</span>?
                    </p>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:shadow-xl">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a22 22 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      View Number
                    </button>
                  </div>
                </div>

                {/* Next arrow (only on non-last items) */}
                {index < properties.length - 1 && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularRentalProperties;