import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaMailBulk,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaIdCard,
  FaTrash,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaHome,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const regions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const Colorful3DIcon = ({ icon: Icon, color, size = 28 }) => (
  <motion.div
    className={`p-3 rounded-3xl shadow-lg bg-gradient-to-br ${color} inline-flex items-center justify-center`}
    style={{ perspective: 1000 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon className="text-white drop-shadow-lg" size={size} />
  </motion.div>
);

const PermissionButton = ({ permissionKey, value }) => (
  <motion.button
    className={`p-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all duration-300 ${
      value
        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-md hover:shadow-lg"
        : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-md hover:shadow-lg"
    }`}
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ scale: 1.02, rotateY: 5 }}
    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
  >
    <FaCheckCircle size={12} className={value ? "text-green-500" : "text-red-500"} />
    <span className="truncate capitalize">{permissionKey.replace(/([A-Z])/g, ' $1').trim()}</span>
  </motion.button>
);

const PropertyToggle = ({ propertyId, value, onChange, propertyName }) => (
  <motion.div
    className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
      value
        ? "bg-green-100 border-green-300 shadow-md hover:shadow-lg"
        : "bg-orange-100 border-orange-300 shadow-md hover:shadow-lg"
    }`}
    whileHover={{ scale: 1.02 }}
    onClick={() => onChange(propertyId, !value)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
  >
    <span className={`text-xs font-medium capitalize truncate ${value ? 'text-green-800' : 'text-orange-800'}`}>
      {propertyName || propertyId}
    </span>
    <motion.div
      className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0`}
      animate={{ backgroundColor: value ? '#10B981' : '#F59E0B' }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm"
        animate={{ x: value ? '20px' : '2px' }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{ left: 0 }}
      />
    </motion.div>
  </motion.div>
);

const PermissionToggle = ({ permissionKey, value, onChange }) => (
  <motion.div
    className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
      value
        ? "bg-green-100 border-green-300 shadow-md hover:shadow-lg"
        : "bg-red-100 border-red-300 shadow-md hover:shadow-lg"
    }`}
    whileHover={{ scale: 1.02 }}
    onClick={() => onChange(!value)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
  >
    <span className={`text-xs font-medium capitalize truncate ${value ? 'text-green-800' : 'text-red-800'}`}>
      {permissionKey.replace(/([A-Z])/g, ' $1').trim()}
    </span>
    <motion.div
      className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0`}
      animate={{ backgroundColor: value ? '#10B981' : '#D1D5DB' }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm"
        animate={{ x: value ? '20px' : '2px' }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{ left: 0 }}
      />
    </motion.div>
  </motion.div>
);

const ManagerCard = ({ manager, onDelete, deleting, onEdit, onView }) => (
  <motion.div
    className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 cursor-default border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
    transition={{ duration: 0.3 }}
  >
    <motion.div 
      className="flex-shrink-0 self-center md:self-auto"
      whileHover={{ rotateY: 5 }}
    >
      {manager.profileImage ? (
        <img
          src={manager.profileImage}
          alt={`${manager.name} profile`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg"
        />
      ) : (
        <Colorful3DIcon icon={FaUserTie} color="from-indigo-500 to-purple-600" size={50} />
      )}
    </motion.div>
    <div className="flex-1 w-full min-w-0">
      <motion.h3 
        className="text-lg sm:text-xl font-bold text-indigo-900 truncate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {manager.name}
      </motion.h3>
      <motion.div 
        className="flex flex-wrap items-center gap-2 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-indigo-700 font-semibold text-sm">{manager.role}</p>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${manager.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {manager.isActive ? 'Active' : 'Inactive'}
        </span>
      </motion.div>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-xs sm:text-sm mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <FaPhoneAlt className="text-indigo-600 flex-shrink-0" />
          <span className="truncate">{manager.contactNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMailBulk className="text-indigo-600 flex-shrink-0" />
          <span className="truncate">{manager.email}</span>
        </div>
        {manager.address && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <FaMapMarkerAlt className="text-indigo-600 flex-shrink-0" />
            <span className="truncate">{manager.address}</span>
          </div>
        )}
        {manager.district && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <FaMapMarkerAlt className="text-indigo-600 flex-shrink-0" />
            <span>District: {manager.district}</span>
          </div>
        )}
        {manager.state && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <FaMapMarkerAlt className="text-indigo-600 flex-shrink-0" />
            <span>State: {manager.state}</span>
          </div>
        )}
        <div className="flex items-center gap-2 sm:col-span-2">
          <FaBriefcase className="text-indigo-600 flex-shrink-0" />
          <span className="truncate">
            Properties: {manager.assignedProperties?.length > 0
              ? manager.assignedProperties.join(", ")
              : "None"}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <FaCalendarAlt className="text-indigo-600 flex-shrink-0" />
          <span>Joined: {new Date(manager.createdAt).toLocaleDateString()}</span>
        </div>
      </motion.div>
      <motion.div 
        className="flex flex-wrap gap-2 sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={() => onView(manager.id)}
          className="flex items-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaEye /> View
        </motion.button>
        <motion.button
          onClick={() => onEdit(manager)}
          className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaEdit /> Edit
        </motion.button>
        <motion.button
          onClick={() => onDelete(manager.id)}
          disabled={deleting === manager.id}
          className={`flex items-center gap-1 sm:gap-2 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition ${
            deleting === manager.id 
              ? "bg-red-400 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700"
          }`}
          whileHover={deleting === manager.id ? {} : { scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaTrash />
          {deleting === manager.id ? "Deleting..." : "Delete"}
        </motion.button>
      </motion.div>
    </div>
  </motion.div>
);

const PropertyManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [regionalManagerId, setRegionalManagerId] = useState(null);
  const [filters, setFilters] = useState({
    nameOrCity: "",
    region: "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteManagerId, setDeleteManagerId] = useState(null);
  const [editingManager, setEditingManager] = useState(null);
  const [viewManager, setViewManager] = useState(null);
  const [formData, setFormData] = useState({});


  const [allProperties, setAllProperties] = useState([]); // All properties (from profile + rm/properties)
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        const res = await axios.get("https://api.gharzoreality.com/api/regional-managers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = res.data.data;
        setRegionalManagerId(profileData.id);

        // Extract properties from profile (fallback + initial data)
        const profileProperties = profileData.properties || [];
        setAllProperties(profileProperties.map(p => ({
          _id: p._id || p.id,
          name: p.name,
          address: p.address || "",
          city: p.city || "",
          state: p.state || ""
        })));

      } catch (err) {
        toast.error("Error fetching profile");
        console.error(err);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProfile();
  }, []);



  // Fetch profile to get regionalManagerId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }
        const res = await axios.get("https://api.gharzoreality.com/api/regional-managers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegionalManagerId(res.data.data.id);
      } catch (err) {
        toast.error("Error fetching profile");
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch managers function
  const fetchManagers = async () => {
    if (!regionalManagerId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }
      const res = await axios.get(`https://api.gharzoreality.com/api/property-managers/${regionalManagerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped = res.data.data.map((d) => ({
        id: d.id,
        name: d.name,
        role: "Property Manager",
        contactNumber: d.mobile,
        email: d.email,
        address: d.properties?.[0]?.address || "",
        district: d.properties?.[0]?.city || "",
        state: d.properties?.[0]?.state || "",
        availabilityDays: [],
        availableTimeSlots: [],
        chargePerService: 0,
        idProofType: "",
        idProofNumber: "",
        assignedProperties: d.properties?.map(p => p.name) || [],
        profileImage: null, // Assuming no profile image in response
        isActive: d.isActive,
        createdAt: d.createdAt,
        permissions: d.permissions,
        fullData: d, // Store full data for updates
      }));
      setManagers(mapped);
    } catch (err) {
      toast.error("Error fetching managers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch managers once regionalManagerId is available
  useEffect(() => {
    fetchManagers();
  }, [regionalManagerId]);

  // Update formData when editingManager changes
  useEffect(() => {
    if (editingManager) {
      setFormData({
        name: editingManager.name,
        email: editingManager.email,
        mobile: editingManager.contactNumber,
        isActive: editingManager.isActive,
        permissions: { ...editingManager.fullData.permissions },
        properties: editingManager.fullData.properties?.map(p => p._id) || [],
        password: "",
      });
    }
  }, [editingManager]);

  // Scroll to show/hide filters
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  // Step 2: Fetch Latest Properties from /rm/properties when edit modal opens
  const fetchLatestProperties = async () => {
    setLoadingProperties(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://api.gharzoreality.com/api/rm/properties", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latestProps = res.data.data || res.data.properties || [];

      // Merge with profile properties (avoid duplicates by _id)
      setAllProperties(prev => {
        const existingIds = prev.map(p => p._id);
        const newProps = latestProps.filter(p => !existingIds.includes(p._id || p.id));
        const cleanedNewProps = newProps.map(p => ({
          _id: p._id || p.id,
          name: p.name,
          address: p.address || "",
          city: p.city || p.district || "",
          state: p.state || ""
        }));
        return [...prev, ...cleanedNewProps];
      });

      toast.success("Properties list updated!");
    } catch (err) {
      console.log("Failed to fetch latest properties, using profile data");
      // Do nothing → fallback already loaded from profile
    } finally {
      setLoadingProperties(false);
    }
  };

  // When Edit Modal Opens → Refresh latest properties
  const onEdit = (manager) => {
    setEditingManager(manager);
    setShowEditModal(true);

    // Refresh latest properties list
    fetchLatestProperties();
  };

  // Update formData when manager + properties are ready
  useEffect(() => {
    if (editingManager && allProperties.length > 0) {
      const assignedIds = editingManager.fullData.properties?.map(p => p._id || p.id) || [];

      setFormData(prev => ({
        ...prev,
        name: editingManager.name,
        email: editingManager.email,
        mobile: editingManager.contactNumber,
        isActive: editingManager.isActive,
        permissions: { ...editingManager.fullData.permissions },
        properties: assignedIds,
        password: "",
      }));
    }
  }, [editingManager, allProperties]);



  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    if (!deleteManagerId) return;
    try {
      setDeletingId(deleteManagerId);
      const token = localStorage.getItem("token");
      await axios.delete(`https://api.gharzoreality.com/api/property-managers/${deleteManagerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagers((prev) => prev.filter((m) => m.id !== deleteManagerId));
      toast.success("Manager deleted successfully!");
    } catch (err) {
      toast.error("Error deleting manager");
      console.error(err);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setDeleteManagerId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteManagerId(null);
  };

  const onDelete = (id) => {
    setDeleteManagerId(id);
    setShowDeleteModal(true);
  };

  // View handler - fetch detail
  const onView = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://api.gharzoreality.com/api/property-managers/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewManager(res.data.data);
      setShowViewModal(true);
    } catch (err) {
      toast.error("Error fetching manager details");
      console.error(err);
    }
  };

  

  // Update handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingManager) return;
    try {
      const token = localStorage.getItem("token");
      const body = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        isActive: formData.isActive,
        permissions: formData.permissions,
        properties: formData.properties || [],
        ...(formData.password && { password: formData.password }),
      };
      const res = await axios.put(`https://api.gharzoreality.com/api/property-managers/${editingManager.id}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Update Response:", res.data);
      await fetchManagers();
      toast.success("Manager updated successfully!");
      setShowEditModal(false);
      setEditingManager(null);
      setFormData({});
    } catch (err) {
      toast.error("Error updating manager");
      console.error(err);
    }
  };

  // Filter managers
  const filteredManagers = managers.filter((m) => {
    const search = filters.nameOrCity.toLowerCase();
    return (
      (m.name.toLowerCase().includes(search) ||
        m.address.toLowerCase().includes(search) ||
        m.district.toLowerCase().includes(search)) &&
      (filters.region === "" || m.state === filters.region)
    );
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingManager(null);
    setFormData({});
  };

  const handleViewClose = () => {
    setShowViewModal(false);
    setViewManager(null);
  };

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-20 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-4 transition-all duration-500">
      {/* Filter Bar */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: showFilters ? 0 : -100 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 py-3 sm:py-4 shadow-xl rounded-xl mb-4 sm:mb-6 border border-purple-400 transition-all duration-500"
      >
        <motion.h2 
          className="text-center text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 mx-auto"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Colorful3DIcon icon={FaUserTie} color="from-yellow-400 to-orange-500" size={24} />
          Property Managers
        </motion.h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2 sm:px-4 text-white max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="nameOrCity" className="text-xs sm:text-sm font-medium block mb-1">
              Name or City
            </label>
            <input
              type="text"
              id="nameOrCity"
              value={filters.nameOrCity}
              onChange={handleFilterChange}
              placeholder="Search by name or city"
              className="w-full rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="region" className="text-xs sm:text-sm font-medium block mb-1">
              Region
            </label>
            <select
              id="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="w-full rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">All</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </motion.div>
        </form>
      </motion.div>
      
      {/* Manager Cards */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <motion.div 
            className="text-center my-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"
              style={{ animationDuration: "1s" }}
            />
            <span className="ml-2 text-gray-600">Loading managers...</span>
          </motion.div>
        ) : filteredManagers.length === 0 ? (
          <motion.div 
            className="text-center my-10 text-gray-600 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Colorful3DIcon icon={FaUserTie} color="from-gray-400 to-gray-500" size={32} />
            <span className="ml-2">No managers found.</span>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredManagers.map((manager) => (
              <ManagerCard
                key={manager.id}
                manager={manager}
                onDelete={onDelete}
                deleting={deletingId}
                onEdit={onEdit}
                onView={onView}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleEditCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-4 sm:p-6 m-4 w-full max-w-4xl max-h-[100vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h3 
              className="text-lg sm:text-xl font-bold mb-4 text-indigo-900 text-center flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Colorful3DIcon icon={FaEdit} color="from-green-400 to-emerald-500" size={20} />
              Edit Manager
            </motion.h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block mb-1 font-medium text-sm">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block mb-1 font-medium text-sm">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block mb-1 font-medium text-sm">Mobile</label>
                <input
                  type="tel"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </motion.div>
            {/* <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block mb-1 font-medium text-sm">Password (optional)</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Leave blank to keep current"
                />
              </motion.div>*/}  
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2 h-4 w-4 text-indigo-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </motion.div>
              <motion.div className="mt-6">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Colorful3DIcon icon={FaShieldAlt} color="from-orange-400 to-red-500" size={16} />
                  Permissions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {Object.entries(formData.permissions || {}).map(([key]) => (
                    <PermissionToggle
                      key={key}
                      permissionKey={key}
                      value={formData.permissions[key]}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: { ...prev.permissions, [key]: val },
                        }))
                      }
                    />
                  ))}
                </div>
              </motion.div>
             <motion.div className="mt-6">
  <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
    <Colorful3DIcon icon={FaHome} color="from-indigo-400 to-blue-500" size={16} />
    Assign Properties ({allProperties.length})
    {loadingProperties && <span className="text-xs ml-2 text-gray-500">(Updating...)</span>}
  </h4>

  {loadingProperties && allProperties.length === 0 ? (
    <div className="text-center py-8">
      <motion.div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 rounded-full border-t-transparent" />
      <p className="text-gray-500 mt-2">Loading properties...</p>
    </div>
  ) : allProperties.length === 0 ? (
    <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
      No properties found in your region
    </p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
      {allProperties.map((prop) => {
        const isAssigned = formData.properties?.includes(prop._id);

        return (
          <PropertyToggle
            key={prop._id}
            propertyId={prop._id}
            propertyName={prop.name}
            value={isAssigned}
            onChange={(id, val) =>
              setFormData(prev => ({
                ...prev,
                properties: val
                  ? [...(prev.properties || []), id]
                  : (prev.properties || []).filter(p => p !== id),
              }))
            }
          />
        );
      })}
    </div>
  )}
</motion.div>
              <motion.div 
                className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Colorful3DIcon icon={FaEdit} color="from-green-400 to-emerald-500" size={16} />
                  Update
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleEditCancel}
                  className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Colorful3DIcon icon={FaTimes} color="from-red-400 to-red-500" size={16} />
                  Cancel
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Modal */}
      {showViewModal && viewManager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleViewClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-4 sm:p-6 m-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h3 
              className="text-lg sm:text-xl font-bold mb-4 text-indigo-900 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Colorful3DIcon icon={FaUserTie} color="from-blue-400 to-cyan-500" size={20} />
              {viewManager.name}
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Email:</strong> {viewManager.email}
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Mobile:</strong> {viewManager.mobile}
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Role:</strong> {viewManager.role}
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Status:</strong> {viewManager.isActive ? 'Active' : 'Inactive'}
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Email Verified:</strong> {viewManager.emailVerified ? 'Yes' : 'No'}
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Created:</strong> {new Date(viewManager.createdAt).toLocaleDateString()}
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong className="text-indigo-900">Updated:</strong> {new Date(viewManager.updatedAt).toLocaleDateString()}
              </motion.div>
            </motion.div>
            {/* Permissions Section */}
            <motion.div className="mt-4">
              <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                <Colorful3DIcon icon={FaShieldAlt} color="from-orange-400 to-red-500" size={16} />
                Permissions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(viewManager.permissions || {}).map(([key, value]) => (
                  <PermissionButton key={key} permissionKey={key} value={value} />
                ))}
              </div>
            </motion.div>
            {/* Properties Section */}
            <motion.div className="mt-4">
              <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                <Colorful3DIcon icon={FaHome} color="from-indigo-400 to-blue-500" size={16} />
                Assigned Properties
              </h4>
              {viewManager.properties && viewManager.properties.length > 0 ? (
                <div className="space-y-2">
                  {viewManager.properties.map((prop, index) => (
                    <motion.div 
                      key={index}
                      className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-sm border border-blue-200 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <p className="font-medium text-indigo-900">{prop.name}</p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-blue-500" size={12} />
                        {prop.address}, {prop.city}, {prop.state}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.p 
                  className="text-gray-500 text-sm p-3 bg-gray-50 rounded-xl text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  No properties assigned
                </motion.p>
              )}
            </motion.div>
            <motion.div 
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={handleViewClose}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Colorful3DIcon icon={FaTimes} color="from-gray-400 to-gray-500" size={16} />
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleDeleteCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-4 sm:p-6 m-4 max-w-sm w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="text-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Colorful3DIcon icon={FaExclamationTriangle} color="from-yellow-400 to-red-500" size={48} />
              <h3 className="text-lg font-bold text-red-900 mt-2">Confirm Delete</h3>
              <p className="text-gray-600 text-sm">Are you sure you want to delete this manager? This action cannot be undone.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col sm:flex-row gap-2 sm:gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Colorful3DIcon icon={FaTrash} color="from-red-400 to-red-500" size={16} />
                Delete
              </motion.button>
              <motion.button
                onClick={handleDeleteCancel}
                className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Colorful3DIcon icon={FaTimesCircle} color="from-gray-400 to-gray-500" size={16} />
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyManagerList;