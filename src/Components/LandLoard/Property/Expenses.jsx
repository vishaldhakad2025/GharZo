import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [landlordId, setLandlordId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseData, setExpenseData] = useState({
    property: "",
    category: "",
    amount: "",
    date: "2025-09-14",
    paidBy: "Landlord",
    paidTo: "",
    description: "",
    collectionMode: "",
    billImage: null,
  });
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    paidBy: "",
    paidTo: "",
    page: 1,
    limit: 10,
  });
  const [year, setYear] = useState("2025");
  const [categorySummaryYear, setCategorySummaryYear] = useState("2025");
  const [categorySummaryMonth, setCategorySummaryMonth] = useState("9");
  const location = useLocation();
  const token = localStorage.getItem("token");
  const sliderRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);
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

  // Fetch landlord profile to get landlordId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("No token found in localStorage. Please log in.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          "https://api.gharzoreality.com/api/landlord/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setLandlordId(data.landlord._id);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch profile: ${errorData.message || "Unauthorized"}`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching the profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          "https://api.gharzoreality.com/api/landlord/properties",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties || []);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch properties: ${errorData.message || "Unauthorized"}`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching properties");
      }
    };
    if (landlordId) {
      fetchProperties();
    }
  }, [token, landlordId]);

  // Fetch categories, expenses, and analytics
  useEffect(() => {
    if (!landlordId || !token) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/expense-categories?landlord=${landlordId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok || response.status === 304) {
          const data = await response.json();
          setCategories(
            data.map((category) => ({
              name: category.name || "",
              count: category.count || 0,
              id: category._id,
            }))
          );
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch categories: ${errorData.message || "Unauthorized"}`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching categories");
      }
    };
    const fetchExpenses = async () => {
      try {
        let url = `https://api.gharzoreality.com/api/expenses?landlord=${landlordId}`;
        const hasFilters =
          filters.category ||
          filters.startDate ||
          filters.endDate ||
          filters.paidBy ||
          filters.paidTo;
        if (hasFilters) {
          const queryParams = new URLSearchParams({
            page: filters.page,
            limit: filters.limit,
            landlord: landlordId,
            ...(filters.category && { category: filters.category }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
            ...(filters.paidBy && { paidBy: filters.paidBy }),
            ...(filters.paidTo && { paidTo: filters.paidTo }),
          });
          url = `https://api.gharzoreality.com/api/expenses?${queryParams}`;
        }
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setExpenses(data.expenses || []);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch expenses: ${errorData.message || "Unauthorized"}`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching expenses");
      }
    };
    const fetchMonthlyExpenses = async () => {
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/expenses/analytics/monthly-trend?landlord=${landlordId}&year=${year}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMonthlyData(
            data.monthlyData.map((item) => item.totalAmount) || []
          );
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch monthly expenses: ${
              errorData.message || "Unauthorized"
            }`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching monthly expenses");
      }
    };
    const fetchYearlyExpenses = async () => {
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/expenses/analytics/yearly-trend?landlord=${landlordId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setYearlyData(data.yearlyData || []);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch yearly expenses: ${
              errorData.message || "Unauthorized"
            }`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching yearly expenses");
      }
    };
    fetchCategories();
    fetchExpenses();
    fetchMonthlyExpenses();
    fetchYearlyExpenses();
  }, [token, landlordId, filters, year]);

  // Fetch category summary with year and month filters
  useEffect(() => {
    if (
      !token ||
      !landlordId ||
      !categorySummaryYear ||
      !categorySummaryMonth
    ) {
      setCategorySummary(null);
      return;
    }
    const fetchCategorySummary = async () => {
      try {
        const url = `https://api.gharzoreality.com/api/expenses/analytics/summary?landlord=${landlordId}&year=${categorySummaryYear}&month=${categorySummaryMonth}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCategorySummary(data);
        } else {
          setCategorySummary(null);
        }
      } catch (error) {
        console.error("Error fetching category summary:", error);
        setCategorySummary(null);
      }
    };
    fetchCategorySummary();
  }, [token, landlordId, categorySummaryYear, categorySummaryMonth]);

  const fetchCategoryById = async (categoryId) => {
    if (!token || !landlordId || !categoryId) {
      setError("Missing token, landlord ID, or category ID.");
      return;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/expense-categories/${categoryId}?landlord=${landlordId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok || response.status === 304) {
        const data = await response.json();
        setSelectedCategory({
          name: data.name || "",
          count: data.count || 0,
          id: data._id,
        });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to fetch category: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while fetching the category");
    }
  };

  const fetchExpenseById = async (expenseId) => {
    if (!token || !expenseId) {
      setError("Missing token or expense ID.");
      return null;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/expenses/${expenseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setError(null);
        return data;
      } else {
        const errorData = await response.json();
        setError(
          `Failed to fetch expense: ${errorData.message || "Unauthorized"}`
        );
        return null;
      }
    } catch (error) {
      setError("An error occurred while fetching the expense");
      return null;
    }
  };

  const handleUpdateCategory = async () => {
    if (!landlordId || !token || !categoryName || !editCategoryId) {
      setError(
        "Please provide Landlord ID, Token, Category Name, and Category ID"
      );
      return;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/expense-categories/${editCategoryId}?landlord=${landlordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryName,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(
          categories.map((category) =>
            category.id === editCategoryId
              ? { ...category, name: data.category.name }
              : category
          )
        );
        if (selectedCategory && selectedCategory.id === editCategoryId) {
          setSelectedCategory({
            ...selectedCategory,
            name: data.category.name,
          });
        }
        setCategoryName("");
        setEditCategoryId(null);
        setIsUpdating(false);
        setIsEditCategoryOpen(false);
        setSuccessMessage("Category updated successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to update category: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while updating the category");
    }
  };

  const handleAddCategory = async () => {
    if (!landlordId || !token || !categoryName) {
      setError("Please provide Landlord ID, Token, and Category Name");
      return;
    }
    try {
      const response = await fetch(
        "https://api.gharzoreality.com/api/expense-categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryName,
            landlord: landlordId,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCategories([
          ...categories,
          { name: data.category.name, count: 0, id: data.category._id },
        ]);
        setCategoryName("");
        setIsAddCategoryOpen(false);
        setSuccessMessage("Category added successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to add category: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while adding the category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!landlordId || !token || !categoryId) {
      setError("Please provide Landlord ID, Token, and Category ID");
      return;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/expense-categories/${categoryId}?landlord=${landlordId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setCategories(
          categories.filter((category) => category.id !== categoryId)
        );
        setSelectedCategory(null);
        setSuccessMessage("Category deleted successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to delete category: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while deleting the category");
    }
  };

  const handleAddExpense = async () => {
    if (!token || !landlordId) {
      setError("Missing token or landlord ID.");
      return;
    }
    if (
      !expenseData.category ||
      !expenseData.amount ||
      !expenseData.date ||
      !expenseData.paidBy ||
      !expenseData.paidTo ||
      !expenseData.description ||
      !expenseData.collectionMode
    ) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("category", expenseData.category);
      formData.append("amount", expenseData.amount);
      formData.append("date", new Date(expenseData.date).toISOString());
      formData.append("paidBy", expenseData.paidBy);
      formData.append("paidTo", expenseData.paidTo);
      formData.append("description", expenseData.description);
      formData.append("collectionMode", expenseData.collectionMode);
      formData.append("landlord", landlordId);
      if (expenseData.property) {
        formData.append("property", expenseData.property);
      }
      if (expenseData.billImage) {
        formData.append("billImage", expenseData.billImage);
      }
      const response = await fetch("https://api.gharzoreality.com/api/expenses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses([...expenses, data.expense]);
        setSuccessMessage(data.message || "Expense added successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsModalOpen(false);
        setExpenseData({
          property: "",
          category: "",
          amount: "",
          date: "2025-09-14",
          paidBy: "Landlord",
          paidTo: "",
          description: "",
          collectionMode: "",
          billImage: null,
        });
        setSelectedCategory(null);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to add expense: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while adding the expense");
    }
  };

  const handleUpdateExpense = async () => {
    if (!token || !landlordId || !editExpenseId) {
      setError("Missing token, landlord ID, or expense ID.");
      return;
    }
    if (
      !expenseData.category ||
      !expenseData.amount ||
      !expenseData.date ||
      !expenseData.paidBy ||
      !expenseData.paidTo ||
      !expenseData.description ||
      !expenseData.collectionMode
    ) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("category", expenseData.category);
      formData.append("amount", expenseData.amount);
      formData.append("date", new Date(expenseData.date).toISOString());
      formData.append("paidBy", expenseData.paidBy);
      formData.append("paidTo", expenseData.paidTo);
      formData.append("description", expenseData.description);
      formData.append("collectionMode", expenseData.collectionMode);
      formData.append("landlord", landlordId);
      if (expenseData.property) {
        formData.append("property", expenseData.property);
      }
      if (expenseData.billImage) {
        formData.append("billImage", expenseData.billImage);
      }
      const response = await fetch(
        `https://api.gharzoreality.com/api/expenses/${editExpenseId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        const data = await response.json();
        setExpenses(
          expenses.map((expense) =>
            expense._id === editExpenseId ? data.expense : expense
          )
        );
        setSuccessMessage(data.message || "Expense updated successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsEditExpenseOpen(false);
        setEditExpenseId(null);
        setExpenseData({
          property: "",
          category: "",
          amount: "",
          date: "2025-09-14",
          paidBy: "Landlord",
          paidTo: "",
          description: "",
          collectionMode: "",
          billImage: null,
        });
        setSelectedCategory(null);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to update expense: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while updating the expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!token || !expenseId) {
      setError("Missing token or expense ID.");
      return;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setExpenses(expenses.filter((expense) => expense._id !== expenseId));
        setSuccessMessage(data.message || "Expense deleted successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(
          `Failed to delete expense: ${errorData.message || "Unauthorized"}`
        );
      }
    } catch (error) {
      setError("An error occurred while deleting the expense");
    }
  };

  const openEditCategoryModal = (category) => {
    setCategoryName(category.name || "");
    setEditCategoryId(category.id);
    setIsEditCategoryOpen(true);
  };

  const openEditExpenseModal = (expense) => {
    setExpenseData({
      property: expense.property || "",
      category: expense.category?._id || expense.category || "",
      amount: expense.amount?.toString() || "",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "2025-09-14",
      paidBy: expense.paidBy || "Landlord",
      paidTo: expense.paidTo || "",
      description: expense.description || "",
      collectionMode: expense.collectionMode || "",
      billImage: null,
    });
    setEditExpenseId(expense._id);
    setIsEditExpenseOpen(true);
    if (expense.category?._id || expense.category) {
      fetchCategoryById(expense.category._id || expense.category);
    }
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      paidBy: "",
      paidTo: "",
      page: 1,
      limit: 10,
    });
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const uniquePaidBy = [
    ...new Set(expenses.map((expense) => expense.paidBy)),
  ].filter(Boolean);
  const uniquePaidTo = [
    ...new Set(expenses.map((expense) => expense.paidTo)),
  ].filter(Boolean);

  const rentExpenses = expenses.filter((expense) => {
    try {
      return (
        expense.category &&
        typeof expense.category === "object" &&
        expense.category.name &&
        typeof expense.category.name === "string" &&
        expense.category.name.toLowerCase().includes("rent")
      );
    } catch (e) {
      console.error("Error filtering expense:", expense, e);
      return false;
    }
  });

  const yearOptions = [];
  for (let y = 2020; y <= 2030; y++) {
    yearOptions.push(y.toString());
  }

  const monthOptions = [
    { value: "1", label: "Jan" },
    { value: "2", label: "Feb" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Apr" },
    { value: "5", label: "May" },
    { value: "6", label: "Jun" },
    { value: "7", label: "Jul" },
    { value: "8", label: "Aug" },
    { value: "9", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  return (
    <div
      className={`min-h-screen text-white transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `
          radial-gradient(circle at bottom, rgba(245,124,0,0.35), transparent 60%),
          linear-gradient(180deg, #071a2f 0%, #0d2f52 45%, #123e6b 75%, #0b2a4a 100%)
        `,
      }}
    >
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-32 h-32 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin [animation-delay:0.15s] [animation-duration:1.5s]"></div>
                <div className="absolute inset-0 w-32 h-32 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin [animation-delay:0.3s] [animation-duration:1.2s]"></div>
              </div>
              <h3 className="mt-8 text-3xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Crafting your dashboard...
              </h3>
              <p className="mt-2 text-gray-300 animate-pulse">
                Gathering your expense insights
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="relative bg-white/10 backdrop-blur-md border border-red-500/30 rounded-3xl p-6 mb-8 shadow-xl">
                  <div className="absolute top-0 right-0 pt-3 pr-3">
                    <button
                      onClick={() => setError(null)}
                      className="p-2 text-red-300 hover:text-red-100 rounded-full hover:bg-red-500/20 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-300">
                        Something went wrong
                      </h3>
                      <p className="text-red-200 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              {showSuccess && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-white/20 backdrop-blur-md border border-green-500/30 rounded-full px-8 py-4 shadow-2xl max-w-md">
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-green-200 font-semibold">
                        {successMessage}
                      </p>
                      <button
                        onClick={() => setShowSuccess(false)}
                        className="ml-auto text-green-300 hover:text-green-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4 text-center">
                <div className="space-y-1">
                  <h2 className="text-4xl lg:mt-0 mt-8 font-bold tracking-wide bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                    Expenses
                  </h2>
                </div>
                <button
                  className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 px-4 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 group lg:ml-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span>Add Expense</span>
                  <svg
                    className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="group relative overflow-hidden rounded-3xl p-6 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-300 uppercase">Total Expenses</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      ₹{expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">
                      {expenses.length} transactions
                    </p>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-3xl p-6 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-2xl">
                        <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-300 uppercase">Categories</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      {categories.length}
                    </p>
                    <p className="text-sm text-gray-300">
                      {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)} items
                    </p>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-3xl p-6 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-500/20 rounded-2xl">
                        <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-300 uppercase">This Month</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      ₹{(monthlyData[new Date().getMonth()] || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">
                      {new Date().toLocaleString('default', { month: 'long' })} expenses
                    </p>
                  </div>
                </div>
              </div>
              {/* Category Summary */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-2xl mb-8 border border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">
                      Category Summary
                    </h2>
                    <p className="text-gray-300">Breakdown of your expenses</p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white focus:ring-2 focus:ring-indigo-500"
                      value={categorySummaryYear}
                      onChange={(e) => setCategorySummaryYear(e.target.value)}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y} className="bg-gray-900">
                          {y}
                        </option>
                      ))}
                    </select>
                    <select
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white focus:ring-2 focus:ring-purple-500"
                      value={categorySummaryMonth}
                      onChange={(e) => setCategorySummaryMonth(e.target.value)}
                    >
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value} className="bg-gray-900">
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">
                      Grand Total
                    </h3>
                    <p className="text-4xl font-bold text-white">
                      ₹{categorySummary?.grandTotal?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      {categorySummary?.year} -{" "}
                      {
                        monthOptions.find(
                          (m) => m.value === categorySummary?.month
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="col-span-1 lg:col-span-1">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      By Category
                    </h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {categorySummary &&
                      Array.isArray(categorySummary.summary) &&
                      categorySummary.summary.length > 0 ? (
                        categorySummary.summary.map((item, idx) => {
                          const category = categories.find(
                            (cat) => cat.id === item._id
                          );
                          const categoryName = category
                            ? category.name
                            : item._id || "Unassigned";
                          return (
                            <div
                              key={item._id || idx}
                              className="bg-white/10 rounded-xl p-4 shadow-sm border border-white/20"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">
                                  {categoryName}
                                </span>
                                <span className="text-lg font-bold text-indigo-300">
                                  ₹{item.totalAmount?.toLocaleString() || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-sm text-gray-300">
                                <span>{item.count || 0} transactions</span>
                              </div>
                              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  style={{
                                    width: `${
                                      (item.totalAmount /
                                        categorySummary.grandTotal) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-300">
                          No category data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Rent Payments */}
              {rentExpenses.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl mb-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Rent Payments
                  </h2>
                  <div className="relative">
                    <div
                      ref={sliderRef}
                      className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-hide"
                    >
                      {rentExpenses.map((expense) => (
                        <div
                          key={expense._id}
                          className="min-w-[280px] flex-shrink-0 snap-center"
                        >
                          <div className="bg-white/10 rounded-2xl p-6 shadow-md border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                                Paid
                              </span>
                              <span className="text-sm text-gray-300">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-3xl font-bold text-green-300 mb-2">
                              ₹{expense.amount.toLocaleString()}
                            </p>
                            <p className="text-gray-200">
                              To: {expense.paidTo}
                            </p>
                            <p className="text-sm text-gray-300 mt-1">
                              Mode: {expense.collectionMode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Yearly and Monthly */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Yearly Summary
                  </h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {yearlyData.map((item) => (
                      <div
                        key={item.year}
                        className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20"
                      >
                        <span className="font-semibold text-white">
                          {item.year}
                        </span>
                        <span className="text-xl font-bold text-indigo-300">
                          ₹{item.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Monthly Summary
                    </h2>
                    <select
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y} className="bg-gray-900">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {monthlyData.map((amount, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20"
                      >
                        <span className="font-semibold text-white">
                          {
                            [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ][index]
                          }
                        </span>
                        <span className="text-xl font-bold text-purple-300">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Expenses Table */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 sm:p-8 shadow-2xl overflow-x-auto border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Expense List
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-sm">
                    <thead>
                      <tr className="bg-white/10 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        <th className="px-2 sm:px-6 py-4">Date</th>
                        <th className="px-2 sm:px-6 py-4">Category</th>
                        <th className="px-2 sm:px-6 py-4">Amount</th>
                        <th className="px-2 sm:px-6 py-4">Mode</th>
                        <th className="px-2 sm:px-6 py-4">Paid By</th>
                        <th className="px-2 sm:px-6 py-4">Paid To</th>
                        <th className="px-2 sm:px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {expenses.map((expense) => (
                        <tr
                          key={expense._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-200">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-200">
                            {expense.category?.name || "Unknown"}
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm font-bold text-white">
                            ₹{expense.amount.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                              {expense.collectionMode}
                            </span>
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-200">
                            {expense.paidBy}
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-200">
                            {expense.paidTo}
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm">
                            <button
                              className="mr-3 text-indigo-300 hover:text-indigo-100"
                              onClick={() => openEditExpenseModal(expense)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-300 hover:text-red-100"
                              onClick={() => handleDeleteExpense(expense._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Expense Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-2xl m-2 sm:m-4 max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="sticky top-0 bg-gray-800/95 p-6 border-b border-white/10 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">
                          Add New Expense
                        </h3>
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Property (Optional)
                          </label>
                          <select
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                            value={expenseData.property}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                property: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Property</option>
                            {properties.map((property) => (
                              <option key={property._id} value={property._id}>
                                {property.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-white"
                              value={expenseData.category}
                              onChange={(e) => {
                                const categoryId = e.target.value;
                                setExpenseData({
                                  ...expenseData,
                                  category: categoryId,
                                });
                                if (categoryId) fetchCategoryById(categoryId);
                              }}
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            <button
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                              onClick={() => setIsAddCategoryOpen(true)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      {selectedCategory && (
                        <div className="bg-indigo-500/20 p-4 rounded-lg space-y-2 border border-indigo-500/30">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-indigo-300">
                              {selectedCategory.name}
                            </span>
                            <div className="space-x-2">
                              {!isUpdating ? (
                                <button
                                  className="text-yellow-400 hover:text-yellow-300"
                                  onClick={() => {
                                    setCategoryName(selectedCategory.name);
                                    setEditCategoryId(selectedCategory.id);
                                    setIsUpdating(true);
                                  }}
                                >
                                  Update
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) =>
                                      setCategoryName(e.target.value)
                                    }
                                    className="p-2 bg-gray-700 border border-white/20 rounded text-white"
                                  />
                                  <button
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    onClick={handleUpdateCategory}
                                  >
                                    Save
                                  </button>
                                </div>
                              )}
                              <button
                                className="text-red-400 hover:text-red-300"
                                onClick={() =>
                                  handleDeleteCategory(selectedCategory.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount
                          </label>
                          <input
                            type="number"
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white"
                            placeholder="Enter amount"
                            value={expenseData.amount}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                amount: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                            value={expenseData.date}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paid By
                          </label>
                          <p className="p-3 bg-gray-700 border border-white/20 rounded-lg text-white">Landlord</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paid To
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                            placeholder="Recipient name"
                            value={expenseData.paidTo}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                paidTo: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y min-h-[100px] text-white"
                          placeholder="Describe the expense"
                          value={expenseData.description}
                          onChange={(e) =>
                            setExpenseData({
                              ...expenseData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payment Mode
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {["Cash", "GPay", "PhonePe", "Paytm", "UPI"].map(
                            (mode) => (
                              <button
                                key={mode}
                                className={`p-3 rounded-lg font-medium transition-all ${
                                  expenseData.collectionMode === mode
                                    ? "bg-indigo-600 text-white shadow-md"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                                onClick={() =>
                                  setExpenseData({
                                    ...expenseData,
                                    collectionMode: mode,
                                  })
                                }
                              >
                                {mode}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Upload Bill (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full p-3 border border-dashed border-white/30 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/30 file:text-white hover:file:bg-indigo-600/50 transition-all"
                          onChange={(e) =>
                            setExpenseData({
                              ...expenseData,
                              billImage: e.target.files[0],
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          className="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                          onClick={handleAddExpense}
                        >
                          Add Expense
                        </button>
                        <button
                          className="flex-1 bg-gray-700 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Expense Modal */}
              {isEditExpenseOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-2xl m-2 sm:m-4 max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="sticky top-0 bg-gray-800/95 p-6 border-b border-white/10 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">
                          Edit Expense
                        </h3>
                        <button
                          onClick={() => {
                            setIsEditExpenseOpen(false);
                            setEditExpenseId(null);
                            setExpenseData({
                              property: "",
                              category: "",
                              amount: "",
                              date: "2025-09-14",
                              paidBy: "Landlord",
                              paidTo: "",
                              description: "",
                              collectionMode: "",
                              billImage: null,
                            });
                            setSelectedCategory(null);
                          }}
                          className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Property (Optional)
                          </label>
                          <select
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                            value={expenseData.property}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                property: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Property</option>
                            {properties.map((property) => (
                              <option key={property._id} value={property._id}>
                                {property.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-white"
                              value={expenseData.category}
                              onChange={(e) => {
                                const categoryId = e.target.value;
                                setExpenseData({
                                  ...expenseData,
                                  category: categoryId,
                                });
                                if (categoryId) fetchCategoryById(categoryId);
                              }}
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            <button
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                              onClick={() => setIsAddCategoryOpen(true)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      {selectedCategory && (
                        <div className="bg-indigo-500/20 p-4 rounded-lg space-y-2 border border-indigo-500/30">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-indigo-300">
                              {selectedCategory.name}
                            </span>
                            <div className="space-x-2">
                              {!isUpdating ? (
                                <button
                                  className="text-yellow-400 hover:text-yellow-300"
                                  onClick={() => {
                                    setCategoryName(selectedCategory.name);
                                    setEditCategoryId(selectedCategory.id);
                                    setIsUpdating(true);
                                  }}
                                >
                                  Update
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) =>
                                      setCategoryName(e.target.value)
                                    }
                                    className="p-2 bg-gray-700 border border-white/20 rounded text-white"
                                  />
                                  <button
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    onClick={handleUpdateCategory}
                                  >
                                    Save
                                  </button>
                                </div>
                              )}
                              <button
                                className="text-red-400 hover:text-red-300"
                                onClick={() =>
                                  handleDeleteCategory(selectedCategory.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount
                          </label>
                          <input
                            type="number"
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white"
                            placeholder="Enter amount"
                            value={expenseData.amount}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                amount: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                            value={expenseData.date}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paid By
                          </label>
                          <select
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                            value={expenseData.paidBy}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                paidBy: e.target.value,
                              })
                            }
                          >
                            <option value="Landlord">Landlord</option>
                            {uniquePaidBy.map((payer) => (
                              <option key={payer} value={payer}>
                                {payer}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paid To
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                            placeholder="Recipient name"
                            value={expenseData.paidTo}
                            onChange={(e) =>
                              setExpenseData({
                                ...expenseData,
                                paidTo: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y min-h-[100px] text-white"
                          placeholder="Describe the expense"
                          value={expenseData.description}
                          onChange={(e) =>
                            setExpenseData({
                              ...expenseData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payment Mode
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {["Cash", "GPay", "PhonePe", "Paytm", "UPI"].map(
                            (mode) => (
                              <button
                                key={mode}
                                className={`p-3 rounded-lg font-medium transition-all ${
                                  expenseData.collectionMode === mode
                                    ? "bg-indigo-600 text-white shadow-md"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                                onClick={() =>
                                  setExpenseData({
                                    ...expenseData,
                                    collectionMode: mode,
                                  })
                                }
                              >
                                {mode}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Upload Bill (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full p-3 border border-dashed border-white/30 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/30 file:text-white hover:file:bg-indigo-600/50 transition-all"
                          onChange={(e) =>
                            setExpenseData({
                              ...expenseData,
                              billImage: e.target.files[0],
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          className="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                          onClick={handleUpdateExpense}
                        >
                          Update Expense
                        </button>
                        <button
                          className="flex-1 bg-gray-700 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                          onClick={() => {
                            setIsEditExpenseOpen(false);
                            setEditExpenseId(null);
                            setExpenseData({
                              property: "",
                              category: "",
                              amount: "",
                              date: "2025-09-14",
                              paidBy: "Landlord",
                              paidTo: "",
                              description: "",
                              collectionMode: "",
                              billImage: null,
                            });
                            setSelectedCategory(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Category Modal */}
              {isAddCategoryOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md m-2 sm:m-4 border border-white/20">
                    <div className="p-6 border-b border-white/10 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">
                          Add New Category
                        </h3>
                        <button
                          onClick={() => setIsAddCategoryOpen(false)}
                          className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                          placeholder="Enter category name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          className="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                          onClick={handleAddCategory}
                        >
                          Add Category
                        </button>
                        <button
                          className="flex-1 bg-gray-700 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                          onClick={() => setIsAddCategoryOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Category Modal */}
              {isEditCategoryOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md m-2 sm:m-4 border border-white/20">
                    <div className="p-6 border-b border-white/10 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">
                          Edit Category
                        </h3>
                        <button
                          onClick={() => setIsEditCategoryOpen(false)}
                          className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-700 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white"
                          placeholder="Enter category name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          className="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                          onClick={handleUpdateCategory}
                        >
                          Update Category
                        </button>
                        <button
                          className="flex-1 bg-gray-700 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                          onClick={() => setIsEditCategoryOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;