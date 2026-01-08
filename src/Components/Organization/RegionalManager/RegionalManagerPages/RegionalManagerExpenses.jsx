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
  const [isLoading, setIsLoading] = useState(true);
  const [expenseData, setExpenseData] = useState({
    property: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paidBy: "RM staff",
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
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [categorySummaryYear, setCategorySummaryYear] = useState(new Date().getFullYear().toString());
  const [categorySummaryMonth, setCategorySummaryMonth] = useState("All");
  const location = useLocation();
  const token = localStorage.getItem("token");
  const sliderRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [rmId, setRmId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

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

  // Fetch RM profile to get assigned properties and RM ID
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("No token found. Please log in.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("https://api.gharzoreality.com/api/regional-managers/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.properties) {
            // Map assigned properties to match the expected structure
            const assignedProperties = data.data.properties.map((prop) => ({
              id: prop._id,
              name: prop.name,
              address: prop.address,
              city: prop.city,
              pinCode: prop.pinCode,
              type: prop.type,
              totalRooms: prop.totalRooms,
              totalBeds: prop.totalBeds,
            }));
            setProperties(assignedProperties);
            setRmId(data.data.id); // Set RM ID for summary queries
            setOrganizationId(data.data.organizationId); // Set Organization ID
            setError(null);
          } else {
            setError("No properties found in profile data");
          }
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch profile: ${errorData.message || "Unauthorized"}`);
        }
      } catch (error) {
        setError("An error occurred while fetching profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch all properties from /rm/properties and merge with existing
  useEffect(() => {
    const fetchAllProperties = async () => {
      if (!token) return;
      try {
        const response = await fetch("https://api.gharzoreality.com/api/rm/properties", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const allProps = data.properties.map((prop) => ({
            id: prop._id,
            name: prop.name,
            address: prop.address,
            city: prop.city,
            pinCode: prop.pinCode,
            type: prop.type,
            totalRooms: prop.totalRooms,
            totalBeds: prop.totalBeds,
          }));
          setProperties((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProps = allProps.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProps];
          });
        }
      } catch (error) {
        console.error("Error fetching all properties:", error);
      }
    };
    fetchAllProperties();
  }, [token]);

  // Fetch categories, expenses, and analytics
  useEffect(() => {
    if (!token) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch("https://api.gharzoreality.com/api/rm/organization-categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok || response.status === 304) {
          const data = await response.json();
          // Extract rm and organization IDs from the first category if available
          if (data.length > 0) {
            setRmId(data[0].rm);
            setOrganizationId(data[0].organization?.id || data[0].organization);
          }
          setCategories(
            data.map((category) => ({
              name: category.name || "",
              count: 0,
              id: category._id,
            })) || []
          );
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch categories: ${errorData.message || "Unauthorized"}`);
        }
      } catch (error) {
        setError("An error occurred while fetching categories");
      }
    };

    const fetchExpenses = async () => {
      try {
        let url = "https://api.gharzoreality.com/api/rm/expenses";
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
          url = `https://api.gharzoreality.com/api/rm/expenses?${queryParams}`;
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
          setError(`Failed to fetch expenses: ${errorData.message || "Unauthorized"}`);
        }
      } catch (error) {
        setError("An error occurred while fetching expenses");
      }
    };

    const fetchMonthlyExpenses = async () => {
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/rm/expenses/trend/monthly?year=${year}`,
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
          "https://api.gharzoreality.com/api/rm/expenses/trend/yearly",
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
  }, [token, filters, year, rmId]);

  // Fetch summary with RM ID
  useEffect(() => {
    if (!token || !rmId) {
      setSummary(null);
      return;
    }
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/rm/expenses/summary?rm=${rmId}`,
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
          setSummary(data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch summary: ${errorData.message || "Unauthorized"}`);
        }
      } catch (error) {
        setError("An error occurred while fetching summary");
      }
    };
    fetchSummary();
  }, [token, rmId]);

  // Fetch category summary with year and month filters
  useEffect(() => {
    if (!token || !rmId || !categorySummaryYear || !categorySummaryMonth) {
      setCategorySummary(null);
      return;
    }
    const fetchCategorySummary = async () => {
      try {
        let url = `https://api.gharzoreality.com/api/rm-expenses/analytics/summary?rm=${rmId}&year=${categorySummaryYear}`;
        if (categorySummaryMonth !== "All") {
          url += `&month=${categorySummaryMonth}`;
        }
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
  }, [token, rmId, categorySummaryYear, categorySummaryMonth]);

  const fetchCategoryById = async (categoryId) => {
    if (!token || !categoryId) {
      setError("Missing token or category ID.");
      return;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/rm/organization-categories/${categoryId}`,
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
          count: 0,
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
        `https://api.gharzoreality.com/api/rm/expenses/${expenseId}`,
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
        `https://api.gharzoreality.com/api/rm/organization-categories/${editCategoryId}`,
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
    if (!token || !categoryName || !rmId || !organizationId) {
      setError("Please provide Token, Category Name, RM ID, and Organization ID");
      return;
    }
    try {
      const response = await fetch(
        "https://api.gharzoreality.com/api/rm/organization-categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryName,
            rm: rmId,
            organization: organizationId,
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
        `https://api.gharzoreality.com/api/rm/organization-categories/${categoryId}`,
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
    if (!rmId || !organizationId) {
      setError("Missing RM ID or Organization ID. Please ensure categories are loaded.");
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
      formData.append("rm", rmId);
      formData.append("organization", organizationId);
      const response = await fetch(
        "https://api.gharzoreality.com/api/rm/expenses",
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
          date: new Date().toISOString().split('T')[0],
          paidBy: "RM staff",
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
    if (!rmId || !organizationId) {
      setError("Missing RM ID or Organization ID. Please ensure categories are loaded.");
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
      formData.append("rm", rmId);
      formData.append("organization", organizationId);
      const response = await fetch(
        `https://api.gharzoreality.com/api/rm/expenses/${editExpenseId}`,
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
          date: new Date().toISOString().split('T')[0],
          paidBy: "RM staff",
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
        `https://api.gharzoreality.com/api/rm/expenses/${expenseId}`,
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
        : new Date().toISOString().split('T')[0],
      paidBy: expense.paidBy || "RM staff",
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
    { value: "All", label: "All Months" },
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#5C4EFF] via-[#1fc9b2] to-[#7cf7b7] animate-gradient-bg transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#5C4EFF] via-[#1fc9b2]/20 to-[#7cf7b7]/20"></div>
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-white/50 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white/50 to-transparent blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-32 h-32 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin [animation-delay:0.15s] [animation-duration:1.5s]"></div>
                <div className="absolute inset-0 w-32 h-32 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin [animation-delay:0.3s] [animation-duration:1.2s]"></div>
              </div>
              <h3 className="mt-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-text">
                Crafting your dashboard...
              </h3>
              <p className="mt-2 text-gray-600 animate-pulse">
                Gathering your expense insights
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="relative bg-white/90 backdrop-blur-md border border-red-200 rounded-3xl p-6 mb-8 shadow-xl animate-shake">
                  <div className="absolute top-0 right-0 pt-3 pr-3">
                    <button
                      onClick={() => setError(null)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800">
                        Something went wrong
                      </h3>
                      <p className="text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {showSuccess && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-white/95 backdrop-blur-md border border-green-200 rounded-full px-8 py-4 shadow-2xl max-w-md animate-bounceIn">
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div className="absolute -inset-1 bg-green-400 rounded-full blur animate-ping"></div>
                      </div>
                      <p className="text-green-800 font-semibold">
                        {successMessage}
                      </p>
                      <button
                        onClick={() => setShowSuccess(false)}
                        className="ml-auto text-green-500 hover:text-green-700"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4 text-center sm:text-center">
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Expenses Dashboard
                  </h1>
                  <p className="text-gray-700">Manage and track your regional expenses with ease</p>
                </div>
                <button
                  className="relative bg-gray-800 px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="text-white">Add Expense</span>
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="absolute inset-0  rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-indigo-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-indigo-100 rounded-2xl shadow-md group-hover:rotate-6 transition-transform duration-300">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Expenses</h3>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600 mb-1">₹{summary?.totalExpenses?.totalAmount?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600">{summary?.totalExpenses?.count || 0} transactions</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-purple-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-2xl shadow-md group-hover:rotate-6 transition-transform duration-300">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase">Categories</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-1">{categories.length}</p>
                    <p className="text-sm text-gray-600">{categories.reduce((sum, cat) => sum + (cat.count || 0), 0)} items</p>
                  </div>
                </div>

          {/* ====== THIS MONTH CARD – Current Month ka Amount ====== */}
<div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-green-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
  <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
  <div className="relative">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-green-100 rounded-2xl shadow-md group-hover:rotate-6 transition-transform duration-300">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 uppercase">This Month</h3>
    </div>

    {/* Current Month ka Amount – Safe & Clear */}
    <p className="text-3xl font-bold text-green-600 mb-1">
      ₹{(() => {
        const currentMonthIndex = new Date().getMonth(); // 0-11
        const amount = monthlyData[currentMonthIndex];
        return amount != null ? amount.toLocaleString("en-IN") : "0";
      })()}
    </p>

    {/* Month + Year ka naam */}
    <p className="text-lg font-medium text-gray-700">
      {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
    </p>

    {/* Agar data nahi aaya to batao (debug ke liye) */}
    {/* {monthlyData.length === 0 && (
      <p className="text-xs text-red-500 mt-2">No data for {new Date().getFullYear()}</p>
    )} */}
  </div>
</div>

           {/*   <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-orange-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-orange-100 rounded-2xl shadow-md group-hover:rotate-6 transition-transform duration-300">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase">Properties</h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mb-1">{properties.length}</p>
                    <p className="text-sm text-gray-600">Managed properties</p>
                  </div>
                </div>*/}   
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-2xl mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">Category Summary</h2>
                    <p className="text-gray-600">Breakdown of your expenses</p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={categorySummaryYear}
                      onChange={(e) => setCategorySummaryYear(e.target.value)}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <select
                      className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-4">Grand Total</h3>
                    <p className="text-4xl font-bold text-indigo-600">₹{categorySummary?.grandTotal?.toLocaleString() || 0}</p>
                    <p className="text-sm text-indigo-600 mt-2">
                      {categorySummary?.year} - {monthOptions.find(m => m.value === categorySummary?.month)?.label || categorySummaryMonth}
                    </p>
                  </div>
                  <div className="col-span-1 lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {categorySummary && Array.isArray(categorySummary.summary) && categorySummary.summary.length > 0 ? (
                        categorySummary.summary.map((item, idx) => {
                          const category = categories.find((cat) => cat.id === item._id);
                          const categoryName = category ? category.name : item._id || 'Unassigned';
                          return (
                            <div key={item._id || idx} className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">{categoryName}</span>
                                <span className="text-lg font-bold text-blue-600">₹{item.totalAmount?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                                <span>{item.count || 0} transactions</span>
                                <span>{((item.totalAmount / categorySummary.grandTotal) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                  style={{ width: `${((item.totalAmount / categorySummary.grandTotal) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-600">
                          No category data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {rentExpenses.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Rent Payments</h2>
                  <div className="relative">
                    <div ref={sliderRef} className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory">
                      {rentExpenses.map((expense) => (
                        <div key={expense._id} className="min-w-[280px] flex-shrink-0 snap-center">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Paid</span>
                              <span className="text-sm text-gray-600">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-2">₹{expense.amount.toLocaleString()}</p>
                            <p className="text-gray-700">To: {expense.paidTo}</p>
                            <p className="text-sm text-gray-600 mt-1">Mode: {expense.collectionMode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Yearly Summary</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {yearlyData.map((item) => (
                      <div key={item.year} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-900">{item.year}</span>
                        <span className="text-xl font-bold text-blue-600">₹{item.totalAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Monthly Summary</h2>
                    <select
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {monthlyData.map((amount, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-900">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                        </span>
                        <span className="text-xl font-bold text-purple-600">₹{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-2 sm:p-8 shadow-2xl overflow-x-auto">
                <h2 className="text-2xl font-bold text-[#5C4EFF] mb-6">Expense List</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-sm">
                    <thead>
                      <tr className="bg-[#F3F4F6] text-left text-xs font-semibold text-[#5C4EFF] uppercase tracking-wider">
                        <th className="px-2 sm:px-6 py-4">Date</th>
                        <th className="px-2 sm:px-6 py-4">Category</th>
                        <th className="px-2 sm:px-6 py-4">Amount</th>
                        <th className="px-2 sm:px-6 py-4">Mode</th>
                        <th className="px-2 sm:px-6 py-4">Paid By</th>
                        <th className="px-2 sm:px-6 py-4">Paid To</th>
                        <th className="px-2 sm:px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {expenses.map((expense) => (
                        <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.category?.name || 'Unknown'}</td>
                          <td className="px-2 sm:px-6 py-4 text-sm font-bold text-gray-900">₹{expense.amount.toLocaleString()}</td>
                          <td className="px-2 sm:px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {expense.collectionMode}
                            </span>
                          </td>
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.paidBy}</td>
                          <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.paidTo}</td>
                          <td className="px-2 sm:px-6 py-4 text-sm">
                            <button
                              className="mr-3 text-blue-600 hover:text-blue-800"
                              onClick={() => openEditExpenseModal(expense)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
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

              {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl m-2 sm:m-4 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Add New Expense</h3>
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Property (Optional)</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                              onClick={() => setIsAddCategoryOpen(true)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {selectedCategory && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-800">{selectedCategory.name}</span>
                            <div className="space-x-2">
                              {!isUpdating ? (
                                <button
                                  className="text-yellow-600 hover:text-yellow-700"
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
                                    className="p-2 border rounded flex-1"
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
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteCategory(selectedCategory.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="Enter amount"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={expenseData.date}
                            onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            value={expenseData.paidBy}
                            onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                          >
                            <option value="RM staff">RM staff</option>
                            {uniquePaidBy.map((payer) => (
                              <option key={payer} value={payer}>{payer}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Paid To</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Recipient name"
                            value={expenseData.paidTo}
                            onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y min-h-[100px]"
                          placeholder="Describe the expense"
                          value={expenseData.description}
                          onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {['Cash', 'GPay', 'PhonePe', 'Paytm', 'UPI'].map((mode) => (
                            <button
                              key={mode}
                              className={`p-3 rounded-lg font-medium transition-all ${
                                expenseData.collectionMode === mode
                                  ? 'bg-blue-600 text-white shadow-md'
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
                          className="w-full p-3 border border-dashed border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                          onChange={(e) => setExpenseData({ ...expenseData, billImage: e.target.files[0] })}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                          onClick={handleAddExpense}
                        >
                          Add Expense
                        </button>
                        <button
                          className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                          onClick={() => {
                            setIsModalOpen(false);
                            setExpenseData({
                              property: "",
                              category: "",
                              amount: "",
                              date: new Date().toISOString().split('T')[0],
                              paidBy: "RM staff",
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

              {isEditExpenseOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl m-2 sm:m-4 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Edit Expense</h3>
                        <button
                          onClick={() => {
                            setIsEditExpenseOpen(false);
                            setEditExpenseId(null);
                            setExpenseData({
                              property: "",
                              category: "",
                              amount: "",
                              date: new Date().toISOString().split('T')[0],
                              paidBy: "RM staff",
                              paidTo: "",
                              description: "",
                              collectionMode: "",
                              billImage: null,
                            });
                            setSelectedCategory(null);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Property (Optional)</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                              onClick={() => setIsAddCategoryOpen(true)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {selectedCategory && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-800">{selectedCategory.name}</span>
                            <div className="space-x-2">
                              {!isUpdating ? (
                                <button
                                  className="text-yellow-600 hover:text-yellow-700"
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
                                    className="p-2 border rounded flex-1"
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
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteCategory(selectedCategory.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="Enter amount"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={expenseData.date}
                            onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            value={expenseData.paidBy}
                            onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                          >
                            <option value="RM staff">RM staff</option>
                            {uniquePaidBy.map((payer) => (
                              <option key={payer} value={payer}>{payer}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Paid To</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Recipient name"
                            value={expenseData.paidTo}
                            onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y min-h-[100px]"
                          placeholder="Describe the expense"
                          value={expenseData.description}
                          onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {['Cash', 'GPay', 'PhonePe', 'Paytm', 'UPI'].map((mode) => (
                            <button
                              key={mode}
                              className={`p-3 rounded-lg font-medium transition-all ${
                                expenseData.collectionMode === mode
                                  ? 'bg-blue-600 text-white shadow-md'
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
                          className="w-full p-3 border border-dashed border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                          onChange={(e) => setExpenseData({ ...expenseData, billImage: e.target.files[0] })}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                          onClick={handleUpdateExpense}
                        >
                          Update Expense
                        </button>
                        <button
                          className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                          onClick={() => {
                            setIsEditExpenseOpen(false);
                            setEditExpenseId(null);
                            setExpenseData({
                              property: "",
                              category: "",
                              amount: "",
                              date: new Date().toISOString().split('T')[0],
                              paidBy: "RM staff",
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

              {isAddCategoryOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md m-2 sm:m-4">
                    <div className="p-6 border-b border-gray-200 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Add New Category</h3>
                        <button
                          onClick={() => setIsAddCategoryOpen(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter category name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                          onClick={handleAddCategory}
                        >
                          Add Category
                        </button>
                        <button
                          className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md m-2 sm:m-4">
                    <div className="p-6 border-b border-gray-200 rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Edit Category
                        </h3>
                        <button
                          onClick={() => setIsEditCategoryOpen(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter category name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                          onClick={handleUpdateCategory}
                        >
                          Update Category
                        </button>
                        <button
                          className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
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