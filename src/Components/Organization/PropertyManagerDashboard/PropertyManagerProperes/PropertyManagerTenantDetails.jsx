import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser, FaEdit, FaTrash, FaArrowLeft, FaCalendarAlt, FaPhone,
  FaEnvelope, FaIdCard, FaBriefcase, FaHome, FaHeart, FaMapMarkerAlt,
  FaFileInvoiceDollar, FaExclamationTriangle, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* -------------------------- Helpers -------------------------- */
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatCurrency = (n) => n != null ? `₹${n.toLocaleString()}` : "—";

/* -------------------------- UI Components -------------------------- */
const Input = ({ label, name, type = "text", value, onChange, required = false, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  </div>
);

const Info = ({ label, value, icon }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 flex items-center gap-1">{icon} {label}</p>
    <p className="text-sm text-gray-900 mt-1 font-medium">{value}</p>
  </div>
);

const InfoGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
);

const Section = ({ title, icon, children }) => (
  <div className="border-t pt-6 first:border-t-0 first:pt-0">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">{icon} {title}</h3>
    {children}
  </div>
);

/* -------------------------- Enrich Accommodations -------------------------- */
const enrichAccommodations = async (tenant, token) => {
  const enrich = async (acc) => {
    let roomName = acc.roomName ?? acc.roomId ?? "—";
    let bedName = acc.bedName ?? acc.bedId ?? "—";

    if (acc.roomId) {
      try {
        const r = await axios.get(
          `https://api.gharzoreality.com/api/pm/properties/${acc.propertyId}/rooms/${acc.roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        roomName = r.data.room?.name ?? roomName;
      } catch {}
    }

    if (acc.bedId) {
      try {
        const b = await axios.get(
          `https://api.gharzoreality.com/api/pm/properties/${acc.propertyId}/rooms/${acc.roomId}/beds/${acc.bedId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        bedName = b.data.bed?.name ?? bedName;
      } catch {}
    }

    return { ...acc, roomName, bedName };
  };

  const accommodations = await Promise.all((tenant.accommodations || []).map(enrich));
  const bookingRequests = await Promise.all((tenant.bookingRequests || []).map(enrich));

  return { ...tenant, accommodations, bookingRequests };
};

/* -------------------------- Main Component -------------------------- */
const PropertyManagerTenantDetails = () => {
  const { propertyId, tenantId } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ------------------- FETCH TENANT ------------------- */
  useEffect(() => {
    const fetchTenant = async () => {
      if (!propertyId || !tenantId) return navigate("/property-manager/tenants");

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login again");

        const res = await axios.get(
          `https://api.gharzoreality.com/api/pm/tenants/${propertyId}/tenants`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
console.log("Fetched Tenants:", res.data.tenants);
        const found = (res.data.tenants || []).find(t => t.tenantId === tenantId);
        if (!found) throw new Error("Tenant not found");

        const enriched = await enrichAccommodations(found, token);
        setTenant(enriched);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Failed to load tenant");
        navigate("/property-manager/tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [propertyId, tenantId, navigate]);

  /* ------------------- EDIT MODAL ------------------- */
  const EditForm = ({ tenant, onClose }) => {
    const acc = tenant.accommodations?.[0] || {};
    const [form, setForm] = useState({
      name: tenant.name || "",
      email: tenant.email || "",
      mobile: tenant.mobile || "",
      aadhaar: tenant.aadhaar || "",
      dob: tenant.dob?.split("T")[0] || "",
      work: tenant.work || "",
      fatherName: tenant.fatherName || "",
      fatherMobile: tenant.fatherMobile || "",
      motherName: tenant.motherName || "",
      motherMobile: tenant.motherMobile || "",
      permanentAddress: tenant.permanentAddress || "",
      maritalStatus: tenant.maritalStatus || "",
      moveInDate: acc.moveInDate?.split("T")[0] || "",
      moveOutDate: acc.moveOutDate?.split("T")[0] || "",
      rentAmount: String(acc.rentAmount || ""),
      securityDeposit: String(acc.securityDeposit || ""),
      pendingDues: String(acc.pendingDues || ""),
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          `https://api.gharzoreality.com/api/pm/tenants/${tenantId}`,
          form,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Tenant updated successfully");
        setTenant(prev => ({ ...prev, ...form }));
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || "Update failed");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FaEdit className="text-blue-600" /> Edit Tenant
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Input label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} required />
            <Input label="Aadhaar" name="aadhaar" value={form.aadhaar} onChange={handleChange} />
            <Input label="DOB" name="dob" type="date" value={form.dob} onChange={handleChange} />
            <Input label="Work" name="work" value={form.work} onChange={handleChange} />
            <Input label="Father Name" name="fatherName" value={form.fatherName} onChange={handleChange} />
            <Input label="Father Mobile" name="fatherMobile" value={form.fatherMobile} onChange={handleChange} />
            <Input label="Mother Name" name="motherName" value={form.motherName} onChange={handleChange} />
            <Input label="Mother Mobile" name="motherMobile" value={form.motherMobile} onChange={handleChange} />
            <div className="md:col-span-2">
              <Input label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
              <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
              </select>
            </div>
            <Input label="Check-In" name="moveInDate" type="date" value={form.moveInDate} onChange={handleChange} />
            <Input label="Check-Out" name="moveOutDate" type="date" value={form.moveOutDate} onChange={handleChange} />
            <Input label="Rent" name="rentAmount" type="number" value={form.rentAmount} onChange={handleChange} />
            <Input label="Security" name="securityDeposit" type="number" value={form.securityDeposit} onChange={handleChange} />
            <Input label="Pending Dues" name="pendingDues" type="number" value={form.pendingDues} onChange={handleChange} />

            <div className="md:col-span-2 flex gap-3 justify-end mt-4">
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-green-600 transition shadow-md">
                Save
              </button>
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /* ------------------- DELETE MODAL ------------------- */
  const DeleteForm = ({ tenant, onClose }) => {
    const acc = tenant.accommodations?.[0] || {};
    const [form, setForm] = useState({
      propertyId: acc.propertyId || "",
      roomId: acc.roomId || "",
      bedId: acc.bedId || "",
      moveOutDate: new Date().toISOString().split("T")[0],
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.delete(`https://api.gharzoreality.com/api/pm/tenants/remove`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          data: { tenantId, ...form },
        });
        toast.success("Tenant removed");
        navigate("/property-manager/tenants");
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-5 text-red-600 flex items-center gap-2">
            <FaTrash /> Remove Tenant
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Property ID" name="propertyId" value={form.propertyId} onChange={handleChange} required />
            <Input label="Room ID" name="roomId" value={form.roomId} onChange={handleChange} required />
            <Input label="Bed ID" name="bedId" value={form.bedId} onChange={handleChange} />
            <Input label="Move-Out Date" name="moveOutDate" type="date" value={form.moveOutDate} onChange={handleChange} required />

            <div className="flex gap-3 justify-end">
              <button type="submit" className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition">
                Remove
              </button>
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /* ------------------- LOADING ------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading tenant...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Tenant not found</p>
          <button onClick={() => navigate("/property-manager/tenants")}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg flex items-center mx-auto">
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
      </div>
    );
  }

  const acc = tenant.accommodations?.[0] || {};
  const totalDue = (acc.rentAmount || 0) + (acc.pendingDues || 0) + (acc.securityDeposit || 0);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          <button onClick={() => navigate("/property-manager/tenants")}
            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-blue-600 text-sm font-medium">
            <FaArrowLeft /> Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                  {tenant.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-800">{tenant.name}</h1>
                  <p className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-gray-600">
                    <FaEnvelope className="text-blue-600" /> {tenant.email}
                  </p>
                  <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                    <FaPhone className="text-blue-600" /> {tenant.mobile}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-6 bg-yellow-50 border-b">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FaFileInvoiceDollar className="text-yellow-600" /> Financial Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-xs text-gray-500">Rent</p>
                  <p className="font-bold text-lg">{formatCurrency(acc.rentAmount)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-xs text-gray-500">Security</p>
                  <p className="font-bold text-lg">{formatCurrency(acc.securityDeposit)}</p>
                  <p className="text-xs mt-1">
                    {acc.securityDepositStatus === "Pending" ? 
                      <span className="text-red-600">Pending</span> : 
                      <span className="text-green-600">Paid</span>
                    }
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-xs text-gray-500">Pending Dues</p>
                  <p className="font-bold text-lg text-red-600">{formatCurrency(acc.pendingDues)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-xs text-gray-500">Total Due</p>
                  <p className="font-bold text-xl text-red-700">{formatCurrency(totalDue)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">

              {/* Personal Info */}
              <Section title="Personal Info" icon={<FaUser className="text-blue-600" />}>
                <InfoGrid>
                  <Info label="Aadhaar" value={tenant.aadhaar || "—"} icon={<FaIdCard className="text-gray-500" />} />
                  <Info label="DOB" value={formatDate(tenant.dob)} icon={<FaCalendarAlt className="text-gray-500" />} />
                  <Info label="Work" value={tenant.work || "—"} icon={<FaBriefcase className="text-gray-500" />} />
                  <Info label="Marital" value={tenant.maritalStatus || "—"} icon={<FaHeart className="text-gray-500" />} />
                </InfoGrid>
              </Section>

              {/* Family */}
              <Section title="Family" icon={<FaHome className="text-blue-600" />}>
                <InfoGrid>
                  <Info label="Father" value={`${tenant.fatherName || "—"} (${tenant.fatherMobile || "—"})`} />
                  <Info label="Mother" value={`${tenant.motherName || "—"} (${tenant.motherMobile || "—"})`} />
                  <Info label="Address" value={tenant.permanentAddress || "—"} icon={<FaMapMarkerAlt className="text-gray-500" />} />
                </InfoGrid>
              </Section>

              {/* Accommodation */}
              {tenant.accommodations?.length > 0 && (
                <Section title="Stay Details" icon={<FaHome className="text-blue-600" />}>
                  <div className="space-y-4">
                    {tenant.accommodations.map((a, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-5 border border-blue-100">
                        <p className="font-semibold text-lg">{a.propertyName}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Room:</strong> {a.roomName} | <strong>Bed:</strong> {a.bedName}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>In:</strong> {formatDate(a.moveInDate)} 
                          {a.moveOutDate && <span> | <strong>Out:</strong> {formatDate(a.moveOutDate)}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Bills */}
              {tenant.bills?.length > 0 && (
                <Section title="Bills" icon={<FaFileInvoiceDollar className="text-blue-600" />}>
                  <div className="space-y-3">
                    {tenant.bills.map((b, i) => (
                      <div key={i} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{b.type} ({b.month} {b.year})</p>
                          <p className="text-sm text-gray-600">₹{b.amount} – Due: {formatDate(b.dueDate)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {b.paid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Complaints */}
              {tenant.complaints?.length > 0 && (
                <Section title="Complaints" icon={<FaExclamationTriangle className="text-orange-600" />}>
                  <div className="space-y-3">
                    {tenant.complaints.map((c, i) => (
                      <div key={i} className="border rounded-lg p-4 bg-orange-50">
                        <p className="font-medium">{c.subject}</p>
                        <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            c.status === "Resolved" ? "bg-green-100 text-green-800" :
                            c.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-center pt-6 border-t">
                <button onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => setIsDeleting(true)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition">
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && <EditForm tenant={tenant} onClose={() => setIsEditing(false)} />}
      {isDeleting && <DeleteForm tenant={tenant} onClose={() => setIsDeleting(false)} />}
    </>
  );
};

export default PropertyManagerTenantDetails;