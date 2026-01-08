import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  Home,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  MapPin,
  Lock,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";

const AddWorkerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contactNumber: "",
    email: "",
    address: "",
    availabilityDays: [],
    availableTimeSlots: [],
    chargePerService: "",
    assignedProperties: [],
    password: "",
    profileImage: null,
  });

  // Aadhaar states
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const [properties, setProperties] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]); // To track assigned properties
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added for eye icon

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"];
  const roleOptions = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Cleaner",
    "Pest Control",
    "AC Technician",
    "RO Technician",
    "Lift Maintenance",
    "Security Guard",
    "CCTV Technician",
    "Gardener",
    "Generator Technician",
    "Internet Technician",
    "Other",
  ];

  // Fetch properties and workers on component mount
  const fetchPropertiesAndWorkers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      // Fetch properties
      const propRes = await fetch(
        "https://api.gharzoreality.com/api/pm/properties",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!propRes.ok) {
        setError(`Failed to fetch properties: ${propRes.status}`);
        return;
      }
      const propData = await propRes.json();
      setProperties(propData);

      // Fetch workers to get assigned properties
      const workerRes = await fetch(
        "https://api.gharzoreality.com/api/pm/workers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const workerData = await workerRes.json();
      if (!workerData.success) {
        setError("Failed to fetch workers");
        return;
      }

      setAllWorkers(workerData.workers);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  useEffect(() => {
    fetchPropertiesAndWorkers();
  }, []);

  // Filter unassigned properties
  const unassignedProperties = properties.filter((property) => {
    return !allWorkers.some((worker) =>
      worker.assignedProperties.some((prop) => prop._id === property._id)
    );
  });

  // Filter assigned properties
  const assignedProperties = properties.filter((property) =>
    allWorkers.some((worker) =>
      worker.assignedProperties.some((prop) => prop._id === property._id)
    )
  );

  // Generate Aadhaar OTP
  const generateOtp = async (e) => {
    e.preventDefault();
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      alert("Valid 12-digit Aadhaar number is required");
      return;
    }
    try {
      const res = await fetch("https://api.gharzoreality.com/api/kyc/aadhaar/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber: cleanAadhaar }),
      });
      if (!res.ok) {
        try {
          const errData = await res.json();
          alert(errData.message || "Failed to generate OTP");
        } catch {
          alert(`HTTP ${res.status}: Failed to generate OTP`);
        }
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTxnId(data.txnId);
        setShowOtpInput(true);
        alert(data.message);
      } else {
        alert("Failed to generate OTP");
      }
    } catch (err) {
      console.error("OTP generation error:", err);
      alert(err.message || "Error generating OTP");
    }
  };

  // Verify Aadhaar OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      alert("Valid 6-digit OTP is required");
      return;
    }
    if (!txnId) return;
    try {
      const res = await fetch("https://api.gharzoreality.com/api/kyc/aadhaar/submit-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, otp }),
      });
      if (!res.ok) {
        try {
          const errData = await res.json();
          alert(errData.message || "Failed to verify OTP");
        } catch {
          alert(`HTTP ${res.status}: Failed to verify OTP`);
        }
        return;
      }
      const verifyData = await res.json();
      if (verifyData.success) {
        const kycData = verifyData.data;
        let newAddress = formData.address;
        if (kycData.address) {
          const street = kycData.address.street || kycData.address.landmark || "";
          const city = kycData.address.po || kycData.address.loc || kycData.address.subdist || kycData.address.vtc || "";
          const state = kycData.address.state || "";
          const zip = kycData.zip || "";
          newAddress = [street, city, state, zip].filter(Boolean).join(", ");
        }
        setFormData((prev) => ({
          ...prev,
          name: kycData.full_name || prev.name,
          address: newAddress,
        }));
        setAadhaarVerified(true);
        setShowOtpInput(false);
        setOtp("");
        setAadhaarNumber(kycData.aadhaar_number || aadhaarNumber);
        alert(verifyData.message);
      } else {
        alert("Failed to verify OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      alert(err.message || "Error verifying OTP");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (
      !formData.contactNumber.trim() ||
      !/^\d{10}$/.test(formData.contactNumber)
    )
      newErrors.contactNumber = "Valid 10-digit phone number is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.profileImage) newErrors.profileImage = "Profile image is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (formData.availabilityDays.length === 0)
      newErrors.availabilityDays = "At least one day is required";
    if (formData.availableTimeSlots.length === 0)
      newErrors.availableTimeSlots = "At least one time slot is required";
    if (!formData.chargePerService || formData.chargePerService <= 0)
      newErrors.chargePerService = "Valid charge is required";
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12)
      newErrors.aadhaarNumber = "Valid Aadhaar number is required";
    if (!aadhaarVerified) newErrors.aadhaarVerified = "Aadhaar verification is required";
    if (formData.assignedProperties.length === 0)
      newErrors.assignedProperties = "At least one property must be selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < cleaned.length && i < 12; i++) {
      if (i === 4 || i === 8) formatted += " ";
      formatted += cleaned[i];
    }
    setAadhaarNumber(formatted);
    if (errors.aadhaarNumber) setErrors((prev) => ({ ...prev, aadhaarNumber: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profileImage: file || null }));
    if (errors.profileImage) {
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newArray = checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value);
      return { ...prev, [field]: newArray };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePropertyChange = (propertyId) => {
    setFormData((prev) => {
      const newAssignedProperties = prev.assignedProperties.includes(propertyId)
        ? prev.assignedProperties.filter((id) => id !== propertyId)
        : [...prev.assignedProperties, propertyId];
      return { ...prev, assignedProperties: newAssignedProperties };
    });
    if (errors.assignedProperties)
      setErrors((prev) => ({ ...prev, assignedProperties: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("contactNumber", formData.contactNumber);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }
      formDataToSend.append("address", formData.address);
      formData.availabilityDays.forEach((day) => {
        formDataToSend.append("availabilityDays[]", day);
      });
      formData.availableTimeSlots.forEach((slot) => {
        formDataToSend.append("availableTimeSlots[]", slot);
      });
      formDataToSend.append(
        "chargePerService",
        parseFloat(formData.chargePerService).toString()
      );
      formDataToSend.append("idProofType", "Aadhaar");
      const cleanIdProof = aadhaarNumber.replace(/\s/g, "");
      formDataToSend.append("idProofNumber", cleanIdProof);
      formData.assignedProperties.forEach((id) => {
        formDataToSend.append("propertyIds[]", id);
      });

      const res = await fetch("https://api.gharzoreality.com/api/pm/workers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        throw new Error("Failed to add worker");
      }

      const data = await res.json();
      setResponse(data);
      setFormData({
        name: "",
        role: "",
        contactNumber: "",
        email: "",
        address: "",
        availabilityDays: [],
        availableTimeSlots: [],
        chargePerService: "",
        assignedProperties: [],
        password: "",
        profileImage: null,
      });
      setAadhaarNumber("");
      setOtp("");
      setTxnId(null);
      setShowOtpInput(false);
      setAadhaarVerified(false);
      // Refetch to update assigned properties status
      fetchPropertiesAndWorkers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-white/20">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center text-gray-800">
          <User className="mr-3 h-8 w-8 text-blue-500" /> Add Maintenance Worker
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <User size={20} className="mr-2 text-pink-500" /> Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full name"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Briefcase size={20} className="mr-2 text-green-500" /> Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select Role</option>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Phone size={20} className="mr-2 text-orange-500" /> Contact
              Number *
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              pattern="\d{10}"
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.contactNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter 10-digit phone number"
              required
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contactNumber}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Mail size={20} className="mr-2 text-purple-500" /> Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Lock size={20} className="mr-2 text-blue-500" /> Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`border-2 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <ImageIcon size={20} className="mr-2 text-purple-500" /> Profile Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.profileImage ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.profileImage && (
              <p className="text-red-500 text-sm mt-1">{errors.profileImage}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <Home size={20} className="mr-2 text-indigo-500" /> Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full address"
              required
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <MapPin size={20} className="mr-2 text-purple-500" /> Assigned
              Properties *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              {unassignedProperties.slice(0, 2).map((property) => {
                const isAssigned = assignedProperties.some(
                  (p) => p._id === property._id
                );
                return (
                  <button
                    key={property._id}
                    type="button"
                    onClick={() => !isAssigned && handlePropertyChange(property._id)}
                    className={`p-3 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                      isAssigned
                        ? "bg-orange-500 opacity-50 cursor-not-allowed"
                        : formData.assignedProperties.includes(property._id)
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={isAssigned}
                  >
                    {property.name}, {property.address}
                  </button>
                );
              })}
              {unassignedProperties.length > 2 && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-0 py-2 rounded-xl text-black font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg col-span-2 sm:col-span-1"
                >
                  {unassignedProperties.length - 2}+ more
                </button>
              )}
            </div>
            {errors.assignedProperties && (
              <p className="text-red-500 text-sm mt-1">
                {errors.assignedProperties}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-gray-700 flex items-center">
                <Calendar size={20} className="mr-2 text-teal-500" />{" "}
                Availability Days *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 p-4 bg-gray-50 rounded-xl">
                {days.map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={day}
                      checked={formData.availabilityDays.includes(day)}
                      onChange={(e) =>
                        handleCheckboxChange(e, "availabilityDays")
                      }
                      className="mr-1"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
              {errors.availabilityDays && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.availabilityDays}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-gray-700 flex items-center">
                <Clock size={20} className="mr-2 text-yellow-500" /> Available
                Time Slots *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={slot}
                      checked={formData.availableTimeSlots.includes(slot)}
                      onChange={(e) =>
                        handleCheckboxChange(e, "availableTimeSlots")
                      }
                      className="mr-1"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {slot}
                    </span>
                  </label>
                ))}
              </div>
              {errors.availableTimeSlots && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.availableTimeSlots}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-gray-700 flex items-center">
              <DollarSign size={20} className="mr-2 text-green-600" /> Charge
              Per Service (₹) *
            </label>
            <input
              type="number"
              name="chargePerService"
              value={formData.chargePerService}
              onChange={handleInputChange}
              min="1"
              className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.chargePerService ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter amount"
              required
            />
            {errors.chargePerService && (
              <p className="text-red-500 text-sm mt-1">
                {errors.chargePerService}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold text-gray-700 flex items-center">
                <FileText size={20} className="mr-2 text-red-500" /> Aadhaar Verification *
              </label>
              {!aadhaarVerified ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={handleAadhaarChange}
                      className={`border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.aadhaarNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter Aadhaar (XXXX XXXX XXXX)"
                      maxLength={14}
                    />
                    <button
                      type="button"
                      onClick={generateOtp}
                      disabled={aadhaarNumber.replace(/\s/g, "").length !== 12}
                      className={`p-3 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                        aadhaarNumber.replace(/\s/g, "").length !== 12
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Generate OTP
                    </button>
                  </div>
                  {showOtpInput && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        className="border-2 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 6}
                        className={`p-3 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                          otp.length !== 6
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-500">
                  <span className="text-green-800 font-medium">Aadhaar Verified Successfully</span>
                  <span className="text-sm text-gray-600">({aadhaarNumber})</span>
                </div>
              )}
              {errors.aadhaarNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber}</p>
              )}
              {errors.aadhaarVerified && (
                <p className="text-red-500 text-sm mt-1">{errors.aadhaarVerified}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
           <button
  type="submit"
  className={`bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-700 hover:to-green-600 transition-all font-semibold text-lg shadow-lg hover:shadow-xl ${
    loading ? "opacity-50 cursor-not-allowed" : ""
  }`}
  disabled={loading}
>
  {loading ? "Adding Worker..." : "Add Worker"}
</button>
          </div>
        </form>

        {response && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg border-l-2 border-green-500 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-800 font-medium">
              Success! {response.worker.name} added successfully
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 rounded-lg border-l-2 border-red-500 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">All Available Properties</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {unassignedProperties.map((property) => {
                const isAssigned = assignedProperties.some(
                  (p) => p._id === property._id
                );
                return (
                  <button
                    key={property._id}
                    type="button"
                    onClick={() => !isAssigned && handlePropertyChange(property._id)}
                    className={`p-4 rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                      isAssigned
                        ? "bg-orange-500 opacity-50 cursor-not-allowed"
                        : formData.assignedProperties.includes(property._id)
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={isAssigned}
                  >
                    {property.name}, {property.address}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWorkerForm;