import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaIdCard,
  FaMapMarkerAlt,
  FaHome,
  FaUpload,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
} from "react-icons/fa";

const AddSubAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    permissions: "",
    assignedProperties: "",
    profilePhoto: null,
    idProofImage: null,
    aadhaarNumber: "",
  });

  const [permissionsList, setPermissionsList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreementDuration, setAgreementDuration] = useState("");
  const [agreementEndDate, setAgreementEndDate] = useState("");

  // Fetch permissions and properties on component mount
  useEffect(() => {
    fetchPermissions();
    fetchProperties();
  }, []);

  // Debug propertiesList updates
  useEffect(() => {
    console.log("Updated propertiesList:", propertiesList);
  }, [propertiesList]);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("https://api.gharzoreality.com/api/permissions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Permissions API response:", data);
        if (data.success) {
          setPermissionsList(data.permissions || []);
        } else {
          throw new Error(data.message || "Failed to fetch permissions");
        }
      } else {
        throw new Error("Failed to fetch permissions");
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

      if (response.ok) {
        const data = await response.json();
        console.log("Properties API response:", data);
        if (data.success) {
          console.log("Raw properties:", data.properties);
          setPropertiesList(data.properties || []);
        } else {
          throw new Error(data.message || "Failed to fetch properties");
        }
      } else {
        throw new Error("Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error(error.message || "Error fetching properties", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "aadhaarNumber") {
      processedValue = value.replace(/\D/g, '');
    }
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [fieldName]: file });
    }
  };

  const handlePermissionToggle = (permissionId) => {
    console.log(
      "Toggling permission:",
      permissionId,
      "Current state:",
      selectedPermissions
    );
    setSelectedPermissions((prev) =>
      prev.includes(String(permissionId))
        ? prev.filter((id) => id !== String(permissionId))
        : [...prev, String(permissionId)]
    );
  };

  const handlePermissionClick = (permission) => {
    console.log("Permission clicked:", permission);
    setSelectedPermission(permission);
    setShowPermissionModal(true);
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

  // Updated to set default agreementDuration to 2 years
  const handlePropertyToggle = (propertyId) => {
    console.log("Toggling property:", propertyId);
    console.log(propertiesList);
    const propertyExists = propertiesList.some((p) => p._id === propertyId);
    console.log("Property exists:", propertyExists);
    if (!propertyExists) {
      toast.error("Invalid property selected", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Check if property is already selected
    const existingIndex = selectedProperties.findIndex(
      (p) => p.propertyId === propertyId
    );
    if (existingIndex > -1) {
      // Deselect: Remove from selectedProperties
      const newSelected = selectedProperties.filter(
        (_, index) => index !== existingIndex
      );
      console.log("Deselecting property. New selectedProperties:", newSelected);
      setSelectedProperties(newSelected);
      // Reset temporary inputs
      setAgreementDuration("");
      setAgreementEndDate("");
    } else {
      // Select: Add with default duration of 2 years
      const newProperty = {
        propertyId,
        agreementDuration: { years: 2 }, // Default to 2 years
        agreementEndDate: "", // Initially empty
      };
      setSelectedProperties([...selectedProperties, newProperty]);
      // Reset temporary inputs
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
    // Pre-fill agreement fields if the property is already selected, else use defaults
    const selected = selectedProperties.find(
      (p) => p.propertyId === property._id
    );
    if (selected) {
      setAgreementDuration(selected.agreementDuration.years.toString());
      setAgreementEndDate(
        selected.agreementEndDate ? selected.agreementEndDate.split("T")[0] : ""
      );
    } else {
      // Default values for new selection
      setAgreementDuration("2");
      setAgreementEndDate("");
    }
  };

  // Updated to update or add in the exact format
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

    // Validate end date is in the future
    const endDate = new Date(agreementEndDate);
    const today = new Date();
    if (endDate <= today) {
      toast.error("Agreement end date must be in the future", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Ensure propertyId is valid
    const propertyExists = propertiesList.some((p) => p._id === propertyId);
    if (!propertyExists) {
      toast.error("Invalid property ID", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Check if property already exists in selected
    const existingIndex = selectedProperties.findIndex(
      (p) => p.propertyId === propertyId
    );
    const newPropertyData = {
      propertyId,
      agreementDuration: { years: durationYears },
      agreementEndDate: new Date(agreementEndDate).toISOString(),
    };

    let newSelected;
    if (existingIndex > -1) {
      // Update existing
      newSelected = selectedProperties.map((p, index) =>
        index === existingIndex ? newPropertyData : p
      );
    } else {
      // Add new
      newSelected = [...selectedProperties, newPropertyData];
    }

    setSelectedProperties(newSelected);
    setShowPropertyModal(false);
    setAgreementDuration("");
    setAgreementEndDate("");

    console.log("Updated selectedProperties in exact format:", newSelected);
    toast.success("Property details updated successfully!", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Debug log
    console.log(
      "selectedProperties before submission (exact format):",
      selectedProperties
    );

    // Basic validation
    const requiredFields = [
      "name",
      "email",
      "mobile",
      "password",
      "aadhaarNumber",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field!`, {
          position: "top-center",
          autoClose: 2000,
        });
        setIsLoading(false);
        return;
      }
    }

    // Validate assignedProperties - ensure all have proper format
    if (selectedProperties.length > 0) {
      for (const property of selectedProperties) {
        if (
          !property.propertyId ||
          !property.agreementDuration?.years ||
          property.agreementDuration.years <= 0 ||
          !property.agreementEndDate ||
          new Date(property.agreementEndDate) <= new Date()
        ) {
          toast.error(
            "Please provide valid details for all assigned properties (positive duration and future end date)",
            {
              position: "top-center",
              autoClose: 2000,
            }
          );
          setIsLoading(false);
          return;
        }
      }
    }

    // Prepare form data for API
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("mobile", formData.mobile);
    submitData.append("password", formData.password);
    submitData.append("aadhaarNumber", formData.aadhaarNumber);
    submitData.append("permissions", JSON.stringify(selectedPermissions));
    submitData.append("assignedProperties", JSON.stringify(selectedProperties));

    if (formData.profilePhoto) {
      submitData.append("profilePhoto", formData.profilePhoto);
    }
    if (formData.idProofImage) {
      submitData.append("idProofImage", formData.idProofImage);
    }

    // Debug FormData content
    for (let [key, value] of submitData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch(
        "https://api.gharzoreality.com/api/sub-owner/auth/create",
        {
          method: "POST",
          body: submitData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        toast.success(
          <div className="flex items-center gap-3">
            <FaCheck className="w-6 h-6 text-green-400 animate-bounce" />
            <span className="font-semibold text-lg">
              Sub-Admin Added Successfully!
            </span>
          </div>,
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          }
        );

        // Reset form
        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          permissions: "",
          assignedProperties: "",
          profilePhoto: null,
          idProofImage: null,
          aadhaarNumber: "",
        });
        setSelectedPermissions([]);
        setSelectedProperties([]);
        setAgreementDuration("");
        setAgreementEndDate("");

        // Clear file inputs
        document.getElementById("profilePhoto").value = "";
        document.getElementById("idProofImage").value = "";
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add sub-admin");
      }
    } catch (error) {
      console.error("Error adding sub-admin:", error);
      toast.error(error.message || "Error adding sub-admin", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      permissions: "",
      assignedProperties: "",
      profilePhoto: null,
      idProofImage: null,
      aadhaarNumber: "",
    });
    setSelectedPermissions([]);
    setSelectedProperties([]);
    setAgreementDuration("");
    setAgreementEndDate("");
    document.getElementById("profilePhoto").value = "";
    document.getElementById("idProofImage").value = "";
  };

  // Validate agreement inputs for enabling/disabling the Update button
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

  // Format date for display
  const formatDate = (isoDate) => {
    if (!isoDate) return "Not set";
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Updated to display Duration: 0 year(s) and End Date: Not set for new properties
  const getSelectedPropertiesDisplay = () => {
    return selectedProperties.map((prop, index) => {
      const property = propertiesList.find((p) => p._id === prop.propertyId);
      return (
        <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-3 border border-white/20">
          <p className="text-sm text-gray-200 font-medium">
            Property: {property?.name || "Unnamed Property"} (ID:{" "}
            {prop.propertyId})
          </p>
          <p className="text-sm text-gray-300">
            Duration: {prop.agreementDuration.years || 0} year(s)
          </p>
          <p className="text-sm text-gray-300">
            End Date: {formatDate(prop.agreementEndDate)}
          </p>
          {/* Option to edit or remove */}
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                const property = propertiesList.find(
                  (p) => p._id === prop.propertyId
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
              className="text-xs bg-indigo-600/60 text-white px-3 py-2 rounded-lg hover:bg-indigo-600/80 transition"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedProperties(
                  selectedProperties.filter((_, i) => i !== index)
                );
                toast.success("Property removed", {
                  position: "top-center",
                  autoClose: 2000,
                });
              }}
              className="text-xs bg-red-600/60 text-white px-3 py-2 rounded-lg hover:bg-red-600/80 transition"
            >
              Remove
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Glassmorphic Form Card */}
      {/* <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10"> */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
          <FaUser className="inline mr-3 text-indigo-300" />
          Add New Sub-Owner
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-4 top-4 text-gray-300 text-lg" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-gray-300 text-lg" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Mobile */}
          <div className="relative">
            <FaPhone className="absolute left-4 top-4 text-gray-300 text-lg" />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-gray-300 text-lg" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Permissions */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-gray-200 mb-3 flex items-center">
              <FaLock className="mr-3 text-indigo-300" /> Permissions
            </label>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-4 py-2 rounded-full text-sm bg-green-600/40 text-green-200 font-medium hover:bg-green-600/60 border border-green-500/30 transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllPermissions}
                  className="px-4 py-2 rounded-full text-sm bg-red-600/40 text-red-200 font-medium hover:bg-red-600/60 border border-red-500/30 transition"
                >
                  Deselect All
                </button>
                {permissionsList.slice(0, 6).map((permission) => (
                  <button
                    key={permission.id}
                    type="button"
                    onClick={() => handlePermissionToggle(permission.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedPermissions.includes(String(permission.id))
                        ? "bg-indigo-600/60 text-white border border-indigo-400/50"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20"
                    }`}
                  >
                    {permission.name}
                  </button>
                ))}
                {permissionsList.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowPermissionModal(true)}
                    className="px-4 py-2 rounded-full text-sm bg-indigo-600/40 text-indigo-200 font-medium hover:bg-indigo-600/60 border border-indigo-400/30 transition"
                  >
                    +{permissionsList.length - 6} More
                  </button>
                )}
              </div>
              {selectedPermissions.length > 0 && (
                <p className="text-sm text-indigo-300">
                  Selected: {selectedPermissions.length} permissions
                </p>
              )}
            </div>
          </div>

          {/* Assigned Properties */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-gray-200 mb-3 flex items-center">
              <FaHome className="mr-3 text-indigo-300" /> Assigned Properties
            </label>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
              <div className="mb-5">
                <h4 className="text-base font-semibold text-gray-200 mb-3">
                  All Properties (Toggle to Assign):
                </h4>
                <div className="flex flex-wrap gap-3">
                  {propertiesList.length === 0 ? (
                    <span className="text-gray-400 text-sm">
                      Loading properties...
                    </span>
                  ) : (
                    propertiesList.map((property) => (
                      <button
                        key={property._id}
                        type="button"
                        onClick={() => handlePropertyToggle(property._id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedProperties.some(
                            (p) => p.propertyId === property._id
                          )
                            ? "bg-orange-600/60 text-white border border-orange-400/50"
                            : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20"
                        }`}
                      >
                        {property.name ||
                          `Property ID: ${property._id.substring(0, 8)}...`}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Properties Display */}
              {selectedProperties.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold text-gray-200 mb-3">
                    Assigned Properties:
                  </h4>
                  {getSelectedPropertiesDisplay()}
                </div>
              )}

              {/* Temporary inputs for editing property details */}
              {selectedProperty && (
                <div className="mt-6 p-5 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-sm text-indigo-300 mb-4">
                    Editing Details for: {selectedProperty.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-4 text-gray-300" />
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
                        className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 w-full text-white"
                        min="1"
                      />
                    </div>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-4 text-gray-300" />
                      <input
                        type="date"
                        value={agreementEndDate}
                        onChange={(e) => setAgreementEndDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 w-full text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePropertySelect(selectedProperty._id)}
                    disabled={isPropertyUpdateDisabled()}
                    className={`mt-4 w-full py-3 rounded-xl font-medium transition ${
                      isPropertyUpdateDisabled()
                        ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600/70 text-white hover:bg-indigo-600"
                    }`}
                  >
                    Save Property Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Photo */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-gray-200 mb-3 flex items-center">
              <FaUpload className="mr-3 text-indigo-300" /> Profile Photo
            </label>
            <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-indigo-400/60 transition">
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "profilePhoto")}
                className="hidden"
              />
              <label
                htmlFor="profilePhoto"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="w-12 h-12 text-gray-300 mb-4" />
                <span className="text-gray-300">
                  {formData.profilePhoto
                    ? formData.profilePhoto.name
                    : "Click to upload profile photo"}
                </span>
              </label>
            </div>
          </div>

          {/* ID Proof Image */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-gray-200 mb-3 flex items-center">
              <FaIdCard className="mr-3 text-indigo-300" /> ID Proof Image
            </label>
            <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-indigo-400/60 transition">
              <input
                type="file"
                id="idProofImage"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "idProofImage")}
                className="hidden"
              />
              <label
                htmlFor="idProofImage"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="w-12 h-12 text-gray-300 mb-4" />
                <span className="text-gray-300">
                  {formData.idProofImage
                    ? formData.idProofImage.name
                    : "Click to upload ID proof"}
                </span>
              </label>
            </div>
          </div>

          {/* Aadhaar Number */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-gray-200 mb-3 flex items-center">
              <FaIdCard className="mr-3 text-indigo-300" /> Aadhaar Number
            </label>
            <div className="relative">
              <FaIdCard className="absolute left-4 top-4 text-gray-300 text-lg" />
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="Enter 12-digit Aadhaar Number"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                maxLength={12}
                className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 w-full text-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 transform hover:scale-105 font-semibold ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaCheck className="w-6 h-6" />
                  Add Sub-Owner
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-3 bg-red-600/70 text-white py-4 rounded-xl shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105 font-semibold"
            >
              <FaTimes className="w-6 h-6" />
              Reset Form
            </button>
          </div>
        </form>
      {/* </div> */}

      <ToastContainer theme="dark" />

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaLock className="mr-3 text-indigo-300" />
                All Permissions
              </h3>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-gray-300 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {permissionsList.map((permission) => (
                <div
                  key={permission.id}
                  onClick={() => handlePermissionToggle(permission.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPermissions.includes(String(permission.id))
                      ? "bg-indigo-600/60 border-indigo-400/60 text-white"
                      : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <p className="font-medium text-base">
                    {permission.name}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPermissionModal(false)}
              className="mt-8 w-full py-3 bg-gray-600/60 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaHome className="mr-3 text-indigo-300" />
                Property Details
              </h3>
              <button
                onClick={() => {
                  setShowPropertyModal(false);
                  setSelectedProperty(null);
                  setAgreementDuration("");
                  setAgreementEndDate("");
                }}
                className="text-gray-300 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            {selectedProperty ? (
              <div className="space-y-6">
                <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <img
                      src={selectedProperty.images[0]}
                      alt={selectedProperty.name}
                      className="w-full h-56 object-cover rounded-xl mb-4"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-700/50 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-gray-400">No Image Available</span>
                    </div>
                  )}
                  <p className="text-xl font-bold text-white">
                    {selectedProperty.name || "Unnamed Property"}
                  </p>
                  <p className="text-gray-300 flex items-center mt-2">
                    <FaMapMarkerAlt className="mr-2 text-indigo-300" />
                    {selectedProperty.location || "No location"}
                  </p>
                  <p className="text-gray-300 mt-1">
                    Type: {selectedProperty.type || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-4 text-gray-300" />
                    <input
                      type="number"
                      placeholder="Duration (Years)"
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
                      className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 w-full text-white"
                    />
                  </div>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-4 text-gray-300" />
                    <input
                      type="date"
                      value={agreementEndDate}
                      onChange={(e) => setAgreementEndDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                      className="pl-12 p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 w-full text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handlePropertySelect(selectedProperty._id)}
                  disabled={isPropertyUpdateDisabled()}
                  className={`w-full py-4 rounded-xl font-semibold transition ${
                    isPropertyUpdateDisabled()
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {selectedProperties.some((p) => p.propertyId === selectedProperty._id)
                    ? "Update Details"
                    : "Assign Property"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {propertiesList.map((property) => (
                  <div
                    key={property._id}
                    onClick={() => handlePropertyClick(property)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedProperties.some((p) => p.propertyId === property._id)
                        ? "bg-indigo-600/60 border-indigo-400/60 text-white"
                        : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    <p className="font-medium">{property.name || "Unnamed"}</p>
                    <p className="text-sm opacity-80">{property.location || "No location"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubAdmin;