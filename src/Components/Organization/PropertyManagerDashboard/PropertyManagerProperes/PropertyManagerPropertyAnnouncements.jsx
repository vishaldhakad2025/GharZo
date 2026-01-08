import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const Announcements = () => {
  const { propertyId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    sendToAll: true,
    tenantIds: [],
    pmId: "",
    rmId: "",
    orgId: "",
  });
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantsError, setTenantsError] = useState(null);

  const API_BASE_URL = "https://api.gharzoreality.com";

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
    return token;
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return null;
      }
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("Invalid token format. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return null;
    }
  };

  const fetchTenants = useCallback(async () => {
    setTenantsLoading(true);
    setTenantsError(null);
    const token = getAuthToken();
    if (!token) {
      setTenantsLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) {
      setTenantsLoading(false);
      setTenantsError("Invalid or expired token.");
      return;
    }

    try {
      if (!propertyId) {
        throw new Error("Property ID not found in URL.");
      }
      const response = await axios.get(
        `${API_BASE_URL}/api/pm/tenants/${propertyId}/tenants`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success || !Array.isArray(response.data.tenants)) {
        throw new Error("Invalid tenant data format.");
      }

      setTenants(response.data.tenants);
      setFormData((prev) => ({
        ...prev,
        pmId: decoded.id,
        rmId: localStorage.getItem("rmId") || "",
        orgId: localStorage.getItem("orgId") || "",
      }));
    } catch (err) {
      console.error("Error fetching tenants:", err);
      setTenantsError(err.response?.data?.message || "Failed to fetch tenants.");
      toast.error(err.response?.data?.message || "Failed to fetch tenants.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setTenantsLoading(false);
    }
  }, [propertyId]);

  const fetchAnnouncements = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    setAnnouncements([]);
    const token = getAuthToken();
    if (!token) {
      setFetchLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) {
      setFetchLoading(false);
      setFetchError("Invalid or expired token.");
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/pm-announcement`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data.success || !Array.isArray(res.data.announcements)) {
        throw new Error("Invalid response format.");
      }

      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setFetchError(
        err.response?.data?.message || "Failed to fetch昆明 announcements."
      );
      if (err.response?.status === 403) {
        toast.error("Unauthorized access. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const handleDelete = async (announcement) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/pm-announcement/delete/${announcement._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || `Announcement "${announcement.title}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        fetchAnnouncements();
      } else {
        throw new Error(response.data.message || "Failed to delete announcement.");
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete announcement.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const setData = editData ? setEditData : setFormData;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(type === "checkbox" && name === "sendToAll" && checked
        ? { tenantIds: [] }
        : {}),
    }));
  };

  const handleTenantChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    const setData = editData ? setEditData : setFormData;
    setData((prev) => ({
      ...prev,
      tenantIds: selected,
      sendToAll: selected.length === 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        pmId: formData.pmId,
        rmId: formData.rmId,
        orgId: formData.orgId,
        tenantIds: formData.sendToAll ? [] : formData.tenantIds,
        visibility: "TENANT",
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/pm-announcement/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Announcement created successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      fetchAnnouncements();
      setFormData({
        title: "",
        message: "",
        sendToAll: true,
        tenantIds: [],
        pmId: formData.pmId,
        rmId: formData.rmId,
        orgId: formData.orgId,
      });
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast.error(
        err.response?.data?.message || "Failed to create announcement.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditData({
      _id: announcement._id,
      title: announcement.title,
      message: announcement.message,
      sendToAll: announcement.tenantIds.length === 0,
      tenantIds: announcement.tenantIds || [],
      pmId: announcement.pmId?._id || formData.pmId,
      rmId: announcement.rmId?._id || formData.rmId,
      orgId: announcement.orgId?._id || formData.orgId,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: editData.title,
        message: editData.message,
        pmId: editData.pmId,
        rmId: editData.rmId,
        orgId: editData.orgId,
        tenantIds: editData.sendToAll ? [] : editData.tenantIds,
        visibility: "TENANT",
      };

      const res = await axios.put(
        `${API_BASE_URL}/api/pm-announcement/${editData._id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `Announcement updated!\nTitle: ${res.data.announcement.title}`,
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
      fetchAnnouncements();
      setEditData(null);
    } catch (err) {
      console.error("Error updating announcement:", err);
      toast.error(
        err.response?.data?.message || "Failed to update announcement.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchTenants();
  }, [fetchAnnouncements, fetchTenants]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
        Announcements
      </h2>

      {/* Create Announcement Form */}
      <div className="max-w-4xl mx-auto mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
          Create New Announcement
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200">
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
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
            <label
              htmlFor="sendToAll"
              className="ml-2 text-sm text-gray-700"
            >
              Send to All Tenants
            </label>
          </div>
          {!formData.sendToAll && (
            <div>
              <label
                htmlFor="tenantIds"
                className="block text-sm font-medium text-gray-700"
              >
                Select Tenants
              </label>
              <select
                id="tenantIds"
                name="tenantIds"
                multiple
                value={formData.tenantIds}
                onChange={handleTenantChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
                disabled={tenantsLoading || tenants.length === 0}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.tenantId} value={tenant.tenantId}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              {tenantsLoading && (
                <p className="text-sm text-blue-600 mt-2">Loading tenants...</p>
              )}
              {tenantsError && (
                <p className="text-sm text-red-600 mt-2">{tenantsError}</p>
              )}
            </div>
          )}
          <motion.button
            type="submit"
            disabled={loading || !formData.pmId}
            className={`w-full py-1.5 px-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-md shadow-md text-xs sm:text-sm ${
              loading || !formData.pmId ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileHover={{ scale: loading || !formData.pmId ? 1 : 1.05 }}
            whileTap={{ scale: loading || !formData.pmId ? 1 : 0.95 }}
          >
            {loading ? "Submitting..." : "Create Announcement"}
          </motion.button>
        </form>
      </div>

      {/* Edit Announcement Form */}
      {editData && (
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
            Edit Announcement
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-4 bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200">
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
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
                Send to All Tenants
              </label>
            </div>
            {!editData.sendToAll && (
              <div>
                <label
                  htmlFor="editTenantIds"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Tenants
                </label>
                <select
                  id="editTenantIds"
                  name="tenantIds"
                  multiple
                  value={editData.tenantIds}
                  onChange={handleTenantChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
                  disabled={tenantsLoading || tenants.length === 0}
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                {tenantsLoading && (
                  <p className="text-sm text-blue-600 mt-2">Loading tenants...</p>
                )}
                {tenantsError && (
                  <p className="text-sm text-red-600 mt-2">{tenantsError}</p>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-md shadow-md text-sm sm:text-base ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? "Updating..." : "Update Announcement"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setEditData(null)}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-md shadow-md text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
          All Announcements
        </h3>
        <motion.button
          onClick={fetchAnnouncements}
          disabled={fetchLoading}
          className={`mb-4 py-2 px-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-md shadow-md text-sm sm:text-base ${
            fetchLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          whileHover={{ scale: fetchLoading ? 1 : 1.05 }}
          whileTap={{ scale: fetchLoading ? 1 : 0.95 }}
        >
          {fetchLoading ? "Fetching..." : "Refresh Announcements"}
        </motion.button>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200"
        >
          {fetchLoading && (
            <div className="text-center text-gray-600 text-sm sm:text-base">
              Loading announcements...
            </div>
          )}
          {fetchError && (
            <div className="p-4 bg-red-100 text-red-800 rounded-md text-sm sm:text-base">
              <h3 className="font-semibold">Error</h3>
              <p>{fetchError}</p>
            </div>
          )}
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-base sm:text-lg text-gray-800">
                        {announcement.title}
                      </h4>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {announcement.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created By: {announcement.pmId?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Sent To:{" "}
                        {announcement.tenantIds.length === 0
                          ? "All Tenants"
                          : announcement.tenantIds
                              .map(
                                (id) =>
                                  tenants.find((t) => t.tenantId === id)?.name ||
                                  id
                              )
                              .join(", ")}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created At: {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Active: {announcement.isActive ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                      <motion.button
                        onClick={() => handleEdit(announcement)}
                        className="py-1 px-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-md shadow-md text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(announcement)}
                        className="py-1 px-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-md shadow-md text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !fetchLoading && (
              <div className="text-center text-gray-600 text-sm sm:text-base">
                No announcements found.
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Announcements;