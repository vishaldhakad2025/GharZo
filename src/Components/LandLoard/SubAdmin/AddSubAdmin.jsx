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
  const [selectedProperties, setSelectedProperties] = useState([]); // Array of objects in the exact format: [{ propertyId: string, agreementDuration: { years: number }, agreementEndDate: string (ISO) }]
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreementDuration, setAgreementDuration] = useState(""); // Store as string for input
  const [agreementEndDate, setAgreementEndDate] = useState("");

  // Aadhaar verification states
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

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
    const today = new Date("2025-09-18"); // Hardcoded as per context
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

  // Generate Aadhaar OTP
  const generateOtp = async () => {
    const aadhaar = formData.aadhaarNumber;
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      toast.error("Valid 12-digit Aadhaar number is required");
      return;
    }
    try {
      const response = await fetch("https://api.gharzoreality.com/api/kyc/aadhaar/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber: aadhaar }),
      });
      const data = await response.json();
      if (data.success) {
        setTxnId(data.txnId);
        setShowOtpInput(true);
        toast.success(data.message || "OTP generated successfully");
      } else {
        toast.error(data.message || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("OTP generation error:", error);
      toast.error(error.message || "Error generating OTP");
    }
  };

  // Verify Aadhaar OTP
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Valid 6-digit OTP is required");
      return;
    }
    if (!txnId) return;
    try {
      const response = await fetch("https://api.gharzoreality.com/api/kyc/aadhaar/submit-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, otp }),
      });
      const data = await response.json();
      if (data.success) {
        const responseData = data.data;
        // Check name match
        if (formData.name && formData.name.toUpperCase() !== (responseData.full_name || '').toUpperCase()) {
          toast.warning(`Name mismatch: Entered (${formData.name}) vs Aadhaar (${responseData.full_name}). Using Aadhaar name.`);
        }
        setFormData((prev) => ({
          ...prev,
          name: responseData.full_name || prev.name,
          aadhaarNumber: responseData.aadhaar_number || prev.aadhaarNumber,
        }));
        setAadhaarVerified(true);
        setShowOtpInput(false);
        setOtp("");
        setTxnId(null);
        toast.success(data.message || "Aadhaar verified successfully");
      } else {
        toast.error(data.message || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Error verifying OTP");
    }
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

    // Aadhaar verification check
    if (!aadhaarVerified) {
      toast.error("Please verify Aadhaar", {
        position: "top-center",
        autoClose: 2000,
      });
      setIsLoading(false);
      return;
    }

    // Validate assignedProperties - ensure all have proper format
    if (selectedProperties.length > 0) {
      for (const property of selectedProperties) {
        if (
          !property.propertyId ||
          !property.agreementDuration?.years ||
          property.agreementDuration.years <= 0 ||
          !property.agreementEndDate ||
          new Date(property.agreementEndDate) <= new Date("2025-09-18")
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
            <FaCheck className="w-6 h-6 text-green-500 animate-bounce" />
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
            theme: "light",
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
        setAadhaarVerified(false);
        setOtp("");
        setTxnId(null);
        setShowOtpInput(false);

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
    setAadhaarVerified(false);
    setOtp("");
    setTxnId(null);
    setShowOtpInput(false);
    document.getElementById("profilePhoto").value = "";
    document.getElementById("idProofImage").value = "";
  };

  // Validate agreement inputs for enabling/disabling the Update button
  const isPropertyUpdateDisabled = () => {
    const durationYears = parseInt(agreementDuration);
    const endDate = new Date(agreementEndDate);
    const today = new Date("2025-09-18"); // Context date
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
        <div key={index} className="bg-indigo-50 p-3 rounded-lg mb-2">
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
          {/* Option to edit or remove */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                const property = propertiesList.find(
                  (p) => p._id === prop.propertyId
                );
                if (property) {
                  setSelectedProperty(property);
                  // Pre-fill with existing values or defaults
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
                toast.success("Property removed", {
                  position: "top-center",
                  autoClose: 2000,
                });
              }}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-100 via-white to-indigo-50 shadow-xl rounded-2xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 tracking-wide">
        <FaUser className="inline mr-2" /> Add New Sub-Owner
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Name */}
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
        </div>

        {/* Mobile */}
        <div className="relative">
          <FaPhone className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
        </div>

        {/* Permissions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaLock className="mr-2" /> Permissions
          </label>
          <div className="border rounded-lg p-3 bg-gray-50">
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
                  onClick={() => handlePermissionToggle(permission.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedPermissions.includes(String(permission.id))
                      ? "bg-orange-100 text-orange-800 border border-orange-300"
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
              <p className="text-sm text-orange-600">
                Selected: {selectedPermissions.length} permissions
              </p>
            )}
          </div>
        </div>

        {/* Assigned Properties */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaHome className="mr-2" /> Assigned Properties (All from API)
          </label>
          <div className="border rounded-lg p-3 bg-gray-50">
            {/* Show all properties from API */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                All Properties (Toggle to Assign):
              </h4>
              <div className="flex flex-wrap gap-2">
                {propertiesList.length === 0 ? (
                  <span className="text-gray-500 text-sm">
                    Loading properties... (Fetched from
                    https://api.gharzoreality.com/api/landlord/properties)
                  </span>
                ) : (
                  propertiesList.map((property) => (
                    <button
                      key={property._id}
                      type="button"
                      onClick={() => handlePropertyToggle(property._id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedProperties.some(
                          (p) => p.propertyId === property._id
                        )
                          ? "bg-orange-100 text-orange-800 border border-orange-300"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {property.name ||
                        `Property ID: ${property._id.substring(0, 8)}...`}
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

            {/* Selected Properties Display in Exact Format */}
            {selectedProperties.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Assigned Properties (Exact Format):
                </h4>
                {getSelectedPropertiesDisplay()}
                <p className="text-xs text-gray-500 mt-2">
                  JSON Format: {JSON.stringify(selectedProperties)}
                </p>
              </div>
            )}

            {/* Temporary inputs for editing/adding details */}
            {selectedProperty && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  Editing/Adding Details for: {selectedProperty.name}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
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
                      min="2025-09-19" // Next day after current date (Sep 18, 2025)
                      className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePropertySelect(selectedProperty._id)}
                  disabled={isPropertyUpdateDisabled()}
                  className={`mt-3 w-full py-2 rounded-lg font-medium transition ${
                    isPropertyUpdateDisabled()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                  }`}
                >
                  Save/Update Property Details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Photo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaUpload className="mr-2" /> Profile Photo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition">
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "profilePhoto")}
              className="hidden"
            />
            <label
              htmlFor="profilePhoto"
              className="cursor-pointer flex flex-col items-center"
            >
              <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {formData.profilePhoto
                  ? formData.profilePhoto.name
                  : "Click to upload"}
              </span>
            </label>
          </div>
        </div>

        {/* ID Proof Image */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaIdCard className="mr-2" /> ID Proof Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition">
            <input
              type="file"
              id="idProofImage"
              name="idProofImage"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "idProofImage")}
              className="hidden"
            />
            <label
              htmlFor="idProofImage"
              className="cursor-pointer flex flex-col items-center"
            >
              <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {formData.idProofImage
                  ? formData.idProofImage.name
                  : "Click to upload"}
              </span>
            </label>
          </div>
        </div>

        {/* Aadhaar Verification */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaIdCard className="mr-2" /> Aadhaar Verification
          </label>
          <div className="space-y-3">
            {!aadhaarVerified ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="aadhaarNumber"
                      placeholder="Enter 12-digit Aadhaar Number"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      maxLength={12}
                      className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateOtp}
                    disabled={!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center"
                  >
                    Generate OTP
                  </button>
                </div>
                {showOtpInput && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otp.length !== 6}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center"
                    >
                      Verify OTP
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                <span className="text-green-600 font-medium flex items-center">
                  <FaCheck className="mr-2 w-4 h-4" />
                  Aadhaar Verified Successfully
                </span>
                <span className="text-sm text-gray-500">({formData.aadhaarNumber})</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={isLoading || !aadhaarVerified}
            className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white py-3 rounded-lg shadow-lg hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300 transform hover:scale-105 ${
              isLoading || !aadhaarVerified ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <FaCheck className="w-5 h-5" />
                Add Sub-Owner
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105"
          >
            <FaTimes className="inline mr-2" /> Reset Form
          </button>
        </div>
      </form>

      {/* Toast container for notifications */}
      <ToastContainer />

    {/* Permission Modal */}
{showPermissionModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
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
                onClick={() => handlePermissionToggle(permission.id)} // Directly toggle permission
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
    </div>
  </div>
)}
      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaHome className="mr-2 text-indigo-500" />
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
                  <div className="bg-indigo-50 p-4 rounded-lg">
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
                      <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                      {selectedProperty.location || "No location provided"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaHome className="mr-2 text-indigo-500" />
                      Type: {selectedProperty.type || "No type specified"}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">ID:</span>{" "}
                      <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {selectedProperty._id}
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
                        className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
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
                        min="2025-09-19"
                        className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handlePropertySelect(selectedProperty._id)}
                    disabled={isPropertyUpdateDisabled()}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      isPropertyUpdateDisabled()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    }`}
                  >
                    {selectedProperties.some(
                      (p) => p.propertyId === selectedProperty._id
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
                        key={property._id}
                        onClick={() => handlePropertyClick(property)}
                        className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition ${
                          selectedProperties.some(
                            (p) => p.propertyId === property._id
                          )
                            ? "border-orange-300 bg-orange-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {property.name || "Unnamed Property"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {property.location || "No location provided"}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {property._id.substring(0, 8)}...
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubAdmin;