import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, User, CheckCircle, Clock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Complaints = () => {
  const { propertyId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async (page = 1) => {
      if (!token) {
        toast.error("No authentication token found. Please log in.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setLoading(false);
        navigate("/login");
        return;
      }

      if (!propertyId) {
        toast.error("No property ID provided.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/complaints?page=${page}&limit=${pagination.limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch complaints"
          );
        }

        const { complaints: fetchedComplaints, pagination: paginationData } =
          response.data;
        if (!Array.isArray(fetchedComplaints)) {
          throw new Error("Expected an array of complaints");
        }

        setComplaints(fetchedComplaints);
        setPagination({
          total: paginationData.total || 0,
          page: paginationData.page || 1,
          limit: paginationData.limit || 10,
          pages: paginationData.pages || 0,
        });

        if (fetchedComplaints.length === 0) {
          setError("No complaints found for this property.");
        }
      } catch (err) {
        console.error(
          "Error fetching complaints:",
          err.response?.data || err.message
        );
        toast.error(
          err.response?.data?.message || "Failed to fetch complaints.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [propertyId, token, navigate]);

  const handleResolve = async (complaintId) => {
    const landlordResponse = responseText[complaintId] || "Issue resolved";

    try {
      const response = await axios.patch(
        `https://api.gharzoreality.com/api/sub-owner/properties/${propertyId}/complaints/${complaintId}/status`,
        { status: "Resolved", notes: landlordResponse },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update complaint");
      }

      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === complaintId
            ? { ...c, ...response.data.complaint }
            : c
        )
      );

      setResponseText((prev) => {
        const newResponses = { ...prev };
        delete newResponses[complaintId];
        return newResponses;
      });

      toast.success("Complaint updated successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update complaint", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const handleResponseChange = (complaintId, value) => {
    setResponseText((prev) => ({
      ...prev,
      [complaintId]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchComplaints(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="text-2xl font-semibold text-gray-700"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Clock className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="text-red-500 text-xl font-medium bg-red-100 p-4 rounded-lg shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-6 h-6 inline mr-2" />
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-800">
        Complaints for Property
      </h1>

      {complaints.length === 0 ? (
        <motion.div
          className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No complaints found for this property.
        </motion.div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {complaints.map((complaint, idx) => (
              <motion.div
                key={`${complaint.tenantId}-${complaint.complaintId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="text-red-500"
                    whileHover={{ scale: 1.2, rotate: 15 }}
                  >
                    <AlertCircle className="w-6 h-6" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {complaint.subject || "No Subject"}
                  </h2>
                </div>
                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <motion.div
                    className="text-blue-500"
                    whileHover={{ scale: 1.2, rotate: 15 }}
                  >
                    <User className="w-5 h-5" />
                  </motion.div>
                  Tenant: {complaint.tenantName || "Unknown Tenant"}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Property: {complaint.propertyName || "Unknown Property"}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {complaint.description || "No description provided"}
                </div>
                <div className="text-sm mb-4">
                  Status:{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      complaint.status === "Resolved"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {complaint.status === "Resolved" ? (
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 inline mr-1" />
                    )}
                    {complaint.status || "N/A"}
                  </span>
                </div>
                {complaint.status === "Pending" && (
                  <div>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      value={responseText[complaint.complaintId] || ""}
                      onChange={(e) =>
                        handleResponseChange(
                          complaint.complaintId,
                          e.target.value
                        )
                      }
                      placeholder="Enter your response..."
                    />
                    <motion.button
                      className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => handleResolve(complaint.complaintId)}
                      whileHover={{ scale: 1.05, rotateY: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Mark as Resolved
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-3">
              <motion.button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  pagination.page === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                whileHover={{ scale: pagination.page === 1 ? 1 : 1.05 }}
                whileTap={{ scale: pagination.page === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>
              <span className="px-4 py-2 text-gray-800 text-sm font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <motion.button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  pagination.page === pagination.pages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                whileHover={{
                  scale: pagination.page === pagination.pages ? 1 : 1.05,
                }}
                whileTap={{
                  scale: pagination.page === pagination.pages ? 1 : 0.95,
                }}
              >
                Next
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Complaints;
