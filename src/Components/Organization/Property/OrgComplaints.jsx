import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, User, X, Calendar, Home, AlertTriangle } from "lucide-react";

const OrgComplaints = () => {
  const { id: propertyId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("orgToken");

  const showDialog = (title, message) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!token) {
        setError("Please login again.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const tenantsRes = await axios.get(
          `https://api.gharzoreality.com/api/landlord/tenant/property/${propertyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let tenants = [];
        if (Array.isArray(tenantsRes.data)) tenants = tenantsRes.data;
        else if (tenantsRes.data?.tenants) tenants = tenantsRes.data.tenants;
        else if (tenantsRes.data?.data) tenants = tenantsRes.data.data;

        if (tenants.length === 0) {
          setComplaints([]);
          setLoading(false);
          return;
        }

        const allComplaints = [];

        for (const tenant of tenants) {
          const tenantId = tenant.tenantId || tenant._id;
          const tenantName = tenant.name || "Unknown Tenant";
          const propertyName =
            tenant.accommodations?.[0]?.propertyName ||
            tenant.propertyName ||
            "Unknown Property";

          try {
            const compRes = await axios.get(
              `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (compRes.data.success && Array.isArray(compRes.data.complaints)) {
              const enriched = compRes.data.complaints.map((c) => ({
                ...c,
                tenantId,
                tenantName,
                propertyName,
              }));
              allComplaints.push(...enriched);
            }
          } catch (err) {
            console.log(`No complaints for tenant ${tenantId}`);
          }
        }

        setComplaints(allComplaints);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchComplaints();
  }, [propertyId, token, navigate]);

  const handleResolve = async (complaintId, tenantId) => {
    const landlordResponse = responseText[complaintId] || "Issue has been resolved.";

    try {
      await axios.patch(
        `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaint/${complaintId}`,
        { status: "Resolved", landlordResponse },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === complaintId
            ? { ...c, status: "Resolved", landlordResponse }
            : c
        )
      );

      setResponseText((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });

      showDialog("Success", "Complaint marked as resolved!");
      setTimeout(closeModal, 2000);
    } catch (err) {
      showDialog("Error", "Failed to resolve complaint.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl text-gray-600 font-medium animate-pulse">
          Loading complaints...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 text-xl font-medium mt-20">
        {error}
      </div>
    );

  return (
    <>
      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {modalContent.title}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-7 h-7" />
                </button>
              </div>
              <p className={`text-lg ${modalContent.title === "Success" ? "text-green-600" : "text-red-600"} font-medium`}>
                {modalContent.message}
              </p>
              <div className="mt-8 text-center">
                <button
                  onClick={closeModal}
                  className="px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg text-lg"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}

    <div className="min-h-screen bg-gray-50 py-8 px-4">
  <div className="max-w-6xl mx-auto">
    <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
      Property Complaints</h1>

    {complaints.length === 0 ? (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-500">No complaints found</p>
      </div>
    ) : (
      <div className="grid gap-8 md:grid-cols-2">
        {complaints.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-7 hover:shadow-lg transition"
          >
            {/* Subject */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {c.subject}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-5 leading-relaxed">
              {c.description}
            </p>

            {/* Tenant & Property */}
            <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
              <div>
                <p className="text-gray-500">Tenant</p>
                <p className="font-semibold text-gray-800">{c.tenantName}</p>
              </div>
              <div>
                <p className="text-gray-500">Property</p>
                <p className="font-semibold text-gray-800">{c.propertyName}</p>
              </div>
            </div>

            {/* Priority & Status */}
            <div className="flex justify-between items-center mb-6">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  c.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : c.priority === "Medium"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {c.priority} Priority
              </span>

              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  c.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {c.status}
              </span>
            </div>

            {/* Date */}
            <p className="text-sm text-gray-500 mb-5">
              {new Date(c.createdAt).toLocaleDateString("en-IN")}
            </p>

            {/* Resolve Section */}
            {c.status !== "Resolved" ? (
              <div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Write your response..."
                  value={responseText[c.complaintId] || ""}
                  onChange={(e) =>
                    setResponseText((p) => ({
                      ...p,
                      [c.complaintId]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => handleResolve(c.complaintId, c.tenantId)}
                  className="mt-4 w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Mark as Resolved
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-bold">Resolved</p>
                {c.landlordResponse && (
                  <p className="text-sm text-green-600 mt-2 italic">
                    "{c.landlordResponse}"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
    </>
  );
};

export default OrgComplaints;