import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaMapPin,
  FaBed,
  FaDoorOpen,
  FaImage,
  FaPhone,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaTrash,
  FaPlus,
  FaExclamationCircle,
  FaCheck,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://api.gharzoreality.com";

const Colorful3DIcon = ({ icon: Icon, gradient, size = 20 }) => (
  <motion.div
    className={`p-3 rounded-3xl shadow-lg bg-gradient-to-br ${gradient} inline-flex items-center justify-center`}
    style={{ perspective: 1000 }}
    whileHover={{ scale: 1.1, rotateY: 15, rotateX: 10 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Icon className="text-white drop-shadow-lg" size={size} />
  </motion.div>
);

const AddProperty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "PG",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
    contactNumber: "",
    ownerName: "",
    ownerEmail: "",
    description: "",
    status: "Available",
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState("+91"); // UI only for country code

  const [errors, setErrors] = useState({});
  const [organizationId, setOrganizationId] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true); // Added for profile fetch state
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const validateField = (name, value) => {
    const trimmed = value?.toString().trim() || "";
    switch (name) {
      case "name":
      case "type":
      case "address":
      case "city":
      case "state":
      case "landmark":
      case "ownerName":
      case "description":
      case "status":
        if (!trimmed) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
        }
        return null;
      case "pinCode":
        if (!trimmed) return "Pin Code is required.";
        if (!/^\d{6}$/.test(trimmed)) return "Pin code must be 6 digits.";
        return null;
      case "contactNumber":
        if (!trimmed) return "Contact Number is required.";
        if (!/^\d{10}$/.test(trimmed)) return "Contact number must be 10 digits.";
        return null;
      case "ownerEmail":
        if (trimmed && (!trimmed.includes("@") || !trimmed.includes("."))) return "Invalid owner email format.";
        return null; // Allow empty if not required, but validate if present
      default:
        return null;
    }
  };

  // Fetch organizationId from API
  useEffect(() => {
    const fetchOrganizationId = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token ? "Found" : "Missing");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        setLoadingProfile(false);
        return;
      }

      console.log("Token value (first 20 chars):", token.substring(0, 20) + "...");
      try {
        setLoadingProfile(true);
        const response = await axios.get(`${API_BASE}/api/regional-managers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Full Profile API Response:", JSON.stringify(response.data, null, 2)); // Detailed log for structure

        // Flexible extraction: Try common response structures
        let orgId = response.data.organizationId ||
                    response.data.data?.organizationId ||
                    response.data.profile?.organizationId ||
                    "";

        console.log("Extracted OrganizationId:", orgId || "NOT FOUND - Check response structure");

        if (orgId) {
          setOrganizationId(orgId);
          console.log("OrganizationId set successfully:", orgId);
        } else {
          console.error("No organizationId found in any expected location");
          toast.error("Organization ID not found in your profile. Please contact support or login again.");
        }
      } catch (err) {
        console.error("Profile API Error:", err.response?.data || err.message);
        toast.error(`Failed to fetch profile: ${err.response?.data?.message || 'Unknown error'}. Please login again.`);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchOrganizationId();
  }, []);

  const getFinalImages = async () => {
    console.log("Processing images. Files count:", imageFiles.length);
    if (imageFiles.length === 0) {
      console.log("No new images, using existing:", existingImages);
      return existingImages;
    }
    try {
      const newImageUrls = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                console.log("Image read as data URL:", file.name);
                resolve(e.target.result);
              };
              reader.onerror = (e) => {
                console.error("FileReader error for", file.name, e);
                reject(e);
              };
              reader.readAsDataURL(file);
            })
        )
      );
      const final = [...existingImages, ...newImageUrls];
      console.log("Final images prepared:", final.length);
      return final;
    } catch (err) {
      console.error("getFinalImages error:", err);
      toast.error("Error processing images.");
      return existingImages; // Fallback
    }
  };

  const handlePropertyChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    const newValue = inputType === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    const error = validateField(name, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("New files selected:", files.length);
    if (files.length + imageFiles.length + existingImages.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...previewUrls]);
    toast.success(`${files.length} image(s) selected for upload`);
  };

  const handleDeleteImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      toast.info("Image removed from property.");
    } else {
      const relIndex = index - existingImages.length;
      setPreviewImages((prev) => prev.filter((_, i) => i !== relIndex));
      setImageFiles((prev) => prev.filter((_, i) => i !== relIndex));
      URL.revokeObjectURL(previewImages[relIndex]);
      toast.success("Image deleted successfully");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== Form Submit Started ===");
    setSubmitting(true);

    const token = localStorage.getItem("token");
    console.log("Token check:", token ? "Present" : "Missing");
    if (!token) {
      console.error("No token, aborting");
      toast.error("Not authenticated. Please login.");
      setSubmitting(false);
      return;
    }

    console.log("OrganizationId check:", organizationId || "MISSING");
    if (!organizationId) {
      console.error("No organizationId, aborting");
      toast.error("Organization ID not loaded. Please wait or refresh the page.");
      setSubmitting(false);
      return;
    }

    if (loadingProfile) {
      toast.info("Profile is still loading. Please wait...");
      setSubmitting(false);
      return;
    }

    // Re-validate all fields on submit
    console.log("Running full validation...");
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        console.log(`Validation error for ${key}:`, error);
      }
    });
    setErrors(newErrors);
    console.log("Validation errors count:", Object.keys(newErrors).length);

    if (Object.keys(newErrors).length > 0) {
      console.error("Validation failed, aborting");
      toast.error("Please fix the errors before submitting.");
      setSubmitting(false);
      return;
    }

    console.log("Validation passed. Preparing body...");
    try {
      const finalImages = await getFinalImages();

      const body = {
        organizationId,
        name: formData.name.trim(),
        type: formData.type.trim(),
        address: formData.address.trim(),
        pinCode: formData.pinCode.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        landmark: formData.landmark.trim(),
        contactNumber: formData.contactNumber.trim(),
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        description: formData.description.trim(),
        images: finalImages, // TODO: If API rejects data URLs, implement upload to get real URLs
        status: formData.status.trim(),
      };
      console.log("Request body:", body);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      console.log("Config:", config);

      console.log("Sending POST to", `${API_BASE}/api/rm/properties`);
      const response = await axios.post(`${API_BASE}/api/rm/properties`, body, config);
      console.log("API Response:", response.data);

      toast.success(response.data.message || "Property added successfully!");
      navigate("/regional_manager/regional_manager_property");
    } catch (err) {
      console.error("Full error details:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      toast.error(err.response?.data?.message || "Error adding property.");
    } finally {
      setSubmitting(false);
      console.log("=== Form Submit Ended ===");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "PG",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      landmark: "",
      contactNumber: "",
      ownerName: "",
      ownerEmail: "",
      description: "",
      status: "Available",
    });
    setSelectedCountryCode("+91");
    setErrors({});
    setExistingImages([]);
    setImageFiles([]);
    setPreviewImages([]);
    setMessage("");
    toast.info("Form reset.");
  };

  const inputStyle =
    "w-full rounded-lg px-0 py-2 bg-gray-50 text-black placeholder-gray-500 border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 transition-all";
  const iconStyle =
    "absolute left-2 top-5 transform -translate-y-1/2 text-blue-400 drop-shadow-lg";

  const allImages = [...existingImages, ...previewImages];

  if (loadingProfile) {
    return (
      <motion.div
        className="mx-auto p-6 bg-gray-100 border border-green-800 shadow-xl rounded-2xl mt-20 mb-20 lg:mt-10 w-full max-w-[1000px] flex items-center justify-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">Loading profile...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mx-auto p-6 bg-gray-100 border border-green-800 shadow-xl rounded-2xl mt-20 mb-20 lg:mt-10 w-full max-w-[1000px]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-900 drop-shadow-lg">
        Add Property
      </h2>

      {message && (
        <p
          className={`mb-4 text-center font-medium ${
            message.includes("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* PROPERTY DETAILS */}
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
            <Colorful3DIcon icon={FaHome} gradient="from-blue-500 to-indigo-600" size={28} />
            Property Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { name: "name", placeholder: "Property Name", icon: FaHome },
              {
                name: "type",
                placeholder: "Type",
                icon: FaDoorOpen,
                select: true,
                options: [
                  "PG",
                  "Hostel",
                  "Room",
                  "Flat",
                  "Rental",
                  "1 BHK",
                  "2 BHK",
                  "3 BHK",
                  "4 BHK",
                  "1 RK",
                  "Studio Apartment",
                  "Luxury Bungalows",
                  "Villas",
                  "Builder Floor",
                ],
              },
              { name: "address", placeholder: "Address", icon: FaMapMarkerAlt },
              { name: "city", placeholder: "City", icon: FaCity },
              {
                name: "state",
                placeholder: "State",
                icon: FaMap,
                select: true,
                options: [
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
                ],
              },
              { name: "pinCode", placeholder: "Pin Code", icon: FaMapPin },
              { name: "landmark", placeholder: "Landmark", icon: FaMapPin },
              {
                name: "contactNumber",
                placeholder: "Contact Number",
                icon: FaPhone,
                type: "tel",
                phone: true, // Custom flag for phone field
              },
              { name: "ownerName", placeholder: "Owner Name", icon: FaUser },
              { name: "ownerEmail", placeholder: "Owner Email", icon: FaEnvelope, type: "email" },
              {
                name: "status",
                placeholder: "Status",
                icon: FaCheckCircle,
                select: true,
                options: ["Available", "Occupied", "Under Maintenance"],
              },
              {
                name: "description",
                placeholder: "Property Description",
                icon: FaHome,
                textarea: true,
              },
            ].map((f, i) => (
              <div className="relative" key={i}>
                <motion.div whileHover={{ rotateX: 10, rotateY: -10 }} className="absolute">
                  <f.icon className={iconStyle} />
                </motion.div>
                {f.phone ? (
                  // Custom rendering for phone field with country code dropdown
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="flex-1 min-w-[80px] pl-5 rounded-lg px-2 py-2 bg-gray-50 text-black border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+971 (UAE)</option>
                      <option value="+86">+86 (China)</option>
                      {/* Add more country codes as needed */}
                    </select>
                    <input
                      type="tel"
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handlePropertyChange}
                      placeholder={f.placeholder}
                      className="flex-1 rounded-lg px-4 py-2 bg-gray-50 text-black placeholder-gray-500 border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lg:pl-[90px] sm:pl-[50px] transition-all"
                    />
                  </div>
                ) : f.select ? (
                  <select
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handlePropertyChange}
                    className={inputStyle}
                  >
                    <option value="">{f.placeholder}</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.textarea ? (
                  <textarea
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handlePropertyChange}
                    placeholder={f.placeholder}
                    className={`${inputStyle} h-24 resize-y`}
                  />
                ) : (
                  <input
                    type={f.type || "text"}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handlePropertyChange}
                    placeholder={f.placeholder}
                    className={inputStyle}
                  />
                )}
                <div className="mt-1">
                  {errors[f.name] && (
                    <div className="flex items-center text-red-500 text-sm">
                      <FaExclamationCircle className="mr-1" />
                      {errors[f.name]}
                    </div>
                  )}
                  {!errors[f.name] && formData[f.name].toString().trim() && (
                    <div className="flex items-center text-green-500 text-sm">
                      <FaCheck className="mr-1" />
                      Valid
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* IMAGES */}
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
            <Colorful3DIcon icon={FaImage} gradient="from-pink-500 to-rose-600" size={28} />
            Property Images
          </h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {allImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Property ${index}`}
                    className="h-24 w-24 object-cover rounded-lg border border-gray-300 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full shadow-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <FaImage className={`${iconStyle} top-1/2 -translate-y-1/2`} />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border border-blue-800 rounded-lg px-10 py-2"
              />
            </div>
          </div>
        </section>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting || loadingProfile}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {submitting ? "Submitting..." : "Add Property"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddProperty;