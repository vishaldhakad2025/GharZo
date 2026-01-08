import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";

const LandlordAnnouncements = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    sendToAll: true,
    tenantId: '',
    propertyId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAnnouncementId, setEditAnnouncementId] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const getAuthToken = () => localStorage.getItem('token') || null;

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const fetchProperties = async () => {
    setPropertiesLoading(true);
    const token = getAuthToken();
    if (!token) {
      setPropertiesLoading(false);
      return;
    }
    try {
      const res = await axios.get('https://api.gharzoreality.com/api/landlord/properties', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      setProperties(res.data.properties || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch properties', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchTenantsByProperty = async (propertyId) => {
    setTenantsLoading(true);
    setTenants([]);
    const token = getAuthToken();
    if (!token || !propertyId) {
      setTenantsLoading(false);
      return;
    }
    try {
      const res = await fetch(`https://api.gharzoreality.com/api/landlord/tenant/property/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${raw}`);
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        throw new Error('Invalid JSON response from server');
      }
      if (!Array.isArray(data)) throw new Error('Expected an array of tenants');
      setTenants(data);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      toast.error(`Failed to fetch tenants: ${err.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setTenantsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setFetchLoading(true);
    setFetchError(null);
    setAnnouncements([]);
    const token = getAuthToken();
    if (!token) {
      setFetchError('No authentication token found. Please log in again.');
      setFetchLoading(false);
      return;
    }
    try {
      const res = await axios.get('https://api.gharzoreality.com/api/announcement/all', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to fetch announcements');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDelete = async (announcementId) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('No authentication token found. Please log in again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    try {
      const res = await axios.delete(
        `https://api.gharzoreality.com/api/announcement/delete/${announcementId}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `Announcement deleted successfully!`,
        { position: 'top-right', autoClose: 3000 }
      );
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (announcement) => {
    setEditAnnouncementId(announcement._id);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      sendToAll: announcement.sendToAll || true,
      tenantId: announcement.tenantId || '',
      propertyId: announcement.propertyId || '',
      isActive: announcement.isActive,
    });
    if (announcement.propertyId) fetchTenantsByProperty(announcement.propertyId);
    setEditModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'propertyId' && value) fetchTenantsByProperty(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      toast.error('No authentication token found. Please log in again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    if (!formData.title || !formData.message || !formData.propertyId) {
      toast.error('Please fill title, message, and select a property.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    if (!formData.sendToAll && !formData.tenantId) {
      toast.error('Please select a tenant when not sending to all.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    const payload = {
      title: formData.title,
      message: formData.message,
      sendToAll: formData.sendToAll,
      isActive: formData.isActive,
      propertyId: formData.propertyId,
      ...(!formData.sendToAll && { tenantId: formData.tenantId }),
    };
    try {
      const res = await axios.post(
        'https://api.gharzoreality.com/api/announcement/create',
        payload,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `Announcement created!`,
        { position: 'top-right', autoClose: 3000 }
      );
      fetchAnnouncements();
      setFormData({
        title: '',
        message: '',
        sendToAll: true,
        tenantId: '',
        propertyId: '',
        isActive: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create announcement', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();
    if (!token || !editAnnouncementId) {
      toast.error('No authentication token or announcement ID found.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    if (!formData.sendToAll && !formData.tenantId) {
      toast.error('Please select a tenant when not sending to all.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    const payload = {
      title: formData.title,
      message: formData.message,
      sendToAll: formData.sendToAll,
      isActive: formData.isActive,
      propertyId: formData.propertyId,
      ...(!formData.sendToAll && { tenantId: formData.tenantId }),
    };
    try {
      const res = await axios.put(
        `https://api.gharzoreality.com/api/announcement/edit/${editAnnouncementId}`,
        payload,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `Announcement updated!`,
        { position: 'top-right', autoClose: 3000 }
      );
      fetchAnnouncements();
      setEditModalOpen(false);
      setFormData({
        title: '',
        message: '',
        sendToAll: true,
        tenantId: '',
        propertyId: '',
        isActive: true,
      });
      setEditAnnouncementId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update announcement', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchProperties();
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7] p-4 md:p-6 relative text-gray-800 transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <AnimatePresence>
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl min-h-screen flex flex-col p-2 sm:p-4">
          <ToastContainer />
          <div className="mb-8">
            <h2 className="text-3xl sm:text-2xl font-extrabold mb-2 text-[#5C4EFF] text-center tracking-tight">
              Announcements
            </h2>
            <p className="text-[#183c2c] text-center mb-6 text-sm sm:text-base">
              Create, edit, and manage announcements for your tenants and properties.
            </p>
          </div>

          {/* Create Announcement Form */}
          <div className="mb-10 bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7] rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-xl sm:text-lg font-semibold mb-4 text-[#5C4EFF] text-center">
              <span className="text-[#5C4EFF]">Create Announcement</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 sm:text-sm bg-white"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Property *
                  </label>
                  <select
                    id="propertyId"
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white sm:text-sm"
                    required
                  >
                    <option value="">Select a property</option>
                    {propertiesLoading ? (
                      <option disabled>Loading properties...</option>
                    ) : (
                      properties.map((property) => (
                        <option key={property._id} value={property._id}>
                          {property.name || property.propertyName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 sm:text-sm bg-white"
                  rows="3"
                  placeholder="Enter announcement message"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-4 items-center">
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
                    Send to All Tenants
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              {!formData.sendToAll && formData.propertyId && (
                <div>
                  <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Tenant *
                  </label>
                  <select
                    id="tenantId"
                    name="tenantId"
                    value={formData.tenantId}
                    onChange={handleChange}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white sm:text-sm"
                    required
                  >
                    <option value="">Select a tenant from this property</option>
                    {tenantsLoading ? (
                      <option disabled>Loading tenants for this property...</option>
                    ) : tenants.length > 0 ? (
                      tenants.map((tenant) => (
                        <option key={tenant.tenantId || tenant._id} value={tenant.tenantId || tenant._id}>
                          {tenant.name || 'Unnamed Tenant'} (Mobile: {tenant.mobile}, Room: {tenant.accommodations?.[0]?.roomId || 'N/A'})
                        </option>
                      ))
                    ) : (
                      <option disabled>No tenants found for this property</option>
                    )}
                  </select>
                  {tenants.length === 0 && !tenantsLoading && formData.propertyId && (
                    <p className="text-sm text-red-600 mt-1">No tenants assigned to this property yet.</p>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || tenantsLoading || propertiesLoading}
                className="w-full py-3 px-4 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out mt-2"
              >
                {loading ? 'Submitting...' : 'Create Announcement'}
              </button>
            </form>
          </div>
          {/* Edit Announcement Modal */}
          {editModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
            >
              <div className="bg-white p-6 sm:p-4 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl sm:text-lg font-semibold mb-4 text-[#5C4EFF] text-center">
                  <span className="text-[#5C4EFF]">Edit Announcement</span>
                </h3>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 sm:text-sm bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="edit-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 sm:text-sm bg-white"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Property *
                    </label>
                    <select
                      id="edit-propertyId"
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white sm:text-sm"
                      required
                    >
                      <option value="">Select a property</option>
                      {propertiesLoading ? (
                        <option disabled>Loading properties...</option>
                      ) : (
                        properties.map((property) => (
                          <option key={property._id} value={property._id}>
                            {property.name || property.propertyName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-sendToAll"
                        name="sendToAll"
                        checked={formData.sendToAll}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-sendToAll" className="ml-2 text-sm text-gray-700">
                        Send to All Tenants
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isActive" className="ml-2 text-sm text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                  {!formData.sendToAll && formData.propertyId && (
                    <div>
                      <label htmlFor="edit-tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Tenant *
                      </label>
                      <select
                        id="edit-tenantId"
                        name="tenantId"
                        value={formData.tenantId}
                        onChange={handleChange}
                        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white sm:text-sm"
                        required
                      >
                        <option value="">Select a tenant from this property</option>
                        {tenantsLoading ? (
                          <option disabled>Loading tenants for this property...</option>
                        ) : tenants.length > 0 ? (
                          tenants.map((tenant) => (
                            <option key={tenant.tenantId || tenant._id} value={tenant.tenantId || tenant._id}>
                              {tenant.name || 'Unnamed Tenant'} (Mobile: {tenant.mobile}, Room: {tenant.accommodations?.[0]?.roomId || 'N/A'})
                            </option>
                          ))
                        ) : (
                          <option disabled>No tenants found for this property</option>
                        )}
                      </select>
                      {tenants.length === 0 && !tenantsLoading && formData.propertyId && (
                        <p className="text-sm text-red-600 mt-1">No tenants assigned to this property yet.</p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(false)}
                      className="py-2 px-4 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition duration-150 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || tenantsLoading || propertiesLoading}
                      className="py-2 px-4 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
          {/* Fetch Announcements Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h3 className="text-xl sm:text-lg font-semibold text-[#5C4EFF]">All Announcements</h3>
              <button
                onClick={fetchAnnouncements}
                disabled={fetchLoading}
                className="mt-2 sm:mt-0 py-2 px-4 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {fetchLoading ? 'Fetching...' : 'Refresh Announcements'}
              </button>
            </div>
            {fetchLoading && (
              <div className="text-center text-gray-600 text-sm">Loading announcements...</div>
            )}
            {fetchError && (
              <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg shadow">
                <h3 className="font-semibold text-sm">Error</h3>
                <p className="text-sm">{fetchError}</p>
              </div>
            )}
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <motion.div
                    key={announcement._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7] border border-[#5C4EFF] rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow"
                  >
                    <div>
                      <h4 className="font-semibold text-lg sm:text-base text-[#5C4EFF]">
                        {announcement.title}
                      </h4>
                      <p className="text-[#183c2c] text-sm mt-1">{announcement.message}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#183c2c]">
                       {/* <span>ID: {announcement._id}</span>*/}
                        <span>
                          Created: {new Date(announcement.createdAt).toLocaleString()}
                        </span>
                        <span>
                          Active:{" "}
                          <span className={announcement.isActive ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {announcement.isActive ? "Yes" : "No"}
                          </span>
                        </span>
                        {!announcement.sendToAll && announcement.tenantId && (
                          <span>Tenant ID: {announcement.tenantId}</span>
                        )}
                        {announcement.propertyId && (
                          <span>Property ID: {announcement.propertyId}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="py-1 px-3 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition duration-150 ease-in-out text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="py-1 px-3 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition duration-150 ease-in-out text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !fetchLoading && (
                <div className="text-center text-[#183c2c] text-sm">No announcements found.</div>
              )
            )}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
};

export default LandlordAnnouncements;