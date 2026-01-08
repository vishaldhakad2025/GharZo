import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser, FaEdit, FaArrowLeft, FaTrash
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrganizationTenantDetails = () => {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenantDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://api.gharzoreality.com/api/landlord/tenant/${tenantId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("orgToken")}`,
            "Content-Type": "application/json",
          },
        });
        
        const tenantData = response.data.tenant || response.data;
        if (!tenantData) throw new Error("No tenant data found");
        setTenant(tenantData);

        // --- Fetch bed details for each accommodation ---
        if (tenantData.accommodations && tenantData.accommodations.length > 0) {
          const token = localStorage.getItem("orgToken");
          const bedsInfo = await Promise.all(
            tenantData.accommodations.map(async (acc) => {
              if (acc.propertyId && acc.roomId && acc.bedId) {
                try {
                  const bedRes = await axios.get(
                    `https://api.gharzoreality.com/api/landlord/properties/${acc.propertyId}/rooms/${acc.roomId}/beds/${acc.bedId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  return {
                    ...acc,
                    bed: bedRes.data?.bed || null,
                  };
                } catch {
                  return { ...acc, bed: null };
                }
              }
              return { ...acc, bed: null };
            })
          );
          setTenant((prev) => ({
            ...prev,
            accommodations: bedsInfo,
          }));
        }
        // --- End fetch bed details ---
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load tenant details.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
        navigate("/organization/tenant-list");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantDetails();
    } else {
      toast.error("Invalid tenant ID.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      navigate("/organization/tenant-list");
    }
  }, [tenantId, navigate]);

  const handleEditToggle = () => setIsEditing(!isEditing);
  const handleDeleteToggle = () => setIsDeleting(!isDeleting);

  const DeleteTenantForm = ({ tenantId, onCancel, tenant }) => {
    let firstBooking = tenant.bookingRequests?.[0] || tenant.bills?.[0] || tenant.accommodations?.[0] || {};
    const [formData, setFormData] = useState({
      propertyId: firstBooking.propertyId || "",
      roomId: firstBooking.roomId || "",
      bedId: firstBooking.bedId || "",
      moveOutDate: "",
    });

    const [missingData, setMissingData] = useState(!formData.propertyId || !formData.roomId);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setMissingData(!formData.propertyId || !formData.roomId);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(
          `https://api.gharzoreality.com/api/landlord/tenant/remove`,
          { tenantId, ...formData },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("orgToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Tenant deleted successfully.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        navigate("/organization/tenant-list");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete tenant.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Delete Tenant</h2>
          {missingData && (
            <p className="text-red-500 text-sm mb-4">
              Some accommodation details are missing. Please verify or enter manually.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Property IDhjkl</label>
              <input
                type="text"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                required
                placeholder="Enter Property ID"
              />
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Room ID</label>
              <input
                type="text"
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                required
                placeholder="Enter Room ID"
              />
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Bed ID</label>
              <input
                type="text"
                name="bedId"
                value={formData.bedId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                placeholder="Enter Bed ID (optional)"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Move Out Date</label>
              <input
                type="date"
                name="moveOutDate"
                value={formData.moveOutDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                required
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditTenantForm = ({ tenant, onCancel }) => {
    const [formData, setFormData] = useState({
      name: tenant.name || "",
      email: tenant.email || "",
      mobile: tenant.mobile || "",
      aadhaar: tenant.aadhaar || "",
      dob: tenant.dob?.split("T")[0] || "",
      work: tenant.work || "",
      moveInDate: tenant.moveInDate?.split("T")[0] || "",
      moveOutDate: tenant.moveOutDate?.split("T")[0] || "",
      fatherName: tenant.fatherName || "",
      fatherMobile: tenant.fatherMobile || "",
      motherName: tenant.motherName || "",
      motherMobile: tenant.motherMobile || "",
      permanentAddress: tenant.permanentAddress || "",
      maritalStatus: tenant.maritalStatus || "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("orgToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Tenant updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setTenant({ ...tenant, ...formData });
        setIsEditing(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update tenant.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Tenant</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-In Date</label>
            <input
              type="date"
              name="moveInDate"
              value={formData.moveInDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-Out Date</label>
            <input
              type="date"
              name="moveOutDate"
              value={formData.moveOutDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar</label>
            <input
              type="text"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work</label>
            <input
              type="text"
              name="work"
              value={formData.work}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father's Mobile</label>
            <input
              type="tel"
              name="fatherMobile"
              value={formData.fatherMobile}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother's Mobile</label>
            <input
              type="tel"
              name="motherMobile"
              value={formData.motherMobile}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
            <input
              type="text"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
            >
              <option value="">Select</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-4 justify-end mt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">No tenant details found.</p>
          <button
            onClick={() => navigate("/organization/tenant-list")}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" /> Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/organization/tenant-list")}
          className="mb-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Tenant List
        </button>
        {isEditing ? (
          <EditTenantForm tenant={tenant} onCancel={handleEditToggle} />
        ) : isDeleting ? (
          <DeleteTenantForm tenantId={tenantId} onCancel={handleDeleteToggle} tenant={tenant} />
        ) : (
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="flex flex-col items-center">
              {tenant.photo ? (
                <img
                  src={tenant.photo}
                  alt="Tenant"
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-indigo-100"
                />
              ) : (
                <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg">
                  <FaUser />
                </div>
              )}
              <h2 className="text-3xl font-bold mt-4 text-gray-800">{tenant.name || "N/A"}</h2>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
              <div className="space-y-4">
                <p><strong>Email:</strong> {tenant.email || "N/A"}</p>
                <p><strong>Aadhaar:</strong> {tenant.aadhaar || "N/A"}</p>
                <p><strong>Work:</strong> {tenant.work || "N/A"}</p>
                <p><strong>Date of Birth:</strong>{" "}
                  {tenant.dob
                    ? new Date(tenant.dob).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p><strong>Marital Status:</strong> {tenant.maritalStatus || "N/A"}</p>
              </div>
              <div className="space-y-4">
                <p><strong>Father:</strong> {tenant.fatherName || "N/A"} - {tenant.fatherMobile || "N/A"}</p>
                <p><strong>Mother:</strong> {tenant.motherName || "N/A"} - {tenant.motherMobile || "N/A"}</p>
                <p><strong>Permanent Address:</strong> {tenant.permanentAddress || "N/A"}</p>
                <p><strong>Joined:</strong>{" "}
                  {tenant.createdAt
                    ? new Date(tenant.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              <p>
  <strong>Accommodations:</strong>{" "}
  {tenant.bookingRequests?.length > 0 ? (
    tenant.bookingRequests.map((req, index) => (
      <span key={index}>
        {req.name || "Unknown Property"}
        {index < tenant.bookingRequests.length - 1 ? "; " : ""}
      </span>
    ))
  ) : tenant.accommodations?.length > 0 ? (
    tenant.accommodations.map((acc, index) => (
      <span key={index}>
        {acc.propertyName || "Unknown Property"}
        {index < tenant.accommodations.length - 1 ? "; " : ""}
      </span>
    ))
  ) : (
    "N/A"
  )}
</p>
              </div>
            </div>
{/* {tenant.bills?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Bills</h3>
                <div className="space-y-4">
                  {tenant.bills.map((bill, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <p><strong>Bill Type:</strong> {bill.type || "N/A"}</p>
                      <p><strong>Property:</strong> {bill.propertyName || "N/A"} (ID: {bill.propertyId || "N/A"})</p>
                      <p><strong>Room ID:</strong> {bill.roomId || "N/A"}</p>
                      <p><strong>Amount:</strong> ₹{bill.amount || "N/A"}</p>
                      <p><strong>Due Date:</strong>{" "}
                        {bill.dueDate
                          ? new Date(bill.dueDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p><strong>Paid:</strong> {bill.paid ? "Yes" : "No"}</p>
                      <p><strong>Description:</strong> {bill.description || "N/A"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
           
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={handleEditToggle}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
              <button
                onClick={handleDeleteToggle}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationTenantDetails;