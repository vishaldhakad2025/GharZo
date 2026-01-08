import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DuePackages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDuesSidebarOpen, setIsDuesSidebarOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("variable");
  const [fixedAmount, setFixedAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingLandlordId, setLoadingLandlordId] = useState(true);
  const [error, setError] = useState(null);
  const [dues, setDues] = useState([]);
  const [landlordId, setLandlordId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Detect sidebar hover state
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

  const fetchCategories = async () => {
    if (!landlordId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in as a landlord.");
      toast.error("No authentication token found. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
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
      console.log("Categories API Response:", response.data);
      const categoryData = Array.isArray(response.data.dues) ? response.data.dues : [];
      console.log("Fetched Categories:", categoryData); 
      const formattedCategories = categoryData.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        amount: category.type === "fixed" ? category.amount : "Variable Amount",
        status: category.status,
      }));
      setCategories(formattedCategories);
      if (categoryData.length === 0) {
        toast.info("No categories found for this landlord.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      setError("Failed to load categories. Please try again.");
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch categories. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  // Load saved dues once on mount
  useEffect(() => {
    const savedDues = localStorage.getItem("addedDues");
    if (savedDues) {
      setDues(JSON.parse(savedDues));
    }
  }, []);

  // Fetch tenants once on mount
  useEffect(() => {
    const fetchTenants = async () => {
      setLoadingTenants(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in as a landlord.");
        setLoadingTenants(false);
        toast.error("No authentication token found. Please login again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      try {
        const response = await axios.get(
          "https://api.gharzoreality.com/api/landlord/tenant",
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
          throw new Error("Invalid tenant data format");
        }
        if (tenantData.length > 0) {
          setSelectedTenant(tenantData[0].tenantId || tenantData[0].id);
        }
        setTenants(tenantData);
        if (tenantData.length === 0) {
          toast.warn("No tenants found for this landlord.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired or invalid token. Please login again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
          localStorage.removeItem("token");
        } else {
          setError("Failed to load tenants. Please check your token or network.");
          toast.error(
            error.response?.data?.message ||
              "Failed to fetch tenants. Please try again.",
            {
              position: "top-right",
              autoClose: 5000,
              theme: "colored",
            }
          );
        }
      } finally {
        setLoadingTenants(false);
      }
    };

    fetchTenants();
  }, []);

  // Fetch landlord ID once on mount
  useEffect(() => {
    const fetchLandlordId = async () => {
      setLoadingLandlordId(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in as a landlord.");
        toast.error("No authentication token found. Please login again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
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
          "https://api.gharzoreality.com/api/landlord/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const fetchedLandlordId = response.data.landlord?._id;
        if (fetchedLandlordId) {
          setLandlordId(fetchedLandlordId);
          localStorage.setItem("id", fetchedLandlordId);
        } else {
          throw new Error("Landlord ID not found in response");
        }
      } catch (error) {
        setError("Failed to fetch landlord ID. Please try again.");
        toast.error("Failed to fetch landlord ID. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoadingLandlordId(false);
      }
    };

    fetchLandlordId();
  }, []);

  // Fetch categories when landlordId is available
  useEffect(() => {
    if (landlordId) {
      fetchCategories();
    }
  }, [landlordId]);

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
  };

  const handleCloseDuesSidebar = () => {
    setIsDuesSidebarOpen(false);
    setSelectedCategory(null);
    setSelectedTenant("");
  };

  const handleTypeChange = (type) => {
    setCategoryType(type);
    if (type === "variable") setFixedAmount("");
  };

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
    if (categoryType === "fixed" && !fixedAmount) {
      toast.error("Please enter a fixed amount.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!landlordId) {
      toast.error("Landlord ID is missing. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      if (selectedCategory) {
        const response = await axios.put(
          `https://api.gharzoreality.com/api/dues/edit/${selectedCategory._id}`,
          {
            name: categoryName,
            type: categoryType,
            ...(categoryType === "fixed" && { amount: fixedAmount }),
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
        const response = await axios.post(
          "https://api.gharzoreality.com/api/dues/create",
          {
            name: categoryName,
            type: categoryType,
            landlordId: landlordId,
            ...(categoryType === "fixed" && { amount: fixedAmount }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Category added successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
      await fetchCategories();
      handleCloseSidebar();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${selectedCategory ? "update" : "add"} category. Please try again.`,
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  const handleToggle = async (categoryId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;

    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await axios.put(
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
      toast.success("Category status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      await fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update category status. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  const handleEdit = (category) => {
    setIsSidebarOpen(true);
    setCategoryName(category.name);
    setCategoryType(category.type);
    if (category.type === "fixed") setFixedAmount(category.amount);
    setSelectedCategory(category);
  };

  

const handleDelete = async (categoryId) => {
  // Custom Toast with Tailwind-styled Yes/No buttons
  toast(
    ({ closeToast }) => (
      <div className="p-1">
        <p className="text-sm font-medium text-gray-800 mb-3">
          Are you sure you want to delete this category?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={async () => {
              closeToast();
              await performDelete(categoryId);
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            Yes, Delete
          </button>
          <button
            onClick={closeToast}
            className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      position: "top-right",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      theme: "colored",
      className: "bg-white shadow-lg rounded-lg p-4 max-w-sm",
    }
  );
};

// Actual delete logic (tumhara original code)
const performDelete = async (categoryId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("No authentication token found. Please login again.", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return;
  }

  try {
    const response = await axios.delete(
      `https://api.gharzoreality.com/api/dues/delete/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    toast.success("Due deleted successfully!", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    await fetchCategories();
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to delete category. Please try again.",
      {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      }
    );
  }
};

  const handleAddDues = (category) => {
    setSelectedCategory(category);
    setIsDuesSidebarOpen(true);
  };

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
      toast.error("No category selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (!landlordId || typeof landlordId !== "string" || landlordId.trim() === "") {
      console.error("Invalid landlordId:", landlordId);
      toast.error("Landlord ID is invalid or missing. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please login again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const amountInput = e.target.querySelector('input[type="number"]');
    const dueDateInput = e.target.querySelector('input[type="date"]');
    const amount = amountInput ? parseFloat(amountInput.value) : selectedCategory.amount;
    const dueDate = dueDateInput
      ? dueDateInput.value
      : new Date().toISOString().split("T")[0];

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
      console.log("Sending dues assignment with landlordId:", landlordId);
      const response = await axios.post(
        "https://api.gharzoreality.com/api/dues/assign",
        {
          tenantId: selectedTenant,
          landlordId: landlordId,
          dueId: selectedCategory._id,
          amount: amount,
          dueDate: dueDate,
          isActive: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Assign Dues API Response:", response.data);

      const newDue = {
        category: selectedCategory.name,
        tenantId: response.data.tenantId,
        amount: response.data.amount,
        dueDate: response.data.dueDate,
        status: response.data.status,
      };

      const updatedDues = [...dues, newDue];
      setDues(updatedDues);
      localStorage.setItem("addedDues", JSON.stringify(updatedDues));
      toast.success("Dues assigned successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      handleCloseDuesSidebar();
    } catch (error) {
      console.error("Error assigning dues:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Failed to assign dues. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    }
  };

  return (
    <div
      className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `
          radial-gradient(circle at bottom, rgba(245,124,0,0.25), transparent 70%),
          linear-gradient(180deg, #0a1f3a 0%, #0f335c 45%, #144a7a 75%, #0d2f55 100%)
        `,
      }}
    >
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
        theme="dark"
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl mb-8 p-6 sm:p-8 border border-white/10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide bg-gradient-to-r from-orange-300 to-white bg-clip-text text-transparent drop-shadow-2xl">
            Dues Management
          </h1>
        </header>

        {/* Stats and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 font-semibold text-orange-300">
            Total Categories: {categories.length}
          </div>
          <button
            onClick={handleAddCategoryClick}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 hover:shadow-3xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-indigo-400/30">
                      <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{category.name}</h3>
                      <p className="text-xs text-gray-300 capitalize">{category.type} Type</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                      category.status === "ACTIVE"
                        ? "bg-green-600/30 text-green-200 border border-green-400/40"
                        : "bg-red-600/30 text-red-200 border border-red-400/40"
                    }`}
                  >
                    {category.status}
                  </span>
                </div>

                <div className="mb-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-sm font-medium text-gray-300">Amount</p>
                  <p className="text-xl font-bold text-orange-300">₹{category.amount}</p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-300">Active</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.status === "ACTIVE"}
                      onChange={() => handleToggle(category._id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600/50 rounded-full peer peer-checked:bg-orange-600/60 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <button
                  onClick={() => handleAddDues(category)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={category.status !== "ACTIVE" || loadingLandlordId}
                >
                  Assign Dues
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600/20 backdrop-blur-md rounded-xl text-indigo-300 border border-indigo-400/30 hover:bg-indigo-600/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/20 backdrop-blur-md rounded-xl text-red-300 border border-red-400/30 hover:bg-red-600/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Modal */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseSidebar}
          >
            <div
              className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <button
                    onClick={handleCloseSidebar}
                    className="text-white hover:text-gray-200 text-3xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="e.g. Maintenance, Electricity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Billing Type *</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-xl cursor-pointer border border-white/10 hover:border-orange-400/50 transition-all">
                      <input
                        type="radio"
                        name="billingMode"
                        value="variable"
                        checked={categoryType === "variable"}
                        onChange={() => handleTypeChange("variable")}
                        className="text-orange-500"
                      />
                      <div>
                        <span className="font-semibold text-white">Variable Amount</span>
                        <p className="text-sm text-gray-400">Set different amounts for each tenant</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-xl cursor-pointer border border-white/10 hover:border-orange-400/50 transition-all">
                      <input
                        type="radio"
                        name="billingMode"
                        value="fixed"
                        checked={categoryType === "fixed"}
                        onChange={() => handleTypeChange("fixed")}
                        className="text-orange-500"
                      />
                      <div>
                        <span className="font-semibold text-white">Fixed Amount</span>
                        <p className="text-sm text-gray-400">Apply the same amount to all tenants</p>
                      </div>
                    </label>
                  </div>
                </div>
                {categoryType === "fixed" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Fixed Amount (₹) *</label>
                    <input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseSidebar}
                    className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all font-medium border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-medium shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseDuesSidebar}
          >
            <div
              className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Assign {selectedCategory.name}
                  </h2>
                  <button
                    onClick={handleCloseDuesSidebar}
                    className="text-white hover:text-gray-200 text-3xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleDuesSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Select Tenant *</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    disabled={loadingTenants || tenants.length === 0}
                  >
                    <option value="">Choose a tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.tenantId || tenant.id} value={tenant.tenantId || tenant.id}>
                        {tenant.name ? `${tenant.name} (${tenant.tenantId || tenant.id})` : tenant.tenantId || tenant.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder={
                      selectedCategory.type === "fixed" ? `Suggested: ₹${selectedCategory.amount}` : "Enter custom amount"
                    }
                    min="0"
                    step="0.01"
                    defaultValue={selectedCategory.type === "fixed" ? selectedCategory.amount : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date *</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseDuesSidebar}
                    className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all font-medium border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                    disabled={!selectedTenant || loadingTenants || loadingLandlordId}
                  >
                    Assign Dues
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuePackages;