import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import baseurl from "../../../../BaseUrl";
import { motion } from "framer-motion";

const Expenses = () => {
  const [totalExpensesAmount, setTotalExpensesAmount] = useState(0);
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

  useEffect(() => {
    const fetchTotalExpenses = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `${baseurl}api/subowner/expenses`,
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
          const total = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
          setTotalExpensesAmount(total);
        }
      } catch (error) {
        console.error("Error fetching total expenses:", error);
      }
    };

    fetchTotalExpenses();
  }, [token]);

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

  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = new Date().toLocaleString("en-US", { month: "short" });
  const currentMonthAmount = monthlyData[currentMonthIndex] || 0;
  const currentMonthTransactions = expenses.filter(expense => {
    const expMonth = new Date(expense.date).getMonth();
    const expYear = new Date(expense.date).getFullYear();
    return expMonth === currentMonthIndex && expYear === new Date().getFullYear();
  }).length;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("No token found. Please log in.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${baseurl}api/sub-owner/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.subOwner && data.subOwner.assignedProperties) {
            const assignedProperties = data.subOwner.assignedProperties.map(
              (assignment) => ({
                id: assignment.property.id,
                name: assignment.property.name,
                address: assignment.property.address,
                city: assignment.property.city,
                pinCode: assignment.property.pinCode,
                type: assignment.property.type,
                totalRooms: assignment.property.totalRooms,
                totalBeds: assignment.property.totalBeds,
              })
            );
            setProperties(assignedProperties);
            setError(null);
          } else {
            setError("No properties found in profile data");
          }
        } else {
          const errorData = await response.json();
          setError(
            `Failed to fetch profile: ${errorData.message || "Unauthorized"}`
          );
        }
      } catch (error) {
        setError("An error occurred while fetching profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${baseurl}api/subowner/expense/categories`,
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
        let url = `${baseurl}api/subowner/expenses`;
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
            ...(filters.category && { category: filters.category }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
            ...(filters.paidBy && { paidBy: filters.paidBy }),
            ...(filters.paidTo && { paidTo: filters.paidTo }),
          });
          url = `${baseurl}api/subowner/expenses?${queryParams}`;
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
          `${baseurl}api/subowner/expenses/trend/monthly?year=${year}`,
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
          `${baseurl}api/subowner/expenses/trend/yearly`,
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
  }, [token, filters, year]);

  useEffect(() => {
    if (!token || !categorySummaryYear || !categorySummaryMonth) {
      setCategorySummary(null);
      return;
    }
    const fetchCategorySummary = async () => {
      try {
        const url = `${baseurl}api/subowner/expenses/summary?year=${categorySummaryYear}&month=${categorySummaryMonth}`;
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
  }, [token, categorySummaryYear, categorySummaryMonth]);

  const fetchCategoryById = async (categoryId) => {
    if (!token || !categoryId) {
      setError("Missing token or category ID.");
      return;
    }
    try {
      const response = await fetch(
        `${baseurl}api/subowner/expense/categories/${categoryId}`,
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
        `${baseurl}api/subowner/expenses/${expenseId}`,
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
    if (!token || !categoryName || !editCategoryId) {
      setError("Please provide Token, Category Name, and Category ID");
      return;
    }
    try {
      const response = await fetch(
        `${baseurl}api/subowner/expense/categories/${editCategoryId}`,
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
    if (!token || !categoryName) {
      setError("Please provide Token and Category Name");
      return;
    }
    try {
      const response = await fetch(
        `${baseurl}api/subowner/expense/categories/create`,
        {
          method: "POST",
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
    if (!token || !categoryId) {
      setError("Please provide Token and Category ID");
      return;
    }
    try {
      const response = await fetch(
        `${baseurl}api/subowner/expense/categories/${categoryId}`,
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
    if (!token) {
      setError("Missing token.");
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
      if (expenseData.property) {
        formData.append("property", expenseData.property);
      }
      if (expenseData.billImage) {
        formData.append("billImage", expenseData.billImage);
      }
      const response = await fetch(
        `${baseurl}api/subowner/expenses/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
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
    if (!token || !editExpenseId) {
      setError("Missing token or expense ID.");
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
      if (expenseData.property) {
        formData.append("property", expenseData.property);
      }
      if (expenseData.billImage) {
        formData.append("billImage", expenseData.billImage);
      }
      const response = await fetch(
        `${baseurl}api/subowner/expenses/${editExpenseId}`,
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
        `${baseurl}api/subowner/expenses/${expenseId}`,
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
      property: expense.property?._id || expense.property || "",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div 
              className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#003366] border-r-[#FF6B35]"></div>
            </motion.div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#003366] mb-2">Loading Expenses</h3>
            <p className="text-sm sm:text-base text-gray-600">Gathering your expense insights...</p>
          </div>
        ) : (
          <>
            {/* Success Message */}
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl px-6 py-4 border-2 border-green-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-800 font-semibold">{successMessage}</p>
                  <button onClick={() => setShowSuccess(false)} className="ml-4 text-green-600 hover:text-green-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-red-400 rounded-2xl p-6 mb-6 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-1">Error</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            >
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#003366] mb-2">Expense Management</h1>
                <p className="text-gray-600">Track and manage your expenses efficiently</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[#FF6B35] to-[#ff8659] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Expense
              </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
            >
              {/* Total Expenses Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl lg:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-[#003366]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-50 rounded-full">
                    <span className="text-xs font-semibold text-blue-700">{expenses.length} total</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Expenses</p>
                <h3 className="text-3xl sm:text-4xl font-bold text-[#003366]">
                  ₹{totalExpensesAmount.toLocaleString()}
                </h3>
              </motion.div>

              {/* Categories Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl lg:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="px-3 py-1.5 bg-orange-50 rounded-full">
                    <span className="text-xs font-semibold text-orange-700">{categories.reduce((sum, cat) => sum + (cat.count || 0), 0)} items</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Categories</p>
                <h3 className="text-3xl sm:text-4xl font-bold text-[#003366]">
                  {categories.length}
                </h3>
              </motion.div>

              {/* This Month Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl lg:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="px-3 py-1.5 bg-green-50 rounded-full">
                    <span className="text-xs font-semibold text-green-700">{currentMonthName}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">This Month</p>
                <h3 className="text-3xl sm:text-4xl font-bold text-[#003366] mb-1">
                  ₹{currentMonthAmount.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500">{currentMonthTransactions} transactions</p>
              </motion.div>
            </motion.div>

            {/* Category Summary */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 shadow-xl mb-8 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#003366] mb-1">Category Summary</h2>
                  <p className="text-gray-600">Breakdown of expenses by category</p>
                </div>
                <div className="flex gap-3">
                  <select
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                    value={categorySummaryYear}
                    onChange={(e) => setCategorySummaryYear(e.target.value)}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all"
                    value={categorySummaryMonth}
                    onChange={(e) => setCategorySummaryMonth(e.target.value)}
                  >
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grand Total */}
                <div className="bg-gradient-to-br from-[#003366] to-[#004d99] rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Grand Total</h3>
                  </div>
                  <p className="text-4xl font-bold mb-2">₹{categorySummary?.grandTotal?.toLocaleString() || 0}</p>
                  <p className="text-blue-200 text-sm">
                    {categorySummary?.year} - {monthOptions.find(m => m.value === categorySummary?.month)?.label}
                  </p>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-[#003366] mb-4">By Category</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {categorySummary && Array.isArray(categorySummary.summary) && categorySummary.summary.length > 0 ? (
                      categorySummary.summary.map((item, idx) => {
                        const category = categories.find((cat) => cat.id === item._id);
                        const categoryName = category ? category.name : item._id || 'Unassigned';
                        const percentage = ((item.totalAmount / categorySummary.grandTotal) * 100).toFixed(1);
                        return (
                          <div key={item._id || idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-[#003366]">{categoryName}</span>
                              <span className="text-lg font-bold text-[#FF6B35]">₹{item.totalAmount?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>{item.count || 0} transactions</span>
                              <span>{percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-[#003366] to-[#FF6B35]"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No category data available for the selected period
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Yearly & Monthly Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Yearly Summary */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-[#003366] mb-6">Yearly Summary</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {yearlyData.map((item, index) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-[#003366]">{item.year}</span>
                      <span className="text-xl font-bold text-[#FF6B35]">₹{item.totalAmount.toLocaleString()}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Monthly Summary */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#003366]">Monthly Summary</h2>
                  <select
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {monthlyData.map((amount, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-[#003366]">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                      </span>
                      <span className="text-xl font-bold text-[#FF6B35]">₹{amount.toLocaleString()}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Expense List Table */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-8 shadow-xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-[#003366] mb-6">Expense List</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Date</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Category</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Amount</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Mode</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Paid By</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Paid To</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-[#003366]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, index) => (
                      <motion.tr
                        key={expense._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{expense.category?.name || 'Unknown'}</td>
                        <td className="px-4 py-4 text-sm font-bold text-[#003366]">₹{expense.amount.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {expense.collectionMode}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{expense.paidBy}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{expense.paidTo}</td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditExpenseModal(expense)}
                              className="text-[#003366] hover:text-[#FF6B35] font-medium text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense._id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Add Expense Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-3xl z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#003366]">Add New Expense</h3>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property (Optional)</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          value={expenseData.property}
                          onChange={(e) => setExpenseData({ ...expenseData, property: e.target.value })}
                        >
                          <option value="">Select Property</option>
                          {properties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all"
                            value={expenseData.category}
                            onChange={(e) => {
                              const categoryId = e.target.value;
                              setExpenseData({ ...expenseData, category: categoryId });
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
                            className="px-4 py-3 bg-[#FF6B35] text-white rounded-xl hover:bg-[#ff8659] transition-colors font-semibold"
                            onClick={() => setIsAddCategoryOpen(true)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedCategory && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#003366]">{selectedCategory.name}</span>
                          <div className="flex gap-2">
                            {!isUpdating ? (
                              <button
                                className="text-[#FF6B35] hover:text-[#ff8659] font-medium text-sm"
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
                                  onChange={(e) => setCategoryName(e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg flex-1"
                                />
                                <button
                                  className="px-3 py-1 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8659]"
                                  onClick={handleUpdateCategory}
                                >
                                  Save
                                </button>
                              </div>
                            )}
                            <button
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                              onClick={() => handleDeleteCategory(selectedCategory.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          placeholder="Enter amount"
                          value={expenseData.amount}
                          onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          value={expenseData.date}
                          onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paid By *</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          value={expenseData.paidBy}
                          onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                        >
                          <option value="Landlord">Landlord</option>
                          {uniquePaidBy.map((payer) => (
                            <option key={payer} value={payer}>{payer}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paid To *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          placeholder="Recipient name"
                          value={expenseData.paidTo}
                          onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all resize-y min-h-[100px]"
                        placeholder="Describe the expense"
                        value={expenseData.description}
                        onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['Cash', 'GPay', 'PhonePe', 'Paytm', 'UPI'].map((mode) => (
                          <button
                            key={mode}
                            className={`py-3 px-4 rounded-xl font-medium transition-all ${
                              expenseData.collectionMode === mode
                                ? 'bg-[#003366] text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setExpenseData({ ...expenseData, collectionMode: mode })}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bill (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#003366] file:text-white hover:file:bg-[#004d99] transition-all"
                        onChange={(e) => setExpenseData({ ...expenseData, billImage: e.target.files[0] })}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        className="flex-1 bg-gradient-to-r from-[#003366] to-[#004d99] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        onClick={handleAddExpense}
                      >
                        Add Expense
                      </button>
                      <button
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        onClick={() => {
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
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Edit Expense Modal */}
            {isEditExpenseOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-3xl z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#003366]">Edit Expense</h3>
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
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property (Optional)</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          value={expenseData.property}
                          onChange={(e) => setExpenseData({ ...expenseData, property: e.target.value })}
                        >
                          <option value="">Select Property</option>
                          {properties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all"
                            value={expenseData.category}
                            onChange={(e) => {
                              const categoryId = e.target.value;
                              setExpenseData({ ...expenseData, category: categoryId });
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
                            className="px-4 py-3 bg-[#FF6B35] text-white rounded-xl hover:bg-[#ff8659] transition-colors font-semibold"
                            onClick={() => setIsAddCategoryOpen(true)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedCategory && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#003366]">{selectedCategory.name}</span>
                          <div className="flex gap-2">
                            {!isUpdating ? (
                              <button
                                className="text-[#FF6B35] hover:text-[#ff8659] font-medium text-sm"
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
                                  onChange={(e) => setCategoryName(e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg flex-1"
                                />
                                <button
                                  className="px-3 py-1 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8659]"
                                  onClick={handleUpdateCategory}
                                >
                                  Save
                                </button>
                              </div>
                            )}
                            <button
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                              onClick={() => handleDeleteCategory(selectedCategory.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          placeholder="Enter amount"
                          value={expenseData.amount}
                          onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          value={expenseData.date}
                          onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paid By *</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          value={expenseData.paidBy}
                          onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                        >
                          <option value="Landlord">Landlord</option>
                          {uniquePaidBy.map((payer) => (
                            <option key={payer} value={payer}>{payer}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paid To *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                          placeholder="Recipient name"
                          value={expenseData.paidTo}
                          onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all resize-y min-h-[100px]"
                        placeholder="Describe the expense"
                        value={expenseData.description}
                        onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['Cash', 'GPay', 'PhonePe', 'Paytm', 'UPI'].map((mode) => (
                          <button
                            key={mode}
                            className={`py-3 px-4 rounded-xl font-medium transition-all ${
                              expenseData.collectionMode === mode
                                ? 'bg-[#003366] text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setExpenseData({ ...expenseData, collectionMode: mode })}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bill (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#003366] file:text-white hover:file:bg-[#004d99] transition-all"
                        onChange={(e) => setExpenseData({ ...expenseData, billImage: e.target.files[0] })}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        className="flex-1 bg-gradient-to-r from-[#003366] to-[#004d99] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        onClick={handleUpdateExpense}
                      >
                        Update Expense
                      </button>
                      <button
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
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
                </motion.div>
              </div>
            )}

            {/* Add Category Modal */}
            {isAddCategoryOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#003366]">Add Category</h3>
                      <button
                        onClick={() => setIsAddCategoryOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        className="flex-1 bg-gradient-to-r from-[#003366] to-[#004d99] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        onClick={handleAddCategory}
                      >
                        Add Category
                      </button>
                      <button
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        onClick={() => setIsAddCategoryOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Edit Category Modal */}
            {isEditCategoryOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#003366]">Edit Category</h3>
                      <button
                        onClick={() => setIsEditCategoryOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        className="flex-1 bg-gradient-to-r from-[#003366] to-[#004d99] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        onClick={handleUpdateCategory}
                      >
                        Update Category
                      </button>
                      <button
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        onClick={() => setIsEditCategoryOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Expenses;