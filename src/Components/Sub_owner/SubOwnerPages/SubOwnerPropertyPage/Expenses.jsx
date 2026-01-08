import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaImage,
  FaHome,
  FaClock,
  FaExclamationCircle,
  FaSpinner,
  FaUserCircle,
  FaEye,
} from "react-icons/fa";
import { motion } from "framer-motion";

const PropertyExpenses = ({ propertyId }) => {
  const [data, setData] = useState({
    success: false,
    propertyId: "",
    total: 0,
    page: 1,
    pages: 1,
    expenses: [],
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

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

  // Fetch expenses data for the given propertyId
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.gharzoreality.com/api/subowner/expenses/property/${propertyId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch property expenses: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchExpenses();
    } else {
      setError("No property ID provided.");
      setLoading(false);
    }
  }, [propertyId]);

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Handle image view click
  const handleViewImage = (billImage) => {
    if (billImage) {
      setSelectedImage(`https://api.gharzoreality.com${billImage}`);
      setIsImageModalOpen(true);
    }
  };

  // Colorful 3D Icon Component
  const Colorful3DIcon = ({
    icon: Icon,
    color,
    size = "lg",
    className = "",
  }) => (
    <motion.div
      className={`relative p-2 rounded-2xl shadow-lg bg-gradient-to-br ${color} transform hover:scale-110 hover:rotate-3 transition-all duration-300 perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ y: -5 }}
    >
      <Icon className={`text-white text-${size} drop-shadow-lg`} />
      <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="text-center">
          <Colorful3DIcon
            icon={FaSpinner}
            color="from-blue-500 to-purple-600"
            size="2xl"
          />
          <p className="mt-4 text-lg font-semibold text-gray-600">
            Loading Expenses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center transition-all duration-500 min-w-0 ${
          isSidebarHovered
            ? "md:ml-[256px] md:w-[calc(100%-256px)]"
            : "md:ml-[64px] md:w-[calc(100%-64px)]"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <Colorful3DIcon
            icon={FaExclamationCircle}
            color="from-red-500 to-orange-500"
          />
          <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
   
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Property Expenses
          </h1>
          <p className="text-xl text-gray-600">
            View all expenses for this property
          </p>
        </div>

        {/* Total Expenses Stat */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <Colorful3DIcon
              icon={FaMoneyBillWave}
              color="from-blue-500 to-indigo-600"
            />
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Expenses
              </h3>
              <p className="text-3xl font-bold text-gray-900">{data.total}</p>
            </div>
          </div>
        </div>

        {/* Expenses Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.expenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Colorful3DIcon
                  icon={FaFileInvoiceDollar}
                  color="from-green-500 to-emerald-600"
                  size="2xl"
                />
                <b>Expense</b>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaHome}
                    color="from-purple-500 to-pink-600"
                    size="xs"
                  />
                  <span>
                    Category: {expense.category ? expense.category.name : "N/A"}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaMoneyBillWave}
                    color="from-indigo-500 to-blue-600"
                    size="xs"
                  />
                  <span>Amount: ₹{expense.amount.toLocaleString()}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaCalendarAlt}
                    color="from-yellow-500 to-orange-600"
                    size="xs"
                  />
                  <span>Date: {formatDate(expense.date)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaUser}
                    color="from-red-500 to-pink-600"
                    size="xs"
                  />
                  <span>Paid By: {expense.paidBy}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaUserCircle}
                    color="from-teal-500 to-cyan-600"
                    size="xs"
                  />
                  <span>Paid To: {expense.paidTo}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaCreditCard}
                    color="from-purple-500 to-indigo-600"
                    size="xs"
                  />
                  <span>Mode: {expense.collectionMode}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaImage}
                    color="from-orange-500 to-red-600"
                    size="xs"
                  />
                  <span>
                    Bill Image: {expense.billImage ? "Available" : "N/A"}
                    {expense.billImage && (
                      <button
                        onClick={() => handleViewImage(expense.billImage)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FaEye className="inline-block" />
                      </button>
                    )}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Colorful3DIcon
                    icon={FaClock}
                    color="from-gray-500 to-gray-700"
                    size="xs"
                  />
                  <span>Created: {formatDate(expense.createdAt)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl m-2 sm:m-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Bill Image</h3>
                <button
                  onClick={() => setIsImageModalOpen(false)}
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
              <div className="p-6">
                <img
                  src={selectedImage}
                  alt="Bill"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {data.expenses.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white rounded-2xl shadow-lg">
            No expenses found for this property
          </div>
        )}
      </div>
  
  );
};

export default PropertyExpenses;
