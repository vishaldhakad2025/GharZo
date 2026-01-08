import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PropertyManagerExpenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [organizationId, setOrganizationId] = useState(null);
  const [pmId, setPmId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseData, setExpenseData] = useState({
    category: '',
    property: '',
    amount: '',
    date: '',
    paidBy: 'Organization',
    paidTo: '',
    description: '',
    collectionMode: '',
    billImage: null,
  });
  const [filters, setFilters] = useState({
    category: '',
    property: '',
    startDate: '',
    endDate: '',
    paidBy: '',
    paidTo: '',
    page: 1,
    limit: 10,
  });
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [categorySummaryYear, setCategorySummaryYear] = useState(new Date().getFullYear().toString());
  const [categorySummaryMonth, setCategorySummaryMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const location = useLocation();
  const token = localStorage.getItem('token');
  const sliderRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);

  const getCategoryName = (catId) => {
    return categories.find(c => c.id === catId)?.name || 'Unassigned';
  };

  const totalAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = allExpenses.length;
  const currentMonth = new Date().toLocaleString('en-us', { month: 'short' });
  const currentMonthData = monthlyData.find(m => m.month === currentMonth)?.totalAmount || 0;

  // Fetch PM profile to get pmId and organizationId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('No token found in localStorage. Please log in.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('https://api.gharzoreality.com/api/property-managers/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPmId(data.data.id);
          setOrganizationId(data.data.organizationId);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch profile: ${errorData.message || 'Unauthorized'}`);
        }
      } catch (error) {
        setError('An error occurred while fetching the profile');
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
        const response = await fetch('https://api.gharzoreality.com/api/pm/properties', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProperties(data || []);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch properties: ${errorData.message || 'Unauthorized'}`);
        }
      } catch (error) {
        setError('An error occurred while fetching properties');
      }
    };
    fetchProperties();
  }, [token]);

  // Fetch categories
  useEffect(() => {
    if (!pmId || !organizationId || !token) return;
    const fetchCategories = async () => {
      try {
        const url = `https://api.gharzoreality.com/api/pm/categories/all?pmId=${pmId}&organization=${organizationId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(
            data.personalCategories?.map((category) => ({
              name: category.name || '',
              id: category._id,
            })) || []
          );
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch categories: ${errorData.message || 'Unauthorized'}`);
        }
      } catch (error) {
        setError('An error occurred while fetching categories');
      }
    };
    fetchCategories();
  }, [token, pmId, organizationId]);

  // Fetch paginated expenses
  useEffect(() => {
    if (!token) return;
    const fetchExpenses = async () => {
      try {
        let url = `https://api.gharzoreality.com/api/pm/expenses?page=${filters.page}&limit=${filters.limit}`;
        const hasFilters = filters.category || filters.property || filters.startDate || filters.endDate || filters.paidBy || filters.paidTo;
        if (hasFilters) {
          const queryParams = new URLSearchParams({
            ...(filters.category && { category: filters.category }),
            ...(filters.property && { property: filters.property }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
            ...(filters.paidBy && { paidBy: filters.paidBy }),
            ...(filters.paidTo && { paidTo: filters.paidTo }),
          });
          url += `&${queryParams}`;
        }
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setExpenses(data.expenses || []);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch expenses: ${errorData.message || 'Unauthorized'}`);
        }
      } catch (error) {
        setError('An error occurred while fetching expenses');
      }
    };
    fetchExpenses();
  }, [token, filters]);

  // Fetch all expenses for analytics
  useEffect(() => {
    if (!token) return;
    const fetchAllExpenses = async () => {
      try {
        const response = await fetch(`https://api.gharzoreality.com/api/pm/expenses?page=1&limit=10000`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAllExpenses(data.expenses || []);
        }
      } catch (error) {
        console.error('Error fetching all expenses for analytics:', error);
      }
    };
    fetchAllExpenses();
  }, [token]);

  // Fetch yearly data from API
  useEffect(() => {
    const fetchYearlyData = async () => {
      if (!token) return;
      try {
        const response = await fetch('https://api.gharzoreality.com/api/pm/expenses/analytics/trend/yearly', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setYearlyData(data.yearlyData || []);
          } else {
            setYearlyData([]);
          }
        } else {
          setYearlyData([]);
        }
      } catch (error) {
        console.error('Error fetching yearly data:', error);
        setYearlyData([]);
      }
    };
    fetchYearlyData();
  }, [token]);

  // Fetch monthly data from API
  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!token || !year) return;
      try {
        const params = new URLSearchParams({ year });
        const response = await fetch(`https://api.gharzoreality.com/api/pm/expenses/analytics/trend/monthly?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMonthlyData(data.monthlyData || []);
          } else {
            setMonthlyData([]);
          }
        } else {
          setMonthlyData([]);
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error);
        setMonthlyData([]);
      }
    };
    fetchMonthlyData();
  }, [token, year]);

  // Fetch category summary from API
  useEffect(() => {
    const fetchCategorySummary = async () => {
      if (!token) return;
      try {
        const params = new URLSearchParams({
          year: categorySummaryYear,
          month: categorySummaryMonth,
        });
        const response = await fetch(`https://api.gharzoreality.com/api/pm/expenses/analytics/summary?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategorySummary(data);
          } else {
            setCategorySummary(null);
          }
        } else {
          setCategorySummary(null);
        }
      } catch (error) {
        console.error('Error fetching category summary:', error);
        setCategorySummary(null);
      }
    };
    fetchCategorySummary();
  }, [token, categorySummaryYear, categorySummaryMonth]);

  const fetchCategoryById = async (categoryId) => {
    if (!token || !organizationId || !categoryId) return;
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/pm/categories/${categoryId}?organization=${organizationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedCategory({
          name: data.category.name || '',
          id: data.category._id,
        });
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchExpenseById = async (expenseId) => {
    if (!token || !expenseId) return null;
    try {
      const response = await fetch(`https://api.gharzoreality.com/api/pm/expenses/${expenseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.expense;
      }
      return null;
    } catch (error) {
      console.error('Error fetching expense:', error);
      return null;
    }
  };

  const handleAddExpense = async () => {
    if (!token || !expenseData.category || !expenseData.property || !expenseData.amount || !expenseData.date || !expenseData.paidBy || !expenseData.paidTo || !expenseData.description || !expenseData.collectionMode) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('category', expenseData.category);
      formData.append('property', expenseData.property);
      formData.append('amount', expenseData.amount);
      formData.append('date', new Date(expenseData.date).toISOString().split('T')[0]);
      formData.append('paidBy', expenseData.paidBy);
      formData.append('paidTo', expenseData.paidTo);
      formData.append('description', expenseData.description);
      formData.append('collectionMode', expenseData.collectionMode);
      if (expenseData.billImage) {
        formData.append('billImage', expenseData.billImage);
      }
      const response = await fetch('https://api.gharzoreality.com/api/pm/expenses/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Expense added successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsModalOpen(false);
        setExpenseData({
          category: '',
          property: '',
          amount: '',
          date: '',
          paidBy: 'Organization',
          paidTo: '',
          description: '',
          collectionMode: '',
          billImage: null,
        });
        setSelectedCategory(null);
        setError(null);
        // Refetch expenses
        window.location.reload(); // Simple way to refetch
      } else {
        const errorData = await response.json();
        setError(`Failed to add expense: ${errorData.message || 'Unauthorized'}`);
      }
    } catch (error) {
      setError('An error occurred while adding the expense');
    }
  };

  const handleUpdateExpense = async () => {
    if (!token || !editExpenseId || !expenseData.category || !expenseData.property || !expenseData.amount || !expenseData.date || !expenseData.paidBy || !expenseData.paidTo || !expenseData.description || !expenseData.collectionMode) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('category', expenseData.category);
      formData.append('property', expenseData.property);
      formData.append('amount', expenseData.amount);
      formData.append('date', new Date(expenseData.date).toISOString().split('T')[0]);
      formData.append('paidBy', expenseData.paidBy);
      formData.append('paidTo', expenseData.paidTo);
      formData.append('description', expenseData.description);
      formData.append('collectionMode', expenseData.collectionMode);
      if (expenseData.billImage) {
        formData.append('billImage', expenseData.billImage);
      }
      const response = await fetch(`https://api.gharzoreality.com/api/pm/expenses/${editExpenseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Expense updated successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsEditExpenseOpen(false);
        setEditExpenseId(null);
        setExpenseData({
          category: '',
          property: '',
          amount: '',
          date: '',
          paidBy: 'Organization',
          paidTo: '',
          description: '',
          collectionMode: '',
          billImage: null,
        });
        setSelectedCategory(null);
        setError(null);
        // Refetch
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(`Failed to update expense: ${errorData.message || 'Unauthorized'}`);
      }
    } catch (error) {
      setError('An error occurred while updating the expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!token || !expenseId) return;
    try {
      const response = await fetch(`https://api.gharzoreality.com/api/pm/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Expense deleted successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setError(null);
        // Refetch
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(`Failed to delete expense: ${errorData.message || 'Unauthorized'}`);
      }
    } catch (error) {
      setError('An error occurred while deleting the expense');
    }
  };

  const handleUpdateCategory = async () => {
    if (!pmId || !organizationId || !token || !categoryName || !editCategoryId) return;
    try {
      const response = await fetch(`https://api.gharzoreality.com/api/pm/categories/${editCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(categories.map(cat => cat.id === editCategoryId ? { ...cat, name: data.category.name } : cat));
        if (selectedCategory?.id === editCategoryId) {
          setSelectedCategory({ ...selectedCategory, name: data.category.name });
        }
        setCategoryName('');
        setEditCategoryId(null);
        setIsUpdating(false);
        setIsEditCategoryOpen(false);
        setSuccessMessage('Category updated successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!pmId || !organizationId || !token || !categoryName) return;
    try {
      const response = await fetch('https://api.gharzoreality.com/api/pm/categories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryName,
          pmId,
          organization: organizationId,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, { name: data.category.name, id: data.category._id }]);
        setCategoryName('');
        setIsAddCategoryOpen(false);
        setSuccessMessage('Category added successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!token || !categoryId) return;
    try {
      const response = await fetch(`https://api.gharzoreality.com/api/pm/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        setSelectedCategory(null);
        setSuccessMessage('Category deleted successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openEditExpenseModal = async (expense) => {
    setExpenseData({
      category: expense.category?._id || expense.category || '',
      property: expense.property?._id || expense.property || '',
      amount: expense.amount?.toString() || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      paidBy: expense.paidBy || 'Organization',
      paidTo: expense.paidTo || '',
      description: expense.description || '',
      collectionMode: expense.collectionMode || '',
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
      category: '',
      property: '',
      startDate: '',
      endDate: '',
      paidBy: '',
      paidTo: '',
      page: 1,
      limit: 10,
    });
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const uniquePaidBy = [...new Set(allExpenses.map((expense) => expense.paidBy))].filter(Boolean);
  const uniquePaidTo = [...new Set(allExpenses.map((expense) => expense.paidTo))].filter(Boolean);
  const rentExpenses = allExpenses.filter((expense) => {
    try {
      const catName = expense.category?.name || '';
      return catName.toLowerCase().includes('rent');
    } catch (e) {
      return false;
    }
  });

  const yearOptions = [];
  for (let y = 2020; y <= 2030; y++) {
    yearOptions.push(y.toString());
  }

  const monthOptions = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin [animation-delay:0.15s] [animation-duration:1.5s]"></div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin [animation-delay:0.3s] [animation-duration:1.2s]"></div>
        </div>
        <h3 className="mt-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-text">
          Crafting your dashboard...
        </h3>
        <p className="mt-2 text-gray-600 animate-pulse">Gathering your expense insights</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5C4EFF] via-[#1fc9b2] to-[#7cf7b7] animate-gradient-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#5C4EFF] via-[#1fc9b2]/20 to-[#7cf7b7]/20"></div>
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-white/50 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white/50 to-transparent blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
          {error && (
            <div className="relative bg-white/90 backdrop-blur-md border border-red-200 rounded-3xl p-6 mb-8 shadow-xl animate-shake">
              <div className="absolute top-0 right-0 pt-3 pr-3">
                <button onClick={() => setError(null)} className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">Something went wrong</h3>
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
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="absolute -inset-1 bg-green-400 rounded-full blur animate-ping"></div>
                  </div>
                  <p className="text-green-800 font-semibold">{successMessage}</p>
                  <button onClick={() => setShowSuccess(false)} className="ml-auto text-green-500 hover:text-green-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-black">Expenses </h1>
              {/* <p className="text-black">Manage and track your expenses with ease</p> */}
            </div>
            <button
              className="relative bg-gradient-to-r from-[#5C4EFF] to-[#1fc9b2] hover:from-[#1fc9b2] hover:to-[#5C4EFF] px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-black">Add Expense</span>
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5C4EFF] to-[#1fc9b2] rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-indigo-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-100 rounded-2xl shadow-md">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Expenses</h3>
                </div>
                <p className="text-3xl font-bold text-indigo-600 mb-1">₹{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{totalCount} transactions</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-purple-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-2xl shadow-md">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">Categories</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">{categories.length}</p>
                <p className="text-sm text-gray-600">items</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-green-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-2xl shadow-md">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">This Month</h3>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">₹{currentMonthData.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{currentMonth} expenses</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white to-orange-50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-100 rounded-2xl shadow-md">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">Properties</h3>
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">{properties.length}</p>
                <p className="text-sm text-gray-600">Managed properties</p>
              </div>
            </div>
          </div>

          {/* Category Summary */}
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
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4">Grand Total</h3>
                <p className="text-4xl font-bold text-indigo-600">₹{categorySummary?.grandTotal?.toLocaleString() || 0}</p>
                <p className="text-sm text-indigo-600 mt-2">
                  {categorySummaryYear} - {monthOptions.find(m => m.value === categorySummaryMonth)?.label}
                </p>
              </div>
              <div className="col-span-1 lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {categorySummary?.summary && categorySummary.summary.length > 0 ? (
                    categorySummary.summary.map((item, idx) => (
                      <div key={item._id || idx} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{getCategoryName(item._id)}</span>
                          <span className="text-lg font-bold text-blue-600">₹{item.totalAmount?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                          <span>{item.count || 0} transactions</span>
                          <span>{categorySummary.grandTotal > 0 ? ((item.totalAmount / categorySummary.grandTotal) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            style={{ width: `${categorySummary.grandTotal > 0 ? (item.totalAmount / categorySummary.grandTotal) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-600">No category data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rent Payments */}
          {rentExpenses.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rent Payments</h2>
              <div className="relative">
                <div ref={sliderRef} className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory">
                  {rentExpenses.slice(-5).reverse().map((expense) => ( // Show recent 5
                    <div key={expense._id} className="min-w-[280px] flex-shrink-0 snap-center">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Paid</span>
                          <span className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</span>
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

          {/* Yearly and Monthly */}
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
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {monthlyData.map((item) => (
                  <div key={item.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-900">{item.month}</span>
                    <span className="text-xl font-bold text-purple-600">₹{item.totalAmount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <select
                className="p-3 border border-gray-300 rounded-lg"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                className="p-3 border border-gray-300 rounded-lg"
                value={filters.property}
                onChange={(e) => setFilters({ ...filters, property: e.target.value, page: 1 })}
              >
                <option value="">All Properties</option>
                {properties.map((prop) => (
                  <option key={prop._id} value={prop._id}>{prop.name}</option>
                ))}
              </select>
              <input
                type="date"
                className="p-3 border border-gray-300 rounded-lg"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              />
              <input
                type="date"
                className="p-3 border border-gray-300 rounded-lg"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              />
              <select
                className="p-3 border border-gray-300 rounded-lg"
                value={filters.paidBy}
                onChange={(e) => setFilters({ ...filters, paidBy: e.target.value, page: 1 })}
              >
                <option value="">All Paid By</option>
                <option value="Organization">Organization</option>
                {uniquePaidBy.map((payer) => (
                  <option key={payer} value={payer}>{payer}</option>
                ))}
              </select>
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Paid To"
                value={filters.paidTo}
                onChange={(e) => setFilters({ ...filters, paidTo: e.target.value, page: 1 })}
              />
            </div>
            <button onClick={resetFilters} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Clear Filters
            </button>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-3xl p-2 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#5C4EFF] mb-6">Expense List</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="bg-[#F3F4F6] text-left text-xs font-semibold text-[#5C4EFF] uppercase tracking-wider">
                    <th className="px-2 sm:px-6 py-4">Date</th>
                    <th className="px-2 sm:px-6 py-4">Property</th>
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
                      <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.property?.name || 'Unknown'}</td>
                      <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.category?.name || 'Unknown'}</td>
                      <td className="px-2 sm:px-6 py-4 text-sm font-bold text-gray-900">₹{expense.amount.toLocaleString()}</td>
                      <td className="px-2 sm:px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{expense.collectionMode}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.paidBy}</td>
                      <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">{expense.paidTo}</td>
                      <td className="px-2 sm:px-6 py-4 text-sm">
                        <button className="mr-3 text-blue-600 hover:text-blue-800" onClick={() => openEditExpenseModal(expense)}>
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteExpense(expense._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modals */}
          {/* Add Expense Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Add New Expense</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        value={expenseData.category}
                        onChange={(e) => {
                          const catId = e.target.value;
                          setExpenseData({ ...expenseData, category: catId });
                          if (catId) fetchCategoryById(catId);
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setIsAddCategoryOpen(true)}>+</button>
                    </div>
                  </div>
                  {selectedCategory && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-800">{selectedCategory.name}</span>
                        <div className="space-x-2">
                          <button className="text-yellow-600 hover:text-yellow-700" onClick={() => openEditCategoryModal(selectedCategory)}>Update</button>
                          <button className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCategory(selectedCategory.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={expenseData.property}
                      onChange={(e) => setExpenseData({ ...expenseData, property: e.target.value })}
                    >
                      <option value="">Select Property</option>
                      {properties.map((prop) => (
                        <option key={prop._id} value={prop._id}>{prop.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter amount"
                        value={expenseData.amount}
                        onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={expenseData.date}
                        onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={expenseData.paidBy}
                        onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                      >
                        <option value="Organization">Organization</option>
                        {uniquePaidBy.map((payer) => (
                          <option key={payer} value={payer}>{payer}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid To</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Recipient name"
                        value={expenseData.paidTo}
                        onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
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
                            expenseData.collectionMode === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      className="w-full p-3 border border-dashed border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => setExpenseData({ ...expenseData, billImage: e.target.files[0] })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700" onClick={handleAddExpense}>
                      Add Expense
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Expense Modal - similar to add, but with handleUpdateExpense */}
          {isEditExpenseOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Edit Expense</h3>
                    <button
                      onClick={() => {
                        setIsEditExpenseOpen(false);
                        setEditExpenseId(null);
                        setExpenseData({
                          category: '',
                          property: '',
                          amount: '',
                          date: '',
                          paidBy: 'Organization',
                          paidTo: '',
                          description: '',
                          collectionMode: '',
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
                  {/* Similar fields as add modal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        value={expenseData.category}
                        onChange={(e) => {
                          const catId = e.target.value;
                          setExpenseData({ ...expenseData, category: catId });
                          if (catId) fetchCategoryById(catId);
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setIsAddCategoryOpen(true)}>+</button>
                    </div>
                  </div>
                  {selectedCategory && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-800">{selectedCategory.name}</span>
                        <div className="space-x-2">
                          <button className="text-yellow-600 hover:text-yellow-700" onClick={() => openEditCategoryModal(selectedCategory)}>Update</button>
                          <button className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCategory(selectedCategory.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={expenseData.property}
                      onChange={(e) => setExpenseData({ ...expenseData, property: e.target.value })}
                    >
                      <option value="">Select Property</option>
                      {properties.map((prop) => (
                        <option key={prop._id} value={prop._id}>{prop.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Other fields similar to add */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        value={expenseData.amount}
                        onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={expenseData.date}
                        onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={expenseData.paidBy}
                        onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                      >
                        <option value="Organization">Organization</option>
                        {uniquePaidBy.map((payer) => (
                          <option key={payer} value={payer}>{payer}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid To</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={expenseData.paidTo}
                        onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
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
                            expenseData.collectionMode === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      className="w-full p-3 border border-dashed border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => setExpenseData({ ...expenseData, billImage: e.target.files[0] })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700" onClick={handleUpdateExpense}>
                      Update Expense
                    </button>
                    <button
                      className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300"
                      onClick={() => {
                        setIsEditExpenseOpen(false);
                        setEditExpenseId(null);
                        setExpenseData({
                          category: '',
                          property: '',
                          amount: '',
                          date: '',
                          paidBy: 'Organization',
                          paidTo: '',
                          description: '',
                          collectionMode: '',
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

          {/* Category Modals - keep as is */}
          {isAddCategoryOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md m-4">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Add New Category</h3>
                    <button onClick={() => setIsAddCategoryOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter category name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700" onClick={handleAddCategory}>
                      Add Category
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300" onClick={() => setIsAddCategoryOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditCategoryOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md m-4">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Edit Category</h3>
                    <button onClick={() => setIsEditCategoryOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700" onClick={handleUpdateCategory}>
                      Update Category
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300" onClick={() => setIsEditCategoryOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyManagerExpenses;