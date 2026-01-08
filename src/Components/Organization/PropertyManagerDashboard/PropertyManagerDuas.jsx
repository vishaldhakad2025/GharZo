import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// Function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      toast.error("Session expired. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    toast.error("Invalid token format. Please log in again.", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return null;
  }
};

// Helper to get token from localStorage
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("No authentication token found. Please log in.", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return null;
  }
  return token;
};

// API base URL
const API_BASE_URL = "https://api.gharzoreality.com";

// Helper function to extract propertyId from URL
const getPropertyIdFromUrl = () => {
  const pathname = window.location.pathname;
  const match = pathname.match(/\/property\/([^\/]+)\/|\/pm\/([^\/]+)\/|\/([^\/]+)\/dues/);
  if (match) {
    const propertyId = match[1] || match[2] || match[3];
    console.log("🔍 Extracted propertyId from URL:", propertyId);
    return propertyId;
  }
  return null;
};

// Centralized headers
const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const Dues = () => {
  // State declarations
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDuesSidebarOpen, setIsDuesSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryType, setCategoryType] = useState("variable");
  const [fixedAmount, setFixedAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingPropertyManagerId, setLoadingPropertyManagerId] = useState(true);
  const [error, setError] = useState(null);
  const [dues, setDues] = useState([]);
  const [propertyManagerId, setPropertyManagerId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(12);
  const [categoryStatus, setCategoryStatus] = useState("ACTIVE");
  const location = useLocation();

  // Fetch Categories
  const fetchCategories = useCallback(async (pmId) => {
    const token = getToken();
    if (!token) return;

    try {
      let response;
      console.log("🔄 Fetching categories - Direct API...");
      try {
        response = await axios.get(
          `${API_BASE_URL}/api/pm/dues`,
          { headers: getHeaders(token), timeout: 5000 }
        );
      } catch (directError) {
        console.log("🔄 Direct failed, trying with pmId...");
        response = await axios.get(
          `${API_BASE_URL}/api/pm/dues?pmId=${pmId}`,
          { headers: getHeaders(token), timeout: 5000 }
        );
      }

      if (!response.data.success || !Array.isArray(response.data.dues)) {
        throw new Error("Invalid response format");
      }

      const formattedCategories = response.data.dues.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        amount: typeof category.amount === "number" ? category.amount : "Variable Amount",
        status: category.status || "ACTIVE",
      }));

      setCategories(formattedCategories);
      console.log("✅ Categories loaded:", formattedCategories.length);
    } catch (error) {
      console.error("❌ Categories error:", error);
      setError("Failed to load dues categories.");
      toast.error(
        error.response?.data?.message || "Failed to fetch dues categories.",
        { position: "top-right", autoClose: 5000, theme: "colored" }
      );
    }
  }, []);

  // ✅ FIXED: Fetch ALL Tenants - NEW API IMPLEMENTATION
  const fetchTenants = useCallback(async () => {
    setLoadingTenants(true);
    const token = getToken();
    if (!token) {
      setLoadingTenants(false);
      return;
    }

    try {
      console.log("🔄 Fetching ALL tenants from /api/pm/tenants...");
      const response = await axios.get(
        `${API_BASE_URL}/api/pm/tenants`,
        { headers: getHeaders(token), timeout: 5000 }
      );
      console.log("✅ Fetched tenants response:", response.data);

      // ✅ FIXED: No 'success' field - just check tenants array
      if (!Array.isArray(response.data.tenants)) {
        throw new Error("Invalid tenant data format - tenants array missing");
      }

      const formattedTenants = response.data.tenants
        .filter(tenant => tenant.tenantId && tenant.name) // Only valid tenants
        .map((tenant) => ({
          tenantId: tenant.tenantId,
          _id: tenant._id,
          name: tenant.name,
          email: tenant.email,
          accommodations: tenant.accommodations?.[0],
        }));

      console.log("✅ Formatted tenants:", formattedTenants.length);
      setTenants(formattedTenants);
      
      if (formattedTenants.length > 0) {
        setSelectedTenant(formattedTenants[0].tenantId);
        console.log("✅ First tenant selected:", formattedTenants[0].name);
      } else {
        toast.warn("No tenants found.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching tenants:", error.response?.status, error.message);
      toast.warn(
        error.response?.status === 404
          ? "No tenants found."
          : error.response?.data?.message || "Failed to fetch tenants.",
        { position: "top-right", autoClose: 5000, theme: "colored" }
      );
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  }, []);

  // Fetch Property Manager ID
  const fetchPropertyManagerId = useCallback(async () => {
    setLoadingPropertyManagerId(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setLoadingPropertyManagerId(false);
      return;
    }

    try {
      console.log("🔄 STEP 1: Trying DIRECT dues API (FASTEST)...");
      const duesResponse = await axios.get(
        `${API_BASE_URL}/api/pm/dues`,
        { headers: getHeaders(token), timeout: 5000 }
      );

      if (duesResponse.data.success !== false) {
        const decoded = decodeToken(token);
        if (!decoded?.id) {
          throw new Error("Cannot extract PM ID from token");
        }

        setPropertyManagerId(decoded.id);
        localStorage.setItem("propertyManagerId", decoded.id);
        
        console.log("✅ STEP 1 SUCCESS! PM ID:", decoded.id);
        
        const urlPropertyId = getPropertyIdFromUrl();
        if (urlPropertyId) {
          setPropertyId(urlPropertyId);
          console.log("✅ Property ID from URL:", urlPropertyId);
        }
        
        await Promise.all([
          fetchCategories(decoded.id),
          fetchTenants() // ✅ Now uses NEW API
        ]);
        
        setLoadingPropertyManagerId(false);
        return;
      }
    } catch (directError) {
      console.log("⚠️ STEP 1 failed, trying STEP 2...");
    }

    try {
      console.log("🔄 STEP 2: Trying Profile API...");
      const profileResponse = await axios.get(
        `${API_BASE_URL}/api/property-managers/profile`,
        { headers: getHeaders(token), timeout: 5000 }
      );

      const fetchedPropertyManagerId = profileResponse.data.data?.id;
      if (!fetchedPropertyManagerId) {
        throw new Error("PM ID not found in profile");
      }

      setPropertyManagerId(fetchedPropertyManagerId);
      localStorage.setItem("propertyManagerId", fetchedPropertyManagerId);
      
      const urlPropertyId = getPropertyIdFromUrl();
      if (urlPropertyId) {
        setPropertyId(urlPropertyId);
        console.log("✅ Property ID from URL:", urlPropertyId);
      }
      
      await Promise.all([
        fetchCategories(fetchedPropertyManagerId),
        fetchTenants() // ✅ Now uses NEW API
      ]);

      console.log("✅ STEP 2 SUCCESS!");
      setLoadingPropertyManagerId(false);
      return;
    } catch (profileError) {
      console.log("⚠️ STEP 2 failed, using STEP 3 FALLBACK...");
    }

    try {
      console.log("🔄 STEP 3: Token Fallback...");
      const decoded = decodeToken(token);
      if (decoded && decoded.id) {
        setPropertyManagerId(decoded.id);
        localStorage.setItem("propertyManagerId", decoded.id);
        
        const urlPropertyId = getPropertyIdFromUrl();
        if (urlPropertyId) {
          setPropertyId(urlPropertyId);
          console.log("✅ Property ID from URL:", urlPropertyId);
        }
        
        await Promise.all([
          fetchCategories(decoded.id),
          fetchTenants() // ✅ Now uses NEW API
        ]);
        
        console.log("✅ STEP 3 SUCCESS! Using token PM ID:", decoded.id);
      }
    } catch (fallbackError) {
      console.error("❌ ALL METHODS FAILED:", fallbackError);
      setError("Failed to load profile. Please log in again.");
      toast.error("Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoadingPropertyManagerId(false);
    }
  }, [fetchCategories, fetchTenants]);

  // Create or Update Category
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Please enter a due type name.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (categoryType === "fixed" && (!fixedAmount || parseFloat(fixedAmount) <= 0)) {
      toast.error("Please enter a valid fixed amount.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!propertyManagerId) {
      toast.error("Property manager ID is missing. Please log in.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: categoryName.trim(),
        type: categoryType,
        status: categoryStatus,
      };

      if (fixedAmount && parseFloat(fixedAmount) > 0) {
        payload.amount = parseFloat(fixedAmount);
      }

      if (!selectedCategory) {
        payload.pmId = propertyManagerId;
      }

      if (selectedCategory) {
        if (!selectedCategory._id) {
          throw new Error("No category ID available for update.");
        }
        await axios.put(
          `${API_BASE_URL}/api/pm/dues/edit/${selectedCategory._id}`,
          payload,
          { headers: getHeaders(token) }
        );
        toast.success("Category updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/api/pm/dues/create`,
          payload,
          { headers: getHeaders(token) }
        );
        toast.success("Category created successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }

      await fetchCategories(propertyManagerId);
      resetCategoryForm();
    } catch (error) {
      console.error("Error submitting category:", error.response ? error.response.data : error.message);
      toast.error(
        error.response?.data?.message || `Failed to ${selectedCategory ? "update" : "create"} category.`,
        { position: "top-right", autoClose: 5000, theme: "colored" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryName, categoryType, fixedAmount, propertyManagerId, selectedCategory, fetchCategories, categoryStatus]);

  // Helper to reset category form
  const resetCategoryForm = useCallback(() => {
    setIsSidebarOpen(false);
    setCategoryName("");
    setCategoryType("variable");
    setFixedAmount("");
    setSelectedCategory(null);
    setCategoryStatus("ACTIVE");
  }, []);

  // Toggle Category Status
  const handleToggle = useCallback(async (categoryId) => {
    const token = getToken();
    if (!token || !propertyManagerId) return;

    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;

    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await axios.put(
        `${API_BASE_URL}/api/pm/dues/edit/${categoryId}`,
        { status: newStatus },
        { headers: getHeaders(token) }
      );
      setCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? { ...cat, status: newStatus } : cat))
      );
      toast.success("Category status updated!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update category status.",
        { position: "top-right", autoClose: 5000, theme: "colored" }
      );
    }
  }, [categories, propertyManagerId]);

  // Handle Delete
  const handleDelete = useCallback((categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (category) {
      setCategoryToDelete(category);
      setIsDeleteModalOpen(true);
    }
  }, [categories]);

  // Confirm Delete
  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;

    const token = getToken();
    if (!token) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/api/pm/dues/delete/${categoryToDelete._id}`,
        { headers: getHeaders(token) }
      );
      await fetchCategories(propertyManagerId);
      toast.success("Category deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("You do not have permission to delete category", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, propertyManagerId, fetchCategories]);

  // Assign Dues
  const handleDuesSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!selectedTenant) {
      toast.error("Please select a tenant.", { position: "top-right", autoClose: 3000, theme: "colored" });
      return;
    }
    if (!selectedCategory) {
      toast.error("No category selected.", { position: "top-right", autoClose: 3000, theme: "colored" });
      return;
    }
    if (!propertyManagerId) {
      toast.error("Property manager ID is missing. Please log in.", { position: "top-right", autoClose: 3000, theme: "colored" });
      return;
    }

    const amount = parseFloat(dueAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.", { position: "top-right", autoClose: 3000, theme: "colored" });
      return;
    }
    if (!dueDate) {
      toast.error("Please select a valid due date.", { position: "top-right", autoClose: 3000, theme: "colored" });
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/pm/dues/assign`,
        {
          pmId: propertyManagerId,
          tenantId: selectedTenant,
          dueId: selectedCategory._id,
          amount: amount,
          dueDate: dueDate,
        },
        { headers: getHeaders(token) }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to assign dues");
      }

      const { tenantDue } = response.data;
      const newDue = {
        _id: tenantDue._id,
        category: selectedCategory.name,
        tenantId: tenantDue.tenantId,
        amount: tenantDue.amount,
        dueDate: tenantDue.dueDate,
        status: tenantDue.status,
        paymentMode: tenantDue.paymentMode,
      };

      setDues((prev) => [...prev, newDue]);
      localStorage.setItem("addedDues", JSON.stringify([...dues, newDue]));

      toast.success("Dues assigned successfully!", { position: "top-right", autoClose: 3000, theme: "colored" });
      resetDuesForm();
    } catch (error) {
      console.error("Error assigning dues:", error);
      toast.error(error.response?.data?.message || "Failed to assign dues.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTenant, selectedCategory, propertyManagerId, dueAmount, dueDate, dues]);

  // Helper to reset dues form
  const resetDuesForm = useCallback(() => {
    setIsDuesSidebarOpen(false);
    setSelectedTenant(tenants[0]?.tenantId || "");
    setDueAmount("");
    setDueDate("");
  }, [tenants]);

  // UI Handlers
  const handleAddCategoryClick = useCallback(() => {
    resetCategoryForm();
    setIsSidebarOpen(true);
  }, [resetCategoryForm]);

  const handleEdit = useCallback((category) => {
    setIsSidebarOpen(true);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setFixedAmount(typeof category.amount === "number" ? category.amount.toString() : "");
    setCategoryStatus(category.status);
    setSelectedCategory(category);
  }, []);

  const handleTypeChange = useCallback((type) => {
    setCategoryType(type);
  }, []);

  const handleAddDues = useCallback((category) => {
    setIsDuesSidebarOpen(true);
    setSelectedCategory(category);
    setDueAmount(typeof category.amount === "number" ? category.amount.toString() : "");
    setDueDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleCloseDuesSidebar = useCallback(() => {
    resetDuesForm();
  }, [resetDuesForm]);

  // Pagination Logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  // Effects
  useEffect(() => {
    const savedDues = localStorage.getItem("addedDues");
    if (savedDues) {
      setDues(JSON.parse(savedDues));
    }
    fetchPropertyManagerId();
  }, [fetchPropertyManagerId]);

  if (loadingPropertyManagerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className="w-12 h-12 animate-spin text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 text-center">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 font-sans text-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden transition-all duration-500 min-w-0 ${
      isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
    }`} style={{ boxSizing: "border-box" }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center md:text-left mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            Dues Management
          </h1>
          {/* <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto md:mx-0">
            Effortlessly manage due categories, assign bills to tenants, and keep your finances organized.
          </p> */}
          {propertyId && (
            <p className="text-xs text-gray-500 mt-2">Property ID: {propertyId}</p>
          )}
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-lg font-semibold text-blue-600 bg-gray-100 px-4 py-2 rounded-full">
            Total Categories: {categories.length} | Total Tenants: {tenants.length}
          </div>
          <motion.button
            onClick={handleAddCategoryClick}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-green-600 transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!propertyManagerId}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </motion.button>
        </motion.div>

        {error && (
          <motion.div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {error}
            <motion.button
              onClick={fetchPropertyManagerId}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ml-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {!error && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, staggerChildren: 0.1 }}>
            {currentCategories.length > 0 ? (
              currentCategories.map((category) => (
                <motion.div
                  key={category._id}
                  className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{category.type} Type</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {category.status}
                      </span>
                    </div>
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Amount</p>
                      <p className="text-lg font-bold text-blue-600">
                        {typeof category.amount === "number" ? `₹${category.amount.toFixed(2)}` : category.amount}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-medium text-gray-700">Active</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category.status === "ACTIVE"}
                          onChange={() => handleToggle(category._id)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <motion.button
                      onClick={() => handleAddDues(category)}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-green-600 transition-all duration-300 disabled:bg-gray-400 mb-4"
                      disabled={tenants.length === 0 || loadingTenants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loadingTenants ? "Loading..." : `Assign Dues (${tenants.length} tenants)`}
                    </motion.button>
                    <div className="flex gap-2 justify-end">
                      <motion.button
                        onClick={() => handleEdit(category)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(category._id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div className="text-center py-8 col-span-full text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1}} transition={{ duration: 0.5 }}>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                No dues categories found. <br />
                <motion.button onClick={handleAddCategoryClick} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Create your first category
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {categories.length > categoriesPerPage && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-300 disabled:hover:bg-gray-100"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-300 disabled:hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}

     
        {/* Category Modal */}
        {isSidebarOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} onClick={resetCategoryForm}>
            <motion.div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-200" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{selectedCategory ? "Edit Category" : "Add New Category"}</h2>
                  <button onClick={resetCategoryForm} className="text-white hover:text-gray-200 text-3xl font-bold">×</button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                  <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="e.g. Maintenance, Electricity" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Type *</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-all border-2 border-transparent hover:border-blue-200">
                      <input type="radio" name="billingMode" value="variable" checked={categoryType === "variable"} onChange={() => handleTypeChange("variable")} className="text-blue-600" />
                      <div><span className="font-semibold text-gray-800">Variable Amount</span><p className="text-sm text-gray-600">Set different amounts for each tenant</p></div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-all border-2 border-transparent hover:border-blue-200">
                      <input type="radio" name="billingMode" value="fixed" checked={categoryType === "fixed"} onChange={() => handleTypeChange("fixed")} className="text-blue-600" />
                      <div><span className="font-semibold text-gray-800">Fixed Amount</span><p className="text-sm text-gray-600">Apply the same amount to all tenants</p></div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{categoryType === "fixed" ? "Fixed Amount (₹) *" : "Default Amount (₹)"}</label>
                  <input type="number" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Enter amount" min="0" step="0.01" required={categoryType === "fixed"} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                  <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-all border-2 border-transparent hover:border-blue-200">
                    <input type="checkbox" checked={categoryStatus === "ACTIVE"} onChange={(e) => setCategoryStatus(e.target.checked ? "ACTIVE" : "INACTIVE")} className="text-blue-600" />
                    <span className="font-semibold text-gray-800">Active</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button type="button" onClick={resetCategoryForm} className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg hover:bg-gray-300 transition-all font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                  <motion.button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 text-white py-4 rounded-lg hover:from-blue-700 hover:to-green-600 transition-all font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isSubmitting ? "Saving..." : selectedCategory ? "Update Category" : "Create Category"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Assign Dues Modal */}
        {isDuesSidebarOpen && selectedCategory && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseDuesSidebar}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-200"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Assign Dues</h2>
                  <button
                    onClick={handleCloseDuesSidebar}
                    className="text-white hover:text-gray-200 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleDuesSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={selectedCategory.name}
                    disabled
                    className="w-full p-4 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tenant * ({tenants.length} available)
                  </label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loadingTenants || tenants.length === 0}
                  >
                    {loadingTenants ? (
                      <option>Loading tenants...</option>
                    ) : tenants.length === 0 ? (
                      <option>No tenants available</option>
                    ) : (
                      tenants.map((tenant) => (
                        <option key={tenant.tenantId} value={tenant.tenantId}>
                          {tenant.name} - {tenant.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={handleCloseDuesSidebar}
                    className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg hover:bg-gray-300 transition-all font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 text-white py-4 rounded-lg hover:from-blue-700 hover:to-green-600 transition-all font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? "Saving..." : "Assign Dues"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the category "
                {categoryToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dues;