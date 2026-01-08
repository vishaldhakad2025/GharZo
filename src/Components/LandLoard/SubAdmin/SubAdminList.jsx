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
} from "react-icons/fi";
import {
  FaKey as FaKeyIcon,
  FaTrash,
  FaUser,
  FaIdCard,
  FaUpload,
  FaLock as FaLockIcon,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome as FaHomeIcon,
  FaTimes,
  FaCheck,
  FaLock,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const SubAdminList = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    aadhaarNumber: "",
    profilePhoto: null,
    idProofImage: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  const [permissionsList, setPermissionsList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [agreementDuration, setAgreementDuration] = useState("");
  const [agreementEndDate, setAgreementEndDate] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token); // Debugging
        if (!token) {
          setError("No authentication token found. Please log in.");
          toast.error("Please log in to continue", {
            position: "top-center",
            autoClose: 2000,
          });
          navigate("/login");
          return;
        }

        setLoading(true);
        const response = await fetch(
          "https://api.gharzoreality.com/api/sub-owner/auth/sub-owners",
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
            errorData.message ||
              `Failed to fetch sub-owners: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Fetched subAdmins data:", data); // Debugging
        if (data.success) {
          const mappedAdmins = data.subOwners.map((so) => {
            const admin = { ...so };
            if (so._id) {
              admin.id = so._id; // Ensure id is set if _id exists
            }
            console.log("Mapped admin ID:", admin.id); // Debugging
            return admin;
          });
          setSubAdmins(mappedAdmins);
        } else {
          setError(data.message || "Failed to retrieve sub-owners");
          toast.error(data.message || "Failed to retrieve sub-owners", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching sub-admins:", err);
        toast.error(err.message || "Error fetching sub-admins", {
          position: "top-center",
          autoClose: 2000,
        });
        if (err.message.includes("Authentication")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found in localStorage");
        }

        const response = await fetch(
          "https://api.gharzoreality.com/api/permissions",
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
              `Failed to fetch permissions: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.success) {
          setPermissionsList(data.permissions || []);
        } else {
          throw new Error(data.message || "Failed to fetch permissions");
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error(error.message || "Error fetching permissions", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    };

    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
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
          position: "top-center",
          autoClose: 2000,
        });
      }
    };

    fetchSubAdmins();
    fetchPermissions();
    fetchProperties();
  }, [navigate]);

  const openModal = (subAdmin) => {
    const adminId = subAdmin._id || subAdmin.id;
    console.log("Opening modal for ID:", adminId); // Debugging
    if (!adminId) {
      toast.error("Invalid sub-admin ID", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setSelectedSubAdmin(subAdmin);
    setFormData({
      id: adminId,
      name: subAdmin.name || "",
      email: subAdmin.email || "",
      mobile: subAdmin.mobile || "",
      password: "",
      aadhaarNumber: subAdmin.aadhaarNumber || "",
      profilePhoto: subAdmin.profilePhoto || null,
      idProofImage: subAdmin.idProofImage || null,
    });
    setSelectedPermissions(
      subAdmin.permissions
        ? subAdmin.permissions.map((p) => String(p._id || p.id || p))
        : []
    );
    setSelectedProperties(
      subAdmin.assignedProperties
        ? subAdmin.assignedProperties.map((ap) => ({
            propertyId: ap.property?._id || ap.property?.id || ap.propertyId,
            agreementDuration: ap.agreementDuration || { years: 2 },
            agreementEndDate: ap.agreementEndDate || "",
          }))
        : []
    );
    setIsModalOpen(true);
    setEditMode(false);
    setShowAllPermissions(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubAdmin(null);
    setEditMode(false);
    setFormData({
      id: "",
      name: "",
      email: "",
      mobile: "",
      password: "",
      aadhaarNumber: "",
      profilePhoto: null,
      idProofImage: null,
    });
    setSelectedPermissions([]);
    setSelectedProperties([]);
    setShowAllPermissions(false);
    setShowPermissionModal(false);
    setShowPropertyModal(false);
    setSelectedProperty(null);
    setAgreementDuration("");
    setAgreementEndDate("");
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = deleteId;
    console.log("handleDelete called with ID:", id); // Debugging
    if (!id) {
      toast.error("Invalid sub-admin ID. Cannot delete.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("Please log in to continue", {
          position: "top-center",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      setLoading(true);
      const response = await fetch(
        `https://api.gharzoreality.com/api/sub-owner/auth/delete/${id}`,
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
          errorData.message || `Failed to delete sub-owner: ${response.status}`
        );
      }

      const updated = subAdmins.filter(
        (subAdmin) => (subAdmin._id || subAdmin.id) !== id
      );
      setSubAdmins(updated);

      if (
        selectedSubAdmin &&
        (selectedSubAdmin._id || selectedSubAdmin.id) === id
      ) {
        closeModal();
      }
      toast.success(
        `Team member (ID: ${id.substring(0, 8)}...) deleted successfully!`,
        {
          position: "top-center",
          autoClose: 2000,
        }
      );
    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete team member", {
        position: "top-center",
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
    if (!id) {
      toast.error("Invalid ID for update", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("Please log in to continue", {
          position: "top-center",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      setLoading(true);
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("mobile", formData.mobile);
      submitData.append("aadhaarNumber", formData.aadhaarNumber);
      submitData.append("permissions", JSON.stringify(selectedPermissions));
      submitData.append(
        "assignedProperties",
        JSON.stringify(selectedProperties.filter((sp) => sp.propertyId))
      );
      if (formData.password) {
        submitData.append("password", formData.password);
      }
      if (formData.profilePhoto instanceof File) {
        submitData.append("profilePhoto", formData.profilePhoto);
        toast.info("Profile photo updated successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
      }
      if (formData.idProofImage instanceof File) {
        submitData.append("idProofImage", formData.idProofImage);
        toast.info("ID proof image updated successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
      }

      const response = await fetch(
        `https://api.gharzoreality.com/api/sub-owner/auth/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update sub-owner: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.success) {
        const updatedSubAdmins = subAdmins.map((admin) => {
          if ((admin._id || admin.id) === id) {
            return {
              ...admin,
              ...formData,
              permissions: permissionsList.filter((p) =>
                selectedPermissions.includes(String(p.id))
              ),
              assignedProperties: selectedProperties.map((sp) => ({
                ...sp,
                property: propertiesList.find(
                  (p) => p._id === sp.propertyId || p.id === sp.propertyId
                ),
              })),
            };
          }
          return admin;
        });
        setSubAdmins(updatedSubAdmins);
        toast.success(`Team member '${formData.name}' updated successfully!`, {
          position: "top-center",
          autoClose: 2000,
        });
        setEditMode(false);
      } else {
        setError(data.message || "Failed to update sub-owner");
        toast.error(data.message || "Failed to update team member", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Error updating team member", {
        position: "top-center",
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      toast.info(
        `${
          fieldName === "profilePhoto" ? "Profile photo" : "ID proof image"
        } selected successfully!`,
        {
          position: "top-center",
          autoClose: 2000,
        }
      );
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(String(permissionId))
        ? prev.filter((id) => id !== String(permissionId))
        : [...prev, String(permissionId)]
    );
  };

  // Select All Permissions
  const handleSelectAllPermissions = () => {
    const allPermissionIds = permissionsList.map((p) => String(p.id));
    setSelectedPermissions(allPermissionIds);
    toast.success("All permissions selected!", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  // Deselect All Permissions
  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
    toast.success("All permissions deselected!", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  const handlePropertyToggle = (propertyId) => {
    const propertyExists = propertiesList.some(
      (p) => p._id === propertyId || p.id === propertyId
    );
    if (!propertyExists) {
      toast.error("Invalid property selected", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const existingIndex = selectedProperties.findIndex(
      (p) => p.propertyId === propertyId
    );
    if (existingIndex > -1) {
      const newSelected = selectedProperties.filter(
        (_, index) => index !== existingIndex
      );
      setSelectedProperties(newSelected);
      setAgreementDuration("");
      setAgreementEndDate("");
      toast.success("Property removed successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      const newProperty = {
        propertyId,
        agreementDuration: { years: 2 },
        agreementEndDate: "",
      };
      setSelectedProperties([...selectedProperties, newProperty]);
      setAgreementDuration("");
      setAgreementEndDate("");
      toast.info("Property selected. Please set agreement end date via Edit.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
    const selected = selectedProperties.find(
      (p) => p.propertyId === (property._id || property.id)
    );
    if (selected) {
      setAgreementDuration(selected.agreementDuration.years.toString());
      setAgreementEndDate(
        selected.agreementEndDate ? selected.agreementEndDate.split("T")[0] : ""
      );
    } else {
      setAgreementDuration("2");
      setAgreementEndDate("");
    }
  };

  const handlePropertySelect = (propertyId) => {
    if (!agreementDuration || !agreementEndDate) {
      toast.error("Please provide both agreement duration and end date", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const durationYears = parseInt(agreementDuration);
    if (isNaN(durationYears) || durationYears <= 0) {
      toast.error("Agreement duration must be a positive number", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const endDate = new Date(agreementEndDate);
    const today = new Date();
    if (endDate <= today) {
      toast.error("Agreement end date must be in the future", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const propertyExists = propertiesList.some(
      (p) => p._id === propertyId || p.id === propertyId
    );
    if (!propertyExists) {
      toast.error("Invalid property ID", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const newPropertyData = {
      propertyId,
      agreementDuration: { years: durationYears },
      agreementEndDate: new Date(agreementEndDate).toISOString(),
    };

    let newSelected;
    const existingIndex = selectedProperties.findIndex(
      (p) => p.propertyId === propertyId
    );
    if (existingIndex > -1) {
      newSelected = selectedProperties.map((p, index) =>
        index === existingIndex ? newPropertyData : p
      );
      toast.success("Property details updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      newSelected = [...selectedProperties, newPropertyData];
      toast.success("Property assigned successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
    }

    setSelectedProperties(newSelected);
    setShowPropertyModal(false);
    setAgreementDuration("");
    setAgreementEndDate("");
  };

  const isPropertyUpdateDisabled = () => {
    const durationYears = parseInt(agreementDuration);
    const endDate = new Date(agreementEndDate);
    const today = new Date();
    return (
      !agreementDuration ||
      isNaN(durationYears) ||
      durationYears <= 0 ||
      !agreementEndDate ||
      endDate <= today
    );
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "Not set";
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSelectedPropertiesDisplay = () => {
    return selectedProperties.map((prop, index) => {
      const property = propertiesList.find(
        (p) => p._id === prop.propertyId || p.id === prop.propertyId
      );
      return (
        <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
          <p className="text-sm text-gray-700 font-medium">
            Property: {property?.name || "Unnamed Property"} (ID:{" "}
            {prop.propertyId})
          </p>
          <p className="text-sm text-gray-700">
            Duration: {prop.agreementDuration.years || 0} year(s)
          </p>
          <p className="text-sm text-gray-700">
            End Date: {formatDate(prop.agreementEndDate)}
          </p>
          {editMode && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  const property = propertiesList.find(
                    (p) => p._id === prop.propertyId || p.id === prop.propertyId
                  );
                  if (property) {
                    setSelectedProperty(property);
                    setAgreementDuration(
                      prop.agreementDuration.years.toString() || "2"
                    );
                    setAgreementEndDate(
                      prop.agreementEndDate
                        ? prop.agreementEndDate.split("T")[0]
                        : ""
                    );
                    setShowPropertyModal(true);
                  }
                }}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProperties(
                    selectedProperties.filter((_, i) => i !== index)
                  );
                  toast.success("Property removed successfully!", {
                    position: "top-center",
                    autoClose: 2000,
                  });
                }}
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

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">Loading team members...</div>
    );
  }

  return (
    <div className="p-6 min-h-[70vh] ">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Team Members
      </h2>
      {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
      {subAdmins.length === 0 && !error && !loading ? (
        <p className="text-gray-400 text-center text-lg">
          No team members found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subAdmins.map((subAdmin, index) => {
            const adminId = subAdmin._id || subAdmin.id;
            console.log(`Rendering subAdmin ${index} with ID:`, adminId); // Debugging
            if (!adminId) {
              console.warn("Skipping subAdmin with missing ID:", subAdmin);
              return null;
            }
            return (
              <motion.div
                key={adminId}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
                className="mb-8 p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20"
              >
                <motion.button
                  onClick={() => openModal(subAdmin)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full shadow-md border border-gray-200 hover:border-blue-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit3 className="text-blue-600 text-lg" />
                </motion.button>

                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-4 shadow-md rounded-full overflow-hidden border-2 border-gray-200">
                    {subAdmin.profilePhoto ? (
                      <img
                        src={subAdmin.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600 bg-gray-100"
                      style={{
                        display: subAdmin.profilePhoto ? "none" : "flex",
                      }}
                    >
                      {subAdmin.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {subAdmin.name || "Unnamed"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {subAdmin.email || "—"}
                  </p>
                  <div className="mx-auto w-full max-w-xs">
                    <p className="text-lg font-semibold text-gray-900 text-center">
                      {subAdmin.mobile || "—"}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">Contact</p>
                  </div>
                </div>

                <div className="flex space-x-3 justify-center pt-2">
                  <motion.button
                    onClick={() => openModal(subAdmin)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white rounded-lg shadow-lg hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300 transform hover:scale-105 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    onClick={() => confirmDelete(adminId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedSubAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[130vh] overflow-y-auto"
            >
              <motion.button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:border-red-400 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiX className="text-red-500 text-xl" />
              </motion.button>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 shadow-2xl shadow-gray-200 rounded-full overflow-hidden">
                    {formData.profilePhoto ? (
                      <img
                        src={
                          typeof formData.profilePhoto === "string"
                            ? formData.profilePhoto
                            : URL.createObjectURL(formData.profilePhoto)
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-600"
                      style={{
                        display: formData.profilePhoto ? "none" : "flex",
                      }}
                    >
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
                  <p className="text-sm text-gray-600">Team Member</p>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
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
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
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
                          className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-red-500"
                        />
                      ) : (
                        <p className="text-gray-600">{formData.email || "—"}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
                    <div className="p-2 bg-yellow-100 rounded-full mr-4">
                      <FiCalendar className="text-yellow-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">Created</p>
                      <p className="text-gray-600">
                        {selectedSubAdmin.createdAt
                          ? new Date(
                              selectedSubAdmin.createdAt
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
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
                    <div className="p-2 bg-indigo-100 rounded-full mr-4">
                      <FaIdCard className="text-indigo-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">
                        Aadhaar Number
                      </p>
                      {editMode ? (
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={formData.aadhaarNumber}
                          onChange={handleInputChange}
                          className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-600">
                          {formData.aadhaarNumber || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                  {editMode && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
                      <div className="p-2 bg-purple-100 rounded-full mr-4">
                        <FaLockIcon className="text-purple-600 text-xl" />
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
                          className="text-gray-600 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
                    <div className="p-2 bg-green-100 rounded-full mr-4">
                      <FaUpload className="text-green-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">
                        Profile Photo
                      </p>
                      {editMode ? (
                        <>
                          {formData.profilePhoto && (
                            <img
                              src={
                                typeof formData.profilePhoto === "string"
                                  ? formData.profilePhoto
                                  : URL.createObjectURL(formData.profilePhoto)
                              }
                              alt="Current Profile"
                              className="max-w-full mb-2 rounded-lg"
                            />
                          )}
                          <input
                            type="file"
                            name="profilePhoto"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChange(e, "profilePhoto")
                            }
                            className="text-gray-600 w-full"
                          />
                        </>
                      ) : (
                        <p className="text-gray-600">
                          {formData.profilePhoto ? (
                            <img
                              src={formData.profilePhoto}
                              alt="Profile"
                              className="max-w-full rounded-lg"
                            />
                          ) : (
                            "No photo uploaded"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl shadow-sm">
                    <div className="p-2 bg-orange-100 rounded-full mr-4">
                      <FaUpload className="text-orange-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">
                        ID Proof Image
                      </p>
                      {editMode ? (
                        <>
                          {formData.idProofImage && (
                            <img
                              src={
                                typeof formData.idProofImage === "string"
                                  ? formData.idProofImage
                                  : URL.createObjectURL(formData.idProofImage)
                              }
                              alt="Current ID Proof"
                              className="max-w-full mb-2 rounded-lg"
                            />
                          )}
                          <input
                            type="file"
                            name="idProofImage"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChange(e, "idProofImage")
                            }
                            className="text-gray-600 w-full"
                          />
                        </>
                      ) : (
                        <p className="text-gray-600">
                          {formData.idProofImage ? (
                            <img
                              src={formData.idProofImage}
                              alt="ID Proof"
                              className="max-w-full rounded-lg"
                            />
                          ) : (
                            "No ID proof uploaded"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                    <FiHome className="mr-2 text-gray-600" />
                    Assigned Properties
                  </h3>
                  {editMode ? (
                    <div className="border rounded-xl p-3 bg-gray-50">
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
                            propertiesList.map((property) => (
                              <button
                                key={property._id || property.id}
                                type="button"
                                onClick={() =>
                                  handlePropertyToggle(
                                    property._id || property.id
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  selectedProperties.some(
                                    (p) =>
                                      p.propertyId ===
                                      (property._id || property.id)
                                  )
                                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {property.name ||
                                  `Property ID: ${(
                                    property._id || property.id
                                  ).substring(0, 8)}...`}
                              </button>
                            ))
                          )}
                          {propertiesList.length > 6 && (
                            <button
                              type="button"
                              onClick={() => setShowPropertyModal(true)}
                              className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium hover:bg-blue-200"
                            >
                              +{propertiesList.length - 6} More
                            </button>
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
                  ) : selectedSubAdmin.assignedProperties &&
                    selectedSubAdmin.assignedProperties.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSubAdmin.assignedProperties.map((prop, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                          <span>
                            {prop.property?.name || "Unnamed Property"}
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
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          type="button"
                          onClick={handleSelectAllPermissions}
                          className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium hover:bg-green-200"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAllPermissions}
                          className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium hover:bg-red-200"
                        >
                          Deselect All
                        </button>
                        {permissionsList.slice(0, 6).map((permission) => (
                          <button
                            key={permission.id}
                            type="button"
                            onClick={() =>
                              handlePermissionToggle(permission.id)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              selectedPermissions.includes(
                                String(permission.id)
                              )
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {permission.name}
                          </button>
                        ))}
                        {permissionsList.length > 6 && (
                          <button
                            type="button"
                            onClick={() => setShowPermissionModal(true)}
                            className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium hover:bg-blue-200"
                          >
                            +{permissionsList.length - 6} More
                          </button>
                        )}
                      </div>
                      {selectedPermissions.length > 0 && (
                        <p className="text-sm text-blue-600">
                          Selected: {selectedPermissions.length} permissions
                        </p>
                      )}
                    </div>
                  ) : selectedSubAdmin.permissions &&
                    selectedSubAdmin.permissions.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {(showAllPermissions
                          ? selectedSubAdmin.permissions
                          : selectedSubAdmin.permissions.slice(0, 3)
                        ).map((perm, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center text-sm text-gray-600 bg-blue-50 rounded-md p-1"
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span>
                              {perm.name?.replace(/_/g, " ").toUpperCase() ||
                                "Unnamed Permission"}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      {selectedSubAdmin.permissions.length > 3 && (
                        <motion.button
                          onClick={() =>
                            setShowAllPermissions(!showAllPermissions)
                          }
                          className="mt-3 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {showAllPermissions
                            ? "Show Less"
                            : "See More Permissions"}
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No permissions assigned.
                    </p>
                  )}
                </div>
                {!editMode &&
                  formData.idProofImage &&
                  typeof formData.idProofImage === "string" && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                        <FaIdCard className="mr-2 text-orange-600" />
                        ID Proof Image
                      </h3>
                      <img
                        src={formData.idProofImage}
                        alt="ID Proof"
                        className="max-w-full rounded-lg"
                      />
                    </div>
                  )}
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                  {editMode ? (
                    <motion.button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? "Saving..." : "Save"}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Edit
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => confirmDelete(formData.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    onClick={closeModal}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
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
        {showPermissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPermissionModal(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaLock className="mr-2 text-indigo-500" />
                    Permissions
                  </h3>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {permissionsList.map((permission) => (
                      <div
                        key={permission.id}
                        onClick={() => handlePermissionToggle(permission.id)}
                        className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition ${
                          selectedPermissions.includes(String(permission.id))
                            ? "border-orange-300 bg-orange-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {permission.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPropertyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPropertyModal(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaHomeIcon className="mr-2 text-blue-500" />
                    Property Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowPropertyModal(false);
                      setSelectedProperty(null);
                      setAgreementDuration("");
                      setAgreementEndDate("");
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {selectedProperty ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      {selectedProperty.images &&
                      selectedProperty.images.length > 0 ? (
                        <img
                          src={selectedProperty.images[0]}
                          alt={selectedProperty.name || "Property Image"}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                          <span className="text-gray-500">
                            No Image Available
                          </span>
                        </div>
                      )}
                      <p className="font-semibold text-gray-800 text-lg">
                        {selectedProperty.name || "Unnamed Property"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        {selectedProperty.location || "No location provided"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaHomeIcon className="mr-2 text-blue-500" />
                        Type: {selectedProperty.type || "No type specified"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">ID:</span>{" "}
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {selectedProperty._id || selectedProperty.id}
                        </span>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="number"
                          placeholder="Agreement Duration (Years)"
                          value={agreementDuration}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (parseInt(value) > 0 && !isNaN(parseInt(value)))
                            ) {
                              setAgreementDuration(value);
                            }
                          }}
                          className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 shadow-sm w-full"
                          min="1"
                          step="1"
                        />
                        {agreementDuration &&
                          (isNaN(parseInt(agreementDuration)) ||
                            parseInt(agreementDuration) <= 0) && (
                            <p className="text-xs text-red-500 mt-1">
                              Duration must be a positive number
                            </p>
                          )}
                      </div>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="date"
                          value={agreementEndDate}
                          onChange={(e) => setAgreementEndDate(e.target.value)}
                          className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 shadow-sm w-full"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePropertySelect(
                          selectedProperty._id || selectedProperty.id
                        )
                      }
                      disabled={isPropertyUpdateDisabled()}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        isPropertyUpdateDisabled()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      {selectedProperties.some(
                        (p) =>
                          p.propertyId ===
                          (selectedProperty._id || selectedProperty.id)
                      )
                        ? "Update Property Details"
                        : "Assign Property"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {propertiesList.map((property) => (
                        <div
                          key={property._id || property.id}
                          onClick={() => handlePropertyClick(property)}
                          className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition ${
                            selectedProperties.some(
                              (p) =>
                                p.propertyId === (property._id || property.id)
                            )
                              ? "border-blue-300 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <p className="font-medium text-sm text-gray-800 truncate">
                            {property.name || "Unnamed Property"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {property.location || "No location provided"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {(property._id || property.id).substring(0, 8)}
                            ...
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setShowPropertyModal(false);
                        setAgreementDuration("");
                        setAgreementEndDate("");
                      }}
                      className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
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
                Are you sure you want to delete this team member? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
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

export default SubAdminList;