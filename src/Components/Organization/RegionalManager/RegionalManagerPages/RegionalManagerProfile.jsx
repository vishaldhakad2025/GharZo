import React, { useState, useEffect } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineUser } from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";
import { FiLogOut, FiEdit, FiSave } from "react-icons/fi";
import { FaList, FaSadCry } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import user from "../../../../assets/images/user.jpg";

/* ---------- Main Component ---------- */
function RegionalManagerProfile() {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [regionalManagerData, setRegionalManagerData] = useState(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

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
        "https://api.gharzoreality.com/api/regional-managers/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setRegionalManagerData(data.data);
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

  const handleEditClick = () => {
    if (regionalManagerData.permissions.canUpdateRegionalSettings) {
      setEditMode(true);
    } else {
      setPermissionModalOpen(true);
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

      const updateData = {
        name: regionalManagerData.name,
        mobile: regionalManagerData.mobile,
      };

      const response = await fetch(
        "https://api.gharzoreality.com/api/regional-managers/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setEditMode(false);
        setRegionalManagerData(data.data);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("regionalManager");
    toast.success("Logout successful!");
    window.location.href = "/regional_manager_login";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegionalManagerData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-250 to-blue-300">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!regionalManagerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-250 to-blue-300">
        <div className="text-white text-lg">Profile not found</div>
      </div>
    );
  }

  // Convert permissions object to array for display
  const permissionsArray = Object.entries(regionalManagerData.permissions)
    .filter(([key, value]) => value === true)
    .map(([key]) => ({
      name: "Can " + key.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim(),
      description: `${key.replace(/^can/, "")} access granted`,
    }));

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
          {/* Title */}
          <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white/90 text-center">
              Regional Manager Profile
            </h1>
          </div>
          {/* Avatar */}
          <div className="px-4 sm:px-6 mt-4 sm:mt-6 flex justify-center">
            
          </div>
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Name"
                icon={<HiOutlineUser className="text-white drop-shadow-lg" />}
                value={regionalManagerData?.name || "—"}
                name="name"
                onChange={handleChange}
                editMode={editMode}
                type="text"
              />
              <Field
                label="Email"
                icon={<HiOutlineMail className="text-white drop-shadow-lg" />}
                value={regionalManagerData?.email || "—"}
                type="email"
                disabled
              />
              <Field
                label="Mobile"
                icon={<HiOutlinePhone className="text-white drop-shadow-lg" />}
                value={regionalManagerData?.mobile || "—"}
                name="mobile"
                onChange={handleChange}
                editMode={editMode}
                type="tel"
              />
              <Field
                label="Region"
                icon={<MdLocationOn className="text-white drop-shadow-lg" />}
                value={regionalManagerData?.region || "—"}
                type="text"
                disabled
              />
            </div>
          </div>
          {regionalManagerData.properties && regionalManagerData.properties.length > 0 && (
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 border-t border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                <MdLocationOn className="text-white" />
                Properties
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {regionalManagerData.properties.map((property, index) => {
                  const isObject = typeof property === 'object' && property !== null && property._id;
                  const propKey = isObject ? property._id : property;
                  const propName = isObject ? property.name : `Property ID: ${property}`;
                  const propType = isObject ? property.type : 'N/A';
                  const propCity = isObject ? property.city : 'N/A';
                  const propState = isObject ? property.state : 'N/A';
                  const propPin = isObject ? property.pinCode : 'N/A';
                  const propAddress = isObject ? property.address : 'N/A';
                  const propRooms = isObject ? property.totalRooms : 0;
                  const propBeds = isObject ? property.totalBeds : 0;
                  const propActive = isObject ? property.isActive : true;

                  return (
                    <motion.div
                      key={propKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                      whileHover={{ y: -2, rotateX: 2 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <MdLocationOn className="text-white text-lg" />
                        <h3 className="text-white font-medium text-sm sm:text-base">
                          {propName}
                        </h3>
                      </div>
                      <div className="text-indigo-200 text-xs sm:text-sm space-y-1">
                        {isObject && (
                          <p>
                            <span className="font-medium text-orange-300">Type:</span>{" "}
                            {propType}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-orange-300">Location:</span>{" "}
                          {propCity}, {propState} - {propPin}
                        </p>
                        {isObject && (
                          <p>
                            <span className="font-medium text-orange-300">Address:</span>{" "}
                            {propAddress}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-orange-300">Rooms:</span>{" "}
                          {propRooms} |{" "}
                          <span className="font-medium text-orange-300">Beds:</span>{" "}
                          {propBeds}
                        </p>
                        <p className={`text-${propActive ? 'green' : 'red'}-300`}>
                          <span className="font-medium">Status:</span>{" "}
                          {propActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
          {permissionsArray.length > 0 && (
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 border-t border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                <FaList className="text-orange-300" />
                Permissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {permissionsArray
                  .slice(0, 6)
                  .map((permission, index) => (
                    <motion.div
                      key={permission.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 flex items-center gap-3 hover:bg-white/20 transition-all duration-300"
                      whileHover={{ y: -1, rotateY: 3 }}
                    >
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 shadow-lg"></div>
                      <div className="text-indigo-200 text-xs sm:text-sm">
                        <div className="font-medium text-white">
                          {permission.name.toUpperCase()}
                        </div>
                        <div className="text-indigo-300">
                          {permission.description}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {permissionsArray.length > 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 col-span-1 md:col-span-2 text-center hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <NeonButton
                      onClick={() => setIsPermissionsModalOpen(true)}
                      variant="primary"
                      icon={FaList}
                    >
                      View All Permissions ({permissionsArray.length})
                    </NeonButton>
                  </motion.div>
                )}
              </div>
            </div>
          )}
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Role"
                icon={<HiOutlineUser className="text-white drop-shadow-lg" />}
                value={regionalManagerData?.role?.replace('_', ' ')?.toUpperCase() || "—"}
                type="text"
                disabled
              />
              <Field
                label="Created At"
                icon={<HiOutlineUser className="text-white drop-shadow-lg" />}
                value={formatDate(regionalManagerData.createdAt)}
                type="text"
                disabled
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
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
                  onClick={handleEditClick}
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
        </div>

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
              <h2 className="text-xl sm:text-2xl font-bold text-white/90 mb-4 text-center flex items-center justify-center gap-2">
                <FaList className="text-orange-300" />
                All Permissions
              </h2>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {permissionsArray.map((permission, index) => (
                  <motion.div
                    key={permission.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 flex items-center gap-3 hover:bg-white/20 transition-all duration-300"
                    whileHover={{ y: -1, rotateY: 3 }}
                  >
                    <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 shadow-lg"></div>
                    <div className="text-indigo-200 text-xs sm:text-sm">
                      <div className="font-medium text-white">
                        {permission.name.toUpperCase()}
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

        {/* Permission Denied Modal */}
        {permissionModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 max-w-md w-full mx-4 sm:mx-auto border border-white/20 shadow-lg text-center"
            >
              <motion.div
                initial={{ scale: 0.9, rotateY: 0 }}
                animate={{ scale: 1, rotateY: 360 }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-4"
                whileHover={{ scale: 1.1, rotateY: 5 }}
              >
                <FaSadCry className="w-16 h-16 sm:w-20 sm:h-20 text-gradient-to-br from-red-400 via-pink-500 to-purple-600 drop-shadow-2xl shadow-purple-500/50 mx-auto" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-white/90 mb-2">
                Access Denied
              </h2>
              <p className="text-indigo-200 text-sm sm:text-base mb-6">
                You don't have permission to update your profile. Please contact your administrator.
              </p>
              <NeonButton
                variant="danger"
                onClick={() => setPermissionModalOpen(false)}
              >
                Close
              </NeonButton>
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
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/50",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/50",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/50",
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2, scale: 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`${variants} flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : Icon ? (
        <Icon className="text-lg drop-shadow-lg" />
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
  editMode = false,
  type = "text",
  disabled = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white/10 backdrop-blur-sm text-white shadow-md border border-white/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      whileHover={{ rotateX: 2, rotateY: 2 }}
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/80 to-green-600/80 text-white flex-shrink-0 shadow-lg">
        {React.cloneElement(icon, { style: { filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' } })}
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
            className="w-full rounded-lg px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-indigo-300 focus:ring-2 focus:ring-orange-400 outline-none focus:bg-white/30 transition-all"
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

export default RegionalManagerProfile;