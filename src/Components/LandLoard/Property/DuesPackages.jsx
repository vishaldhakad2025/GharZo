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
      console.error("❌ Error assigning dues:", error.response?.data || error);
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
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 p-4 md:p-6 relative text-gray-800 transition-all duration-500 min-w-0 ${
        isSidebarHovered ? "md:ml-[256px] md:w-[calc(100%-256px)]" : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
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
        theme="light"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
            Dues Management
          </h1>
          {/* <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto md:mx-0">
            Effortlessly manage due categories, assign bills to tenants, and keep your finances organized with intuitive controls.
          </p> */}
        </div>

        {/* Stats and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="text-lg font-semibold text-indigo-700 bg-indigo-100 px-4 py-2 rounded-full">
            Total Categories: {categories.length}
          </div>
          <button
            onClick={handleAddCategoryClick}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 min-w-fit">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden flex-shrink-0 flex-grow-0"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

              <div className="relative z-10">
                {/* Icon and Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{category.type} Type</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.status}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className="text-lg font-bold text-indigo-700">₹{category.amount}</p>
                </div>

                {/* Toggle Switch */}
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

                {/* Add Dues Button */}
                <button
                  onClick={() => handleAddDues(category)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
                  disabled={category.status !== "ACTIVE" || loadingLandlordId}
                >
                  Assign Dues
                </button>

                {/* Edit and Delete Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
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

        {/* Added Dues Table 
        {dues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recently Assigned Dues
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dues.map((due, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{due.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{due.tenantId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">₹{due.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(due.dueDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
        */}

        {/* Add Category Modal */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseSidebar}
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
                    onClick={handleCloseSidebar}
                    className="text-white hover:text-gray-200 text-3xl font-bold"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Maintenance, Electricity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Type *</label>
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
                        <span className="font-semibold text-gray-800">Variable Amount</span>
                        <p className="text-sm text-gray-600">Set different amounts for each tenant</p>
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
                        <span className="font-semibold text-gray-800">Fixed Amount</span>
                        <p className="text-sm text-gray-600">Apply the same amount to all tenants</p>
                      </div>
                    </label>
                  </div>
                </div>
                {categoryType === "fixed" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fixed Amount (₹) *</label>
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
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                  <p className="font-medium mb-2">What happens next:</p>
                  <ul className="space-y-1 list-disc pl-5">
                    <li>Category will be ready for tenant assignments</li>
                    <li>Toggle active status anytime</li>
                    <li>Edit or delete as needed</li>
                  </ul>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseSidebar}
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

        {/* Add Dues Modal */}
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Assign {selectedCategory.name}
                  </h2>
                  <button
                    onClick={handleCloseDuesSidebar}
                    className="text-white hover:text-gray-200 text-3xl font-bold"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <form onSubmit={handleDuesSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tenant *</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    disabled={loadingTenants || tenants.length === 0}
                  >
                    <option value="">Choose a tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.tenantId || tenant.id} value={tenant.tenantId || tenant.id}>
                        {tenant.name ? `${tenant.name} (${tenant.tenantId || tenant.id})` : tenant.tenantId || tenant.id}
                      </option>
                    ))}
                  </select>
                  {loadingTenants && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder={
                      selectedCategory.type === "fixed" ? `Suggested: ₹${selectedCategory.amount}` : "Enter custom amount"
                    }
                    min="0"
                    step="0.01"
                    defaultValue={selectedCategory.type === "fixed" ? selectedCategory.amount : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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