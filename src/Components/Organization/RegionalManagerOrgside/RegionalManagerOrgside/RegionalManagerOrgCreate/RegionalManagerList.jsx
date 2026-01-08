import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit3,
  FiSave,
  FiEye,
  FiEyeOff,
  FiX,
  FiPhone,
  FiMail,
  FiCalendar,
  FiHome,
  FiKey,
  FiLock,
  FiMapPin,
  FiCheckCircle,
  FiSearch,
  FiUser,
  FiShield,
} from "react-icons/fi";
import {
  FaKey as FaKeyIcon,
  FaTrash,
  FaUser,
  FaUpload,
  FaLock as FaLockIcon,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome as FaHomeIcon,
  FaTimes,
  FaCheck,
  FaLock,
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

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

const RegionalManagerList = () => {
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    region: "",
    status: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  const [propertiesList, setPropertiesList] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [permissionsState, setPermissionsState] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const navigate = useNavigate();

  const permissionsConfig = [
    {
      group: "🔹 Property Management",
      keys: ["canCreateProperty", "canUpdateProperty", "canDeleteProperty", "canAssignProperty"]
    },
    {
      group: "🔹 Property Manager Management",
      keys: ["canCreatePropertyManager", "canUpdatePropertyManager", "canDeletePropertyManager", "canAssignPropertyToManager"]
    },
    {
      group: "🔹 Worker Management (via property managers)",
      keys: ["canViewWorkers", "canApproveWorker"]
    },
    {
      group: "🔹 Tenant & Occupancy",
      keys: ["canManageTenants", "canViewTenantDetails"]
    },
    {
      group: "🔹 Finance & Reports",
      keys: ["canViewReports", "canViewFinancials", "canUpdateCollections"]
    },
    {
      group: "🔹 Maintenance & Support",
      keys: ["canManageMaintenance", "canApproveMaintenanceRequests"]
    },
    {
      group: "🔹 Communication",
      keys: ["canSendNotifications", "canContactTenants"]
    },
    {
      group: "🔹 Organization level",
      keys: ["canViewOrgProfile", "canUpdateRegionalSettings"]
    }
  ];

  useEffect(() => {
    fetchOrganizationProfile();
    fetchProperties();
  }, [navigate]);

  useEffect(() => {
    if (organizationId) {
      fetchRegionalManagers(nameFilter, regionFilter);
    }
  }, [organizationId, nameFilter, regionFilter]);

  const fetchOrganizationProfile = async () => {
    try {
      const token = localStorage.getItem("orgToken");
      console.log("Token for org profile:", token);
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("Please log in to continue", {
          position: "bottom-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      const response = await fetch("https://api.gharzoreality.com/api/organization/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch organization profile: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Organization Profile:", data);
      setOrganizationId(data.id);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching organization profile:", err);
      toast.error(err.message || "Error fetching organization profile", {
        position: "bottom-right",
        autoClose: 2000,
      });
      if (err.message.includes("Authentication")) {
        navigate("/login");
      }
    }
  };

  const fetchRegionalManagers = async (name = "", region = "") => {
    try {
      const token = localStorage.getItem("orgToken");
      console.log("Token for regional managers:", token);
      console.log("Organization ID:", organizationId);
      if (!token || !organizationId) {
        setError("Missing token or organization ID.");
        toast.error("Please log in to continue", {
          position: "bottom-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      setLoading(true);
      let url = `https://api.gharzoreality.com/api/regional-managers/${organizationId}`;
      if (name || region) {
        url = `https://api.gharzoreality.com/api/regional-managers/search?${name ? `name=${encodeURIComponent(name)}&` : ""}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(/&$/, "");
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch regional managers: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Fetched regionalManagers data:", data);
      setRegionalManagers(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching regional managers:", err);
      toast.error(err.message || "Error fetching regional managers", {
        position: "bottom-right",
        autoClose: 2000,
      });
      if (err.message.includes("Authentication")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRegionalManagers(nameFilter, regionFilter);
  };

  const handleClearFilters = () => {
    setNameFilter("");
    setRegionFilter("");
    fetchRegionalManagers();
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("orgToken");
      console.log("Token for properties:", token);
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch(
        "https://api.gharzoreality.com/api/landlord/properties",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch properties: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.success) {
        setPropertiesList(
          data.properties.map((p) => ({ ...p, id: p._id })) || []
        );
      } else {
        throw new Error(data.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error(error.message || "Error fetching properties", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const formatPermissionName = (key) => {
    return key
      .replace(/^can/, "")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const ToggleSwitch = ({ checked, onChange, label, id, disabled }) => {
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      const newChecked = !checked;
      const fakeEvent = { target: { checked: newChecked } };
      onChange(fakeEvent);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle(e);
      }
    };

    return (
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-between w-full cursor-pointer p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-sm font-medium text-gray-700">{formatPermissionName(label)}</span>
        <div
          className={`relative inline-block w-14 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${
            checked ? "bg-green-500" : "bg-red-500"
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${
              checked ? "translate-x-6" : "translate-x-0"
            }`}
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
          />
        </div>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={true}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    );
  };

  const openModal = async (manager) => {
    const managerId = manager.id;
    console.log("Opening modal for ID:", managerId);
    console.log("Token:", localStorage.getItem("orgToken"));
    if (!managerId) {
      toast.error("Invalid regional manager ID", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        toast.error("No authentication token found. Please log in.", {
          position: "bottom-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://api.gharzoreality.com/api/regional-managers/detail/${managerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch manager details: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Fetched manager details:", data);
      const detailedManager = data.data;

      setSelectedManager(detailedManager);
      setFormData({
        id: detailedManager.id,
        name: detailedManager.name || "",
        email: detailedManager.email || "",
        mobile: detailedManager.mobile || "",
        region: detailedManager.region || "",
        status: detailedManager.status || "active",
        password: "",
      });
      setSelectedProperties(
        detailedManager.properties
          ? detailedManager.properties.map((p) => p._id || p.id || p.propertyId || p)
          : []
      );

      // Initialize permissions state
      const allKeys = permissionsConfig.flatMap(g => g.keys);
      const initialPermissions = allKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {});
      Object.entries(detailedManager.permissions || {}).forEach(([key, val]) => {
        if (allKeys.includes(key)) {
          initialPermissions[key] = !!val;
        }
      });
      setPermissionsState(initialPermissions);

      setIsModalOpen(true);
      setEditMode(false);
      setShowAllPermissions(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching manager details:", err);
      toast.error(err.message || "Error fetching manager details", {
        position: "bottom-right",
        autoClose: 2000,
      });
      if (err.message.includes("Authentication")) {
        navigate("/login");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedManager(null);
    setEditMode(false);
    setFormData({
      id: "",
      name: "",
      email: "",
      mobile: "",
      region: "",
      status: "",
      password: "",
    });
    setSelectedProperties([]);
    setPermissionsState({});
    setShowAllPermissions(false);
    setShowDeleteConfirm(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = deleteId;
    console.log("handleDelete called with ID:", id);
    console.log("Token:", localStorage.getItem("orgToken"));
    if (!id) {
      toast.error("Invalid regional manager ID. Cannot delete.", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("Please log in to continue", {
          position: "bottom-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      setLoading(true);
      const response = await fetch(
        `https://api.gharzoreality.com/api/regional-managers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete regional manager: ${response.status}`
        );
      }

      const updated = regionalManagers.filter((manager) => manager.id !== id);
      setRegionalManagers(updated);

      if (selectedManager && selectedManager.id === id) {
        closeModal();
      }
      toast.success(
        `Regional Manager (ID: ${id.substring(0, 8)}...) deleted successfully!`,
        {
          position: "bottom-right",
          autoClose: 2000,
        }
      );
    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete regional manager", {
        position: "bottom-right",
        autoClose: 2000,
      });
      if (err.message.includes("Authentication")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleUpdate = async () => {
    const id = formData.id;
    console.log("Updating manager ID:", id);
    console.log("Token:", localStorage.getItem("orgToken"));
    if (!id) {
      toast.error("Invalid ID for update", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("Please log in to continue", {
          position: "bottom-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      setLoading(true);

      // Update main profile including permissions and properties
      const updateData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        region: formData.region,
        status: formData.status,
        properties: selectedProperties,
        permissions: permissionsState,
      };


      const response = await fetch(
        `https://api.gharzoreality.com/api/regional-managers/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update regional manager: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Update response:", data);

      // Change password if provided
      if (formData.password) {
        const passwordResponse = await fetch(
          "https://api.gharzoreality.com/api/regional-managers/change-password",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: formData.password }),
          }
        );

        if (!passwordResponse.ok) {
          const passError = await passwordResponse.json().catch(() => ({}));
          throw new Error(
            passError.message || `Failed to change password: ${passwordResponse.status}`
          );
        }

        const passData = await passwordResponse.json();
        toast.success(passData.message || "Password changed successfully", {
          position: "bottom-right",
          autoClose: 2000,
        });
      }

           if (data.success || data.message === "Regional Manager updated successfully") {
        const updatedRegionalManagers = regionalManagers.map((manager) => {
          if (manager.id === id) {
            return {
              ...manager,
              ...formData,
              permissions: permissionsState,
              properties: selectedProperties.map((propId) => ({
                _id: propId,
                ...(propertiesList.find((p) => p._id === propId || p.id === propId) || {}),
              })),
            };
          }
          return manager;
        });
        setRegionalManagers(updatedRegionalManagers);

        // Show success toast
        toast.success(`Regional Manager '${formData.name}' updated successfully!`, {
          position: "bottom-right",
          autoClose: 2000,
        });

        // Close modal immediately after successful save
        closeModal();

        // Optional: refetch list in background to ensure server state sync
        fetchRegionalManagers(nameFilter, regionFilter);

        // No need to keep edit mode on
        setEditMode(false);
      } else {
        setError(data.message || "Failed to update regional manager");
        toast.error(data.message || "Failed to update regional manager", {
          position: "bottom-right",
          autoClose: 2000,
        });
      }

    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Error updating regional manager", {
        position: "bottom-right",
        autoClose: 2000,
      });
      if (err.message.includes("Authentication")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (key, e) => {
    if (!editMode) return; // Prevent toggle if not in edit mode
    const newValue = e.target.checked;
    setPermissionsState((prev) => ({ ...prev, [key]: newValue }));
  };

  const handlePropertyToggle = (propertyId) => {
    if (!editMode) return; // Prevent toggle if not in edit mode
    const propertyExists = propertiesList.some(
      (p) => p._id === propertyId || p.id === propertyId
    );
    if (!propertyExists) {
      toast.error("Invalid property selected", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    if (selectedProperties.includes(propertyId)) {
      const newSelected = selectedProperties.filter((id) => id !== propertyId);
      setSelectedProperties(newSelected);
      toast.success("Property removed successfully!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      setSelectedProperties([...selectedProperties, propertyId]);
      toast.info("Property assigned successfully!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const getSelectedPropertiesDisplay = () => {
    return selectedProperties.map((propId, index) => {
      const property = propertiesList.find(
        (p) => p._id === propId || p.id === propId
      );
      return (
        <div key={index} className="bg-indigo-50 p-3 rounded-lg mb-2">
          <p className="text-sm text-gray-700 font-medium">
            Property: {property?.name || "Unnamed Property"}
          </p>
          {editMode && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => handlePropertyToggle(propId)}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  if (loading && regionalManagers.length === 0) {
    return (
      <div className="p-4 text-center text-white">Loading Regional Managers...</div>
    );
  }

  return (
    <div className="p-4 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Regional Manager Cards
      </h2>
      {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
      <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
        {/* <div className="relative">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
          />
        </div> */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="p-2 w-[800px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {/* <motion.button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiSearch /> Search
        </motion.button>
        <motion.button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear
        </motion.button> */}
      </div>
      {regionalManagers.length === 0 && !error && !loading ? (
        <p className="text-gray-300 text-center text-sm">
          No Regional Managers found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionalManagers.map((manager, index) => {
            const managerId = manager.id;
            console.log(`Rendering manager ${index} with ID:`, managerId);
            if (!managerId) {
              console.warn("Skipping manager with missing ID:", manager);
              return null;
            }
            return (
              <motion.div
                key={managerId}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
                className="relative bg-white pt-20 rounded-lg shadow-lg overflow-hidden border-2 border-blue-400 shadow-xl shadow-blue-500 p-4"
              >
                <motion.button
                  onClick={() => openModal(manager)}
                  className="absolute top-2 left-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow:
                      "0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <FiEdit3
                    className="text-blue-600 text-xl transition-colors duration-200"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))",
                    }}
                  />
                </motion.button>

                <div className="relative -mt-12">
                  <div className="w-24 h-24 mx-auto shadow-2xl shadow-blue-500/25 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                      {manager.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center pt-0">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {manager.name || "Unnamed"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {manager.email || "—"}
                  </p>
                  <div className=" mb-4 px-2">
                    <div className="text-center">
                      <p className="text-lg font-semibold border border-xl p-2 rounded-2xl text-black">
                        {manager.mobile || "—"}
                      </p>
                      <p className="text-xs text-gray-500">Mobile</p>
                    </div>
                    {/* <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600 ">
                        Regional Manager
                      </p>
                      <p className="text-xs text-gray-500">Role</p>
                    </div> */}
                  </div>
                  <div className="flex space-x-2 justify-center">
                    <motion.button
                      onClick={() => openModal(manager)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      onClick={() => confirmDelete(managerId)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full h-full overflow-hidden"
            >
              <motion.button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:border-red-400 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiX className="text-red-500 text-xl" />
              </motion.button>
              <div 
                className="p-6 h-full overflow-y-auto" 
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                }}
              >
                <style jsx>{`
                  &::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                  }
                `}</style>
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 shadow-2xl shadow-blue-500/25 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white">
                      {formData.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </div>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-800 mb-1 w-full text-center rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {formData.name || "Unnamed"}
                    </h2>
                  )}
                  <p className="text-sm text-gray-600">Regional Manager</p>
                </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="p-2 bg-blue-100 rounded-full mr-4">
        <FiPhone className="text-blue-600 text-xl" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-700">Mobile</p>
        {editMode ? (
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-gray-600">
            {formData.mobile || "—"}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="p-2 bg-red-100 rounded-full mr-4">
        <FiMail className="text-red-600 text-xl" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-700">Email</p>
        {editMode ? (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-gray-600">{formData.email || "—"}</p>
        )}
      </div>
    </div>
    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="p-2 bg-yellow-100 rounded-full mr-4">
        <FiCalendar className="text-yellow-600 text-xl" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-700">Created</p>
        <p className="text-gray-600">
          {selectedManager.createdAt
            ? new Date(
                selectedManager.createdAt
              ).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </p>
      </div>
    </div>
    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="p-2 bg-indigo-100 rounded-full mr-4">
        <FiMapPin className="text-indigo-600 text-xl" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-700">Region</p>
        {editMode ? (
          <select
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-600">
            {formData.region || "—"}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="p-2 bg-green-100 rounded-full mr-4">
        <FiCheckCircle className="text-green-600 text-xl" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-700">Status</p>
        {editMode ? (
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        ) : (
          <p className="text-gray-600 capitalize">
            {formData.status || "—"}
          </p>
        )}
      </div>
    </div>
    
    {editMode && (
      <div className="sm:col-span-2 flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
        <div className="p-2 bg-purple-100 rounded-full mr-4">
          <FaLock className="text-purple-600 text-xl" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-700">
            New Password (leave blank to keep current)
          </p>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    )}
  </div>
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                      <FiHome className="mr-2 text-blue-600" />
                      Assigned Properties
                    </h3>
                    {editMode ? (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            All Properties (Toggle to Assign):
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {propertiesList.length === 0 ? (
                              <span className="text-gray-500 text-sm">
                                No properties available
                              </span>
                            ) : (
                              propertiesList.map((property) => {
                                const propId = property._id || property.id;
                                return (
                                  <button
                                    key={propId}
                                    type="button"
                                    onClick={() => handlePropertyToggle(propId)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                      selectedProperties.includes(propId)
                                        ? "bg-orange-100 text-orange-800 border border-orange-300"
                                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    }`}
                                  >
                                    {property.name ||
                                      `Property ID: ${propId.substring(0, 8)}...`}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                        {selectedProperties.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">
                              Assigned Properties:
                            </h4>
                            {getSelectedPropertiesDisplay()}
                          </div>
                        )}
                      </div>
                    ) : selectedManager.properties &&
                      selectedManager.properties.length > 0 ? (
                      <div className="space-y-2">
                        {selectedManager.properties.map((prop, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>
                              {prop.name || prop.property?.name || "Unnamed Property"}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No properties assigned.
                      </p>
                    )}
                  </div>
               <div className="border-t pt-4">
    <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
      <FiKey className="mr-2 text-purple-600" />
      Permissions
    </h3>
    {editMode ? (
      <div className="border rounded-lg p-3 bg-gray-50 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          {permissionsConfig.map(({ group, keys }) => (
            <div key={group} className="border-b pb-4 last:border-b-0">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                {group}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {keys.map((key) => (
                  <ToggleSwitch
                    key={key}
                    id={`toggle-${key}`}
                    checked={permissionsState[key] || false}
                    onChange={(e) => handlePermissionToggle(key, e)}
                    label={key}
                    disabled={!editMode}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : selectedManager.permissions && Object.keys(selectedManager.permissions).filter(key => selectedManager.permissions[key]).length > 0 ? (
      <>
        <div className="flex flex-wrap gap-2">
          {(showAllPermissions
            ? Object.keys(selectedManager.permissions).filter(key => selectedManager.permissions[key])
            : Object.keys(selectedManager.permissions).filter(key => selectedManager.permissions[key]).slice(0, 3)
          ).map((permKey, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium"
            >
              {formatPermissionName(permKey)}
            </motion.span>
          ))}
        </div>
        {Object.keys(selectedManager.permissions).filter(key => selectedManager.permissions[key]).length > 3 && (
          <motion.button
            onClick={() =>
              setShowAllPermissions(!showAllPermissions)
            }
            className="mt-3 px-3 py-2  text-black bg-orange-600 rounded-md hover:bg-blue-600 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showAllPermissions
              ? <FaArrowAltCircleDown/> 
              : <FaArrowAltCircleUp />
              }
          </motion.button>
        )}
      </>
    ) : (
      <p className="text-sm text-gray-500 italic">
        No permissions assigned.
      </p>
    )}
  </div>
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    {editMode ? (
                      <motion.button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        {loading ? "Saving..." : "Save"}
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => confirmDelete(formData.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Delete
                    </motion.button>
                    <motion.button
                      onClick={closeModal}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaTrash className="mr-2 text-red-500" />
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this Regional Manager? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ToastContainer />
      </div>
    );
  };

export default RegionalManagerList;