import React, { useState, useEffect } from "react";
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
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaHome,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Updated mapping of frontend amenity names to backend facility keys based on API example
const facilityKeyMapping = {
  roomEssentials: {
    Bed: "bed",
    Table: "tableStudyDesk",
    Chair: "chair",
    Fan: "fan",
    Light: "light",
    Lamp: "chargingPoint",
    Wardrobe: "cupboardWardrobe", // Adjusted to match property response
    Mattress: "mattress",
    Pillow: "pillow",
    Blanket: "blanket",
  },
  comfortFeatures: {
    "Air Conditioner": "ac",
    Geyser: "geyser",
    Heater: "heater",
    Cooler: "cooler",
    CeilingFan: "ceilingFan",
    Window: "window",
    Balcony: "balcony",
    Ventilation: "ventilation",
    Curtains: "curtains",
    TV: "tv",
  },
  washroomHygiene: {
    "Attached Washroom": "attachedBathroom",
    "Common Bathroom": "commonBathroom",
    "Western Toilet": "westernToilet",
    "Indian Toilet": "indianToilet",
    Geyser: "geyser",
    "Water 24x7": "water24x7",
    "Wash Basins": "washBasins",
    Mirror: "mirror",
    "Bucket Mug": "bucketMug",
    "Cleaning Service": "cleaningService",
    Toilet: "westernToilet",
    Shower: "shower",
    Sink: "washBasins",
    Towels: "bucketMug",
    Toiletries: "toiletries",
  },
  utilitiesConnectivity: {
    WiFi: "wifi",
    "Power Backup": "powerBackup",
    Electricity: "electricityIncluded",
    Water: "waterIncluded",
    Gas: "gasIncluded",
    Maintenance: "maintenanceIncluded",
    "DTH Cable": "dthCable",
    Internet: "wifi",
    "Water Supply": "water24x7",
  },
  laundryHousekeeping: {
    "Washing Machine": "washingMachine",
    "Laundry Area": "laundryArea",
    "Drying Space": "dryingSpace",
    "Iron Table": "ironTable",
    "Cleaning Service": "housekeeping",
    "Laundry Service": "laundry",
    Dryer: "dryingSpace",
    Iron: "ironTable",
  },
  securitySafety: {
    CCTV: "cctv",
    "Biometric Entry": "biometricEntry",
    "Security Guard": "securityGuard",
    "Visitor Restricted": "visitorRestricted",
    "Fire Safety": "fireSafety",
    "Fire Extinguisher": "fireSafety",
    "First Aid Kit": "firstAidKit",
    "Smoke Alarm": "smokeAlarm",
  },
  parkingTransport: {
    "Bike Parking": "bikeParking",
    "Car Parking": "carParking",
    "Covered Parking": "coveredParking",
    "Near Bus": "nearBus",
    "Near Metro": "nearMetro",
    Parking: "carParking",
    "Public Transport Access": "nearBus",
  },
  propertySpecific: {
    Kitchen: "modularKitchen",
    Balcony: "balcony",
    Lift: "liftAvailable",
    "Separate Entry": "separateEntry",
    "Common Area": "hall",
    "Modular Kitchen": "modularKitchen",
    Gym: "gym",
    Terrace: "terrace",
    Garden: "garden",
  },
  nearbyFacilities: {
    Hospital: "hospital",
    "School College": "schoolCollege",
    Market: "marketMall",
    "Grocery": "grocery",
    Gym: "gym",
    Park: "park",
    Metro: "nearMetro",
    "Bus Stop": "nearBus",
    Restaurant: "restaurant",
  },
};

const amenitiesOptions = {
  roomEssentials: [
    "Bed",
    "Table",
    "Chair",
    "Fan",
    "Light",
    "Lamp",
    "Wardrobe",
    "Mattress",
    "Pillow",
    "Blanket",
  ],
  comfortFeatures: [
    "Air Conditioner",
    "Geyser",
    "Heater",
    "Cooler",
    "CeilingFan",
    "Window",
    "Balcony",
    "Ventilation",
    "Curtains",
    "TV",
  ],
  washroomHygiene: [
    "Attached Washroom",
    "Common Bathroom",
    "Western Toilet",
    "Indian Toilet",
    "Geyser",
    "Water 24x7",
    "Wash Basins",
    "Mirror",
    "Bucket Mug",
    "Cleaning Service",
    "Toilet",
    "Shower",
    "Sink",
    "Towels",
    "Toiletries",
  ],
  utilitiesConnectivity: [
    "WiFi",
    "Power Backup",
    "Electricity",
    "Water",
    "Gas",
    "Maintenance",
    "DTH Cable",
    "Internet",
    "Water Supply",
  ],
  laundryHousekeeping: [
    "Washing Machine",
    "Laundry Area",
    "Drying Space",
    "Iron Table",
    "Cleaning Service",
    "Laundry Service",
    "Dryer",
    "Iron",
  ],
  securitySafety: [
    "CCTV",
    "Biometric Entry",
    "Security Guard",
    "Visitor Restricted",
    "Fire Safety",
    "Fire Extinguisher",
    "First Aid Kit",
    "Smoke Alarm",
  ],
  parkingTransport: [
    "Bike Parking",
    "Car Parking",
    "Covered Parking",
    "Near Bus",
    "Near Metro",
    "Parking",
    "Public Transport Access",
  ],
  propertySpecific: [
    "Kitchen",
    "Balcony",
    "Lift",
    "Separate Entry",
    "Common Area",
    "Modular Kitchen",
    "Gym",
    "Terrace",
    "Garden",
  ],
  nearbyFacilities: [
    "Hospital",
    "School College",
    "Market",
    "Grocery",
    "Gym",
    "Park",
    "Metro",
    "Bus Stop",
    "Restaurant",
  ],
};

// Initialize facilities with all backend keys set to false
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

// Function to count selected facilities (true booleans)
const countFacilities = (facilities) => {
  if (!facilities) return 0;
  let count = 0;
  Object.values(facilities).forEach((category) => {
    Object.values(category).forEach((value) => {
      if (typeof value === "boolean" && value) {
        count++;
      }
    });
  });
  return count;
};

