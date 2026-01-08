import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaCalendarAlt,
  FaFacebookMessenger,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ScheduleTourBox = () => {
  const [visitDate, setVisitDate] = useState("");
  const [notes, setNotes] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [error, setError] = useState(null);
  const [dateTimeError, setDateTimeError] = useState(""); // NEW: Only for date/time
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // NEW: Success state to show message
  const [landlordNumber, setLandlordNumber] = useState(""); // NEW: Landlord contact number
  const [fetchingProperty, setFetchingProperty] = useState(true); // NEW: Loading state for property fetch
  const { id } = useParams();
  console.log("Property ID from URL:", id);

  // Get token from localStorage (usertoken is a plain string)
  const getToken = () => {
    return localStorage.getItem("usertoken") || null;
  };

  // NEW: Handle call directly without confirmation
  const handleCall = () => {
    window.location.href = `tel:+91${landlordNumber}`;
  };

  // NEW: Fetch property details to get landlord number
  // useEffect(() => {
  //   const fetchPropertyDetails = async () => {
  //     if (!id) return;

  //     try {
  //       setFetchingProperty(true);
  //       const response = await fetch(`https://api.gharzoreality.com/api/public/property/${id}?_=${Date.now()}`);
  //       const data = await response.json();

  //       if (data.success && data.property && data.property.landlord) {
  //         const number = data.property.landlord.contactNumber;
  //         if (number && number.length === 10) {
  //           setLandlordNumber(number);
  //         } else {
  //           console.warn("Invalid landlord number:", number);
  //           setError("Landlord contact number not available.");
  //           toast.error("Landlord contact number not available.", {
  //             position: "top-right",
  //             autoClose: 5000,
  //           });
  //         }
  //       } else {
  //         setError("Property details not found.");
  //         toast.error("Property details not found.", {
  //           position: "top-right",
  //           autoClose: 5000,
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Error fetching property:", err);
  //       setError("Failed to fetch property details.");
  //       toast.error("Failed to fetch property details.", {
  //         position: "top-right",
  //         autoClose: 5000,
  //       });
  //     } finally {
  //       setFetchingProperty(false);
  //     }
  //   };
  //   fetchPropertyDetails();
  // }, [id]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) return;

      try {
        setFetchingProperty(true);
        const response = await fetch(
          `https://api.gharzoreality.com/api/public/property/${id}?_=${Date.now()}`
        );
        const data = await response.json();

        // If property is received but landlord contact is missing, do NOT show any error.
        if (data.success && data.property) {
          const number = data.property?.landlord?.contactNumber;

          if (number && number.length === 10) {
            setLandlordNumber(number);
          } else {
            // Just silently ignore and keep landlordNumber empty
            console.warn("Landlord number missing or invalid.");
            setLandlordNumber("");
          }
        } else {
          // No error toast should be shown even if property not found
          console.warn("Property details not found");
          setLandlordNumber("");
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        // No error toast, no error UI
        setLandlordNumber("");
      } finally {
        setFetchingProperty(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // NEW: Validate date/time only
  const validateDateTime = (dateTimeValue) => {
    if (!dateTimeValue) {
      return "Please select a date and time";
    }
    const selectedDateTime = new Date(dateTimeValue);
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 min buffer

    if (selectedDateTime <= bufferTime) {
      return "Please select a future time (at least 30 minutes from now)";
    }
    return null;
  };

  // NEW: Handle date/time change with validation
  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    setVisitDate(value);
    setError(null);
    setSuccess(false); // Reset success on change

    // Clear previous error
    setDateTimeError("");

    // Validate immediately
    const validationError = validateDateTime(value);
    if (validationError) {
      setDateTimeError(validationError);
    }
  };

  // UPDATED: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // NEW: Validate date/time before submission
    const dateValidationError = validateDateTime(visitDate);
    if (dateValidationError) {
      setDateTimeError(dateValidationError);
      setError("Please select a valid future date and time");
      toast.error("Please select a valid future date and time", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Please log in to book a visit");
      toast.error("Please log in to book a visit", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    setLoading(true);
    setError(null);
    setDateTimeError(""); // Clear date error
    setSuccess(false);
    try {
      const response = await fetch("https://api.gharzoreality.com/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          visitDate: new Date(visitDate).toISOString(),
          notes,
          contactNumber,
        }),
      });
      const data = await response.json();
      console.log("API Response for booking:", data);
      if (response.ok) {
        const successMessage = data.message || "Visit successfully scheduled!";
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          pauseOnHover: true,
        });
        setSuccess(true); // Set success state
        // Reset fields after a short delay to allow toast to show
        setTimeout(() => {
          setVisitDate("");
          setNotes("");
          setContactNumber("");
        }, 1000);
      } else {
        setError(data.message || "Failed to book visit.");
        toast.error(data.message || "Failed to book visit.", {
          position: "top-right",
          autoClose: 5000,
        });
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          toast.error("Session expired. Please log in again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.message.includes("not found")
          ? "Property ID not found."
          : "Something went wrong. Please try again."
      );
      toast.error(
        err.message.includes("not found")
          ? "Property ID not found."
          : "Something went wrong. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate propertyId
  if (!id) {
    return (
      <div className="text-red-500 text-sm">
        Invalid property ID. Please select a valid property.
      </div>
    );
  }

  // NEW: Show loading while fetching property
  if (fetchingProperty) {
    return (
      <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl p-6">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // NEW: If no landlord number, show error
  // if (!landlordNumber ) {
  //   return (
  //     <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl p-6">
  //       <div className="text-center py-4">
  //         <FaExclamationTriangle className="text-red-500 text-2xl mx-auto mb-2" />
  //         <p className="text-sm text-red-600">Unable to load landlord contact. Please try again later.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2 text-green-500" />
          Visit booked successfully! You can now schedule another one.
        </div>
      )}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Schedule Tour</h2>
      </div>
      <motion.form onSubmit={handleSubmit} className="space-y-4">
        {/* UPDATED: Date/Time field with validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Date & Time
          </label>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-green-600" />
            <input
              type="datetime-local"
              value={visitDate}
              onChange={handleDateTimeChange}
              // NEW: Set minimum time to 30 minutes from now
              min={new Date(new Date().getTime() + 30 * 60 * 1000)
                .toISOString()
                .slice(0, 16)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                dateTimeError
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              required
            />
          </div>
          {/* NEW: Show date/time error */}
          {dateTimeError && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {dateTimeError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <div className="flex items-center gap-2">
            <FaPhone className="text-green-600" />
            <input
              type="number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your contact number"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Notes
          </label>
          <div className="flex items-center gap-2">
            <FaFacebookMessenger className="text-green-600" />
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your message..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* <div className="flex justify-between items-center gap-3">
          <button
            onClick={handleCall}
            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all duration-300"
          >
            <FaPhone /> Call
          </button>
          <a
            href={`https://wa.me/+91${landlordNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-all duration-300"
          >
            <FaWhatsapp /> WhatsApp
          </a>
        </div> */}

        <div className="flex justify-between items-center gap-3">
          <button
            onClick={landlordNumber ? handleCall : undefined}
            disabled={!landlordNumber}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              landlordNumber
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            <FaPhone /> Call
          </button>

          <a
            href={
              landlordNumber ? `https://wa.me/+91${landlordNumber}` : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              landlordNumber
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none"
            }`}
          >
            <FaWhatsapp /> WhatsApp
          </a>
        </div>

        {/* UPDATED: Disable button if date error exists */}
        <button
          type="submit"
          disabled={loading || !!dateTimeError}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
            loading || dateTimeError
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : " bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-black hover:from-blue-600 hover:via-cyan-500 hover:to-green-500 hover:text-white shadow-md"
          }`}
        >
          {loading
            ? "Booking..."
            : dateTimeError
            ? "Fix date first"
            : "Submit Tour Request"}
        </button>
      </motion.form>
    </div>
  );
};

export default ScheduleTourBox;
