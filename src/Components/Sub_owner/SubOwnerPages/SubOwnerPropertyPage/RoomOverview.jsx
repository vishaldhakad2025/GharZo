import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBed,
  FaHome,
  FaSnowflake,
  FaFan,
  FaLightbulb,
  FaChair,
  FaLock,
  FaWifi,
  FaBolt,
  FaShieldAlt,
  FaCamera,
  FaParking,
  FaShoppingCart,
  FaHospital,
  FaDumbbell,
  FaTree,
  FaSchool,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPencilAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Modal,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Grid,
} from "@mui/material";

const RoomOverview = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoomForDelete, setSelectedRoomForDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [beds, setBeds] = useState([]);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isDeleteBedModalOpen, setIsDeleteBedModalOpen] = useState(false);
  const [bedForm, setBedForm] = useState({ name: "", price: "" });
  const [isAddBedFormOpen, setIsAddBedFormOpen] = useState(false);
  const [newBedData, setNewBedData] = useState({ name: "", price: "" });
  const [editedRoomData, setEditedRoomData] = useState({
    name: "",
    type: "",
   //price: "",
    capacity: "",
    status: "Available",
    facilities: {
      roomEssentials: {
        bed: false,
        fan: false,
        light: false,
        chair: false,
        lock: false,
      },
      comfortFeatures: { ac: false, wifi: false, powerBackup: false },
      securitySafety: { cctv: false, securityGuard: false },
      parkingTransport: { bikeParking: false },
      nearbyFacilities: {
        marketMall: false,
        hospital: false,
        gym: false,
        park: false,
        schoolCollege: false,
      },
    },
  });

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property ID is required.");
      navigate(-1);
      return;
    }

    const fetchRooms = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login first.");
          navigate("/login");
          return;
        }

        console.log("Fetching property with Property ID:", propertyId);
        console.log("Token:", token);

        const response = await axios.get(
          `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Property response data:", response.data);

        if (response.data.success && response.data.property?.rooms) {
          const mappedRooms = response.data.property.rooms.map((room) => ({
            ...room,
            roomId: room.roomId || room.id || room._id,
            availableBeds:
              room.beds?.filter((bed) => bed.status === "Available").length ||
              0,
            totalBeds: room.beds?.length || 0,
          }));
          console.log("Mapped rooms:", mappedRooms);
          setRooms(mappedRooms || []);
        } else {
          toast.error("Failed to fetch rooms or no rooms found.");
        }
      } catch (err) {
        console.error("Error fetching property:", err.response?.data || err);
        setError("Failed to load rooms. Please try again.");
        toast.error("Failed to fetch rooms. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [propertyId, navigate]);

  const fetchBeds = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${roomId}/beds`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBeds(res.data.beds);
    } catch (err) {
      console.error("Error fetching beds:", err);
      toast.error("Failed to fetch beds.");
    }
  };

  const addBed = async () => {
    if (
      !newBedData.name ||
      !newBedData.price ||
      isNaN(newBedData.price) ||
      Number(newBedData.price) <= 0
    ) {
      toast.error("Please provide a valid bed name and price.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        return;
      }
      const payload = {
        name: newBedData.name,
        price: Number(newBedData.price),
      };
      await axios.post(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${selectedRoom.roomId}/beds`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchBeds(selectedRoom.roomId);
      setNewBedData({ name: "", price: "" });
      setIsAddBedFormOpen(false);
      toast.success("Bed added successfully!");
    } catch (err) {
      console.error("Error adding bed:", err.response?.data || err);
      toast.error("Failed to add bed.");
    }
  };

  const updateBed = async () => {
    if (!selectedBed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${selectedRoom.roomId}/beds/${selectedBed.bedId}`,
        bedForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchBeds(selectedRoom.roomId);
      setSelectedBed(null);
      setBedForm({ name: "", price: "" });
      toast.success("Bed updated successfully!");
    } catch (err) {
      console.error("Error updating bed:", err);
      toast.error("Failed to update bed.");
    }
  };

  const deleteBed = async () => {
    if (!selectedBed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${selectedRoom.roomId}/beds/${selectedBed.bedId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchBeds(selectedRoom.roomId);
      setIsDeleteBedModalOpen(false);
      setSelectedBed(null);
      toast.success("Bed deleted successfully!");
    } catch (err) {
      console.error("Error deleting bed:", err);
      toast.error("Failed to delete bed.");
    }
  };

  const getFacilityIcon = (category, subKey) => {
    const iconMap = {
      roomEssentials: {
        bed: <FaBed className="text-blue-500 drop-shadow-lg" />,
        fan: <FaFan className="text-green-500 drop-shadow-lg" />,
        light: <FaLightbulb className="text-yellow-500 drop-shadow-lg" />,
        chair: <FaChair className="text-purple-500 drop-shadow-lg" />,
        lock: <FaLock className="text-red-500 drop-shadow-lg" />,
      },
      comfortFeatures: {
        ac: <FaSnowflake className="text-cyan-500 drop-shadow-lg" />,
        wifi: <FaWifi className="text-indigo-500 drop-shadow-lg" />,
        powerBackup: <FaBolt className="text-orange-500 drop-shadow-lg" />,
      },
      securitySafety: {
        cctv: <FaCamera className="text-gray-500 drop-shadow-lg" />,
        securityGuard: <FaShieldAlt className="text-pink-500 drop-shadow-lg" />,
      },
      parkingTransport: {
        bikeParking: <FaParking className="text-teal-500 drop-shadow-lg" />,
      },
      nearbyFacilities: {
        marketMall: <FaShoppingCart className="text-lime-500 drop-shadow-lg" />,
        hospital: <FaHospital className="text-red-600 drop-shadow-lg" />,
        gym: <FaDumbbell className="text-amber-500 drop-shadow-lg" />,
        park: <FaTree className="text-green-600 drop-shadow-lg" />,
        schoolCollege: <FaSchool className="text-blue-600 drop-shadow-lg" />,
      },
    };

    return (
      iconMap[category]?.[subKey] || (
        <FaHome className="text-gray-500 drop-shadow-lg" />
      )
    );
  };

  const getFacilityColor = (category, subKey) => {
    const colorMap = {
      roomEssentials: {
        bed: "bg-blue-50",
        fan: "bg-green-50",
        light: "bg-yellow-50",
        chair: "bg-purple-50",
        lock: "bg-red-50",
      },
      comfortFeatures: {
        ac: "bg-cyan-50",
        wifi: "bg-indigo-50",
        powerBackup: "bg-orange-50",
      },
      securitySafety: {
        cctv: "bg-gray-50",
        securityGuard: "bg-pink-50",
      },
      parkingTransport: {
        bikeParking: "bg-teal-50",
      },
      nearbyFacilities: {
        marketMall: "bg-lime-50",
        hospital: "bg-red-100",
        gym: "bg-amber-50",
        park: "bg-green-100",
        schoolCollege: "bg-blue-100",
      },
    };

    return colorMap[category]?.[subKey] || "bg-transparent";
  };

  const getFacilityCount = (facilities) => {
    let count = 0;
    Object.values(facilities).forEach((category) => {
      count += Object.values(category).filter(Boolean).length;
    });
    return count;
  };

  const getAllFacilities = (facilities) => {
    const allFacilities = [];
    Object.keys(facilities).forEach((category) => {
      Object.keys(facilities[category]).forEach((subKey) => {
        if (facilities[category][subKey]) {
          allFacilities.push({
            category,
            subKey,
            value: facilities[category][subKey],
          });
        }
      });
    });
    return allFacilities;
  };

  const openModal = (room) => {
    if (!room || !room.roomId) {
      toast.error("Invalid room selected. Room ID is missing.");
      return;
    }
    console.log("Opening modal for room:", room);
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const openDeleteModal = (room) => {
    if (!room || !room.roomId) {
      toast.error("Invalid room selected for deletion. Room ID is missing.");
      return;
    }
    setSelectedRoomForDelete(room);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRoomForDelete(null);
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoomForDelete || !selectedRoomForDelete.roomId) {
      toast.error("Room ID is missing for deletion.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        return;
      }

      console.log("Deleting room with ID:", selectedRoomForDelete.roomId);
      console.log("Token:", token);

      await axios.delete(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${selectedRoomForDelete.roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Room deleted successfully!");
      setRooms(
        rooms.filter((room) => room.roomId !== selectedRoomForDelete.roomId)
      );
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting room:", err.response?.data || err);
      toast.error("Failed to delete room. Check console for details.");
    }
  };

  const openEditModal = async (room) => {
    if (!room || !room.roomId) {
      toast.error("Invalid room selected. Room ID is missing.");
      return;
    }

    console.log("Opening edit modal for room ID:", room.roomId);

    setSelectedRoom(room);
    setEditedRoomData({
      name: room.name,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      status: room.status || "Available",
      facilities: room.facilities || {
        roomEssentials: {
          bed: false,
          fan: false,
          light: false,
          chair: false,
          lock: false,
        },
        comfortFeatures: { ac: false, wifi: false, powerBackup: false },
        securitySafety: { cctv: false, securityGuard: false },
        parkingTransport: { bikeParking: false },
        nearbyFacilities: {
          marketMall: false,
          hospital: false,
          gym: false,
          park: false,
          schoolCollege: false,
        },
      },
    });
    setIsEditModalOpen(true);

    await fetchBeds(room.roomId);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setShowBedForm(false);
    setEditedRoomData({
      name: "",
      type: "",
      price: "",
      capacity: "",
      status: "Available",
      facilities: {
        roomEssentials: {
          bed: false,
          fan: false,
          light: false,
          chair: false,
          lock: false,
        },
        comfortFeatures: { ac: false, wifi: false, powerBackup: false },
        securitySafety: { cctv: false, securityGuard: false },
        parkingTransport: { bikeParking: false },
        nearbyFacilities: {
          marketMall: false,
          hospital: false,
          gym: false,
          park: false,
          schoolCollege: false,
        },
      },
    });
    setBeds([]);
  };

  const handleEditRoomChange = (e) => {
    const { name, value } = e.target;
    setEditedRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (category, subKey) => {
    setEditedRoomData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [category]: {
          ...prev.facilities[category],
          [subKey]: !prev.facilities[category][subKey],
        },
      },
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required! Please login first.");
        return;
      }

      if (!selectedRoom || !selectedRoom.roomId) {
        toast.error("Room ID is missing for room update.");
        return;
      }

      console.log("Updating room ID:", selectedRoom.roomId);
      console.log("Property ID:", propertyId);
      console.log("Token:", token);

      const roomPayload = {
        name: editedRoomData.name,
        type: editedRoomData.type,
        capacity: Number(editedRoomData.capacity),
        price: Number(editedRoomData.price),
        facilities: editedRoomData.facilities,
      };

      await axios.put(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/rooms/${selectedRoom.roomId}`,
        roomPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Room updated successfully!");
      closeEditModal();
      window.location.reload();
    } catch (err) {
      console.error("Error updating room:", err.response?.data || err);
      toast.error("Failed to update room. Check console for details.");
    }
  };

  const handleAddRoom = () => {
    console.log("Navigating to add room with Property ID:", propertyId);
    navigate(`/sub_owner/property/${propertyId}/add_room`);
  };

  const handleEditBed = (bed) => {
    setSelectedBed(bed);
    setBedForm({ name: bed.name, price: bed.price });
    setIsAddBedFormOpen(false);
  };

  const handleAddBedForm = () => {
    setIsAddBedFormOpen(true);
    setSelectedBed(null);
    setBedForm({ name: "", price: "" });
  };

  const handleNewBedChange = (e) => {
    const { name, value } = e.target;
    setNewBedData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-blue-500"
        >
          <FaSpinner />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer />
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <motion.span
            initial={{ rotateY: 0 }}
            whileHover={{ rotateY: 360 }}
            className="mr-2 text-blue-500"
          >
            <FaBed className="text-3xl" />
          </motion.span>
          Available Rooms
        </h1>
        <motion.button
          onClick={handleAddRoom}
          whileHover={{ scale: 1.05 }}
          className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FaPlus className="mr-2" />
          Add New Room
        </motion.button>
        {rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaBed className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">No available rooms found.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
              <motion.div
                key={room.roomId + "-" + index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateX: 5,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-300 w-full h-[360px] flex flex-col"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 text-center relative overflow-hidden flex-grow">
                  <motion.div className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md">
                    <FaTrash
                      className="text-red-500 cursor-pointer drop-shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(room);
                      }}
                    />
                  </motion.div>
                  <motion.div className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <FaEdit
                      className="text-blue-500 cursor-pointer drop-shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(room);
                      }}
                    />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{room.type}</p>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                    ₹{room.price}
                  </div>
                  <p className="text-sm text-gray-500">per month</p>
                </div>

                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Beds Available
                    </span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-green-600 mr-2">
                        {room.availableBeds}/{room.totalBeds}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-blue-500 cursor-pointer drop-shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          fetchBeds(room.roomId);
                          setIsBedModalOpen(true);
                        }}
                      >
                        <FaEdit />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-grow">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaHome className="mr-2 text-blue-500 drop-shadow-lg" />
                    Facilities
                  </h4>
                  <div className="text-sm text-gray-700">
                    {getFacilityCount(room.facilities)} Facilities Available
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t">
                  <motion.button
                    onClick={() => openModal(room)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                  >
                    <FaBed className="mr-2 drop-shadow-lg" />
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedRoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 lg:ml-20 lg:mt-2 mt-8 bg-white flex flex-col z-50 no-scrollbar"
        >
          <div className="flex justify-between items-center mb-4 p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              {selectedRoom.name} Details
              <motion.span
                className="ml-2 text-red-500 cursor-pointer drop-shadow-lg"
                onClick={() => openDeleteModal(selectedRoom)}
                whileHover={{ scale: 1.1 }}
              >
                <FaTrash />
              </motion.span>
            </h2>
            <div className="flex space-x-3">
              <motion.button
                onClick={() => openEditModal(selectedRoom)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-green-800 text-2xl px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <FaEdit className="mr-2 drop-shadow-lg" />
              </motion.button>
              <motion.button
                onClick={closeModal}
                whileHover={{ scale: 1.1 }}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Overview
                </h3>
                <p className="text-gray-600">Type: {selectedRoom.type}</p>
                <p className="text-gray-600">Status: {selectedRoom.status}</p>
           {/*  <p className="text-gray-600">
                  Price: ₹{selectedRoom.price} per month
                </p> */}   
                <p className="text-gray-600">
                  Beds: {selectedRoom.availableBeds}/{selectedRoom.totalBeds}{" "}
                  available
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <FaHome className="mr-2 text-blue-500 drop-shadow-lg" />
                  All Facilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {getAllFacilities(selectedRoom.facilities).length > 0 ? (
                    getAllFacilities(selectedRoom.facilities).map(
                      (facility, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-lg p-3 flex items-center text-sm text-gray-700 ${getFacilityColor(
                            facility.category,
                            facility.subKey
                          )} border border-gray-200 shadow-sm`}
                        >
                          <motion.span
                            whileHover={{
                              rotateY: 180,
                              scale: 1.1,
                              rotateX: 10,
                            }}
                            className="mr-3 p-1 bg-white rounded-full drop-shadow-md"
                          >
                            {getFacilityIcon(
                              facility.category,
                              facility.subKey
                            )}
                          </motion.span>
                          <span className="capitalize">
                            {facility.subKey.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </motion.div>
                      )
                    )
                  ) : (
                    <p className="text-gray-500 col-span-full">
                      No facilities available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedRoomForDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-md p-6 border border-red-500 shadow-2xl"
          >
            <div className="text-center mb-6">
              <Typography
                variant="h6"
                sx={{ color: "#d32f2f", fontWeight: "bold" }}
              >
                Confirm Room Deletion
              </Typography>
              <Typography sx={{ mt: 2, color: "#424242" }}>
                Are you sure you want to delete{" "}
                <strong>{selectedRoomForDelete.name}</strong>? This action
                cannot be undone.
              </Typography>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={closeDeleteModal}
                variant="outlined"
                sx={{ borderColor: "#9e9e9e", color: "#616161" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRoom}
                variant="contained"
                sx={{ backgroundColor: "#d32f2f" }}
              >
                Delete Room
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bed Management Modal */}
      {isBedModalOpen && selectedRoom && (
        <Modal open={isBedModalOpen} onClose={() => setIsBedModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: "80%", md: "70%" },
              maxHeight: "80vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              overflowY: "auto",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Manage Beds for {selectedRoom.name}
              </Typography>
              <Button
                onClick={() => setIsBedModalOpen(false)}
                startIcon={<FaArrowLeft />}
                sx={{ color: "#616161" }}
              >
                Back
              </Button>
            </Box>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={handleAddBedForm}
              sx={{ mb: 2, backgroundColor: "#1976d2" }}
            >
              Add New Bed
            </Button>
            {isAddBedFormOpen && (
              <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="subtitle1">Add New Bed</Typography>
                <TextField
                  label="Bed Name"
                  name="name"
                  value={newBedData.name}
                  onChange={handleNewBedChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
               {/* */} <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={newBedData.price}
                  onChange={handleNewBedChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={addBed}
                  sx={{ backgroundColor: "#4caf50" }}
                >
                  Save Bed
                </Button>
              </Box>
            )}
            <Grid container spacing={2}>
              {beds.map((bed) => (
                <Grid item xs={6} sm={6} md={4} key={bed.bedId}>
                  <Card
                    sx={{
                      boxShadow: 6,
                      ml: 2,
                      width: 250,
                      backgroundColor:
                        bed.status === "Available" ? "#e8f5e9" : "#ffebee",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 1,
                          
                        }}
                      >
                        <FaBed
                          style={{
                            fontSize: "50px",
                            color: bed.status === "Available" ? "green" : "red",
                            transform: "perspective(500px) rotateY(15deg)",
                          }}
                        />
                      </Box>
                      <Typography variant="subtitle1">{bed.name}</Typography>
                      <Typography>Status: {bed.status}</Typography>
                      <Typography>Price: ₹{bed.price}</Typography>
                      <Typography>
                        Monthly Collection: ₹{bed.monthlyCollection || 0}
                      </Typography>
                      <Typography>
                        Pending Dues: ₹{bed.pendingDues || 0}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <IconButton onClick={() => handleEditBed(bed)}>
                          <FaEdit style={{ color: "#1976d2" }} />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedBed(bed);
                            setIsDeleteBedModalOpen(true);
                          }}
                        >
                          <FaTrash style={{ color: "#d32f2f" }} />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {selectedBed && !isDeleteBedModalOpen && !isAddBedFormOpen && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1">
                  Update {selectedBed.name}
                </Typography>
                <TextField
                  label="Bed Name"
                  value={bedForm.name}
                  onChange={(e) =>
                    setBedForm({ ...bedForm, name: e.target.value })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={bedForm.price}
                  onChange={(e) =>
                    setBedForm({
                      ...bedForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" onClick={updateBed}>
                  Update Bed
                </Button>
              </Box>
            )}
          </Box>
        </Modal>
      )}

      {/* Bed Delete Confirmation Modal */}
      {isDeleteBedModalOpen && selectedBed && (
        <Modal
          open={isDeleteBedModalOpen}
          onClose={() => setIsDeleteBedModalOpen(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 },
              bgcolor: "background.paper",
              border: "2px solid #d32f2f",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{ mb: 2, color: "#d32f2f" }}
            >
              Confirm Bed Deletion
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Are you sure you want to delete{" "}
              <strong>{selectedBed.name}</strong>? This action cannot be undone.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#d32f2f" }}
                onClick={deleteBed}
              >
                Yes, Delete
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsDeleteBedModalOpen(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Edit Room Modal */}
      {isEditModalOpen && selectedRoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white flex flex-col z-50 no-scrollbar"
        >
          <div className="flex justify-between items-center mb-4 p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Edit Room</h2>
            <motion.button
              onClick={closeEditModal}
              whileHover={{ scale: 1.1 }}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <form
              onSubmit={handleEditSubmit}
              className="space-y-4 max-w-4xl mx-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editedRoomData.name}
                  onChange={handleEditRoomChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  name="type"
                  value={editedRoomData.type}
                  onChange={handleEditRoomChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Room Type</option>
                  <option value="Single Sharing">Single Sharing</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                  <option value="Five Sharing">Five Sharing</option>
                  <option value="Six Sharing">Six Sharing</option>
                </select>
              </div>
               {/*<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                
                <input
                  type="number"
                  name="price"
                  value={editedRoomData.price}
                  onChange={handleEditRoomChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>*/}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={editedRoomData.capacity}
                  onChange={handleEditRoomChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Facilities
                </h3>
                {Object.entries(editedRoomData.facilities).map(
                  ([category, subKeys]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 capitalize">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {Object.entries(subKeys).map(([subKey, value]) => (
                          <label
                            key={subKey}
                            className={`flex items-center text-sm text-gray-700 p-2 rounded-lg ${getFacilityColor(
                              category,
                              subKey
                            )} border border-gray-200 shadow-sm`}
                          >
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() =>
                                handleFacilityChange(category, subKey)
                              }
                              className="mr-2"
                            />
                            <span className="capitalize">
                              {subKey.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium"
              >
                Update Room
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RoomOverview;