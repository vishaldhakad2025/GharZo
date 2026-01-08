import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Key,
  Calendar,
  Eye,
  Edit3,
  Users,
  Trash2,
  BarChart3,
  DollarSign,
  Home,
} from "lucide-react";

// Icon Wrapper for 3D Colorful Effect
const Colorful3DIcon = ({ Icon, gradient, size = 20 }) => (
  <motion.div
    className={`relative p-2 rounded-full shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 perspective-1000`}
    style={{ transformStyle: "preserve-3d" }}
    whileHover={{ y: -2 }}
  >
    <div
      className={`bg-gradient-to-br ${gradient} rounded-full p-1 shadow-md`}
    >
      <Icon size={size} className="text-white drop-shadow-lg" />
    </div>
    <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
  </motion.div>
);

function PropertyOwnerProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/Property_Owner/login");
          return;
        }

        const response = await fetch("https://api.gharzoreality.com/api/property-owner/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setProfileData(result.data);
          } else {
            setError("Failed to fetch profile data");
          }
        } else {
          setError("Server error while fetching profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-gray-600">Loading Profile...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-red-600">{error || "No profile data found"}</div>
      </div>
    );
  }

  const { name, email, mobile, propertyName, permissions, createdAt } = profileData;

  // Format createdAt
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Personal Info fields
  const personalInfo = [
    { icon: User, label: "Name", value: name, gradient: "from-blue-400 to-indigo-500" },
    { icon: Mail, label: "Email", value: email, gradient: "from-green-400 to-teal-500" },
    { icon: Phone, label: "Mobile", value: mobile, gradient: "from-purple-400 to-pink-500" },
    // { icon: Key, label: "Property Name", value: propertyName, gradient: "from-orange-400 to-red-500" },
    { icon: Calendar, label: "Created At", value: formattedDate, gradient: "from-indigo-400 to-purple-500" },
  ];

  // Permissions fields
  const permissionFields = [
    { key: "canViewPropertyAnalytics", label: "View Property Analytics", icon: BarChart3, gradient: "from-blue-400 to-cyan-500" },
    { key: "canViewRentDetails", label: "View Rent Details", icon: DollarSign, gradient: "from-green-400 to-emerald-500" },
    { key: "canViewOccupancyDetails", label: "View Occupancy Details", icon: Home, gradient: "from-purple-400 to-violet-500" },
    { key: "canEditProperty", label: "Edit Property", icon: Edit3, gradient: "from-yellow-400 to-amber-500" },
    { key: "canAddTenant", label: "Add Tenant", icon: Users, gradient: "from-pink-400 to-rose-500" },
    { key: "canDeleteTenant", label: "Delete Tenant", icon: Trash2, gradient: "from-red-400 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 text-center border border-white/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <Colorful3DIcon Icon={User} gradient="from-white to-gray-200" size={40} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{name}</h1>
          <p className="text-indigo-600 font-semibold text-lg">Property Owner</p>
        </motion.div>

        {/* Personal Information Section */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <Colorful3DIcon Icon={User} gradient="from-blue-400 to-indigo-500" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalInfo.map((field, index) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all"
              >
                <Colorful3DIcon Icon={field.icon} gradient={field.gradient} />
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{field.label}</p>
                  <p className="text-lg font-semibold text-gray-800">{field.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Permissions Section */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <Colorful3DIcon Icon={Key} gradient="from-purple-400 to-pink-500" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Permissions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissionFields.map((perm, index) => (
              <motion.div
                key={perm.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index * 0.1) + 0.3 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <Colorful3DIcon Icon={perm.icon} gradient={perm.gradient} />
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">{perm.label}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  permissions[perm.key]
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {permissions[perm.key] ? "Enabled" : "Disabled"}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default PropertyOwnerProfile;