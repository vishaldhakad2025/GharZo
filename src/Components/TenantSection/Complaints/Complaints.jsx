// import React, { useMemo, useState, useEffect } from "react";
// import { AlertCircle, Send, Clock, Search, AlertTriangle, Bell, Home, FileText, Zap, AlertOctagon } from "lucide-react";
// import { motion } from "framer-motion";

// // Tailwind-safe status colors
// const statusClass = {
//   Pending: "bg-rose-100 text-rose-700",
//   Accepted: "bg-sky-100 text-sky-700",
//   "In Progress": "bg-amber-100 text-amber-700",
//   Resolved: "bg-emerald-100 text-emerald-700",
//   Rejected: "bg-gray-200 text-gray-600",
// };

// const priorityClass = {
//   Low: "bg-slate-100 text-slate-700",
//   Medium: "bg-indigo-100 text-indigo-700",
//   High: "bg-orange-100 text-orange-700",
//   Critical: "bg-red-100 text-red-700",
// };

// export default function TenantComplaints() {
//   const token = localStorage.getItem("tenanttoken");
//   const [accommodations, setAccommodations] = useState([]);
//   const [complaints, setComplaints] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [query, setQuery] = useState("");
//   const [filter, setFilter] = useState("All");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [notificationsError, setNotificationsError] = useState(null);

//   // Extract from localStorage
//   const tenantId = localStorage.getItem("tenantId");
//   const [propertyId, setPropertyId] = useState(null);
//   const [roomId, setRoomId] = useState(null);
//   const [bedId, setBedId] = useState(null); // fallback

//   // Dialog state
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogData, setDialogData] = useState({ id: "", otp: "" });

//   // Fetch accommodations to get propertyId, roomId, bedId
//   useEffect(() => {
//     if (!token) {
//       setError("Authentication token missing.");
//       return;
//     }

//     const fetchAccommodations = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch("https://api.gharzoreality.com/api/tenant/accommodations", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) throw new Error("Failed to fetch accommodations");

//         const data = await res.json();
//         const acc = data.accommodations || [];
//         setAccommodations(acc);

//         if (acc.length > 0) {
//           const first = acc[0];
//           setPropertyId(first.propertyId);
//           setRoomId(first.roomId);
//           setBedId(first.bedId || null);
//         }
//       } catch (err) {
//         setError(`Accommodations: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAccommodations();
//   }, [token]);

//   // Fetch complaints
//   useEffect(() => {
//     if (!token || !tenantId) return;

//     const fetchComplaints = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(
//           `https://api.gharzoreality.com/api/landlord/tenant/${tenantId}/complaints`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!res.ok) {
//           const err = await res.json();
//           throw new Error(err.message || "Failed to fetch complaints");
//         }

//         const data = await res.json();
//         setComplaints(data.complaints || []);
//       } catch (err) {
//         setError(`Complaints: ${err.message}`);
//         setComplaints([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchComplaints();
//   }, [token, tenantId]);

//   // Fetch notifications
//   useEffect(() => {
//     if (!token) return;

//     const fetchNotifications = async () => {
//       try {
//         const res = await fetch("https://api.gharzoreality.com/api/tenant/notifications", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) throw new Error("Failed to load notifications");

//         const data = await res.json();
//         setNotifications(data.notifications || []);
//         setNotificationsError(null);
//       } catch (err) {
//         setNotificationsError(err.message);
//         setNotifications([]);
//       }
//     };

//     fetchNotifications();
//   }, [token]);

//   // Filtering
//   const filtered = useMemo(() => {
//     return (complaints || []).filter((c) => {
//       const q = query.toLowerCase();
//       const matchesQ =
//         c.subject?.toLowerCase().includes(q) ||
//         c.description?.toLowerCase().includes(q) ||
//         c.complaintId?.toLowerCase().includes(q);
//       const matchesFilter = filter === "All" || c.status === filter;
//       return matchesQ && matchesFilter;
//     });
//   }, [complaints, query, filter]);

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   // Form state
//   const [form, setForm] = useState({
//     title: "",
//     category: "Maintenance",
//     priority: "Low",
//     description: "",
//   });

