import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../User_Section/Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  Edit2, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Heart, 
  Calendar, 
  Shield, 
  Upload, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TenantProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    permanentAddress: "",
    work: "",
    maritalStatus: "",
    dob: "",
    emergencyContact: { name: "", phone: "", relation: "" },
  });

  // Fetch tenant profile and signature
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("tenanttoken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login", { replace: true });
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
            emergencyContact: tenantData.emergencyContact || { name: "", phone: "", relation: "" },
          });

          // Fetch signature using tenantId from profile response
          if (tenantData.tenantId) {
            try {
              const sigRes = await axios.get(
                `https://api.gharzoreality.com/api/landlord/tenant/signature/${tenantData.tenantId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (sigRes.data.success && sigRes.data.signatureUrl) {
                setSignatureUrl(`https://api.gharzoreality.com${sigRes.data.signatureUrl}`);
              }
            } catch (sigError) {
              console.log("No signature found:", sigError.response?.data);
            }
          }
        } else {
          setError(profileRes.data.message || "Failed to fetch profile.");
          if (profileRes.data.error === "User is not a registered tenant") {
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.response?.data?.message || "An error occurred while fetching profile.");
        if (error.response?.data?.error === "User is not a registered tenant") {
          navigate("/login", { replace: true });
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

  const handleEmergencyContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
    }
  };

  const uploadSignature = async () => {
    if (!signatureFile || !tenant?.tenantId) return;

    const token = localStorage.getItem("tenanttoken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePhoto", signatureFile);

    try {
      setUploading(true);
      const res = await axios.post(
        "https://api.gharzoreality.com/api/landlord/tenant/signature",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setSignatureUrl(`https://api.gharzoreality.com${res.data.filePath}`);
        setSignatureFile(null);
        document.getElementById("signatureInput").value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.message || "Failed to upload signature.");
    } finally {
      setUploading(false);
    }
  };

  const deleteSignature = async () => {
    if (!tenant?.tenantId) return;

    const token = localStorage.getItem("tenanttoken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    try {
      setDeleting(true);
      const res = await axios.delete(
        `https://api.gharzoreality.com/api/landlord/tenant/signature/${tenant.tenantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setSignatureUrl("");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.response?.data?.message || "Failed to delete signature.");
    } finally {
      setDeleting(false);
    }
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
    logout();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-red-100"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Profile Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
 

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{tenant?.name}</h2>
                <p className="text-gray-600">{tenant?.email}</p>
              </div>

              {/* Profile Stats */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{tenant?.mobile || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Joined On</p>
                      <p className="font-medium text-gray-900">
                        {tenant?.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Account Status</p>
                      <p className="font-medium text-gray-900">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </motion.button>
              )}
            </div>

            {/* Signature Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Digital Signature</h3>
              </div>

              {signatureUrl ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center">
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      className="max-h-32 object-contain"
                    />
                  </div>
                  <button
                    onClick={deleteSignature}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove Signature
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No signature uploaded</p>
                    <p className="text-gray-400 text-xs mt-1">Upload your digital signature</p>
                  </div>
                  <input
                    id="signatureInput"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="signatureInput"
                    className="block w-full p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 text-center font-medium cursor-pointer border border-gray-200"
                  >
                    Choose Signature File
                  </label>
                  {signatureFile && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{signatureFile.name}</span>
                        <button
                          onClick={() => {
                            setSignatureFile(null);
                            document.getElementById("signatureInput").value = "";
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={uploadSignature}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Signature
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all ${activeTab === "personal" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600"}`}
                >
                  Personal Details
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all ${activeTab === "contact" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600"}`}
                >
                  Contact & Emergency
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "personal" && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4" />
                          Full Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.name}
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        {editing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.email}
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4" />
                          Mobile Number
                        </label>
                        {editing ? (
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter your mobile number"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.mobile || "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MapPin className="w-4 h-4" />
                          Permanent Address
                        </label>
                        {editing ? (
                          <textarea
                            name="permanentAddress"
                            value={formData.permanentAddress}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                            placeholder="Enter your permanent address"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.permanentAddress || "Not provided"}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "contact" && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Work */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Briefcase className="w-4 h-4" />
                          Occupation
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="work"
                            value={formData.work}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter your occupation"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.work || "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Marital Status */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Heart className="w-4 h-4" />
                          Marital Status
                        </label>
                        {editing ? (
                          <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          >
                            <option value="">Select marital status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.maritalStatus || "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </label>
                        {editing ? (
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                            {tenant?.dob ? new Date(tenant.dob).toLocaleDateString() : "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Shield className="w-4 h-4" />
                          Emergency Contact
                        </label>
                        {editing ? (
                          <div className="space-y-4 p-4 rounded-xl border border-gray-300">
                            <input
                              type="text"
                              value={formData.emergencyContact.name}
                              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              placeholder="Contact Name"
                            />
                            <input
                              type="tel"
                              value={formData.emergencyContact.phone}
                              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              placeholder="Phone Number"
                            />
                            <input
                              type="text"
                              value={formData.emergencyContact.relation}
                              onChange={(e) => handleEmergencyContactChange('relation', e.target.value)}
                              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              placeholder="Relationship"
                            />
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50">
                            {tenant?.emergencyContact && Object.keys(tenant.emergencyContact).length > 0 ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span className="font-medium">{tenant.emergencyContact.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Phone:</span>
                                  <span className="font-medium">{tenant.emergencyContact.phone}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Relation:</span>
                                  <span className="font-medium">{tenant.emergencyContact.relation}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500">No emergency contact provided</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Actions */}
                {editing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mt-8 pt-6 border-t border-gray-200"
                  >
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-lg hover:shadow-xl"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;