import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Edit,
  Trash,
  X,
  Eye,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import baseurl from "../../../../BaseUrl";

/* ========================================================================== */
/*                              Worker Card                                   */
/* ========================================================================== */
const WorkerCard = ({ worker, onView, onEdit }) => {
  const id = worker.id || worker._id;
  const profileImage = worker.profileImage || worker.profilePhoto || worker.photo;

  return (
    <div
      className={`
        group bg-white rounded-2xl shadow-lg overflow-hidden 
        transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
        border border-gray-100/80
        max-w-sm w-full cursor-pointer
      `}
      onClick={() => onEdit(worker)}
    >
      {/* Brand accent top bar */}
      <div className="h-2.5 bg-gradient-to-r from-[#F97316] via-[#fb923c] to-[#ea580c]"></div>

      <div className="p-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={worker.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F97316]/20 to-[#1e3a8a]/10 flex items-center justify-center border-4 border-white shadow-md ring-1 ring-gray-200">
                <User size={28} className="text-[#172554]" />
              </div>
            )}

            {/* Status indicator */}
            <span
              className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-sm
                ${worker.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}
              `}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-bold text-[#172554] group-hover:text-[#1e3a8a] transition-colors truncate">
              {worker.name}
            </h3>
            <p className="text-sm font-medium text-[#F97316] flex items-center gap-1.5 mt-1">
              <Briefcase size={14} className="text-[#F97316]" />
              {worker.role}
            </p>
          </div>
        </div>

        {/* Information rows */}
        <div className="space-y-4 text-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-[#F97316]" />
            </div>
            <span className="text-sm">{worker.contactNumber || "—"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-[#1e3a8a]" />
            </div>
            <span className="text-sm truncate">{worker.email || "—"}</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={16} className="text-purple-600" />
            </div>
            <span className="text-sm line-clamp-2">
              {worker.assignedProperties?.length
                ? worker.assignedProperties.map((p) => p.name || p.propertyName || p.title).join(", ")
                : "No properties assigned"}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={16} className="text-[#F97316]" />
            </div>
            <span className="font-medium text-[#F97316] text-sm">
              {worker.activeComplaints || 0} Active {worker.activeComplaints === 1 ? "Complaint" : "Complaints"}
            </span>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <p className="text-xl font-bold text-[#172554]">
              ₹{worker.chargePerService ?? "—"}
              <span className="text-sm font-normal text-gray-500 ml-1.5">per service</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mt-7">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(worker);
            }}
            className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Eye size={16} /> View
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(worker);
            }}
            className="flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Edit size={16} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/*                             Main Dashboard                                 */
/* ========================================================================== */
const WorkerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editWorker, setEditWorker] = useState(null);
  const [viewWorker, setViewWorker] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, worker: null });

  const normalizeId = (w) => w?.id || w?._id;

  const fetchWorkers = async () => {
    try {
      setError("");
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication missing");

      const res = await axios.get(`${baseurl}api/sub-owner/workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.success) throw new Error(res.data.message || "Failed to load workers");

      const normalized = (res.data.workers || []).map((w) => ({
        ...w,
        id: w.id || w._id,
        assignedProperties: (w.assignedProperties || []).map((p) => {
          if (typeof p === "string") return { id: p };
          return { ...p, id: p.id || p._id };
        }),
        profileImage: w.profileImage || w.profilePhoto || w.photo || null,
      }));

      setWorkers(normalized);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSave = async () => {
    await fetchWorkers();
    setEditWorker(null);
    setToast("Worker updated successfully!");
  };

  const openDeleteDialog = (worker) => {
    setDeleteDialog({ open: true, worker });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, worker: null });
  };

  const handleDeleteConfirm = async () => {
    const worker = deleteDialog.worker;
    if (!worker) return;

    try {
      setError("");
      const token = localStorage.getItem("token");
      const workerId = worker.id || worker._id;

      await axios.delete(`${baseurl}api/sub-owner/workers/${workerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchWorkers();
      setToast("Worker deleted successfully!");
      setEditWorker(null);
      closeDeleteDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  //  REMAINING COMPONENTS (Modal, DeleteDialog, Toast) remain unchanged
  //  You can keep your original WorkerModal, DeleteDialog, Toast components
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/60 to-white pb-16 pt-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#172554] mb-3">
            Gharzo <span className="text-[#F97316]">Workers</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Manage your professional team with ease and efficiency
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#F97316] border-t-4 border-gray-200"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl text-red-800 max-w-3xl mx-auto mb-10 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
            {workers.map((worker) => (
              <WorkerCard
                key={normalizeId(worker)}
                worker={worker}
                onView={setViewWorker}
                onEdit={setEditWorker}
              />
            ))}
          </div>
        )}

        {/* Keep your existing modals, dialogs, and toast here */}
        {/* WorkerModal, DeleteDialog, Toast components */}
      </div>
    </div>
  );
};

export default WorkerDashboard;