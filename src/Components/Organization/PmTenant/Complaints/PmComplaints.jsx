import React, { useMemo, useState, useEffect } from "react";
import { AlertCircle, Send, Clock, Search, AlertTriangle, Bell, Home, FileText, Zap, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

// Tailwind-safe status colors
const statusClass = {
  Pending: "bg-rose-100 text-rose-700",
  Accepted: "bg-sky-100 text-sky-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-gray-200 text-gray-600",
};

const priorityClass = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-indigo-100 text-indigo-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

export default function TenantComplaints() {
  const token = localStorage.getItem("tenanttoken");
  const [accommodations, setAccommodations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationsError, setNotificationsError] = useState(null);

  // Extract from localStorage
  const tenantId = localStorage.getItem("tenantId");
  const [propertyId, setPropertyId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [bedId, setBedId] = useState(null); // fallback

  // Fetch accommodations to get propertyId, roomId, bedId
  useEffect(() => {
    if (!token) {
      setError("Authentication token missing.");
      return;
    }

    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("https://api.gharzoreality.com/api/tenant/accommodations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch accommodations");

        const data = await res.json();
        const acc = data.accommodations || [];
        setAccommodations(acc);

        if (acc.length > 0) {
          const first = acc[0];
          setPropertyId(first.propertyId);
          setRoomId(first.roomId);
          setBedId(first.bedId || null);
        }
      } catch (err) {
        setError(`Accommodations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, [token]);

  // Fetch complaints
  useEffect(() => {
    if (!token || !tenantId) return;

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch complaints");
        }

        const data = await res.json();
        setComplaints(data.complaints || []); // Fixed: store array directly
      } catch (err) {
        setError(`Complaints: ${err.message}`);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token, tenantId]);

  // Fetch notifications
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("https://api.gharzoreality.com/api/tenant/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load notifications");

        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotificationsError(null);
      } catch (err) {
        setNotificationsError(err.message);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [token]);

  // Filtering
  const filtered = useMemo(() => {
    return (complaints || []).filter((c) => {
      const q = query.toLowerCase();
      const matchesQ =
        c.subject?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.complaintId?.toLowerCase().includes(q);
      const matchesFilter = filter === "All" || c.status === filter;
      return matchesQ && matchesFilter;
    });
  }, [complaints, query, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Form state
  const [form, setForm] = useState({
    title: "",
    category: "Maintenance",
    priority: "Low",
    description: "",
  });

  // Submit complaint
  const raiseComplaint = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    if (!tenantId || !propertyId) {
      setError("Tenant or property information missing. Please log in again.");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const body = {
        tenantId,
        propertyId,
        roomId: roomId || bedId, // fallback to bedId if roomId missing
        subject: title,
        description,
        priority: form.priority,
        category: form.category,
      };

      const res = await fetch("https://api.gharzoreality.com/api/landlord/tenant/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit complaint");
      }

      if (data.complaint) {
        const newComplaint = data.complaint;
        setComplaints((prev) => [newComplaint, ...prev]);

        // Show OTP & ID
        alert(
          `Complaint Submitted!\n\nID: ${newComplaint.complaintId}\nOTP: ${newComplaint.otp?.code || "N/A"}\n\nSave this OTP for verification.`
        );

        // Reset form
        setForm({
          title: "",
          category: "Maintenance",
          priority: "Low",
          description: "",
        });
      }
    } catch (err) {
      setError(`Submit failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 mb-6 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
                >
                  <AlertCircle size={28} />
                </motion.div>
                <h1 className="text-3xl font-bold text-white">Complaints Management</h1>
              </div>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
                >
                  <Bell size={24} />
                </motion.button>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
              <Bell size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Notifications ({notifications.length})</h2>
          </div>
          {notificationsError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-2xl mb-4 text-sm">
              {notificationsError}
            </div>
          )}
          {notifications.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {notifications.map((n, i) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-2xl border ${n.read ? "bg-gray-50" : "bg-blue-50 border-l-4 border-blue-400"}`}
                >
                  <h4 className="font-semibold">{n.title}</h4>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  {n.complaintId && <p className="text-xs text-blue-600 mt-1">ID: {n.complaintId}</p>}
                  <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          )}
        </motion.div>

        {/* Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
              <FileText size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Raise New Complaint</h2>
          </div>
          <form onSubmit={raiseComplaint} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Water leakage in bathroom"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option>Maintenance</option>
                  <option>Noise</option>
                  <option>Neighbour</option>
                  <option>Payment</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-400 resize-none"
                placeholder="Explain the issue in detail..."
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setForm({ title: "", category: "Maintenance", priority: "Low", description: "" })}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || !propertyId}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Send size={18} />
                Submit Complaint
              </button>
            </div>
          </form>
        </motion.section>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-wrap">
              {["All", "Pending", "Accepted", "In Progress", "Resolved", "Rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-medium border ${
                    filter === s
                      ? "bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white border-transparent"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Complaints List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Your Complaints ({filtered.length})</h2>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.complaintId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-green-600">
                          {c.subject}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityClass[c.priority]}`}>
                          {c.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass[c.status]}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{c.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-green-500" />
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={14} className="text-blue-500" />
                          {c.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home size={14} className="text-indigo-500" />
                          {c.complaintId}
                        </span>
                        {c.otp?.code && (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            OTP: {c.otp.code}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="self-center">
                      {c.status === "Resolved" ? (
                        <Zap size={20} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={20} className="text-rose-600" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <AlertCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600">No complaints found</h3>
              <p className="text-gray-500">Raise your first complaint above.</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}