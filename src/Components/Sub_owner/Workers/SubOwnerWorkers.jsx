import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Star,
  Home,
  AlertCircle,
  Edit,
  Trash,
  X,
  Eye,
  CheckCircle,
} from "lucide-react";
import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                              Worker Card                                   */
/* -------------------------------------------------------------------------- */
const WorkerCard = ({ worker, onView, onEdit }) => {
  // normalize potential different id / image field names
  const id = worker.id || worker._id;
  const profileImage = worker.profileImage || worker.profilePhoto || worker.photo;

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-5 m-3 transition-all hover:scale-105 hover:shadow-xl max-w-sm w-full cursor-pointer"
      onClick={() => onEdit(worker)}
    >
      <div className="flex items-center mb-3">
        <div className="p-1 border rounded-full mr-3">
          {profileImage ? (
            <img
              src={profileImage} // Full URL from API
              alt={worker.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <User size={32} className="text-gray-400" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{worker.name}</h2>
          <p className="text-sm text-gray-600 flex items-center">
            <Briefcase size={14} className="mr-1 text-green-500" />
            {worker.role}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="flex items-center text-gray-700">
          <Phone size={16} className="mr-2 text-blue-500" />
          {worker.contactNumber}
        </p>
        <p className="flex items-center text-gray-700">
          <Mail size={16} className="mr-2 text-red-500" />
          {worker.email}
        </p>

        <p className="flex items-center text-gray-700">
          <MapPin size={16} className="mr-2 text-purple-500" />
          {worker.assignedProperties && worker.assignedProperties.length
            ? worker.assignedProperties.map((p) => p.name || p.propertyName || p.title).join(", ")
            : "No properties"}
        </p>
{/* 
        <p className="flex items-center text-gray-700">
          <Star size={16} className="mr-2 text-yellow-500" />
          {worker.ratings?.average || 0} ({worker.ratings?.count || 0} reviews)
        </p>
        */}

        <p className="flex items-center text-gray-700">
          <AlertCircle size={16} className="mr-2 text-orange-500" />
          {worker.activeComplaints || 0} Active Complaints
        </p>

        <p className="font-medium">Charge: ₹{worker.chargePerService ?? "-"}</p>

        <div className="flex justify-between items-center mt-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              worker.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {worker.status}
          </span>

          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(worker);
              }}
              className="flex items-center bg-teal-500 text-white px-2 py-1 rounded text-xs hover:bg-teal-600"
            >
              <Eye size={14} className="mr-1" /> View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(worker);
              }}
              className="flex items-center bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              <Edit size={14} className="mr-1" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               Property Chip                                */
/* -------------------------------------------------------------------------- */
const PropertyChip = ({ property, selected, onToggle }) => {
  const id = property.id || property._id;
  return (
    <button
      onClick={() => onToggle(id)}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors m-1 ${
        selected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
      }`}
    >
      {property.name || property.title || property.propertyName}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*                               Worker Modal                                 */
/* -------------------------------------------------------------------------- */
const WorkerModal = ({ worker, onClose, onSave, onDelete, isViewMode = false }) => {
  // helpers for id normalization
  const getId = (obj) => obj?.id || obj?._id || null;
  const getPropId = (prop) => prop?.id || prop?._id || prop;

  // initialize form using normalized fields (handle different shapes)
  const initialAssigned = (worker.assignedProperties || []).map((p) => (typeof p === "string" ? p : getPropId(p))).filter(Boolean);

  const [form, setForm] = useState({
    name: worker.name || "",
    contactNumber: worker.contactNumber || "",
    email: worker.email || "",
    chargePerService: worker.chargePerService || "",
    availabilityDays: worker.availabilityDays || [],
    assignedProperties: initialAssigned,
    profileImage: null, // File when changed
  });

  const profileImageUrl = worker.profileImage || worker.profilePhoto || worker.photo || null;
  const [imagePreview, setImagePreview] = useState(profileImageUrl);

  const [properties, setProperties] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch properties & workers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // fetch both
        const [propRes, workerRes] = await Promise.all([
          axios.get("https://api.gharzoreality.com/api/sub-owner/properties", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://api.gharzoreality.com/api/sub-owner/workers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!propRes.data.success) throw new Error(propRes.data.message || "Failed to load properties");
        if (!workerRes.data.success) throw new Error(workerRes.data.message || "Failed to load workers");

        // normalize property ids if necessary
        const props = (propRes.data.properties || []).map((p) => ({
          ...p,
          __normId: getPropId(p),
        }));

        const workersData = workerRes.data.workers || [];

        setProperties(props);
        setAllWorkers(workersData);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch data");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getId(worker)]); // re-run if worker id changes

  // compute taken property ids by other workers (normalize ids)
  const takenIds = (allWorkers || [])
    .filter((w) => (w.id || w._id) !== (worker.id || worker._id))
    .flatMap((w) => (w.assignedProperties || []).map((p) => (typeof p === "string" ? p : (p.id || p._id))))
    .filter(Boolean);

  // available properties = those not taken by other workers
  const availableProperties = (properties || []).filter((p) => !takenIds.includes(p.__normId));

  // image change handler
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day],
    }));
  };

  const toggleProperty = (id) => {
    setForm((prev) => ({
      ...prev,
      assignedProperties: prev.assignedProperties.includes(id) ? prev.assignedProperties.filter((p) => p !== id) : [...prev.assignedProperties, id],
    }));
  };

  // submit/update handler (multipart)
  const submit = async () => {
    if (isViewMode) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication missing");

      const data = new FormData();
      data.append("name", form.name);
      data.append("contactNumber", form.contactNumber);
      data.append("email", form.email);
      if (form.chargePerService !== "" && form.chargePerService !== null) {
        data.append("chargePerService", form.chargePerService);
      }

      // append arrays using bracket notation which many servers expect
      (form.availabilityDays || []).forEach((d) => data.append("availabilityDays[]", d));
      (form.assignedProperties || []).forEach((id) => data.append("propertyIds[]", id));

      if (form.profileImage) {
        data.append("profileImage", form.profileImage);
      }

      // Make PUT request. Let axios set Content-Type
      const urlWorkerId = worker.id || worker._id;
      const res = await axios.put(`https://api.gharzoreality.com/api/sub-owner/workers/${urlWorkerId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.success) throw new Error(res.data.message || "Update failed");

      await onSave(res.data.worker || { ...worker, ...res.data.worker });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{isViewMode ? "Worker Details" : "Edit Worker"}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 rounded-lg border-l-4 border-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Image Upload */}
        {!isViewMode && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Photo</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Change
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {isViewMode && profileImageUrl && (
          <div className="mb-4 text-center">
            <img src={profileImageUrl} alt={worker.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-indigo-200" />
          </div>
        )}

        <div className="space-y-4">
          {["name", "contactNumber", "email"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 capitalize">{field === "contactNumber" ? "Contact Number" : field}</label>
              <input
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                disabled={isViewMode}
                className={`w-full p-2 border rounded ${isViewMode ? "bg-gray-100" : ""}`}
              />
            </div>
          ))}

          <div>
            <label className="block text-gray-700">Charge Per Service (₹)</label>
            <input
              type="number"
              value={form.chargePerService}
              onChange={(e) => setForm({ ...form, chargePerService: e.target.value })}
              disabled={isViewMode}
              className={`w-full p-2 border rounded ${isViewMode ? "bg-gray-100" : ""}`}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Availability Days</label>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day) => (
                <label key={day} className="flex items-center">
                  <input type="checkbox" checked={form.availabilityDays.includes(day)} onChange={() => toggleDay(day)} disabled={isViewMode} className="mr-2" />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Assign Properties</label>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 border rounded">
              {availableProperties.map((prop) => (
                <PropertyChip key={prop.__normId} property={prop} selected={form.assignedProperties.includes(prop.__normId)} onToggle={toggleProperty} />
              ))}
              {/* Also show currently assigned properties even if not in availableProperties */}
              {(worker.assignedProperties || [])
                .map((p) => (typeof p === "string" ? p : getPropId(p)))
                .filter((id) => id && !availableProperties.find((ap) => ap.__normId === id))
                .map((id) => {
                  const propObj = properties.find((pp) => pp.__normId === id) || { name: `Property (${id})`, __normId: id };
                  return (
                    <PropertyChip key={propObj.__normId} property={propObj} selected={form.assignedProperties.includes(propObj.__normId)} onToggle={toggleProperty} />
                  );
                })}
              {availableProperties.length === 0 && (worker.assignedProperties || []).length === 0 && (
                <p className="text-gray-500 text-sm">No free properties</p>
              )}
            </div>
          </div>

          <div className="border-t pt-3 space-y-1 text-sm">
            <p>
              <strong>Role:</strong> {worker.role}
            </p>
            <p>
              <strong>Status:</strong> {worker.status}
            </p>
            {/* 
            <p>
              <strong>Ratings:</strong> {worker.ratings?.average || 0} ({worker.ratings?.count || 0} reviews)
            </p>
            */}
            <p>
              <strong>Active Complaints:</strong> {worker.activeComplaints || 0}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {!isViewMode && (
            <>
              <button
                onClick={() => onDelete(getId(worker))}
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                <Trash size={18} className="mr-1" /> Delete
              </button>
              <button
                onClick={submit}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                <Edit size={18} className="mr-1" />
                {loading ? "Saving…" : "Save"}
              </button>
            </>
          )}
          {isViewMode && (
            <button onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               Delete Dialog                                */
/* -------------------------------------------------------------------------- */
const DeleteDialog = ({ isOpen, onClose, onConfirm, workerName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center mb-4 text-red-600">
          <AlertCircle size={28} className="mr-2" />
          <h3 className="text-lg font-semibold">Confirm Delete</h3>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to <strong>permanently delete</strong> the worker <strong>"{workerName}"</strong>?
          <br />
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
         	R
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
          >
            <Trash size={16} className="mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   Toast                                    */
/* -------------------------------------------------------------------------- */
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <CheckCircle className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main Dashboard                                */
/* -------------------------------------------------------------------------- */
const WorkerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editWorker, setEditWorker] = useState(null);
  const [viewWorker, setViewWorker] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, worker: null }); // New state

  const normalizeId = (w) => w?.id || w?._id;

  const fetchWorkers = async () => {
    try {
      setError("");
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication missing");

      const res = await axios.get("https://api.gharzoreality.com/api/sub-owner/workers", {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (updatedWorker) => {
    await fetchWorkers();
    setEditWorker(null);
    setToast("Worker updated successfully!");
  };

  // Open delete dialog instead of confirm()
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
      if (!workerId) throw new Error("Invalid worker id");

      await axios.delete(`https://api.gharzoreality.com/api/sub-owner/workers/${workerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchWorkers();
      setToast("Worker deleted!");
      setEditWorker(null);
      closeDeleteDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Worker Dashboard</h1>

      {loading && <p className="text-center text-gray-600">Loading…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto px-4">
        {workers.map((w) => (
          <WorkerCard key={normalizeId(w)} worker={w} onView={setViewWorker} onEdit={setEditWorker} />
        ))}
      </div>

      {editWorker && (
        <WorkerModal
          worker={editWorker}
          onClose={() => setEditWorker(null)}
          onSave={handleSave}
          onDelete={(id) => openDeleteDialog(editWorker)} // Pass worker, not id
          isViewMode={false}
        />
      )}

      {viewWorker && (
        <WorkerModal
          worker={viewWorker}
          onClose={() => setViewWorker(null)}
          onSave={() => {}}
          onDelete={() => {}}
          isViewMode={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        workerName={deleteDialog.worker?.name || ""}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default WorkerDashboard;