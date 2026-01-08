import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaComment,
  FaStar,
  FaUser,
  FaHeart,
  FaClock,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaHotel,
  FaRupeeSign,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyVisitsAndEnquiries = () => {
  // States for Visits (Old)
  const [visitorVisits, setVisitorVisits] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);

  // States for Hotel Enquiries (New)
  const [hotelEnquiries, setHotelEnquiries] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const getToken = () => localStorage.getItem("usertoken") || null;

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-200 text-gray-700";
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("confirmed") || s.includes("contacted"))
      return "bg-green-100 text-green-700";
    if (s.includes("cancelled") || s.includes("rejected"))
      return "bg-red-100 text-red-700";
    if (s.includes("pending") || s.includes("confirmation"))
      return "bg-amber-100 text-amber-700";
    if (s.includes("scheduled"))
      return "bg-blue-100 text-blue-700";
    return "bg-purple-100 text-purple-700";
  };

  // Filter function
  const filterItems = (items) =>
    filterStatus === "all"
      ? items
      : items.filter((item) =>
          (item.statusText || item.status || "").toLowerCase().includes(filterStatus)
        );

  // === OLD VISITS API ===
  const fetchUserVisits = async () => {
    const token = getToken();
    if (!token) return [];
    try {
      const decoded = decodeToken(token);
      const userId = decoded?.id;
      if (!userId) return [];

      const res = await fetch(
        "https://api.gharzoreality.com/api/visits/user?populate[propertyId][populate]=*&populate[landlordId][populate]=*",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.visits)) {
        return data.visits.map((v) => ({
          ...v,
          type: "visitor",
          propertyId: v.propertyId?.data?.attributes || v.propertyId || {},
          landlordId: v.landlordId?.data?.attributes || v.landlordId || {},
        }));
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchSellerRequests = async () => {
    const token = getToken();
    if (!token) return [];
    try {
      const res = await fetch("https://api.gharzoreality.com/api/seller/uservisit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.visits)) {
        return data.visits.map((v) => ({
          ...v,
          type: "seller",
          propertyId: v.propertyId || {},
          landlordId: v.landlordId || { name: v.landlordName || v.name, mobile: v.landlordMobile || v.mobile },
        }));
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

 

  // === MAIN FETCH ===
  const fetchAllData = async () => {
    const token = getToken();
    if (!token) {
      setError("Please login to view your data.");
      toast.error("Login required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [visits, sellerReqs, hotelEnqs] = await Promise.all([
        fetchUserVisits(),
        fetchSellerRequests(),
    
      ]);

      setVisitorVisits(visits);
      setSellerRequests(sellerReqs);
      setHotelEnquiries(hotelEnqs);
    } catch (err) {
      setError("Failed to load data");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Render Cards
  const renderVisitCard = (visit) => {
    const isVisitor = visit.type === "visitor";
    const propertyName = visit.propertyId?.name || "Unknown Property";
    const address = visit.propertyId?.address || "N/A";
    const landlordName = isVisitor
      ? (visit.landlordId?.name || "N/A")
      : (visit.landlordId?.name || visit.name || "N/A");
    const landlordMobile = isVisitor
      ? (visit.landlordId?.mobile || "N/A")
      : (visit.landlordId?.mobile || visit.mobile || "N/A");

    return (
      <div key={visit._id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all border">
        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(visit.statusText || visit.status)}`}>
          {visit.statusText || visit.status}
        </span>
        <h3 className="text-lg font-semibold mt-3">{propertyName}</h3>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <FaMapMarkerAlt /> {address}
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <FaCalendarAlt /> {formatDate(visit.visitDate || visit.scheduledDate)}
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <FaUser /> {landlordName}
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <FaPhone /> {landlordMobile}
        </p>
      </div>
    );
  };

  const renderHotelEnquiryCard = (enq) => {
    const budget = enq.budgetRange
      ? `₹${enq.budgetRange.min} - ₹${enq.budgetRange.max}`
      : "Not specified";

    return (
      <div key={enq._id} className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-teal-200">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(enq.status)}`}>
            {enq.status}
          </span>
          <FaHotel className="text-teal-600 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-teal-800">{enq.name}</h3>
        <p className="text-sm text-gray-700 mt-2">
          <FaPhone className="inline mr-1" /> {enq.phone}
        </p>
        {enq.email && (
          <p className="text-sm text-gray-700">
            <FaEnvelope className="inline mr-1" /> {enq.email}
          </p>
        )}
        <p className="text-sm font-semibold text-indigo-700 mt-2">
          <FaRupeeSign className="inline" /> {budget}
        </p>
        {enq.checkInDate && enq.checkOutDate && (
          <p className="text-sm text-gray-700 mt-1">
            <FaCalendarAlt className="inline mr-1" />
            {new Date(enq.checkInDate).toLocaleDateString()} → {new Date(enq.checkOutDate).toLocaleDateString()}
          </p>
        )}
        <p className="text-sm bg-white px-3 py-2 rounded mt-3 border">
          <strong>Message:</strong> {enq.message || "No message"}
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Sent: {formatDate(enq.createdAt)}
        </p>
      </div>
    );
  };

  const hasAnyData =
    visitorVisits.length > 0 ||
    sellerRequests.length > 0 ||
    hotelEnquiries.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">My Visits & Enquiries</h1>
          <p className="text-gray-600 mt-2">All your property visits and hotel/booking requests in one place</p>
        </div>

        {/* Filter */}
        {hasAnyData && (
          <div className="flex justify-center mb-10 flex-wrap gap-3">
            {["all", "pending", "confirmed", "contacted", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  filterStatus === s
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-300 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <FaClock className="text-6xl text-teal-500 mx-auto animate-spin" />
            <p className="text-xl mt-4">Loading your data...</p>
          </div>
        ) : !hasAnyData ? (
          <div className="text-center py-16">
            <FaHeart className="text-8xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold">Nothing here yet!</h3>
            <p className="text-gray-600 mt-2">Your visits and enquiries will appear here</p>
          </div>
        ) : (
          <>
            {/* Hotel Enquiries */}
            {filterItems(hotelEnquiries).length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-teal-700 mb-6 flex items-center gap-3">
                  <FaHotel /> Hotel & Banquet Enquiries
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterItems(hotelEnquiries).map(renderHotelEnquiryCard)}
                </div>
              </div>
            )}

            {/* Seller Requests */}
            {filterItems(sellerRequests).length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                  <FaUsers /> Seller Property Requests
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterItems(sellerRequests).map(renderVisitCard)}
                </div>
              </div>
            )}

            {/* My Visits */}
            {filterItems(visitorVisits).length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
                  <FaHome /> My Scheduled Property Visits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterItems(visitorVisits).map(renderVisitCard)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyVisitsAndEnquiries;