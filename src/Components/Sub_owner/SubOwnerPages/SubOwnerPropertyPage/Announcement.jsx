import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Function to dynamically fetch token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    return token || null;
  };

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    setFetchLoading(true);
    setFetchError(null);
    setAnnouncements([]);

    const token = getAuthToken();
    if (!token) {
      setFetchError("No authentication token found. Please log in again.");
      setFetchLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        "https://api.gharzoreality.com/api/subowner/announcements",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setFetchError(
        err.response?.data?.message || "Failed to fetch announcements"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle delete announcement
  const handleDelete = async (announcement) => {
    const token = getAuthToken();
    if (!token) {
      toast.error("No authentication token found. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const res = await axios.delete(
        `https://api.gharzoreality.com/api/subowner/announcements/${announcement._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: {
            title: announcement.title,
            message: announcement.message,
            tenantId: announcement.tenantId,
            sendToAll: announcement.tenantId === null,
          },
        }
      );
      toast.success(
        `Announcement deleted successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      fetchAnnouncements();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete announcement",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const setData = editData ? setEditData : setFormData;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission for create
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      toast.error("No authentication token found. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/subowner/announcements/create",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(
        `Announcement created`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      fetchAnnouncements();
      setFormData({
        title: "",
        message: "",
        sendToAll: true,
        tenantId: null,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create announcement",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit initiation
  const handleEdit = (announcement) => {
    setEditData({
      _id: announcement._id,
      title: announcement.title,
      message: announcement.message,
      sendToAll: announcement.tenantId === null,
      tenantId: announcement.tenantId,
    });
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      toast.error("No authentication token found. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put(
        `https://api.gharzoreality.com/api/subowner/announcements/${editData._id}`,
        {
          title: editData.title,
          message: editData.message,
          sendToAll: editData.sendToAll,
          tenantId: editData.tenantId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(
        `Announcement updated successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      fetchAnnouncements();
      setEditData(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update announcement",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Announcements</h2>

      {/* Toast Container */}
      <ToastContainer />

      {/* Create Announcement Form */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Create New Announcement
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              rows="4"
              placeholder="Enter announcement message"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendToAll"
              name="sendToAll"
              checked={formData.sendToAll}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendToAll" className="ml-2 text-sm text-gray-700">
              Send to All
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Create Announcement"}
          </button>
        </form>
      </div>

      {/* Edit Announcement Form */}
      {editData && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Edit Announcement
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="editTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="editTitle"
                name="title"
                value={editData.title}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="editMessage"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="editMessage"
                name="message"
                value={editData.message}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows="4"
                placeholder="Enter announcement message"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="editSendToAll"
                name="sendToAll"
                checked={editData.sendToAll}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="editSendToAll"
                className="ml-2 text-sm text-gray-700"
              >
                Send to All
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update Announcement"}
              </button>
              <button
                type="button"
                onClick={() => setEditData(null)}
                className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fetch Announcements Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          All Announcements
        </h3>
        <button
          onClick={fetchAnnouncements}
          disabled={fetchLoading}
          className={`mb-4 py-2 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
            fetchLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {fetchLoading ? "Fetching..." : "Refresh Announcements"}
        </button>

        {fetchLoading && (
          <div className="text-center text-gray-600">
            Loading announcements...
          </div>
        )}

        {fetchError && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
            <h3 className="font-semibold">Error</h3>
            <p>{fetchError}</p>
          </div>
        )}

        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">
                      {announcement.title}
                    </h4>
                    <p className="text-gray-600">{announcement.message}</p>
                   
                    <p className="text-sm text-gray-500">
                      Created At:{" "}
                      {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Active: {announcement.isActive ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="py-1 px-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement)}
                      className="py-1 px-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !fetchLoading && (
            <div className="text-center text-gray-600">
              No announcements found.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Announcements;