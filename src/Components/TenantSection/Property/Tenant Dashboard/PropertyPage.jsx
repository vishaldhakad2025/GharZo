// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Home, Bed, MapPin, DollarSign, Calendar, Building2 } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../../../User_Section/Context/AuthContext";

// export default function PropertyPage() {
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   const [accommodations, setAccommodations] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("tenanttoken");
//       if (!token) {
//         setError("No authentication token found. Please log in.");
//         navigate("/login", { replace: true });
//         return;
//       }

//       try {
//         const accRes = await axios.get(
//           "https://api.gharzoreality.com/api/tenant/accommodations",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (accRes.data.success) {
//           setAccommodations(accRes.data.accommodations || []);

//           const tenantId =
//             accRes.data.accommodations?.[0]?.tenantId ||
//             localStorage.getItem("tenantId");

//           if (tenantId) localStorage.setItem("tenantId", tenantId);

//           if (tenantId) {
//             const roomsRes = await axios.get(
//               `https://api.gharzoreality.com/api/tenant/${tenantId}/my-rooms`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             if (roomsRes.data.success) {
//               setRooms(roomsRes.data.rooms || []);
//             }
//           }
//         } else {
//           setError(accRes.data.message || "Failed to fetch accommodations.");
//           if (accRes.data.error === "User is not a registered tenant") {
//             localStorage.removeItem("tenanttoken");
//             logout();
//             navigate("/login", { replace: true });
//           }
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             "An error occurred while fetching data."
//         );
//         if (err.response?.data?.error === "User is not a registered tenant") {
//           localStorage.removeItem("tenanttoken");
//           logout();
//           navigate("/login", { replace: true });
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [navigate, logout]);

//   const hasRooms = rooms.length > 0;

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
//         />
//         <p className="ml-4 text-gray-600 font-medium">Loading your properties...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 text-center border border-red-100"
//         >
//           <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
//             <span className="text-red-500 text-2xl">!</span>
//           </div>
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={() => navigate("/login", { replace: true })}
//             className="w-full p-3 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
//           >
//             Go to Login
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="bg-white rounded-3xl shadow-2xl overflow-hidden"
//         >
//           {/* Header */}
//           <div className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 px-8 py-8 relative overflow-hidden">
//             <div className="absolute inset-0 bg-black/10" />
//             <div className="relative flex items-center gap-4">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring" }}
//                 className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
//               >
//                 <Home size={32} />
//               </motion.div>
//               <div className="text-white">
//                 <h1 className="text-3xl font-bold">My Properties</h1>
//                 <p className="text-blue-100 font-medium">Manage your accommodations and rooms effortlessly</p>
//               </div>
//             </div>
//           </div>

//           <div className="p-8">
//             <div className={hasRooms ? "grid lg:grid-cols-2 gap-8" : ""}>
//               {/* Accommodations Section */}
//               <motion.section
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//                 className={hasRooms ? "lg:col-span-1" : ""}
//               >
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-2 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
//                     <Building2 size={24} />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-800">Accommodations</h2>
//                 </div>
//                 {accommodations.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {accommodations.map((item, index) => (
//                       <motion.div
//                         key={item.propertyId}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.1, duration: 0.5 }}
//                         whileHover={{ y: -4, scale: 1.02 }}
//                         className="group bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-blue-200"
//                       >
//                         <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//                           <MapPin size={48} className="text-blue-500 opacity-60 group-hover:opacity-100 transition" />
//                         </div>
//                         <div className="p-6">
//                           <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-1">
//                             {item.propertyName}
//                           </h3>
//                           <div className="space-y-2 mb-4">
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <Bed size={16} className="text-blue-500" />
//                               Flat/Room: {item.roomName}
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <MapPin size={16} className="text-green-500" />
//                               {item.propertyCity}, {item.propertyAddress}
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <DollarSign size={16} className="text-yellow-500" />
//                               Rent: ₹{item.rentAmount.toLocaleString()}
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <DollarSign size={16} className="text-orange-500" />
//                               Security: ₹{item.securityDeposit.toLocaleString()}
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <Calendar size={16} className="text-purple-500" />
//                               Move-in: {new Date(item.moveInDate).toLocaleDateString('en-IN')}
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 ) : (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="text-center py-12 bg-gray-50 rounded-2xl"
//                   >
//                     <Building2 size={64} className="mx-auto mb-4 text-gray-300" />
//                     <h3 className="text-lg font-semibold text-gray-600 mb-2">No Accommodations Yet</h3>
//                     <p className="text-gray-500">Your properties will appear here once added.</p>
//                   </motion.div>
//                 )}
//               </motion.section>

//               {/* Rooms Section */}
//               {hasRooms && (
//                 <motion.section
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.4, duration: 0.5 }}
//                   className="lg:col-span-1"
//                 >
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="p-2 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
//                       <Bed size={24} />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800">My Rooms</h2>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {rooms.map((room, idx) => (
//                       <motion.div
//                         key={idx}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: idx * 0.1, duration: 0.5 }}
//                         whileHover={{ y: -4, scale: 1.02 }}
//                         className="group bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-green-200"
//                       >
//                         <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
//                           <Bed size={48} className="text-green-500 opacity-60 group-hover:opacity-100 transition" />
//                         </div>
//                         <div className="p-6">
//                           <h3 className="font-bold text-xl text-gray-800 mb-3">
//                             {room.roomName}
//                           </h3>
//                           <div className="space-y-3">
//                             <div className="flex items-center justify-between text-sm">
//                               <span className="text-gray-600 flex items-center gap-2">
//                                 <Building2 size={16} className="text-blue-500" />
//                                 Status
//                               </span>
//                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                 room.status === 'Active' || room.isActive
//                                   ? 'bg-green-100 text-green-800'
//                                   : 'bg-gray-100 text-gray-800'
//                               }`}>
//                                 {room.status ? room.status : (room.isActive ? "Active" : "Inactive")}
//                               </span>
//                             </div>
//                             {room.floor !== undefined && room.floor !== null && room.floor !== "" && (
//                               <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <Building2 size={16} className="text-purple-500" />
//                                 Floor: {room.floor}
//                               </div>
//                             )}
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <DollarSign size={16} className="text-yellow-500" />
//                               Rent: ₹{room.rentAmount ? room.rentAmount.toLocaleString() : "N/A"}
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </motion.section>
//               )}
//             </div>

//             {/* Back Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6, duration: 0.5 }}
//               className="mt-12 flex justify-center"
//             >
//               <Link
//                 to="/tenant"
//                 className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-green-500 hover:via-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 <span>⬅</span>
//                 Back to Dashboard
//               </Link>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bed,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  Wifi,
  Car,
  Dumbbell,
  ChefHat,
  Bath,
  ArrowRight,
  Sparkles,
  Shield,
  Star,
  CheckCircle,
  Users,
  TreePine,
  Square,
  Heart,
  Eye,
  ChevronRight,
  Plus,
  Filter,
  Search,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../User_Section/Context/AuthContext";

export default function PropertyPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [accommodations, setAccommodations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("accommodations");
  const [favoriteProperties, setFavoriteProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        setError("No authentication token found. Please log in.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const accRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (accRes.data.success) {
          setAccommodations(accRes.data.accommodations || []);

          const tenantId =
            accRes.data.accommodations?.[0]?.tenantId ||
            localStorage.getItem("tenantId");

          if (tenantId) localStorage.setItem("tenantId", tenantId);

          if (tenantId) {
            const roomsRes = await axios.get(
              `https://api.gharzoreality.com/api/tenant/${tenantId}/my-rooms`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (roomsRes.data.success) {
              setRooms(roomsRes.data.rooms || []);
            }
          }
        } else {
          setError(accRes.data.message || "Failed to fetch accommodations.");
          if (accRes.data.error === "User is not a registered tenant") {
            localStorage.removeItem("tenanttoken");
            logout();
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching data."
        );
        if (err.response?.data?.error === "User is not a registered tenant") {
          localStorage.removeItem("tenanttoken");
          logout();
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, logout]);

  const hasRooms = rooms.length > 0;
  const totalProperties = accommodations.length;
  const totalRooms = rooms.length;
  const totalRent = accommodations.reduce(
    (sum, acc) => sum + (acc.rentAmount || 0),
    0
  );

  const toggleFavorite = (propertyId) => {
    setFavoriteProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-spin opacity-20"></div>
          <div className="absolute inset-4 rounded-full bg-white shadow-lg"></div>
          <Building2
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500"
            size={32}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-xl font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Loading your properties...
        </motion.p>
        <p className="mt-2 text-gray-500">
          Fetching the finest details for you
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative overflow-hidden bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full"></div>

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-3xl font-bold">!</span>
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login", { replace: true })}
              className="relative overflow-hidden group w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles size={20} />
                Go to Login
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white ">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col bg-white px-10 rounded shadow-md py-3 lg:flex-row lg:items-center justify-between  gap-6 mb-8">
            <div className="">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text py-1 text-transparent">
                My Properties
              </h1>
              <p className="text-gray-600 mt-2">Manage your accommodations and rooms with ease</p>
            </div>
            
           
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 px-10 gap-8">
            <motion.div
              whileHover={{ scale: 1.04, y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-500 shadow-xl"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                      Total Properties
                    </p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                      {totalProperties}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp size={16} className="text-green-500" />
                      <span className="text-green-600 text-sm font-medium">
                        +2 this month
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-400/40">
                    <Building2 className="text-white" size={30} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.04, y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-3xl p-[1px] bg-gradient-to-br from-purple-400 via-pink-400 to-fuchsia-500 shadow-xl"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
                      Total Rooms
                    </p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                      {totalRooms}
                    </p>
                    <p className="text-gray-500 text-sm mt-3">
                      Available for occupancy
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-400/40">
                    <Bed className="text-white" size={30} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.04, y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-3xl p-[1px] bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400 shadow-xl"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-600 text-sm font-semibold uppercase tracking-wide">
                      Monthly Rent
                    </p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                      ₹{totalRent.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm mt-3">
                      Total monthly payment
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-400/40">
                    <DollarSign className="text-white" size={30} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex space-x-1 px-8 pt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("accommodations")}
                className={`relative px-6 py-4 font-medium rounded-t-xl transition-all ${
                  activeTab === "accommodations"
                    ? "text-purple-600 bg-gradient-to-b from-white to-purple-50"
                    : "text-gray-500 hover:text-purple-500 hover:bg-gray-50"
                }`}
              >
                Accommodations
                {activeTab === "accommodations" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                )}
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {accommodations.length}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("rooms")}
                className={`relative px-6 py-4 font-medium rounded-t-xl transition-all ${
                  activeTab === "rooms"
                    ? "text-pink-600 bg-gradient-to-b from-white to-pink-50"
                    : "text-gray-500 hover:text-pink-500 hover:bg-gray-50"
                }`}
              >
                Rooms
                {activeTab === "rooms" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                )}
                <span className="ml-2 px-2 py-1 text-xs bg-pink-100 text-pink-600 rounded-full">
                  {rooms.length}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Accommodations Tab */}
              {activeTab === "accommodations" && (
                <motion.div
                  key="accommodations"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {accommodations.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      {accommodations.map((item, index) => (
                        <motion.div
                          key={item.propertyId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -6 }}
                          className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                          {/* Property Image Header */}
                          <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Building2
                                size={64}
                                className="text-blue-300 group-hover:text-blue-400 transition-all duration-300"
                              />
                            </div>

                            {/* Top Badges */}
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1">
                                <CheckCircle size={12} /> Active
                              </span>
                            </div>

                            {/* Favorite Button */}
                            <button
                              onClick={() => toggleFavorite(item.propertyId)}
                              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                            >
                              <Heart
                                size={20}
                                className={`transition-colors ${
                                  favoriteProperties.includes(item.propertyId)
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-400 hover:text-red-400"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="p-6">
                            {/* Property Info */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                                  {item.propertyName}
                                </h3>
                                <motion.div
                                  whileHover={{ rotate: 90 }}
                                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gradient-to-r from-blue-400 to-purple-400 transition-all"
                                >
                                  <ArrowRight
                                    size={20}
                                    className="text-gray-500 group-hover:text-white"
                                  />
                                </motion.div>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <MapPin size={16} />
                                <span className="text-sm">
                                  {item.propertyCity}, {item.propertyAddress}
                                </span>
                              </div>
                            </div>

                            {/* Price Section */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                                <p className="text-blue-600 text-sm font-medium">
                                  Monthly Rent
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                  ₹{item.rentAmount?.toLocaleString() || "0"}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                                <p className="text-purple-600 text-sm font-medium">
                                  Security
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                  ₹
                                  {item.securityDeposit?.toLocaleString() ||
                                    "0"}
                                </p>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center gap-3">
                                <Bed size={18} className="text-blue-500" />
                                <span className="text-gray-700">
                                  Flat/Room: {item.roomName}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar
                                  size={18}
                                  className="text-purple-500"
                                />
                                <span className="text-gray-700">
                                  Move-in:{" "}
                                  {new Date(item.moveInDate).toLocaleDateString(
                                    "en-IN"
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Facilities */}
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium flex items-center gap-1">
                                <Wifi size={12} /> WiFi
                              </span>
                              <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium flex items-center gap-1">
                                <Car size={12} /> Parking
                              </span>
                              <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium flex items-center gap-1">
                                <Dumbbell size={12} /> Gym
                              </span>
                            </div>
                          </div>

                          {/* Hover Effect Border */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200"
                    >
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <Building2 size={48} className="text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        No Accommodations Yet
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Your properties will appear here once they are added to
                        your portfolio.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                      >
                        <Plus size={20} />
                        Add New Property
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Rooms Tab */}
              {activeTab === "rooms" && (
                <motion.div
                  key="rooms"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {hasRooms ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rooms.map((room, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ y: -4 }}
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl"
                        >
                          <div className="p-6">
                            {/* Room Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                  <Bed size={24} className="text-purple-500" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800">
                                    {room.roomName}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        room.status === "Active" ||
                                        room.isActive
                                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-600"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {room.status
                                        ? room.status
                                        : room.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                    {room.floor && (
                                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">
                                        Floor {room.floor}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Room Details */}
                            <div className="space-y-4 mb-6">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  Monthly Rent
                                </span>
                                <span className="text-2xl font-bold text-gray-800">
                                  ₹
                                  {room.rentAmount
                                    ? room.rentAmount.toLocaleString()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Area</span>
                                <span className="font-medium text-gray-800">
                                  {room.area || "N/A"} sq.ft
                                </span>
                              </div>
                            </div>

                            {/* Room Features */}
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs flex items-center gap-1">
                                <Bath size={12} /> Attached Bath
                              </span>
                              <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs flex items-center gap-1">
                                <ChefHat size={12} /> Kitchenette
                              </span>
                            </div>
                          </div>

                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-pink-50 to-white rounded-2xl border-2 border-dashed border-pink-200"
                    >
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 flex items-center justify-center">
                        <Bed size={48} className="text-pink-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        No Rooms Available
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-8">
                        You don't have any rooms assigned yet. Rooms will appear
                        here once allocated.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="px-8 pb-8 border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield size={20} className="text-blue-500" />
                <span className="text-sm">
                  All properties are verified and secure
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/tenant"
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <motion.span
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⬅
                  </motion.span>
                  Back to Dashboard
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                  View All Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
