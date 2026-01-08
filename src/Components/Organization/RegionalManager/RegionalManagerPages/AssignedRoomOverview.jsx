import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaBed, FaHome, FaSnowflake, FaFan, FaLightbulb, FaChair, FaLock, FaWifi, FaBolt,
  FaShieldAlt, FaCamera, FaParking, FaShoppingCart, FaHospital, FaDumbbell, FaTree,
  FaSchool, FaSpinner, FaPlus, FaEdit, FaTrash, FaEye, FaArrowLeft
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Modal, Box, Typography, Button, Card, CardContent, IconButton,
  TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

const AssignedRoomOverview = () => {
  const { propertyId } = useParams();
  const token = localStorage.getItem("token");

  const [rooms, setRooms] = useState([]);
  const [roomImages, setRoomImages] = useState({});
  const [imageIndices, setImageIndices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoomForDelete, setSelectedRoomForDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Bed Modal
  const [beds, setBeds] = useState([]);
  const [bedImages, setBedImages] = useState({});
  const [bedImageIndices, setBedImageIndices] = useState({});
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isDeleteBedModalOpen, setIsDeleteBedModalOpen] = useState(false);
  const [bedForm, setBedForm] = useState({ name: "", price: "" });
  const [newBedData, setNewBedData] = useState({ name: "", price: "" });
  const [isAddBedFormOpen, setIsAddBedFormOpen] = useState(false);

  // Fullscreen
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenRoomId, setFullScreenRoomId] = useState(null);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);
  const [isBedFullScreenOpen, setIsBedFullScreenOpen] = useState(false);
  const [bedFullScreenBedId, setBedFullScreenBedId] = useState(null);
  const [bedFullScreenIndex, setBedFullScreenIndex] = useState(0);

  // Image Delete
  const [isImageDeleteDialogOpen, setIsImageDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  // Edit Room
  const [editedRoomData, setEditedRoomData] = useState({
    name: "", type: "", price: "", capacity: "", status: "Available",
    facilities: {
      roomEssentials: { bed: false, mattress: false, pillow: false, blanket: false, fan: false, light: false, chargingPoint: false, cupboardWardrobe: false, tableStudyDesk: false, chair: false, roomLock: false },
      comfortFeatures: { ac: false, cooler: false, heater: false, ceilingFan: false, window: false, balcony: false, ventilation: false, curtains: false },
      washroomHygiene: { attachedBathroom: false, commonBathroom: false, westernToilet: false, indianToilet: false, geyser: false, water24x7: false, washBasins: false, mirror: false, bucketMug: false, cleaningService: false },
      utilitiesConnectivity: { wifi: false, powerBackup: false, electricityIncluded: false, waterIncluded: false, gasIncluded: false, maintenanceIncluded: false, tv: false, dthCable: false },
      laundryHousekeeping: { washingMachine: false, laundryArea: false, dryingSpace: false, ironTable: false },
      securitySafety: { cctv: false, biometricEntry: false, securityGuard: false, visitorRestricted: false, fireSafety: false },
      parkingTransport: { bikeParking: false, carParking: false, coveredParking: false, nearBus: false, nearMetro: false },
      nearbyFacilities: { grocery: false, hospital: false, gym: false, park: false, schoolCollege: false, marketMall: false },
      propertySpecific: { liftAvailable: false, guestAllowed: false, hall: false, modularKitchen: false, separateEntry: false },
    },
  });

  // Fetch Data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Please login to continue");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("https://api.gharzoreality.com/api/regional-managers/assigned-properties", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch properties");

        const result = await res.json();
        if (!result.success || !result.data.length) throw new Error("No properties found");

        const property = result.data.find(p => p.propertyId === propertyId) || result.data[0];
        if (!property || !property.rooms) throw new Error("Property data incomplete");

        const processedRooms = property.rooms.map(room => ({
          ...room,
          availableBeds: room.beds?.filter(b => b.status === "Available").length || 0,
          totalBeds: room.beds?.length || 0,
        }));

        setRooms(processedRooms);

        const imagesObj = {};
        processedRooms.forEach(room => {
          imagesObj[room.roomId] = room.images || [];
        });
        setRoomImages(imagesObj);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, token]);

  // Image Navigation
  const handleImageChange = (id, direction, type = "room") => {
    const images = type === "room" ? roomImages[id] : bedImages[id];
    const setIndex = type === "room" ? setImageIndices : setBedImageIndices;
    const indices = type === "room" ? imageIndices : bedImageIndices;

    setIndex(prev => {
      const current = prev[id] || 0;
      let newIndex = direction === "prev"
        ? (current > 0 ? current - 1 : images.length - 1)
        : (current < images.length - 1 ? current + 1 : 0);
      return { ...prev, [id]: newIndex };
    });
  };

  // Fullscreen
  const openFullScreen = (roomId, index = 0) => {
    setFullScreenRoomId(roomId);
    setFullScreenIndex(index);
    setIsFullScreenOpen(true);
  };

  const openBedFullScreen = (bedId, index = 0) => {
    setBedFullScreenBedId(bedId);
    setBedFullScreenIndex(index);
    setIsBedFullScreenOpen(true);
  };

  // Modals
  const openModal = (room) => { setSelectedRoom(room); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedRoom(null); };

  const openBedModal = (room) => {
    setSelectedRoom(room);
    setBeds(room.beds.map(b => ({ ...b, name: b.name || b.bedId })));
    const imgObj = {};
    room.beds.forEach(bed => { imgObj[bed.bedId] = bed.images || []; });
    setBedImages(imgObj);
    setIsBedModalOpen(true);
  };

  const openDeleteModal = (room) => { setSelectedRoomForDelete(room); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedRoomForDelete(null); };

  const handleDeleteRoom = () => {
    setRooms(prev => prev.filter(r => r.roomId !== selectedRoomForDelete.roomId));
    toast.success("Room deleted successfully!");
    closeDeleteModal();
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setEditedRoomData({
      name: room.name,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      status: room.status,
      facilities: room.facilities || editedRoomData.facilities,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    setRooms(prev => prev.map(r =>
      r.roomId === selectedRoom.roomId
        ? { ...r, ...editedRoomData, price: Number(editedRoomData.price), capacity: Number(editedRoomData.capacity) }
        : r
    ));
    toast.success("Room updated successfully!");
    setIsEditModalOpen(false);
  };

  // Bed Operations
  const addBed = () => {
    if (!newBedData.name || !newBedData.price) {
      toast.error("Please fill name and price");
      return;
    }
    const newBed = {
      bedId: `BED-${Date.now()}`,
      name: newBedData.name,
      price: Number(newBedData.price),
      status: "Available",
      images: [],
      tenants: [],
      monthlyCollection: 0,
      pendingDues: 0,
    };
    setRooms(prev => prev.map(r =>
      r.roomId === selectedRoom.roomId
        ? { ...r, beds: [...r.beds, newBed], totalBeds: r.totalBeds + 1, availableBeds: r.availableBeds + 1 }
        : r
    ));
    toast.success("Bed added!");
    setNewBedData({ name: "", price: "" });
    setIsAddBedFormOpen(false);
  };

  const updateBed = () => {
    setRooms(prev => prev.map(r =>
      r.roomId === selectedRoom.roomId
        ? {
            ...r,
            beds: r.beds.map(b => b.bedId === selectedBed.bedId ? { ...b, ...bedForm, price: Number(bedForm.price) } : b)
          }
        : r
    ));
    toast.success("Bed updated!");
    setIsBedModalOpen(false);
  };

  const deleteBed = () => {
    setRooms(prev => prev.map(r =>
      r.roomId === selectedRoom.roomId
        ? {
            ...r,
            beds: r.beds.filter(b => b.bedId !== selectedBed.bedId),
            totalBeds: r.totalBeds - 1,
            availableBeds: r.availableBeds - (selectedBed.status === "Available" ? 1 : 0)
          }
        : r
    ));
    toast.success("Bed deleted!");
    setIsDeleteBedModalOpen(false);
    setSelectedBed(null);
  };

  // Image Delete
  const deleteRoomImage = (roomId, url) => {
    setRoomImages(prev => ({ ...prev, [roomId]: prev[roomId].filter(i => i !== url) }));
    setRooms(prev => prev.map(r => r.roomId === roomId ? { ...r, images: r.images.filter(i => i !== url) } : r));
    toast.success("Image deleted");
  };

  const handleConfirmImageDelete = () => {
    if (deleteType === "room") deleteRoomImage(fullScreenRoomId, imageToDelete);
    if (deleteType === "bed") {
      setBedImages(prev => ({ ...prev, [bedFullScreenBedId]: prev[bedFullScreenBedId].filter(i => i !== imageToDelete) }));
      toast.success("Bed image deleted");
    }
    setIsImageDeleteDialogOpen(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <FaSpinner className="text-7xl text-blue-600" />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-center p-6">
      <div>
        <p className="text-red-600 text-2xl mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center text-gray-800 mb-12"
        >
          Assigned Property Rooms
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {rooms.map((room) => {
            const images = roomImages[room.roomId] || [];
            const idx = imageIndices[room.roomId] || 0;

            return (
              <motion.div
                key={room.roomId}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
              >
                <div
                  className="relative h-72 bg-gray-200 cursor-pointer"
                  onClick={() => images.length > 0 && openFullScreen(room.roomId, idx)}
                >
                  {images.length > 0 ? (
                    <>
                      <motion.img
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={images[idx]}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleImageChange(room.roomId, 'prev'); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full text-2xl hover:bg-black/80 transition">‹</button>
                          <button onClick={(e) => { e.stopPropagation(); handleImageChange(room.roomId, 'next'); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full text-2xl hover:bg-black/80 transition">›</button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
                      <FaBed className="text-9xl text-blue-300 opacity-70" />
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{room.name}</h3>
                  <p className="text-gray-600 text-lg mb-4">{room.type}</p>

                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-5 py-2 rounded-full text-sm font-bold ${room.status === "Available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {room.status}
                    </span>
                    <span className="text-3xl font-bold text-blue-600">₹{room.price}</span>
                  </div>

                  <div className="text-lg text-gray-700 mb-6">
                    Available Beds: <strong className="text-green-600">{room.availableBeds}/{room.totalBeds}</strong>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => openBedModal(room)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:from-purple-600 hover:to-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <FaEye /> Beds
                    </button>
                    <button
                      onClick={() => openModal(room)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-600 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Room Image */}
      {isFullScreenOpen && fullScreenRoomId && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-8" onClick={() => setIsFullScreenOpen(false)}>
          <div className="relative max-w-6xl max-h-full" onClick={e => e.stopPropagation()}>
            <img
              src={roomImages[fullScreenRoomId][fullScreenIndex]}
              alt="Fullscreen"
              className="max-w-full max-h-screen object-contain rounded-2xl"
            />
            <button onClick={() => handleImageChange(fullScreenRoomId, 'prev')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-4 rounded-full text-4xl hover:bg-white/40 transition">‹</button>
            <button onClick={() => handleImageChange(fullScreenRoomId, 'next')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-4 rounded-full text-4xl hover:bg-white/40 transition">›</button>
            <button onClick={() => setIsFullScreenOpen(false)} className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full text-2xl hover:bg-white/40 transition">×</button>
          </div>
        </div>
      )}

      {/* Bed Fullscreen */}
      {isBedFullScreenOpen && bedFullScreenBedId && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-8" onClick={() => setIsBedFullScreenOpen(false)}>
          <div className="relative max-w-6xl max-h-full" onClick={e => e.stopPropagation()}>
            <img
              src={bedImages[bedFullScreenBedId][bedFullScreenIndex]}
              alt="Bed Fullscreen"
              className="max-w-full max-h-screen object-contain rounded-2xl"
            />
            <button onClick={() => handleImageChange(bedFullScreenBedId, 'prev', 'bed')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-4 rounded-full text-4xl hover:bg-white/40 transition">‹</button>
            <button onClick={() => handleImageChange(bedFullScreenBedId, 'next', 'bed')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-4 rounded-full text-4xl hover:bg-white/40 transition">›</button>
            <button onClick={() => setIsBedFullScreenOpen(false)} className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full text-2xl hover:bg-white/40 transition">×</button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isModalOpen && selectedRoom && (
        <Modal open={isModalOpen} onClose={closeModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', md: 900 }, maxHeight: '90vh', bgcolor: 'white', borderRadius: 4, p: 6, overflowY: 'auto', boxShadow: 24 }}>
            <Typography variant="h4" className="font-bold mb-6 text-center text-blue-600">{selectedRoom.name}</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="h6">Basic Info</Typography>
                <Typography>Type: <strong>{selectedRoom.type}</strong></Typography>
                <Typography>Price: <strong className="text-green-600">₹{selectedRoom.price}/month</strong></Typography>
                <Typography>Capacity: <strong>{selectedRoom.capacity} persons</strong></Typography>
                <Typography>Status: <strong className={selectedRoom.status === "Available" ? "text-green-600" : "text-red-600"}>{selectedRoom.status}</strong></Typography>
                <Typography>Beds: <strong>{selectedRoom.availableBeds} available / {selectedRoom.totalBeds} total</strong></Typography>
              </div>
              <div>
                <Typography variant="h6">Actions</Typography>
                <div className="flex gap-4 mt-4">
                  <Button variant="contained" color="primary" startIcon={<FaEdit />} onClick={() => { openEditModal(selectedRoom); closeModal(); }}>
                    Edit Room
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<FaTrash />} onClick={() => { openDeleteModal(selectedRoom); closeModal(); }}>
                    Delete Room
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={closeModal} variant="contained" fullWidth sx={{ mt: 6 }}>Close</Button>
          </Box>
        </Modal>
      )}

      {/* Bed Modal */}
      {isBedModalOpen && selectedRoom && (
        <Modal open={isBedModalOpen} onClose={() => setIsBedModalOpen(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', md: 1000 }, maxHeight: '90vh', bgcolor: 'white', borderRadius: 4, p: 6, overflowY: 'auto' }}>
            <Typography variant="h5" className="font-bold mb-6">Beds in {selectedRoom.name}</Typography>
            <Button variant="contained" startIcon={<FaPlus />} onClick={() => setIsAddBedFormOpen(true)} sx={{ mb: 4 }}>
              Add New Bed
            </Button>

            {isAddBedFormOpen && (
              <Box sx={{ mb: 6, p: 4, border: '2px dashed #1976d2', borderRadius: 3 }}>
                <Typography variant="h6" className="mb-4">Add New Bed</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Bed Name" value={newBedData.name} onChange={e => setNewBedData({ ...newBedData, name: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Price" type="number" value={newBedData.price} onChange={e => setNewBedData({ ...newBedData, price: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" color="success" onClick={addBed}>Save Bed</Button>
                    <Button variant="outlined" sx={{ ml: 2 }} onClick={() => setIsAddBedFormOpen(false)}>Cancel</Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Grid container spacing={4}>
              {beds.map(bed => {
                const imgs = bedImages[bed.bedId] || [];
                const idx = bedImageIndices[bed.bedId] || 0;
                return (
                  <Grid item xs={12} sm={6} md={4} key={bed.bedId}>
                    <Card sx={{ height: '100%', boxShadow: 6 }}>
                      <CardContent>
                        {imgs.length > 0 ? (
                          <div className="relative h-48 mb-4 cursor-pointer" onClick={() => openBedFullScreen(bed.bedId, idx)}>
                            <img src={imgs[idx]} alt={bed.name} className="w-full h-full object-cover rounded-lg" />
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <FaBed className="text-6xl text-blue-400" />
                          </div>
                        )}
                        <Typography variant="h6">{bed.name}</Typography>
                        <Typography>Price: <strong>₹{bed.price}</strong></Typography>
                        <Typography>Status: <strong className={bed.status === "Available" ? "text-green-600" : "text-red-600"}>{bed.status}</strong></Typography>
                        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                          <IconButton color="primary" onClick={() => { setSelectedBed(bed); setBedForm({ name: bed.name, price: bed.price }); }}>
                            <FaEdit />
                          </IconButton>
                          <IconButton color="error" onClick={() => { setSelectedBed(bed); setIsDeleteBedModalOpen(true); }}>
                            <FaTrash />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {selectedBed && bedForm.name && (
              <Box sx={{ mt: 6, p: 4, border: '2px solid #1976d2', borderRadius: 3 }}>
                <Typography variant="h6" className="mb-4">Update {selectedBed.name}</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Name" value={bedForm.name} onChange={e => setBedForm({ ...bedForm, name: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Price" type="number" value={bedForm.price} onChange={e => setBedForm({ ...bedForm, price: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={updateBed}>Update Bed</Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Modal>
      )}

      {/* Delete Confirmations */}
      <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <DialogTitle>Delete Room?</DialogTitle>
        <DialogContent>Are you sure you want to delete <strong>{selectedRoomForDelete?.name}</strong>?</DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal}>Cancel</Button>
          <Button onClick={handleDeleteRoom} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteBedModalOpen} onClose={() => setIsDeleteBedModalOpen(false)}>
        <DialogTitle>Delete Bed?</DialogTitle>
        <DialogContent>Are you sure you want to delete <strong>{selectedBed?.name}</strong>?</DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteBedModalOpen(false)}>Cancel</Button>
          <Button onClick={deleteBed} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Modal */}
      {isEditModalOpen && selectedRoom && (
        <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', md: 900 }, maxHeight: '90vh', bgcolor: 'white', borderRadius: 4, p: 6, overflowY: 'auto' }}>
            <Typography variant="h5" className="font-bold mb-6">Edit Room</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Room Name" value={editedRoomData.name} onChange={e => setEditedRoomData({ ...editedRoomData, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Price" type="number" value={editedRoomData.price} onChange={e => setEditedRoomData({ ...editedRoomData, price: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Capacity" type="number" value={editedRoomData.capacity} onChange={e => setEditedRoomData({ ...editedRoomData, capacity: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Status" value={editedRoomData.status} onChange={e => setEditedRoomData({ ...editedRoomData, status: e.target.value })}>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Occupied">Occupied</option>
                </TextField>
              </Grid>
            </Grid>
            <Button onClick={handleEditSubmit} variant="contained" fullWidth sx={{ mt: 6, py: 2 }} color="primary">
              Save Changes
            </Button>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default AssignedRoomOverview;