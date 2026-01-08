import React, { useEffect, useState } from "react";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCake,
  HiOutlineUser,
} from "react-icons/hi";
import {
  MdLocationOn,
  MdOutlinePin,
  MdFingerprint,
  MdAccountBox,
} from "react-icons/md";
import { FiLogOut, FiEdit, FiSave, FiTrash2, FiUpload, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instaUser from "../../../assets/Images/instaUser.jpg";

const API_BASE = "https://api.gharzoreality.com/";

function LandlordProfile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycData, setKycData] = useState(null);

  // Signature state
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [deletingSig, setDeletingSig] = useState(false);

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const token = localStorage.getItem("token");

  // Sidebar hover effect
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Fetch Profile + Signature
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}api/landlord/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data?.success) {
          setProfile(data.landlord);
          setFormData({
            ...data.landlord,
            bankAccountHolderName: data.landlord.bankAccount?.accountHolderName || "",
            bankAccountNumber: data.landlord.bankAccount?.accountNumber || "",
            bankIfscCode: data.landlord.bankAccount?.ifscCode || "",
            bankName: data.landlord.bankAccount?.bankName || "",
            branchName: data.landlord.bankAccount?.branchName || ""
          });
          if (data.landlord.bankAccount) {
            setKycVerified(true);
          }
        } else {
          console.error("Profile fetch failed:", data?.message);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSignature = async () => {
      try {
        const res = await fetch(`${API_BASE}api/landlord/signature`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success && data.signatureUrl) {
          setSignatureUrl(`${API_BASE}${data.signatureUrl}`);
        } else {
          setSignatureUrl(null);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
        setSignatureUrl(null);
      }
    };

    if (token) {
      fetchProfile();
      fetchSignature();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto") {
      if (files?.[0]) {
        setFormData((p) => ({ ...p, profilePhoto: files[0] }));
        setPreviewImage(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const form = new FormData();
      Object.entries(formData || {}).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          form.append(k, v);
        }
      });

      const res = await fetch(`${API_BASE}api/landlord/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (data?.success) {
        toast.success("Profile Updated Successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
        });

        setProfile(data.landlord);
        setFormData({
          ...data.landlord,
          bankAccountHolderName: data.landlord.bankAccount?.accountHolderName || "",
          bankAccountNumber: data.landlord.bankAccount?.accountNumber || "",
          bankIfscCode: data.landlord.bankAccount?.ifscCode || "",
          bankName: data.landlord.bankAccount?.bankName || "",
          branchName: data.landlord.bankAccount?.branchName || ""
        });
        setKycVerified(true);
        setEditMode(false);
        setPreviewImage(null);
      } else {
        toast.error(data?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong while updating.");
    }
  };

  // KYC Bank Verification
  const handleKycVerify = async () => {
    const accountNumber = formData.bankAccountNumber;
    const ifsc = formData.bankIfscCode;

    if (!accountNumber || !ifsc) {
      toast.error("Please enter Account Number and IFSC Code first.");
      return;
    }

    setKycLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/kyc/bank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber,
          ifsc,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        setKycData(data.data);
        setKycVerified(true);

        if (data.data.full_name && formData.bankAccountHolderName && 
            !data.data.full_name.toLowerCase().includes(formData.bankAccountHolderName.toLowerCase())) {
          toast.warning(`Name mismatch: API returned "${data.data.full_name}"`);
        } else {
          toast.success(`Bank Verified! Name: ${data.data.full_name}`);
        }
      } else {
        toast.error(data?.message || "KYC verification failed");
      }
    } catch (error) {
      console.error("KYC error:", error);
      toast.error("Failed to verify bank details.");
    } finally {
      setKycLoading(false);
    }
  };

  // Upload Signature
  const uploadSignature = async () => {
    if (!signatureFile) return;

    setUploadingSig(true);

    const formDataSig = new FormData();
    formDataSig.append("profilePhoto", signatureFile);

    try {
      const res = await fetch(`${API_BASE}api/landlord/signature`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataSig,
      });

      const data = await res.json();

      if (data.success) {
        setSignatureUrl(`${API_BASE}${data.filePath}`);
        setSignatureFile(null);
        toast.success("Signature uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Signature upload error:", error);
      toast.error("Failed to upload signature");
    } finally {
      setUploadingSig(false);
    }
  };

  // Delete Signature
  const deleteSignature = async () => {
    setDeletingSig(true);
    try {
      const res = await fetch(`${API_BASE}api/landlord/signature`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data?.success) {
        setSignatureUrl(null);
        setSignatureFile(null);
        toast.success("Signature removed successfully");
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Signature delete error:", error);
      toast.error("Failed to delete signature");
    } finally {
      setDeletingSig(false);
    }
  };

  // Handle Signature Drop
  const handleSignatureDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
      setSignatureUrl(URL.createObjectURL(file));
    }
  };

  const handleSignatureSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
      setSignatureUrl(URL.createObjectURL(file));
    }
  };

  // Get profile image URL – fallback to local instaUser.jpg
  const getProfileImage = () => {
    if (editMode && previewImage) return previewImage;
    if (profile?.profilePhoto) return `${API_BASE}${profile.profilePhoto}`;
    return instaUser;
  };

  if (loading) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center relative transition-all duration-500 min-w-0 ${
          isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{
          background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`
        }}
      >
        <div className="w-full max-w-4xl p-6">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-gray-300 mx-auto mb-6" />
            <div className="h-32 w-32 rounded-full bg-gray-300 mx-auto mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center relative transition-all duration-500 min-w-0 ${
          isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{
          background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`
        }}
      >
        <div className="text-center text-red-600 font-medium bg-red-100 px-6 py-4 rounded-xl">
          Failed to load profile.
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen py-4 px-4 relative transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`
      }}
    >
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Main Card with Glassmorphism on dark background */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          {/* Avatar with enhanced Glassmorphism & orange accent */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-orange-500/40 blur-2xl scale-110 group-hover:scale-125 transition duration-500 -z-10" />
              <img
                src={getProfileImage()}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl ring-4 ring-orange-400/50 group-hover:ring-orange-300/70 transition duration-300"
              />
              {editMode && (
                <label className="block mt-4 text-center">
                  <input
                    type="file"
                    name="profilePhoto"
                    accept="image/*"
                    onChange={handleChange}
                    className="text-sm text-orange-300 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-white/20 file:text-white hover:file:bg-white/30 cursor-pointer backdrop-blur-sm"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Profile Fields - Glassmorphism cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Name"
              icon={<HiOutlineUser className="text-orange-300" />}
              value={formData?.name}
              name="name"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Email"
              icon={<HiOutlineMail className="text-orange-300" />}
              value={formData?.email}
              name="email"
              onChange={handleChange}
              editMode={editMode}
              type="email"
            />
            <Field
              label="Mobile"
              icon={<HiOutlinePhone className="text-orange-300" />}
              value={formData?.mobile}
              name="mobile"
              onChange={handleChange}
              editMode={editMode}
              type="tel"
            />
            <Field
              label="DOB"
              icon={<HiOutlineCake className="text-orange-300" />}
              value={(formData?.dob || "").slice(0, 10)}
              name="dob"
              onChange={handleChange}
              editMode={editMode}
              type="date"
            />
            <Field
              label="Gender"
              icon={<HiOutlineUser className="text-orange-300" />}
              value={formData?.gender}
              name="gender"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Address"
              icon={<MdLocationOn className="text-orange-300" />}
              value={formData?.address}
              name="address"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Pin Code"
              icon={<MdOutlinePin className="text-orange-300" />}
              value={formData?.pinCode}
              name="pinCode"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="State"
              icon={<MdLocationOn className="text-orange-300" />}
              value={formData?.state}
              name="state"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Aadhaar Number"
              icon={<MdFingerprint className="text-orange-300" />}
              value={formData?.aadhaarNumber}
              name="aadhaarNumber"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="PAN Number"
              icon={<MdAccountBox className="text-orange-300" />}
              value={formData?.panNumber}
              name="panNumber"
              onChange={handleChange}
              editMode={editMode}
            />
            {/* Bank Fields */}
            <Field
              label="Bank Account Holder Name"
              icon={<HiOutlineUser className="text-orange-300" />}
              value={formData?.bankAccountHolderName}
              name="bankAccountHolderName"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Bank Account Number"
              icon={<MdAccountBox className="text-orange-300" />}
              value={formData?.bankAccountNumber}
              name="bankAccountNumber"
              onChange={handleChange}
              editMode={editMode}
              type="number"
            />
            <Field
              label="Bank IFSC Code"
              icon={<MdFingerprint className="text-orange-300" />}
              value={formData?.bankIfscCode}
              name="bankIfscCode"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Bank Name"
              icon={<MdAccountBox className="text-orange-300" />}
              value={formData?.bankName}
              name="bankName"
              onChange={handleChange}
              editMode={editMode}
            />
            <Field
              label="Branch Name"
              icon={<MdLocationOn className="text-orange-300" />}
              value={formData?.branchName}
              name="branchName"
              onChange={handleChange}
              editMode={editMode}
            />
          </div>

          {/* KYC Verification */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <h3 className="text-base font-semibold text-orange-200 mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-orange-300" /> Bank KYC Verification
            </h3>
            {!kycVerified ? (
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <button
                  onClick={handleKycVerify}
                  disabled={kycLoading}
                  className="px-4 py-2 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 disabled:opacity-60 transition text-sm backdrop-blur-sm"
                >
                  {kycLoading ? "Verifying..." : "Verify Bank"}
                </button>
                {kycData && <span className="text-sm text-orange-200">Verified: {kycData.full_name}</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-200">
                <FiCheckCircle className="text-base" />
                <span className="font-medium">Bank Verified</span>
                {kycData && <span className="text-sm">({kycData.full_name})</span>}
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <h3 className="text-base font-semibold text-orange-200 mb-3 flex items-center gap-2">
              <FiEdit className="text-orange-300" /> Signature
            </h3>

            <div className="space-y-3">
              {signatureUrl ? (
                <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                  <img src={signatureUrl} alt="Signature" className="h-14 object-contain" />
                  <button
                    onClick={deleteSignature}
                    disabled={deletingSig}
                    className="px-3 py-1.5 bg-red-600/80 text-white rounded-lg hover:bg-red-500 text-sm"
                  >
                    {deletingSig ? "..." : "Remove"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-300 text-center">No signature uploaded</p>
              )}

              <div
                onDrop={handleSignatureDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-orange-400/40 rounded-lg p-4 text-center hover:border-orange-300 transition text-sm bg-white/5"
              >
                <input type="file" accept="image/*" onChange={handleSignatureSelect} className="hidden" id="sig-up" />
                <label htmlFor="sig-up" className="cursor-pointer block">
                  <FiUpload className="mx-auto text-xl text-orange-300 mb-1" />
                  <p className="text-orange-200">Upload or drag & drop</p>
                </label>
              </div>

              {signatureFile && (
                <button
                  onClick={uploadSignature}
                  disabled={uploadingSig}
                  className="w-full px-4 py-2 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 text-sm"
                >
                  {uploadingSig ? "Uploading..." : "Save Signature"}
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            {editMode ? (
              <button
                onClick={handleUpdate}
                className="px-5 py-2.5 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
              >
                <FiSave /> Save
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-5 py-2.5 bg-orange-600/80 text-white rounded-lg hover:bg-orange-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
              >
                <FiEdit /> Edit
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* Glassmorphism Field Component for dark theme */
function Field({ label, icon, value, name, onChange, editMode, type = "text" }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">
      <div className="text-lg text-orange-300">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-300">{label}</p>
        {editMode ? (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="mt-1 w-full px-2 py-1.5 border border-orange-300/30 rounded bg-white/10 text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none backdrop-blur-sm"
          />
        ) : (
          <p className="text-sm font-medium text-white">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

export default LandlordProfile;