// src/pages/PropertyManagerBedListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const api = axios.create({
  baseURL: "https://api.gharzoreality.com/api/pm",
});

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found. Please log in.");
  return token;
};

export default function PropertyManagerBedListPage() {
  const { propertyId, roomId } = useParams();
  const navigate = useNavigate();

  const [beds, setBeds] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBed, setEditingBed] = useState(null);

  /* ----------------------- Fetch Beds + Images ----------------------- */
  const fetchBeds = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const token = getToken();
      const [bedsRes, roomRes] = await Promise.all([
        api.get(`/properties/${propertyId}/rooms/${roomId}/beds`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/properties/${propertyId}/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bedsData = bedsRes.data?.beds || [];
      setRoomName(roomRes.data?.room?.name || "Room");

      const bedsWithImages = await Promise.all(
        bedsData.map(async (bed) => {
          try {
            const imgRes = await api.get(
              `/beds/${propertyId}/rooms/${roomId}/beds/${bed.bedId}/images`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...bed, images: imgRes.data?.images || [] };
          } catch {
            return { ...bed, images: [] };
          }
        })
      );

      setBeds(bedsWithImages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load beds");
    } finally {
      setFetching(false);
    }
  }, [propertyId, roomId]);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  /* ----------------------- Delete Bed ----------------------- */
  const handleDeleteBed = async (bedId) => {
    try {
      const token = getToken();
      await api.delete(`/properties/${propertyId}/rooms/${roomId}/beds/${bedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBeds((prev) => prev.filter((b) => b.bedId !== bedId));
      toast.success("Bed deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete bed");
    }
  };

  /* ----------------------- Delete Image (in list) ----------------------- */
  const handleDeleteImage = async (bedId, imageUrl) => {
    const imageId = imageUrl.split("/").pop().split("?")[0];

    try {
      const token = getToken();
      await api.delete(
        `/beds/${propertyId}/rooms/${roomId}/beds/${bedId}/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBeds((prev) =>
        prev.map((b) =>
          b.bedId === bedId
            ? { ...b, images: b.images.filter((img) => img !== imageUrl) }
            : b
        )
      );
      toast.success("Image deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image");
    }
  };

  /* ----------------------- Go Back to Rooms ----------------------- */
  const goBackToRooms = () => {
    navigate(`/property-manager/propertylist/${propertyId}`);
  };

  /* ----------------------- Render ----------------------- */
  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: { style: { background: '#10b981', color: '#fff' }, icon: 'Success' },
          error: { style: { background: '#ef4444', color: '#fff' }, icon: 'Error' },
        }}
      />

      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Back Button */}
          <div className="p-5 md:p-7 border-b bg-gradient-to-r from-blue-50 to-green-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* BACK BUTTON - UI ke according */}
              <button
                onClick={goBackToRooms}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Rooms</span>
                <span className="sm:hidden">Back</span>
              </button>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Beds in <span className="text-blue-600">{roomName}</span>
              </h1>
            </div>

            {/* Optional: Close icon on mobile */}
            <button
              onClick={goBackToRooms}
              className="p-2 rounded-full hover:bg-white/70 transition sm:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 md:p-7">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">{beds.length} bed(s) found</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-medium hover:shadow-md transition"
              >
                + Add Bed
              </button>
            </div>

            {error && (
              <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {beds.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-1.09 1.79L12 21l-7.91-3.21A2 2 0 013 16V7m17 0l-8 4-8-4" />
                </svg>
                <p className="text-lg">No beds added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {beds.map((bed) => (
                  <div
                    key={bed.bedId}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                  >
                    {bed.images?.length > 0 && (
                      <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden relative group">
                        <img
                          src={bed.images[0]}
                          alt={bed.name}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={() => handleDeleteImage(bed.bedId, bed.images[0])}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700"
                          title="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800">{bed.name}</h3>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          bed.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {bed.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      <strong>₹{bed.price}</strong> / month
                    </p>

                    {bed.tenants && bed.tenants.length > 0 ? (
                      <div className="text-xs text-gray-700 space-y-1">
                        <p className="font-semibold">Tenant:</p>
                        <p>{bed.tenants[0].name}</p>
                        <p>{bed.tenants[0].mobile}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No tenant assigned</p>
                    )}

                    <div className="mt-5 flex justify-between">
                      <button
                        onClick={() => setEditingBed(bed)}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        title="Edit bed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBed(bed.bedId)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Delete bed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Bed Modal */}
        {showAddForm && (
          <BedFormModal
            propertyId={propertyId}
            roomId={roomId}
            onClose={() => setShowAddForm(false)}
            onSuccess={fetchBeds}
          />
        )}

        {/* Edit Bed Modal */}
        {editingBed && (
          <BedFormModal
            propertyId={propertyId}
            roomId={roomId}
            bed={editingBed}
            onClose={() => setEditingBed(null)}
            onSuccess={() => {
              setEditingBed(null);
              fetchBeds();
            }}
          />
        )}
      </div>
    </>
  );
}

/* ========================================================= */
/* BED FORM MODAL - NO CONFIRM, ONLY TOAST */
/* ========================================================= */
function BedFormModal({ propertyId, roomId, bed, onClose, onSuccess }) {
  const isEdit = !!bed;
  const [name, setName] = useState(bed?.name || "");
  const [price, setPrice] = useState(bed?.price?.toString() || "");
  const [status, setStatus] = useState(bed?.status || "Available");
  const [files, setFiles] = useState(null);
  const [existingImages, setExistingImages] = useState(bed?.images || []);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = getToken();
      let bedId = bed?.bedId;

      if (isEdit) {
        await api.put(
          `/properties/${propertyId}/rooms/${roomId}/beds/${bedId}`,
          { name, price: Number(price), status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const res = await api.post(
          `/properties/${propertyId}/rooms/${roomId}/beds`,
          { name, price: Number(price), status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        bedId = res.data.bed.bedId;
      }

      if (files && files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("images", files[i]);
        }
        const uploadRes = await api.post(
          `/beds/${propertyId}/rooms/${roomId}/beds/${bedId}/images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const newImages = uploadRes.data?.images || [];
        setExistingImages((prev) => [...prev, ...newImages]);
      }

      toast.success(isEdit ? "Bed updated!" : "Bed added!");
      setTimeout(() => onSuccess(), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const removeExistingImage = async (imgUrl) => {
    const imageId = imgUrl.split("/").pop().split("?")[0];

    try {
      const token = getToken();
      await api.delete(
        `/beds/${propertyId}/rooms/${roomId}/beds/${bed.bedId}/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
      toast.success("Image deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Edit Bed" : "Add New Bed"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bed A"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹/month)</label>
            <input
              required
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Images</label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Bed ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add More Images (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {files && (
              <p className="text-xs text-gray-600 mt-2">
                {files.length} new file{files.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-md disabled:opacity-70"
            >
              {uploading ? "Saving..." : isEdit ? "Update Bed" : "Add Bed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}