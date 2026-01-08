import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCalendar,
  FaBriefcase,
  FaHome,
  FaImage,
  FaTimesCircle,
  FaMale,
  FaFemale,
  FaUserFriends,
  FaMoneyCheckAlt,
  FaFileContract,
  FaMoneyBillWave,
  FaBolt,
  FaMapMarkerAlt,
  FaSpinner,
  FaBed,
  FaChevronDown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TenantForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  // console.log("Property ID from URL:", id);
  const editingTenant = location.state?.tenant;
  const isEdit = Boolean(editingTenant && editingTenant.id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProperties, setIsFetchingProperties] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [isFetchingBeds, setIsFetchingBeds] = useState(false);

  // Aadhaar verification states
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const initialFormData = {
    name: "",
    email: "",
    aadhaar: "",
    mobile: "",
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
    rentAmount: "",
    securityDeposit: "",
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
  };

  const [formData, setFormData] = useState(initialFormData);

  // Helper: Validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Generate Aadhaar OTP
  const generateOtp = async (e) => {
    e.preventDefault();
    const aadhaar = formData.aadhaar;
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      toast.error("Valid 12-digit Aadhaar number is required");
      return;
    }
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/kyc/aadhaar/generate-otp",
        { aadhaarNumber: aadhaar },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setTxnId(res.data.txnId);
        setShowOtpInput(true);
        toast.success(res.data.message);
      } else {
        toast.error("Failed to generate OTP");
      }
    } catch (error) {
      console.error("OTP generation error:", error);
      toast.error(error.response?.data?.message || "Error generating OTP");
    }
  };

  // Verify Aadhaar OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Valid 6-digit OTP is required");
      return;
    }
    if (!txnId) return;
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/kyc/aadhaar/submit-otp",
        { txnId, otp },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        const data = res.data.data;
        setFormData((prev) => ({
          ...prev,
          name: data.full_name || prev.name,
          dob: data.dob || prev.dob,
          permanentAddress: [
            data.address?.street || data.address?.landmark || "",
            data.address?.po || data.address?.loc || data.address?.subdist || data.address?.vtc || "",
            data.address?.state || "",
            data.zip || "",
          ].filter(Boolean).join(", ") || prev.permanentAddress,
        }));
        setAadhaarVerified(true);
        setShowOtpInput(false);
        setOtp("");
        toast.success(res.data.message);
      } else {
        toast.error("Failed to verify OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Error verifying OTP");
    }
  };

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      setIsFetchingProperties(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login.");
          navigate("/login");
          return;
        }
        const response = await axios.get(
          "https://api.gharzoreality.com/api/sub-owner/properties",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched properties:", response.data.properties[0].id);
        const propertiesData = Array.isArray(response.data?.properties)
          ? response.data.properties
          : [];
        setProperties(propertiesData);
        if (propertiesData.length === 0) {
          toast.warn("No properties available.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch properties."
        );
      } finally {
        setIsFetchingProperties(false);
      }
    };
    fetchProperties();
  }, [navigate]);

  // Fetch rooms when propertyId changes
  useEffect(() => {
    if (formData.propertyId) {
      // Validate propertyId is a valid ObjectId
      if (!isValidObjectId(formData.propertyId)) {
        console.error(
          "Invalid propertyId (not ObjectId):",
          formData.propertyId
        ); // Debug log
        toast.error(
          "Invalid property selected. Please choose a valid property."
        );
        setAvailableRooms([]);
        setAvailableBeds([]);
        setFormData((prev) => ({
          ...prev,
          roomId: "",
          bedId: "",
          rentAmount: "",
        }));
        setIsFetchingRooms(false);
        return;
      }

      const fetchRooms = async () => {
        setIsFetchingRooms(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Authentication required! Please login.");
            navigate("/login");
            return;
          }
          console.log("Fetching rooms for propertyId:", formData.propertyId); // Debug log
          const response = await axios.get(
            `https://api.gharzoreality.com/api/sub-owner/properties/${formData.propertyId}/available-rooms`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const roomsData = Array.isArray(response.data?.rooms)
            ? response.data.rooms
            : [];
          setAvailableRooms(roomsData);
          // Reset room and bed if not valid
          if (!roomsData.some((room) => room.roomId === formData.roomId)) {
            setFormData((prev) => ({
              ...prev,
              roomId: "",
              bedId: "",
              rentAmount: "",
            }));
          }
          if (roomsData.length === 0) {
            toast.warn("No rooms available for this property.");
          }
        } catch (error) {
          console.error(
            "Rooms fetch error:",
            error.response?.data || error.message
          ); // Debug log
          const errorMsg =
            error.response?.data?.message || "Failed to fetch rooms.";
          if (error.response?.status === 404) {
            toast.error("Property ID invalid. Please select a valid property.");
          } else {
            toast.error(errorMsg);
          }
          setAvailableRooms([]);
        } finally {
          setIsFetchingRooms(false);
        }
      };
      fetchRooms();
    } else {
      setAvailableRooms([]);
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        roomId: "",
        bedId: "",
        rentAmount: "",
      }));
    }
  }, [formData.propertyId, navigate]);

  // Fetch beds when roomId changes
  useEffect(() => {
    if (formData.propertyId && formData.roomId) {
      // Validate propertyId and roomId
      if (!isValidObjectId(formData.propertyId)) {
        console.error("Invalid propertyId:", formData.propertyId);
        toast.error("Invalid property selected.");
        setAvailableBeds([]);
        setFormData((prev) => ({ ...prev, bedId: "", rentAmount: "" }));
        return;
      }

      const fetchBeds = async () => {
        setIsFetchingBeds(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Authentication required! Please login.");
            navigate("/login");
            return;
          }
          console.log("Fetching beds for roomId:", formData.roomId); // Debug log
          const response = await axios.get(
            `https://api.gharzoreality.com/api/sub-owner/properties/${formData.propertyId}/rooms/${formData.roomId}/available-beds`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const bedsData = Array.isArray(response.data?.beds)
            ? response.data.beds
            : [];
          setAvailableBeds(bedsData);
          // Reset bed if not valid
          if (!bedsData.some((bed) => bed.bedId === formData.bedId)) {
            setFormData((prev) => ({
              ...prev,
              bedId: "",
              rentAmount: "",
            }));
          }
          if (bedsData.length === 0) {
            toast.warn("No beds available for this room.");
          }
        } catch (error) {
          console.error(
            "Beds fetch error:",
            error.response?.data || error.message
          ); // Debug log
          const errorMsg =
            error.response?.data?.message || "Failed to fetch beds.";
          if (error.response?.status === 404) {
            toast.error("Bed is not available. Please select a valid room.");
          } else {
            toast.error(errorMsg);
          }
          setAvailableBeds([]);
        } finally {
          setIsFetchingBeds(false);
        }
      };
      fetchBeds();
    } else {
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        bedId: "",
        rentAmount: "",
      }));
    }
  }, [formData.roomId, formData.propertyId, navigate]);

  // Pre-fill form for editing or from location.state
  useEffect(() => {
    if (isEdit && editingTenant.id) {
      // For editing, validate propertyId is ObjectId
      let validPropertyId = editingTenant.propertyId ?? "";
      if (validPropertyId && !isValidObjectId(validPropertyId)) {
        console.warn("Invalid propertyId in editingTenant:", validPropertyId); // Debug log
        validPropertyId = "";
      }

      setFormData({
        name: editingTenant.name ?? "",
        email: editingTenant.email ?? "",
        aadhaar: editingTenant.aadhaar ?? "",
        mobile: editingTenant.mobile ?? "",
        permanentAddress: editingTenant.permanentAddress ?? "",
        work: editingTenant.work ?? "",
        dob: editingTenant.dob ?? "",
        maritalStatus: editingTenant.maritalStatus ?? "",
        fatherName: editingTenant.fatherName ?? "",
        fatherMobile: editingTenant.fatherMobile ?? "",
        motherName: editingTenant.motherName ?? "",
        motherMobile: editingTenant.motherMobile ?? "",
        photo: editingTenant.photo ?? null,
        propertyId: validPropertyId,
        roomId: editingTenant.roomId ?? "",
        bedId: editingTenant.bedId ?? "",
        moveInDate: editingTenant.moveInDate ?? "",
        rentAmount: editingTenant.rentAmount?.toString() ?? "",
        securityDeposit: editingTenant.securityDeposit?.toString() ?? "",
        noticePeriod: editingTenant.noticePeriod?.toString() ?? "",
        agreementPeriod: editingTenant.agreementPeriod?.toString() ?? "",
        agreementPeriodType: editingTenant.agreementPeriodType ?? "months",
        rentOnDate: editingTenant.rentOnDate?.toString() ?? "",
        rentDateOption: editingTenant.rentDateOption ?? "fixed",
        rentalFrequency: editingTenant.rentalFrequency ?? "Monthly",
        referredBy: editingTenant.referredBy ?? "",
        remarks: editingTenant.remarks ?? "",
        bookedBy: editingTenant.bookedBy ?? "",
        electricityPerUnit: editingTenant.electricityPerUnit?.toString() ?? "",
        initialReading: editingTenant.initialReading?.toString() ?? "",
        finalReading: editingTenant.finalReading?.toString() ?? "",
        initialReadingDate: editingTenant.initialReadingDate ?? "",
        finalReadingDate: editingTenant.finalReadingDate ?? "",
        electricityDueDescription:
          editingTenant.electricityDueDescription ?? "",
        openingBalanceStartDate: editingTenant.openingBalanceStartDate ?? "",
        openingBalanceEndDate: editingTenant.openingBalanceEndDate ?? "",
        openingBalanceAmount:
          editingTenant.openingBalanceAmount?.toString() ?? "",
      });
      setAadhaarVerified(!!editingTenant.aadhaar);
      setOtp("");
      setShowOtpInput(false);
      setTxnId(null);
    } else if (location.state?.propertyId && location.state?.propertyTitle) {
      // Validate propertyId from location.state is ObjectId
      let validPropertyId = location.state.propertyId;
      if (!isValidObjectId(validPropertyId)) {
        console.warn(
          "Invalid propertyId from location.state:",
          validPropertyId
        ); // Debug log
        toast.warn("Invalid property ID provided. Please select manually.");
        validPropertyId = "";
      }

      setFormData((prev) => ({
        ...prev,
        propertyId: validPropertyId,
        roomId: "",
        bedId: "",
        rentAmount: "",
      }));
      setAadhaarVerified(false);
      setOtp("");
      setShowOtpInput(false);
      setTxnId(null);
    }
  }, [editingTenant, location.state, isEdit]);

  // Pre-fill rentAmount when bedId changes (assuming beds have price; fallback to room price if not)
  useEffect(() => {
    const selectedBed = availableBeds.find(
      (bed) => bed.bedId === formData.bedId
    );
    const selectedRoom = availableRooms.find(
      (room) => room.roomId === formData.roomId
    );
    if (selectedBed) {
      const price = selectedBed.price ?? selectedRoom?.price;
      if (price) {
        setFormData((prev) => ({
          ...prev,
          rentAmount: price.toString(),
        }));
      }
    }
  }, [formData.bedId, availableBeds, availableRooms]);

  // Change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "aadhaar") {
      setAadhaarVerified(false);
      setShowOtpInput(false);
      setOtp("");
      setTxnId(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
        toast.success("Image selected successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    toast.success("Image removed successfully!");
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "name", label: "Full Name" },
      { field: "mobile", label: "Mobile" },
      { field: "aadhaar", label: "Aadhaar Number" },
      { field: "propertyId", label: "Property" },
      { field: "roomId", label: "Room" },
      { field: "bedId", label: "Bed" },
      { field: "moveInDate", label: "Move-in Date" },
      { field: "rentAmount", label: "Rent Amount" },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field]) {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    if (!aadhaarVerified) {
      toast.error("Aadhaar verification is required.");
      return false;
    }

    // Extra validation for propertyId as ObjectId
    if (!isValidObjectId(formData.propertyId)) {
      toast.error(
        "Selected property ID is invalid. Please choose a valid property."
      );
      return false;
    }

    if (!/^\d{12}$/.test(formData.aadhaar)) {
      toast.error("Aadhaar must be a 12-digit number.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Mobile must be a 10-digit number.");
      return false;
    }
    if (formData.fatherMobile && !/^\d{10}$/.test(formData.fatherMobile)) {
      toast.error("Father's mobile must be a 10-digit number.");
      return false;
    }
    if (formData.motherMobile && !/^\d{10}$/.test(formData.motherMobile)) {
      toast.error("Mother's mobile must be a 10-digit number.");
      return false;
    }
    // if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   toast.error("Please enter a valid email address.");
    //   return false;
    // }

    // Validate IDs
    if (!properties.some((prop) => prop.id === formData.propertyId)) {
      toast.error("Selected property is invalid.");
      return false;
    }
    if (!availableRooms.some((room) => room.roomId === formData.roomId)) {
      toast.error("Selected room is invalid.");
      return false;
    }
    if (!availableBeds.some((bed) => bed.bedId === formData.bedId)) {
      toast.error("Selected bed is invalid.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required! Please login.");
      navigate("/login");
      return;
    }

    if (isEdit && !editingTenant.id) {
      toast.error("Invalid tenant ID for editing.");
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email || null,
      aadhaar: formData.aadhaar,
      mobile: formData.mobile,
      permanentAddress: formData.permanentAddress || null,
      work: formData.work || null,
      dob: formData.dob || null,
      maritalStatus: formData.maritalStatus || null,
      fatherName: formData.fatherName || null,
      fatherMobile: formData.fatherMobile || null,
      motherName: formData.motherName || null,
      motherMobile: formData.motherMobile || null,
      photo: formData.photo || null,
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      bedId: formData.bedId || null,
      moveInDate: formData.moveInDate,
      rentAmount: Number(formData.rentAmount) || 0,
      securityDeposit: Number(formData.securityDeposit) || 0,
      noticePeriod: Number(formData.noticePeriod) || 0,
      agreementPeriod: Number(formData.agreementPeriod) || 0,
      agreementPeriodType: formData.agreementPeriodType || "months",
      rentOnDate: Number(formData.rentOnDate) || 0,
      rentDateOption: formData.rentDateOption || "fixed",
      rentalFrequency: formData.rentalFrequency || "Monthly",
      referredBy: formData.referredBy || null,
      remarks: formData.remarks || null,
      bookedBy: formData.bookedBy || null,
      electricityPerUnit: Number(formData.electricityPerUnit) || 0,
      initialReading: Number(formData.initialReading) || 0,
      finalReading: formData.finalReading
        ? Number(formData.finalReading)
        : null,
      initialReadingDate: formData.initialReadingDate || null,
      finalReadingDate: formData.finalReadingDate || null,
      electricityDueDescription: formData.electricityDueDescription || null,
      openingBalanceStartDate: formData.openingBalanceStartDate || null,
      openingBalanceEndDate: formData.openingBalanceEndDate || null,
      openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
    };

    try {
      const url = isEdit
        ? `https://api.gharzoreality.com/api/sub-owner/updateTenant/${editingTenant.id}`
        : "https://api.gharzoreality.com/api/sub-owner/addTenant";
      const response = await axios({
        method: isEdit ? "PUT" : "POST",
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: payload,
      });

      toast.success(
        response?.data?.message ||
          `Tenant ${isEdit ? "updated" : "added"} successfully!`
      );
      setFormData(initialFormData);
      setAadhaarVerified(false);
      setOtp("");
      setShowOtpInput(false);
      setTxnId(null);
      setTimeout(() => navigate("/sub_owner/dashboard"), 1200);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${isEdit ? "update" : "add"} tenant.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1 - Personal Details */}
        <Card
          title="Personal Details"
          icon={<FaUser />}
          iconColor="bg-indigo-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              icon={<FaUser />}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter tenant name"
            />
            <Input
              label="Email"
              icon={<FaEnvelope />}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            <Input
              label="Mobile"
              icon={<FaPhone />}
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit mobile number"
              pattern="\d{10}"
            />
            <div className="md:col-span-2 space-y-3">
             
              {!aadhaarVerified ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Enter Aadhaar Number"
                      icon={<FaIdCard />}
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        handleChange({ target: { name: "aadhaar", value } });
                      }}
                      placeholder="Enter 12-digit Aadhaar"
                      maxLength={12}
                    />
                    <button
                      type="button"
                      onClick={generateOtp}
                      disabled={!formData.aadhaar || formData.aadhaar.length !== 12}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-3 rounded-lg font-medium transition duration-200 flex items-center justify-center text-sm"
                    >
                      Generate OTP
                    </button>
                  </div>
                  {showOtpInput && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 6}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                  <span className="text-green-600 font-medium flex items-center">
                    <FaIdCard className="mr-1" /> ✓ Aadhaar Verified Successfully
                  </span>
                  <span className="text-sm text-gray-500">
                    ({formData.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")})
                  </span>
                </div>
              )}
            </div>
            <Input
              label="Date of Birth"
              icon={<FaCalendar />}
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
            <Select
              key="maritalStatus"
              label="Marital Status"
              icon={<FaUserFriends />}
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                { value: "", label: "Select marital status" },
                { value: "Unmarried", label: "Unmarried" },
                { value: "Married", label: "Married" },
                { value: "Others", label: "Others" },
              ]}
            />
            <Input
              label="Occupation"
              icon={<FaBriefcase />}
              name="work"
              value={formData.work}
              onChange={handleChange}
              placeholder="Enter work/profession"
            />
            <div className="md:col-span-2 relative group">
              <Label icon={<FaImage />} text="Tenant Photo" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-700 file:text-white hover:file:bg-indigo-800"
              />
              {formData.photo && (
                <div className="mt-3 relative group">
                  <img
                    src={formData.photo}
                    alt="Tenant"
                    className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200"
                  />
                  <motion.button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimesCircle size={16} />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Card 2 - Family Details */}
        <Card
          title="Family Details"
          icon={<FaUserFriends />}
          iconColor="bg-green-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Father's Name"
              icon={<FaMale />}
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
            />
            <Input
              label="Father's Mobile"
              icon={<FaPhone />}
              name="fatherMobile"
              value={formData.fatherMobile}
              onChange={handleChange}
              placeholder="Enter 10-digit father's mobile"
              pattern="\d{10}"
            />
            <Input
              label="Mother's Name"
              icon={<FaFemale />}
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
            />
            <Input
              label="Mother's Mobile"
              icon={<FaPhone />}
              name="motherMobile"
              value={formData.motherMobile}
              onChange={handleChange}
              placeholder="Enter 10-digit mother's mobile"
              pattern="\d{10}"
            />
          </div>
        </Card>

        {/* Card 3 - Address Details */}
        <Card
          title="Permanent Address"
          icon={<FaHome />}
          iconColor="bg-blue-600"
        >
          <Label icon={<FaMapMarkerAlt />} text="Address" />
          <textarea
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            rows={4}
            placeholder="Enter full permanent address"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
          />
        </Card>
        {/* {console.log(
          "Rendering form with propertyId:-----------",
          formData.propertyId,
          properties
        )} */}
        {/* Card 4 - Property Details */}
        <Card
          title="Property Details"
          icon={<FaHome />}
          iconColor="bg-purple-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              key="propertyId"
              label="Property"
              icon={<FaHome />}
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              options={[
                { value: "", label: "Select property" },
                ...properties.map((prop) => ({
                  value: prop.id, // Strictly use id as value (ObjectId)
                  label: prop.name || `Property ${prop?.name}...`, // Use name if available, fallback to truncated id
                })),
              ]}
              isLoading={isFetchingProperties}
              required
            />
          <Select
  key={`roomId-${formData.propertyId}`}
  label="Room"
  icon={<FaBed />}
  name="roomId"
  value={formData.roomId}
  onChange={handleChange}
  options={[
    { value: "", label: "Select room" },
    ...availableRooms.map((room) => ({
      value: room.roomId,           // yeh value ke liye chahiye (backend ko bhejne ke liye)
      label: room.name,             // sirf name dikhega dropdown mein
    })),
  ]}
  isLoading={isFetchingRooms}
  disabled={!formData.propertyId || isFetchingRooms}
  required
/>
            <Select
              key={`bedId-${formData.roomId}`}
              label="Bed"
              icon={<FaBed />}
              name="bedId"
              value={formData.bedId}
              onChange={handleChange}
              options={[
                { value: "", label: "Select bed" },
                ...availableBeds.map((bed) => ({
                  value: bed.bedId,
                  label: bed.name,
                })),
              ]}
              isLoading={isFetchingBeds}
              disabled={!formData.roomId || isFetchingBeds}
              required
            />
          </div>
        </Card>

        {/* Card 5 - Rental Terms */}
        <Card
          title="Rental Terms"
          icon={<FaFileContract />}
          iconColor="bg-orange-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Move-in Date"
              icon={<FaCalendar />}
              name="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Rent Amount (₹)"
              icon={<FaMoneyCheckAlt />}
              name="rentAmount"
              type="number"
              value={formData.rentAmount}
              onChange={handleChange}
              required
              placeholder="Enter monthly rent"
              min="0"
            />
            <Input
              label="Security Deposit (₹)"
              icon={<FaMoneyBillWave />}
              name="securityDeposit"
              type="number"
              value={formData.securityDeposit}
              onChange={handleChange}
              placeholder="Enter security deposit"
              min="0"
            />
            <Input
              label="Notice Period (days)"
              icon={<FaCalendar />}
              name="noticePeriod"
              type="number"
              value={formData.noticePeriod}
              onChange={handleChange}
              placeholder="Enter notice period"
              min="0"
            />
            <Input
              label="Agreement Period"
              icon={<FaFileContract />}
              name="agreementPeriod"
              type="number"
              value={formData.agreementPeriod}
              onChange={handleChange}
              placeholder="Enter agreement period"
              min="0"
            />
            <Select
              key="agreementPeriodType"
              label="Agreement Period Type"
              icon={<FaFileContract />}
              name="agreementPeriodType"
              value={formData.agreementPeriodType}
              onChange={handleChange}
              options={[
                { value: "", label: "Select period type" },
                { value: "months", label: "Months" },
                { value: "years", label: "Years" },
              ]}
            />
            <Input
              label="Rent Due Date"
              icon={<FaCalendar />}
              name="rentOnDate"
              type="number"
              value={formData.rentOnDate}
              onChange={handleChange}
              placeholder="Enter rent due date (1-31)"
              min="1"
              max="31"
            />
            <Select
              key="rentDateOption"
              label="Rent Date Option"
              icon={<FaCalendar />}
              name="rentDateOption"
              value={formData.rentDateOption}
              onChange={handleChange}
              options={[
                { value: "", label: "Select rent date option" },
                { value: "fixed", label: "Fixed" },
                { value: "flexible", label: "Flexible" },
              ]}
            />
            <Select
              key="rentalFrequency"
              label="Rental Frequency"
              icon={<FaMoneyCheckAlt />}
              name="rentalFrequency"
              value={formData.rentalFrequency}
              onChange={handleChange}
              options={[
                { value: "", label: "Select rental frequency" },
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
                { value: "Yearly", label: "Yearly" },
              ]}
            />
            <Input
              label="Referred By"
              icon={<FaUserFriends />}
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              placeholder="Enter referrer name"
            />
            <Input
              label="Booked By"
              icon={<FaUser />}
              name="bookedBy"
              value={formData.bookedBy}
              onChange={handleChange}
              placeholder="Enter booking source"
            />
            <div className="md:col-span-2">
              <Label icon={<FaFileContract />} text="Remarks" />
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any remarks"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
              />
            </div>
          </div>
        </Card>

        {/* Card 6 - Electricity Details */}
        <Card
          title="Electricity Details"
          icon={<FaBolt />}
          iconColor="bg-yellow-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Electricity Per Unit (₹)"
              icon={<FaBolt />}
              name="electricityPerUnit"
              type="number"
              value={formData.electricityPerUnit}
              onChange={handleChange}
              placeholder="Enter electricity rate per unit"
              min="0"
            />
            <Input
              label="Initial Reading"
              icon={<FaBolt />}
              name="initialReading"
              type="number"
              value={formData.initialReading}
              onChange={handleChange}
              placeholder="Enter initial meter reading"
              min="0"
            />
            <Input
              label="Initial Reading Date"
              icon={<FaCalendar />}
              name="initialReadingDate"
              type="date"
              value={formData.initialReadingDate}
              onChange={handleChange}
            />
            <Input
              label="Final Reading"
              icon={<FaBolt />}
              name="finalReading"
              type="number"
              value={formData.finalReading}
              onChange={handleChange}
              placeholder="Enter final meter reading"
              disabled={isEdit}
              min="0"
            />
            <Input
              label="Final Reading Date"
              icon={<FaCalendar />}
              name="finalReadingDate"
              type="date"
              value={formData.finalReadingDate}
              onChange={handleChange}
              disabled={isEdit}
            />
            <div className="md:col-span-2">
              <Label
                icon={<FaFileContract />}
                text="Electricity Due Description"
              />
              <textarea
                name="electricityDueDescription"
                value={formData.electricityDueDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Enter electricity due description"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
                disabled={isEdit}
              />
            </div>
          </div>
        </Card>

        {/* Card 7 - Opening Balance */}
        <Card
          title="Opening Balance"
          icon={<FaMoneyBillWave />}
          iconColor="bg-teal-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Opening Balance Start Date"
              icon={<FaCalendar />}
              name="openingBalanceStartDate"
              type="date"
              value={formData.openingBalanceStartDate}
              onChange={handleChange}
            />
            <Input
              label="Opening Balance End Date"
              icon={<FaCalendar />}
              name="openingBalanceEndDate"
              type="date"
              value={formData.openingBalanceEndDate}
              onChange={handleChange}
            />
            <Input
              label="Opening Balance Amount (₹)"
              icon={<FaMoneyBillWave />}
              name="openingBalanceAmount"
              type="number"
              value={formData.openingBalanceAmount}
              onChange={handleChange}
              placeholder="Enter opening balance amount"
              min="0"
            />
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-end gap-3 mt-8">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className={`inline-flex items-center bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading && <FaSpinner className="animate-spin mr-2" />}
            {isEdit ? "Update Tenant" : "Save Tenant"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

// Card component
const Card = ({ title, icon, iconColor, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white shadow-xl rounded-xl p-8 border border-gray-200"
  >
    <h4 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
      <span className={`p-2 rounded-lg ${iconColor} text-white`}>{icon}</span>
      {title}
    </h4>
    {children}
  </motion.div>
);

// Input component
const Input = ({ label, icon, ...props }) => (
  <div>
    <Label icon={icon} text={label} />
    <input
      {...props}
      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
      aria-label={label}
    />
  </div>
);

// Select component
const Select = ({ label, icon, options, isLoading, ...props }) => (
  <div className="relative">
    <Label icon={icon} text={label} />
    <div className="relative">
      <select
        {...props}
        className={`w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 text-base ${
          props.disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isLoading || props.disabled}
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// Label component
const Label = ({ icon, text }) => (
  <label className="block mb-1.5 font-medium flex items-center text-gray-700">
    <span className="mr-2 text-indigo-700">{icon}</span>
    {text}
  </label>
);

export default TenantForm;