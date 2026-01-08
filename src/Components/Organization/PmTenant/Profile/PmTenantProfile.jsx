import React, { useEffect, useState } from "react";
import axios from "axios";
// import { useAuth } from "../../User_Section/Context/AuthContext";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PmTenantProfile = () => {
  // const { logout } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    permanentAddress: "",
    work: "",
    maritalStatus: "",
    dob: "",
    emergencyContact: {},
  });

  // Fetch tenant profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/website/${subdomain}", { replace: true });
          return;
        }

        const profileRes = await axios.get("https://api.gharzoreality.com/api/tenant/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.data.success) {
          const tenantData = profileRes.data.tenant;
          setTenant(tenantData);
          setFormData({
            name: tenantData.name || "",
            email: tenantData.email || "",
            mobile: tenantData.mobile || "",
            permanentAddress: tenantData.permanentAddress || "",
            work: tenantData.work || "",
            maritalStatus: tenantData.maritalStatus || "",
            dob: tenantData.dob ? new Date(tenantData.dob).toISOString().split("T")[0] : "",
            emergencyContact: tenantData.emergencyContact || {},
          });
        } else {
          setError(profileRes.data.message || "Failed to fetch profile.");
          if (profileRes.data.error === "User is not a registered tenant") {
            navigate("/website/${subdomain}", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.response?.data?.message || "An error occurred while fetching profile.");
        if (error.response?.data?.error === "User is not a registered tenant") {
          navigate("/website/${subdomain}", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        setError("No authentication token found. Please log in.");
        navigate("/login", { replace: true });
        return;
      }

      const res = await axios.put("https://api.gharzoreality.com/api/tenant/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setTenant((prev) => ({ ...prev, ...formData }));
        setEditing(false);
        setError(null);
      } else {
        setError(res.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "An error occurred while updating profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenanttoken");

    // Get subdomain from current URL (e.g., ridhhi-org from ridhhi-org.drazeapp.com)
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const subdomain = parts.length > 2 ? parts[0] : "ridhhi-org"; // fallback if no subdomain

    // Redirect to /website/{subdomain}
    navigate(`/website/${subdomain}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="bg-red-600 p-4 rounded-lg shadow-lg">
          <p className="text-lg">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl rounded-xl mx-auto min-h-screen bg-[#0f172a] text-white flex flex-col">
      <h2 className="text-3xl font-bold mb-6">My Profile</h2>

      {error && (
        <div className="bg-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1e293b] rounded-2xl shadow-xl p-6 space-y-6 flex-1"
      >
        {/* Details */}
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Name:</label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">{tenant?.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Email:</label>
            {editing ? (
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">{tenant?.email}</p>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Mobile:</label>
            {editing ? (
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">
                {tenant?.mobile || "Not Provided"}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Address:</label>
            {editing ? (
              <input
                type="text"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">
                {tenant?.permanentAddress || "Not Provided"}
              </p>
            )}
          </div>

          {/* Work */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Work:</label>
            {editing ? (
              <input
                type="text"
                name="work"
                value={formData.work}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">
                {tenant?.work || "Not Provided"}
              </p>
            )}
          </div>

          {/* Marital Status */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Marital Status:</label>
            {editing ? (
              <input
                type="text"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">
                {tenant?.maritalStatus || "Not Provided"}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Date of Birth:</label>
            {editing ? (
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">
                {tenant?.dob
                  ? new Date(tenant.dob).toLocaleDateString()
                  : "Not Provided"}
              </p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Emergency Contact:</label>
            {editing ? (
              <input
                type="text"
                name="emergencyContact"
                value={JSON.stringify(formData.emergencyContact)}
                onChange={(e) => {
                  try {
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContact: JSON.parse(e.target.value),
                    }));
                  } catch (error) {
                    setError("Invalid JSON format for emergency contact");
                  }
                }}
                className="border border-gray-500 rounded px-2 py-1 w-2/3 bg-[#0f172a] text-white"
              />
            ) : (
              <p className="font-medium text-gray-100 w-2/3">
                {tenant?.emergencyContact && Object.keys(tenant.emergencyContact).length > 0
                  ? JSON.stringify(tenant.emergencyContact)
                  : "Not Provided"}
              </p>
            )}
          </div>

          {/* Joined Date */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 w-1/3">Joined On:</label>
            <p className="font-medium text-gray-100 w-2/3">
              {tenant?.createdAt
                ? new Date(tenant.createdAt).toLocaleDateString()
                : "Not Available"}
            </p>
          </div>
        </div>

        {/* Edit & Logout Buttons */}
        <div className="flex justify-between items-center mt-6">
          {editing ? (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Edit Profile
            </button>
          )}

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PmTenantProfile;