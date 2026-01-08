import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
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
  FaCheck,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PropertyManagerAddTenant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // PROPERTY ID FROM URL PARAMS
  const editingTenant = location.state?.tenant;
  const isEdit = Boolean(editingTenant && editingTenant.id);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProperties, setIsFetchingProperties] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [isFetchingBeds, setIsFetchingBeds] = useState(false);
  const [pmId, setPmId] = useState(null);
  const [loadingPmId, setLoadingPmId] = useState(true);

  // Aadhaar states
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  // Dues-related state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("variable");
  const [fixedAmount, setFixedAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [selectedDues, setSelectedDues] = useState({});
  const [assignedDues, setAssignedDues] = useState([]);

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
    propertyId: id || "",
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

  const API_BASE_URL = "https://api.gharzoreality.com/api";
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const deduplicateCategories = (categories) => {
    const seen = new Set();
    return categories.filter((cat) => {
      if (seen.has(cat._id)) return false;
      seen.add(cat._id);
      return true;
    });
  };

  // Generate Aadhaar OTP
  const generateOtp = async (e) => {
    e.preventDefault();
    if (!formData.aadhaar || !/^\d{12}$/.test(formData.aadhaar)) {
      toast.error("Valid 12-digit Aadhaar number is required");
      return;
    }
    try {
      const res = await axios.post(
        "https://api.gharzoreality.com/api/kyc/aadhaar/generate-otp",
        { aadhaarNumber: formData.aadhaar },
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
        // Auto-fill name if not set
        if (!formData.name) {
          setFormData((prev) => ({
            ...prev,
            name: data.full_name || prev.name,
          }));
        } else if (formData.name.toUpperCase() !== (data.full_name || '').toUpperCase()) {
          toast.warning(`Name mismatch: Form (${formData.name}) vs Aadhaar (${data.full_name}). Using form name.`);
        }
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

  // Fetch pmId from profile API or localStorage
  useEffect(() => {
    const fetchPmId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login.");
          navigate("/login");
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/property-managers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile API response:", res.data); // Debug log
        const fetchedPmId = res.data.id || res.data.pmId || res.data._id || res.data.propertyManagerId;
        if (!fetchedPmId || !isValidObjectId(fetchedPmId)) {
          console.warn("Invalid or missing pmId in API response, checking localStorage");
          const storedPmId = localStorage.getItem("propertyManagerId");
          if (storedPmId && isValidObjectId(storedPmId)) {
            console.log("Using pmId from localStorage:", storedPmId);
            setPmId(storedPmId);
          } else {
            throw new Error("Invalid or missing pmId in both API response and localStorage");
          }
        } else {
          setPmId(fetchedPmId);
          localStorage.setItem("propertyManagerId", fetchedPmId); // Store pmId for future fallback
          console.log("Fetched pmId from API:", fetchedPmId);
        }
        setLoadingPmId(false);
      } catch (err) {
        console.error("Profile API error:", err.response?.data || err.message);
        const storedPmId = localStorage.getItem("propertyManagerId");
        if (storedPmId && isValidObjectId(storedPmId)) {
          console.log("Falling back to pmId from localStorage:", storedPmId);
          setPmId(storedPmId);
          setLoadingPmId(false);
        } else {
        
          setLoadingPmId(false);
        }
      }
    };
    fetchPmId();
  }, [navigate]);

  // Validate URL Property ID
  useEffect(() => {
    if (id && !isValidObjectId(id)) {
      toast.error("Invalid Property ID in URL. Redirecting to properties list...");
      setTimeout(() => navigate("/sub_owner/properties"), 1500);
    }
  }, [id, navigate]);

  // Fetch Due Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }
      if (!pmId) {
        toast.error("pmId is missing. Cannot fetch due categories.");
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/pm/dues`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            pmId: pmId,
          },
        });
        const categoryData = Array.isArray(response.data.dues)
          ? response.data.dues
          : [];
        const uniqueCategories = deduplicateCategories(categoryData);
        const formattedCategories = uniqueCategories.map((category) => ({
          _id: category._id,
          name: category.name,
          type: category.type,
          amount: category.type === "fixed" ? category.amount : "Variable",
          status: category.status || "ACTIVE",
        }));
        setCategories(formattedCategories);
        const initSelected = {};
        formattedCategories.forEach((cat) => {
          initSelected[cat._id] = {
            include: false,
            amount: cat.type === "fixed" ? cat.amount : "",
            dueDate: new Date().toISOString().split("T")[0],
          };
        });
        setSelectedDues(initSelected);
      } catch (error) {
        console.error("Fetch categories error:", error.response?.data || error.message);
        toast.error(
          `Failed to fetch due categories: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };
    if (pmId) fetchCategories();
  }, [pmId]);

  // Fetch Properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (id && isValidObjectId(id)) {
        setProperties([]);
        setFormData((prev) => ({ ...prev, propertyId: id }));
        toast.success("Property loaded from URL!");
        return;
      }
      setIsFetchingProperties(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required! Please login.");
          navigate("/login");
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/pm/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const propertiesData = Array.isArray(response.data) ? response.data : [];
        setProperties(propertiesData);
        if (propertiesData.length === 0) {
          toast.warn("No properties available.");
        }
      } catch (error) {
        console.error("Fetch properties error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to fetch properties.");
      } finally {
        setIsFetchingProperties(false);
      }
    };
    fetchProperties();
  }, [id, navigate]);

  // Fetch Rooms
  useEffect(() => {
    if (!formData.propertyId) {
      setAvailableRooms([]);
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        roomId: "",
        bedId: "",
        rentAmount: "",
      }));
      return;
    }
    if (!isValidObjectId(formData.propertyId)) {
      toast.error("Invalid property selected. Please choose a valid property.");
      setAvailableRooms([]);
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        roomId: "",
        bedId: "",
        rentAmount: "",
      }));
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
        const response = await axios.get(
          `${API_BASE_URL}/pm/status/properties/${formData.propertyId}/available-rooms`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const roomsData = Array.isArray(response.data?.rooms)
          ? response.data.rooms
          : [];
        setAvailableRooms(roomsData);
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
        console.error("Fetch rooms error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || "Failed to fetch rooms.";
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
  }, [formData.propertyId, navigate]);

  // Fetch Beds
  useEffect(() => {
    if (!formData.propertyId || !formData.roomId) {
      setAvailableBeds([]);
      setFormData((prev) => ({
        ...prev,
        bedId: "",
        rentAmount: "",
      }));
      return;
    }
    if (!isValidObjectId(formData.propertyId)) {
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
        const response = await axios.get(
          `${API_BASE_URL}/pm/status/properties/${formData.propertyId}/rooms/${formData.roomId}/available-beds`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const bedsData = Array.isArray(response.data?.beds)
          ? response.data.beds
          : [];
        setAvailableBeds(bedsData);
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
        console.error("Fetch beds error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || "Failed to fetch beds.";
        if (error.response?.status === 404) {
          toast.error("Room ID invalid. Please select a valid room.");
        } else {
          toast.error(errorMsg);
        }
        setAvailableBeds([]);
      } finally {
        setIsFetchingBeds(false);
      }
    };
    fetchBeds();
  }, [formData.roomId, formData.propertyId, navigate]);

  // Pre-fill Form
  useEffect(() => {
    if (isEdit && editingTenant.id) {
      let validPropertyId = editingTenant.propertyId ?? "";
      if (validPropertyId && !isValidObjectId(validPropertyId)) {
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
        electricityDueDescription: editingTenant.electricityDueDescription ?? "",
        openingBalanceStartDate: editingTenant.openingBalanceStartDate ?? "",
        openingBalanceEndDate: editingTenant.openingBalanceEndDate ?? "",
        openingBalanceAmount: editingTenant.openingBalanceAmount?.toString() ?? "",
      });
      setAadhaarVerified(!!editingTenant.aadhaar);
    } else if (location.state?.propertyId && location.state?.propertyTitle) {
      let validPropertyId = location.state.propertyId;
      if (!isValidObjectId(validPropertyId)) {
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
    }
  }, [editingTenant, location.state, isEdit, id]);

  // Pre-fill Rent Amount
  useEffect(() => {
    const selectedBed = availableBeds.find((bed) => bed.bedId === formData.bedId);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!pmId) {
      toast.error("pmId is missing. Please log in again.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please login again.");
      navigate("/login");
      return;
    }
    try {
      let updatedCategory;
      if (selectedCategory) {
        const response = await axios.put(
          `${API_BASE_URL}/dues/edit/${selectedCategory._id}`,
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
        updatedCategory = response.data;
        toast.success("Category updated successfully!");
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === selectedCategory._id
              ? {
                  ...cat,
                  name: categoryName,
                  type: categoryType,
                  amount: categoryType === "fixed" ? parseFloat(fixedAmount) : "Variable",
                }
              : cat
          )
        );
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/pm/dues/create`,
          {
            pmId: pmId,
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
        updatedCategory = response.data;
        toast.success("Category added successfully!");
        setCategories((prev) => [
          ...prev,
          {
            _id: updatedCategory._id,
            name: categoryName,
            type: categoryType,
            amount: categoryType === "fixed" ? parseFloat(fixedAmount) : "Variable",
            status: updatedCategory.status || "ACTIVE",
          },
        ]);
      }
      setSelectedDues((prev) => ({
        ...prev,
        [updatedCategory._id]: {
          include: false,
          amount: categoryType === "fixed" ? parseFloat(fixedAmount) : "",
          dueDate: new Date().toISOString().split("T")[0],
        },
      }));
      handleCloseSidebar();
    } catch (error) {
      console.error("Category submit error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${selectedCategory ? "update" : "add"} category.`
      );
    }
  };

  const handleToggle = async (categoryId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please login again.");
      navigate("/login");
      return;
    }
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;
    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axios.put(
        `${API_BASE_URL}/dues/edit/${categoryId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Category status updated successfully!");
      setCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? { ...cat, status: newStatus } : cat))
      );
    } catch (error) {
      console.error("Toggle category error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to update category status."
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
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please login again.");
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/dues/delete/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Due category deleted successfully!");
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
      setSelectedDues((prev) => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
    } catch (error) {
      console.error("Delete category error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to delete category."
      );
    }
  };

  const handleDueChange = async (categoryId, field, value) => {
    setSelectedDues((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value,
      },
    }));
    // Assign due immediately if editing a tenant and "include" is checked
    if (field === "include" && value && isEdit && editingTenant.id && pmId) {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        navigate("/login");
        return;
      }
      const due = selectedDues[categoryId];
      const amount = due.amount || (categories.find((cat) => cat._id === categoryId)?.type === "fixed" ? categories.find((cat) => cat._id === categoryId)?.amount : 0);
      if (!amount || !due.dueDate) {
        toast.error("Please specify amount and due date before assigning.");
        setSelectedDues((prev) => ({
          ...prev,
          [categoryId]: { ...prev[categoryId], include: false },
        }));
        return;
      }
      try {
        const response = await axios.post(
          `${API_BASE_URL}/pm/dues/assign`,
          {
            pmId: pmId,
            tenantId: editingTenant.id,
            dueId: categoryId,
            amount: parseFloat(amount),
            dueDate: due.dueDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const tenantDue = response.data.tenantDue;
        console.log("Assign due response:", response.data);
        setAssignedDues((prev) => [
          ...prev,
          {
            dueId: tenantDue.dueId,
            category: categories.find((cat) => cat._id === tenantDue.dueId)?.name || "Unknown",
            amount: tenantDue.amount,
            dueDate: tenantDue.dueDate,
            status: tenantDue.status,
          },
        ]);
        toast.success(response.data.message || "Due assigned successfully to tenant");
      } catch (error) {
        console.error("Assign due error:", error.response?.data || error.message);
        toast.error(
          error.response?.data?.message || "Failed to assign due to tenant."
        );
        setSelectedDues((prev) => ({
          ...prev,
          [categoryId]: { ...prev[categoryId], include: false },
        }));
      }
    }
  };

  const validateForm = () => {
    if (!aadhaarVerified) {
      toast.error("Aadhaar verification is required");
      return false;
    }
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
    if (!isValidObjectId(formData.propertyId)) {
      toast.error("Selected property ID is invalid.");
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
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (properties.length > 0) {
      if (!properties.some((prop) => prop._id === formData.propertyId)) {
        toast.error("Selected property is invalid.");
        return false;
      }
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
    if (!pmId) {
      toast.error("pmId is missing. Please log in again.");
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required! Please login.");
      navigate("/login");
      setIsLoading(false);
      return;
    }
    if (isEdit && !editingTenant.id) {
      toast.error("Invalid tenant ID for editing.");
      setIsLoading(false);
      return;
    }
    const payload = {
      pmId: pmId,
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
      finalReading: formData.finalReading ? Number(formData.finalReading) : null,
      initialReadingDate: formData.initialReadingDate || null,
      finalReadingDate: formData.finalReadingDate || null,
      electricityDueDescription: formData.electricityDueDescription || null,
      openingBalanceStartDate: formData.openingBalanceStartDate || null,
      openingBalanceEndDate: formData.openingBalanceEndDate || null,
      openingBalanceAmount: Number(formData.openingBalanceAmount) || 0,
    };
    try {
      const url = isEdit
        ? `${API_BASE_URL}/pm/tenants/${editingTenant.id}`
        : `${API_BASE_URL}/pm/tenants`;
      const tenantResponse = await axios({
        method: isEdit ? "PUT" : "POST",
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: payload,
      });
      // Log the full response to inspect its structure
      console.log("Tenant creation response:", tenantResponse.data);
      // Extract tenantId (adjust based on actual response structure)
      const tenantId = isEdit
        ? editingTenant.id
        : tenantResponse.data.tenant.tenantId;
      console.log("Extracted tenantId:", tenantId);
      // Validate tenantId
      if (!tenantId ) {
        throw new Error("Tenant ID not found or invalid in response.");
      }
      console.log("tenantId:", tenantId); // Moved console log here
      // Assign dues for non-edit mode (new tenant)
      if (!isEdit) {
        const duesToAssign = Object.entries(selectedDues)
          .filter(([_, due]) => due.include)
          .map(([categoryId, due]) => ({
            pmId: pmId,
            tenantId,
            dueId: categoryId,
            amount:
              parseFloat(due.amount) ||
              (categories.find((cat) => cat._id === categoryId)?.type === "fixed"
                ? categories.find((cat) => cat._id === categoryId)?.amount
                : 0),
            dueDate: due.dueDate,
          }));
        const assignedDuesList = [];
        for (const due of duesToAssign) {
          if (!due.amount || !due.dueDate) {
            toast.warn(`Skipping due ${due.dueId} due to missing amount or due date.`);
            continue;
          }
          const dueResponse = await axios.post(
            `${API_BASE_URL}/pm/dues/assign`,
            due,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const tenantDue = dueResponse.data.tenantDue;
          console.log("Assign due response:", tenantDue);
          assignedDuesList.push({
            dueId: tenantDue.dueId,
            category: categories.find((cat) => cat._id === tenantDue.dueId)?.name || "Unknown",
            amount: tenantDue.amount,
            dueDate: tenantDue.dueDate,
            status: tenantDue.status,
          });
          toast.success(dueResponse.data.message || "Due assigned successfully to tenant");
        }
        setAssignedDues(assignedDuesList);
      }
      toast.success(
        tenantResponse?.data?.message ||
          `Tenant ${isEdit ? "updated" : "added"} successfully!`
      );
      setFormData(initialFormData);
      setSelectedDues((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([catId, due]) => [
            catId,
            {
              ...due,
              include: false,
              amount: categories.find((cat) => cat._id === catId)?.type === "fixed" ? due.amount : "",
              dueDate: new Date().toISOString().split("T")[0],
            },
          ])
        )
      );
      // Reset Aadhaar states
      setOtp("");
      setTxnId(null);
      setShowOtpInput(false);
      setAadhaarVerified(false);
    } catch (error) {
      console.error("Tenant submit error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${isEdit ? "update" : "add"} tenant or assign dues.`
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
        <Card title="Personal Details" icon={<FaUser />} iconColor="bg-indigo-700">
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
            <div className="md:col-span-2">
              <label className="block mb-1.5 font-medium flex items-center text-gray-700">
                <span className="mr-2 text-indigo-700"><FaIdCard /></span>
                Aadhaar Verification *
              </label>
              {!aadhaarVerified ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      placeholder="Enter 12-digit Aadhaar Number"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      name="aadhaar"
                      maxLength={12}
                      className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={generateOtp}
                      disabled={!formData.aadhaar || formData.aadhaar.length !== 12}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition duration-300 transform hover:scale-105"
                    >
                      Generate OTP
                    </button>
                  </div>
                  {showOtpInput && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 6}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition duration-300 transform hover:scale-105"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300">
                  <span className="text-green-600 font-medium flex items-center">
                    <FaCheck className="mr-2" />
                    Aadhaar Verified Successfully
                  </span>
                  <span className="text-sm text-gray-500">({formData.aadhaar})</span>
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
        <Card title="Permanent Address" icon={<FaHome />} iconColor="bg-blue-600">
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

        {/* Card 4 - Property Details */}
        <Card title="Property Details" icon={<FaHome />} iconColor="bg-purple-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {id && isValidObjectId(id) ? (
              <div className="md:col-span-2">
                <Label icon={<FaHome />} text="Property" />
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Property Auto-Selected from URL
                  </p>
                  <p className="text-sm text-green-700">ID: {id.slice(0, 8)}...</p>
                </div>
              </div>
            ) : (
              <Select
                key="propertyId"
                label="Property *"
                icon={<FaHome />}
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select property" },
                  ...properties.map((prop) => ({
                    value: prop._id,
                    label: prop.name || `Property ${prop._id.slice(0, 6)}...`,
                  })),
                ]}
                isLoading={isFetchingProperties}
                required
              />
            )}
            <Select
              key={`roomId-${formData.propertyId}`}
              label="Room *"
              icon={<FaBed />}
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              options={[
                { value: "", label: "Select room" },
                ...availableRooms.map((room) => ({
                  value: room.roomId,
                  label: `${room.roomId} (${room.name}, ₹${room.price})`,
                })),
              ]}
              isLoading={isFetchingRooms}
              disabled={!formData.propertyId || isFetchingRooms}
              required
            />
            <Select
              key={`bedId-${formData.roomId}`}
              label="Bed *"
              icon={<FaBed />}
              name="bedId"
              value={formData.bedId}
              onChange={handleChange}
              options={[
                { value: "", label: "Select bed" },
                ...availableBeds.map((bed) => ({
                  value: bed.bedId,
                  label: `${bed.bedId} (₹${bed.price})`,
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
                { value: "Joining", label: "Joining" },
                { value: "month_end", label: "month_end" },
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

        {/* Card 6 - Due Packages */}
        <Card
          title="Due Packages"
          icon={<FaMoneyBillWave />}
          iconColor="bg-teal-600"
        >
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleAddCategoryClick}
              className="bg-indigo-700 text-white border border-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-800 transition duration-200"
              disabled={isLoading || loadingPmId}
            >
              + Add Due Category
            </button>
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full bg-white text-black rounded-lg overflow-hidden">
                <thead className="bg-indigo-700 text-white">
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
                      className="border-b border-gray-200 hover:bg-indigo-50"
                    >
                      <td className="py-2 px-4 text-sm sm:text-base truncate max-w-xs">
                        {category.name}
                      </td>
                      <td className="py-2 px-4 text-sm sm:text-base">{category.type}</td>
                      <td className="py-2 px-4 text-sm sm:text-base">{category.amount}</td>
                      <td className="py-2 px-4 text-sm sm:text-base">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={category.status === "ACTIVE"}
                            onChange={() => handleToggle(category._id)}
                            className="sr-only peer"
                            disabled={isLoading}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
                        </label>
                      </td>
                      <td className="py-2 px-4 text-sm sm:text-base">
                        <input
                          type="checkbox"
                          checked={selectedDues[category._id]?.include || false}
                          onChange={(e) =>
                            handleDueChange(category._id, "include", e.target.checked)
                          }
                          disabled={
                            category.status !== "ACTIVE" || isLoading || loadingPmId
                          }
                          className="form-checkbox h-5 w-5 text-indigo-500"
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
                            disabled={!selectedDues[category._id]?.include || isLoading}
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
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
                          disabled={!selectedDues[category._id]?.include || isLoading}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
                        />
                      </td>
                      <td className="py-2 px-4 text-sm sm:text-base relative">
                        <button
                          onClick={() =>
                            setShowOptions(
                              showOptions === category._id ? null : category._id
                            )
                          }
                          className="text-indigo-700 hover:text-indigo-800 focus:outline-none"
                          disabled={isLoading}
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
                          <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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
            {isEdit && assignedDues.length > 0 && (
              <div className="mt-6">
                <h5 className="text-lg font-semibold mb-3 text-gray-800">
                  Assigned Dues
                </h5>
                <div className="overflow-x-auto rounded-lg shadow-lg">
                  <table className="min-w-full bg-white text-black rounded-lg overflow-hidden">
                    <thead className="bg-indigo-700 text-white">
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
                      {assignedDues.map((due, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-indigo-50"
                        >
                          <td className="py-2 px-4 text-sm sm:text-base truncate max-w-xs">
                            {due.category}
                          </td>
                          <td className="py-2 px-4 text-sm sm:text-base">₹{due.amount}</td>
                          <td className="py-2 px-4 text-sm sm:text-base">
                            {new Date(due.dueDate).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-2 px-4 text-sm sm:text-base">{due.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Card 7 - Electricity Details */}
        <Card title="Electricity Details" icon={<FaBolt />} iconColor="bg-yellow-600">
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
              <Label icon={<FaFileContract />} text="Electricity Due Description" />
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

        {/* Card 8 - Opening Balance */}
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

        <div className="flex flex-col sm:flex-row flex-wrap justify-end gap-3 mt-8">
          <motion.button
            type="submit"
            disabled={isLoading || loadingPmId || !aadhaarVerified}
            whileHover={{ scale: isLoading || loadingPmId || !aadhaarVerified ? 1 : 1.05 }}
            whileTap={{ scale: isLoading || loadingPmId || !aadhaarVerified ? 1 : 0.95 }}
            className={`inline-flex items-center bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all ${
              isLoading || loadingPmId || !aadhaarVerified ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading && <FaSpinner className="animate-spin mr-2" />}
            {isEdit ? "Update Tenant" : "Save Tenant"}
          </motion.button>
        </div>
      </form>

      {/* Due Category Sidebar */}
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
              <h2 className="text-lg sm:text-xl font-bold text-indigo-700">
                {selectedCategory ? "Edit Category" : "Add New Due Category"}
              </h2>
              <button
                onClick={handleCloseSidebar}
                className="text-indigo-700 hover:text-indigo-800 text-xl sm:text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <Label icon={<FaMoneyBillWave />} text="Due Type Name *" />
                <Input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter due type name (e.g. Maintenance, WiFi)"
                  required
                />
              </div>
              <div>
                <Label icon={<FaFileContract />} text="Billing Mode *" />
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="billingMode"
                      value="variable"
                      checked={categoryType === "variable"}
                      onChange={() => handleTypeChange("variable")}
                      className="form-radio text-indigo-500"
                    />
                    <span className="text-sm sm:text-base text-gray-700">
                      Due amount is different per tenant
                    </span>
                  </label>
                  <p className="text-xs text-indigo-700 ml-6">
                    You'll set individual amounts when assigning dues
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="billingMode"
                      value="fixed"
                      checked={categoryType === "fixed"}
                      onChange={() => handleTypeChange("fixed")}
                      className="form-radio text-indigo-500"
                    />
                    <span className="text-sm sm:text-base text-gray-700">
                      Due amount is fixed
                    </span>
                  </label>
                  <p className="text-xs text-indigo-700 ml-6">
                    Same amount for all tenants
                  </p>
                </div>
              </div>
              {categoryType === "fixed" && (
                <div>
                  <Label icon={<FaMoneyBillWave />} text="Fixed Amount *" />
                  <Input
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    placeholder="Enter fixed amount (e.g. 12000)"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}
              <div className="bg-indigo-50 p-3 rounded-md">
                <p className="text-sm text-indigo-700">
                  After {selectedCategory ? "updating" : "adding"} this category: You can
                  enable/disable anytime • You can edit the details if needed • You
                  can use it to create dues for tenants
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className="px-4 py-2 text-indigo-700 hover:text-indigo-800 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 w-full sm:w-auto transition duration-200"
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

// Components
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

const Input = ({ label, icon, ...props }) => (
  <div>
    {label && <Label icon={icon} text={label} />}
    <input
      {...props}
      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-gray-400 text-gray-800"
      aria-label={label}
    />
  </div>
);

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

const Label = ({ icon, text }) => (
  <label className="block mb-1.5 font-medium flex items-center text-gray-700">
    <span className="mr-2 text-indigo-700">{icon}</span>
    {text}
  </label>
);

export default PropertyManagerAddTenant;