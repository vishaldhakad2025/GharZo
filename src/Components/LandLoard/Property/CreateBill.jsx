import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateBill = ({ onClose, onBillCreated, tenantId, propertyId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenantId: tenantId || "",
    propertyId: propertyId || "",
    type: "Rent",
    month: "",
    year: "",
    amount: "",
    dueDate: "",
    rentDue: "",
    actualRent: "",
    description: "",
  });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdBill, setCreatedBill] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch tenants for the specific property
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        console.log("Fetching tenants with token:", token?.substring(0, 20) + "...");
        if (!token) {
          toast.error("No authentication token found. Please login again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `https://api.gharzoreality.com/api/landlord/tenant/property/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Tenants API Response:", response.data);
        const tenantData = Array.isArray(response.data) ? response.data : response.data.tenants || response.data.data || [];
        if (!Array.isArray(tenantData)) {
          throw new Error("Invalid tenant data format");
        }
        setTenants(tenantData);
        // If tenantId prop is provided (from Dues), preselect it
        if (tenantId) {
          const selectedTenant = tenantData.find(
            (t) => (t.tenantId || t.id) === tenantId
          );
          if (selectedTenant && selectedTenant.accommodations?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              tenantId: selectedTenant.tenantId || selectedTenant.id,
              propertyId: selectedTenant.accommodations[0].propertyId || propertyId,
              amount: selectedTenant.accommodations[0].rentAmount?.toString() || "",
              actualRent: selectedTenant.accommodations[0].rentAmount?.toString() || "",
              rentDue: selectedTenant.accommodations[0].pendingDues?.toString() || "",
            }));
          }
        }
        if (tenantData.length === 0) {
          toast.warn("No tenants found for this property.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
        }
      } catch (err) {
        console.error("❌ Error fetching tenants:", err.response?.data || err);
        if (err.response?.status === 401) {
          toast.error("Session expired or invalid token. Please login again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to fetch tenants");
          toast.error(
            err.response?.data?.message || "Failed to fetch tenants. Please try again.",
            {
              position: "top-right",
              autoClose: 5000,
              theme: "colored",
            }
          );
        }
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) {
      fetchTenants();
    }
  }, [navigate, tenantId, propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTenantChange = (e) => {
    const tenantId = e.target.value;
    const tenant = tenants.find((t) => (t.tenantId || t.id) === tenantId);
    if (tenant && tenant.accommodations?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tenantId: tenant.tenantId || tenant.id,
        propertyId: tenant.accommodations[0].propertyId || propertyId,
        amount: tenant.accommodations[0].rentAmount?.toString() || "",
        actualRent: tenant.accommodations[0].rentAmount?.toString() || "",
        rentDue: tenant.accommodations[0].pendingDues?.toString() || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tenantId: "",
        propertyId: propertyId,
        amount: "",
        actualRent: "",
        rentDue: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreatedBill(null);

    try {
      console.log("Creating bill with token:", token?.substring(0, 20) + "...");
      if (!token) {
        toast.error("No authentication token found. Please login again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "https://api.gharzoreality.com/api/landlord/tenant/general-bill",
        {
          tenantId: formData.tenantId,
          propertyId: formData.propertyId,
          type: formData.type,
          month: formData.month,
          year: formData.year,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          rentDue: parseFloat(formData.rentDue),
          actualRent: parseFloat(formData.actualRent),
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Bill Creation Response:", response.data);
      if (response.status === 200 || response.status === 201) {
        setSuccess(response.data.message || "Bill created successfully");
        setCreatedBill(response.data.bill || response.data);
        setFormData({
          tenantId: tenantId || "",
          propertyId: propertyId || "",
          type: "Rent",
          month: "",
          year: "",
          amount: "",
          dueDate: "",
          rentDue: "",
          actualRent: "",
          description: "",
        });
        onBillCreated();
        toast.success(response.data.message || "Bill created successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setTimeout(() => {
          setCreatedBill(null);
          onClose();
        }, 3000);
      } else {
        setError(response.data.message || "Failed to create bill");
        toast.error(response.data.message || "Failed to create bill", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("❌ Error creating bill:", err.response?.data || err);
      if (err.response?.status === 401) {
        toast.error("Session expired or invalid token. Please login again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "An error occurred while creating the bill");
        toast.error(
          err.response?.data?.message || "An error occurred while creating the bill",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
          }
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-green-400 text-transparent bg-clip-text">
          Create New Bill
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        {loading && <p className="text-gray-600 mb-4">Loading tenants...</p>}
        {createdBill ? (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Bill Created</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p>
                <strong>Bill Number:</strong> {createdBill.billNumber || "N/A"}
              </p>
              <p>
                <strong>Tenant ID:</strong> {createdBill.tenantId || "N/A"}
              </p>
              <p>
                <strong>Property:</strong> {createdBill.propertyName || "Unknown Property"}
              </p>
              <p>
                <strong>Type:</strong> {createdBill.type || "N/A"}
              </p>
              <p>
                <strong>Month/Year:</strong>{" "}
                {createdBill.month ? `${createdBill.month}/${createdBill.year}` : "N/A"}
              </p>
              <p>
                <strong>Amount:</strong> ₹
                {createdBill.amount?.toLocaleString("en-IN") || "N/A"}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {createdBill.dueDate
                  ? new Date(createdBill.dueDate).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
              <p>
                <strong>Rent Due:</strong> ₹
                {createdBill.rentDue?.toLocaleString("en-IN") || "N/A"}
              </p>
              <p>
                <strong>Actual Rent:</strong> ₹
                {createdBill.actualRent?.toLocaleString("en-IN") || "N/A"}
              </p>
              <p>
                <strong>Description:</strong> {createdBill.description || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {createdBill.paid ? "Paid" : "Pending"}
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-h-[80vh] overflow-y-auto"
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Select Tenant</label>
              <select
                value={formData.tenantId}
                onChange={handleTenantChange}
                className="w-full bg-gray-100 text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
                required
                disabled={loading || tenants.length === 0}
              >
                <option value="">Select a tenant</option>
                {tenants
                  .filter((tenant) => tenant.accommodations?.length > 0)
                  .map((tenant) => (
                    <option
                      key={tenant.tenantId || tenant.id}
                      value={tenant.tenantId || tenant.id}
                    >
                      {tenant.name
                        ? `${tenant.name} (${tenant.tenantId || tenant.id})`
                        : tenant.tenantId || tenant.id}
                    </option>
                  ))}
              </select>
            </div>
            {[
              { label: "Tenant ID", name: "tenantId", readOnly: true },
              {
                label: "Bill Type",
                name: "type",
                type: "select",
                options: ["Rent", "Electricity", "Water", "Maintenance"],
              },
              { label: "Month", name: "month", placeholder: "e.g., August" },
              { label: "Year", name: "year", placeholder: "e.g., 2025" },
              { label: "Amount (₹)", name: "amount", type: "number" },
              { label: "Due Date", name: "dueDate", type: "date" },
              { label: "Rent Due (₹)", name: "rentDue", type: "number" },
              { label: "Actual Rent (₹)", name: "actualRent", type: "number" },
            ].map((field, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-gray-100 text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-100 text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
                    readOnly={field.readOnly}
                    required={!field.readOnly}
                  />
                )}
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-100 text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
                rows="4"
                placeholder="e.g., Monthly Rent August 2025"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 rounded text-sm bg-gray-300 hover:bg-gray-400 text-black transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded text-sm text-white transition bg-gradient-to-r from-blue-500 to-green-400 hover:opacity-90"
                disabled={loading}
              >
                Create Bill
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateBill;