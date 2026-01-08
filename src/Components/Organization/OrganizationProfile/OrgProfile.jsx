import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaUserTie,
  FaEdit,
  FaSignOutAlt,
  FaSpinner,
  FaCamera,
} from "react-icons/fa";
import { motion } from "framer-motion";

const API_BASE = "https://api.gharzoreality.com";

function OrganizationProfile() {
  const { role, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    mobile: "",
    headquartersAddress: "",
    postalCode: "",
    country: "",
    registrationNumber: "",
    logo: null,
    logoUrl: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const token = localStorage.getItem("orgToken");

  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/organization/login");
      toast.error("Please log in to access your profile.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/organization/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        console.log("Profile data fetched:", data);

        setFormData({
          organizationName: data.organizationName || "",
          email: data.email || "",
          mobile: data.mobile || "",
          headquartersAddress: data.headquartersAddress || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
          registrationNumber: data.registrationNumber || "",
          logo: null,
          logoUrl: data.logoUrl || "",
        });

        setOriginalData(data);

        if (data.logoUrl) {
          const logoPath = data.logoUrl.startsWith("http")
            ? data.logoUrl
            : `${API_BASE}${data.logoUrl}`;
          setIsLoadingPreview(true);
          setPhotoPreview(logoPath);
          setIsLoadingPreview(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load profile.");
        toast.error(err.message || "Failed to load profile.");
      }
    };

    fetchProfile();
  }, [token, navigate, logout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo must be less than 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image.");
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("handleSubmit called, isEditing:", isEditing);

    if (!isEditing) {
      console.log("Submit prevented: Not in editing mode");
      toast.error("Cannot submit: Not in editing mode.");
      return;
    }

    const hasChanges = Object.keys(formData).some(
      (key) =>
        key !== "logo" &&
        formData[key] !== (originalData ? originalData[key] : "")
    );
    if (!hasChanges && !formData.logo) {
      console.log("No changes to save");
      toast.info("No changes to save.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("organizationName", formData.organizationName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("headquartersAddress", formData.headquartersAddress);
      formDataToSend.append("postalCode", formData.postalCode);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("registrationNumber", formData.registrationNumber);

      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      const response = await fetch(`${API_BASE}/api/organization/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const updatedData = await response.json();

      if (response.status === 401) {
        console.log("Unauthorized update request, token invalid or expired");
        localStorage.removeItem("orgtoken");
        await logout();
        navigate("/organization/login");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(updatedData.message || "Failed to update profile");
      }

      console.log("Profile updated:", updatedData);

      setFormData((prev) => ({
        ...prev,
        logo: null,
        logoUrl: updatedData.logoUrl || prev.logoUrl,
      }));

      setOriginalData(updatedData);

      if (updatedData.logoUrl) {
        const logoPath = updatedData.logoUrl.startsWith("http")
          ? updatedData.logoUrl
          : `${API_BASE}${updatedData.logoUrl}`;
        setPhotoPreview(logoPath);
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to update profile.");
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log("handleEdit called, setting isEditing to true");
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log("handleCancel called, resetting form");
    setIsEditing(false);
    if (originalData) {
      setFormData({
        organizationName: originalData.organizationName || "",
        email: originalData.email || "",
        mobile: originalData.mobile || "",
        headquartersAddress: originalData.headquartersAddress || "",
        postalCode: originalData.postalCode || "",
        country: originalData.country || "",
        registrationNumber: originalData.registrationNumber || "",
        logo: null,
        logoUrl: originalData.logoUrl || "",
      });

      if (originalData.logoUrl) {
        const logoPath = originalData.logoUrl.startsWith("http")
          ? originalData.logoUrl
          : `${API_BASE}${originalData.logoUrl}`;
        setPhotoPreview(logoPath);
      } else {
        setPhotoPreview(null);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("orgtoken");
      navigate("/organization/login");
      toast.info("Logged out successfully.");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin h-12 w-12 text-teal-500 mr-4" />
        <span className="text-2xl text-gray-700 font-semibold">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-100 to-white">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-200"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6 sm:mb-8 bg-gradient-to-r from-teal-500 to-emerald-400 text-transparent bg-clip-text">
          Organization Profile
        </h1>

        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8 relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center border-4 border-teal-500 shadow-lg">
            {isLoadingPreview ? (
              <FaSpinner className="animate-spin text-teal-500 text-3xl sm:text-4xl md:text-5xl" />
            ) : photoPreview ? (
              <img
                src={photoPreview}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaBuilding className="text-gray-500 text-3xl sm:text-4xl md:text-5xl" />
            )}
          </div>
          {isEditing && (
            <label
              htmlFor="logo-upload"
              className="absolute bottom-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-400 text-white p-2 sm:p-3 rounded-full cursor-pointer hover:from-teal-600 hover:to-emerald-500 transition duration-300 shadow-md"
            >
              <FaCamera className="text-lg sm:text-xl" />
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {/* Organization Name */}
            <div>
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaBuilding className="mr-2 text-teal-500" /> Organization Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  required
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.organizationName || "N/A"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaEnvelope className="mr-2 text-teal-500" /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  required
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.email || "N/A"}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaPhone className="mr-2 text-teal-500" /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  required
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.mobile || "N/A"}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-teal-500" /> Address
              </label>
              {isEditing ? (
                <textarea
                  name="headquartersAddress"
                  value={formData.headquartersAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  required
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.headquartersAddress || "N/A"}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-teal-500" /> Postal Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  required
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.postalCode || "N/A"}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaGlobe className="mr-2 text-teal-500" /> Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  required
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.country || "N/A"}</p>
              )}
            </div>

            {/* Registration Number */}
            <div className="col-span-full">
              <label className="block mb-2 sm:mb-3 font-semibold text-gray-700 flex items-center">
                <FaUserTie className="mr-2 text-teal-500" /> Registration Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                />
              ) : (
                <p className="text-base sm:text-lg text-gray-600">{formData.registrationNumber || "N/A"}</p>
              )}
            </div>
          </div>

          {/* Action buttons for Save and Cancel */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-6 sm:mt-10">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-400 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold shadow-lg hover:from-teal-600 hover:to-emerald-500 transition duration-300 flex items-center justify-center"
              >
                {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
                Save
              </motion.button>
              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gray-300 text-gray-700 py-3 sm:py-4 px-6 rounded-xl font-semibold shadow-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </motion.button>
            </div>
          )}
        </form>

        {/* Edit button outside the form */}
        {!isEditing && (
          <div className="flex justify-center mt-6 sm:mt-10">
            <motion.button
              type="button"
              onClick={handleEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-400 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-semibold shadow-lg hover:from-teal-600 hover:to-emerald-500 transition duration-300 flex items-center justify-center"
            >
              <FaEdit className="mr-2" /> Edit Profile
            </motion.button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 sm:mt-6 bg-red-50 border border-red-200 text-red-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Logout - Smaller Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-xs mt-6 sm:mt-10 bg-red-500 text-white py-2 px-4 rounded-xl font-semibold shadow-lg hover:bg-red-600 transition duration-300 flex items-center justify-center mx-auto"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </motion.button>
      </motion.div>
    </div>
  );
}

export default OrganizationProfile;