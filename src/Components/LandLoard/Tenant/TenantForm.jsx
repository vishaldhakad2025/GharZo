import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaBriefcase,
  FaHome,
  FaImage,
  FaTimesCircle,
  FaMale,
  FaFemale,
  FaUserFriends,
  FaFileContract,
  FaMoneyBillWave,
  FaBolt,
  FaBed,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const TenantForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingTenant = location.state;
  const isEdit = Boolean(editingTenant);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    aadhaar: "",
    permanentAddress: "",
    work: "",
    dob: "",
    maritalStatus: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
    photo: null,
    propertyId: "",
    roomId: "",
    bedId: "",
    moveInDate: "",
    noticePeriod: "",
    agreementPeriod: "",
    agreementPeriodType: "months",
    rentOnDate: "",
    rentDateOption: "fixed",
    rentalFrequency: "Monthly",
    referredBy: "",
    remarks: "",
    bookedBy: "",
    electricityPerUnit: "",
    initialReading: "",
    finalReading: "",
    initialReadingDate: "",
    finalReadingDate: "",
    electricityDueDescription: "",
    openingBalanceStartDate: "",
    openingBalanceEndDate: "",
    openingBalanceAmount: "",
  });

  // Fetch Properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://api.gharzoreality.com/api/landlord/properties",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProperties(response.data.properties || []);
      } catch (error) {
        toast.error("Failed to fetch properties");
      }
    };
    fetchProperties();
  }, []);

  // Fetch Available Rooms
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      setAvailableRooms([]);
      if (!formData.propertyId) return;
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/available`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableRooms(res.data?.rooms || []);
      } catch (error) {
        toast.error("Failed to fetch rooms");
        setAvailableRooms([]);
      }
    };
    fetchAvailableRooms();
  }, [formData.propertyId]);

  // Fetch Available Beds
  useEffect(() => {
    const fetchAvailableBeds = async () => {
      setAvailableBeds([]);
      if (!formData.propertyId || !formData.roomId) return;
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}/available-beds`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableBeds(res.data?.beds || []);
      } catch (error) {
        toast.error("Failed to fetch beds");
        setAvailableBeds([]);
      }
    };
    fetchAvailableBeds();
  }, [formData.propertyId, formData.roomId]);

  // Load editing data
  useEffect(() => {
    if (editingTenant) {
      setFormData({
        name: editingTenant.name ?? "",
        email: editingTenant.email ?? "",
        mobile: editingTenant.mobile ?? "",
        aadhaar: editingTenant.aadhaar ?? "",
        permanentAddress: editingTenant.permanentAddress ?? "",
        work: editingTenant.work ?? "",
        dob: editingTenant.dob ?? "",
        maritalStatus: editingTenant.maritalStatus ?? "",
        fatherName: editingTenant.fatherName ?? "",
        fatherMobile: editingTenant.fatherMobile ?? "",
        motherName: editingTenant.motherName ?? "",
        motherMobile: editingTenant.motherMobile ?? "",
        photo: editingTenant.photo ?? null,
        propertyId: editingTenant.propertyId ?? "",
        roomId: editingTenant.roomId ?? "",
        bedId: editingTenant.bedId ?? "",
        moveInDate: editingTenant.moveInDate ?? "",
        noticePeriod: editingTenant.noticePeriod ?? "",
        agreementPeriod: editingTenant.agreementPeriod ?? "",
        agreementPeriodType: editingTenant.agreementPeriodType ?? "months",
        rentOnDate: editingTenant.rentOnDate ?? "",
        rentDateOption: editingTenant.rentDateOption ?? "fixed",
        rentalFrequency: editingTenant.rentalFrequency ?? "Monthly",
        referredBy: editingTenant.referredBy ?? "",
        remarks: editingTenant.remarks ?? "",
        bookedBy: editingTenant.bookedBy ?? "",
        electricityPerUnit: editingTenant.electricityPerUnit ?? "",
        initialReading: editingTenant.initialReading ?? "",
        finalReading: editingTenant.finalReading ?? "",
        initialReadingDate: editingTenant.initialReadingDate ?? "",
        finalReadingDate: editingTenant.finalReadingDate ?? "",
        electricityDueDescription: editingTenant.electricityDueDescription ?? "",
        openingBalanceStartDate: editingTenant.openingBalanceStartDate ?? "",
        openingBalanceEndDate: editingTenant.openingBalanceEndDate ?? "",
        openingBalanceAmount: editingTenant.openingBalanceAmount ?? "",
      });
    }
  }, [editingTenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "aadhaar") {
      newValue = value.replace(/\D/g, "").slice(0, 12);
    }

    if (["mobile", "fatherMobile", "motherMobile"].includes(name)) {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
  };

  const validateCurrentStep = () => {
    const errors = {};

    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().split(/\s+/).length < 2)
        errors.name = "Enter full name";
      if (!formData.email || !/^[^\s@]+@gmail\.com$/i.test(formData.email))
        errors.email = "Valid Gmail required";
      if (!formData.mobile || formData.mobile.length !== 10)
        errors.mobile = "10-digit mobile required";
      if (!formData.aadhaar || formData.aadhaar.length !== 12)
        errors.aadhaar = "12-digit Aadhaar required";
      if (!formData.photo) errors.photo = "Photo is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      setIsLoading(false);
      return;
    }

    const payload = {
      ...formData,
      aadhaar: formData.aadhaar,
      noticePeriod: Number(formData.noticePeriod) || 0,
      agreementPeriod: Number(formData.agreementPeriod) || 0,
      rentOnDate: Number(formData.rentOnDate) || 0,
      electricityPerUnit: Number(formData.electricityPerUnit) || 0,
      initialReading: Number(formData.initialReading) || 0,
      finalReading: formData.finalReading ? Number(formData.finalReading) : null,
      openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
    };

    try {
      const response = await axios({
        method: isEdit ? "PUT" : "POST",
        url: `https://api.gharzoreality.com/api/landlord/tenant${isEdit ? `/${editingTenant.id}` : ""}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: payload,
      });

      // Reserve bed only on new tenant
      if (!isEdit && formData.propertyId && formData.roomId && formData.bedId) {
        await axios.put(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}/beds/${formData.bedId}/status`,
          { status: "Reserved" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success(response.data.message || `Tenant ${isEdit ? "updated" : "added"} successfully!`);
      setTimeout(() => navigate("/landlord/tenant-list"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 text-gray-100"
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
      }}
    >
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600/80 to-orange-500/80 backdrop-blur-md text-white py-8 text-center">
            <h2 className="text-4xl font-extrabold drop-shadow-lg">
              {isEdit ? "Update Tenant" : "Add New Tenant"}
            </h2>
            <p className="mt-2 text-gray-200">Complete the form step by step</p>
          </div>

          <div className="p-8 md:p-12">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-12">
              {["Personal Info", "Family & Address", "Property & Rental", "Electricity & Balance"].map((label, i) => (
                <div key={i} className="flex items-center w-full">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all ${
                      step > i + 1
                        ? "bg-orange-500"
                        : step === i + 1
                        ? "bg-orange-600 ring-8 ring-orange-400/40 scale-110"
                        : "bg-white/20"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-2 mx-4 rounded-full transition-all ${
                        step > i + 1 ? "bg-orange-500" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-orange-300 font-semibold text-xl mb-10">
              Step {step}: {["Personal Info", "Family & Address", "Property & Rental", "Electricity & Balance"][step - 1]}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Name *" name="name" value={formData.name} onChange={handleChange} error={fieldErrors.name} />
                  <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} error={fieldErrors.email} />
                  <MobileInput label="Mobile *" name="mobile" value={formData.mobile} onChange={handleChange} error={fieldErrors.mobile} />
                  <Input label="Aadhaar Number *" name="aadhaar" value={formData.aadhaar} onChange={handleChange} maxLength={12} placeholder="12-digit Aadhaar" error={fieldErrors.aadhaar} />
                  <Input label="Date of Birth *" name="dob" type="date" value={formData.dob} onChange={handleChange} max={today} />
                  <Input label="Occupation *" name="work" value={formData.work} onChange={handleChange} />
                  <Select
                    label="Marital Status *"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    options={[
                      { value: "Unmarried", label: "Unmarried" },
                      { value: "Married", label: "Married" },
                      { value: "Other", label: "Other" },
                    ]}
                  />

                  <div className="md:col-span-2">
                    <label className="block text-lg font-medium text-gray-200 mb-3">Tenant Photo *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-300 file:mr-6 file:py-3 file:px-8 file:rounded-xl file:border-0 file:bg-orange-600/80 file:text-white hover:file:bg-orange-500 cursor-pointer backdrop-blur-sm"
                    />
                    {formData.photo && (
                      <div className="mt-6 relative inline-block">
                        <img src={formData.photo} alt="Preview" className="w-40 h-40 object-cover rounded-2xl shadow-2xl border-4 border-white/30" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-3 -right-3 bg-red-600/80 text-white rounded-full p-3 shadow-lg hover:bg-red-500 transition backdrop-blur-sm"
                        >
                          <FaTimesCircle className="text-xl" />
                        </button>
                      </div>
                    )}
                    {fieldErrors.photo && <p className="text-red-400 text-sm mt-2">{fieldErrors.photo}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Family & Address */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Father's Name *" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                  <MobileInput label="Father's Mobile *" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} />
                  <Input label="Mother's Name *" name="motherName" value={formData.motherName} onChange={handleChange} />
                  <MobileInput label="Mother's Mobile *" name="motherMobile" value={formData.motherMobile} onChange={handleChange} />

                  <div className="md:col-span-2">
                    <label className="block text-lg font-medium text-gray-200 mb-3">Permanent Address *</label>
                    <textarea
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition resize-none"
                      placeholder="Enter full permanent address"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Property & Rental Terms */}
              {step === 3 && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Select
                      label="Property *"
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      options={properties.map((p) => ({ value: p._id, label: p.name || p.propertyName || p._id }))}
                      disabled={properties.length === 0}
                    />
                    <Select
                      label="Room *"
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleChange}
                      options={availableRooms.map((r) => ({ value: r.roomId, label: r.name || r.roomId }))}
                      disabled={!formData.propertyId || availableRooms.length === 0}
                    />
                    <Select
                      label="Bed *"
                      name="bedId"
                      value={formData.bedId}
                      onChange={handleChange}
                      options={availableBeds.length > 0 
                        ? availableBeds.map((b) => ({ value: b.bedId, label: b.name || b.bedId }))
                        : []
                      }
                      disabled={!formData.roomId || availableBeds.length === 0}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Move-in Date *" name="moveInDate" type="date" value={formData.moveInDate} onChange={handleChange} min={today} />
                    <Input label="Notice Period (days) *" name="noticePeriod" type="number" value={formData.noticePeriod} onChange={handleChange} />
                    <Input label="Agreement Period *" name="agreementPeriod" type="number" value={formData.agreementPeriod} onChange={handleChange} />
                    <Select 
                      label="Period Type *" 
                      name="agreementPeriodType" 
                      value={formData.agreementPeriodType} 
                      onChange={handleChange} 
                      options={[
                        { value: "months", label: "Months" },
                        { value: "years", label: "Years" }
                      ]} 
                    />
                    <Input label="Rent Due Date (1-31) *" name="rentOnDate" type="number" min="1" max="31" value={formData.rentOnDate} onChange={handleChange} />
                    <Select 
                      label="Rent Date Option *" 
                      name="rentDateOption" 
                      value={formData.rentDateOption} 
                      onChange={handleChange} 
                      options={[
                        { value: "fixed", label: "Fixed" },
                        { value: "joining", label: "Joining" },
                        { value: "month_end", label: "Month End" }
                      ]} 
                    />
                    <Select 
                      label="Rental Frequency *" 
                      name="rentalFrequency" 
                      value={formData.rentalFrequency} 
                      onChange={handleChange} 
                      options={[
                        { value: "Monthly", label: "Monthly" },
                        { value: "Quarterly", label: "Quarterly" },
                        { value: "Half-Yearly", label: "Half-Yearly" },
                        { value: "Yearly", label: "Yearly" }
                      ]} 
                    />
                    <Input label="Referred By *" name="referredBy" value={formData.referredBy} onChange={handleChange} />
                    <Input label="Booked By *" name="bookedBy" value={formData.bookedBy} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-200 mb-3">Remarks *</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Electricity & Opening Balance */}
              {step === 4 && (
                <div className="space-y-12">
                  <div>
                    <h3 className="text-2xl font-bold text-orange-300 mb-6">Electricity Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input label="Per Unit Rate (₹) *" name="electricityPerUnit" type="number" value={formData.electricityPerUnit} onChange={handleChange} />
                      <Input label="Initial Reading *" name="initialReading" type="number" value={formData.initialReading} onChange={handleChange} />
                      <Input label="Initial Reading Date *" name="initialReadingDate" type="date" value={formData.initialReadingDate} onChange={handleChange} min={today} />
                      <Input label="Final Reading" name="finalReading" type="number" value={formData.finalReading} onChange={handleChange} disabled={isEdit} />
                      <Input label="Final Reading Date" name="finalReadingDate" type="date" value={formData.finalReadingDate} onChange={handleChange} disabled={isEdit} />
                      <div className="md:col-span-2">
                        <label className="block text-lg font-medium text-gray-200 mb-3">Electricity Due Description *</label>
                        <textarea
                          name="electricityDueDescription"
                          value={formData.electricityDueDescription}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition resize-none"
                          disabled={isEdit}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-orange-300 mb-6">Opening Balance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Input label="Start Date *" name="openingBalanceStartDate" type="date" value={formData.openingBalanceStartDate} onChange={handleChange} min={today} />
                      <Input label="End Date *" name="openingBalanceEndDate" type="date" value={formData.openingBalanceEndDate} onChange={handleChange} min={today} />
                      <Input label="Amount (₹) *" name="openingBalanceAmount" type="number" value={formData.openingBalanceAmount} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-16">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-10 py-4 bg-white/10 backdrop-blur-md text-gray-300 font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition shadow-lg"
                  >
                    ← Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-10 py-4 bg-orange-600/80 text-white font-semibold rounded-2xl hover:bg-orange-500 transition shadow-lg"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto px-12 py-4 bg-orange-600/80 text-white font-bold text-lg rounded-2xl hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-2xl flex items-center gap-3"
                  >
                    {isLoading && <FaSpinner className="animate-spin text-2xl" />}
                    {isEdit ? "Update Tenant" : "Submit Tenant"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Reusable Components (Glassmorphism Style)
const Input = ({ label, error, ...props }) => (
  <div>
    <label className="block text-lg font-medium text-gray-200 mb-3">{label}</label>
    <input
      {...props}
      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-md border ${
        error ? "border-red-500/70" : "border-white/30"
      } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition`}
    />
    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
  </div>
);

const MobileInput = ({ label, error, ...props }) => (
  <div>
    <label className="block text-lg font-medium text-gray-200 mb-3">{label}</label>
    <div className="flex">
      <span className="inline-flex items-center px-6 text-gray-300 bg-white/10 backdrop-blur-md border border-r-0 border-white/30 rounded-l-2xl">+91</span>
      <input
        {...props}
        maxLength={10}
        className={`flex-1 px-6 py-4 bg-white/10 backdrop-blur-md border rounded-r-2xl focus:outline-none focus:ring-4 focus:ring-orange-400/50 ${
          error ? "border-red-500/70" : "border-white/30"
        }`}
      />
    </div>
    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
  </div>
);

const Select = ({ label, options = [], disabled = false, ...props }) => (
  <div>
    <label className="block text-lg font-medium text-gray-200 mb-3">{label}</label>
    <select
      {...props}
      disabled={disabled}
      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <option value="" className="bg-gray-800">
        {disabled ? "No options available" : `Select ${label.toLowerCase()}`}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-gray-800">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default TenantForm;