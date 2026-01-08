import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, User, X } from "lucide-react";

const LandlordComplaints = () => {
  const { id: propertyId } = useParams(); // propertyId from URL
  const [tenants, setTenants] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const fetchTenantsAndComplaints = async () => {
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // ✅ Fetch tenants for the specific property
        const tenantResponse = await axios.get(
          `https://api.gharzoreality.com/api/landlord/tenant/property/${propertyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const tenantRaw = tenantResponse.data;
        console.log("Raw tenant response:", tenantRaw);

        const propertyTenants = Array.isArray(tenantRaw)
          ? tenantRaw
          : tenantRaw.tenants || tenantRaw.data || [];

        if (!Array.isArray(propertyTenants)) {
          throw new Error("Expected an array of tenants");
        }

        setTenants(propertyTenants);

        if (propertyTenants.length === 0) {
          setError("No tenants found for this property.");
          setLoading(false);
          return;
        }

        // ✅ Fetch complaints for each tenant
        const allComplaints = [];
        for (const tenant of propertyTenants) {
          try {
            const complaintResponse = await axios.get(
              `https://api.gharzoreality.com/api/landlord/tenant/${tenant.tenantId}/complaints`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // ✅ FIX: handle correct API shape
            const tenantComplaints = Array.isArray(complaintResponse.data)
              ? complaintResponse.data
              : Array.isArray(complaintResponse.data.complaints)
              ? complaintResponse.data.complaints
              : [];

            const mappedComplaints = tenantComplaints.map((c) => ({
              ...c,
              tenantId: tenant.tenantId,
              tenantName: tenant.name || "Unknown Tenant",
              propertyName:
                tenant.accommodations?.[0]?.propertyName || "Unknown Property",
            }));

            allComplaints.push(...mappedComplaints);
          } catch (err) {
            console.error(
              `Error fetching complaints for tenant ${tenant.tenantId}:`,
              err.response?.data || err.message
            );
          }
        }

        setComplaints(allComplaints);
      } catch (err) {
        console.error("Error fetching tenants:", err.response?.data || err.message);
        setError("Failed to fetch tenants or complaints.");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchTenantsAndComplaints();
  }, [propertyId, token, navigate]);

  const handleResolve = async (complaintId, tenantId) => {
    const landlordResponse = responseText[complaintId] || "Issue resolved";

    try {
      const response = await axios.patch(
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
          c.complaintId === complaintId ? { ...c, ...response.data.complaint } : c
        )
      );

      setResponseText((prev) => {
        const newResponses = { ...prev };
        delete newResponses[complaintId];
        return newResponses;
      });

      addNotification("Complaint updated successfully");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      addNotification("Failed to update complaint", "error");
    }
  };

  const handleResponseChange = (complaintId, value) => {
    setResponseText((prev) => ({
      ...prev,
      [complaintId]: value,
    }));
  };

  if (loading) return <p className="text-center mt-10">Loading complaints...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        {error}
      </p>
    );

  return (
    <>
      {/* Custom Toast Notifications at Top Center */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`max-w-sm mx-auto p-4 rounded-lg shadow-lg flex items-center justify-between ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 hover:opacity-70"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">
          Complaints for Property
        </h1>

        {complaints.length === 0 ? (
          <p className="text-black">
            No complaints found for this property's tenants.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {complaints.map((complaint, idx) => (
              <motion.div
                key={`${complaint.tenantId}-${complaint.complaintId}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white shadow rounded-xl p-5 border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {complaint.subject || "No Subject"}
                  </h2>
                </div>
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" /> Tenant: {complaint.tenantName}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Property: {complaint.propertyName}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {complaint.description || "No description provided"}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Status:{" "}
                  <span
                    className={
                      complaint.status === "Resolved"
                        ? "text-green-500"
                        : complaint.status === "Accepted"
                        ? "text-blue-500"
                        : "text-red-500"
                    }
                  >
                    {complaint.status || "N/A"}
                  </span>
                </div>
                {complaint.status === "Pending" && (
                  <div>
                    <textarea
                      className="w-full min-h-[80px] mt-2 p-2 border rounded-md text-gray-800"
                      value={responseText[complaint.complaintId] || ""}
                      onChange={(e) =>
                        handleResponseChange(complaint.complaintId, e.target.value)
                      }
                      placeholder="Enter your response..."
                    />
                    <button
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      onClick={() =>
                        handleResolve(complaint.complaintId, complaint.tenantId)
                      }
                    >
                      Mark as Resolved
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LandlordComplaints;
