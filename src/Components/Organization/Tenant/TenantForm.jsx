import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const TenantForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingTenant = location.state;
  const isEdit = Boolean(editingTenant);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [landlordId, setLandlordId] = useState(null);
  const [loadingLandlordId, setLoadingLandlordId] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("variable");
  const [fixedAmount, setFixedAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [selectedDues, setSelectedDues] = useState({});
  const [dues, setDues] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];
  // Aadhaar KYC states
  const [aadhaarNumber, setAadhaarNumber] = useState("");

  const [isCounting, setIsCounting] = useState(false);
const [secondsLeft, setSecondsLeft] = useState(0);


  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
  console.log("selected dues", selectedDues);
useEffect(() => {
  const fetchLandlordId = async () => {
    setLoadingLandlordId(true);
    const token = localStorage.getItem("orgToken");
    if (!token) {
      toast.error("No authentication token found. Please login again.");
      setLoadingLandlordId(false);
      return;
    }
    const storedLandlordId = localStorage.getItem("id");
    if (storedLandlordId) {
      setLandlordId(storedLandlordId);
      setLoadingLandlordId(false);
      return;
    }
    try {
      const response = await axios.get(
        "https://api.gharzoreality.com/api/organization/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Landlord profile response:", response.data);
      // ✅ Fix: Use 'id' instead of '_id'
      const fetchedLandlordId = response.data?.id;
      if (fetchedLandlordId) {
        setLandlordId(fetchedLandlordId);
        localStorage.setItem("id", fetchedLandlordId);
      } else {
        toast.error("Landlord ID not found in profile data.");
      }
    } catch (error) {
      toast.error(
        "Failed to fetch landlord ID: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoadingLandlordId(false);
    }
  };
  fetchLandlordId();
}, []);
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("orgToken");
        const response = await axios.get(
          "https://api.gharzoreality.com/api/landlord/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const propertiesData = response.data.properties || [];
        console.log("Fetched properties:", propertiesData);
        setProperties(propertiesData);
      } catch (error) {
        toast.error("Failed to fetch properties: " + (error.response?.data?.message || error.message));
      }
    };
    fetchProperties();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      if (!landlordId) return;
      const token = localStorage.getItem("orgToken");
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }
      try {
        const response = await axios.get(
          `https://api.gharzoreality.com/api/dues/alldues/${landlordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const categoryData = response.data?.dues 
  ? response.data.dues 
  : Array.isArray(response.data) 
    ? response.data 
    : [];
        const formattedCategories = categoryData.map((category) => ({
          _id: category._id,
          name: category.name,
          type: category.type,
          amount: category.type === "fixed" ? category.amount : "Variable",
          status: category.status,
        }));
        setCategories(formattedCategories);
        const initSelected = {};
        formattedCategories.forEach((cat) => {
          initSelected[cat._id] = {
            include: false,
            amount: cat.type === "fixed" ? cat.amount : "",
            dueDate: formData.moveInDate || new Date().toISOString().split("T")[0],
          };
        });
        setSelectedDues(initSelected);
      } catch (error) {
        toast.error("Failed to fetch due categories: " + (error.response?.data?.message || error.message));
      }
    };
    if (landlordId) fetchCategories();
  }, [landlordId, formData.moveInDate]);
  useEffect(() => {
    const fetchAssignedDues = async () => {
      if (!isEdit || !editingTenant?.id) return;
      const token = localStorage.getItem("orgToken");
      if (!token) return;
      try {
        const response = await axios.get(
          `https://api.gharzoreality.com/api/dues/tenant/${editingTenant.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const dueData = Array.isArray(response.data.dues) ? response.data.dues : [];
        setDues(
          dueData.map((d) => ({
            category: d.name,
            amount: d.amount,
            dueDate: d.dueDate,
            status: d.status,
          }))
        );
        const updatedSelected = { ...selectedDues };
        dueData.forEach((d) => {
          if (updatedSelected[d.dueId]) {
            updatedSelected[d.dueId] = {
              include: true,
              amount: d.amount,
              dueDate: d.dueDate.split("T")[0],
            };
          }
        });
        setSelectedDues(updatedSelected);
      } catch (error) {
        toast.error("Failed to fetch assigned dues: " + (error.response?.data?.message || error.message));
      }
    };
    if (categories.length > 0) fetchAssignedDues();
  }, [isEdit, editingTenant, categories]);
  useEffect(() => {
    if (editingTenant) {
      const sanitizedTenant = {
        name: editingTenant.name ?? "",
        email: editingTenant.email ?? "",
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
      };
      setFormData(sanitizedTenant);
      setAadhaarNumber(editingTenant.aadhaar || "");
      setAadhaarVerified(!!editingTenant.aadhaar);
    } else if (location.state?.propertyTitle) {
      setFormData((prev) => ({
        ...prev,
        propertyId: location.state.propertyId || "",
        roomId: "",
        bedId: "",
      }));
    }
  }, [editingTenant, location.state]);
  useEffect(() => {
    const fetchAvailableBeds = async () => {
      setAvailableBeds([]);
      if (!formData.propertyId || !formData.roomId) return;
      const token = localStorage.getItem("orgToken");
      if (!token) return;
      try {
        const res = await axios.get(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}/available-beds`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAvailableBeds(res.data?.beds || []);
      } catch (error) {
        setAvailableBeds([]);
      }
    };
    fetchAvailableBeds();
  }, [formData.propertyId, formData.roomId]);
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      setAvailableRooms([]);
      if (!formData.propertyId) return;
      const token = localStorage.getItem("orgToken");
      if (!token) return;
      try {
        const res = await axios.get(
          `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/available`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAvailableRooms(res.data?.rooms || []);
      } catch (error) {
        setAvailableRooms([]);
      }
    };
    fetchAvailableRooms();
  }, [formData.propertyId]);

  useEffect(() => {
  if (!isCounting) return;
// ------------------------------------------------------------------
  const timer = setInterval(() => {
    setSecondsLeft(prev => {
      if (prev <= 1) {
        // countdown खत्म — साफ़ करो और disable हटाओ
        clearInterval(timer);
        setIsCounting(false);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
//-----------------------------------------------------------------------
  // cleanup अगर component unmount हो या dependency बदले
  return () => clearInterval(timer);
}, [isCounting]);

  // Generate Aadhaar OTP
  const generateOtp = async (e) => {
  e.preventDefault();

  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    toast.error("Valid 12-digit Aadhaar number is required");
    return;
  }

  try {
    const res = await axios.post(
      "https://api.gharzoreality.com/api/kyc/aadhaar/generate-otp",
      { aadhaarNumber },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data.success) {
      setTxnId(res.data.txnId);
      setShowOtpInput(true);
      toast.success(res.data.message);

      // ⭐⭐⭐ Added for countdown
      setSecondsLeft(30);
      setIsCounting(true);
      // ⭐⭐⭐
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
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : prev.dob,
          permanentAddress: [
            data.address?.street || data.address?.landmark || "",
            data.address?.city || data.address?.po || data.address?.loc || data.address?.subdist || data.address?.vtc || "",
            data.address?.state || "",
            data.address?.country || "India",
            data.zip || ""
          ].filter(Boolean).join(", ") || prev.permanentAddress,
        }));
        setAadhaarVerified(true);
        setShowOtpInput(false);
        setOtp("");
        setAadhaarNumber(data.aadhaar_number || aadhaarNumber);
        toast.success(res.data.message);
      } else {
        toast.error("Failed to verify OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Error verifying OTP");
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let errorMsg = "";
    // Full Name validation (show error immediately)
    if (name === "name") {
      if (value.trim().split(/\s+/).length < 2) {
        errorMsg = "Please enter both first and last name.";
      }
    }
    // Father's Name validation (show error immediately)
    if (name === "fatherName") {
      if (!value.trim()) {
        errorMsg = "Father's name is required.";
      } else if (formData.motherName && value.trim() === formData.motherName.trim()) {
        errorMsg = "Father's and Mother's name must be different.";
      }
    }
    // Mother's Name validation (show error immediately)
    if (name === "motherName") {
      if (!value.trim()) {
        errorMsg = "Mother's name is required.";
      } else if (formData.fatherName && value.trim() === formData.fatherName.trim()) {
        errorMsg = "Father's and Mother's name must be different.";
      }
    }
    // Father's Mobile validation (show error immediately)
    if (name === "fatherMobile") {
      newValue = value.replace(/\D/g, '').slice(0, 10);
      if (!/^\d{10}$/.test(newValue)) {
        errorMsg = "Father's mobile must be exactly 10 digits.";
      } else if (formData.motherMobile && newValue === formData.motherMobile) {
        errorMsg = "Father's and Mother's mobile numbers must be different.";
      }
    }
    // Mother's Mobile validation (show error immediately)
    if (name === "motherMobile") {
      newValue = value.replace(/\D/g, '').slice(0, 10);
      if (!/^\d{10}$/.test(newValue)) {
        errorMsg = "Mother's mobile must be exactly 10 digits.";
      } else if (formData.fatherMobile && newValue === formData.fatherMobile) {
        errorMsg = "Father's and Mother's mobile numbers must be different.";
      }
    }
    // Mobile validation
    if (name === "mobile") {
      newValue = value.replace(/\D/g, '').slice(0, 10);
      if (!/^\d{10}$/.test(newValue)) {
        errorMsg = "Mobile must be exactly 10 digits.";
      }
    }
    if (name === "work") {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        errorMsg = "Work/Profession should contain only letters.";
        return;
      }
    }
    if (name === "permanentAddress") {
      if (!/^[a-zA-Z0-9\s,.-]*$/.test(value)) {
        errorMsg = "Permanent address must contain only letters, numbers, ,.-";
        return;
      }
      if (!isValidPermanentAddress(value)) {
        errorMsg = "Permanent address must contain both letters and numbers.";
      }
    }
    if (name === "dob") {
      if (!isValidDOB(value)) {
        errorMsg = "Please enter a valid date of birth (not in future, not 2025 or later).";
      }
    }
    if (name === "moveInDate") {
      if (value && value < today) {
        errorMsg = "Move-in date cannot be in the past.";
      }
    }
    if (name === "initialReadingDate") {
      if (value && value < today) {
        errorMsg = "Initial reading date cannot be in the past.";
      }
    }
    if (name === "finalReadingDate") {
      if (value && value < today) {
        errorMsg = "Final reading date cannot be in the past.";
      } else if (value && formData.initialReadingDate && value < formData.initialReadingDate) {
        errorMsg = "Final reading date must be after initial reading date.";
      }
    }
    if (name === "openingBalanceStartDate") {
      if (value && value < today) {
        errorMsg = "Opening balance start date cannot be in the past.";
      }
    }
    if (name === "openingBalanceEndDate") {
      if (value && value < today) {
        errorMsg = "Opening balance end date cannot be in the past.";
      } else if (value && formData.openingBalanceStartDate && value < formData.openingBalanceStartDate) {
        errorMsg = "Opening balance end date must be after start date.";
      }
    }
    // if (name === "email") {
    //   if (!/^[^\s@]+@gmail\.com$/i.test(value.trim())) {
    //     errorMsg = "Please enter a valid Gmail address.";
    //   }
    // }
    if (name === "maritalStatus") {
      if (!value) {
        errorMsg = "Marital status is required.";
      }
    }
    if (name === "noticePeriod") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 0) {
        errorMsg = "Valid notice period is required.";
      }
    }
    if (name === "agreementPeriod") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 0) {
        errorMsg = "Valid agreement period is required.";
      }
    }
    if (name === "rentOnDate") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 1 || num > 31) {
        errorMsg = "Valid rent due date (1-31) is required.";
      }
    }
    if (name === "electricityPerUnit") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 0) {
        errorMsg = "Valid electricity per unit is required.";
      }
    }
    if (name === "initialReading") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 0) {
        errorMsg = "Valid initial reading is required.";
      }
    }
    if (name === "finalReading") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 0) {
        errorMsg = "Valid final reading is required.";
      } else if (value && formData.initialReading && num < Number(formData.initialReading)) {
        errorMsg = "Final reading must be greater than or equal to initial reading.";
      }
    }
    if (name === "openingBalanceAmount") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 0) {
        errorMsg = "Valid opening balance amount is required.";
      }
    }
    if (name === "referredBy" || name === "remarks" || name === "bookedBy" || name === "electricityDueDescription") {
      if (!value.trim()) {
        errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required.`;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
    // Do NOT show toast here, only show error visually below the field
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
        setFieldErrors((prev) => ({ ...prev, photo: "" }));
        toast.success("Image selected successfully!");
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setFieldErrors((prev) => ({ ...prev, photo: "Tenant photo is required." }));
    toast.success("Image removed successfully!");
  };
  const handleAddCategoryClick = () => {
    setIsSidebarOpen(true);
    setCategoryName("");
    setCategoryType("variable");
    setFixedAmount("");
    setSelectedCategory(null);
  };
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setFixedAmount("");
    setCategoryName("");
    setSelectedCategory(null);
  };
  const handleTypeChange = (type) => {
    setCategoryType(type);
    if (type === "variable") setFixedAmount("");
  };
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      toast.error("Please enter a due type name.");
      return;
    }
    if (categoryType === "fixed" && !fixedAmount) {
      toast.error("Please enter a fixed amount.");
      return;
    }
    if (!landlordId) {
      toast.error("Landlord ID is missing. Please log in again.");
      return;
    }
    const token = localStorage.getItem("orgToken");
    if (!token) {
      toast.error("No authentication token found. Please login again.");
      return;
    }
    try {
      if (selectedCategory) {
        await axios.put(
          `https://api.gharzoreality.com/api/dues/edit/${selectedCategory._id}`,
          {
            name: categoryName,
            type: categoryType,
            ...(categoryType === "fixed" && { amount: parseFloat(fixedAmount) }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category updated successfully!");
      } else {
        await axios.post(
          "https://api.gharzoreality.com/api/dues/create",
          {
            name: categoryName,
            type: categoryType,
            landlordId: landlordId,
            ...(categoryType === "fixed" && { amount: parseFloat(fixedAmount) }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category added successfully!");
      }
      const response = await axios.get(
        `https://api.gharzoreality.com/api/dues/alldues/${landlordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const categoryData = response.data?.dues 
  ? response.data.dues 
  : Array.isArray(response.data) 
    ? response.data 
    : [];
      const formattedCategories = categoryData.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        amount: category.type === "fixed" ? category.amount : "Variable",
        status: category.status,
      }));
      setCategories(formattedCategories);
      const updatedSelected = { ...selectedDues };
      formattedCategories.forEach((cat) => {
        if (!updatedSelected[cat._id]) {
          updatedSelected[cat._id] = {
            include: false,
            amount: cat.type === "fixed" ? cat.amount : "",
            dueDate: formData.moveInDate || new Date().toISOString().split("T")[0],
          };
        }
      });
      setSelectedDues(updatedSelected);
      handleCloseSidebar();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${selectedCategory ? "update" : "add"} category. Please try again.`
      );
    }
  };
  const handleToggle = async (categoryId) => {
    const token = localStorage.getItem("orgToken");
    if (!token) {
      toast.error("No authentication token found. Please login again.");
      return;
    }
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;
    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axios.put(
        `https://api.gharzoreality.com/api/dues/edit/${categoryId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Category status updated successfully!");
      const response = await axios.get(
        `https://api.gharzoreality.com/api/dues/alldues/${landlordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const categoryData = response.data?.dues 
  ? response.data.dues 
  : Array.isArray(response.data) 
    ? response.data 
    : [];
      const formattedCategories = categoryData.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        amount: category.type === "fixed" ? category.amount : "Variable",
        status: category.status,
      }));
      setCategories(formattedCategories);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update category status. Please try again."
      );
    }
  };
  const handleEdit = (category) => {
    setIsSidebarOpen(true);
    setCategoryName(category.name);
    setCategoryType(category.type);
    if (category.type === "fixed") setFixedAmount(category.amount);
    setSelectedCategory(category);
    setShowOptions(null);
  };
  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }
      try {
        await axios.delete(
          `https://api.gharzoreality.com/api/dues/delete/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Due category deleted successfully!");
        const response = await axios.get(
          `https://api.gharzoreality.com/api/dues/alldues/${landlordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const categoryData = Array.isArray(response.data) ? response.data : [];
        const formattedCategories = categoryData.map((category) => ({
          _id: category._id,
          name: category.name,
          type: category.type,
          amount: category.type === "fixed" ? category.amount : "Variable",
          status: category.status,
        }));
        setCategories(formattedCategories);
        const updatedSelected = { ...selectedDues };
        delete updatedSelected[categoryId];
        setSelectedDues(updatedSelected);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete category. Please try again."
        );
      }
    }
  };
  const handleDueChange = (categoryId, field, value) => {
    setSelectedDues((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value,
      },
    }));
  };
  const validateForm = () => {
    let hasError = false;
    let errors = {};
    if (!formData.name.trim() || formData.name.trim().split(/\s+/).length < 2) {
      errors.name = "Please enter both first and last name.";
      hasError = true;
    }
    // if (!formData.email.trim() || !/^[^\s@]+@gmail\.com$/i.test(formData.email.trim())) {
    //   errors.email = "Please enter a valid Gmail address .";
    //   hasError = true;
    // }
    if (!aadhaarVerified) {
      errors.aadhaar = "Aadhaar verification is required";
      hasError = true;
    }
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = "Mobile must be exactly 10 digits.";
      hasError = true;
    }
    if (!formData.permanentAddress.trim() || !isValidPermanentAddress(formData.permanentAddress.trim())) {
      errors.permanentAddress = "Permanent address must contain both letters and numbers.";
      hasError = true;
    }
    if (!formData.work.trim() || !isValidWork(formData.work.trim())) {
      errors.work = "Work/Profession should contain only letters.";
      hasError = true;
    }
    if (!formData.dob || !isValidDOB(formData.dob)) {
      errors.dob = "Please enter a valid date of birth (not in future, not 2025 or later).";
      hasError = true;
    }
    if (!formData.maritalStatus) {
      errors.maritalStatus = "Marital status is required.";
      hasError = true;
    }
    if (!formData.fatherName.trim()) {
      errors.fatherName = "Father's name is required.";
      hasError = true;
    }
    if (!formData.fatherMobile || !/^\d{10}$/.test(formData.fatherMobile)) {
      errors.fatherMobile = "Father's mobile must be exactly 10 digits.";
      hasError = true;
    }
    if (!formData.motherName.trim()) {
      errors.motherName = "Mother's name is required.";
      hasError = true;
    }
    if (!formData.motherMobile || !/^\d{10}$/.test(formData.motherMobile)) {
      errors.motherMobile = "Mother's mobile must be exactly 10 digits.";
      hasError = true;
    }
    if (formData.fatherName.trim() === formData.motherName.trim() && formData.fatherName.trim()) {
      errors.fatherName = "Father's and Mother's name must be different.";
      errors.motherName = "Father's and Mother's name must be different.";
      hasError = true;
    }
    if (formData.fatherMobile === formData.motherMobile && formData.fatherMobile) {
      errors.fatherMobile = "Father's and Mother's mobile numbers must be different.";
      errors.motherMobile = "Father's and Mother's mobile numbers must be different.";
      hasError = true;
    }
    if (!formData.photo) {
      errors.photo = "Tenant photo is required.";
      hasError = true;
    }
    if (!formData.propertyId || properties.length === 0) {
      errors.propertyId = "Property is required.";
      hasError = true;
    }
    if (formData.propertyId && availableRooms.length === 0) {
      errors.roomId = "No available rooms. Please add rooms before adding tenant.";
      hasError = true;
    }
    if (!formData.roomId) {
      errors.roomId = "Room is required.";
      hasError = true;
    }
    if (formData.roomId && availableBeds.length === 0) {
      errors.bedId = "No available beds. Please add beds before adding tenant.";
      hasError = true;
    }
    if (!formData.bedId) {
      errors.bedId = "Bed is required.";
      hasError = true;
    }
    if (!formData.moveInDate) {
      errors.moveInDate = "Move-in date is required.";
      hasError = true;
    } else if (formData.moveInDate < today) {
      errors.moveInDate = "Move-in date cannot be in the past.";
      hasError = true;
    }
    const noticeNum = Number(formData.noticePeriod);
    if (!formData.noticePeriod || isNaN(noticeNum) || noticeNum < 0) {
      errors.noticePeriod = "Valid notice period is required.";
      hasError = true;
    }
    const agreementNum = Number(formData.agreementPeriod);
    if (!formData.agreementPeriod || isNaN(agreementNum) || agreementNum < 0) {
      errors.agreementPeriod = "Valid agreement period is required.";
      hasError = true;
    }
    if (!formData.agreementPeriodType) {
      errors.agreementPeriodType = "Agreement period type is required.";
      hasError = true;
    }
    const rentNum = Number(formData.rentOnDate);
    if (!formData.rentOnDate || isNaN(rentNum) || rentNum < 1 || rentNum > 31) {
      errors.rentOnDate = "Valid rent due date (1-31) is required.";
      hasError = true;
    }
    if (!formData.rentDateOption) {
      errors.rentDateOption = "Rent date option is required.";
      hasError = true;
    }
    if (!formData.rentalFrequency) {
      errors.rentalFrequency = "Rental frequency is required.";
      hasError = true;
    }
    if (!formData.referredBy.trim()) {
      errors.referredBy = "Referred by is required.";
      hasError = true;
    }
    if (!formData.remarks.trim()) {
      errors.remarks = "Remarks are required.";
      hasError = true;
    }
    if (!formData.bookedBy.trim()) {
      errors.bookedBy = "Booked by is required.";
      hasError = true;
    }
    const elecNum = Number(formData.electricityPerUnit);
    if (!formData.electricityPerUnit || isNaN(elecNum) || elecNum < 0) {
      errors.electricityPerUnit = "Valid electricity per unit is required.";
      hasError = true;
    }
    const initReadNum = Number(formData.initialReading);
    if (!formData.initialReading || isNaN(initReadNum) || initReadNum < 0) {
      errors.initialReading = "Valid initial reading is required.";
      hasError = true;
    }
    const finalReadNum = Number(formData.finalReading);
    if (!formData.finalReading || isNaN(finalReadNum) || finalReadNum < 0) {
      errors.finalReading = "Valid final reading is required.";
      hasError = true;
    } else if (formData.initialReading && finalReadNum < initReadNum) {
      errors.finalReading = "Final reading must be greater than or equal to initial reading.";
      hasError = true;
    }
    if (!formData.initialReadingDate) {
      errors.initialReadingDate = "Initial reading date is required.";
      hasError = true;
    } else if (formData.initialReadingDate < today) {
      errors.initialReadingDate = "Initial reading date cannot be in the past.";
      hasError = true;
    }
    if (!formData.finalReadingDate) {
      errors.finalReadingDate = "Final reading date is required.";
      hasError = true;
    } else if (formData.finalReadingDate < today) {
      errors.finalReadingDate = "Final reading date cannot be in the past.";
      hasError = true;
    } else if (formData.initialReadingDate && formData.finalReadingDate < formData.initialReadingDate) {
      errors.finalReadingDate = "Final reading date must be after initial reading date.";
      hasError = true;
    }
    if (!formData.electricityDueDescription.trim()) {
      errors.electricityDueDescription = "Electricity due description is required.";
      hasError = true;
    }
    if (!formData.openingBalanceStartDate) {
      errors.openingBalanceStartDate = "Opening balance start date is required.";
      hasError = true;
    } else if (formData.openingBalanceStartDate < today) {
      errors.openingBalanceStartDate = "Opening balance start date cannot be in the past.";
      hasError = true;
    }
    if (!formData.openingBalanceEndDate) {
      errors.openingBalanceEndDate = "Opening balance end date is required.";
      hasError = true;
    } else if (formData.openingBalanceEndDate < today) {
      errors.openingBalanceEndDate = "Opening balance end date cannot be in the past.";
      hasError = true;
    } else if (formData.openingBalanceStartDate && formData.openingBalanceEndDate < formData.openingBalanceStartDate) {
      errors.openingBalanceEndDate = "Opening balance end date must be after start date.";
      hasError = true;
    }
    const openBalNum = Number(formData.openingBalanceAmount);
    if (!formData.openingBalanceAmount || isNaN(openBalNum) || openBalNum < 0) {
      errors.openingBalanceAmount = "Valid opening balance amount is required.";
      hasError = true;
    }
    setFieldErrors(errors);
    if (hasError) {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error("Please correct the errors in the form before submitting.");
      return false;
    }
    return true;
  };
  const assignDues = async (tenantId, token) => {
    const toAssign = Object.entries(selectedDues).filter(([_, data]) => data.include);
    if (toAssign.length === 0) {
      console.log("No dues selected for assignment.");
      toast.info("No dues selected for assignment.");
      return;
    }
    const assignedDues = [];
    for (const [dueId, data] of toAssign) {
      if (!data.amount || parseFloat(data.amount) <= 0 || !data.dueDate) {
        console.error(`Invalid due data for dueId ${dueId}:`, data);
        toast.error(`Invalid data for due ${categories.find((cat) => cat._id === dueId)?.name || dueId}. Skipping.`);
        continue;
      }
      try {
        console.log(`Assigning due ${dueId} for tenant ${tenantId} with amount ${data.amount} and dueDate ${data.dueDate}`);
        const response = await axios.post(
          "https://api.gharzoreality.com/api/dues/assign",
          {
            tenantId,
            landlordId,
            dueId,
            amount: parseFloat(data.amount),
            dueDate: data.dueDate,
            isActive: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
console.log(`Response for due ${dueId}:`, response.data);
        if (response.data ) {
          assignedDues.push({
            category: categories.find((cat) => cat._id === dueId)?.name || "Unknown",
            amount: response.data.amount,
            dueDate: response.data.dueDate,
            status: response.data.status || "PENDING",
          });
          console.log(`Successfully assigned due ${dueId}:`, response.data);
        } else {
          console.error(`Unexpected response for due ${dueId}:`, response.data);
          toast.error(`Unexpected response when assigning due ${categories.find((cat) => cat._id === dueId)?.name || dueId}.`);
        }
      } catch (error) {
        console.error(`Failed to assign due ${dueId}:`, error.response?.data || error.message);
        toast.error(
          `Failed to assign due ${categories.find((cat) => cat._id === dueId)?.name || dueId}: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
    if (assignedDues.length > 0) {
      setDues((prev) => [...prev, ...assignedDues]);
      toast.success(`${assignedDues.length} due(s) assigned successfully!`);
    } else {
      toast.warn("No dues were assigned due to errors.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem("orgToken");
    if (!token) {
      toast.error("Authentication required! Please login again.");
      setIsLoading(false);
      return;
    }
    const payload = {
      name: formData.name,
      email: formData.email,
      aadhaar: aadhaarNumber,
      mobile: formData.mobile,
      permanentAddress: formData.permanentAddress,
      work: formData.work,
      dob: formData.dob,
      maritalStatus: formData.maritalStatus,
      fatherName: formData.fatherName,
      fatherMobile: formData.fatherMobile,
      motherName: formData.motherName,
      motherMobile: formData.motherMobile,
      photo: formData.photo,
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      bedId: formData.bedId,
      room: formData.roomId,
      checkInDate: formData.moveInDate,
      noticePeriod: Number(formData.noticePeriod) || 0,
      agreementPeriod: Number(formData.agreementPeriod) || 0,
      agreementPeriodType: formData.agreementPeriodType,
      rentOnDate: Number(formData.rentOnDate) || 0,
      rentDateOption: formData.rentDateOption,
      rentalFrequency: formData.rentalFrequency,
      referredBy: formData.referredBy,
      remarks: formData.remarks,
      bookedBy: formData.bookedBy,
      dues: selectedDues,
      electricityPerUnit: Number(formData.electricityPerUnit) || 0,
      initialReading: Number(formData.initialReading) || 0,
      finalReading: formData.finalReading ? Number(formData.finalReading) : null,
      initialReadingDate: formData.initialReadingDate || null,
      finalReadingDate: formData.finalReadingDate || null,
      electricityDueDescription: formData.electricityDueDescription || null,
      openingBalanceStartDate: formData.openingBalanceStartDate || null,
      openingBalanceEndDate: formData.openingBalanceEndDate || null,
      openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
    };
    try {
      console.log("Submitting tenant data:", JSON.stringify(payload, null, 2));
      const response = await axios({
        method: isEdit ? "PUT" : "POST",
        url: `https://api.gharzoreality.com/api/landlord/tenant${isEdit ? `/${editingTenant.id}` : ""}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: payload,
      });
      console.log("Tenant API response:", JSON.stringify(response.data, null, 2));
      toast.success(
        response?.data?.message ||
          `Tenant ${isEdit ? "updated" : "created"} successfully!`
      );
      let tenantId;
      if (isEdit) {
        tenantId = editingTenant.id;
      } else {
        tenantId =
          response.data?.tenant?.tenantId ||
          response.data?._id ||
          response.data?.id ||
          (response.data?.data && typeof response.data.data === 'object' ? response.data.data._id : null);
      }
      if (!tenantId) {
        console.error("Tenant ID not found in response:", response.data);
        toast.error("Tenant ID not found in response. Dues assignment skipped.");
        setIsLoading(false);
        return;
      }
      console.log("Tenant ID extracted:", tenantId);
      await assignDues(tenantId, token);
      if (formData.propertyId && formData.roomId && formData.bedId) {
        try {
          await axios.put(
            `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}/beds/${formData.bedId}/status`,
            {
              status: "Reserved",
              notes: "Bed reserved for tenant assignment",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const res = await axios.get(
            `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}/available-beds`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setAvailableBeds(res.data?.beds || []);
          const allBedsRes = await axios.get(
            `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const allBeds = allBedsRes.data?.room?.beds || [];
          const allReserved = allBeds.length > 0 && allBeds.every(bed => bed.status === "Reserved");
          if (allReserved) {
            await axios.put(
              `https://api.gharzoreality.com/api/landlord/properties/${formData.propertyId}/rooms/${formData.roomId}/status`,
              {
                status: "Reserved",
                notes: "All beds reserved, room reserved automatically",
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        } catch (bedErr) {
          toast.error("Failed to reserve bed/room: " + (bedErr.response?.data?.message || bedErr.message));
        }
      }
      if (!isEdit) {
        setFormData({
          name: "",
          email: "",
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
        setSelectedDues({});
      }
      setTimeout(() => navigate("/organization/tenant-list"), 1200);
    } catch (error) {
      console.error("Tenant submission error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} tenant. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mt-10 mb-10 mx-auto px-4 py-8 bg-gray-100 min-h-screen">
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
        <Card title="Personal Details" icon={<FaUser />} iconColor="bg-indigo-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name *"
              icon={<FaUser />}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter first and last name"
              fieldErrors={fieldErrors}
            />
            <Input
              label="Email *"
              icon={<FaEnvelope />}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter Gmail address"
              fieldErrors={fieldErrors}
            />
            <MobileInput
              label="Mobile *"
              icon={<FaPhone />}
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit mobile number"
              fieldErrors={fieldErrors}
            />
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-gray-800 font-semibold">Aadhaar Verification</h3>
              {!aadhaarVerified ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      placeholder="Enter 12-digit Aadhaar Number"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={12}
                      className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                   <button
  type="button"
  onClick={generateOtp}
  disabled={!aadhaarNumber || aadhaarNumber.length !== 12 || isCounting}
  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition duration-200"
>
  {isCounting ? `Wait ${secondsLeft}s` : "Generate OTP"}
</button>

                  </div>
                  {showOtpInput && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 6}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition duration-200"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-100 border border-green-200 rounded-lg">
                  <span className="text-green-800 font-medium">✓ Aadhaar Verified Successfully</span>
                  <span className="text-sm text-gray-600">({aadhaarNumber})</span>
                </div>
              )}
              {fieldErrors.aadhaar && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.aadhaar}</div>
              )}
            </div>
            <Input
              label="Date of Birth *"
              icon={<FaCalendar />}
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              required
              fieldErrors={fieldErrors}
            />
            <Select
              label="Marital Status *"
              icon={<FaUserFriends />}
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                { value: "Unmarried", label: "Unmarried" },
                { value: "Married", label: "Married" },
                { value: "Other", label: "Other" },
              ]}
              fieldErrors={fieldErrors}
              required
            />
            <Input
              label="Occupation *"
              icon={<FaBriefcase />}
              name="work"
              value={formData.work}
              onChange={handleChange}
              required
              placeholder="Enter work/profession (letters only)"
              fieldErrors={fieldErrors}
            />
            <div className="md:col-span-2 relative group">
              <Label icon={<FaImage />} text="Tenant Photo *" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-700 file:text-white hover:file:bg-indigo-800"
              />
              {fieldErrors.photo && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.photo}</div>
              )}
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
        <Card
          title="Family Details"
          icon={<FaUserFriends />}
          iconColor="bg-green-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Father's Name *"
              icon={<FaMale />}
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              required
              placeholder="Enter father's name"
              fieldErrors={fieldErrors}
            />
            <MobileInput
              label="Father's Mobile *"
              icon={<FaPhone />}
              name="fatherMobile"
              value={formData.fatherMobile}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit father's mobile"
              fieldErrors={fieldErrors}
            />
            <Input
              label="Mother's Name *"
              icon={<FaFemale />}
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              required
              placeholder="Enter mother's name"
              fieldErrors={fieldErrors}
            />
            <MobileInput
              label="Mother's Mobile *"
              icon={<FaPhone />}
              name="motherMobile"
              value={formData.motherMobile}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit mother's mobile"
              fieldErrors={fieldErrors}
            />
          </div>
        </Card>
        <Card title="Permanent Address" icon={<FaHome />} iconColor="bg-blue-600">
          <Label icon={<FaMapMarkerAlt />} text="Address *" />
          <textarea
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            rows={4}
            placeholder="Enter full permanent address"
            required
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
          />
          {fieldErrors.permanentAddress && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.permanentAddress}</div>
          )}
        </Card>
        <Card
          title="Property Details"
          icon={<FaHome />}
          iconColor="bg-purple-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Property *"
              icon={<FaHome />}
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              options={properties.map((prop) => ({
                value: prop._id,
                label: prop.name || prop.propertyId || prop._id,
              }))}
              isLoading={properties.length === 0}
              required
              fieldErrors={fieldErrors}
            />
            <Select
              label="Available Room *"
              icon={<FaBed />}
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              options={
                availableRooms.map((room) => ({
                  value: room.roomId,
                  label: `${room.name || 'Unnamed'}`,
                }))
              }
              isLoading={false}
              disabled={
                !formData.propertyId ||
                (availableRooms.length === 0)
              }
              required
              fieldErrors={fieldErrors}
            />
            <Select
              label="Available Bed *"
              icon={<FaBed />}
              name="bedId"
              value={formData.bedId}
              onChange={handleChange}
              options={
                availableBeds.length > 0
                  ? availableBeds.map((bed) => ({
                      value: bed.bedId,
                      label: `${bed.name}`,
                    }))
                  : [{ value: "", label: "No beds available" }]
              }
              isLoading={false}
              disabled={
                !formData.roomId || availableBeds.length === 0
              }
              required
              fieldErrors={fieldErrors}
            />
          </div>
        </Card>
        <Card
          title="Rental Terms"
          icon={<FaFileContract />}
          iconColor="bg-orange-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Check-in Date *"
              icon={<FaCalendar />}
              name="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={handleChange}
              required
              min={today}
              fieldErrors={fieldErrors}
            />
            <Input
              label="Notice Period (days) *"
              icon={<FaCalendar />}
              name="noticePeriod"
              type="number"
              value={formData.noticePeriod}
              onChange={handleChange}
              placeholder="Enter notice period"
              min={0}
              required
              fieldErrors={fieldErrors}
            />
            <Input
              label="Agreement Period *"
              icon={<FaFileContract />}
              name="agreementPeriod"
              type="number"
              value={formData.agreementPeriod}
              onChange={handleChange}
              placeholder="Enter agreement period"
              min={0}
              required
              fieldErrors={fieldErrors}
            />
            <Select
              label="Agreement Period Type *"
              icon={<FaFileContract />}
              name="agreementPeriodType"
              value={formData.agreementPeriodType}
              onChange={handleChange}
              options={[
                { value: "months", label: "Months" },
                { value: "years", label: "Years" },
              ]}
              required
              fieldErrors={fieldErrors}
            />
            <Input
              label="Rent Due Date *"
              icon={<FaCalendar />}
              name="rentOnDate"
              type="number"
              value={formData.rentOnDate}
              onChange={handleChange}
              placeholder="Enter rent due date (1-31)"
              min={1}
              max={31}
              required
              fieldErrors={fieldErrors}
            />
            <Select
              label="Rent Date Option *"
              icon={<FaCalendar />}
              name="rentDateOption"
              value={formData.rentDateOption}
              onChange={handleChange}
              options={[
                { value: "fixed", label: "Fixed" },
                { value: "joining", label: "Joining" },
                { value: "month_end", label: "Month End" },
              ]}
              required
              fieldErrors={fieldErrors}
            />
            <Select
              label="Rental Frequency *"
              icon={<FaMoneyCheckAlt />}
              name="rentalFrequency"
              value={formData.rentalFrequency}
              onChange={handleChange}
              options={[
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
                { value: "Half-Yearly", label: "Half-Yearly" },
                { value: "Yearly", label: "Yearly" },
              ]}
              required
              fieldErrors={fieldErrors}
            />
            <Input
              label="Referred By *"
              icon={<FaUserFriends />}
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              required
              placeholder="Enter referrer name"
              fieldErrors={fieldErrors}
            />
            <Input
              label="Booked By *"
              icon={<FaUser />}
              name="bookedBy"
              value={formData.bookedBy}
              onChange={handleChange}
              required
              placeholder="Enter booking source"
              fieldErrors={fieldErrors}
            />
            <div className="md:col-span-2">
              <Label icon={<FaFileContract />} text="Remarks *" />
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any remarks"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
              />
              {fieldErrors.remarks && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.remarks}</div>
              )}
            </div>
          </div>
        </Card>
        <Card
          title="Due Packages"
          icon={<FaMoneyBillWave />}
          iconColor="bg-teal-600"
        >
          <button
            onClick={handleAddCategoryClick}
            className="bg-teal-600 text-white border border-teal-300 px-4 py-2 rounded-md mb-4 hover:bg-teal-700 transition duration-200"
          >
            + Add Due Category
          </button>
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-white text-black rounded-lg overflow-hidden">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Name</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Type</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Amount</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Status</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Include</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Custom Amount</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Due Date</th>
                  <th className="py-2 px-4 text-left text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-teal-200 hover:bg-teal-50"
                  >
                    <td className="py-2 px-4 text-sm sm:text-base">{category.name}</td>
                    <td className="py-2 px-4 text-sm sm:text-base">{category.type}</td>
                    <td className="py-2 px-4 text-sm sm:text-base">{category.amount}</td>
                    <td className="py-2 px-4 text-sm sm:text-base">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category.status === "ACTIVE"}
                          onChange={() => handleToggle(category._id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                      </label>
                    </td>
                    <td className="py-2 px-4 text-sm sm:text-base">
                      <input
                        type="checkbox"
                        checked={selectedDues[category._id]?.include || false}
                        onChange={(e) =>
                          handleDueChange(category._id, "include", e.target.checked)
                        }
                        disabled={category.status !== "ACTIVE" || loadingLandlordId}
                        className="form-checkbox h-5 w-5 text-teal-600"
                      />
                    </td>
                    <td className="py-2 px-4 text-sm sm:text-base">
                      {category.type === "variable" ? (
                        <input
                          type="number"
                          value={selectedDues[category._id]?.amount || ""}
                          onChange={(e) =>
                            handleDueChange(category._id, "amount", e.target.value)
                          }
                          disabled={!selectedDues[category._id]?.include}
                          className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <span>₹{category.amount}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm sm:text-base">
                      <input
                        type="date"
                        value={selectedDues[category._id]?.dueDate || ""}
                        onChange={(e) =>
                          handleDueChange(category._id, "dueDate", e.target.value)
                        }
                        disabled={!selectedDues[category._id]?.include}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                      />
                    </td>
                    <td className="py-2 px-4 text-sm sm:text-base relative">
                      <button
                        onClick={() =>
                          setShowOptions(
                            showOptions === category._id ? null : category._id
                          )
                        }
                        className="text-teal-500 hover:text-teal-700 focus:outline-none"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                          />
                        </svg>
                      </button>
                      {showOptions === category._id && (
                        <div className="absolute right-0 mt-2 w-28 bg-white border border-teal-200 rounded-md shadow-lg z-10">
                          <button
                            onClick={() => handleEdit(category)}
                            className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dues.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-teal-700">
                Assigned Dues
              </h2>
              <div className="overflow-x-auto rounded-lg shadow-lg">
                <table className="min-w-full bg-white text-black rounded-lg overflow-hidden">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm sm:text-base">
                        Category
                      </th>
                      <th className="py-2 px-4 text-left text-sm sm:text-base">
                        Amount
                      </th>
                      <th className="py-2 px-4 text-left text-sm sm:text-base">
                        Due Date
                      </th>
                      <th className="py-2 px-4 text-left text-sm sm:text-base">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.map((due, index) => (
                      <tr
                        key={index}
                        className="border-b border-teal-200 hover:bg-teal-50"
                      >
                        <td className="py-2 px-4 text-sm sm:text-base">
                          {due.category}
                        </td>
                        <td className="py-2 px-4 text-sm sm:text-base">
                          ₹{due.amount}
                        </td>
                        <td className="py-2 px-4 text-sm sm:text-base">
                          {new Date(due.dueDate).toLocaleDateString("en-GB")}
                        </td>
                        <td className="py-2 px-4 text-sm sm:text-base">
                          {due.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
        <Card
          title="Electricity Details"
          icon={<FaBolt />}
          iconColor="bg-yellow-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Electricity Per Unit (₹) *"
              icon={<FaBolt />}
              name="electricityPerUnit"
              type="number"
              value={formData.electricityPerUnit}
              onChange={handleChange}
              placeholder="Enter electricity rate per unit"
              min={0}
              required
              fieldErrors={fieldErrors}
            />
            <Input
              label="Initial Reading *"
              icon={<FaBolt />}
              name="initialReading"
              type="number"
              value={formData.initialReading}
              onChange={handleChange}
              placeholder="Enter initial meter reading"
              min={0}
              required
              fieldErrors={fieldErrors}
            />
            <Input
              label="Initial Reading Date *"
              icon={<FaCalendar />}
              name="initialReadingDate"
              type="date"
              value={formData.initialReadingDate}
              onChange={handleChange}
              required
              min={today}
              fieldErrors={fieldErrors}
            />
            <Input
              label="Final Reading *"
              icon={<FaBolt />}
              name="finalReading"
              type="number"
              value={formData.finalReading}
              onChange={handleChange}
              placeholder="Enter final meter reading"
              min={0}
              required
              fieldErrors={fieldErrors}
              disabled={isEdit}
            />
            <Input
              label="Final Reading Date *"
              icon={<FaCalendar />}
              name="finalReadingDate"
              type="date"
              value={formData.finalReadingDate}
              onChange={handleChange}
              required
              min={today}
              fieldErrors={fieldErrors}
              disabled={isEdit}
            />
            <div className="md:col-span-2">
              <Label
                icon={<FaFileContract />}
                text="Electricity Due Description *"
              />
              <textarea
                name="electricityDueDescription"
                value={formData.electricityDueDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Enter electricity due description"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
                disabled={isEdit}
              />
              {fieldErrors.electricityDueDescription && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.electricityDueDescription}</div>
              )}
            </div>
          </div>
        </Card>
        <Card
          title="Opening Balance"
          icon={<FaMoneyBillWave />}
          iconColor="bg-teal-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Opening Balance Start Date *"
              icon={<FaCalendar />}
              name="openingBalanceStartDate"
              type="date"
              value={formData.openingBalanceStartDate}
              onChange={handleChange}
              required
              min={today}
              fieldErrors={fieldErrors}
            />
            <Input
              label="Opening Balance End Date *"
              icon={<FaCalendar />}
              name="openingBalanceEndDate"
              type="date"
              value={formData.openingBalanceEndDate}
              onChange={handleChange}
              required
              min={today}
              fieldErrors={fieldErrors}
            />
            <Input
              label="Opening Balance Amount (₹) *"
              icon={<FaMoneyBillWave />}
              name="openingBalanceAmount"
              type="number"
              value={formData.openingBalanceAmount}
              onChange={handleChange}
              placeholder="Enter opening balance amount"
              min={0}
              required
              fieldErrors={fieldErrors}
            />
          </div>
        </Card>
        <div className="flex flex-row flex-wrap justify-end gap-3 mt-8">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className={`inline-flex items-center bg-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md hover:bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 hover:text-white transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading && <FaSpinner className="animate-spin mr-2" />}
            {isEdit ? "Update Tenant" : "Save Tenant"}
          </motion.button>
          <Link to="/organization/tenant-list">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md hover:text-white hover:bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 transition-colors"
            >
              View Tenants
            </motion.button>
          </Link>
        </div>
      </form>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={handleCloseSidebar}
        >
          <div
            className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 shadow-lg rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-teal-700">
                {selectedCategory ? "Edit Category" : "Add New Due Category"}
              </h2>
              <button
                onClick={handleCloseSidebar}
                className="text-teal-500 hover:text-teal-700 text-xl sm:text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-800">
                  Due Type Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-teal-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter due type name (e.g. Maintenance, WiFi)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-800">
                  Billing Mode *
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="billingMode"
                      value="variable"
                      checked={categoryType === "variable"}
                      onChange={() => handleTypeChange("variable")}
                      className="form-radio text-teal-600"
                    />
                    <span className="text-sm sm:text-base text-teal-800">
                      Due amount is different per tenant/room
                    </span>
                  </label>
                  <p className="text-xs text-teal-600 ml-6">
                    You'll set individual amounts when creating dues
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="billingMode"
                      value="fixed"
                      checked={categoryType === "fixed"}
                      onChange={() => handleTypeChange("fixed")}
                      className="form-radio text-teal-600"
                    />
                    <span className="text-sm sm:text-base text-teal-800">
                      Due amount is fixed
                    </span>
                  </label>
                  <p className="text-xs text-teal-600 ml-6">
                    Same amount for all tenants
                  </p>
                </div>
              </div>
              {categoryType === "fixed" && (
                <div>
                  <label className="block text-sm font-medium text-teal-800">
                    Fixed Amount *
                  </label>
                  <input
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-teal-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter fixed amount (e.g. 12000)"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
              <div className="bg-teal-50 p-3 rounded-md">
                <p className="text-sm text-teal-700">
                  After {selectedCategory ? "updating" : "adding"} this category: You can enable/disable anytime •
                  You can edit the details if needed • You can use it to create
                  dues for tenants
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className="px-4 py-2 text-teal-700 hover:text-teal-900 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 w-full sm:w-auto transition duration-200"
                >
                  {selectedCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
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
const Input = ({ label, icon, name, fieldErrors, ...props }) => (
  <div>
    <Label icon={icon} text={label} />
    <input
      {...props}
      name={name}
      className={`w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800 ${fieldErrors && fieldErrors[name] ? "border-red-500" : ""}`}
      aria-label={label}
    />
    {fieldErrors && fieldErrors[name] && (
      <div className="text-red-500 text-xs mt-1">{fieldErrors[name]}</div>
    )}
  </div>
);
const Select = ({ label, icon, options, isLoading, name, fieldErrors, ...props }) => (
  <div className="relative">
    <Label icon={icon} text={label} />
    <select
      {...props}
      name={name}
      className={`w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 text-base ${
        props.disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${fieldErrors && fieldErrors[name] ? "border-red-500" : ""}`}
      disabled={isLoading || props.disabled}
      aria-label={label}
    >
      <option value="">
        {isLoading
          ? "Loading..."
          : options.length === 0
          ? `No ${label.toLowerCase()} available`
          : `Select ${label.toLowerCase()}`}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {fieldErrors && fieldErrors[name] && (
      <div className="text-red-500 text-xs mt-1">{fieldErrors[name]}</div>
    )}
  </div>
);
const Label = ({ icon, text }) => (
  <label className="block mb-1.5 font-medium flex items-center text-gray-700">
    <span className="mr-2 text-indigo-700">{icon}</span>
    {text}
  </label>
);
const MobileInput = ({ label, icon, name, value, onChange, required, fieldErrors, ...props }) => (
  <div>
    <Label icon={icon} text={label + (required ? " *" : "")} />
    <div className="flex items-center">
      <span className="px-2 py-2 bg-gray-200 border border-gray-300 rounded-l-lg text-gray-700 select-none">+91</span>
      <input
        {...props}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800 ${fieldErrors && fieldErrors[name] ? "border-red-500" : ""}`}
        maxLength={10}
        pattern="\d{10}"
        required={required}
      />
    </div>
    {fieldErrors && fieldErrors[name] && (
      <div className="text-red-500 text-xs mt-1">{fieldErrors[name]}</div>
    )}
  </div>
);
const isValidPermanentAddress = (value) => /[a-zA-Z]/.test(value) && /\d/.test(value);
const isValidWork = (value) => /^[a-zA-Z\s]*$/.test(value);
const isValidDOB = (value) => {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  if (date > now) return false;
  if (date.getFullYear() >= 2025) return false;
  if (date.getFullYear() < 1900) return false;
  if (date.getFullYear() === 1001) return false;
  return true;
};
export default TenantForm;