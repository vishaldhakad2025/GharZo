import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaCalendarAlt,
  FaFacebookMessenger,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerScheduleTourBox = () => {
  const [visitDate, setVisitDate] = useState("");
  const [notes, setNotes] = useState("");
  const [contactNumber, setContactNumber] = useState(""); // Buyer's contact number
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState(null);
  const [dateTimeError, setDateTimeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sellerContactNumber, setSellerContactNumber] = useState(""); // Seller's contact number from API
  const [propertyLoading, setPropertyLoading] = useState(true); // Loading state for property fetch
  const { propertyId } = useParams(); // Only propertyId for seller context

  console.log("Seller Route Property ID:", propertyId);

  // Fetch seller's property details on component mount
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) {
        setPropertyLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.gharzoreality.com/api/seller/properties/${propertyId}`);
        const data = await response.json();
        console.log("Property API Response:", data);

        if (data.success && data.property) {
          setSellerContactNumber(data.property.contactNumber || "");
        } else {
          setError("Failed to load property details.");
          toast.error("Failed to load property details.", { position: "top-right", autoClose: 3000 });
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Error loading property details. Please try again.");
        toast.error("Error loading property details. Please try again.", { position: "top-right", autoClose: 3000 });
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("usertoken") || null;
  };

  // Validate date/time
  const validateDateTime = (dateTimeValue) => {
    if (!dateTimeValue) return "Please select a date and time";
    const selectedDateTime = new Date(dateTimeValue);
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 min buffer
    if (selectedDateTime <= bufferTime) return "Please select a future time (at least 30 minutes from now)";
    return null;
  };

  // Handle date/time change with validation
  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    setVisitDate(value);
    setError(null);
    setDateTimeError("");
    const validationError = validateDateTime(value);
    if (validationError) setDateTimeError(validationError);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyId) {
      setError("Property ID is undefined. Please check the URL or navigation.");
      toast.error("Property ID is undefined. Please check the URL or navigation.", { position: "top-right", autoClose: 3000 });
      return;
    }

    const dateValidationError = validateDateTime(visitDate);
    if (dateValidationError) {
      setDateTimeError(dateValidationError);
      setError("Please select a valid future date and time");
      toast.error("Please select a valid future date and time", { position: "top-right", autoClose: 3000 });
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Please log in to book a visit");
      toast.error("Please log in to book a visit", { position: "top-right", autoClose: 3000 });
      return;
    }

    setLoading(true);
    setError(null);
    setDateTimeError("");

    try {
      const url = "https://api.gharzoreality.com/api/seller/visit";

      const payload = {
        propertyId,
        name: name || "Anonymous",
        email: email || "N/A",
        mobile: contactNumber,
        scheduledDate: new Date(visitDate).toLocaleDateString("en-GB").split("/").reverse().join("-"),
        purpose: purpose || "General Inquiry",
        notes,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("API Response for booking:", data);
      if (response.ok) {
        toast.success(data.message || "Visit successfully schedule ho gya hai!", { position: "top-right", autoClose: 3000 });
        setVisitDate("");
        setNotes("");
        setContactNumber("");
        setName("");
        setEmail("");
        setPurpose("");
      } else {
        setError(data.message || "Visit book karne mein asafal.");
        toast.error(data.message || "Visit book karne mein asafal.", { position: "top-right", autoClose: 3000 });
        if (response.status === 401) {
          setError("Session samapt ho gya hai. Kripya dobara login karein.");
          toast.error("Session samapt ho gya hai. Kripya dobara login karein.", { position: "top-right", autoClose: 3000 });
        }
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message.includes("not found") ? "Property ID nahi mili." : "Kuch galat ho gya. Kripya dobara koshish karein.");
      toast.error(err.message.includes("not found") ? "Property ID nahi mili." : "Kuch galat ho gya. Kripya dobara koshish karein.", { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Validate propertyId
  if (!propertyId) {
    return <div className="text-red-500 text-sm">Amanya property ID. Kripya valid property chunein.</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl p-6">
      <ToastContainer />
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Schedule Tour</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Enter purpose of visit"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date & Time</label>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-green-600" />
            <input
              type="datetime-local"
              value={visitDate}
              onChange={handleDateTimeChange}
              min={new Date(new Date().getTime() + 30 * 60 * 1000).toISOString().slice(0, 16)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                dateTimeError ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300"
              }`}
              required
            />
          </div>
          {dateTimeError && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {dateTimeError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <div className="flex items-center gap-2">
            <FaPhone className="text-green-600" />
            <input
              type="tel"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Notes</label>
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

        <div className="flex justify-between items-center gap-3">
          {propertyLoading ? (
            <div className="flex-1 bg-gray-400 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2">
              <FaPhone /> Loading...
            </div>
          ) : sellerContactNumber ? (
            <>
              <a
                href={`tel:+91${sellerContactNumber}`}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all duration-300"
              >
                <FaPhone /> Call
              </a>
              <a
                href={`https://wa.me/+91${sellerContactNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-all duration-300"
              >
                <FaWhatsapp /> WhatsApp
              </a>
            </>
          ) : (
            <div className="flex-1 bg-gray-400 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2">
              No contact available
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !!dateTimeError}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
            loading || dateTimeError
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-black hover:from-blue-600 hover:via-cyan-500 hover:to-green-500 hover:text-white shadow-md"
          }`}
        >
          {loading ? "Booking..." : dateTimeError ? "Fix date first" : "Submit Tour Request"}
        </button>
      </form>
    </div>
  );
};

export default SellerScheduleTourBox;