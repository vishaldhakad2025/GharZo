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
import { FaList } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import user from "../../../assets/images/user.jpg";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

// Brand colors
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";
const LIGHT_BG = "#f8fafc";

/* ---------- Main Component ---------- */
function SubOwnerProfile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [subOwnerData, setSubOwnerData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
  });

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
      const response = await fetch(`${baseurl}api/sub-owner/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubOwnerData(data.subOwner);
      } else {
        toast.error(data.message || "Failed to fetch profile data");
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
      if (!token) return toast.error("Please login to update profile");

      setLoading(true);

      const formData = new FormData();
      if (subOwnerData.name) formData.append("name", subOwnerData.name);
      if (subOwnerData.profilePhoto instanceof File) {
        formData.append("profilePhoto", subOwnerData.profilePhoto);
      }

      const response = await fetch(`${baseurl}api/sub-owner/auth/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

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
      if (!token) return toast.error("Please login to change password");

      setLoading(true);
      const response = await axios.put(
        `${baseurl}api/sub-owner/auth/change-password`,
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
        toast.success(response.data.message || "Password changed successfully!");
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error changing password"
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
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#172554] text-xl font-medium flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!subOwnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-xl font-medium">Profile not found</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
            GHARZO <span className="text-[#F97316]">Profile</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your sub-owner account details</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-[#F97316] to-[#ea580c]" />

          <div className="p-6 sm:p-8 lg:p-10">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#F97316]/30 shadow-lg">
                  <img
                    src={
                      previewImage ||
                      (subOwnerData.profilePhoto?.startsWith("http")
                        ? subOwnerData.profilePhoto
                        : subOwnerData.profilePhoto
                        ? `${baseurl}${subOwnerData.profilePhoto}`
                        : user)
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = user)}
                  />
                </div>

                {editMode && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="text-white text-sm font-medium bg-[#F97316]/90 px-4 py-2 rounded-full">
                      Change Photo
                    </span>
                  </label>
                )}
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#172554]">
                  {subOwnerData.name || "Sub-Owner"}
                </h2>
                <p className="text-[#F97316] font-medium mt-1">{subOwnerData.role || "Sub-Owner"}</p>

                <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#172554] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e3a8a] transition-colors"
                  >
                    <FiKey size={18} />
                    Change Password
                  </button>

                  {editMode ? (
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex items-center gap-2 bg-[#F97316] text-white px-6 py-2.5 rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiSave size={18} />
                      )}
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 bg-gray-700 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <FiEdit size={18} />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <ProfileField
                label="Full Name"
                icon={<HiOutlineUser />}
                value={subOwnerData.name}
                name="name"
                onChange={handleChange}
                editMode={editMode}
              />

              <ProfileField
                label="Email Address"
                icon={<HiOutlineMail />}
                value={subOwnerData.email}
                disabled
              />

              <ProfileField
                label="Mobile Number"
                icon={<HiOutlinePhone />}
                value={subOwnerData.mobile}
                disabled
              />

              <ProfileField
                label="Gender"
                icon={<HiOutlineUser />}
                value={subOwnerData.gender || "—"}
                disabled
              />
            </div>

            {/* Assigned Properties */}
            {subOwnerData.assignedProperties?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-[#172554] mb-5 flex items-center gap-3">
                  <MdLocationOn className="text-[#F97316]" size={24} />
                  Assigned Properties
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {subOwnerData.assignedProperties.map((item, index) => (
                    <div
                      key={item.property.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#F97316]/40 transition-colors"
                    >
                      <h4 className="font-semibold text-lg text-[#172554] mb-3">
                        {item.property.name}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Type: <span className="font-medium">{item.property.type}</span></p>
                        <p>Location: <span className="font-medium">{item.property.city}</span></p>
                        <p className="text-[#F97316] font-medium">
                          Status: {item.status}
                        </p>
                        <p className="text-gray-500 text-xs mt-3">
                          Assigned on {formatDate(item.assignedDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#F97316] to-[#ea580c] p-6 text-white">
              <h2 className="text-2xl font-bold">Change Password</h2>
            </div>

            <div className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 top-10 text-gray-500 hover:text-[#F97316]"
                  >
                    {showPasswords.currentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-10 text-gray-500 hover:text-[#F97316]"
                  >
                    {showPasswords.newPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#F97316] text-white py-3 rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-60"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Permissions Modal - optional (kept minimal) */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="bg-[#172554] text-white p-6">
              <h2 className="text-2xl font-bold">All Permissions</h2>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subOwnerData.permissions?.map((perm, i) => (
                  <div
                    key={perm.id || i}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="font-medium text-[#172554] mb-1">
                      {perm.name.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">{perm.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="px-8 py-3 bg-[#172554] text-white rounded-lg hover:bg-[#1e3a8a] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable Field Component ---------- */
function ProfileField({
  label,
  icon,
  value,
  name,
  onChange,
  editMode,
  disabled = false,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#F97316]/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] flex-shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-sm text-gray-500 mb-1">{label}</label>

          {editMode && !disabled ? (
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] outline-none"
            />
          ) : (
            <div className="text-lg font-medium text-[#172554] truncate">
              {value || "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubOwnerProfile;