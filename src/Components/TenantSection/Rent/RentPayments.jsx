import React, { useState, useEffect } from "react";
import { FaDownload, FaMoneyBillWave, FaTimes, FaSyncAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import { AlertCircle, Home, DollarSign, Calendar, CreditCard } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TenantRentPayments = () => {
  const [rentHistory, setRentHistory] = useState([]);
  const [totalDues, setTotalDues] = useState(0);
  const [duesByType, setDuesByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState({
    propertyName: "Property",
    roomId: "Room",
  });
  const [landlordId, setLandlordId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('info'); // success, error

  const { tenantId } = useParams();

  const showCustomDialog = (type, message) => {
    setDialogType(type);
    setDialogMessage(message);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage('');
    setDialogType('info');
  };

  const calculateDues = (history) => {
    const pendingBills = history.filter((bill) => bill.status === "PENDING");
    const calculatedTotalDues = pendingBills.reduce(
      (sum, bill) => sum + (bill.balanceAmount || bill.amount),
      0
    );
    const calculatedDuesByType = pendingBills.reduce((acc, bill) => {
      const type = bill.type || "Other";
      acc[type] = (acc[type] || 0) + (bill.balanceAmount || bill.amount);
      return acc;
    }, {});
    setTotalDues(calculatedTotalDues);
    setDuesByType(calculatedDuesByType);
  };

  const fetchAccommodationAndDues = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Fetch accommodation details to get landlordId dynamically
      let propertyName = "Property";
      let roomId = "Room";
      let fetchedLandlordId = null;

      try {
        const accRes = await axios.get(
          "https://api.gharzoreality.com/api/tenant/accommodations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const accommodation = accRes.data.accommodations?.[0];
        if (accommodation) {
          propertyName = accommodation.propertyName || propertyName;
          roomId = accommodation.roomId || roomId;
          fetchedLandlordId = accommodation.landlordId || null;
        }
      } catch (err) {
        console.warn("Could not fetch accommodation details, using defaults.");
      }

      setPropertyDetails({ propertyName, roomId });
      setLandlordId(fetchedLandlordId);

      if (!fetchedLandlordId) {
        throw new Error("Landlord ID not found in accommodation data.");
      }

      // NEW API CALL - Dynamic tenantId and landlordId
      const duesResponse = await axios.get(
        `https://api.gharzoreality.com/api/dues/tenant/${tenantId}/${fetchedLandlordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allBills = duesResponse.data.dues || [];
      console.log("Fetched Bills (New API):", allBills);

      const formattedHistory = allBills.map((bill) => {
        const billId = bill._id;
        const status = bill.status;
        const paid = status === "PAID";
        const paymentMode = bill.paymentMode || "—";
        const dueDate = new Date(bill.dueDate).toISOString().split("T")[0];
        const payDate = paid
          ? bill.paymentHistory?.[0]?.date
            ? new Date(bill.paymentHistory[0].date).toISOString().split("T")[0]
            : dueDate
          : dueDate;

        const razorpayId = bill.razorpayPaymentId || null;

        return {
          billNumber: billId,
          month: new Date(bill.dueDate).toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          amount: bill.amount,
          balanceAmount: bill.balanceAmount || bill.amount,
          paid,
          status,
          dueDate: bill.dueDate,
          date: payDate,
          type: bill.dueId?.name || "Other",
          description: bill.dueId?.name || "Miscellaneous Due",
          propertyName,
          roomId,
          method: paid ? (bill.paymentHistory?.[0]?.method || paymentMode) : paymentMode,
          paymentId: razorpayId,
        };
      });

      setRentHistory(formattedHistory);
      calculateDues(formattedHistory);
    } catch (error) {
      console.error("Error fetching data:", error);
      const msg = error.response?.data?.message || error.message || "Failed to load dues.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchAccommodationAndDues();
    }
  }, [tenantId]);

  const handleRefreshDues = () => {
    fetchAccommodationAndDues();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // const handlePayNow = async (billId, amount) => {
  //   try {
  //     const res = await loadRazorpayScript();
  //     if (!res) {
  //       showCustomDialog('error', "Razorpay SDK failed to load. Are you online?");
  //       return;
  //     }

  //     const options = {
  //       key: "rzp_test_RRfW6t8CvR90od",
  //       amount: amount * 100,
  //       currency: "INR",
  //       name: "Draze App",
  //       description: `Payment for bill ${billId}`,
  //       handler: async function (response) {
  //         try {
  //           const token = localStorage.getItem("tenanttoken");
  //           if (!token) {
  //             throw new Error("No auth token found.");
  //           }
  //           const billIndex = rentHistory.findIndex((b) => b.billNumber === billId);
  //           if (billIndex === -1) {
  //             throw new Error("Bill not found.");
  //           }

  //           const dueDate = new Date(rentHistory[billIndex].dueDate);
  //           const fullMonth = dueDate.toLocaleString("en-US", { month: "long" });
  //           const year = dueDate.getFullYear();

  //           const body = {
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             amount: amount,
  //             tenantId,
  //             landlordId: landlordId, // Now dynamic
  //             propertyId: propertyDetails.propertyId || null,
  //             category: rentHistory[billIndex].type,
  //             month: fullMonth,
  //             year: year.toString(),
  //             dueIds: [billId],
  //           };

  //           console.log("=== PAYMENT BODY FULL DETAIL ===");
  //           console.log("dueIds being sent:", body.dueIds);
  //           console.log("Full body:", JSON.stringify(body, null, 2));
  //           console.log("=== END PAYMENT BODY ===");

  //           const postRes = await axios.post(
  //             "https://api.gharzoreality.com/api/payments/capturePayment",
  //             body,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //                 "Content-Type": "application/json",
  //               },
  //             }
  //           );

  //           console.log("Capture response:", postRes.data);

  //           if (postRes.data.success) {
  //             showCustomDialog('success', `Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
              
  //             const updatedHistory = [...rentHistory];
  //             updatedHistory[billIndex] = {
  //               ...updatedHistory[billIndex],
  //               paid: true,
  //               status: "PAID",
  //               date: new Date().toISOString().split("T")[0],
  //               method: "Razorpay",
  //               paymentId: response.razorpay_payment_id,
  //             };
  //             setRentHistory(updatedHistory);
  //             calculateDues(updatedHistory);

  //             setTimeout(() => {
  //               fetchAccommodationAndDues();
  //             }, 3000);
  //           } else {
  //             const errorMsg = postRes.data.message || "Payment capture failed on server.";
  //             console.error("Server error:", postRes.data);
  //             showCustomDialog('error', `Capture failed: ${errorMsg}`);
  //           }
  //         } catch (err) {
  //           console.error("Error capturing payment:", err);
  //           const errorMsg = err.response?.data?.message || err.message || "Unknown error during capture.";
  //           showCustomDialog('error', `Capture error: ${errorMsg}`);
  //         }
  //       },
  //       payment_failed: function (response) {
  //         console.error("Razorpay payment failed:", response);
  //         const errorCode = response.error?.code || "UNKNOWN_ERROR";
  //         const errorDesc = response.error?.description || "Payment failed. Please try again.";
  //         showCustomDialog('error', `Payment Error (${errorCode}): ${errorDesc}\n\nIf this is a 400 Bad Request (e.g., invalid key), check your Razorpay API key.`);
  //       },
  //       prefill: {
  //         name: "Tenant Name",
  //         email: "tenant@example.com",
  //         contact: "9999999999",
  //       },
  //       theme: {
  //         color: "#3399cc",
  //       },
  //       modal: {
  //         ondismiss: function() {
  //           console.log("Payment modal dismissed");
  //         }
  //       }
  //     };

  //     const rzp1 = new window.Razorpay(options);
  //     rzp1.open();
  //   } catch (error) {
  //     console.error("Payment initiation failed:", error);
  //     showCustomDialog('error', "Payment initiation failed. Please try again.");
  //   }
  // };

const handlePayNow = async (billId, amount) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        showCustomDialog('error', "Razorpay SDK failed to load. Are you online?");
        return;
      }

      const options = {
        key: "rzp_test_RRfW6t8CvR90od", // ⚠️ NOTE: This test key may be invalid/expired. Replace with a valid key from your Razorpay dashboard.
        amount: amount * 100,
        currency: "INR",
        name: "Draze App",
        description: `Payment for bill ${billId}`,
        handler: async function (response) {
          try {
            const token = localStorage.getItem("tenanttoken");
            if (!token) {
              throw new Error("No auth token found.");
            }
            const billIndex = rentHistory.findIndex((b) => b.billNumber === billId);
            if (billIndex === -1) {
              throw new Error("Bill not found.");
            }

            const dueDate = new Date(rentHistory[billIndex].dueDate);
            const fullMonth = dueDate.toLocaleString("en-US", { month: "long" });
            const year = dueDate.getFullYear();

            const body = {
              razorpay_payment_id: response.razorpay_payment_id,
              amount: amount,
              tenantId,
              landlordId,
              propertyId,
              category: rentHistory[billIndex].type,
              month: fullMonth,
              year: year.toString(),
              dueIds: [billId],
            };

            // NEW: Explicit full body log to show dueId clearly
            console.log("=== PAYMENT BODY FULL DETAIL ===");
            console.log("dueIds being sent:", body.dueIds); // Specific log for dueIds
            console.log("Full body:", JSON.stringify(body, null, 2)); // Full JSON for complete view
            console.log("=== END PAYMENT BODY ===");

            const postRes = await axios.post(
              "https://api.gharzoreality.com/api/payments/capturePayment",
              body,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("Capture response:", postRes.data);

            if (postRes.data.success) {
              showCustomDialog('success', `Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
              
              // Local UI update
              const updatedHistory = [...rentHistory];
              updatedHistory[billIndex] = {
                ...updatedHistory[billIndex],
                paid: true,
                status: "PAID",
                date: new Date().toISOString().split("T")[0],
                method: "Razorpay",
                paymentId: response.razorpay_payment_id,
              };
              setRentHistory(updatedHistory);
              calculateDues(updatedHistory);

              // Refetch with longer delay for backend sync
              setTimeout(() => {
                fetchAccommodationAndDues();
              }, 3000);
            } else {
              const errorMsg = postRes.data.message || "Payment capture failed on server.";
              console.error("Server error:", postRes.data);
              showCustomDialog('error', `Capture failed: ${errorMsg}`);
            }
          } catch (err) {
            console.error("Error capturing payment:", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error during capture.";
            showCustomDialog('error', `Capture error: ${errorMsg}`);
          }
        },
        // NEW: Added error handling for payment failures, including validation errors
        payment_failed: function (response) {
          console.error("Razorpay payment failed:", response);
          const errorCode = response.error?.code || "UNKNOWN_ERROR";
          const errorDesc = response.error?.description || "Payment failed. Please try again.";
          showCustomDialog('error', `Payment Error (${errorCode}): ${errorDesc}\n\nIf this is a 400 Bad Request (e.g., invalid key), check your Razorpay API key.`);
        },
        prefill: {
          name: "Tenant Name",
          email: "tenant@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
        // NEW: Added modal config to ensure proper error display
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      showCustomDialog('error', "Payment initiation failed. Please try again.");
    }
  };



  const handleReceiptClick = async (paymentId) => {
    try {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        showCustomDialog('error', "Authentication token not found.");
        return;
      }

      const res = await axios.post(
        `https://api.gharzoreality.com/api/payment/${paymentId}/generate-receipt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        console.log("Receipt generation response:", res.data);
        const receiptData = res.data.receipt || res.data.payment;
        const mergedData = {
          receiptNo: receiptData.receiptNo || receiptData.receiptNumber || 'N/A',
          date: receiptData.date || receiptData.paymentDate || new Date().toISOString(),
          tenantId: receiptData.tenantId || tenantId,
          property: receiptData.property ||propertyId|| 'N/A',
          paymentId: receiptData.paymentId || paymentId,
          method: receiptData.method || 'N/A',
          status: receiptData.status || 'PAID',
          amount: receiptData.amount || 0,
          totalPaid: receiptData.totalPaid || receiptData.amount || 0,
          note: receiptData.note || 'Captured via Razorpay',
        };

        setCurrentReceipt(receiptData);
        console.log("Current receipt set to:", receiptData);
        setReceiptUrl(`https://api.gharzoreality.com${res.data.receiptUrl}`);
        setReceiptNumber(mergedData.receiptNo);
        setShowReceipt(true);
      } else {
        showCustomDialog('error', res.data.message || "Failed to generate receipt.");
      }
    } catch (err) {
      console.error("Receipt error:", err);
      showCustomDialog('error', "Error fetching receipt.");
      const fallbackData = {
        receiptNo: 'N/A', 
        date: new Date().toISOString(),
        tenantId: tenantId,
        property: propertyId || 'N/A',
        paymentId: paymentId,
        method: 'N/A',
        status: 'PAID',
        amount: 0,
        totalPaid: 0,
        note: 'Captured via Razorpay',
      };
      setCurrentReceipt(fallbackData);
      setShowReceipt(true); 
    }
  };

  // const handleDownloadPDF = async (paymentId) => {
  //   try {
  //     const token = localStorage.getItem("tenanttoken");
  //     const res = await axios.post(
  //       `https://api.gharzoreality.com/api/payment/${paymentId}/generate-receipt`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (res.data.success) {
  //       const url = `https://api.gharzoreality.com${res.data.receiptUrl}`;
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = `Receipt-${res.data.receiptNumber}.pdf`;
  //       link.click();
  //     }
  //   } catch (err) {
  //     showCustomDialog('error', "Download failed.");
  //   }
  // };


 const handleDownloadPDF = async (paymentId) => {
    try {
      const token = localStorage.getItem("tenanttoken");
      if (!token) {
        showCustomDialog('error', "Authentication token not found. Please log in again.");
        return;
      }

      const res = await axios.post(
        `https://api.gharzoreality.com/api/payment/${paymentId}/generate-receipt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        const receiptUrl = `https://api.gharzoreality.com${res.data.receiptUrl}`;
        const receiptNumber = res.data.receiptNumber;

        const link = document.createElement("a");
        link.href = receiptUrl;
        link.download = `Receipt-${receiptNumber}.pdf`;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showCustomDialog('error', res.data.message || "Failed to generate receipt.");
      }
    } catch (err) {
      console.error("Error downloading receipt:", err);
      showCustomDialog('error', "Error downloading receipt. Please try again.");
    }
  };



  const closeReceiptModal = () => {
    setShowReceipt(false);
    setCurrentReceipt(null);
    setReceiptUrl(null);
    setReceiptNumber(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' +
           date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
        <p className="ml-4 text-gray-600 font-medium">Loading your payments...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 text-center border border-red-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full p-3 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
            Retry
          </button>
        </motion.div>
      </div>
    );

return (
  <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg mb-8"
        >
          <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-8 py-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-white/5 rounded-full -translate-y-20 translate-x-10"></div>
            <div className="relative flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.2, type: "spring" }} 
                className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
              >
                <AlertCircle size={28} />
              </motion.div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">Rent Payments</h1>
                <p className="text-blue-100 text-lg">Securely manage your rent and bill payments</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Accommodation Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.5 }} 
          className="relative bg-white rounded-3xl shadow-xl border border-gray-200 mb-8 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
          
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                  <Home size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {propertyDetails.propertyName} - {propertyDetails.roomId}
                  </h3>
                  <p className="text-gray-500">Your registered accommodation</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleRefreshDues}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 rounded-xl border border-gray-300 transition-all font-medium shadow-sm"
              >
                <FaSyncAlt className="w-4 h-4" />
                Refresh Dues
              </motion.button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-4 translate-x-4"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Total Outstanding</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">{formatAmount(totalDues)}</p>
                <p className="text-sm text-blue-500">All pending payments combined</p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-500" />
                  Due Breakdown
                </h4>
                <div className="space-y-3">
                  {Object.entries(duesByType).map(([type, amount]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <CreditCard size={16} className="text-indigo-500" />
                        </div>
                        <span className="font-medium text-gray-700">{type}</span>
                      </div>
                      <span className="font-bold text-indigo-600">{formatAmount(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(duesByType).length === 0 && (
                    <div className="text-center py-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <CreditCard size={32} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 font-medium">No outstanding dues</p>
                      <p className="text-sm text-gray-400 mt-1">All payments are up to date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Rent History Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.5 }} 
          className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                  <p className="text-gray-500">All your rent and bill payments</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold">
                {rentHistory.length} transactions
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rentHistory.map((rent, index) => (
                  <motion.tr 
                    key={rent.billNumber} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.05 }} 
                    className="hover:bg-blue-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{rent.month}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">{rent.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-blue-600">{formatAmount(rent.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                        rent.status === "PAID" 
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700" 
                          : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700"
                      }`}>
                        {rent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{rent.date || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-gray-700">{rent.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {rent.status === "PENDING" && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => handlePayNow(rent.billNumber, rent.balanceAmount || rent.amount)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            <FaMoneyBillWave className="w-4 h-4" />
                            Pay Now
                          </motion.button>
                        )}
                        {rent.status === "PAID" && rent.paymentId && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => handleReceiptClick(rent.paymentId)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            <FaDownload className="w-4 h-4" />
                            Receipt
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                
                {rentHistory.length === 0 && (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="max-w-sm mx-auto">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                          <CreditCard size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
                        <p className="text-gray-500">Your payment history will appear here once you make payments.</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          </div>
          
          {rentHistory.length > 0 && (
            <div className="px-8 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Pending</span>
                  </div>
                </div>
                <div>
                  Showing {rentHistory.length} of {rentHistory.length} transactions
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>

    {/* Enhanced Dialog Modal */}
    {showDialog && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
        onClick={closeDialog}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl border border-gray-200" 
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={closeDialog}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>
          
          <div className="text-center space-y-6">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
              dialogType === 'success' 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100' 
                : 'bg-gradient-to-r from-red-100 to-rose-100'
            }`}>
              {dialogType === 'success' ? 
                <FaCheckCircle className="w-8 h-8 text-green-500" /> : 
                <FaExclamationTriangle className="w-8 h-8 text-red-500" />
              }
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-2 ${
                dialogType === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {dialogType === 'success' ? 'Success!' : 'Attention Required'}
              </h3>
              <p className="text-gray-600 whitespace-pre-line">{dialogMessage}</p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={closeDialog}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Enhanced Receipt Modal */}
    {showReceipt && currentReceipt && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
        onClick={closeReceiptModal}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-gray-200" 
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={closeReceiptModal}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>
          
          <div className="p-8 space-y-8">
            {/* Receipt Header */}
            <div className="text-center pb-6 border-b border-gray-200">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <FaDownload className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Receipt</h1>
              <p className="text-gray-500">Verified and Secure Transaction</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-6">
              {/* Amount Summary */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Amount Paid</span>
                    <span className="text-3xl font-bold text-blue-600">{formatAmount(currentReceipt.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-blue-700">{formatAmount(currentReceipt.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-500" />
                    <p className="font-semibold text-gray-900">{currentReceipt.method}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className={
                      currentReceipt.status === 'PAID' ? "text-green-500" : "text-red-500"
                    } />
                    <p className={`font-semibold ${
                      currentReceipt.status === 'PAID' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentReceipt.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Transaction Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenant ID</span>
                    <span className="font-medium text-gray-900">{currentReceipt.tenantId}</span>
                  </div>
                  {currentReceipt.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-medium text-gray-900">{currentReceipt.paymentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Section */}
              {currentReceipt.note && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <p className="text-gray-600 text-sm font-medium mb-2">Note</p>
                  <p className="font-medium text-gray-900">{currentReceipt.note}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Thank you for your payment</p>
                <p className="text-gray-400 text-xs mt-1">Professional Property Management System</p>
              </div>

              {/* Download Button */}
              <motion.div whileHover={{ y: -2 }} className="pt-4">
                <button
                  onClick={() => receiptUrl ? 
                    (() => { 
                      const link = document.createElement("a"); 
                      link.href = receiptUrl; 
                      link.download = `Receipt-${receiptNumber}.pdf`; 
                      document.body.appendChild(link); 
                      link.click(); 
                      document.body.removeChild(link); 
                    })() 
                    : handleDownloadPDF(currentReceipt.paymentId)
                  }
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-base"
                >
                  <FaDownload className="w-5 h-5" />
                  Download PDF Receipt
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </>
);
};

export default TenantRentPayments;