//   // Submit complaint
//   const raiseComplaint = async (e) => {
//     e.preventDefault();

//     const title = form.title.trim();
//     const description = form.description.trim();

//     if (!title || !description) {
//       setError("Title and description are required.");
//       return;
//     }

//     if (!tenantId || !propertyId) {
//       setError("Tenant or property information missing. Please log in again.");
//       return;
//     }

//     try {
//       setError(null);
//       setLoading(true);

//       const body = {
//         tenantId,
//         propertyId,
//         roomId: roomId || bedId,
//         subject: title,
//         description,
//         priority: form.priority,
//         category: form.category,
//       };

//       const res = await fetch("https://api.gharzoreality.com/api/landlord/tenant/complaint", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Failed to submit complaint");
//       }

//       if (data.complaint) {
//         const newComplaint = data.complaint;
//         setComplaints((prev) => [newComplaint, ...prev]);

//         // Show dialog instead of alert
//         setDialogData({
//           id: newComplaint.complaintId,
//           otp: newComplaint.otp?.code || "N/A",
//         });
//         setDialogOpen(true);

//         // Reset form
//         setForm({
//           title: "",
//           category: "Maintenance",
//           priority: "Low",
//           description: "",
//         });
//       }
//     } catch (err) {
//       setError(`Submit failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && complaints.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"
//         />
//         <p className="ml-4 text-gray-600 font-medium">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Error */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 mb-6 shadow-sm"
//           >
//             <AlertTriangle className="w-5 h-5" />
//             <p className="text-sm">{error}</p>
//           </motion.div>
//         )}

//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8"
//         >
//           <div className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 px-8 py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 0.2, type: "spring" }}
//                   className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
//                 >
//                   <AlertCircle size={28} />
//                 </motion.div>
//                 <h1 className="text-3xl font-bold text-white">Complaints Management</h1>
//               </div>
//               <div className="relative">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
//                 >
//                   <Bell size={24} />
//                 </motion.button>
//                 {unreadCount > 0 && (
//                   <motion.span
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold"
//                   >
//                     {unreadCount}
//                   </motion.span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Notifications */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
//               <Bell size={20} />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800">Notifications ({notifications.length})</h2>
//           </div>
//           {notificationsError && (
//             <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-2xl mb-4 text-sm">
//               {notificationsError}
//             </div>
//           )}
//           {notifications.length > 0 ? (
//             <div className="space-y-4 max-h-64 overflow-y-auto">
//               {notifications.map((n, i) => (
//                 <motion.div
//                   key={n._id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: i * 0.05 }}
//                   className={`p-4 rounded-2xl border ${n.read ? "bg-gray-50" : "bg-blue-50 border-l-4 border-blue-400"}`}
//                 >
//                   <h4 className="font-semibold">{n.title}</h4>
//                   <p className="text-sm text-gray-600">{n.message}</p>
//                   {n.complaintId && <p className="text-xs text-blue-600 mt-1">ID: {n.complaintId}</p>}
//                   <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
//                 </motion.div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-gray-50 rounded-2xl">
//               <Bell size={48} className="mx-auto mb-4 text-gray-300" />
//               <p className="text-gray-500">No notifications yet</p>
//             </div>
//           )}
//         </motion.div>

//         {/* Form */}
//         <motion.section
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
//               <FileText size={20} />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800">Raise New Complaint</h2>
//           </div>
//           <form onSubmit={raiseComplaint} className="space-y-6">
//             <div className="grid md:grid-cols-3 gap-6">
//               <div>
//                 <label className="text-sm font-semibold text-gray-700">Title *</label>
//                 <input
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                   className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-400"
//                   placeholder="e.g. Water leakage in bathroom"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-semibold text-gray-700">Category</label>
//                 <select
//                   value={form.category}
//                   onChange={(e) => setForm({ ...form, category: e.target.value })}
//                   className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3"
//                 >
//                   <option>Maintenance</option>
//                   <option>Noise</option>
//                   <option>Neighbour</option>
//                   <option>Payment</option>
//                   <option>Other</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="text-sm font-semibold text-gray-700">Priority</label>
//                 <select
//                   value={form.priority}
//                   onChange={(e) => setForm({ ...form, priority: e.target.value })}
//                   className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3"
//                 >
//                   <option>Low</option>
//                   <option>Medium</option>
//                   <option>High</option>
//                   <option>Critical</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700">Description *</label>
//               <textarea
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 rows={4}
//                 className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-400 resize-none"
//                 placeholder="Explain the issue in detail..."
//                 required
//               />
//             </div>

//             <div className="flex justify-end gap-4 pt-4 border-t">
//               <button
//                 type="button"
//                 onClick={() => setForm({ title: "", category: "Maintenance", priority: "Low", description: "" })}
//                 className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
//               >
//                 Clear
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading || !propertyId}
//                 className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 shadow-lg hover:shadow-xl disabled:opacity-50"
//               >
//                 <Send size={18} />
//                 Submit Complaint
//               </button>
//             </div>
//           </form>
//         </motion.section>

//         {/* Filters */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100"
//         >
//           <div className="flex flex-col md:flex-row gap-4 justify-between">
//             <div className="flex gap-2 flex-wrap">
//               {["All", "Pending", "Accepted", "In Progress", "Resolved", "Rejected"].map((s) => (
//                 <button
//                   key={s}
//                   onClick={() => setFilter(s)}
//                   className={`px-4 py-2.5 rounded-2xl text-sm font-medium border ${
//                     filter === s
//                       ? "bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white border-transparent"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                   }`}
//                 >
//                   {s}
//                 </button>
//               ))}
//             </div>
//             <div className="relative md:w-80">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search complaints..."
//                 className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-400"
//               />
//             </div>
//           </div>
//         </motion.div>

//         {/* Complaints List */}
//         <motion.section
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8 }}
//           className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-lg">
//               <Zap size={20} />
//             </div>
//             <h2 className Proactive="text-2xl font-bold text-gray-800">Your Complaints ({filtered.length})</h2>
//           </div>

//           {filtered.length > 0 ? (
//             <div className="grid gap-6">
//               {filtered.map((c, i) => (
//                 <motion.div
//                   key={c.complaintId}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.05 }}
//                   className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl"
//                 >
//                   <div className="flex flex-col lg:flex-row justify-between gap-4">
//                     <div className="flex-1">
//                       <div className="flex flex-wrap items-center gap-3 mb-3">
//                         <h3 className="font-bold text-xl text-gray-900 group-hover:text-green-600">
//                           {c.subject}
//                         </h3>
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityClass[c.priority]}`}>
//                           {c.priority}
//                         </span>
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass[c.status]}`}>
//                           {c.status}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-4">{c.description}</p>
//                       <div className="flex flex-wrap gap-4 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <Clock size={14} className="text-green-500" />
//                           {new Date(c.createdAt).toLocaleDateString("en-IN")}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FileText size={14} className="text-blue-500" />
//                           {c.category}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <Home size={14} className="text-indigo-500" />
//                           {c.complaintId}
//                         </span>
//                         {c.otp?.code && (
//                           <span className="flex items-center gap-1 text-green-600 font-medium">
//                             OTP: {c.otp.code}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="self-center">
//                       {c.status === "Resolved" ? (
//                         <Zap size={20} className="text-emerald-600" />
//                       ) : (
//                         <AlertCircle size={20} className="text-rose-600" />
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-16 bg-gray-50 rounded-2xl">
//               <AlertCircle size={64} className="mx-auto mb-4 text-gray-300" />
//               <h3 className="text-xl font-semibold text-gray-600">No complaints found</h3>
//               <p className="text-gray-500">Raise your first complaint above.</p>
//             </div>
//           )}
//         </motion.section>

//         {/* Custom Dialog */}
//         {dialogOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
//             >
//               <div className="text-center mb-6">
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ type: "spring", delay: 0.2 }}
//                   className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
//                 >
//                   <AlertCircle className="w-8 h-8 text-green-600" />
//                 </motion.div>
//                 <h3 className="text-2xl font-bold text-gray-800">Complaint Submitted!</h3>
//               </div>

//               <div className="space-y-4 mb-8">
//                 <div className="bg-gray-50 rounded-2xl p-0 text-left">
                  
//                 </div>
//                 <div className="bg-gray-50 rounded-2xl p-4 text-left">
//                   <p className="text-sm font-semibold text-gray-600">OTP</p>
//                   <p className="text-lg font-mono font-bold text-green-600">{dialogData.otp}</p>
//                 </div>
//                 <p className="text-sm text-gray-500 text-center">
//                   Save this OTP for verification.
//                 </p>
//               </div>

//               <button
//                 onClick={() => setDialogOpen(false)}
//                 className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
//               >
//                 OK
//               </button>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useMemo, useState, useEffect } from "react";
import { 
  AlertCircle, 
  Send, 
  Clock, 
  Search, 
  AlertTriangle, 
  Bell, 
  Home, 
  FileText, 
  Zap, 
  AlertOctagon,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Shield,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Settings,
  RefreshCw,
  Calendar,
  User,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced status colors with gradients
const statusColors = {
  Pending: "bg-gradient-to-r from-rose-400 to-pink-500",
  Accepted: "bg-gradient-to-r from-blue-400 to-cyan-500",
  "In Progress": "bg-gradient-to-r from-amber-400 to-orange-500",
  Resolved: "bg-gradient-to-r from-emerald-400 to-green-500",
  Rejected: "bg-gradient-to-r from-gray-400 to-gray-500",
};

const statusClass = {
  Pending: "bg-rose-50 text-rose-700 border-rose-200",
  Accepted: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-gray-50 text-gray-700 border-gray-200",
};

const priorityClass = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-indigo-100 text-indigo-700 border-indigo-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
};

export default function TenantComplaints() {
  const token = localStorage.getItem("tenanttoken");
  const [accommodations, setAccommodations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notificationsError, setNotificationsError] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Extract from localStorage
  const tenantId = localStorage.getItem("tenantId");
  const [propertyId, setPropertyId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [bedId, setBedId] = useState(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ id: "", otp: "" });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  });

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
  const fetchComplaints = async () => {
    if (!token || !tenantId) return;

    try {
      setRefreshing(true);
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
      const complaintsData = data.complaints || [];
      setComplaints(complaintsData);

      // Calculate stats
      const stats = {
        total: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'Pending').length,
        resolved: complaintsData.filter(c => c.status === 'Resolved').length,
        inProgress: complaintsData.filter(c => c.status === 'In Progress').length
      };
      setStats(stats);
    } catch (err) {
      setError(`Complaints: ${err.message}`);
      setComplaints([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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
      const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;
      return matchesQ && matchesFilter && matchesPriority;
    });
  }, [complaints, query, filter, priorityFilter]);

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
        roomId: roomId || bedId,
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
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1
        }));

        // Show dialog
        setDialogData({
          id: newComplaint.complaintId,
          otp: newComplaint.otp?.code || "N/A",
        });
        setDialogOpen(true);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-spin opacity-20"></div>
          <div className="absolute inset-4 rounded-full bg-white shadow-lg"></div>
          <AlertCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-xl font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Loading your complaints...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-5 px-4 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col bg-white py-2 rounded shadow px-5 lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl py-1 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Complaints Management
              </h1>
              <p className="text-gray-600 mt-2">Report and track issues with your property</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchComplaints}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                <span className="font-medium">Refresh</span>
              </button>
              
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="relative p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <AlertCircle className="text-white" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - New Complaint Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-lg"
                  >
                    <FileText size={24} />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Raise New Complaint</h2>
                    <p className="text-blue-100">Report issues quickly and efficiently</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <form onSubmit={raiseComplaint} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <User size={16} className="text-blue-500" />
                        Title *
                      </label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g. Water leakage in bathroom"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Building2 size={16} className="text-purple-500" />
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option>Maintenance</option>
                        <option>Electrical</option>
                        <option>Plumbing</option>
                        <option>Cleaning</option>
                        <option>Security</option>
                        <option>Noise</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <AlertOctagon size={16} className="text-red-500" />
                        Priority
                      </label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-green-500" />
                        Property Info
                      </label>
                      <input
                        value={accommodations[0]?.propertyName || "Loading..."}
                        disabled
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-cyan-500" />
                      Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all"
                      placeholder="Explain the issue in detail... Please include location, time of occurrence, and any other relevant information."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Provide as much detail as possible for faster resolution.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setForm({ title: "", category: "Maintenance", priority: "Low", description: "" })}
                      className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Clear All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading || !propertyId}
                      className="relative overflow-hidden group px-8 py-3 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Send size={18} />
                        Submit Complaint
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>

         
          </motion.div>

          {/* Right Column - Notifications and Help */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            {/* Notifications Panel */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      <p className="text-gray-500 text-sm">{unreadCount} unread</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Real-time</span>
                </div>
              </div>
              
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {notificationsError && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-xl mb-4 text-sm">
                    {notificationsError}
                  </div>
                )}
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((n, i) => (
                      <motion.div
                        key={n._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          n.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            n.read ? "bg-gray-200" : "bg-blue-100"
                          }`}>
                            {n.type === 'resolved' ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : n.type === 'new' ? (
                              <AlertCircle size={16} className="text-blue-500" />
                            ) : (
                              <Bell size={16} className="text-purple-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              n.read ? "text-gray-700" : "text-gray-900"
                            }`}>
                              {n.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {notifications.length > 5 && (
                      <button className="w-full py-3 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View all {notifications.length} notifications
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Help & Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Quick Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Provide detailed descriptions for faster resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Save your OTP for technician verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Check notifications for status updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Use appropriate priority levels</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Complaint Submitted!</h3>
                <p className="text-gray-600">Your complaint has been successfully registered.</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Complaint ID</p>
                      <p className="font-mono font-bold text-gray-800">{dialogData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verification OTP</p>
                      <p className="font-mono font-bold text-green-600 text-xl">{dialogData.otp}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span className="font-medium">Important:</span> Share this OTP only with verified technicians.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Copy to clipboard
                    navigator.clipboard.writeText(`Complaint ID: ${dialogData.id}\nOTP: ${dialogData.otp}`);
                    setDialogOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl"
                >
                  Copy Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="bg-white   rounded shadow-xl border border-gray-100 px-3 py-3">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search complaints by title, description, or ID..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>Accepted</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Rejected</option>
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option>All Priority</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Complaints List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Your Complaints</h2>
                        <p className="text-gray-500 text-sm">{filtered.length} complaints found</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                      <Download size={18} />
                      <span className="text-sm font-medium">Export</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {filtered.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filtered.map((c, i) => (
                        <motion.div
                          key={c.complaintId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ y: -2 }}
                          className="group relative overflow-hidden rounded-2xl border border-gray-200 hover:border-blue-200 bg-white hover:shadow-lg transition-all duration-300"
                        >
                          <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                              {/* Status Indicator */}
                              <div className="flex-shrink-0">
                                <div className={`w-3 h-3 rounded-full ${statusColors[c.status]}`} />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                                    {c.subject}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${priorityClass[c.priority]}`}>
                                      {c.priority}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusClass[c.status]}`}>
                                      {c.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.description}</p>
                                
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-2">
                                    <Clock size={14} className="text-blue-500" />
                                    {new Date(c.createdAt).toLocaleDateString("en-IN")}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Home size={14} className="text-purple-500" />
                                    {c.category}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Shield size={14} className="text-green-500" />
                                    ID: {c.complaintId}
                                  </span>
                                  {c.otp?.code && (
                                    <span className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                                      <Sparkles size={12} />
                                      OTP: {c.otp.code}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                  <Eye size={18} className="text-gray-500" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                  <MessageSquare size={18} className="text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress bar for In Progress status */}
                          {c.status === "In Progress" && (
                            <div className="px-6 pb-4">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "65%" }}
                                  className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-right">65% Complete</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200"
                    >
                      <AlertCircle size={64} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No complaints found</h3>
                      <p className="text-gray-500 mb-8">
                        {query || filter !== "All" || priorityFilter !== "All"
                          ? "Try changing your search or filters"
                          : "Raise your first complaint above"}
                      </p>
                      <button
                        onClick={() => {
                          setQuery("");
                          setFilter("All");
                          setPriorityFilter("All");
                        }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
                      >
                        Clear Filters
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 p-4 rounded-2xl shadow-lg flex items-center gap-3 max-w-md">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}