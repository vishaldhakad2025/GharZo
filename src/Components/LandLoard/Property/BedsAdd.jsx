import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBed,
  FaMoneyBillWave,
  FaToggleOn,
  FaTimes,
  FaTrash,
  FaEye,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl"; // Adjust path as needed

// Custom Dialog Component (reused)
const CustomDialog = ({ isOpen, onClose, title, message, onConfirm, confirmText, cancelText, isConfirmDialog }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          {isConfirmDialog && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200"
            >
              {cancelText || "Cancel"}
            </button>
          )}
          <button
            onClick={isConfirmDialog ? onConfirm : onClose}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              isConfirmDialog
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {confirmText || (isConfirmDialog ? "Confirm" : "OK")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Image Carousel for Beds (reused and adapted)
const BedImageCarousel = ({ images, onImageClick, bedId, roomId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) {
    return <div className="h-32 bg-gray-200 flex items-center justify-center rounded">No Images</div>;
  }
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const handleClick = () => onImageClick('bed', images, currentIndex, roomId, bedId);
  return (
    <div className="relative w-full h-32 cursor-pointer" onClick={handleClick}>
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`Bed Image ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded"
        loading="lazy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full">
            <FaChevronLeft size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full">
            <FaChevronRight size={12} />
          </button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, idx) => (
              <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Full-Screen Image Modal (reused)
const ImageModal = ({ isOpen, onClose, type, images, currentIndex, roomId, bedId }) => {
  const [modalIndex, setModalIndex] = useState(currentIndex);
  useEffect(() => {
    if (isOpen) {
      setModalIndex(currentIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, currentIndex]);
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  if (!isOpen || !images || images.length === 0) return null;
  const nextSlide = () => setModalIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setModalIndex((prev) => (prev - 1 + images.length) % images.length);
  const handleClick = (e) => { if (e.target === e.currentTarget) onClose(); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50" onClick={handleClick}>
      <motion.div className="relative w-full h-full flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.img
          key={modalIndex}
          src={images[modalIndex]}
          alt={`${type === 'room' ? 'Room' : 'Bed'} Image ${modalIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          loading="lazy"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 text-2xl">
              <FaChevronLeft />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 text-2xl">
              <FaChevronRight />
            </button>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setModalIndex(idx); }} className={`w-3 h-3 rounded-full ${idx === modalIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`} />
              ))}
            </div>
          </>
        )}
        <button onClick={onClose} className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
          <FaTimes size={20} />
        </button>
      </motion.div>
    </div>
  );
};

