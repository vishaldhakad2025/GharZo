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
import user from "../../../assets/images/user.jpg";

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
  console.log("Landlord page", token);

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
          // Check if KYC was previously verified (you may need to store this in localStorage or fetch separately)
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
        toast.success(
          <div className="flex items-center gap-3">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi4BbHhz9H8OfMotmBT1Klm4MHiwyHqWWLMA&s"
              alt="success"
              className="w-10 h-10 animate-bounce"
            />
            <span className="font-semibold text-lg">
              Profile Updated Successfully!
            </span>
          </div>,
          {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            theme: "light",
          }
        );

        setProfile(data.landlord);
        setFormData({
          ...data.landlord,
          bankAccountHolderName: data.landlord.bankAccount?.accountHolderName || "",
          bankAccountNumber: data.landlord.bankAccount?.accountNumber || "",
          bankIfscCode: data.landlord.bankAccount?.ifscCode || "",
          bankName: data.landlord.bankAccount?.bankName || "",
          branchName: data.landlord.bankAccount?.branchName || ""
        });
        setKycVerified(true); // Assume update includes verification if bank details are set
        setEditMode(false);
        setPreviewImage(null);
      } else {
        alert(data?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong while updating.");
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

        // Optional: Compare full_name with bankAccountHolderName
        if (data.data.full_name && formData.bankAccountHolderName && 
            !data.data.full_name.toLowerCase().includes(formData.bankAccountHolderName.toLowerCase())) {
          toast.warning(
            `Name mismatch: API returned "${data.data.full_name}", but entered "${formData.bankAccountHolderName}". Please check.`
          );
        } else {
          toast.success(
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-lg" />
              <span>Bank Verified Successfully! Name: {data.data.full_name}</span>
            </div>
          );
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
    // ✅ must match multer field name "profilePhoto"
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
      console.log("Upload response:", data);

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

  if (loading) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 relative transition-all duration-500 min-w-0 ${
          isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="w-full max-w-3xl p-8">
          <SkeletonHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonField key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 relative transition-all duration-500 min-w-0 ${
          isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="text-center text-red-300 font-medium bg-red-900/20 border border-red-600/30 px-4 py-3 rounded-xl">
          Failed to load profile.
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen py-2 px-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 relative transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-6xl"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-50 pointer-events-none">
          <div className="mx-auto h-64 w-64 bg-indigo-600/40 rounded-full translate-y-10" />
        </div>

        {/* Card with margin-top for mobile */}
        <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl mt-6">
          {/* Top Title */}
          <div className="flex items-center justify-center px-6 sm:px-10 pt-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90">
              Landlord Profile
            </h1>
          </div>

          {/* Avatar */}
          <div className="px-6 sm:px-10 mt-8 flex justify-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-2xl -z-10" />
              <img
                src={
                  editMode
                    ? previewImage ||
                      (formData?.profilePhoto &&
                      typeof formData.profilePhoto === "string"
                        ? `${API_BASE}${formData.profilePhoto}`
                        : profile?.profilePhoto
                        ? `${API_BASE}${profile.profilePhoto}`
                        : user)
                    : profile?.profilePhoto
                    ? `${API_BASE}${profile.profilePhoto}`
                    : user
                }
                alt="Profile"
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-indigo-400/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.45)]"
              />
              {editMode && (
                <label className="mt-4 block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    name="profilePhoto"
                    accept="image/*"
                    onChange={handleChange}
                    className="block text-sm text-indigo-200 file:mr-4 file:rounded-xl file:border-0 file:px-4 file:py-2 file:font-semibold file:bg-indigo-600/80 file:text-white hover:file:bg-indigo-600/95 cursor-pointer"
                  />
                </label>
              )}
            </motion.div>
          </div>

          {/* Fields */}
          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Name"
                icon={<HiOutlineUser />}
                value={formData?.name}
                name="name"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Email"
                icon={<HiOutlineMail />}
                value={formData?.email}
                name="email"
                onChange={handleChange}
                editMode={editMode}
                type="email"
              />
              <Field
                label="Mobile"
                icon={<HiOutlinePhone />}
                value={formData?.mobile}
                name="mobile"
                onChange={handleChange}
                editMode={editMode}
                type="tel"
              />
              <Field
                label="DOB"
                icon={<HiOutlineCake />}
                value={(formData?.dob || "").slice(0, 10)}
                name="dob"
                onChange={handleChange}
                editMode={editMode}
                type="date"
              />
              <Field
                label="Gender"
                icon={<HiOutlineUser />}
                value={formData?.gender}
                name="gender"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Address"
                icon={<MdLocationOn />}
                value={formData?.address}
                name="address"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Pin Code"
                icon={<MdOutlinePin />}
                value={formData?.pinCode}
                name="pinCode"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="State"
                icon={<MdLocationOn />}
                value={formData?.state}
                name="state"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Aadhaar Number"
                icon={<MdFingerprint />}
                value={formData?.aadhaarNumber}
                name="aadhaarNumber"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="PAN Number"
                icon={<MdAccountBox />}
                value={formData?.panNumber}
                name="panNumber"
                onChange={handleChange}
                editMode={editMode}
              />
              {/* Bank Fields */}
              <Field
                label="Bank Account Holder Name"
                icon={<HiOutlineUser />}
                value={formData?.bankAccountHolderName}
                name="bankAccountHolderName"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Bank Account Number"
                icon={<MdAccountBox />}
                value={formData?.bankAccountNumber}
                name="bankAccountNumber"
                onChange={handleChange}
                editMode={editMode}
                type="number"
              />
              <Field
                label="Bank IFSC Code"
                icon={<MdFingerprint />}
                value={formData?.bankIfscCode}
                name="bankIfscCode"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Bank Name"
                icon={<MdAccountBox />}
                value={formData?.bankName}
                name="bankName"
                onChange={handleChange}
                editMode={editMode}
              />
              <Field
                label="Branch Name"
                icon={<MdLocationOn />}
                value={formData?.branchName}
                name="branchName"
                onChange={handleChange}
                editMode={editMode}
              />
            </div>

            {/* KYC Verification Section */}
            <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" /> Bank KYC Verification
              </h3>
              <p className="text-sm text-indigo-300 mb-4">
                Verify your bank account to enable payments and collections.
              </p>
              {!kycVerified ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <NeonButton
                    onClick={handleKycVerify}
                    variant="success"
                    icon={kycLoading ? null : FiCheckCircle}
                    disabled={kycLoading}
                  >
                    {kycLoading ? "Verifying..." : "Verify Bank Account"}
                  </NeonButton>
                  {kycData && (
                    <div className="text-sm text-emerald-400 bg-emerald-900/30 p-3 rounded-xl">
                      Verified Name: {kycData.full_name}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/30">
                  <FiCheckCircle className="text-emerald-400 text-xl mr-2" />
                  <span className="text-emerald-300 font-medium">Bank Account Verified</span>
                  {kycData && (
                    <span className="text-sm text-emerald-200 ml-2">({kycData.full_name})</span>
                  )}
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiEdit className="text-indigo-400" /> Signature
              </h3>

              <div className="space-y-4">
                {/* Current Signature */}
                {signatureUrl ? (
                  <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-xl border border-indigo-500/30">
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      className="h-20 object-contain bg-white p-2 rounded"
                    />
                    <NeonButton
                      onClick={deleteSignature}
                      variant="danger"
                      icon={deletingSig ? null : FiTrash2}
                      disabled={deletingSig}
                    >
                      {deletingSig ? "Deleting..." : "Remove"}
                    </NeonButton>
                  </div>
                ) : (
                  <div className="text-center text-indigo-300/70 italic">
                    No signature uploaded
                  </div>
                )}

                {/* Upload Area */}
                <div
                  onDrop={handleSignatureDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-indigo-500/40 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400/60 transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureSelect}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label
                    htmlFor="signature-upload"
                    className="cursor-pointer block"
                  >
                    <FiUpload className="mx-auto text-3xl text-indigo-400 mb-2" />
                    <p className="text-sm text-indigo-300">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-indigo-400/70 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </label>
                </div>

                {/* Upload Button */}
                {signatureFile && (
                  <div className="flex justify-center">
                    <NeonButton
                      onClick={uploadSignature}
                      variant="success"
                      icon={uploadingSig ? null : FiSave}
                      disabled={uploadingSig}
                    >
                      {uploadingSig ? "Uploading..." : "Save Signature"}
                    </NeonButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between px-6 sm:px-10 pb-6">
            {editMode ? (
              <NeonButton
                onClick={handleUpdate}
                variant="success"
                icon={FiSave}
              >
                Save
              </NeonButton>
            ) : (
              <NeonButton
                onClick={() => setEditMode(true)}
                variant="primary"
                icon={FiEdit}
              >
                Edit
              </NeonButton>
            )}
            <NeonButton onClick={handleLogout} variant="danger" icon={FiLogOut}>
              Logout
            </NeonButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- UI Subcomponents ---------- */

function NeonButton({ children, icon: Icon, onClick, variant = "primary", disabled }) {
  const variants = {
    primary:
      "bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.45)]",
    success:
      "bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.45)]",
    danger:
      "bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white shadow-[0_8px_20px_rgba(244,63,94,0.45)]",
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ y: disabled ? 0 : -2 }}
      onClick={onClick}
      disabled={disabled}
      className={`${variants} flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-white/10 ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {Icon && <Icon className="text-lg drop-shadow" />}
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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex items-center gap-3 rounded-2xl p-3 md:p-4 bg-white text-indigo-600 border border-white/10 hover:border-indigo-400/30 transition-all"
    >
      <IconBadge>{icon}</IconBadge>

      {editMode ? (
        <div className="flex flex-col w-full">
          <label className="text-xs md:text-sm text-indigo-200/70 mb-1">
            {label}
          </label>
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full rounded-xl px-3 py-2 bg-slate-800/80 text-indigo-50 placeholder-indigo-200/40 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent"
            placeholder={label}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <span className="text-xs md:text-sm text-indigo-600">{label}</span>
          <span className="text-indigo-600 font-medium break-words">
            {value || <span className="opacity-40">—</span>}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/** 3D icon badge with tilt + glossy highlights */
function IconBadge({ children }) {
  return (
    <motion.div
      whileHover={{ rotateX: 8, rotateY: -8 }}
      transition={{ type: "spring", stiffness: 180, damping: 12 }}
      className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 grid place-items-center
                 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700
                 shadow-[inset_0_1px_8px_rgba(255,255,255,0.35),0_15px_30px_rgba(0,0,0,0.45)]
                 border border-white/10"
    >
      {/* top glossy streak */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/15 blur-lg rounded-full pointer-events-none" />
      {/* side glow */}
      <div className="absolute -inset-1 rounded-2xl bg-indigo-400/0 group-hover:bg-indigo-400/10 transition-colors" />
      <div className="text-white text-2xl drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </motion.div>
  );
}

/* ---------- Skeletons (loading shimmer) ---------- */

function SkeletonHeader() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-indigo-400/20" />
      <div className="mt-6 h-36 w-36 rounded-full bg-indigo-400/20 mx-auto" />
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-indigo-400/20" />
      <div className="flex-1">
        <div className="h-3 w-24 bg-indigo-400/20 rounded mb-2" />
        <div className="h-4 w-40 bg-indigo-400/20 rounded" />
      </div>
    </div>
  );
}

export default LandlordProfile;