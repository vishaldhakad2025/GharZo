// src/pages/PropMngrAdRoom.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LazyImage from '../../../Common/LazyImage';
import axios from "axios";

/* ----------------------------------------------------------------- */
/* AXIOS INSTANCE WITH DETAILED LOGGING                             */
/* ----------------------------------------------------------------- */
const api = axios.create();

api.interceptors.request.use((config) => {
  console.groupCollapsed(
    `%cAPI → ${config.method?.toUpperCase()} ${config.url}`,
    "color:#1a73e8;font-weight:bold"
  );
  console.log("Headers:", config.headers);
  if (config.data instanceof FormData) {
    console.log("FormData entries:");
    for (const [k, v] of config.data.entries()) console.log(`  ${k}:`, v);
  } else {
    console.log("Body:", config.data);
  }
  console.groupEnd();
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.groupCollapsed(
      `%cAPI ← ${res.config.method?.toUpperCase()} ${res.config.url} (${res.status})`,
      "color:#34a853;font-weight:bold"
    );
    console.log("Response data:", res.data);
    console.groupEnd();
    return res;
  },
  (err) => {
    console.groupCollapsed(
      `%cAPI ✘ ${err.config?.method?.toUpperCase()} ${err.config?.url} (${err.response?.status})`,
      "color:#ea4335;font-weight:bold"
    );
    console.log("Error:", err.response?.data ?? err.message);
    console.groupEnd();
    return Promise.reject(err);
  }
);

/* ----------------------------------------------------------------- */
/* CUSTOM HOOK: FETCH ROOMS FIRST, THEN IMAGES LAZILY               */
/* ----------------------------------------------------------------- */
const usePropertyRooms = (propertyId) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found. Please log in.");
    return token;
  };

  // Fetch only room metadata
  const fetchRoomsOnly = async () => {
    const token = getToken();
    const res = await api.get(
      `https://api.gharzoreality.com/api/pm/properties/${propertyId}/rooms`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return res.data?.rooms || [];
  };

  // Fetch images for one room
  const fetchRoomImages = async (roomId) => {
    try {
      const token = getToken();
      const res = await api.get(
        `https://api.gharzoreality.com/api/pm/rooms/${propertyId}/rooms/${roomId}/images`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      return res.data?.success ? res.data.images || [] : [];
    } catch (err) {
      console.error(`Error fetching images for room ${roomId}:`, err);
      return [];
    }
  };

  const fetchRooms = useCallback(async () => {
    if (!propertyId) {
      setError("No property ID available in URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRooms([]);

      // Step 1: Fetch rooms only
      const roomsData = await fetchRoomsOnly();

      // Step 2: Show rooms immediately with placeholder
      const initialRooms = roomsData.map(room => ({
        ...room,
        images: [],
        _imageLoading: true,
      }));
      setRooms(initialRooms);

      // Step 3: Load images in background
      roomsData.forEach(async (room) => {
        const images = await fetchRoomImages(room.roomId);
        setRooms(prev => prev.map(r =>
          r.roomId === room.roomId
            ? { ...r, images, _imageLoading: false }
            : r
        ));
      });

    } catch (err) {
      setError(err.message || "Failed to load rooms.");
    } finally {
      setLoading(false); // UI shows rooms even if images are loading
    }
  }, [propertyId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
};

/* ----------------------------------------------------------------- */
/* ROOM CARD – WITH SKELETON & PROGRESSIVE IMAGE LOADING             */
/* ----------------------------------------------------------------- */
const RoomCard = ({ room, propertyId }) => {
  const navigate = useNavigate();
  const hasImages = room.images && room.images.length > 0;
  const isImageLoading = room._imageLoading;

  return (
    <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {hasImages ? (
          <LazyImage
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : isImageLoading ? (
          // Skeleton shimmer
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        ) : (
          // No image fallback
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Image count dots */}
        {hasImages && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center space-x-1 pb-2">
            {room.images.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{room.name}</h3>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-1 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 13l-3-3 1.5-1.5L9 10l4.5-4.5L15 7l-6 6z" />
            </svg>
            <span className="font-medium text-sm">Beds Available</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {room.beds?.length ?? 0}/{room.capacity ?? 0}
          </span>
        </div>

        {/* Manage Beds Button */}
        <button
          onClick={() => navigate(`/property-manager/propertylist/property/${propertyId}/rooms/${room.roomId}/beds`)}
          className="w-full mb-3 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 7h18M3 12h18M3 17h18M9 7v10m6-10v10" />
          </svg>
          <span>Manage Beds</span>
        </button>

        {/* View Details Button */}
        <button
          onClick={() => navigate(`/property-manager/propertylist/property/${propertyId}/room/${room.roomId}`)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------- */
/* ROOM LIST UI                                                     */
/* ----------------------------------------------------------------- */
const RoomList = ({ rooms, loading, error, propertyId }) => (
  <div className="bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Available Rooms
        </h1>
        <a
          href={`/property-manager/propertylist/${propertyId}/room-form`}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Room</span>
        </a>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      ) : rooms.length > 0 ? (
        /* Rooms Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.roomId} room={room} propertyId={propertyId} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-xl text-gray-600">No rooms available</p>
          <p className="text-gray-500 mt-2">Click "Add New Room" to get started</p>
        </div>
      )}
    </div>
  </div>
);

/* ----------------------------------------------------------------- */
/* MAIN COMPONENT                                                   */
/* ----------------------------------------------------------------- */
export default function PropMngrAdRoom() {
  const { propertyId } = useParams();
  const { rooms, loading, error } = usePropertyRooms(propertyId);

  if (!propertyId) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-100 shadow-md rounded-lg text-center text-red-600">
        No property ID found in URL.
      </div>
    );
  }

  return (
    <RoomList
      rooms={rooms}
      loading={loading}
      error={error}
      propertyId={propertyId}
    />
  );
}