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
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import { motion } from "framer-motion";
import baseurl from "../../../../../BaseUrl";

// ──────────────────────────────────────────────────────────────
//  BRAND COLORS
// ──────────────────────────────────────────────────────────────
const NAVY = "#172554";
const ORANGE = "#F97316";
const ORANGE_DARK = "#ea580c";

const PropertyExpenses = ({ propertyId }) => {
  const [data, setData] = useState({
    success: false,
    propertyId: "",
    total: 0,
    page: 1,
    pages: 1,
    expenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login.");
          return;
        }

        const response = await fetch(
          `${baseurl}api/subowner/expenses/property/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch expenses");

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchExpenses();
  }, [propertyId]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewImage = (billImage) => {
    if (billImage) {
      setSelectedImage(`https://api.drazeapp.com${billImage}`);
      setIsImageModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#172554] font-medium">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 shadow-lg max-w-md w-full text-center border-t-4 border-red-500">
          <div className="text-red-500 text-5xl mb-6">
            <FaExclamationCircle />
          </div>
          <h2 className="text-xl font-bold text-[#172554] mb-3">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        {/* <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172554]">
            GHARZO <span className="text-[#F97316]">Expenses</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Track all financial transactions for this property
          </p>
        </div> */}

        {/* Total Summary Card */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border-t-4 border-[#F97316] p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                <FaMoneyBillWave className="text-[#F97316] text-4xl" />
              </div>
            </div>
            <h2 className="text-5xl sm:text-6xl font-extrabold text-[#172554] mb-2">
              ₹{data.total?.toLocaleString() || "0"}
            </h2>
            <p className="text-xl text-gray-600 font-medium">Total Expenses</p>
          </div>
        </div>

        {/* Expenses List */}
        {data.expenses?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <FaMoneyBillWave className="mx-auto text-7xl text-[#F97316]/30 mb-6" />
            <h3 className="text-2xl font-semibold text-[#172554] mb-3">
              No expenses recorded
            </h3>
            <p className="text-gray-600">
              All property expenses will appear here once added
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.expenses.map((expense) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-[#F97316]/40 transition-all duration-300"
              >
                {/* Top accent bar */}
                <div className="h-2 bg-gradient-to-r from-[#F97316] to-[#ea580c]" />

                <div className="p-6">
                  {/* Category & Amount */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-[#172554] mb-1">
                        {expense.category?.name || "Uncategorized"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(expense.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#F97316]">
                        ₹{expense.amount?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500">Paid</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Paid By</p>
                        <p className="font-medium text-[#172554] truncate">
                          {expense.paidBy || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Paid To</p>
                        <p className="font-medium text-[#172554] truncate">
                          {expense.paidTo || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <FaCreditCard className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Mode</p>
                        <p className="font-medium text-[#172554]">
                          {expense.collectionMode || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <FaClock className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Created</p>
                        <p className="font-medium text-[#172554]">
                          {formatDate(expense.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bill Image */}
                  {expense.billImage && (
                    <button
                      onClick={() => handleViewImage(expense.billImage)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-[#172554] py-3 rounded-xl transition-colors border border-gray-200"
                    >
                      <FaImage className="text-[#F97316]" />
                      View Bill Image
                      <FaEye className="text-gray-600" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <img
              src={selectedImage}
              alt="Bill"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyExpenses;