// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";

//  const hostelData = [
//   {
//     id: 1,
//     name: "Blossom Girls Hostel",
//     image: "https://media.istockphoto.com/id/1000073424/photo/interior-of-female-dormitory-room-at-hostel-3d-rendering.webp?a=1&b=1&s=612x612&w=0&k=20&c=s8DowPxCr8EaqSuNPq-wEs7ywQcnx4kxgRuhwQj0ZdM=",
//     city: "Delhi",
//     location: "Laxmi Nagar",
//     price: 5800,
//     bedrooms: "2",
//     amenities: ["Wi-Fi", "Meals", "24x7 Security"],
//     description: "Safe and secure hostel specially for girls, includes healthy meals and high-speed internet.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Girl"
//   },
//   {
//     id: 2,
//     name: "CityEdge Boys Hostel",
//     image: "https://t4.ftcdn.net/jpg/09/89/36/09/240_F_989360916_6BTG6wkz0QCRBj0Qih2yYNEGQQ1TdkEl.jpg",
//     city: "Bangalore",
//     location: "Mathikere",
//     price: 5000,
//     bedrooms: "3",
//     amenities: ["Laundry", "CCTV", "Power Backup"],
//     description: "Affordable boys' hostel with modern facilities and excellent connectivity to local colleges.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Boy"
//   },
//   {
//     id: 3,
//     name: "Sunshine Girls Hostel",
//     image: "https://t4.ftcdn.net/jpg/09/19/98/21/240_F_919982181_xp2bu9KbM21Ja6XiIdmu8CPIBIOI6pku.jpg",
//     city: "Pune",
//     location: "Kothrud",
//     price: 6200,
//     bedrooms: "1",
//     amenities: ["AC Rooms", "Housekeeping", "Common Room"],
//     description: "Premium accommodation for girls with daily housekeeping and social spaces.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Girl"
//   },
//   {
//     id: 4,
//     name: "Sky Hive Hostel",
//     image: "https://t3.ftcdn.net/jpg/11/71/82/26/240_F_1171822650_jo6PLbWv7ORs5AF60y5YZcI4ItaXtEA2.jpg",
//     city: "Hyderabad",
//     location: "Gachibowli",
//     price: 5400,
//     bedrooms: "3",
//     amenities: ["Wi-Fi", "Hot Water", "Bunk Beds"],
//     description: "Unisex hostel for both boys and girls, ideal for students and IT professionals.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Unisex"
//   },
//   {
//     id: 5,
//     name: "Emerald Boys Hostel",
//     image: "https://t3.ftcdn.net/jpg/12/75/41/20/240_F_1275412040_8WhpwtaH9ZRex90MpVQ1m50itpbosLOg.jpg",
//     city: "Chennai",
//     location: "Adyar",
//     price: 4700,
//     bedrooms: "2",
//     amenities: ["Meals", "Locker", "Games Room"],
//     description: "Boys' hostel offering healthy food options, games and secure lockers.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Boy"
//   },
//   {
//     id: 6,
//     name: "Elite Girls Hostel",
//     image: "https://t3.ftcdn.net/jpg/09/00/34/70/240_F_900347016_PLahWj8PppWs0dmvQdjStb7kHcZc8nFg.jpg",
//     city: "Kolkata",
//     location: "Salt Lake",
//     price: 6000,
//     bedrooms: "2",
//     amenities: ["Wi-Fi", "TV Lounge", "24/7 Security"],
//     description: "Modern girls’ hostel with lounge area and secure premises.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Girl"
//   },
//   {
//     id: 7,
//     name: "GreenLeaf Hostel",
//     image: "https://t3.ftcdn.net/jpg/13/47/13/72/240_F_1347137232_Ml5exe1vBr1XuijCANF1FqFJ1sbXPrza.jpg",
//     city: "Mumbai",
//     location: "Powai",
//     price: 7100,
//     bedrooms: "3",
//     amenities: ["Wi-Fi", "Power Backup", "Garden Area"],
//     description: "Unisex hostel with open green space, suitable for students and interns.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Unisex"
//   },
//   {
//     id: 8,
//     name: "TechNest Boys Hostel",
//     image: "https://t4.ftcdn.net/jpg/09/00/23/17/240_F_900231742_lBKFfWFmH9krRJ0lwcP63APQPFQarQAZ.jpg",
//     city: "Indore",
//     location: "Vijay Nagar",
//     price: 3900,
//     bedrooms: "4",
//     amenities: ["CCTV", "Meals", "Laundry"],
//     description: "Budget-friendly boys' hostel in student-centric neighborhood.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Boy"
//   },
//   {
//     id: 9,
//     name: "Urban Girls Hostel",
//     image: "https://t3.ftcdn.net/jpg/12/66/51/96/240_F_1266519677_67MkrM4qt3oRKFEj7l0RqnFSNaVfXS6r.jpg",
//     city: "Ahmedabad",
//     location: "Satellite",
//     price: 5300,
//     bedrooms: "1",
//     amenities: ["Air Conditioning", "Security", "Wi-Fi"],
//     description: "Girls' hostel with secured entrance, air-conditioned rooms, and all-time surveillance.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Girl"
//   },
//   {
//     id: 10,
//     name: "Quest Unisex Hostel",
//     image: "https://t3.ftcdn.net/jpg/13/52/46/58/240_F_1352465836_B7xx1M6PJJf8qqlKD6gfL8CIRYltgpWX.jpg",
//     city: "Gurgaon",
//     location: "Sector 41",
//     price: 6900,
//     bedrooms: "3",
//     amenities: ["Wi-Fi", "Common Kitchen", "Gym"],
//     description: "Unisex hostel with fitness facilities and a large shared kitchen.",
//     propertyType: "Hostel",
//     status: "rent",
//     gender: "Unisex"
//   }
// ];

// function Hostel() {
//   const [loading, setLoading] = useState(true);
//   const [filteredHostels, setFilteredHostels] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [city, setCity] = useState("");
//   const [bedrooms, setBedrooms] = useState("");
//   const [priceRange, setPriceRange] = useState("");
//   const [gender, setGender] = useState("");

//   useEffect(() => {
//     setTimeout(() => {
//       setFilteredHostels(hostelData);
//       setLoading(false);
//     }, 500);
//   }, []);

//   const handleFilter = () => {
//     const filtered = hostelData.filter((hostel) => {
//       const matchesSearch =
//         hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         hostel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         hostel.location.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesCity = city
//         ? hostel.city.toLowerCase() === city.toLowerCase()
//         : true;

//       const matchesBedrooms = bedrooms
//         ? hostel.bedrooms === bedrooms
//         : true;

//       const matchesGender = gender
//         ? hostel.gender.toLowerCase() === gender.toLowerCase()
//         : true;

//       const matchesPrice = (() => {
//         const price = hostel.price;
//         if (priceRange === "0-5000") return price <= 5000;
//         if (priceRange === "5001-6000") return price > 5000 && price <= 6000;
//         if (priceRange === "6001-7000") return price > 6000 && price <= 7000;
//         if (priceRange === "7001+") return price > 7000;
//         return true;
//       })();

//       return matchesSearch && matchesCity && matchesBedrooms && matchesGender && matchesPrice;
//     });

//     setFilteredHostels(filtered);
//   };

//   const handleReset = () => {
//     setSearchTerm("");
//     setCity("");
//     setBedrooms("");
//     setPriceRange("");
//     setGender("");
//     setFilteredHostels(hostelData);
//   };

//   return (
//     <div className="min-h-screen bg-[#f6f8fa] py-12 px-4">
//       <h1 className="text-3xl font-bold text-center mb-6">
//         Available Hostels for Rent
//       </h1>

      
//       <div
//         className="max-w-5xl mx-auto mb-8 
//                    bg-white/30 backdrop-blur-md 
//                    border border-blue-500/50 shadow-lg
//                    rounded-xl p-4
//                    flex flex-wrap items-center gap-4 justify-center"
//         style={{
//           boxShadow: "0 0 12px rgba(59,130,246,0.6)",
//           minHeight: "80px",
//         }}
//       >
//         <input
//           type="text"
//           placeholder="Search by name, city or location"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-56 bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />


//         <select
//           value={bedrooms}
//           onChange={(e) => setBedrooms(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">Bedrooms</option>
//           <option value="1">1 BHK</option>
//           <option value="2">2 BHK</option>
//           <option value="3">3 BHK</option>
//           <option value="4">4+ BHK</option>
//         </select>

//         <select
//           value={priceRange}
//           onChange={(e) => setPriceRange(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Prices</option>
//           <option value="0-5000">₹0 - ₹5,000</option>
//           <option value="5001-6000">₹5,001 - ₹6,000</option>
//           <option value="6001-7000">₹6,001 - ₹7,000</option>
//           <option value="7001+">₹7,001+</option>
//         </select>

//         <select
//           value={gender}
//           onChange={(e) => setGender(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-40 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Genders</option>
//           <option value="Girl">Girls</option>
//           <option value="Boy">Boys</option>
//           <option value="Unisex">Unisex</option>
//         </select>

//         <button
//           onClick={handleFilter}
//           className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 shadow-lg"
//         >
//           Search
//         </button>

//         <button
//           onClick={handleReset}
//           className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
//         >
//           Reset
//         </button>
//       </div>

//       {/* ✅ Hostel Cards */}
//       <div className="p-6 max-w-7xl mx-auto">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
//           </div>
//         ) : filteredHostels.length === 0 ? (
//           <p className="text-center text-gray-500">No hostels found.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredHostels.map((hostel, index) => (
//               <Link
//                 key={hostel.id}
//                 to={`/hostel/${hostel.id}`}
//                 state={{ hostel }}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden block"
//               >
//                 <img
//                   src={hostel.image}
//                   alt={hostel.name}
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="p-4">
//                   <h3 className="text-xl font-semibold text-blue-600 mb-1">
//                     {hostel.name}
//                   </h3>
//                   <p className="text-sm text-gray-600 mb-2">
//                     {hostel.city} - {hostel.location}
//                   </p>
//                   <p className="text-gray-700 text-sm mb-2 line-clamp-2">
//                     {hostel.description}
//                   </p>
//                   <p className="text-sm">
//                     <span className="font-semibold">₹{hostel.price}</span> /month |{" "}
//                     {hostel.bedrooms} BHK | {hostel.gender}
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Hostel;







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { FaMapMarkerAlt, FaHome, FaBed, FaRupeeSign, FaCheckCircle } from "react-icons/fa";
// import AOS from "aos";
// import "aos/dist/aos.css";

// const Hostel = () => {
//   const [hostels, setHostels] = useState([]);
//   const [loading, setLoading] = useState(true);

 

// useEffect(() => {
//   AOS.init({ duration: 800, once: true });

//   const fetchHostels = async () => {
//     try {
//       const res = await axios.get("https://pg-hostel.nearprop.com/api/public/properties/Hostel");
//       const raw = res.data;

//       if (raw.success && Array.isArray(raw.properties)) {
//         const formatted = raw.properties.map(item => ({
//           id: item.id,
//           name: item.name,
//           image: item.images?.[0] || "",
//           images: item.images || [],
//           city: item.location?.city || "",
//           location: item.location?.address || "",
//           price: item.lowestPrice || item.price || 0,
//           bedrooms: item.totalBeds,
//           amenities: item.rooms?.flatMap(r => r.facilities) || [],
//           description: item.description || "",
//           propertyType: item.type,
//           status: item.hasAvailability ? "Available" : "Full",
//           totalRooms: item.totalRooms,
//           totalBeds: item.totalBeds,
//         }));
//         setHostels(formatted);
//       } else {
//         console.error("Unexpected API response:", raw);
//       }
//     } catch (err) {
//       console.error("Error fetching hostels:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchHostels();
// }, []);

//   return (
//     <section className="py-8 px-6 bg-gray-50 text-center">
//       <h2 className="text-3xl font-bold text-indigo-500 mb-8" data-aos="fade-up">
//         Affordable PGs & Hostels
//       </h2>

