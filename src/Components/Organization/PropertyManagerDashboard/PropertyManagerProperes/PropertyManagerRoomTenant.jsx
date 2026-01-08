import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Utility function for date formatting
const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  } catch {
    return "";
  }
};

const PropMngrTents = ({ propertyId: propIdFromProps }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", showRetry: false, retryAction: null });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  const navigate = useNavigate();
  const { propertyId: propIdFromParams } = useParams();
  const propertyId = propIdFromProps || propIdFromParams;

  // Show success/error dialog
  const showDialog = (title, message, showRetry = false, retryAction = null) => {
    setModalContent({ title, message, showRetry, retryAction });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Show confirmation dialog
  const showConfirmDialog = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirm(true);
  };

  const closeConfirm = () => setShowConfirm(false);

  const handleConfirmYes = () => {
    confirmAction();
    closeConfirm();
  };

  // Fetch tenants
  useEffect(() => {
    const fetchTenants = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("https://api.gharzoreality.com/api/pm/tenants", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized: Please log in again.");
          } else if (response.status === 404) {
            throw new Error("Tenants not found.");
          }
          throw new Error(`Failed to fetch tenants: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const filteredTenants = propertyId
          ? data.tenants.filter((tenant) =>
              tenant.accommodations.some((acc) => acc.propertyId === propertyId)
            )
          : data.tenants;

        setTenants(filteredTenants);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [propertyId]);

  // Handle delete confirmation - FULLY FIXED
  // FINAL FIXED: Use POST instead of DELETE
const handleDeleteConfirmed = async (tenantId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    showDialog("Error", "Authentication token missing. Please log in again.");
    return;
  }

  if (!propertyId) {
    showDialog("Error", "Property ID is missing. Cannot remove tenant.");
    return;
  }

  const moveOutDate = formatDate(new Date()); // e.g., "2025-11-04"

  try {
    const payload = { tenantId, propertyId, moveOutDate };

    console.log("REMOVE TENANT REQUEST:");
    console.log("- Token:", token.substring(0, 20) + "...");
    console.log("- Payload:", payload);

    // USE POST instead of DELETE → avoids CORS preflight issues
    const response = await fetch("https://api.gharzoreality.com/api/pm/tenants/remove", {
      method: "POST", // ← CHANGED TO POST
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      const text = await response.clone().text();
      responseData = { message: text || "Empty response" };
    }

    if (!response.ok) {
      const errorMsg = `${response.status} ${response.statusText}: ${responseData.message || "Unknown error"}`;
      console.error("REMOVE FAILED:", errorMsg);

      if (response.status === 401) {
        showDialog("Unauthorized", "Session expired. Please log in again.");
      } else if (response.status === 400) {
        showDialog("Invalid Data", responseData.message || "Check tenant/property ID.", true);
      } else if (response.status === 404) {
        showDialog("Not Found", "API endpoint not found. Contact admin.", true);
      } else {
        showDialog("Error", errorMsg, true);
      }
      return;
    }

    // SUCCESS
    console.log("REMOVE SUCCESS:", responseData);
    setTenants((prev) => prev.filter((t) => t.tenantId !== tenantId));
    showDialog("Success", responseData.message || "Tenant removed successfully!");
    setTimeout(closeModal, 2000);

  } catch (err) {
    console.error("NETWORK ERROR:", err);
    showDialog("Network Error", `Connection failed: ${err.message}`, true);
  }
};

  const handleDelete = (tenantId) => {
    showConfirmDialog("Are you sure you want to delete this tenant? This action cannot be undone.", () =>
      handleDeleteConfirmed(tenantId)
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg text-center text-gray-600 animate-pulse">
        Loading tenants...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {/* Success/Error Modal - RETRY WORKS */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeModal}></div>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`rounded-lg shadow-xl p-6 max-w-sm w-full border ${
              modalContent.title === "Success" ? "border-green-500" : "border-red-500"
            } bg-white`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{modalContent.title}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className={`text-sm mb-4 ${
                modalContent.title === "Success" ? "text-green-600" : "text-red-600"
              }`}>
                {modalContent.message}
              </p>
              <div className="flex justify-end space-x-2">
                {modalContent.showRetry && (
                  <button
                    onClick={() => {
                      closeModal();
                      modalContent.retryAction?.();
                    }}
                    className="px-4 py-2 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md font-semibold bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeConfirm}></div>
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full border border-gray-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                <button onClick={closeConfirm} className="text-gray-400 hover:text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{confirmMessage}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 rounded-md font-semibold bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmYes}
                  className="px-4 py-2 rounded-md font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-gradient-to-b from-gray-50 to-white shadow-2xl rounded-2xl relative">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 text-gray-900 flex items-center">
          <span className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 sm:h-8 w-6 sm:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a2 2 0 00-2-2h-3m-10 0H4a2 2 0 00-2 2v2h5m5-16a4 4 0 100 8 4 4 0 000-8zm0 12a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>
          <span className="ml-2 sm:ml-3">Tenants</span>
        </h2>

        <div className="mb-8 sm:mb-10">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">
            Current Tenants
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tenants.length === 0 ? (
              <p className="text-gray-500 italic text-center col-span-full text-sm sm:text-base">
                No tenants found for this property.
              </p>
            ) : (
              tenants.map((tenant) => (
                <div
                  key={tenant.tenantId}
                  className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <h4 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">{tenant.name}</h4>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">Email:</strong> {tenant.email || "N/A"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">Aadhaar:</strong> {tenant.aadhaar || "N/A"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">Mobile:</strong> {tenant.mobile || "N/A"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">Permanent Address:</strong>{" "}
                    {tenant.permanentAddress || "N/A"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">Work:</strong> {tenant.work || "N/A"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">DOB:</strong>{" "}
                    {tenant.dob ? new Date(tenant.dob).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong className="font-medium text-gray-700">Marital Status:</strong>{" "}
                    {tenant.maritalStatus || "N/A"}
                  </p>

                  <div className="mt-4 flex space-x-2">
                    <button
                      className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-2 px-4 rounded-xl shadow-md hover:from-blue-700 hover:to-green-600 hover:shadow-lg transition-all duration-300"
                      onClick={() => navigate(`/property-manager/tenant-details/${propertyId}/${tenant.tenantId}`)}
                    >
                      View
                    </button>
                    <button
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-4 rounded-xl shadow-md hover:from-red-700 hover:to-red-600 hover:shadow-lg transition-all duration-300"
                      onClick={() => handleDelete(tenant.tenantId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Tenant Button */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-2.5 px-6 rounded-xl shadow-md hover:from-blue-700 hover:to-green-600 hover:shadow-lg transition-all duration-300 flex items-center"
              onClick={() => navigate("/property-manager/pmadd-tenant")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Tenant
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropMngrTents;