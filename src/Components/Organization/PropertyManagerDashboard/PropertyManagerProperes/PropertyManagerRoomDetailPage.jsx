import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LazyImage from "../../../Common/LazyImage";

/* --------------------------------------------------------------- */
/* Axios instance */
/* --------------------------------------------------------------- */
const api = axios.create({
  baseURL: "https://api.gharzoreality.com/api/pm",
});

/* --------------------------------------------------------------- */
/* Helper – get auth token */
/* --------------------------------------------------------------- */
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found. Please log in.");
  return token;
};

/* --------------------------------------------------------------- */
/* Main component – FULL ROOM DETAILS + EDIT + IMAGES */
/* --------------------------------------------------------------- */
export default function PropertyManagerRoomDetailPage() {
  const { propertyId, roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Full edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    floorNumber: "",
    price: "",
    capacity: "",
    type: "",
    status: "Available",
    roomSize: "",
    securityDeposit: "",
    noticePeriod: "30",
    facilities: {
      roomEssentials: { bed: false, fan: false, light: false, chair: false },
      comfortFeatures: { ac: false },
      washroomHygiene: { westernToilet: false },
      utilitiesConnectivity: { wifi: false, powerBackup: false },
      securitySafety: { cctv: false, securityGuard: false },
      parkingTransport: { bikeParking: false, carParking: false },
      nearbyFacilities: { hospital: false },
    },
    beds: [],
    images: [], // Will hold image URLs
    newImages: [], // For file uploads
  });

  /* ----------------------- Fetch Room + Images ----------------------- */
  const fetchRoomDetails = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const token = getToken();
      const [roomRes, imgRes] = await Promise.all([
        api.get(`/properties/${propertyId}/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/rooms/${propertyId}/rooms/${roomId}/images`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (roomRes.data?.success) {
        const data = {
          ...roomRes.data.room,
          images: imgRes.data?.images || [],
        };
        setRoom(data);
        setEditForm({
          name: data.name || "",
          floorNumber: data.floorNumber || "",
          price: data.price?.toString() || "",
          capacity: data.capacity?.toString() || "",
          type: data.type || "",
          status: data.status || "Available",
          roomSize: data.roomSize || "",
          securityDeposit: data.securityDeposit?.toString() || "",
          noticePeriod: data.noticePeriod?.toString() || "30",
          facilities: {
            roomEssentials: {
              bed: data.facilities?.roomEssentials?.bed || false,
              fan: data.facilities?.roomEssentials?.fan || false,
              light: data.facilities?.roomEssentials?.light || false,
              chair: data.facilities?.roomEssentials?.chair || false,
            },
            comfortFeatures: {
              ac: data.facilities?.comfortFeatures?.ac || false,
            },
            washroomHygiene: {
              westernToilet: data.facilities?.washroomHygiene?.westernToilet || false,
            },
            utilitiesConnectivity: {
              wifi: data.facilities?.utilitiesConnectivity?.wifi || false,
              powerBackup: data.facilities?.utilitiesConnectivity?.powerBackup || false,
            },
            securitySafety: {
              cctv: data.facilities?.securitySafety?.cctv || false,
              securityGuard: data.facilities?.securitySafety?.securityGuard || false,
            },
            parkingTransport: {
              bikeParking: data.facilities?.parkingTransport?.bikeParking || false,
              carParking: data.facilities?.parkingTransport?.carParking || false,
            },
            nearbyFacilities: {
              hospital: data.facilities?.nearbyFacilities?.hospital || false,
            },
          },
          beds: data.beds?.map((bed) => ({
            bedId: bed.bedId,
            price: bed.price?.toString() || "",
            status: bed.status || "Available",
          })) || [],
          images: data.images || [],
          newImages: [],
        });
      } else {
        setError("Room not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load room");
    } finally {
      setFetching(false);
    }
  }, [propertyId, roomId]);

  useEffect(() => {
    if (propertyId && roomId) fetchRoomDetails();
  }, [propertyId, roomId, fetchRoomDetails]);

  /* ----------------------- Handlers ----------------------- */
  const handleClose = () => navigate(-1);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const token = getToken();
      await api.delete(`/properties/${propertyId}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      // Upload new images if any
      let uploadedImageUrls = [...editForm.images];
      if (editForm.newImages.length > 0) {
        const formData = new FormData();
        editForm.newImages.forEach((file) => formData.append("images", file));
        const uploadRes = await api.post(
          `/rooms/${propertyId}/rooms/${roomId}/images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadedImageUrls = [...uploadedImageUrls, ...uploadRes.data.images];
      }

      const payload = {
        name: editForm.name,
        floorNumber: editForm.floorNumber,
        price: Number(editForm.price),
        capacity: Number(editForm.capacity),
        type: editForm.type,
        status: editForm.status,
        roomSize: editForm.roomSize,
        securityDeposit: Number(editForm.securityDeposit || 0),
        noticePeriod: Number(editForm.noticePeriod),
        facilities: editForm.facilities,
        beds: editForm.beds.map((bed) => ({
          bedId: bed.bedId,
          price: Number(bed.price),
          status: bed.status,
        })),
        images: uploadedImageUrls,
      };

      await api.put(`/properties/${propertyId}/rooms/${roomId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      fetchRoomDetails();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleFacilityChange = (category, key) => {
    setEditForm((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [category]: {
          ...prev.facilities[category],
          [key]: !prev.facilities[category][key],
        },
      },
    }));
  };

  const handleBedChange = (index, field, value) => {
    const newBeds = [...editForm.beds];
    newBeds[index][field] = value;
    setEditForm((prev) => ({ ...prev, beds: newBeds }));
  };

  // Image handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setEditForm((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...files],
    }));
  };

  const removeNewImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  // NEW: Delete existing image from backend
  const handleDeleteImage = async (imageUrl, index) => {
    if (!window.confirm("Delete this image permanently?")) return;

    try {
      const token = getToken();
      await api.delete(`/rooms/${propertyId}/rooms/${roomId}/images`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { imageUrls: [imageUrl] },
      });

      // Remove from local state
      setEditForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));

      // Optional: Refresh room data
      // fetchRoomDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete image");
    }
  };

  /* ----------------------- Render ----------------------- */
  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 md:p-7 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center text-gray-800">
            {room.name}
          </h1>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/70 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Room Image */}
        {room.images?.length > 0 && (
          <div className="relative h-64 md:h-80 overflow-hidden bg-gray-200">
            <LazyImage src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center space-x-1 pb-3">
              {room.images.slice(0, 5).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </div>
        )}

        <div className="p-5 md:p-7 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Type:</strong> <span className="ml-1">{room.type || "—"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Status:</strong>{" "}
                <span className={`ml-1 font-medium ${room.status === "Available" ? "text-green-600" : "text-orange-600"}`}>
                  {room.status || "Available"}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Price:</strong> <span className="ml-1 font-semibold">₹{room.price || 0} / month</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Capacity:</strong> <span className="ml-1 font-semibold">{room.capacity || 0} beds</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Floor:</strong> <span className="ml-1">{room.floorNumber || "—"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Size:</strong> <span className="ml-1">{room.roomSize || "—"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Security Deposit:</strong> <span className="ml-1">₹{room.securityDeposit || 0}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-600">Notice Period:</strong> <span className="ml-1">{room.noticePeriod || 30} days</span>
              </div>
            </div>
          </section>

          {/* AMENITIES */}
          {room.facilities && Object.values(room.facilities).some((obj) => Object.values(obj).some(Boolean)) && (
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(room.facilities).map(([cat, items]) =>
                  Object.entries(items)
                    .filter(([, v]) => v)
                    .map(([key]) => (
                      <span
                        key={`${cat}-${key}`}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-semibold text-sm shadow-sm"
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    ))
                )}
              </div>
            </section>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <section className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-md transition"
            >
              Edit Room
            </button>
            <button
              onClick={handleDelete}
              disabled={room.tenants?.length > 0}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                room.tenants?.length > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Delete Room
            </button>
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </section>

          {/* =================== FULL EDIT FORM WITH IMAGES =================== */}
          {isEditing && (
            <section className="mt-8 bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-2xl border">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Room Details</h2>
              <form onSubmit={handleEdit} className="space-y-6">
                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Room Name *"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    value={editForm.floorNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, floorNumber: e.target.value }))}
                    placeholder="Floor"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="Price per month *"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((p) => ({ ...p, capacity: e.target.value }))}
                    placeholder="Capacity (beds) *"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    value={editForm.roomSize}
                    onChange={(e) => setEditForm((p) => ({ ...p, roomSize: e.target.value }))}
                    placeholder="Room Size (e.g. 200 sqft)"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={editForm.securityDeposit}
                    onChange={(e) => setEditForm((p) => ({ ...p, securityDeposit: e.target.value }))}
                    placeholder="Security Deposit"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={editForm.noticePeriod}
                    onChange={(e) => setEditForm((p) => ({ ...p, noticePeriod: e.target.value }))}
                    placeholder="Notice Period (days)"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type *</option>
                    <option>Private Room</option>
                    <option>PG</option>
                    <option>AC</option>
                    <option>Non-AC</option>
                  </select>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Available</option>
                    <option>Occupied</option>
                  </select>
                </div>

                {/* Facilities */}
                <div className="p-5 bg-white rounded-xl border space-y-5">
                  <h3 className="font-bold text-gray-800">Facilities</h3>
                  {Object.entries(editForm.facilities).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <p className="font-medium text-sm text-gray-700 capitalize">
                        {category.replace(/([A-Z])/g, " $1")}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Object.entries(items).map(([key, value]) => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => handleFacilityChange(category, key)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">{key.replace(/([A-Z])/g, " $1")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Beds */}
                {editForm.beds.length > 0 && (
                  <div className="p-5 bg-white rounded-xl border space-y-3">
                    <h3 className="font-bold text-gray-800">Bed Details</h3>
                    {editForm.beds.map((bed, idx) => (
                      <div key={bed.bedId} className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm text-gray-700 w-24">Bed {idx + 1}:</span>
                        <input
                          type="number"
                          value={bed.price}
                          onChange={(e) => handleBedChange(idx, "price", e.target.value)}
                          placeholder="Price"
                          className="flex-1 p-2 border rounded text-sm"
                        />
                        <select
                          value={bed.status}
                          onChange={(e) => handleBedChange(idx, "status", e.target.value)}
                          className="p-2 border rounded text-sm"
                        >
                          <option>Available</option>
                          <option>Occupied</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Images Section */}
                <div className="p-5 bg-white rounded-xl border space-y-4">
                  <h3 className="font-bold text-gray-800">Room Images</h3>

                  {/* Existing Images */}
                  {editForm.images.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-600">Current Images</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {editForm.images.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`Room ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(url, idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Image Upload */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Add New Images</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {/* Preview New Images */}
                  {editForm.newImages.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-600">New Images (Will be uploaded)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {editForm.newImages.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-md transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}