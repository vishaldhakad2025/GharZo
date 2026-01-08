import React, { useState, useEffect } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineUser } from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";
import {
  FiLogOut,
  FiEdit,
  FiSave,
  FiKey,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { FaList } from "react-icons/fa"; // Added for permissions modal button
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import user from "../../../assets/images/user.jpg";
import axios from "axios"; // Added axios import

/* ---------- Main Component ---------- */
function SubOwnerProfile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [subOwnerData, setSubOwnerData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false); // New state for permissions modal
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view profile");
        return;
      }

      setLoading(true);
      const response = await fetch(
        "https://api.gharzoreality.com/api/sub-owner/auth/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setSubOwnerData(data.subOwner);
      } else {
        toast.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("subOwner");
    toast.success("Logout successful!");
    window.location.href = "/sub_owner_login";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubOwnerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubOwnerData((prev) => ({ ...prev, profilePhoto: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to update profile");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      if (subOwnerData.name) {
        formData.append("name", subOwnerData.name);
      }

      if (
        subOwnerData.profilePhoto &&
        subOwnerData.profilePhoto instanceof File
      ) {
        formData.append("profilePhoto", subOwnerData.profilePhoto);
      }

      const response = await fetch(
        "https://api.gharzoreality.com/api/sub-owner/auth/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setEditMode(false);
        setPreviewImage(null);
        setSubOwnerData(data.subOwner);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to change password");
        return;
      }

      setLoading(true);
      const response = await axios.put(
        "https://api.gharzoreality.com/api/sub-owner/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsModalOpen(false);
        setPasswordData({ currentPassword: "", newPassword: "" });
        setShowPasswords({ currentPassword: false, newPassword: false });
        toast.success(
          response.data.message || "Password changed successfully!"
        );
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while changing password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-250 to-blue-300">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!subOwnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-250 to-blue-300">
        <div className="text-white text-lg">Profile not found</div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 px-4 sm:px-6 md:px-8 bg-gray-50">
      <ToastContainer position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-4xl lg:max-w-5xl"
      >
        {/* Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-250 to-blue-300 border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          {/* Title and Change Password Button */}
          <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white/90 text-center">
              Sub Owner Profile
            </h1>
            <NeonButton
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              icon={FiKey}
            >
              Change Password
            </NeonButton>
          </div>
          {/* Avatar */}
          <div className="px-4 sm:px-6 mt-4 sm:mt-6 flex justify-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 15 }}
              className="relative"
            >
              <img
                src={
                  previewImage
                    ? previewImage
                    : subOwnerData.profilePhoto &&
                      subOwnerData.profilePhoto.startsWith("http")
                    ? `https://api.gharzoreality.com${subOwnerData.profilePhoto}`
                    : subOwnerData.profilePhoto
                    ? `https://api.gharzoreality.com${subOwnerData.profilePhoto}`
                    : user
                }
                alt="Profile"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full object-cover border-4 border-indigo-400/40 shadow-lg"
                onError={(e) => {
                  e.target.src = user;
                }}
              />
              {editMode && (
                <label className="mt-3 sm:mt-4 block text-center w-full">
                  <input
                    type="file"
                    name="profilePhoto"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-indigo-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-indigo-600/80 file:text-white hover:file:bg-indigo-600/95 cursor-pointer"
                  />
                </label>
              )}
            </motion.div>
          </div>
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Name"
                icon={<HiOutlineUser />}
                value={subOwnerData?.name || "—"}
                name="name"
                onChange={handleChange}
                editMode={editMode}
                type="text"
              />
              <Field
                label="Email"
                icon={<HiOutlineMail />}
                value={subOwnerData?.email || "—"}
                name="email"
                onChange={handleChange}
                editMode={editMode}
                type="email"
                disabled
              />
              <Field
                label="Mobile"
                icon={<HiOutlinePhone />}
                value={subOwnerData?.mobile || "—"}
                name="mobile"
                onChange={handleChange}
                editMode={editMode}
                type="tel"
                disabled
              />
              <Field
                label="Gender"
                icon={<HiOutlineUser />}
                value={subOwnerData?.gender || "—"}
                name="gender"
                onChange={handleChange}
                editMode={editMode}
                type="text"
                disabled
              />
            </div>
          </div>
          {subOwnerData.assignedProperties &&
            subOwnerData.assignedProperties.length > 0 && (
              <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 border-t border-white/20">
                <h2 className="text-lg sm:text-xl font-semibold text-white/90 mb-4">
                  Assigned Properties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {subOwnerData.assignedProperties.map((assignment, index) => (
                    <motion.div
                      key={assignment.property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <MdLocationOn className="text-indigo-300 text-lg" />
                        <h3 className="text-white font-medium text-sm sm:text-base">
                          {assignment.property.name}
                        </h3>
                      </div>
                      <div className="text-indigo-200 text-xs sm:text-sm space-y-1">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {assignment.property.type}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {assignment.property.city},{" "}
                          {assignment.property.address}
                        </p>
                        <p>
                          <span className="font-medium">Rooms:</span>{" "}
                          {assignment.property.totalRooms} |{" "}
                          <span className="font-medium">Beds:</span>{" "}
                          {assignment.property.totalBeds}
                        </p>
                        <p className="text-green-300">
                          <span className="font-medium">Status:</span>{" "}
                          {assignment.status}
                        </p>
                        <p className="text-orange-300">
                          <span className="font-medium">Assigned:</span>{" "}
                          {formatDate(assignment.assignedDate)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          {subOwnerData.permissions && subOwnerData.permissions.length > 0 && (
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 border-t border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-white/90 mb-4">
                Permissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {subOwnerData.permissions
                  .slice(0, 6)
                  .map((permission, index) => (
                    <motion.div
                      key={permission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <div className="text-indigo-200 text-xs sm:text-sm">
                        <div className="font-medium text-white">
                          {permission.name.replace(/_/g, " ").toUpperCase()}
                        </div>
                        <div className="text-indigo-300">
                          {permission.description}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {subOwnerData.permissions.length > 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 col-span-1 md:col-span-2 text-center"
                  >
                    <NeonButton
                      onClick={() => setIsPermissionsModalOpen(true)}
                      variant="primary"
                      icon={FaList}
                    >
                      View All Permissions ({subOwnerData.permissions.length})
                    </NeonButton>
                  </motion.div>
                )}
              </div>
            </div>
          )}
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Last Login"
                icon={<HiOutlineUser />}
                value={formatDate(subOwnerData.lastLogin)}
                name="lastLogin"
                editMode={false}
                type="text"
                disabled
              />
              <Field
                label="Created At"
                icon={<HiOutlineUser />}
                value={formatDate(subOwnerData.createdAt)}
                name="createdAt"
                editMode={false}
                type="text"
                disabled
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 pb-4 sm:pb-6">
            {editMode ? (
              <NeonButton
                onClick={handleUpdate}
                variant="success"
                icon={FiSave}
                loading={loading}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </NeonButton>
            ) : (
              <NeonButton
                onClick={() => setEditMode(true)}
                variant="primary"
                icon={FiEdit}
              >
                Edit Profile
              </NeonButton>
            )}
            <NeonButton onClick={handleLogout} variant="danger" icon={FiLogOut}>
              Logout
            </NeonButton>
          </div>
        </div>

        {/* Password Change Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 max-w-md w-full mx-4 sm:mx-auto border border-white/20 shadow-lg"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white/90 mb-4 text-center">
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4 relative">
                  <label className="block text-sm sm:text-base text-indigo-200 mb-2">
                    Current Password
                  </label>
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-indigo-300 focus:ring-2 focus:ring-indigo-400 outline-none focus:bg-white/30 transition-all pr-10"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 bottom-3 transform  text-indigo-200 hover:text-indigo-100"
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPasswords.currentPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </motion.button>
                </div>
                <div className="mb-4 relative">
                  <label className="block text-sm sm:text-base text-indigo-200 mb-2">
                    New Password
                  </label>
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-indigo-300 focus:ring-2 focus:ring-indigo-400 outline-none focus:bg-white/30 transition-all pr-10"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 bottom-3 transform text-indigo-200 hover:text-indigo-100"
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPasswords.newPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </motion.button>
                </div>
                <div className="flex gap-3">
                  <NeonButton
                    type="submit"
                    variant="success"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </NeonButton>
                  <NeonButton
                    variant="danger"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </NeonButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Permissions Modal */}
        {isPermissionsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 max-w-lg w-full mx-4 sm:mx-auto border border-white/20 shadow-lg"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white/90 mb-4 text-center">
                All Permissions
              </h2>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {subOwnerData.permissions.map((permission, index) => (
                  <motion.div
                    key={permission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    <div className="text-indigo-200 text-xs sm:text-sm">
                      <div className="font-medium text-white">
                        {permission.name.replace(/_/g, " ").toUpperCase()}
                      </div>
                      <div className="text-indigo-300">
                        {permission.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <NeonButton
                  variant="danger"
                  onClick={() => setIsPermissionsModalOpen(false)}
                >
                  Close
                </NeonButton>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- UI Components ---------- */
function NeonButton({
  children,
  icon: Icon,
  onClick,
  variant = "primary",
  loading = false,
  disabled = false,
}) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg",
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      disabled={disabled}
      className={`${variants} flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : Icon ? (
        <Icon className="text-lg" />
      ) : null}
      {children}
    </motion.button>
  );
}

function Field({
  label,
  icon,
  value,
  name,
  onChange,
  editMode,
  type = "text",
  disabled = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white/10 backdrop-blur-sm text-white shadow-md border border-white/20"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-indigo-600/80 text-white flex-shrink-0">
        {icon}
      </div>
      {editMode && !disabled ? (
        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm text-indigo-200 mb-1">
            {label}
          </label>
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full rounded-lg px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-indigo-300 focus:ring-2 focus:ring-indigo-400 outline-none focus:bg-white/30 transition-all"
            placeholder={label}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <span className="text-xs sm:text-sm text-indigo-200">{label}</span>
          <span className="font-medium text-white/90 text-sm sm:text-base truncate">
            {value}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default SubOwnerProfile;