//       {loading ? (
//         <div className="text-center text-lg text-gray-600">Loading hostels...</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
//           {hostels.map((item, index) => (
//             <Link
//               to={`/hostel/${item.id}`}
//               state={item}
//               key={item.id}
//               className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden text-left"
//               data-aos="zoom-in"
//               data-aos-delay={index * 100}
//             >
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-full h-48 object-cover"
//               />
//               <div className="p-4 space-y-3">
//                 <h3 className="text-xl font-bold text-center text-[#5C4EFF]">
//                   {item.name}
//                 </h3>
//                 <p className="flex items-center text-gray-600 text-sm gap-2">
//                   <FaMapMarkerAlt className="text-[#5C4EFF]" />
//                   {item.city}, {item.location}
//                 </p>
//                 <p className="flex items-center text-sm gap-2">
//                   <FaHome className="text-[#5C4EFF]" />
//                   <span className="font-semibold">Type:</span>{" "}
//                   {item.propertyType}
//                 </p>
//                 <p className="flex items-center text-sm gap-2">
//                   <FaBed className="text-[#5C4EFF]" />
//                   <span className="font-semibold">Bedrooms:</span>{" "}
//                   {item.bedrooms}
//                 </p>
//                 <p className="flex items-center text-sm gap-2">
//                   <FaRupeeSign className="text-[#5C4EFF]" />
//                   <span className="font-semibold">Rent/Room:</span> ₹{item.price}
//                 </p>
//                 <div className="flex items-start gap-2 text-sm">
//                   <FaCheckCircle className="mt-1 text-[#5C4EFF]" />
//                   <div>
//                     <span className="font-semibold">Amenities:</span>{" "}
//                     {item.amenities.join(", ")}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// };

// export default Hostel;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import {
//   FaMapMarkerAlt,
//   FaHome,
//   FaBed,
//   FaRupeeSign,
//   FaCheckCircle,
//   FaCar,
//   FaRulerCombined,
//   FaUser,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import AOS from "aos";
// import "aos/dist/aos.css";

// const Hostel = () => {
//   const [hostels, setHostels] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     AOS.init({ duration: 800, once: true });

//     const fetchHostels = async () => {
//       try {
//         const res = await axios.get("https://pg-hostel.nearprop.com/api/public/properties/Hostel");
//         const raw = res.data;

//         if (raw.success && Array.isArray(raw.properties)) {
//           const formatted = raw.properties.map((item) => ({
//             id: item.id,
//             name: item.name,
//             image: item.images?.[0] || "",
//             images: item.images || [],
//             city: item.location?.city || "",
//             location: item.location?.address || "",
//             price: item.lowestPrice || item.price || 0,
//             bedrooms: item.totalBeds,
//             amenities: item.rooms?.flatMap((r) => r.facilities) || [],
//             description: item.description || "",
//             propertyType: item.type,
//             status: item.hasAvailability ? "Available" : "Full",
//             totalRooms: item.totalRooms,
//             totalBeds: item.totalBeds,
//             createdAt: item.createdAt || new Date().toISOString(), // Fallback to current date if not available
//           }));
//           setHostels(formatted);
//         } else {
//           console.error("Unexpected API response:", raw);
//         }
//       } catch (err) {
//         console.error("Error fetching hostels:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHostels();
//   }, []);

//   return (
//     <section className="py-8 px-6 bg-gray-50 text-center">
//       <h2 className="text-3xl font-bold text-indigo-500 mb-8" data-aos="fade-up">
//         Affordable PGs & Hostels
//       </h2>

//       {loading ? (
//         <div className="text-center text-lg text-gray-600">Loading hostels...</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
//           {hostels.length === 0 ? (
//             <p className="text-center text-gray-500 col-span-full">No hostels found.</p>
//           ) : (
//             hostels.map((item, index) => (
//               <Link
//                 to={`/hostel/${item.id}`}
//                 state={item}
//                 key={item.id}
//                 className="bg-white rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
//                 data-aos="zoom-in"
//                 data-aos-delay={index * 100}
//               >
//                 <div className="w-full h-48 overflow-hidden">
//                   <img
//                     src={item.image || "https://via.placeholder.com/400x300"}
//                     alt={item.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>

//                 <div className="p-4">
//                   <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
//                   <p className="text-sm text-gray-600 mb-2">
//                     {item.location}, {item.city}
//                   </p>

//                   <div className="flex flex-wrap text-sm text-gray-700 gap-4 mb-2">
//                     <span className="flex items-center gap-1">
//                       <FaBed /> {Math.round(item.totalBeds / item.totalRooms) || "N/A"} Beds/Room
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FaCar /> Parking: N/A
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FaRulerCombined /> Size: N/A
//                     </span>
//                   </div>

//                   <div className="text-base font-semibold text-black mb-1">
//                     ₹ {item.price || "N/A"}
//                   </div>

//                   <div className="text-sm font-medium text-gray-600 mb-3">
//                     Type: {item.propertyType}
//                   </div>

//                   <div className="flex justify-between text-xs text-gray-500">
//                     <span className="flex items-center gap-1">
//                       <FaUser /> Admin
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             ))
//           )}
//         </div>
//       )}
//     </section>
//   );
// };

// export default Hostel;




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import {
//   FaMapMarkerAlt,
//   FaHome,
//   FaBed,
//   FaRupeeSign,
//   FaCheckCircle,
//   FaBed as FaBedIcon,
//   FaCar,
//   FaRulerCombined,
//   FaUser,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import AOS from "aos";
// import "aos/dist/aos.css";

// const Hostel = () => {
//   const [hostels, setHostels] = useState([]);
//   const [filteredHostels, setFilteredHostels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [city, setCity] = useState("");
//   const [bedrooms, setBedrooms] = useState("");
//   const [priceRange, setPriceRange] = useState("");
//   const [gender, setGender] = useState("");

//   useEffect(() => {
//     AOS.init({ duration: 800, once: true });

//     const fetchHostels = async () => {
//       try {
//         const res = await axios.get("https://pg-hostel.nearprop.com/api/public/properties/Hostel");
//         const raw = res.data;

//         if (raw.success && Array.isArray(raw.properties)) {
//           const formatted = raw.properties.map((item) => ({
//             id: item.id,
//             name: item.name,
//             image: item.images?.[0] || "",
//             images: item.images || [],
//             city: item.location?.city || "",
//             location: item.location?.address || "",
//             price: item.lowestPrice || item.price || 0,
//             bedrooms: item.totalBeds, // Using totalBeds as a proxy for bedrooms
//             amenities: item.rooms?.flatMap((r) => r.facilities) || [],
//             description: item.description || "",
//             propertyType: item.type,
//             status: item.hasAvailability ? "Available" : "Full",
//             totalRooms: item.totalRooms,
//             totalBeds: item.totalBeds,
//             createdAt: item.createdAt || new Date().toISOString(), // Fallback to current date
//             gender: item.rooms?.some((r) => r.allFacilities.propertySpecific.genderSpecific)
//               ? item.rooms[0].allFacilities.propertySpecific.genderSpecific.toLowerCase()
//               : "unisex", // Infer gender from facilities if available
//           }));
//           setHostels(formatted);
//           setFilteredHostels(formatted);
//         } else {
//           console.error("Unexpected API response:", raw);
//         }
//       } catch (err) {
//         console.error("Error fetching hostels:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHostels();
//   }, []);

//   const handleFilter = () => {
//     const filtered = hostels.filter((hostel) => {
//       const matchesSearch =
//         hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         hostel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         hostel.location.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesCity = city
//         ? hostel.city.toLowerCase() === city.toLowerCase()
//         : true;

//       const bedsPerRoom = hostel.totalBeds / hostel.totalRooms;
//       const matchesBedrooms = bedrooms
//         ? (bedrooms === "4" ? bedsPerRoom >= 4 : Math.round(bedsPerRoom) === parseInt(bedrooms))
//         : true;

//       const matchesGender = gender
//         ? hostel.gender.toLowerCase() === gender.toLowerCase()
//         : true;

//       const price = hostel.price;
//       const matchesPrice = (() => {
//         if (priceRange === "0-5000") return price <= 5000;
//         if (priceRange === "5001-6000") return price > 5000 && price <= 6000;
//         if (priceRange === "6001-7000") return price > 6000 && price <= 7000;
//         if (priceRange === "7001+") return price > 7000;
//         return true;
//       })();

//       return matchesSearch && matchesCity && matchesBedrooms && matchesGender && matchesPrice;
//     });

//     setFilteredHostels(filtered);
//   };

//   const handleReset = () => {
//     setSearchTerm("");
//     setCity("");
//     setBedrooms("");
//     setPriceRange("");
//     setGender("");
//     setFilteredHostels(hostels);
//   };

//   return (
//     <div className="min-h-screen bg-[#f6f8fa] py-12 px-4">
//       <h1 className="text-3xl font-bold text-center mb-6">Available Hostels for Rent</h1>

//       {/* Filter Section */}
//       <div
//         className="max-w-5xl mx-auto mb-8 bg-white/30 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-4 flex flex-wrap items-center gap-4 justify-center"
//         style={{ boxShadow: "0 0 12px rgba(59,130,246,0.6)", minHeight: "80px" }}
//       >
//         <input
//           type="text"
//           placeholder="Search by name, city or location"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-56 bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <select
//           value={bedrooms}
//           onChange={(e) => setBedrooms(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">Bedrooms</option>
//           <option value="1">1 BHK</option>
//           <option value="2">2 BHK</option>
//           <option value="3">3 BHK</option>
//           <option value="4">4+ BHK</option>
//         </select>

//         <select
//           value={priceRange}
//           onChange={(e) => setPriceRange(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Prices</option>
//           <option value="0-5000">₹0 - ₹5,000</option>
//           <option value="5001-6000">₹5,001 - ₹6,000</option>
//           <option value="6001-7000">₹6,001 - ₹7,000</option>
//           <option value="7001+">₹7,001+</option>
//         </select>

//         <select
//           value={gender}
//           onChange={(e) => setGender(e.target.value)}
//           className="border border-blue-500/50 p-2 rounded w-40 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Genders</option>
//           <option value="girl">Girls</option>
//           <option value="boy">Boys</option>
//           <option value="unisex">Unisex</option>
//         </select>

//         <button
//           onClick={handleFilter}
//           className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 shadow-lg"
//         >
//           Search
//         </button>

//         <button
//           onClick={handleReset}
//           className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
//         >
//           Reset
//         </button>
//       </div>

//       {/* Hostel Cards */}
//       <div className="p-6 max-w-7xl mx-auto">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
//           </div>
//         ) : filteredHostels.length === 0 ? (
//           <p className="text-center text-gray-500">No hostels found.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredHostels.map((hostel, index) => (
//               <Link
//                 key={hostel.id}
//                 to={`/hostel/${hostel.id}`}
//                 state={{ hostel }}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden block"
//               >
//                 <img
//                   src={hostel.image || "https://via.placeholder.com/400x300"}
//                   alt={hostel.name}
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="p-4">
//                   <h3 className="text-xl font-semibold text-blue-600 mb-1">{hostel.name}</h3>
//                   <p className="text-sm text-gray-600 mb-2">{hostel.city} - {hostel.location}</p>
//                   <p className="text-gray-700 text-sm mb-2 line-clamp-2">{hostel.description}</p>
//                   <div className="flex flex-wrap text-sm text-gray-700 gap-4 mb-2">
//                     <span className="flex items-center gap-1">
//                       <FaBedIcon /> {Math.round(hostel.totalBeds / hostel.totalRooms) || "N/A"} Beds/Room
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FaCar /> Parking: N/A
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FaRulerCombined /> Size: N/A
//                     </span>
//                   </div>
//                   <div className="text-base font-semibold text-black mb-1">
//                     ₹ {hostel.price}/month
//                   </div>
//                   <div className="text-sm font-medium text-gray-600 mb-3">
//                     Type: {hostel.propertyType} | {hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1)}
//                   </div>
//                   <div className="flex justify-between text-xs text-gray-500">
//                     <span className="flex items-center gap-1">
//                       <FaUser /> Admin
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <FaCalendarAlt /> {new Date(hostel.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Hostel;



import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaHome,
  FaBed,
  FaRupeeSign,
  FaCheckCircle,
  FaBed as FaBedIcon,
  FaCar,
  FaRulerCombined,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const Hostel = () => {
  const [hostels, setHostels] = useState([]);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const fetchHostels = async () => {
      try {
        const res = await axios.get("https://api.gharzoreality.com/api/public/properties/Hostel");
        console.log("API Response:", res.data); // Debug log
        const raw = res.data;

        if (raw.success && Array.isArray(raw.properties)) {
          const formatted = raw.properties.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.images?.[0] || "",
            images: item.images || [],
            city: item.location?.city || "",
            location: item.location?.address || "",
            price: item.lowestPrice || item.price || 0,
            bedrooms: item.totalBeds, // Using totalBeds as a proxy for bedrooms
            amenities: item.rooms?.flatMap((r) => r.facilities) || [],
            description: item.description || "",
            propertyType: item.type,
            status: item.hasAvailability ? "Available" : "Full",
            totalRooms: item.totalRooms,
            totalBeds: item.totalBeds,
            createdAt: item.createdAt || new Date().toISOString(),
            gender: item.rooms?.some((r) => r.allFacilities?.propertySpecific?.genderSpecific)
              ? item.rooms[0].allFacilities.propertySpecific.genderSpecific.toLowerCase()
              : "unisex",
          }));
          setHostels(formatted);
          setFilteredHostels(formatted);
        } else {
          console.error("Unexpected API response:", raw);
        }
      } catch (err) {
        console.error("Error fetching hostels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const handleFilter = () => {
    const filtered = hostels.filter((hostel) => {
      const matchesSearch =
        hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = city
        ? hostel.city.toLowerCase() === city.toLowerCase()
        : true;

      const bedsPerRoom = hostel.totalRooms > 0 ? hostel.totalBeds / hostel.totalRooms : 0;
      const matchesBedrooms = bedrooms
        ? (bedrooms === "4" ? Math.round(bedsPerRoom) >= 4 : Math.round(bedsPerRoom) === parseInt(bedrooms))
        : true;

      const matchesGender = gender
        ? hostel.gender.toLowerCase() === gender.toLowerCase()
        : true;

      const price = hostel.price;
      const matchesPrice = (() => {
        if (priceRange === "0-5000") return price <= 5000;
        if (priceRange === "5001-6000") return price > 5000 && price <= 6000;
        if (priceRange === "6001-7000") return price > 6000 && price <= 7000;
        if (priceRange === "7001+") return price > 7000;
        return true;
      })();

      return matchesSearch && matchesCity && matchesBedrooms && matchesGender && matchesPrice;
    });

    setFilteredHostels(filtered);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCity("");
    setBedrooms("");
    setPriceRange("");
    setGender("");
    setFilteredHostels(hostels);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Available Hostels for Rent</h1>

      {/* Filter Section */}
      <div
        className="max-w-5xl mx-auto mb-8 bg-white/30 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-4 flex flex-wrap items-center gap-4 justify-center"
        style={{ boxShadow: "0 0 12px rgba(59,130,246,0.6)", minHeight: "80px" }}
      >
        <input
          type="text"
          placeholder="Search by name, city or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-56 bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Bedrooms</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-44 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Prices</option>
          <option value="0-5000">₹0 - ₹5,000</option>
          <option value="5001-6000">₹5,001 - ₹6,000</option>
          <option value="6001-7000">₹6,001 - ₹7,000</option>
          <option value="7001+">₹7,001+</option>
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-blue-500/50 p-2 rounded w-40 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Genders</option>
          <option value="girl">Girls</option>
          <option value="boy">Boys</option>
          <option value="unisex">Unisex</option>
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 shadow-lg"
        >
          Search
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
        >
          Reset
        </button>
      </div>

      {/* Hostel Cards */}
      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : filteredHostels.length === 0 ? (
          <p className="text-center text-gray-500">No hostels found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHostels.map((hostel, index) => (
              <Link
                key={hostel.id}
                to={`/hostel/${hostel.id}`}
                state={{ hostel }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden block"
              >
                <img
                  src={hostel.image || "https://via.placeholder.com/400x300"}
                  alt={hostel.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-blue-600 mb-1">{hostel.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{hostel.city} - {hostel.location}</p>
                  {hostel.description && (
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">{hostel.description}</p>
                  )}
                  <div className="flex flex-wrap text-sm text-gray-700 gap-4 mb-2">
                    <span className="flex items-center gap-1">
                      <FaBedIcon /> {Math.round(hostel.totalBeds / hostel.totalRooms) || "N/A"} Beds/Room
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCar /> Parking: N/A
                    </span>
                    <span className="flex items-center gap-1">
                      <FaRulerCombined /> Size: N/A
                    </span>
                  </div>
                  <div className="text-base font-semibold text-black mb-1">
                    ₹ {hostel.price}/month
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-3">
                    Type: {hostel.propertyType} | {hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1)}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaUser /> Admin
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {new Date(hostel.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hostel;