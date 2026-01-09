import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaWifi,
  FaTv,
  FaFan,
  FaShower,
  FaUtensils,
  FaCouch,
  FaParking,
  FaSnowflake,
  FaDumbbell,
  FaSwimmingPool,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaUser,
  FaPhoneAlt,
  FaMapSigns,
  FaCity,
  FaGlobe,
  FaMapPin,
  FaCalendarAlt,
  FaBuilding,
  FaListUl,
  FaRupeeSign,
} from "react-icons/fa";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

const amenityIcons = {
  wifi: <FaWifi className="text-blue-500 mr-2" />,
  tv: <FaTv className="text-purple-500 mr-2" />,
  fan: <FaFan className="text-yellow-500 mr-2" />,
  shower: <FaShower className="text-cyan-500 mr-2" />,
  kitchen: <FaUtensils className="text-green-500 mr-2" />,
  sofa: <FaCouch className="text-pink-500 mr-2" />,
  parking: <FaParking className="text-orange-500 mr-2" />,
  "air conditioning": <FaSnowflake className="text-blue-400 mr-2" />,
  gym: <FaDumbbell className="text-red-500 mr-2" />,
  "swimming pool": <FaSwimmingPool className="text-indigo-500 mr-2" />,
  "24x7 water": <FaShower className="text-cyan-500 mr-2" />,
  cctv: <FaCheckCircle className="text-green-500 mr-2" />,
};

const SellerPropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch property details, images, and reels
  useEffect(() => {
    const fetchPropertyAndImagesAndReels = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("sellertoken");
        if (!token) throw new Error("No authentication token found.");

        // Fetch property details
        const propertyRes = await axios.get(
          `${baseurl}api/seller/getproperties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (propertyRes.data && Array.isArray(propertyRes.data.properties)) {
          const found = propertyRes.data.properties.find((p) => p._id === id);
          setProperty(found);

          // Fetch images for the specific property
          if (found) {
            const imageRes = await axios.get(
              `${baseurl}api/seller/get-image/${id}/images`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (imageRes.data.success && Array.isArray(imageRes.data.images)) {
              setImages(imageRes.data.images);
            } else {
              setImages([]);
            }

            // Fetch reels for the specific property
            const reelsRes = await axios.get(
              `${baseurl}api/seller/${id}/reels`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (reelsRes.data.success && Array.isArray(reelsRes.data.reels)) {
              setReels(reelsRes.data.reels);
            } else {
              setReels([]);
            }
          }
        } else {
          setProperty(null);
          setImages([]);
          setReels([]);
        }
      } catch (err) {
        console.error("Error fetching property, images, or reels:", err);
        setProperty(null);
        setImages([]);
        setReels([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyAndImagesAndReels();
    }
  }, [id]);

  // Set form data for editing
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        type: property.type || "",
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        pinCode: property.pinCode || "",
        landmark: property.landmark || "",
        contactNumber: property.contactNumber || "",
        ownerName: property.ownerName || "",
        description: property.description || "",
        amenities: property.amenities ? property.amenities.join(", ") : "",
        latitude: property.latitude || "",
        longitude: property.longitude || "",
      });
    }
  }, [property]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("No authentication token found.");

      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      const body = {
        ...formData,
        amenities: amenitiesArray,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const res = await axios.put(
        `${baseurl}api/seller/edit-property/${property.propertyId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setProperty(res.data.property);
        setEditing(false);
      }
    } catch (err) {
      console.error("Error updating property:", err);
      // You can add a toast or alert here for user feedback
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const token = localStorage.getItem("sellertoken");
      if (!token) throw new Error("No authentication token found.");

      const res = await axios.delete(
        `${baseurl}api/seller/delete-property/${property.propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      // You can add a toast or alert here for user feedback
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-4 text-center text-indigo-600 text-xl">
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-24 px-4 text-center text-red-600 text-xl">
        Property not found.
      </div>
    );
  }

  // Helper for amenities
  const renderAmenity = (item, idx) => (
    <motion.div
      key={idx}
      whileHover={{ scale: 1.05 }}
      className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm"
    >
      {amenityIcons[item.toLowerCase()] || (
        <FaCheckCircle className="text-green-500 mr-2" />
      )}
      <span className="text-gray-700">{item}</span>
    </motion.div>
  );

  // return (
  //   <div className="pt-24 px-4 md:px-10 min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900">
  //     <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
  //       {/* Main Content */}
  //       <motion.div
  //         initial={{ opacity: 0, y: 50 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         transition={{ duration: 0.6 }}
  //         className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
  //       >
  //         <button
  //           onClick={() => navigate(-1)}
  //           className="text-blue-600 px-4 py-2 hover:underline font-medium"
  //         >
  //           &larr; Back
  //         </button>

  //         {/* Images */}
  //         <div className="w-full flex flex-row flex-wrap gap-4 justify-center items-center py-4 px-6">
  //           {images.length > 0 ? (
  //             images.map((img, idx) => (
  //               <motion.img
  //                 key={idx}
  //                 src={`${baseurl}${img}`} // Prepend baseurl to image path
  //                 alt={property.name || "Property Image"}
  //                 className="h-64 w-96 object-cover rounded-lg shadow-md border border-gray-200"
  //                 onError={(e) => {
  //                   e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
  //                 }}
  //                 whileHover={{ scale: 1.02 }}
  //                 transition={{ type: "spring", stiffness: 100 }}
  //               />
  //             ))
  //           ) : (
  //             <motion.img
  //               src="https://via.placeholder.com/800x400?text=No+Image"
  //               alt="Property"
  //               className="h-64 w-96 object-cover rounded-lg shadow-md border border-gray-200"
  //             />
  //           )}
  //         </div>

  //         <div className="flex justify-end gap-3 pr-6 pt-4">
  //           <button
  //             onClick={() => setEditing(true)}
  //             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  //           >
  //             Edit
  //           </button>
  //           <button
  //             onClick={handleDelete}
  //             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
  //           >
  //             Delete
  //           </button>
  //         </div>

  //         {editing ? (
  //           <form onSubmit={handleSubmit} className="p-6 space-y-6">
  //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //               <div>
  //                 <label className="block text-gray-700">Name</label>
  //                 <input
  //                   name="name"
  //                   value={formData.name}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Type</label>
  //                 <input
  //                   name="type"
  //                   value={formData.type}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Address</label>
  //                 <input
  //                   name="address"
  //                   value={formData.address}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">City</label>
  //                 <input
  //                   name="city"
  //                   value={formData.city}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">State</label>
  //                 <input
  //                   name="state"
  //                   value={formData.state}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Pin Code</label>
  //                 <input
  //                   name="pinCode"
  //                   value={formData.pinCode}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Landmark</label>
  //                 <input
  //                   name="landmark"
  //                   value={formData.landmark}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Contact Number</label>
  //                 <input
  //                   name="contactNumber"
  //                   value={formData.contactNumber}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Owner Name</label>
  //                 <input
  //                   name="ownerName"
  //                   value={formData.ownerName}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   required
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Latitude</label>
  //                 <input
  //                   name="latitude"
  //                   value={formData.latitude}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   type="number"
  //                   step="any"
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-gray-700">Longitude</label>
  //                 <input
  //                   name="longitude"
  //                   value={formData.longitude}
  //                   onChange={handleChange}
  //                   className="w-full border border-gray-300 p-2 rounded"
  //                   type="number"
  //                   step="any"
  //                 />
  //               </div>
  //             </div>
  //             <div>
  //               <label className="block text-gray-700">Amenities (comma separated)</label>
  //               <input
  //                 name="amenities"
  //                 value={formData.amenities}
  //                 onChange={handleChange}
  //                 className="w-full border border-gray-300 p-2 rounded"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-gray-700">Description</label>
  //               <textarea
  //                 name="description"
  //                 value={formData.description}
  //                 onChange={handleChange}
  //                 className="w-full border border-gray-300 p-2 rounded h-32"
  //               />
  //             </div>
  //             <div className="flex gap-3">
  //               <button
  //                 type="submit"
  //                 className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
  //               >
  //                 Save
  //               </button>
  //               <button
  //                 type="button"
  //                 onClick={() => setEditing(false)}
  //                 className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
  //               >
  //                 Cancel
  //               </button>
  //             </div>
  //           </form>
  //         ) : (
  //           <div className="p-6 space-y-6">
  //             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
  //               <FaBuilding className="text-indigo-500" />
  //               {property.name || "Untitled Property"}
  //               <span className="ml-2 text-base font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
  //                 {property.type || "N/A"}
  //               </span>
  //             </h2>
  //             <div className="flex flex-wrap gap-4 text-gray-600 text-lg items-center">
  //               <span className="flex items-center">
  //                 <FaMapMarkerAlt className="mr-2 text-blue-500" />
  //                 {property.address || "No address provided"}
  //               </span>
  //               <span className="flex items-center">
  //                 <FaCity className="mr-2 text-pink-500" />
  //                 {property.city || "N/A"}
  //               </span>
  //               <span className="flex items-center">
  //                 <FaGlobe className="mr-2 text-green-500" />
  //                 {property.state || "N/A"}
  //               </span>
  //               <span className="flex items-center">
  //                 <FaMapPin className="mr-2 text-gray-500" />
  //                 {property.pinCode || "N/A"}
  //               </span>
  //               {property.landmark && (
  //                 <span className="flex items-center">
  //                   <FaMapSigns className="mr-2 text-yellow-500" />
  //                   {property.landmark}
  //                 </span>
  //               )}
  //             </div>
  //             <div className="flex flex-wrap gap-4 text-gray-600 text-lg items-center">
  //               <span className="flex items-center">
  //                 <FaUser className="mr-2 text-indigo-500" />
  //                 Owner: {property.ownerName || "N/A"}
  //               </span>
  //               <span className="flex items-center">
  //                 <FaPhoneAlt className="mr-2 text-green-600" />
  //                 {property.contactNumber || "N/A"}
  //               </span>
  //             </div>
  //             <p className="text-2xl font-semibold text-green-600">
  //               ₹ {property.price ? property.price.toLocaleString() : "N/A"}
  //             </p>

  //             {/* Description */}
  //             <div>
  //               <h3 className="text-xl font-semibold text-gray-900">Description</h3>
  //               <hr className="my-2 border-gray-300" />
  //               <p className="text-gray-600">
  //                 {property.description || "No description available."}
  //               </p>
  //             </div>

  //             {/* Amenities */}
  //             {property.amenities?.length > 0 && (
  //               <div>
  //                 <h3 className="text-xl font-semibold text-gray-900 mb-3">
  //                   Amenities
  //                 </h3>
  //                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
  //                   {property.amenities.map(renderAmenity)}
  //                 </div>
  //               </div>
  //             )}

  //             {/* Property Stats */}
  //             <div>
  //               <h3 className="text-xl font-semibold text-gray-900 mb-3">
  //                 Property Details
  //               </h3>
  //               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
  //                 <div className="flex items-center gap-2">
  //                   <FaBed className="text-[#5c4eff]" /> Beds:{" "}
  //                   {property.totalBeds || "N/A"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaBath className="text-[#5c4eff]" /> Rooms:{" "}
  //                   {property.totalRooms || "N/A"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaRulerCombined className="text-[#5c4eff]" /> Capacity:{" "}
  //                   {property.totalCapacity || "N/A"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaListUl className="text-[#5c4eff]" /> Occupied:{" "}
  //                   {property.occupiedSpace || "N/A"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaRupeeSign className="text-[#5c4eff]" /> Monthly Collection: ₹
  //                   {property.monthlyCollection || "N/A"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaRupeeSign className="text-[#f59e0b]" /> Pending Dues: ₹
  //                   {property.pendingDues || "N/A"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaCalendarAlt className="text-[#5c4eff]" /> Created:{" "}
  //                   {property.createdAt
  //                     ? new Date(property.createdAt).toLocaleDateString()
  //                     : "-"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaCalendarAlt className="text-[#5c4eff]" /> Updated:{" "}
  //                   {property.updatedAt
  //                     ? new Date(property.updatedAt).toLocaleDateString()
  //                     : "-"}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <FaCheckCircle
  //                     className={
  //                       property.isActive ? "text-green-500" : "text-red-500"
  //                     }
  //                   />
  //                   {property.isActive ? "Active" : "Inactive"}
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Map */}
  //             <div>
  //               <h3 className="text-xl font-semibold text-gray-900 mb-3">
  //                 Location Map
  //               </h3>
  //               <div className="w-full h-72 rounded-lg overflow-hidden shadow-md border border-gray-200">
  //                 <iframe
  //                   title="Property Location"
  //                   className="w-full h-full"
  //                   loading="lazy"
  //                   allowFullScreen
  //                   src={`https://www.google.com/maps?q=${encodeURIComponent(
  //                     property.latitude && property.longitude
  //                       ? `${property.latitude},${property.longitude}`
  //                       : property.address || "India"
  //                   )}&output=embed`}
  //                 ></iframe>
  //               </div>
  //             </div>

  //             {/* Ratings & Comments */}
  //             <div>
  //               <h3 className="text-xl font-semibold text-gray-900 mb-3">
  //                 Ratings & Comments
  //               </h3>
  //               <div className="flex flex-wrap gap-4 items-center">
  //                 <span className="text-lg">
  //                   <FaCheckCircle className="text-yellow-400 mr-1 inline" />
  //                   Average Rating:{" "}
  //                   {property.ratingSummary?.averageRating || 0} / 5
  //                 </span>
  //                 <span className="text-lg">
  //                   Total Ratings: {property.ratingSummary?.totalRatings || 0}
  //                 </span>
  //                 <span className="text-lg">
  //                   Comments: {property.commentCount || 0}
  //                 </span>
  //               </div>
  //             </div>

  //             {/* Reels */}
  //             <div>
  //               <h3 className="text-xl font-semibold text-gray-900 mb-3">
  //                 Reels
  //               </h3>
  //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                 {reels.length > 0 ? (
  //                   reels.map((reel, idx) => (
  //                     <video
  //                       key={idx}
  //                       controls
  //                       poster={reel.thumbnailUrl}
  //                       src={reel.videoUrl}
  //                       className="w-full h-64 object-cover rounded-lg shadow-md"
  //                     >
  //                       Your browser does not support the video tag.
  //                     </video>
  //                   ))
  //                 ) : (
  //                   <p className="text-gray-600">No reels available for this property.</p>
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //       </motion.div>
  //     </div>
  //   </div>
  // );

return (
  <div className="pt-24 px-4 md:px-10 min-h-screen bg-gray-100 text-gray-900">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
      >
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 text-orange-600 font-medium hover:underline"
        >
          ← Back
        </button>

        {/* IMAGES */}
        <div className="flex flex-wrap justify-center gap-4 px-6 py-4">
          {images.length > 0 ? (
            images.map((img, idx) => (
              <motion.img
                key={idx}
                src={`${baseurl}${img}`}
                alt={property.name || "Property Image"}
                className="h-64 w-96 object-cover rounded-xl shadow border border-gray-200"
                whileHover={{ scale: 1.03 }}
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/800x400?text=No+Image")
                }
              />
            ))
          ) : (
            <img
              src="https://via.placeholder.com/800x400?text=No+Image"
              className="h-64 w-96 object-cover rounded-xl shadow border border-gray-200"
            />
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 px-6 pb-4">
          <button
            onClick={() => setEditing(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-semibold"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-semibold"
          >
            Delete
          </button>
        </div>

        {/* VIEW MODE */}
        {!editing && (
          <div className="p-6 space-y-8">

            {/* TITLE */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100">
                <FaBuilding className="text-orange-600 text-xl" />
              </div>
              <h2 className="text-3xl font-bold">
                {property.name || "Untitled Property"}
              </h2>
              <span className="text-sm font-semibold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                {property.type || "N/A"}
              </span>
            </div>

            {/* LOCATION */}
            <div className="flex flex-wrap gap-4 text-gray-700">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" />
                {property.address}
              </span>
              <span className="flex items-center gap-2">
                <FaCity className="text-orange-500" />
                {property.city}
              </span>
              <span className="flex items-center gap-2">
                <FaMapPin className="text-orange-500" />
                {property.pinCode}
              </span>
            </div>

            {/* OWNER */}
            <div className="flex flex-wrap gap-6 text-gray-700">
              <span className="flex items-center gap-2">
                <FaUser className="text-orange-500" />
                Owner: {property.ownerName}
              </span>
              <span className="flex items-center gap-2">
                <FaPhoneAlt className="text-orange-500" />
                {property.contactNumber}
              </span>
            </div>

            {/* PRICE */}
            <p className="text-2xl font-bold text-orange-600">
              ₹ {property.price?.toLocaleString() || "N/A"}
            </p>

            {/* DESCRIPTION */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-600">
                {property.description || "No description available."}
              </p>
            </div>

            {/* AMENITIES */}
            {property.amenities?.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map(renderAmenity)}
                </div>
              </div>
            )}

            {/* STATS */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Property Details</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
                <div><FaBed className="inline mr-2 text-orange-500" />Beds: {property.totalBeds}</div>
                <div><FaBath className="inline mr-2 text-orange-500" />Rooms: {property.totalRooms}</div>
                <div><FaRulerCombined className="inline mr-2 text-orange-500" />Capacity: {property.totalCapacity}</div>
                <div><FaListUl className="inline mr-2 text-orange-500" />Occupied: {property.occupiedSpace}</div>
                <div><FaRupeeSign className="inline mr-2 text-orange-500" />Monthly: ₹{property.monthlyCollection}</div>
                <div>
                  <FaCheckCircle
                    className={`inline mr-2 ${
                      property.isActive ? "text-orange-500" : "text-gray-400"
                    }`}
                  />
                  {property.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* MAP */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Location Map</h3>
              <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  className="w-full h-full"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                />
              </div>
            </div>

            {/* RATINGS */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Ratings & Comments</h3>
              <div className="flex flex-wrap gap-6 text-gray-700">
                <span>⭐ {property.ratingSummary?.averageRating || 0} / 5</span>
                <span>Ratings: {property.ratingSummary?.totalRatings || 0}</span>
                <span>Comments: {property.commentCount || 0}</span>
              </div>
            </div>

            {/* REELS */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Reels</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {reels.length > 0 ? (
                  reels.map((reel, idx) => (
                    <video
                      key={idx}
                      controls
                      src={reel.videoUrl}
                      poster={reel.thumbnailUrl}
                      className="rounded-xl shadow"
                    />
                  ))
                ) : (
                  <p className="text-gray-500">No reels available.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </motion.div>
    </div>
  </div>
);

};

export default SellerPropertyDetail;