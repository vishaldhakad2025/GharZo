import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const OrganizationPropertyExpenses = () => {
  const params = useParams();
  const propertyId = params.propertyId || params.id || ""; // fallback for different route param names
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [landlordId, setLandlordId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem('orgToken') || "");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState({
    category: '',
    amount: '',
    date: '2025-09-14',
    paidBy: 'Landlord',
    paidTo: '',
    description: '',
    collectionMode: '',
    billImage: null,
  });
  const [editExpenseId, setEditExpenseId] = useState(null);

  // Fetch landlord profile to get landlordId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('No token found in localStorage. Please log in.');
        return;
      }
      try {
        const response = await fetch('https://api.gharzoreality.com/api/landlord/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setLandlordId(data.landlord._id);
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

  // Fetch property name
  useEffect(() => {
    const fetchPropertyName = async () => {
      if (!token || !propertyId) return;
      try {
        const res = await fetch(
          `https://api.gharzoreality.com/api/landlord/properties/${propertyId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPropertyName(data.name || data.property?.name || "");
        }
      } catch {
        setPropertyName("");
      }
    };
    if (propertyId) fetchPropertyName();
  }, [token, propertyId]);

  useEffect(() => {
    // In case token is set after login, update it here
    if (!token) {
      const t = localStorage.getItem('orgToken');
      if (t) setToken(t);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token || !landlordId) return;
      try {
        const response = await fetch(
          `https://api.gharzoreality.com/api/expense-categories?landlord=${landlordId}`,
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
            data.map((category) => ({
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
    if (landlordId) fetchCategories();
  }, [token, landlordId]);

  useEffect(() => {
    const fetchPropertyExpenses = async () => {
      // Defensive: Try to get token again if not present
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
          `https://api.gharzoreality.com/api/expenses/property/${propertyId}`,
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
    // Only fetch if propertyId is present
    if (propertyId) {
      fetchPropertyExpenses();
    } else {
      setError('Missing property ID. Please check the URL or navigation.');
      setIsLoading(false);
    }
  }, [token, propertyId]);

  const handleUpdateExpense = async () => {
    if (!token || !landlordId || !editExpenseId) {
      setError('Missing token, landlord ID, or expense ID.');
      return;
    }
    if (
      !editExpenseData.category ||
      !editExpenseData.amount ||
      !editExpenseData.date ||
      !editExpenseData.paidBy ||
      !editExpenseData.paidTo ||
      !editExpenseData.description ||
      !editExpenseData.collectionMode
    ) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('category', editExpenseData.category);
      formData.append('amount', editExpenseData.amount);
      formData.append('date', new Date(editExpenseData.date).toISOString().split('T')[0]);
      formData.append('paidBy', editExpenseData.paidBy);
      formData.append('paidTo', editExpenseData.paidTo);
      formData.append('description', editExpenseData.description);
      formData.append('collectionMode', editExpenseData.collectionMode);
      formData.append('landlord', landlordId);
      if (editExpenseData.billImage) {
        formData.append('billImage', editExpenseData.billImage);
      }
      const response = await fetch(`https://api.gharzoreality.com/api/expenses/${editExpenseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(
          expenses.map((expense) =>
            expense._id === editExpenseId ? data.expense : expense
          )
        );
        setSuccessMessage(data.message || 'Expense updated successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsEditModalOpen(false);
        setEditExpenseId(null);
        setEditExpenseData({
          category: '',
          amount: '',
          date: '2025-09-14',
          paidBy: 'Landlord',
          paidTo: '',
          description: '',
          collectionMode: '',
          billImage: null,
        });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to update expense: ${errorData.message || 'Unauthorized'}`);
      }
    } catch (error) {
      setError('An error occurred while updating the expense');
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
        `https://api.gharzoreality.com/api/expenses/${expenseId}`,
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

  const openEditModal = (expense) => {
    setEditExpenseData({
      category: expense.category?._id || expense.category || '',
      amount: expense.amount?.toString() || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '2025-09-14',
      paidBy: expense.paidBy || 'Landlord',
      paidTo: expense.paidTo || '',
      description: expense.description || '',
      collectionMode: expense.collectionMode || '',
      billImage: null,
    });
    setEditExpenseId(expense._id);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
                {error}
              </div>
            )}
            {showSuccess && (
              <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center animate-pulse">
                {successMessage}
                <button
                  onClick={() => setShowSuccess(false)}
                  className="ml-4 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                {propertyName
                  ? `Expenses for ${propertyName}`
                  : "Expenses"}
              </h2>
            </div>

            {/* Expenses Table */}
            <div className="bg-white text-black p-4 rounded shadow overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left text-sm sm:text-base">Paid On</th>
                    <th className="p-2 text-left text-sm sm:text-base">Category</th>
                    <th className="p-2 text-left text-sm sm:text-base">Amount</th>
                    <th className="p-2 text-left text-sm sm:text-base">Payment Mode</th>
                    <th className="p-2 text-left text-sm sm:text-base">Paid By</th>
                    <th className="p-2 text-left text-sm sm:text-base">Paid To</th>
                    <th className="p-2 text-left text-sm sm:text-base">Description</th>
                    <th className="p-2 text-left text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <tr key={expense._id || Math.random()} className="border-b">
                        <td className="p-2 text-sm sm:text-base">
                          {expense.date && !isNaN(new Date(expense.date).getTime())
                            ? new Date(expense.date).toLocaleDateString()
                            : 'Invalid Date'}
                        </td>
                        <td className="p-2 text-sm sm:text-base">
                          {expense.category && typeof expense.category === 'object' && expense.category.name
                            ? expense.category.name
                            : 'Unknown'}
                        </td>
                        <td className="p-2 text-sm sm:text-base">₹{expense.amount || 'N/A'}</td>
                        <td className="p-2 text-sm sm:text-base">{expense.collectionMode || 'N/A'}</td>
                        <td className="p-2 text-sm sm:text-base">{expense.paidBy || 'N/A'}</td>
                        <td className="p-2 text-sm sm:text-base">{expense.paidTo || 'N/A'}</td>
                        <td className="p-2 text-sm sm:text-base">{expense.description || 'N/A'}</td>
                        <td className="p-2 text-sm sm:text-base">
                          <div className="flex space-x-2">
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
                              onClick={() => openEditModal(expense)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
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
                      <td colSpan="8" className="text-center p-4 text-sm sm:text-base">
                        No Expenses Found for this Property
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditExpenseId(null);
                setEditExpenseData({
                  category: '',
                  amount: '',
                  date: '2025-09-14',
                  paidBy: 'Landlord',
                  paidTo: '',
                  description: '',
                  collectionMode: '',
                  billImage: null,
                });
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-black">Edit Expense</h3>
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select category</label>
                <select
                  className="w-full p-2 border rounded text-black"
                  value={editExpenseData.category}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, category: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700">Expense Details</label>
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editExpenseData.amount}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, amount: e.target.value })}
                />
                <input
                  type="date"
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editExpenseData.date}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, date: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editExpenseData.paidBy}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, paidBy: e.target.value })}
                >
                  <option value="Landlord">Landlord</option>
                </select>
                <input
                  type="text"
                  placeholder="Paid To"
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editExpenseData.paidTo}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, paidTo: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editExpenseData.description}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Collection Mode</label>
                <div className="flex space-x-2 flex-wrap">
                  {['Cash', 'GPay', 'PhonePe', 'Paytm', 'UPI'].map((mode) => (
                    <button
                      key={mode}
                      className={`p-2 rounded m-1 ${
                        editExpenseData.collectionMode === mode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                      }`}
                      onClick={() => setEditExpenseData({ ...editExpenseData, collectionMode: mode })}
                      type="button"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload New Bill (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded mb-2 text-black"
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, billImage: e.target.files[0] })}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="w-1/2 bg-blue-500 text-white p-2 rounded"
                  onClick={handleUpdateExpense}
                >
                  Update Expense
                </button>
                <button
                  className="w-1/2 bg-gray-500 text-white p-2 rounded"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditExpenseId(null);
                    setEditExpenseData({
                      category: '',
                      amount: '',
                      date: '2025-09-14',
                      paidBy: 'Landlord',
                      paidTo: '',
                      description: '',
                      collectionMode: '',
                      billImage: null,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPropertyExpenses;