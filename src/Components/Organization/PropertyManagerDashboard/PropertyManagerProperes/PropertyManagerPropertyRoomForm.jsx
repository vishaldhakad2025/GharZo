import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaImage,
  FaTimes,
  FaArrowLeft,
  FaToggleOn,
  FaRupeeSign,
  FaUsers,
  FaBed,
  FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ==================== MAPPINGS (UNCHANGED) ====================
const facilityKeyMapping = {
  roomEssentials: { Bed: "bed", Table: "tableStudyDesk", Chair: "chair", Fan: "fan", Light: "light", Lamp: "chargingPoint", Wardrobe: "cupboardWardrobe" },
  comfortFeatures: { "Air Conditioner": "ac", Geyser: "geyser", Heater: "heater", TV: "tv", Fridge: "cooler", Sofa: "sofa", Mattress: "mattress" },
  washroomHygiene: { Toilet: "westernToilet", Shower: "shower", Sink: "washBasins", Mirror: "mirror", "Western Toilet": "westernToilet", Towels: "bucketMug", Toiletries: "toiletries", "Attached Bathroom": "attachedBathroom" },
  utilitiesConnectivity: { WiFi: "wifi", "Power Backup": "powerBackup", "Water Supply": "water24x7", Electricity: "electricityIncluded", Internet: "wifi" },
  laundryHousekeeping: { "Washing Machine": "washingMachine", Dryer: "dryingSpace", "Cleaning Service": "cleaningService", Iron: "ironTable", Laundry: "laundryArea", Housekeeping: "cleaningService" },
  securitySafety: { CCTV: "cctv", "Fire Extinguisher": "fireSafety", "First Aid Kit": "fireSafety", "Security Guard": "securityGuard", "Smoke Alarm": "fireSafety" },
  parkingTransport: { Parking: "carParking", "Bike Parking": "bikeParking", "Car Parking": "carParking", "Public Transport Access": "nearBus" },
  propertySpecific: { Lift: "liftAvailable", Gym: "gym", Kitchen: "modularKitchen", "Common Area": "hall", Balcony: "balcony", Terrace: "terrace", Garden: "garden" },
  nearbyFacilities: { Hospital: "hospital", School: "schoolCollege", Market: "marketMall", Metro: "nearMetro", "Bus Stop": "nearBus", Restaurant: "marketMall" },
};
const amenitiesOptions = {
  roomEssentials: ["Bed", "Table", "Chair", "Fan", "Light", "Lamp", "Wardrobe"],
  comfortFeatures: ["Air Conditioner", "Geyser", "Heater", "TV", "Fridge", "Sofa", "Mattress"],
  washroomHygiene: ["Toilet", "Shower", "Sink", "Mirror", "Western Toilet", "Towels", "Toiletries", "Attached Bathroom"],
  utilitiesConnectivity: ["WiFi", "Power Backup", "Water Supply", "Electricity", "Internet"],
  laundryHousekeeping: ["Washing Machine", "Dryer", "Cleaning Service", "Iron", "Laundry", "Housekeeping"],
  securitySafety: ["CCTV", "Fire Extinguisher", "First Aid Kit", "Security Guard", "Smoke Alarm"],
  parkingTransport: ["Parking", "Bike Parking", "Car Parking", "Public Transport Access"],
  propertySpecific: ["Lift", "Gym", "Kitchen", "Common Area", "Balcony", "Terrace", "Garden"],
  nearbyFacilities: ["Hospital", "School", "Market", "Metro", "Bus Stop", "Restaurant"],
};
const initialFacilities = Object.keys(facilityKeyMapping).reduce((acc, category) => {
  acc[category] = Object.keys(facilityKeyMapping[category]).reduce((catAcc, frontendKey) => {
    catAcc[facilityKeyMapping[category][frontendKey]] = false;
    return catAcc;
  }, {});
  return acc;
}, {});

// ==================== MAIN COMPONENT ====================
function PropertyManagerPropertyRoomForm() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState({
    name: "", type: "", price: "", capacity: "", status: "Available",
    facilities: initialFacilities, images: []
  });
  const [previewItems, setPreviewItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [focusedField, setFocusedField] = useState("");
  const getToken = () => localStorage.getItem("token");
  const MAX_IMAGES = 10;

  // Focus/Blur Styling Helpers
  const getFieldStyle = (field) =>
    `flex items-center border rounded-lg px-3 py-2 transition-all ${
      focusedField === field
        ? "border-blue-500 shadow-md"
        : "border-gray-300"
    }`;
  const getIconStyle = (field) => ({
    color: focusedField === field ? "#3B82F6" : "#9CA3AF",
    marginRight: "8px"
  });

  // Cleanup local URLs
  useEffect(() => {
    return () => {
      previewItems
        .filter(p => p.type === 'local')
        .forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [previewItems]);

  // Handle input changes
  const handleRoomChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentLocalCount = previewItems.filter(p => p.type === 'local').length;
    const availableSlots = MAX_IMAGES - currentLocalCount;
    if (files.length > availableSlots) {
      toast.warn(`Only ${availableSlots} more images allowed!`);
      files.splice(availableSlots);
    }
    previewItems
      .filter(p => p.type === 'local')
      .forEach(p => URL.revokeObjectURL(p.url));
    const newPreviews = files.map((file, i) => ({
      id: `local-${Date.now()}-${i}`,
      type: 'local',
      url: URL.createObjectURL(file),
      file
    }));
    setPreviewItems(prev => [
      ...prev.filter(p => p.type === 'uploaded'),
      ...newPreviews
    ]);
    setRoomData(prev => ({
      ...prev,
      images: [...prev.images.filter(f => !files.includes(f)), ...files]
    }));
  };

  // Unified Remove Image
  const handleRemoveImage = async (item) => {
    if (item.type === 'local') {
      URL.revokeObjectURL(item.url);
      setPreviewItems(prev => prev.filter(p => p.id !== item.id));
      setRoomData(prev => ({
        ...prev,
        images: prev.images.filter(f => f !== item.file)
      }));
    } else if (item.type === 'uploaded' && roomId) {
      try {
        const token = getToken();
        await axios.delete(
          `https://api.gharzoreality.com/api/pm/rooms/${propertyId}/rooms/${roomId}/images`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { imageUrl: item.url }
          }
        );
        setPreviewItems(prev => prev.filter(p => p.id !== item.id));
        toast.success("Image deleted successfully!");
      } catch (err) {
        console.error("Delete image error:", err);
        toast.error(err.response?.data?.message || "Failed to delete image.");
      }
    }
  };

  // Toggle facility
  const handleFacilityToggle = (category, frontendKey) => {
    const backendKey = facilityKeyMapping[category][frontendKey];
    setRoomData(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [category]: {
          ...prev.facilities[category],
          [backendKey]: !prev.facilities[category][backendKey]
        }
      }
    }));
  };

  // Submit form
  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomData.name || !roomData.price || !roomData.capacity || !roomData.type) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      setLoading(true);
      const token = getToken();
      const facilities = {};
      Object.entries(roomData.facilities).forEach(([cat, items]) => {
        const selected = Object.fromEntries(Object.entries(items).filter(([_, v]) => v));
        if (Object.keys(selected).length) facilities[cat] = selected;
      });
      const roomRes = await axios.post(
        `https://api.gharzoreality.com/api/pm/properties/${propertyId}/rooms`,
        [{
          name: roomData.name,
          type: roomData.type,
          price: Number(roomData.price),
          capacity: Number(roomData.capacity),
          status: roomData.status,
          facilities
        }],
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const createdRoomId = roomRes.data.addedRooms[0].roomId;
      setRoomId(createdRoomId);
      if (roomData.images.length > 0) {
        const formData = new FormData();
        roomData.images.forEach(file => formData.append("images", file));
        const uploadRes = await axios.post(
          `https://api.gharzoreality.com/api/pm/rooms/${propertyId}/rooms/${createdRoomId}/images`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const uploadedUrls = uploadRes.data.images || [];
        const uploadedPreviews = uploadedUrls.map((url, i) => ({
          id: `uploaded-${Date.now()}-${i}`,
          type: 'uploaded',
          url
        }));
        setPreviewItems(uploadedPreviews);
        toast.success("Room & Images Added Successfully!");
      } else {
        setPreviewItems([]);
        toast.success("Room Added Successfully!");
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add room!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    previewItems
      .filter(p => p.type === 'local')
      .forEach(p => URL.revokeObjectURL(p.url));
    setRoomData({
      name: "", type: "", price: "", capacity: "", status: "Available",
      facilities: initialFacilities, images: []
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-white">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-4xl mx-auto">
        {/* Back Button + Title */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
          >
            <FaArrowLeft className="w-5 h-5" />
            Back
          </button>
          <motion.h1 className="text-4xl font-bold text-center text-black">
            Add Room
          </motion.h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
            Room Details
          </h2>
          <form onSubmit={handleAddRoom} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ====== ALL FIELDS NOW WITH ICONS & FOCUS STYLE ====== */}
              
              {/* Room Name */}
              <div>
                <label className="block font-semibold mb-1">Room Name</label>
                <div className={getFieldStyle("name")}>
                  <FaBed style={getIconStyle("name")} />
                  <input
                    name="name"
                    value={roomData.name}
                    onChange={handleRoomChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Room Name *"
                    className="w-full outline-none bg-gray-50 text-black"
                    required
                  />
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block font-semibold mb-1">Room Type</label>
                <div className={getFieldStyle("type")}>
                  <FaThLarge style={getIconStyle("type")} />
                  <select
                    name="type"
                    value={roomData.type}
                    onChange={handleRoomChange}
                    onFocus={() => setFocusedField("type")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-gray-50 text-black"
                    required
                  >
                    <option value="">Select Room Type</option>
                    <option value="PG">PG</option>
                    <option value="AC">AC</option>
                    <option value="Single Sharing">Single Sharing</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                    <option value="Four Sharing">Four Sharing</option>
                    <option value="Five Sharing">Five Sharing</option>
                    <option value="Six Sharing">Six Sharing</option>
                    <option value="More Than 6 Sharing">More Than 6 Sharing</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Male Only">Male Only</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Student Only">Student Only</option>
                    <option value="Working Professionals Only">Working Professionals Only</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block font-semibold mb-1">Price (₹)</label>
                <div className={getFieldStyle("price")}>
                  <FaRupeeSign style={getIconStyle("price")} />
                  <input
                    name="price"
                    type="number"
                    value={roomData.price}
                    onChange={handleRoomChange}
                    onFocus={() => setFocusedField("price")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Price (₹) *"
                    className="w-full outline-none bg-gray-50 text-black"
                    required
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block font-semibold mb-1">Capacity</label>
                <div className={getFieldStyle("capacity")}>
                  <FaUsers style={getIconStyle("capacity")} />
                  <input
                    name="capacity"
                    type="number"
                    value={roomData.capacity}
                    onChange={handleRoomChange}
                    onFocus={() => setFocusedField("capacity")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Capacity *"
                    className="w-full outline-none bg-gray-50 text-black"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <div className={getFieldStyle("status")}>
                  <FaToggleOn style={getIconStyle("status")} />
                  <select
                    name="status"
                    value={roomData.status}
                    onChange={handleRoomChange}
                    onFocus={() => setFocusedField("status")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-gray-50 text-black"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                    <option value="Partially Available">Partially Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block font-semibold mb-1">Upload Images</label>
                <div className={getFieldStyle("images")}>
                  <FaImage style={getIconStyle("images")} />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    onFocus={() => setFocusedField("images")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {previewItems.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black">
                    <FaImage /> Images ({previewItems.length}/{MAX_IMAGES})
                  </h3>
                  {previewItems.length >= MAX_IMAGES && <span className="text-red-500 text-sm">Max limit reached</span>}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {previewItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <img
                        src={item.url}
                        alt="preview"
                        className={`w-full h-24 object-cover rounded-lg shadow-sm ${
                          item.type === 'uploaded' ? 'border-2 border-green-400' : 'border border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                      {item.type === 'uploaded' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs text-center py-1 rounded-b-lg">
                          Uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                Amenities
              </h3>
              {Object.entries(amenitiesOptions).map(([cat, options]) => (
                <div key={cat}>
                  <h4 className="font-semibold text-black capitalize mb-2">
                    {cat.replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {options.map(opt => {
                      const isActive = roomData.facilities[cat][facilityKeyMapping[cat][opt]];
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleFacilityToggle(cat, opt)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                              : 'bg-gray-100 text-black border border-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-500 hover:text-white hover:shadow-md'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-6"
            >
              {loading ? "Adding Room..." : "ADD ROOM"}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}

export default PropertyManagerPropertyRoomForm;