const BedsAdd = () => {
  const { propertyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");
  const viewMode = searchParams.get("view") === "true";
  const API_BASE = `${baseurl}api/landlord/properties/${propertyId}/rooms`;
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddBedForm, setShowAddBedForm] = useState(false);
  const [selectedRoomIdForAdd, setSelectedRoomIdForAdd] = useState(roomId || null);
  const [newBeds, setNewBeds] = useState([{ name: "", price: "", status: "Available", images: [] }]);
  const [editBedModal, setEditBedModal] = useState({ open: false, bed: null });
  const [editBedNewImages, setEditBedNewImages] = useState([]);
  const [editBedLoading, setEditBedLoading] = useState(false);
  const [editBedError, setEditBedError] = useState("");
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
    cancelText: "",
    isConfirmDialog: false,
  });
  const [imageModal, setImageModal] = useState({ open: false, type: '', images: [], currentIndex: 0, roomId: '', bedId: '' });

  // Subscription related states removed
  // const [globalTotalBeds, setGlobalTotalBeds] = useState(0);
  // const [totalLimit, setTotalLimit] = useState(0);
  // const [landlordId, setLandlordId] = useState(null);

  const getToken = () => localStorage.getItem("token");
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleOpenImageModal = useCallback((type, images, index = 0, roomId, bedId) => {
    setImageModal({ open: true, type, images, currentIndex: index, roomId, bedId });
  }, []);
  const handleCloseImageModal = useCallback(() => {
    setImageModal({ open: false, type: '', images: [], currentIndex: 0, roomId: '', bedId: '' });
  }, []);

  // Subscription related fetches removed
  // const fetchGlobalBedsCount = useCallback(async () => { ... });
  // const fetchMySubscriptions = useCallback(async () => { ... });
  // useEffect(() => { fetchGlobalBedsCount(); }, [fetchGlobalBedsCount]);
  // useEffect(() => { if (landlordId) fetchMySubscriptions(); }, [landlordId, fetchMySubscriptions]);

  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) throw new Error("No authentication token found. Please log in.");
      let url = `${baseurl}api/landlord/properties/${propertyId}/beds`;
      if (roomId) url += `?roomId=${roomId}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      let fetchedBeds = res.data.beds || [];
      fetchedBeds = await Promise.all(
        fetchedBeds.map(async (bed) => {
          const bedImagesRes = await axios.get(
            `${API_BASE}/${bed.roomId}/beds/${bed.bedId}/images`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...bed, images: bedImagesRes.data.images || [] };
        })
      );
      setBeds(fetchedBeds);
    } catch (err) {
      console.error("Error fetching beds:", err.response?.data || err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, roomId, API_BASE]);

  const debouncedFetchBeds = useCallback(debounce(fetchBeds, 300), [fetchBeds]);

  useEffect(() => {
    if (propertyId) debouncedFetchBeds();
  }, [propertyId, debouncedFetchBeds]);

  const deleteBedImage = async (targetRoomId, bedId, imageUrl) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found. Please log in.");
      const res = await axios.delete(
        `${API_BASE}/${targetRoomId}/beds/${bedId}/images`,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          data: { imageUrls: [imageUrl] },
        }
      );
      if (res.data.success) {
        setBeds((prev) => prev.map((b) => b.bedId === bedId ? { ...b, images: b.images.filter((img) => img !== imageUrl) } : b));
        setDialog({
          isOpen: true,
          title: "Success",
          message: res.data.message || "Image deleted successfully.",
          isConfirmDialog: false,
        });
        return true;
      } else {
        throw new Error(res.data.message || "Failed to delete image.");
      }
    } catch (err) {
      console.error("Error deleting bed image:", err.response?.data || err);
      setError(err.response?.data?.message || `Failed to delete image: ${err.message}`);
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to delete image: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
      return false;
    }
  };

  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...newBeds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };
    setNewBeds(updatedBeds);
  };

  const handleBedImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedBeds = [...newBeds];
    updatedBeds[index] = {
      ...updatedBeds[index],
      images: [...updatedBeds[index].images.filter(img => !(img instanceof File)), ...files]
    };
    setNewBeds(updatedBeds);
  };

  const addBedField = () => {
    setNewBeds([...newBeds, { name: "", price: "", status: "Available", images: [] }]);
  };

  const removeBedField = (index) => {
    setNewBeds(newBeds.filter((_, i) => i !== index));
  };

  const handleBedSubmit = async (e) => {
    e.preventDefault();

    // Subscription limit check removed

    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) throw new Error("No authentication token found. Please log in.");
      if (!selectedRoomIdForAdd) {
        throw new Error("Please select a room to add beds to.");
      }
      const savedBeds = [];
      for (const bed of newBeds) {
        if (!bed.name || !bed.price) throw new Error("Bed name and price are required.");
        const payload = { name: bed.name, price: Number(bed.price), status: bed.status };
        const res = await axios.post(`${API_BASE}/${selectedRoomIdForAdd}/beds`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const savedBed = res.data.bed;
        const savedBedId = savedBed?.bedId;
        if (bed.images && bed.images.length > 0 && savedBedId) {
          const imagesToUpload = bed.images.filter(img => img instanceof File);
          if (imagesToUpload.length > 0) {
            const formData = new FormData();
            imagesToUpload.forEach((image) => formData.append("images", image));
            const imageRes = await axios.post(
              `${API_BASE}/${selectedRoomIdForAdd}/beds/${savedBedId}/images`,
              formData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            savedBed.images = imageRes.data.images || [];
          } else {
            savedBed.images = bed.images;
          }
        }
        savedBeds.push(savedBed);
      }
      setNewBeds([{ name: "", price: "", status: "Available", images: [] }]);
      await fetchBeds();
      // fetchGlobalBedsCount removed
      setShowAddBedForm(false);
      setDialog({
        isOpen: true,
        title: "Success",
        message: "Beds added successfully.",
        isConfirmDialog: false,
      });
    } catch (err) {
      console.error("Error adding beds:", err.response?.data || err);
      setError(err.response?.data?.message || `Failed to add beds: ${err.message}`);
      setDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to add beds: ${err.response?.data?.message || err.message}`,
        isConfirmDialog: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBed = (bed) => {
    setEditBedModal({ open: true, bed: { ...bed } });
    setEditBedNewImages([]);
    setEditBedError("");
  };

  const handleEditBedChange = (field, value) => {
    setEditBedModal((prev) => ({
      ...prev,
      bed: { ...prev.bed, [field]: value },
    }));
  };

  const handleEditBedImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditBedNewImages(files);
  };

  const handleEditBedSubmit = async (e) => {
    e.preventDefault();
    setEditBedLoading(true);
    setEditBedError("");
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found. Please log in.");
      const { bed } = editBedModal;
      const payload = { price: Number(bed.price), status: bed.status };
      const res = await axios.put(`${API_BASE}/${bed.roomId}/beds/${bed.bedId}`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      let updatedImages = bed.images || [];
      if (editBedNewImages.length > 0) {
        const formData = new FormData();
        editBedNewImages.forEach((image) => formData.append("images", image));
        const imageRes = await axios.post(
          `${API_BASE}/${bed.roomId}/beds/${bed.bedId}/images`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedImages = [...updatedImages, ...(imageRes.data.images || [])];
      }
      if (res.data.success) {
        setBeds((prev) => prev.map((b) => b.bedId === bed.bedId ? { ...b, price: bed.price, status: bed.status, images: updatedImages } : b));
        setEditBedModal({ open: false, bed: null });
        setEditBedNewImages([]);
        setDialog({
          isOpen: true,
          title: "Success",
          message: res.data.message || "Bed updated successfully.",
          isConfirmDialog: false,
        });
        await fetchBeds();
        // await fetchGlobalBedsCount(); removed
      } else {
        throw new Error(res.data.message || "Failed to update bed.");
      }
    } catch (err) {
      console.error("Error updating bed:", err.response?.data || err);
      setEditBedError(err.response?.data?.message || `Failed to update bed: ${err.message}`);
    } finally {
      setEditBedLoading(false);
    }
  };

  const handleDeleteBed = async (bed) => {
    setDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: `Are you sure you want to delete bed ${bed.name}?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          setError(null);
          const token = getToken();
          if (!token) throw new Error("No authentication token found. Please log in.");
          const res = await axios.delete(`${API_BASE}/${bed.roomId}/beds/${bed.bedId}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          if (res.data.success) {
            setBeds((prev) => prev.filter((b) => b.bedId !== bed.bedId));
            setDialog({
              isOpen: true,
              title: "Success",
              message: res.data.message || "Bed deleted successfully.",
              isConfirmDialog: false,
            });
            await fetchBeds();
            // await fetchGlobalBedsCount(); removed
          } else {
            throw new Error(res.data.message || "Failed to delete bed.");
          }
        } catch (err) {
          console.error("Error deleting bed:", err.response?.data || err);
          setError(err.response?.data?.message || `Failed to delete bed: ${err.message}`);
          setDialog({
            isOpen: true,
            title: "Error",
            message: `Failed to delete bed: ${err.response?.data?.message || err.message}`,
            isConfirmDialog: false,
          });
        } finally {
          setLoading(false);
        }
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      isConfirmDialog: true,
    });
  };

  const resetBedForm = () => {
    setShowAddBedForm(false);
    setSelectedRoomIdForAdd(roomId || null);
    setNewBeds([{ name: "", price: "", status: "Available", images: [] }]);
  };

  // Subscription check removed from Add Beds button
  const handleAddBeds = () => {
    setShowAddBedForm(true);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-gray-100 min-h-screen text-black">
      <motion.h2 className="text-3xl font-bold mb-6 text-center" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Beds {roomId ? "(Filtered by Room)" : "(All Rooms)"}
      </motion.h2>

      {/* Subscription warning banner removed */}
      {/* {globalTotalBeds > totalLimit && ( ... )} */}

      {!viewMode && (
        <div className="text-center mb-6">
          <motion.button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 mr-4" onClick={handleAddBeds} whileTap={{ scale: 0.95 }}>
            <FaPlus className="inline mr-2" /> Add Beds
          </motion.button>
          <motion.button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600" onClick={() => navigate(`/properties/${propertyId}/rooms`)} whileTap={{ scale: 0.95 }}>
            Back to Rooms
          </motion.button>
        </div>
      )}

      {beds.length === 0 ? (
        <p className="text-center text-gray-500">No beds found{roomId ? " in this room." : "."}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beds.map((bed, index) => (
            <motion.div key={`${bed.bedId}-${index}`} className="bg-white rounded-xl shadow-md p-4" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <BedImageCarousel images={bed.images} onImageClick={handleOpenImageModal} bedId={bed.bedId} roomId={bed.roomId} />
              <h3 className="text-lg font-semibold mt-2">{bed.name}</h3>
              <p className="text-sm text-gray-600">ID: {bed.bedId}</p>
              <p className="text-green-600 font-medium">₹{bed.price}</p>
              <p className="text-sm">Status: <span className={`px-2 py-1 rounded ${bed.status === 'Available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{bed.status}</span></p>
              <p className="text-sm">Room ID: {bed.roomId}</p>
              <p className="text-sm">Tenants: {bed.tenants?.length || 0}</p>
              {!viewMode && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEditBed(bed)} className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm hover:bg-yellow-600">
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDeleteBed(bed)} className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600">
                    <FaTrash className="inline mr-1" /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showAddBedForm && !viewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div className="bg-gray-50 p-6 rounded-2xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Beds to Room</h3>
              <button onClick={resetBedForm} className="text-gray-600 hover:text-black"><FaTimes /></button>
            </div>
            {selectedRoomIdForAdd ? (
              <form onSubmit={handleBedSubmit} className="space-y-4">
                {newBeds.map((bed, index) => (
                  <div key={index} className="border p-4 rounded bg-white">
                    <input
                      type="text"
                      placeholder="Bed Name"
                      value={bed.name}
                      onChange={(e) => handleBedChange(index, "name", e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={bed.price}
                      onChange={(e) => handleBedChange(index, "price", e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      required
                    />
                    <select
                      value={bed.status}
                      onChange={(e) => handleBedChange(index, "status", e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                    <input
                      type="file"
                      onChange={(e) => handleBedImageChange(index, e)}
                      className="w-full p-2 border rounded mb-2"
                      multiple
                      accept="image/*"
                    />
                    {bed.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bed.images.map((img, i) => (
                          <img key={i} src={img instanceof File ? URL.createObjectURL(img) : img} alt={`Preview ${i + 1}`} className="h-16 w-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    {index > 0 && (
                      <button type="button" onClick={() => removeBedField(index)} className="bg-red-500 text-white px-4 py-1 rounded">
                        Remove Bed
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addBedField} className="w-full bg-gray-500 text-white py-2 rounded">
                  Add Another Bed
                </button>
                <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded">
                  {loading ? "Saving..." : "Save Beds"}
                </button>
              </form>
            ) : (
              <p>Select a room to add beds.</p>
            )}
          </motion.div>
        </div>
      )}

      {editBedModal.open && !viewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">Edit Bed</h3>
              <button onClick={() => setEditBedModal({ open: false, bed: null })}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditBedSubmit} className="space-y-4">
              <input type="text" value={editBedModal.bed.name} disabled className="w-full p-2 border rounded bg-gray-100" />
              <input type="text" value={editBedModal.bed.bedId} disabled className="w-full p-2 border rounded bg-gray-100" />
              <input
                type="number"
                value={editBedModal.bed.price}
                onChange={(e) => handleEditBedChange("price", e.target.value)}
                placeholder="Price"
                className="w-full p-2 border rounded"
                required
              />
              <select
                value={editBedModal.bed.status}
                onChange={(e) => handleEditBedChange("status", e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Not Available">Not Available</option>
              </select>
              <input type="file" onChange={handleEditBedImageChange} multiple accept="image/*" className="w-full p-2 border rounded" />
              {editBedNewImages.length > 0 && (
                <div className="flex gap-2">
                  {editBedNewImages.map((file, i) => (
                    <img key={i} src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  ))}
                </div>
              )}
              {editBedError && <p className="text-red-500 text-sm">{editBedError}</p>}
              <button type="submit" disabled={editBedLoading} className="w-full bg-blue-500 text-white py-2 rounded">
                {editBedLoading ? "Saving..." : "Update Bed"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <ImageModal
        isOpen={imageModal.open}
        onClose={handleCloseImageModal}
        type={imageModal.type}
        images={imageModal.images}
        currentIndex={imageModal.currentIndex}
        roomId={imageModal.roomId}
        bedId={imageModal.bedId}
      />

      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        isConfirmDialog={dialog.isConfirmDialog}
      />
    </div>
  );
};

export default BedsAdd;