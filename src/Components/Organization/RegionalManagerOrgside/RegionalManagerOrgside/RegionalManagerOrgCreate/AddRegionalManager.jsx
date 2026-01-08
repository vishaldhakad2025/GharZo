import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaTimes,
  FaCheck,
  FaHome,
  FaSearch,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const AddRegionalManager = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    region: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [organizationId, setOrganizationId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [permissionsList, setPermissionsList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]); // Array of property IDs
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // For filtering properties

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

  const countryCodes = [
    "+60", // Malaysia
    "+61", // Australia
    "+62", // Indonesia
    "+63", // Philippines
    "+64", // New Zealand
    "+65", // Singapore
    "+66", // Thailand
    "+7",  // Russia
    "+91", // India
  ];

  // Hardcoded permissions based on schema
  useEffect(() => {
    const hardcodedPermissions = [
      { id: "canCreateProperty", name: "canCreateProperty", description: "Create new properties", createdAt: new Date().toISOString() },
      { id: "canUpdateProperty", name: "canUpdateProperty", description: "Update existing properties", createdAt: new Date().toISOString() },
      { id: "canDeleteProperty", name: "canDeleteProperty", description: "Delete properties", createdAt: new Date().toISOString() },
      { id: "canAssignProperty", name: "canAssignProperty", description: "Assign properties", createdAt: new Date().toISOString() },
      { id: "canCreatePropertyManager", name: "canCreatePropertyManager", description: "Create property managers", createdAt: new Date().toISOString() },
      { id: "canUpdatePropertyManager", name: "canUpdatePropertyManager", description: "Update property managers", createdAt: new Date().toISOString() },
      { id: "canDeletePropertyManager", name: "canDeletePropertyManager", description: "Delete property managers", createdAt: new Date().toISOString() },
      { id: "canAssignPropertyToManager", name: "canAssignPropertyToManager", description: "Assign properties to managers", createdAt: new Date().toISOString() },
      { id: "canViewWorkers", name: "canViewWorkers", description: "View workers", createdAt: new Date().toISOString() },
      { id: "canApproveWorker", name: "canApproveWorker", description: "Approve workers", createdAt: new Date().toISOString() },
      { id: "canManageTenants", name: "canManageTenants", description: "Manage tenants", createdAt: new Date().toISOString() },
      { id: "canViewTenantDetails", name: "canViewTenantDetails", description: "View tenant details", createdAt: new Date().toISOString() },
      { id: "canViewReports", name: "canViewReports", description: "View reports", createdAt: new Date().toISOString() },
      { id: "canViewFinancials", name: "canViewFinancials", description: "View financials", createdAt: new Date().toISOString() },
      { id: "canUpdateCollections", name: "canUpdateCollections", description: "Update collections", createdAt: new Date().toISOString() },
      { id: "canManageMaintenance", name: "canManageMaintenance", description: "Manage maintenance", createdAt: new Date().toISOString() },
      { id: "canApproveMaintenanceRequests", name: "canApproveMaintenanceRequests", description: "Approve maintenance requests", createdAt: new Date().toISOString() },
      { id: "canSendNotifications", name: "canSendNotifications", description: "Send notifications", createdAt: new Date().toISOString() },
      { id: "canContactTenants", name: "canContactTenants", description: "Contact tenants", createdAt: new Date().toISOString() },
      { id: "canViewOrgProfile", name: "canViewOrgProfile", description: "View organization profile", createdAt: new Date().toISOString() },
      { id: "canUpdateRegionalSettings", name: "canUpdateRegionalSettings", description: "Update regional settings", createdAt: new Date().toISOString() },
    ];
    setPermissionsList(hardcodedPermissions);
  }, []);

  // Fetch organization profile on component mount
  useEffect(() => {
    fetchOrganizationProfile();
  }, []);

  const fetchOrganizationProfile = async () => {
    try {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("https://api.gharzoreality.com/api/organization/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.id) {
          setOrganizationId(data.id);
        } else {
          throw new Error("Organization ID not found in profile");
        }
      } else {
        throw new Error("Failed to fetch organization profile");
      }
    } catch (error) {
      console.error("Error fetching organization profile:", error);
      toast.error(error.message || "Error fetching organization profile", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
        break;
      case "mobile":
        if (!value) error = "Mobile is required";
        else if (!/^\d{10}$/.test(value)) error = "Mobile must be 10 digits";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters";
        break;
      case "region":
        if (!value) error = "Region is required";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleCountryCodeChange = (e) => {
    setSelectedCountryCode(e.target.value);
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("orgToken");
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
        position: "bottom-right",
        autoClose: 2000,
      });
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
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handlePermissionClick = (permission) => {
    console.log("Permission clicked:", permission);
    setSelectedPermission(permission);
    setShowPermissionModal(true);
  };

  const handlePropertyToggle = (propertyId) => {
    console.log("Toggling property:", propertyId);
    console.log(propertiesList);
    const propertyExists = propertiesList.some((p) => p._id === propertyId);
    console.log("Property exists:", propertyExists);
    if (!propertyExists) {
      toast.error("Invalid property selected", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    // Check if property is already selected
    const existingIndex = selectedProperties.findIndex(
      (p) => p === propertyId
    );
    if (existingIndex > -1) {
      // Deselect: Remove from selectedProperties
      const newSelected = selectedProperties.filter(
        (_, index) => index !== existingIndex
      );
      console.log("Deselecting property. New selectedProperties:", newSelected);
      setSelectedProperties(newSelected);
      toast.info("Property removed", {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      // Select: Add property ID
      setSelectedProperties([...selectedProperties, propertyId]);
      toast.success("Property assigned successfully!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields before submit
    const requiredFields = ["name", "email", "mobile", "password", "region"];
    let hasErrors = false;
    requiredFields.forEach((field) => {
      validateField(field, formData[field]);
      if (errors[field] || !formData[field]) hasErrors = true;
    });

    if (hasErrors) {
      toast.error("Please fix the errors in the form!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setIsLoading(false);
      return;
    }

    if (!organizationId) {
      toast.error("Organization ID not available. Please refresh the page.", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setIsLoading(false);
      return;
    }

    // Debug log
    console.log(
      "selectedProperties before submission:",
      selectedProperties
    );

    // Build permissions object based on schema
    const permissionsObj = {
      canCreateProperty: false,
      canUpdateProperty: false,
      canDeleteProperty: false,
      canAssignProperty: false,
      canCreatePropertyManager: false,
      canUpdatePropertyManager: false,
      canDeletePropertyManager: false,
      canAssignPropertyToManager: false,
      canViewWorkers: false,
      canApproveWorker: false,
      canManageTenants: false,
      canViewTenantDetails: false,
      canViewReports: false,
      canViewFinancials: false,
      canUpdateCollections: false,
      canManageMaintenance: false,
      canApproveMaintenanceRequests: false,
      canSendNotifications: false,
      canContactTenants: false,
      canViewOrgProfile: false,
      canUpdateRegionalSettings: false,
    };

    // Set selected permissions to true
    permissionsList
      .filter((p) => selectedPermissions.includes(p.id))
      .forEach((p) => {
        if (p.name in permissionsObj) {
          permissionsObj[p.name] = true;
        }
      });

    // Prepare submit data
    const submitData = {
      organizationId: organizationId,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      region: formData.region,
      status: "active",
      permissions: permissionsObj,
      properties: selectedProperties, // Array of property IDs
    };

    try {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("https://api.gharzoreality.com/api/regional-managers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();

        toast.success(
          <div className="flex items-center gap-3">
            <FaCheck className="w-6 h-6 text-green-500 animate-bounce" />
            <span className="font-semibold text-lg">
              Regional Manager Added Successfully!
            </span>
          </div>,
          {
            position: "bottom-right",
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
          region: "",
        });
        setSelectedPermissions([]);
        setSelectedProperties([]);
        setErrors({});
        setSelectedCountryCode("+91");
        setShowPassword(false);

      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add regional manager");
      }
    } catch (error) {
      console.error("Error adding regional manager:", error);
      toast.error(error.message || "Error adding regional manager", {
        position: "bottom-right",
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
      region: "",
    });
    setSelectedPermissions([]);
    setSelectedProperties([]);
    setSearchTerm("");
    setErrors({});
    setSelectedCountryCode("+91");
    setShowPassword(false);
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

  // Filter properties based on search term
  const filteredProperties = propertiesList.filter(
    (property) =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display selected properties
  const getSelectedPropertiesDisplay = () => {
    return selectedProperties.map((propId, index) => {
      const property = propertiesList.find((p) => p._id === propId);
      return (
        <div key={index} className="bg-indigo-50 p-3 rounded-lg mb-2 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700 font-medium">
              {property?.name || "Unnamed Property"}
            </p>
            {/* <p className="text-xs text-gray-500">
              ID: {propId}
            </p> */}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedProperties(
                selectedProperties.filter((_, i) => i !== index)
              );
              toast.success("Property removed", {
                position: "bottom-right",
                autoClose: 2000,
              });
            }}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      );
    });
  };

  const handleSelectAllPermissions = () => {
    const allPermissionIds = permissionsList.map(p => p.id);
    setSelectedPermissions(selectedPermissions.length === permissionsList.length ? [] : allPermissionIds);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-100 via-white to-indigo-50 shadow-xl rounded-2xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 tracking-wide">
        <FaUser className="inline mr-2 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} /> Add New Regional Manager
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Name */}
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-gray-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
          {errors.name && (
            <div className="mt-1 flex items-center text-red-500 text-sm">
              <FaTimes className="mr-1" />
              {errors.name}
            </div>
          )}
          {!errors.name && formData.name && (
            <div className="mt-1 flex items-center text-green-500 text-sm">
              <FaCheck className="mr-1" />
            </div>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
          {errors.email && (
            <div className="mt-1 flex items-center text-red-500 text-sm">
              <FaTimes className="mr-1" />
              {errors.email}
            </div>
          )}
          {!errors.email && formData.email && (
            <div className="mt-1 flex items-center text-green-500 text-sm">
              <FaCheck className="mr-1" />
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="relative">
          <div className="flex mt-0 ml-0">
            <select
              value={selectedCountryCode}
              onChange={handleCountryCodeChange}
              className="border border-gray-300 rounded-l-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-sm"
            >
              {countryCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="border border-l-0 rounded-r-lg p-3 focus:ring-2 focus:ring-indigo-400 shadow-sm flex-1"
              required
            />
          </div>
          {errors.mobile && (
            <div className="mt-1 flex items-center text-red-500 text-sm">
              <FaTimes className="mr-1" />
              {errors.mobile}
            </div>
          )}
          {!errors.mobile && formData.mobile && (
            <div className="mt-1 flex items-center text-green-500 text-sm">
              <FaCheck className="mr-1" />
            </div>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          />
          <div 
            className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
          {errors.password && (
            <div className="mt-1 flex items-center text-red-500 text-sm">
              <FaTimes className="mr-1" />
              {errors.password}
            </div>
          )}
          {!errors.password && formData.password && (
            <div className="mt-1 flex items-center text-green-500 text-sm">
              <FaCheck className="mr-1" />
            </div>
          )}
        </div>

        {/* Region */}
        <div className="relative md:col-span-2">
          <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 shadow-sm w-full"
            required
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.region && (
            <div className="mt-1 flex items-center text-red-500 text-sm">
              <FaTimes className="mr-1" />
              {errors.region}
            </div>
          )}
          {!errors.region && formData.region && (
            <div className="mt-1 flex items-center text-green-500 text-sm">
              <FaCheck className="mr-1" />
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaLock className="mr-2 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} /> Permissions
          </label>
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {permissionsList.slice(0, 6).map((permission) => (
                <button
                  key={permission.id}
                  type="button"
                  onClick={() => handlePermissionToggle(permission.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedPermissions.includes(permission.id)
                      ? "bg-orange-100 text-orange-800 border border-orange-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {permission.name.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
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
              <p className="text-sm text-orange-600 text-center">
                Selected: {selectedPermissions.length} permissions
              </p>
            )}
          </div>
        </div>

        {/* Assigned Properties */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaHome className="mr-2 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} /> Assigned Properties
          </label>
          <div className="border rounded-lg p-3 bg-gray-50">
            {/* Search Input for Properties */}
           

            {/* Show filtered properties from API */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">
                All Properties (Toggle to Assign):
              </h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {filteredProperties.length === 0 ? (
                  <span className="text-gray-500 text-sm col-span-full text-center">
                    {searchTerm ? "No properties match the search." : "No properties available."}
                  </span>
                ) : (
                  filteredProperties.map((property) => (
                    <button
                      key={property._id}
                      type="button"
                      onClick={() => handlePropertyToggle(property._id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        selectedProperties.includes(property._id)
                          ? "bg-orange-100 text-orange-800 border border-orange-300"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                      title={`ID: ${property._id}`}
                    >
                      <span>{property.name ? property.name.substring(0, 15) + (property.name.length > 15 ? '...' : '') : 'Unnamed'}</span>
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

            {/* Selected Properties Display */}
            {selectedProperties.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">
                  Assigned Properties:
                </h4>
                <div className="space-y-2">
                  {getSelectedPropertiesDisplay()}
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 justify-center">
          <button
            type="submit"
            disabled={isLoading || !organizationId}
            className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#00C2FF] to-[#00FFAA] text-white py-3 rounded-lg shadow-lg hover:from-[#00AEEA] hover:to-[#00E099] transition duration-300 transform hover:scale-105 max-w-md ${
              isLoading || !organizationId ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <FaCheck className="w-5 h-5 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                Add Regional Manager
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105 max-w-md"
          >
            <FaTimes className="inline mr-2 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} /> Reset Form
          </button>
        </div>
      </form>

      {/* Toast container for notifications */}
      <ToastContainer position="bottom-right" />

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-h-[100vh] overflow-hidden scrollbar-hide">
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaLock className="mr-2 text-indigo-500 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  Permission Details
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllPermissions}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    {selectedPermissions.length === permissionsList.length ? "Unselect All" : "Select All"}
                  </button>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-2 flex-1 overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 h-full overflow-hidden">
                  {permissionsList.map((permission) => (
                    <div
                      key={permission.id}
                      onClick={() => handlePermissionToggle(permission.id)} // Directly toggle permission
                      className={`p-2 border rounded-lg cursor-pointer hover:shadow-md transition ${
                        selectedPermissions.includes(String(permission.id))
                          ? "border-orange-300 bg-orange-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <p className="font-medium text-xs text-gray-800 truncate">
                        {permission.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {permission.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(permission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition mt-2"
              >
                Close
              </button>
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
                  <FaHome className="mr-2 text-indigo-500 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  Property Details
                </h3>
                <button
                  onClick={() => {
                    setShowPropertyModal(false);
                    setSelectedProperty(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedProperty ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    {selectedProperty.images &&
                    selectedProperty.images.length > 0 ? (
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.name || "Property Image"}
                        className="w-full h-48 object-cover rounded-lg mb-4 mx-auto"
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
                    <p className="text-sm text-gray-600 flex items-center justify-center">
                      <FaMapMarkerAlt className="mr-2 text-indigo-500 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                      {selectedProperty.address || "No address provided"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center justify-center">
                      <FaHome className="mr-2 text-indigo-500 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                      Type: {selectedProperty.type || "No type specified"}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">ID:</span>{" "}
                      <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold mx-auto block">
                        {selectedProperty._id}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handlePropertyToggle(selectedProperty._id);
                      setSelectedProperty(null); // Switch back to list after toggle
                    }}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      selectedProperties.includes(selectedProperty._id)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {selectedProperties.includes(selectedProperty._id)
                      ? "Remove Assignment"
                      : "Assign Property"}
                  </button>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="w-full py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Back to List
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
                          selectedProperties.includes(property._id)
                            ? "border-orange-300 bg-orange-50"
                            : "border-gray-200 hover:border-indigo-300"
                        } text-center`}
                      >
                        <p className="font-medium text-sm text-gray-800">
                          {property.name || "Unnamed Property"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.address || "No address provided"}
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

export default AddRegionalManager;