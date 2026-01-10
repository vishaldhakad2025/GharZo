import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import {
  FaBullhorn,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import baseurl from "../../../../../BaseUrl";

// ──────────────────────────────────────────────────────────────
//  BRAND COLORS
// ──────────────────────────────────────────────────────────────
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";

const Announcements = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    sendToAll: true,
    tenantId: null,
  });
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchAnnouncements = async () => {
    setFetchLoading(true);
    setFetchError(null);

    const token = getAuthToken();
    if (!token) {
      setFetchError("Authentication token missing. Please log in again.");
      setFetchLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${baseurl}api/subowner/announcements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDelete = async (announcement) => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      await axios.delete(
        `${baseurl}api/subowner/announcements/${announcement._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const setter = editData ? setEditData : setFormData;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${baseurl}api/subowner/announcements/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Announcement created successfully");
      fetchAnnouncements();
      setFormData({
        title: "",
        message: "",
        sendToAll: true,
        tenantId: null,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditData({
      _id: announcement._id,
      title: announcement.title,
      message: announcement.message,
      sendToAll: announcement.tenantId === null,
      tenantId: announcement.tenantId,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();
    if (!token || !editData?._id) {
      toast.error("Invalid data or authentication");
      setLoading(false);
      return;
    }

    try {
      await axios.put(
        `${baseurl}api/subowner/announcements/${editData._id}`,
        {
          title: editData.title,
          message: editData.message,
          sendToAll: editData.sendToAll,
          tenantId: editData.tenantId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Announcement updated successfully");
      fetchAnnouncements();
      setEditData(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update announcement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
            GHARZO <span className="text-[#F97316]">Announcements</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Create and manage announcements for your tenants
          </p>
        </div>

        {/* Create / Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#F97316] p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#172554] mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F97316]/10 flex items-center justify-center">
              <FaBullhorn className="text-[#F97316]" />
            </div>
            {editData ? "Edit Announcement" : "Create New Announcement"}
          </h2>

          <form
            onSubmit={editData ? handleEditSubmit : handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={editData ? editData.title : formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] outline-none transition-all"
                placeholder="Announcement title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={editData ? editData.message : formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] outline-none transition-all resize-none"
                placeholder="Write your announcement message here..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendToAll"
                name="sendToAll"
                checked={editData ? editData.sendToAll : formData.sendToAll}
                onChange={handleChange}
                className="w-5 h-5 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316]"
              />
              <label
                htmlFor="sendToAll"
                className="ml-3 text-gray-700 font-medium"
              >
                Send to All Tenants
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#F97316] hover:bg-[#ea580c]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    {editData ? "Updating..." : "Creating..."}
                  </div>
                ) : editData ? (
                  "Update Announcement"
                ) : (
                  "Create Announcement"
                )}
              </motion.button>

              {editData && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setEditData(null)}
                  className="flex-1 py-3 px-6 rounded-xl font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
                >
                  Cancel Edit
                </motion.button>
              )}
            </div>
          </form>
        </div>

        {/* All Announcements Section */}
        <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#F97316] overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#172554] flex items-center gap-3">
              <FaBullhorn className="text-[#F97316]" />
              All Announcements
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchAnnouncements}
              disabled={fetchLoading}
              className={`px-5 py-2 rounded-xl font-medium transition-colors ${
                fetchLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#172554] text-white hover:bg-[#1e3a8a]"
              }`}
            >
              {fetchLoading ? "Refreshing..." : "Refresh List"}
            </motion.button>
          </div>

          {fetchLoading ? (
            <div className="p-12 text-center text-gray-600">
              <FaSpinner className="animate-spin text-4xl text-[#F97316] mx-auto mb-4" />
              <p>Loading announcements...</p>
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center">
              <div className="text-red-500 text-5xl mb-4">
                <FaExclamationCircle />
              </div>
              <p className="text-red-600 font-medium">{fetchError}</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <FaBullhorn className="text-6xl text-[#F97316]/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#172554] mb-2">
                No announcements yet
              </h3>
              <p>Create your first announcement above</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {announcements.map((ann) => (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-[#172554] mb-1 truncate">
                        {ann.title}
                      </h4>
                      <p className="text-gray-700 mb-2">{ann.message}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-[#F97316]" />
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {ann.tenantId === null ? (
                            <>
                              <FaCheckCircle className="text-green-500" />
                              <span>All Tenants</span>
                            </>
                          ) : (
                            <>
                              <FaUser className="text-orange-500" />
                              <span>Specific Tenant</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 sm:mt-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleEdit(ann)}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDelete(ann)}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;