const AssignedAddRoom = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState("");
  const [roomData, setRoomData] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    status: "Available",
    facilities: initialFacilities,
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [property, setProperty] = useState(null);
  const [beds, setBeds] = useState([
    { name: "", price: "", status: "Available", images: [] },
  ]);
  const [showFullResponse, setShowFullResponse] = useState(false);

  // getToken function
  const getToken = () => localStorage.getItem("token");

  // Fetch property details on mount
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError("No property ID provided in URL.");
        toast.error("No property ID provided in URL.");
        return;
      }
      try {
        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }
        const response = await axios.get(
          `https://api.gharzoreality.com/api/regional-managers/assigned-properties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const properties = response.data.data || [];
        const selectedProperty = properties.find(p => p.propertyId === propertyId);
        if (!selectedProperty) {
          throw new Error(`Property with ID ${propertyId} not found in assigned properties.`);
        }
        setProperty(selectedProperty);
        toast.success("Property loaded successfully!");
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(
          err.response?.data?.message || `Failed to load property: ${err.message}`
        );
        toast.error(
          err.response?.data?.message || `Failed to load property: ${err.message}`
        );
      }
    };
    fetchProperty();
  }, [propertyId]);

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
    setRoomData((prev) => ({ ...prev, images: [...prev.images.filter(img => !(img instanceof File)), ...files] }));
  };

  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };
    setBeds(updatedBeds);
  };

  const handleBedImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedBeds = [...beds];
    updatedBeds[index] = { ...updatedBeds[index], images: [...updatedBeds[index].images.filter(img => !(img instanceof File)), ...files] };
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
    if (!propertyId) {
      setError("Property ID not available. Please refresh.");
      toast.error("Property ID not available. Please refresh.");
      return;
    }

    // Create a flat object of selected facility keys (only include true ones)
    const selectedFacilities = {};
    Object.entries(roomData.facilities).forEach(([category, facilities]) => {
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

    // Validate beds
    const validBeds = beds
      .map((bed) => ({
        ...bed,
        images: bed.images || [],
      }))
      .filter((bed) => bed.name && bed.price);
    if (validBeds.length === 0) {
      setError("At least one bed is required with name and price.");
      toast.error("At least one bed is required with name and price.");
      return;
    }

    // Prepare beds for creation (exclude images)
    const validBedsForCreate = validBeds.map((bed) => ({
      name: bed.name,
      price: Number(bed.price),
      status: bed.status,
    }));

    // Prepare room object (exclude images)
    const roomToAdd = {
      name: roomData.name || `Room ${Date.now().toString().slice(-4)}`,
      type: roomData.type,
      price: Number(roomData.price),
      capacity: Number(roomData.capacity),
      status: roomData.status,
      facilities: selectedFacilities,
      beds: validBedsForCreate,
    };

    // Wrap in array for POST
    const requestBody = [roomToAdd];

    console.log("Request body:", requestBody);

    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const API_BASE = `https://api.gharzoreality.com/api/rm/${propertyId}/rooms`;
      const res = await axios.post(API_BASE, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // FIXED: Access the correct response structure
      const addedRooms = res.data.addedRooms || [];
      if (addedRooms.length === 0) {
        throw new Error("No rooms were created. Check the response.");
      }
      const createdRoom = addedRooms[0]; // Since we're adding one room
      const roomId = createdRoom.roomId;

      // Upload room images if any
      if (roomData.images.length > 0) {
        const roomFiles = roomData.images.filter(img => img instanceof File);
        if (roomFiles.length > 0) {
          const roomFormData = new FormData();
          roomFiles.forEach((file) => roomFormData.append("images", file));
          await axios.post(
            `https://api.gharzoreality.com/api/rm/rooms/${propertyId}/${roomId}/images`,
            roomFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      // FIXED: Access beds from the correct response structure
      const createdBeds = createdRoom.beds || [];
      // Upload bed images if any (assumes validBeds.length matches createdBeds.length)
      for (let i = 0; i < validBeds.length; i++) {
        const bedFiles = validBeds[i].images.filter(img => img instanceof File);
        if (bedFiles.length > 0 && createdBeds[i]) { // Safeguard for bed existence
          const bedFormData = new FormData();
          bedFiles.forEach((file) => bedFormData.append("images", file));
          const bedId = createdBeds[i].bedId;
          await axios.post(
            `https://api.gharzoreality.com/api/rm/bed-images/${propertyId}/${roomId}/${bedId}/upload`,
            bedFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      toast.success("Room(s) added successfully!");
      setShowFullResponse(true);
      // Refetch property to update UI
      const updatedRes = await axios.get(
        `https://api.gharzoreality.com/api/regional-managers/assigned-properties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedProperties = updatedRes.data.data || [];
      const updatedSelectedProperty = updatedProperties.find(p => p.propertyId === propertyId);
      if (updatedSelectedProperty) {
        setProperty(updatedSelectedProperty);
      }
      resetForm();
    } catch (err) {
      console.error("Error adding rooms:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.message || `Failed to add room(s): ${err.message}`
      );
      toast.error(
        err.response?.data?.message || `Failed to add room(s): ${err.message}`
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
      images: [],
    });
    setBeds([{ name: "", price: "", status: "Available", images: [] }]);
    setFocusedField("");
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

  const MotionIcon = ({ children, ...props }) => (
    <motion.div
      {...props}
      whileHover={{ rotateY: 360, scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="origin-center"
    >
      {children}
    </motion.div>
  );

  if (!property) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading property details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="max-w-6xl mx-auto">
        <motion.button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          whileHover={{ scale: 1.05 }}
        >
          <FaArrowLeft />
          Back
        </motion.button>

        {/* Property Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <MotionIcon>
              <FaBuilding className="text-3xl text-blue-500" />
            </MotionIcon>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {property.name}
              </h2>
              <p className="text-gray-600 flex items-center gap-1">
                <FaMapMarkerAlt />
                {property.address}, {property.pinCode}, {property.city}, {property.state}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <MotionIcon>
                <FaBed className="mx-auto mb-1 text-blue-500" />
              </MotionIcon>
              <p className="font-semibold">{property.totalBeds}</p>
              <p className="text-sm text-gray-600">Total Beds</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <MotionIcon>
                <FaLayerGroup className="mx-auto mb-1 text-green-500" />
              </MotionIcon>
              <p className="font-semibold">{property.totalRooms}</p>
              <p className="text-sm text-gray-600">Total Rooms</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <MotionIcon>
                <FaUsers className="mx-auto mb-1 text-yellow-500" />
              </MotionIcon>
              <p className="font-semibold">{property.totalCapacity}</p>
              <p className="text-sm text-gray-600">Total Capacity</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <MotionIcon>
                <FaStar className="mx-auto mb-1 text-purple-500" />
              </MotionIcon>
              <p className="font-semibold">{property.ratingSummary.averageRating}</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <p className="italic">{property.description}</p>
          </div>
        </motion.div>

        <motion.h2
          className="text-3xl font-bold mb-6 text-gray-800 text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Add New Room to {property.name}
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

        {loading && <p className="text-center text-gray-400">Adding Room...</p>}

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
                  <MotionIcon style={getIconStyle("roomName")}>
                    <FaListUl />
                  </MotionIcon>
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
                  <MotionIcon style={getIconStyle("roomType")}>
                    <FaThLarge />
                  </MotionIcon>
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
                    <option value="Private Room">Private Room</option>
                    <option value="Shared Room">Shared Room</option>
                    {/* Add more as needed */}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Price (₹)
                </label>
                <div className={getFieldStyle("price")}>
                  <MotionIcon style={getIconStyle("price")}>
                    <FaMoneyBillWave />
                  </MotionIcon>
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
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-100">
                  Capacity
                </label>
                <div className={getFieldStyle("capacity")}>
                  <MotionIcon style={getIconStyle("capacity")}>
                    <FaUsers />
                  </MotionIcon>
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
                  <MotionIcon style={getIconStyle("status")}>
                    <FaToggleOn />
                  </MotionIcon>
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
                  <MotionIcon style={getIconStyle("images")}>
                    <FaImage />
                  </MotionIcon>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    onFocus={() => setFocusedField("images")}
                    onBlur={() => setFocusedField("")}
                    className="w-full outline-none"
                    multiple
                    accept="image/*"
                  />
                </div>
                {roomData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {roomData.images.map((img, i) => (
                      <div key={i} className="relative">
                        {img instanceof File ? (
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${i + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                          />
                        ) : (
                          <img
                            src={img}
                            alt={`Room Image ${i + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                        const backendKey = facilityKeyMapping[category][option];
                        const isActive =
                          roomData.facilities[category][backendKey] || false;

                        return (
                          <motion.button
                            key={option}
                            onClick={() =>
                              handleFacilityToggle(category, option)
                            }
                            type="button"
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

            {/* Beds Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-100 flex items-center">
                <MotionIcon>
                  <FaBed className="mr-2 text-blue-400" />
                </MotionIcon>
                Beds (Add beds for this room)
              </h3>
              <div className="space-y-4">
                <AnimatePresence>
                  {beds.map((bed, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-700 p-4 rounded-lg"
                    >
                      <div>
                        <label className="block font-semibold mb-1 text-gray-200">
                          Bed Name
                        </label>
                        <input
                          type="text"
                          value={bed.name}
                          onChange={(e) =>
                            handleBedChange(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-500 rounded-md bg-white text-gray-800"
                          placeholder="e.g., Bed A - Room Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-gray-200">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={bed.price}
                          onChange={(e) =>
                            handleBedChange(index, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-500 rounded-md bg-white text-gray-800"
                          placeholder="Enter price"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-gray-200">
                          Status
                        </label>
                        <select
                          value={bed.status}
                          onChange={(e) =>
                            handleBedChange(index, "status", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-500 rounded-md bg-white text-gray-800"
                          required
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 md:col-span-1">
                        <input
                          type="file"
                          onChange={(e) => handleBedImageChange(index, e)}
                          className="w-full px-0 py-2 border border-gray-500 rounded-md bg-white text-gray-800"
                          multiple
                          accept="image/*"
                        />
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
                      {bed.images.length > 0 && (
                        <div className="md:col-span-4 mt-2 flex flex-wrap gap-2">
                          {bed.images.map((img, i) => (
                            <div key={i} className="relative">
                              <img
                                src={img instanceof File ? URL.createObjectURL(img) : img}
                                alt={`Bed Preview ${i + 1}`}
                                className="h-16 w-16 object-cover rounded border"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  type="button"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                  onClick={addBedField}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlus className="inline mr-2" /> Add Another Bed
                </motion.button>
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

        {/* Existing Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <MotionIcon>
              <FaLayerGroup className="mr-2 text-green-500" />
            </MotionIcon>
            Existing Rooms ({property.rooms?.length || 0})
          </h3>
          <AnimatePresence>
            {property.rooms?.map((room, index) => (
              <motion.div
                key={room.roomId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{room.name}</h4>
                    <p className="text-gray-600">Type: {room.type} | Capacity: {room.capacity} | Price: ₹{room.price}</p>
                    <p className="text-sm text-green-600">Status: {room.status}</p>
                    {/* FIXED: Display facilities count */}
                    <p className="text-sm text-purple-600">Facilities: {countFacilities(room.facilities)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Beds: {room.beds?.length || 0}</p>
                    {room.images?.length > 0 && (
                      <span className="text-sm text-blue-500">Images: {room.images.length}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {property.rooms?.length === 0 && (
            <p className="text-center text-gray-500 italic">No rooms added yet.</p>
          )}
        </motion.div>

       
      </div>
    </div>
  );
};

export default AssignedAddRoom;