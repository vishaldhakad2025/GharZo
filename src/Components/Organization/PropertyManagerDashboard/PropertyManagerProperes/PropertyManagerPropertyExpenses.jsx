import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const PropertyManagerPropertyExpenses = () => {
  const params = useParams();
  const propertyId = params.propertyId || params.id || "";
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pmId, setPmId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem('token') || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalExpenseData, setModalExpenseData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: '',
    paidTo: '',
    description: '',
    collectionMode: '',
    billImage: null,
  });
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

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

  const primaryColor = "#5C4EFF";
  const accentColor = "#1fc9b2";
  const bgGradient = "bg-gradient-to-br from-[#e7eaff] via-white to-[#7cf7b7]";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('No token found in localStorage. Please log in.');
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
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch profile: ${errorData.message || 'Unauthorized'}`);
        }
      } catch (error) {
        setError('An error occurred while fetching the profile');
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchPropertyName = async () => {
      if (!token || !propertyId) return;
      try {
        const res = await fetch(
          `https://api.gharzoreality.com/api/pm/properties/${propertyId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPropertyName(data.property?.name || "");
        }
      } catch {
        setPropertyName("");
      }
    };
    if (propertyId) fetchPropertyName();
  }, [token, propertyId]);

  useEffect(() => {
    if (!token) {
      const t = localStorage.getItem('token');
      if (t) setToken(t);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token || !pmId) return;
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/pm/categories`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.ok || response.status === 304) {
          const data = await response.json();
          setCategories(
            data.pmCategories.map((category) => ({
              name: category.name || '',
              id: category._id,
            }))
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
    if (pmId) fetchCategories();
  }, [token, pmId]);

  useEffect(() => {
    const fetchPropertyExpenses = async () => {
      let currentToken = token;
      if (!currentToken) {
        currentToken = localStorage.getItem('token');
        setToken(currentToken || "");
      }
      if (!currentToken || !propertyId) {
        setError('Missing token or property ID.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/pm/expenses/property/${propertyId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          }
        );
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
      } finally {
        setIsLoading(false);
      }
    };
    if (propertyId) {
      fetchPropertyExpenses();
    } else {
      setError('Missing property ID. Please check the URL or navigation.');
      setIsLoading(false);
    }
  }, [token, propertyId]);

  const handleSubmitExpense = async () => {
    if (!token || !pmId) {
      setError('Missing token or PM ID.');
      return;
    }
    if (
      !modalExpenseData.category ||
      !modalExpenseData.amount ||
      !modalExpenseData.date ||
      !modalExpenseData.paidBy ||
      !modalExpenseData.paidTo ||
      !modalExpenseData.description ||
      !modalExpenseData.collectionMode
    ) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('category', modalExpenseData.category);
      formData.append('amount', modalExpenseData.amount);
      formData.append('date', new Date(modalExpenseData.date).toISOString().split('T')[0]);
      formData.append('paidBy', modalExpenseData.paidBy);
      formData.append('paidTo', modalExpenseData.paidTo);
      formData.append('description', modalExpenseData.description);
      formData.append('collectionMode', modalExpenseData.collectionMode);
      formData.append('pm', pmId);
      formData.append('property', propertyId);
      if (modalExpenseData.billImage) {
        formData.append('billImage', modalExpenseData.billImage);
      }

      const url = isEditMode 
        ? `https://api.gharzoreality.com/api/pm/expenses/${editExpenseId}`
        : `https://api.gharzoreality.com/api/pm/expenses/property/${propertyId}`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        if (isEditMode) {
          setExpenses(
            expenses.map((expense) =>
              expense._id === editExpenseId ? data.expense : expense
            )
          );
        } else {
          setExpenses(prev => [...prev, data.expense || data]);
        }
        setSuccessMessage(data.message || (isEditMode ? 'Expense updated successfully!' : 'Expense created successfully!'));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        closeModal();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to ${isEditMode ? 'update' : 'create'} expense: ${errorData.message || 'Unauthorized'}`);
      }
    } catch (error) {
      setError(`An error occurred while ${isEditMode ? 'updating' : 'creating'} the expense`);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!token || !expenseId) {
      setError('Missing token or expense ID.');
      return;
    }
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    try {
      const response = await fetch(
        `https://api.gharzoreality.com/api/pm/expenses/${expenseId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setExpenses(expenses.filter((expense) => expense._id !== expenseId));
        setSuccessMessage(data.message || 'Expense deleted successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to delete expense: ${errorData.message || 'Unauthorized'}`);
      }
    } catch (error) {
      setError('An error occurred while deleting the expense');
    }
  };

  const openCreateModal = () => {
    setModalExpenseData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: '',
      paidTo: '',
      description: '',
      collectionMode: '',
      billImage: null,
    });
    setIsEditMode(false);
    setEditExpenseId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setModalExpenseData({
      category: expense.category?._id || expense.category || '',
      amount: expense.amount?.toString() || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paidBy: expense.paidBy || '',
      paidTo: expense.paidTo || '',
      description: expense.description || '',
      collectionMode: expense.collectionMode || '',
      billImage: null,
    });
    setEditExpenseId(expense._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditExpenseId(null);
    setIsEditMode(false);
    setModalExpenseData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: '',
      paidTo: '',
      description: '',
      collectionMode: '',
      billImage: null,
    });
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${bgGradient} flex items-center justify-center transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="relative">
          <div className={`animate-spin rounded-full h-20 w-20 border-t-4 border-[${primaryColor}]`}></div>
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-semibold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${bgGradient} text-gray-800 p-2 sm:p-4 transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="w-full mx-auto">
        {/* Header */}
        <header className={`bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-[${primaryColor}]`}>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-[${primaryColor}] tracking-tight`}>
              {propertyName ? `Expenses for ${propertyName}` : "Property Expenses"}
            </h1>
            <p className={`text-[${accentColor}] mt-1 text-sm`}>
              Manage and track all expenses associated with your property.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className={`mt-4 sm:mt-0 bg-gradient-to-r from-[${primaryColor}] to-[${accentColor}] hover:from-[${primaryColor}]/90 hover:to-[${accentColor}]/90 text-white py-2 px-6 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-2xl shadow-xl z-50 max-w-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className={`bg-gradient-to-r from-[${primaryColor}/10] to-[${accentColor}/10] border-b border-gray-200`}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid On</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid To</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.length > 0 ? (
                  expenses.map((expense, index) => (
                    <tr key={expense._id || index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.date && !isNaN(new Date(expense.date).getTime())
                          ? new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Invalid Date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {expense.category && typeof expense.category === 'object' && expense.category.name
                          ? expense.category.name
                          : 'Unknown'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-[${primaryColor}]`}>
                        ₹{expense.amount || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.collectionMode || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.paidBy || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.paidTo || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={expense.description || 'N/A'}>
                        {expense.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200"
                            onClick={() => openEditModal(expense)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200"
                            onClick={() => handleDeleteExpense(expense._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium mb-2">No Expenses Found</h3>
                        <p className="text-sm">No expenses recorded for this property yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category *</label>
                  <select
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    value={modalExpenseData.category}
                    onChange={(e) => setModalExpenseData({ ...modalExpenseData, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter amount"
                    value={modalExpenseData.amount}
                    onChange={(e) => setModalExpenseData({ ...modalExpenseData, amount: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    value={modalExpenseData.date}
                    onChange={(e) => setModalExpenseData({ ...modalExpenseData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By *</label>
                  <input
                    type="text"
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter who paid (e.g., Property Manager name)"
                    value={modalExpenseData.paidBy}
                    onChange={(e) => setModalExpenseData({ ...modalExpenseData, paidBy: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paid To *</label>
                  <input
                    type="text"
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                    placeholder="Enter paid to"
                    value={modalExpenseData.paidTo}
                    onChange={(e) => setModalExpenseData({ ...modalExpenseData, paidTo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Collection Mode *</label>
                  <div className="flex flex-wrap gap-2">
                    {['Cash', 'GPay', 'PhonePe', 'Paytm', 'UPI'].map((mode) => (
                      <button
                        key={mode}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          modalExpenseData.collectionMode === mode
                            ? `bg-[${primaryColor}] text-white shadow-md`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setModalExpenseData({ ...modalExpenseData, collectionMode: mode })}
                        type="button"
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all`}
                  placeholder="Enter description"
                  rows={3}
                  value={modalExpenseData.description}
                  onChange={(e) => setModalExpenseData({ ...modalExpenseData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Bill (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${primaryColor}] focus:border-[${primaryColor}] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[${primaryColor}] file:text-white hover:file:bg-[${primaryColor}]/90`}
                  onChange={(e) => setModalExpenseData({ ...modalExpenseData, billImage: e.target.files[0] })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-xl font-medium transition-all"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 bg-gradient-to-r from-[${primaryColor}] to-[${accentColor}] hover:from-[${primaryColor}]/90 hover:to-[${accentColor}]/90 text-white py-3 px-6 rounded-xl font-medium shadow-lg transition-all`}
                  onClick={handleSubmitExpense}
                >
                  {isEditMode ? 'Update Expense' : 'Create Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagerPropertyExpenses;