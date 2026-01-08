import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBed,
  FaMoneyBillWave,
  FaLayerGroup,
  FaListUl,
  FaImage,
  FaThLarge,
  FaUsers,
  FaToggleOn,
  FaTimes,
  FaTrash,
  FaEye,
  FaArrowLeft, // For back button
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mapping of frontend amenity names to backend facility keys (unchanged)
const facilityKeyMapping = {
  roomEssentials: {
    Bed: "bed",
    Table: "tableStudyDesk",
    Chair: "chair",
    Fan: "fan",
    Light: "light",
    Lamp: "chargingPoint",
    Wardrobe: "cupboardWardrobe",
  },
  comfortFeatures: {
    "Air Conditioner": "ac",
    Geyser: "geyser",
    Heater: "heater",
    TV: "tv",
    Fridge: "cooler",
    Sofa: "sofa",
    Mattress: "mattress",
  },
  washroomHygiene: {
    Toilet: "westernToilet",
    Shower: "shower",
    Sink: "washBasins",
    Mirror: "mirror",
    "Western Toilet": "westernToilet",
    Towels: "bucketMug",
    Toiletries: "toiletries",
  },
  utilitiesConnectivity: {
    WiFi: "wifi",
    "Power Backup": "powerBackup",
    "Water Supply": "water24x7",
    Electricity: "electricityIncluded",
    Internet: "wifi",
  },
  laundryHousekeeping: {
    "Washing Machine": "washingMachine",
    Dryer: "dryingSpace",
    "Cleaning Service": "cleaningService",
    Iron: "ironTable",
    "Laundry Service": "laundryArea",
  },
  securitySafety: {
    CCTV: "cctv",
    "Fire Extinguisher": "fireSafety",
    "First Aid Kit": "fireSafety",
    "Security Guard": "securityGuard",
    "Smoke Alarm": "fireSafety",
  },
  parkingTransport: {
    Parking: "carParking",
    "Bike Parking": "bikeParking",
    "Car Parking": "carParking",
    "Public Transport Access": "nearBus",
  },
  propertySpecific: {
    Lift: "liftAvailable",
    Gym: "gym",
    Kitchen: "modularKitchen",
    "Common Area": "hall",
    Balcony: "balcony",
    Terrace: "terrace",
    Garden: "garden",
  },
  nearbyFacilities: {
    Hospital: "hospital",
    School: "schoolCollege",
    Market: "marketMall",
    Metro: "nearMetro",
    "Bus Stop": "nearBus",
    Restaurant: "marketMall",
  },
};

const amenitiesOptions = {
  roomEssentials: ["Bed", "Table", "Chair", "Fan", "Light", "Lamp", "Wardrobe"],
  comfortFeatures: [
    "Air Conditioner",
    "Geyser",
    "Heater",
    "TV",
    "Fridge",
    "Sofa",
    "Mattress",
  ],
  washroomHygiene: [
    "Toilet",
    "Shower",
    "Sink",
    "Mirror",
    "Western Toilet",
    "Towels",
    "Toiletries",
  ],
  utilitiesConnectivity: [
    "WiFi",
    "Power Backup",
    "Water Supply",
    "Electricity",
    "Internet",
  ],
  laundryHousekeeping: [
    "Washing Machine",
    "Dryer",
    "Cleaning Service",
    "Iron",
    "Laundry Service",
  ],
  securitySafety: [
    "CCTV",
    "Fire Extinguisher",
    "First Aid Kit",
    "Security Guard",
    "Smoke Alarm",
  ],
  parkingTransport: [
    "Parking",
    "Bike Parking",
    "Car Parking",
    "Public Transport Access",
  ],
  propertySpecific: [
    "Lift",
    "Gym",
    "Kitchen",
    "Common Area",
    "Balcony",
    "Terrace",
    "Garden",
  ],
  nearbyFacilities: [
    "Hospital",
    "School",
    "Market",
    "Metro",
    "Bus Stop",
    "Restaurant",
  ],
};

// Initialize facilities with all backend keys set to false (unchanged)
const initialFacilities = Object.keys(facilityKeyMapping).reduce(
  (acc, category) => {
    acc[category] = Object.keys(facilityKeyMapping[category]).reduce(
      (catAcc, frontendKey) => {
        const backendKey = facilityKeyMapping[category][frontendKey];
        catAcc[backendKey] = false;
        return catAcc;
      },
      {}
    );
    return acc;
  },
  {}
);

const SubOwnerAddRooms = () => {
  const { propertyId } = useParams();
  console.log("Property ID from URL:", propertyId);
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState("");
  const [roomData, setRoomData] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    status: "Available",
    facilities: initialFacilities,
    beds: [],
    images: [],
  });
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [beds, setBeds] = useState([
    { name: "", price: "", status: "Available", images: [] },
  ]);

  // Define API base URL
  const API_BASE = `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms`;

  // getToken function
  const getToken = () => localStorage.getItem("token");

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleFacilityToggle = (category, frontendKey) => {
    const backendKey = facilityKeyMapping[category][frontendKey];
    setRoomData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [category]: {
          ...prev.facilities[category],
          [backendKey]: !prev.facilities[category][backendKey],
        },
      },
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomData((prev) => ({ ...prev, images: files }));
  };

  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };
    setBeds(updatedBeds);
  };

  const handleBedImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], images: files };
    setBeds(updatedBeds);
  };

  const addBedField = () => {
    setBeds([
      ...beds,
      { name: "", price: "", status: "Available", images: [] },
    ]);
  };

  const removeBedField = (index) => {
    setBeds(beds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create a flat array of selected facility keys
    const selectedFacilities = {};
    Object.entries(roomData.facilities).forEach(([category, facilities]) => {
      // Only include categories with at least one true value
      const selectedInCategory = {};
      Object.entries(facilities).forEach(([backendKey, isSelected]) => {
        if (isSelected) {
          selectedInCategory[backendKey] = true;
        }
      });
      if (Object.keys(selectedInCategory).length > 0) {
        selectedFacilities[category] = selectedInCategory;
      }
    });
    console.log("roomData.facilities:", roomData.facilities);
    console.log("Selected Facilities:", selectedFacilities);
    const payload = [
      {
        name: roomData.name || `Room ${Date.now().toString().slice(-4)}`,
        type: roomData.type,
        price: Number(roomData.price),
        capacity: Number(roomData.capacity),
        status: roomData.status,
        facilities: selectedFacilities, // <-- This matches your API!
        beds: roomData.beds,
      },
    ];

    console.log("Payload being sent to backend:", payload);
    console.log("roomData.facilities:", roomData.facilities);

    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.post(API_BASE, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const savedRoomId = res.data.addedRooms[0].roomId;

      // Upload room images (endpoint assumed; adjust if needed)
      // if (roomData.images.length > 0) {
      //   const formData = new FormData();
      //   roomData.images.forEach((image) => formData.append("images", image));
      //   await axios.post(`${API_BASE}/${savedRoomId}/images`, formData, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "multipart/form-data",
      //     },
      //   });
      // }

      toast.success("Room added successfully!");
      setSelectedRoomId(savedRoomId);
      setShowBedForm(true); // Auto-show bed form after adding room
      resetForm();
    } catch (err) {
      console.error("Error saving room:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        requestData: payload,
      });
      setError(
        err.response?.data?.message || `Failed to save room: ${err.message}`
      );
      toast.error(
        err.response?.data?.message || `Failed to save room: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBedSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError("Please add a room first before adding beds.");
      toast.error("Please add a room first before adding beds.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const bedsAPI = `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${selectedRoomId}/beds`;
      for (const bed of beds) {
        if (!bed.name || !bed.price) {
          throw new Error("Bed name and price are required.");
        }
        const payload = {
          name: bed.name,
          price: Number(bed.price),
          status: bed.status,
        };
        const res = await axios.post(bedsAPI, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const savedBedId = res.data.bedId || res.data.id; // Adjust based on actual response

        // Upload bed images (endpoint assumed; adjust if needed)
        // if (bed.images.length > 0) {
        //   const formData = new FormData();
        //   bed.images.forEach((image) => formData.append("images", image));
        //   await axios.post(
        //     `${bedsAPI}/${savedBedId}/images`,
        //     formData,
        //     {
        //       headers: {
        //         Authorization: `Bearer ${token}`,
        //         "Content-Type": "multipart/form-data",
        //       },
        //     }
        //   );
        // }
      }
      setBeds([{ name: "", price: "", status: "Available", images: [] }]);
      toast.success("Beds added successfully!");
      resetBedForm();
    } catch (err) {
      console.error("Error adding beds:", err.response?.data || err);
      setError(
        err.response?.data?.message || `Failed to add beds: ${err.message}`
      );
      toast.error(
        err.response?.data?.message || `Failed to add beds: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRoomData({
      name: "",
      type: "",
      price: "",
      capacity: "",
      status: "Available",
      facilities: initialFacilities,
      beds: [],
      images: [],
    });
    setFocusedField("");
  };

  const resetBedForm = () => {
    setShowBedForm(false);
    setSelectedRoomId(null);
    setBeds([{ name: "", price: "", status: "Available", images: [] }]);
  };

  const getFieldStyle = (name) =>
    `w-full flex items-center gap-2 border rounded-md px-4 py-2 bg-white transition-all duration-200 ${
      focusedField === name
        ? "border-blue-400 ring-2 ring-blue-200"
        : "border-gray-300"
    } text-gray-800`;

  const getIconStyle = (name) => ({
    color: focusedField === name ? "#3b82f6" : "#9ca3af",
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="max-w-4xl mx-auto ">
        <motion.h2
          className="text-3xl font-bold mb-6 text-gray-800 text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Add New Room
        </motion.h2>

        {error && (
          <motion.p
            className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {loading && <p className="text-center text-gray-400">Saving...</p>}

        {/* Room Add Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 text-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Room Name
                </label>
                <div className={getFieldStyle("roomName")}>
                  <FaListUl style={getIconStyle("roomName")} />
                  <input
                    type="text"
                    name="name"
                    value={roomData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("roomName")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none"
                    placeholder="Enter room name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Room Type
                </label>
                <div className={getFieldStyle("roomType")}>
                  <FaThLarge style={getIconStyle("roomType")} />
                  <select
                    name="type"
                    value={roomData.type}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("roomType")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-white text-gray-800"
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
                    <option value="More Than 6 Sharing">
                      More Than 6 Sharing
                    </option>
                    <option value="Private Room">Private Room</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Male Only">Male Only</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Student Only">Student Only</option>
                    <option value="Working Professionals Only">
                      Working Professionals Only
                    </option>
                  </select>
                </div>
              </div>
            {/*  <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Price (₹)
                </label>
                <div className={getFieldStyle("price")}>
                  <FaMoneyBillWave style={getIconStyle("price")} />
                  <input
                    type="number"
                    name="price"
                    value={roomData.price}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("price")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none"
                    placeholder="Monthly rent"
                    required
                  />
                </div>
              </div>*/} 
              <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Capacity
                </label>
                <div className={getFieldStyle("capacity")}>
                  <FaUsers style={getIconStyle("capacity")} />
                  <input
                    type="number"
                    name="capacity"
                    value={roomData.capacity}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("capacity")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none"
                    placeholder="Enter capacity"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Status
                </label>
                <div className={getFieldStyle("status")}>
                  <FaToggleOn style={getIconStyle("status")} />
                  <select
                    name="status"
                    value={roomData.status}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("status")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none bg-white"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-gray-100">
                  Upload Room Images
                </label>
                <div className={getFieldStyle("images")}>
                  <FaImage style={getIconStyle("images")} />
                  <input
                    type="file"
                    name="images"
                    onChange={handleImageChange}
                    onFocus={() => setFocusedField("images")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none"
                    multiple
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-100">
                Facilities
              </label>
              <div className="space-y-4">
                {Object.entries(amenitiesOptions).map(([category, options]) => (
                  <div key={category} className="w-full">
                    <h4 className="text-lg font-medium mb-2 capitalize text-gray-100">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {options.map((option) => {
                        const isActive =
                          roomData.facilities[category][
                            facilityKeyMapping[category][option]
                          ] || false;

                        return (
                          <motion.button
                            key={option}
                            onClick={() =>
                              handleFacilityToggle(category, option)
                            }
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 text-sm font-medium
                ${
                  isActive
                    ? "bg-green-500 border-green-600 text-white shadow-lg"
                    : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                }`}
                          >
                            <div
                              className={`w-6 h-6 flex items-center justify-center rounded-md 
                  ${
                    isActive
                      ? "bg-gradient-to-br from-green-400 to-green-600 shadow-md"
                      : "bg-gray-200"
                  } 
                  `}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke="currentColor"
                                className={`w-4 h-4 transition-opacity duration-200 
                    ${
                      isActive
                        ? "text-white opacity-100"
                        : "text-gray-500 opacity-40"
                    }`}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span>{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Room"}
            </motion.button>
          </form>
        </motion.div>

        {/* Add Beds Section (Toggleable) */}
        <motion.button
          onClick={() => setShowBedForm(!showBedForm)}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold mb-6 flex items-center justify-center"
        >
          <FaPlus className="mr-2" />
          {showBedForm ? "Cancel" : "Add Beds to Room"}
        </motion.button>

        {showBedForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FaBed className="mr-2 text-blue-500" />
              Add Beds
            </h3>
            <form onSubmit={handleBedSubmit} className="space-y-6">
              {beds.map((bed, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                >
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">
                      Bed Name
                    </label>
                    <input
                      type="text"
                      value={bed.name}
                      onChange={(e) =>
                        handleBedChange(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                      placeholder="Enter bed name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={bed.price}
                      onChange={(e) =>
                        handleBedChange(index, "price", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">
                      Status
                    </label>
                    <select
                      value={bed.status}
                      onChange={(e) =>
                        handleBedChange(index, "status", e.target.value)
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">
                      Upload Bed Images
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleBedImageChange(index, e)}
                      className="w-full px-0 py-2  rounded-md bg-white text-gray-800"
                      multiple
                      accept="image/*"
                    />
                  </div>
                  {index > 0 && (
                    <motion.button
                      type="button"
                      onClick={() => removeBedField(index)}
                      whileHover={{ scale: 1.1 }}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      <FaTrash />
                    </motion.button>
                  )}
                </div>
              ))}
              <motion.button
                type="button"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                onClick={addBedField}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus className="inline mr-2" /> Add Another Bed
              </motion.button>
              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Beds"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubOwnerAddRooms;
