import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import profileBG from "../../../assets/Images/profileBG.jpg";
import baseurl from "../../../../BaseUrl";
import ProfileTabs from './ProfileTabs';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("usertoken");

  // Validate function
  const validate = (data) => {
    const newErrors = {};

    // Full Name
    const fullName = String(data.fullName || '').trim();
    if (!fullName) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(fullName) || fullName.split(/\s+/).filter(Boolean).length < 2) {
      newErrors.fullName = "Full name must contain only letters and at least first and last name";
    }

    // Email
    const email = String(data.email || '').trim();
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const localPart = email.split('@')[0];
      if (!/\S+@gmail\.com$/.test(email) || !/^[a-zA-Z]/.test(localPart) || !/[0-9]/.test(localPart)) {
        newErrors.email = "Email must be a valid Gmail address starting with a letter, containing numbers, and ending with @gmail.com";
      }
    }

    // Phone
    const phone = String(data.phone || '').trim();
    if (!phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Age
    const age = String(data.age || '').trim();
    if (!age) {
      newErrors.age = "Age is required";
    } else if (!/^\d{2}$/.test(age)) {
      newErrors.age = "Age must be 2 digits";
    }

    // Gender
    const gender = String(data.gender || '').trim();
    if (!gender) {
      newErrors.gender = "Gender is required";
    } else if (!['Male', 'Female'].includes(gender)) {
      newErrors.gender = "Please select Male or Female";
    }

    // Address fields
    const street = String(data.address?.street || '').trim();
    if (!street) {
      newErrors.street = "Street is required";
    } else if (!/^[A-Za-z0-9\s]+$/.test(street)) {
      newErrors.street = "Street must contain letters and numbers only";
    }

    const city = String(data.address?.city || '').trim();
    if (!city) {
      newErrors.city = "City is required";
    } else if (!/^[A-Za-z\s]+$/.test(city)) {
      newErrors.city = "City must contain only letters";
    }

    const state = String(data.address?.state || '').trim();
    if (!state) {
      newErrors.state = "State is required";
    } else if (!/^[A-Za-z\s]+$/.test(state)) {
      newErrors.state = "State must contain only letters";
    }

    const postalCode = String(data.address?.postalCode || '').trim();
    if (!postalCode) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^\d{6}$/.test(postalCode)) {
      newErrors.postalCode = "Postal code must be exactly 6 digits";
    }

    const country = String(data.address?.country || '').trim();
    if (!country) {
      newErrors.country = "Country is required";
    } else if (!/^[A-Za-z\s]+$/.test(country)) {
      newErrors.country = "Country must contain only letters";
    }

    return newErrors;
  };

  // Real-time validation when in edit mode
  useEffect(() => {
    if (editMode) {
      const newErrors = validate(formData);
      setErrors(newErrors);
    }
  }, [formData, editMode]);

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${baseurl}api/auth/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(res.data);
        setFormData({
          ...res.data,
          address: res.data.address || {}
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Update Profile
  const handleUpdate = async () => {
    if (Object.keys(errors).length > 0) {
      alert("Please correct the errors in the form.");
      return;
    }

    try {
      const res = await axios.put(
        `${baseurl}api/auth/user/updateprofile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data.updatedUser || res.data);
      setFormData({
        ... (res.data.updatedUser || res.data),
        address: (res.data.updatedUser || res.data).address || {}
      });
      setErrors({});
      setEditMode(false);
      alert(res.data.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Enter edit mode
  const handleEdit = () => {
    setEditMode(true);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <SkeletonHeader />
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonField key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-l-4 border-red-500 rounded-xl px-8 py-6 shadow-xl"
        >
          <p className="text-red-600 font-semibold text-center">Failed to load profile.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with Edit Toggle */}
        <div className="flex justify-between items-center mb-8 mt-9 ml-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal information</p>
          </div>
          
          {!editMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-[#3B9DF8] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <FaEdit />
              Edit Profile
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FaSave />
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                <FaTimes />
                Cancel
              </motion.button>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3">
            
            {/* Left Sidebar - Avatar & Basic Info */}
            <div className="lg:col-span-1 bg-gradient-to-br from-[#002B5C] to-[#004080] p-8 text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                {/* Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] p-1">
                    <div className="w-full h-full rounded-full bg-[#002B5C] flex items-center justify-center">
                      <FaUser className="text-6xl text-[#FF6B00]" />
                    </div>
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-400 rounded-full border-4 border-[#002B5C]" />
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold mb-2">{formData?.fullName || "User Name"}</h2>
                <p className="text-blue-200 text-sm mb-6">{formData?.email || "email@example.com"}</p>

                {/* Stats Cards */}
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-lg flex items-center justify-center">
                        <FaPhone className="text-[#FF6B00] text-xl" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-blue-200">Phone</p>
                        <p className="font-semibold">{formData?.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-lg flex items-center justify-center">
                        <FaBirthdayCake className="text-[#FF6B00] text-xl" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-blue-200">Age</p>
                        <p className="font-semibold">{formData?.age || "Not provided"} years</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-lg flex items-center justify-center">
                        <FaVenusMars className="text-[#FF6B00] text-xl" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-blue-200">Gender</p>
                        <p className="font-semibold">{formData?.gender || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Form Fields */}
            <div className="lg:col-span-2 p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
                    Personal Information
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">Update your personal details</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      label="Full Name"
                      icon={<FaUser />}
                      value={formData?.fullName}
                      name="fullName"
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      editMode={editMode}
                      error={errors.fullName}
                    />
                    <Field
                      label="Email Address"
                      icon={<FaEnvelope />}
                      value={formData?.email}
                      name="email"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      editMode={editMode}
                      type="email"
                      error={errors.email}
                    />
                    <Field
                      label="Phone Number"
                      icon={<FaPhone />}
                      value={formData?.phone}
                      name="phone"
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      editMode={editMode}
                      type="tel"
                      error={errors.phone}
                    />
                    <Field
                      label="Age"
                      icon={<FaBirthdayCake />}
                      value={formData?.age}
                      name="age"
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      editMode={editMode}
                      type="number"
                      error={errors.age}
                    />
                    <Field
                      label="Gender"
                      icon={<FaVenusMars />}
                      value={formData?.gender}
                      name="gender"
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      editMode={editMode}
                      dropdown
                      error={errors.gender}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-[#FF6B00] to-[#FF8C3A] rounded-full" />
                    Address Details
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">Manage your location information</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      label="Street Address"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.street || ''}
                      name="street"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...(formData.address || {}), street: e.target.value },
                        })
                      }
                      editMode={editMode}
                      error={errors.street}
                    />
                    <Field
                      label="City"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.city || ''}
                      name="city"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...(formData.address || {}), city: e.target.value },
                        })
                      }
                      editMode={editMode}
                      error={errors.city}
                    />
                    <Field
                      label="State"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.state || ''}
                      name="state"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...(formData.address || {}), state: e.target.value },
                        })
                      }
                      editMode={editMode}
                      error={errors.state}
                    />
                    <Field
                      label="Postal Code"
                      icon={<FaMapMarkerAlt />}
                      value={formData?.address?.postalCode || ''}
                      name="postalCode"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...(formData.address || {}),
                            postalCode: e.target.value,
                          },
                        })
                      }
                      editMode={editMode}
                      error={errors.postalCode}
                    />
                    <div className="md:col-span-2">
                      <Field
                        label="Country"
                        icon={<FaMapMarkerAlt />}
                        value={formData?.address?.country || ''}
                        name="country"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...(formData.address || {}), country: e.target.value },
                          })
                        }
                        editMode={editMode}
                        error={errors.country}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ProfileTabs Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <ProfileTabs />
        </motion.div>

      </motion.div>
    </div>
  );
};

// Modern Field Component
function Field({
  label,
  icon,
  value,
  name,
  onChange,
  editMode,
  type = "text",
  dropdown,
  error,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      
      {editMode ? (
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
            {dropdown ? (
              <select
                name={name}
                value={value || ""}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-[#FF6B00] focus:bg-white focus:outline-none transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#FF6B00] focus:bg-white focus:outline-none transition-all"
              />
            )}
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs font-medium ml-1"
            >
              {error}
            </motion.p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-[#FF6B00] text-lg">
            {icon}
          </div>
          <p className="text-gray-800 font-medium flex-1">
            {value || <span className="text-gray-400 italic">Not provided</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// Loading Skeleton Components
function SkeletonHeader() {
  return (
    <div className="flex justify-between items-center mb-8 animate-pulse">
      <div>
        <div className="h-10 w-48 bg-gray-300 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-32 bg-gray-300 rounded-full" />
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 w-24 bg-gray-300 rounded" />
      <div className="h-12 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default ProfilePage;