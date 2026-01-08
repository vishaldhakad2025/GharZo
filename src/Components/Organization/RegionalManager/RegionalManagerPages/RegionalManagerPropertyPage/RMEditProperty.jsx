import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const RMEditProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const property = location.state?.property;

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

  const [errors, setErrors] = useState({});
  const [organizationId, setOrganizationId] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Get the property ID (handle both _id and id from different API responses)
  const getPropertyId = () => property?._id || property?.id;

  // Prefill form with property data if available
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        type: property.type || "PG",
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        pinCode: property.pinCode || "",
        landmark: property.landmark || "",
        contactNumber: property.contactNumber || "",
        ownerName: property.ownerName || "",
        ownerEmail: property.ownerEmail || "", // If available in future responses
        description: property.description || "",
        status: property.status || "Available",
      });
      setExistingImages(property.images || []);
    } else {
      toast.error("No property data found. Redirecting to properties list.");
      navigate("/regional_manager/regional_manager_property");
    }
  }, [property, navigate]);

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
        return null;
      default:
        return null;
    }
  };

  // Fetch organizationId from API
  useEffect(() => {
    const fetchOrganizationId = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const response = await axios.get(`${API_BASE}/api/regional-managers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let orgId = response.data.organizationId ||
                    response.data.data?.organizationId ||
                    response.data.profile?.organizationId ||
                    "";

        if (orgId) {
          setOrganizationId(orgId);
        } else {
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
    if (imageFiles.length === 0) {
      return existingImages;
    }
    try {
      const newImageUrls = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = (e) => reject(e);
              reader.readAsDataURL(file);
            })
        )
      );
      const final = [...existingImages, ...newImageUrls];
      return final;
    } catch (err) {
      toast.error("Error processing images.");
      return existingImages;
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
    setSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      setSubmitting(false);
      return;
    }

    if (!organizationId) {
      toast.error("Organization ID not loaded. Please wait or refresh the page.");
      setSubmitting(false);
      return;
    }

    if (loadingProfile) {
      toast.info("Profile is still loading. Please wait...");
      setSubmitting(false);
      return;
    }

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      setSubmitting(false);
      return;
    }

    const propertyId = getPropertyId();
    if (!propertyId) {
      toast.error("Property ID not found. Cannot update.");
      setSubmitting(false);
      return;
    }

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
        images: finalImages,
        status: formData.status.trim(),
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.put(`${API_BASE}/api/rm/properties/${propertyId}`, body, config);

      toast.success(response.data.message || "Property updated successfully!");
      navigate("/regional_manager/regional_manager_property");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error updating property.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    if (property) {
      // Reset to original property data
      setFormData({
        name: property.name || "",
        type: property.type || "PG",
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        pinCode: property.pinCode || "",
        landmark: property.landmark || "",
        contactNumber: property.contactNumber || "",
        ownerName: property.ownerName || "",
        ownerEmail: property.ownerEmail || "",
        description: property.description || "",
        status: property.status || "Available",
      });
      setExistingImages(property.images || []);
    }
    setErrors({});
    setImageFiles([]);
    setPreviewImages([]);
    setMessage("");
    toast.info("Form reset to original values.");
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

  if (!property) {
    return (
      <motion.div
        className="mx-auto p-6 bg-gray-100 border border-green-800 shadow-xl rounded-2xl mt-20 mb-20 lg:mt-10 w-full max-w-[1000px] flex items-center justify-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">No property data found. Redirecting...</div>
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
      <h2 className="text-3xl font-extrabold mb-6 text-center text-black drop-shadow-lg">
        Edit Property
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
              { name: "state", placeholder: "State", icon: FaMap },
              { name: "pinCode", placeholder: "Pin Code", icon: FaMapPin },
              { name: "landmark", placeholder: "Landmark", icon: FaMapPin },
              { name: "contactNumber", placeholder: "Contact Number", icon: FaPhone, type: "tel" },
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
                {f.select ? (
                  <select
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handlePropertyChange}
                    className={inputStyle}
                  >
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
            {submitting ? "Updating..." : "Update Property"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RMEditProperty;