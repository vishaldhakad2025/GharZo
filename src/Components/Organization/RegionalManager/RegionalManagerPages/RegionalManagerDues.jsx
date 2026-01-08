import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const DuePackages = () => {
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
  const [loadingSubOwnerId, setLoadingSubOwnerId] = useState(true);
  const [error, setError] = useState(null);
  const [dues, setDues] = useState([]);
  const [subOwnerId, setSubOwnerId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);

  // Helper to get token and validate
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

  // Fetch SubOwner ID and Property ID
  const fetchSubOwnerId = async () => {
    setLoadingSubOwnerId(true);
    const token = getToken();
    if (!token) {
      setError("No token found. Please log in.");
      setLoadingSubOwnerId(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://api.gharzoreality.com/api/sub-owner/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedSubOwnerId = response.data.subOwner.id;
      const fetchedPropertyId = response.data.subOwner.assignedProperties?.[0]?.property.id;

      if (!fetchedSubOwnerId) {
        throw new Error("Sub-owner ID not found in profile.");
      }

      setSubOwnerId(fetchedSubOwnerId);
      localStorage.setItem("subOwnerId", fetchedSubOwnerId);

      if (fetchedPropertyId) {
        setPropertyId(fetchedPropertyId);
        localStorage.setItem("propertyId", fetchedPropertyId);
      } else {
        toast.warn("No properties found for this sub-owner.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }

      await fetchCategories(fetchedSubOwnerId);
      if (fetchedPropertyId) {
        await fetchTenants(fetchedPropertyId);
      }
    } catch (error) {
      const decoded = decodeToken(token);
      if (decoded && decoded.id) {
        setSubOwnerId(decoded.id);
        localStorage.setItem("subOwnerId", decoded.id);
        const storedPropertyId = localStorage.getItem("propertyId");
        if (storedPropertyId) {
          setPropertyId(storedPropertyId);
          await fetchTenants(storedPropertyId);
        }
        await fetchCategories(decoded.id);
        toast.warn("Failed to fetch profile, using token for sub-owner ID.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        setError("Failed to fetch sub-owner profile. Please log in.");
        toast.error(
          error.response?.data?.message || "Failed to fetch sub-owner profile.",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );
      }
    } finally {
      setLoadingSubOwnerId(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async (subOwnerId) => {
    const token = getToken();
    if (!token || !subOwnerId) return;

    try {
      const response = await axios.get(
        "https://api.gharzoreality.com/api/subowner/dues",
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
        amount: category.type === "fixed" ? category.amount : "Variable Amount",
        status: category.status,
      }));
      setCategories(formattedCategories);
      if (categoryData.length === 0) {
        toast.info("No categories found.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      setError("Failed to load categories.");
      toast.error(
        error.response?.data?.message || "Failed to fetch categories.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  // Fetch Tenants
  const fetchTenants = async (propId) => {
    setLoadingTenants(true);
    const token = getToken();
    if (!token || !propId) {
      setLoadingTenants(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propId}/tenants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tenantData =
        response.data.tenants || response.data.data || response.data || [];
      if (!Array.isArray(tenantData)) {
        throw new Error("Invalid tenant data format.");
      }
      setTenants(tenantData);
      if (tenantData.length > 0) {
        setSelectedTenant(tenantData[0].tenantId || tenantData[0].id);
      } else {
        toast.warn("No tenants found for this property.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      setError("Failed to load tenants.");
      toast.error(error.response?.data?.message || "Failed to fetch tenants.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setLoadingTenants(false);
    }
  };

  // Create or Update Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      toast.error("Please enter a due type name.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (categoryType === "fixed" && (!fixedAmount || fixedAmount <= 0)) {
      toast.error("Please enter a valid fixed amount.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!subOwnerId) {
      toast.error("Sub-owner ID is missing. Please log in.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      if (selectedCategory) {
        await axios.put(
          `https://api.gharzoreality.com/api/subowner/dues/${selectedCategory._id}`,
          {
            name: categoryName,
            type: categoryType,
            ...(categoryType === "fixed" && {
              amount: parseFloat(fixedAmount),
            }),
            subOwnerId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        await axios.post(
          "https://api.gharzoreality.com/api/subowner/dues/create",
          {
            subOwnerId,
            name: categoryName,
            type: categoryType,
            ...(categoryType === "fixed" && {
              amount: parseFloat(fixedAmount),
            }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category created successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
      await fetchCategories(subOwnerId);
      setIsSidebarOpen(false);
      setCategoryName("");
      setCategoryType("variable");
      setFixedAmount("");
      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${selectedCategory ? "update" : "create"} category.`,
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  // Toggle Category Status
  const handleToggle = async (categoryId) => {
    const token = getToken();
    if (!token) return;

    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;

    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await axios.put(
        `https://api.gharzoreality.com/api/subowner/dues/${categoryId}`,
        { status: newStatus, subOwnerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Category status updated!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      await fetchCategories(subOwnerId);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update category status.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  // Handle Delete
  const handleDelete = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const token = getToken();
    if (!token) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await axios.delete(
        `https://api.gharzoreality.com/api/subowner/dues/${categoryToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { subOwnerId },
        }
      );
      toast.success("Category deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      await fetchCategories(subOwnerId);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete category.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Assign Dues
  const handleDuesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenant) {
      toast.error("Please select a tenant.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!selectedCategory) {
      toast.error("No category selected.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!subOwnerId) {
      toast.error("Sub-owner ID is missing. Please log in.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const token = getToken();
    if (!token) return;

    const amount = parseFloat(dueAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!dueDate) {
      toast.error("Please select a valid due date.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://api.gharzoreality.com/api/subowner/dues/assign",
        {
          tenantId: selectedTenant,
          dueId: selectedCategory._id,
          amount,
          dueDate,
          subOwnerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newDue = {
        _id: response.data._id,
        category: selectedCategory.name,
        tenantId: selectedTenant,
        amount,
        dueDate,
        status: response.data.status || "PENDING",
      };

      const updatedDues = [...dues, newDue];
      setDues(updatedDues);
      localStorage.setItem("addedDues", JSON.stringify(updatedDues));
      toast.success("Dues assigned successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setIsDuesSidebarOpen(false);
      setSelectedTenant("");
      setDueAmount("");
      setDueDate("");
    } catch (error) {
      console.error("Error assigning dues:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to assign dues.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  // Effect to initialize data
  useEffect(() => {
    const savedDues = localStorage.getItem("addedDues");
    if (savedDues) {
      setDues(JSON.parse(savedDues));
    }
    fetchSubOwnerId();
  }, []);

  // Handlers for UI
  const handleAddCategoryClick = () => {
    setIsSidebarOpen(true);
    setCategoryName("");
    setCategoryType("variable");
    setFixedAmount("");
    setSelectedCategory(null);
  };

  const handleEdit = (category) => {
    setIsSidebarOpen(true);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setFixedAmount(category.type === "fixed" ? category.amount : "");
    setSelectedCategory(category);
  };

  const handleTypeChange = (type) => {
    setCategoryType(type);
    if (type === "variable") setFixedAmount("");
  };

  const handleAddDues = (category) => {
    setSelectedCategory(category);
    setDueAmount(category.type === "fixed" ? category.amount : "");
    setDueDate(new Date().toISOString().split("T")[0]);
    setIsDuesSidebarOpen(true);
  };

  const handleCloseDuesSidebar = () => {
    setIsDuesSidebarOpen(false);
    setSelectedTenant("");
    setDueAmount("");
    setDueDate("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 p-4 md:p-6 relative text-gray-800">
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
        theme="light"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
            Dues Management
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto md:mx-0">
            Effortlessly manage due categories, assign bills to tenants, and
            keep your finances organized with intuitive controls.
          </p>
        </div>

        {/* Stats and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="textLg font-semibold text-indigo-700 bg-indigo-100 px-4 py-2 rounded-full">
            Total Categories: {categories.length}
          </div>
          <button
            onClick={handleAddCategoryClick}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto flex items-center justify-center gap-2"
            disabled={loadingSubOwnerId}
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
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Category
          </button>
        </div>

        {/* Loading State */}
        {loadingSubOwnerId && (
          <div className="text-center py-8">
            <svg
              className="w-8 h-8 animate-spin mx-auto text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loadingSubOwnerId && (
          <div className="text-center py-8 text-red-600">{error}</div>
        )}

        {/* Categories Grid */}
        {!loadingSubOwnerId && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {category.type} Type
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {category.status}
                    </span>
                  </div>
                  <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-lg font-bold text-indigo-700">
                      {category.type === "fixed"
                        ? `₹${category.amount}`
                        : category.amount}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
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
                  <button
                    onClick={() => handleAddDues(category)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
                    disabled={!selectedTenant}
                  >
                    Assign Dues
                  </button>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dues Table */}
        {dues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Recently Assigned Dues
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dues.map((due) => (
                    <tr
                      key={due._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {due._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {due.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {due.tenantId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                        ₹{due.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(due.dueDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            due.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {due.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Category Modal */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white hover:text-gray-200 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Maintenance, Electricity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Billing Type *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border-2 border-transparent hover:border-indigo-200">
                      <input
                        type="radio"
                        name="billingMode"
                        value="variable"
                        checked={categoryType === "variable"}
                        onChange={() => handleTypeChange("variable")}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-800">
                          Variable Amount
                        </span>
                        <p className="text-sm text-gray-600">
                          Set different amounts for each tenant
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border-2 border-transparent hover:border-indigo-200">
                      <input
                        type="radio"
                        name="billingMode"
                        value="fixed"
                        checked={categoryType === "fixed"}
                        onChange={() => handleTypeChange("fixed")}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-800">
                          Fixed Amount
                        </span>
                        <p className="text-sm text-gray-600">
                          Apply the same amount to all tenants
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                {categoryType === "fixed" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fixed Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-medium shadow-lg"
                  >
                    {selectedCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Dues Modal */}
        {isDuesSidebarOpen && selectedCategory && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseDuesSidebar}
          >
            <div
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    Assign {selectedCategory.name}
                  </h2>
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
                    Select Tenant *
                  </label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    disabled={loadingTenants || tenants.length === 0}
                  >
                    <option value="">Choose a tenant</option>
                    {tenants.map((tenant) => (
                      <option
                        key={tenant.tenantId || tenant.id}
                        value={tenant.tenantId || tenant.id}
                      >
                        {tenant.name
                          ? `${tenant.name} (${tenant.tenantId || tenant.id})`
                          : tenant.tenantId || tenant.id}
                      </option>
                    ))}
                  </select>
                  {loadingTenants && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading tenants...
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder={
                      selectedCategory.type === "fixed"
                        ? `Fixed: ₹${selectedCategory.amount}`
                        : "Enter custom amount"
                    }
                    disabled={selectedCategory.type === "fixed"}
                    min="0"
                    step="0.01"
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
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseDuesSidebar}
                    className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!selectedTenant || loadingTenants}
                  >
                    Assign Dues
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && categoryToDelete && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Category
                  </h2>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-white hover:text-gray-200 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-lg mb-4">
                  Are you sure you want to delete the category{" "}
                  <span className="font-semibold">
                    "{categoryToDelete.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-lg"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuePackages;