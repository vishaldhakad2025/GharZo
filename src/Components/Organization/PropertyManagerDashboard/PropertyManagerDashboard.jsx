import { useState, useEffect } from "react";
import {
  FaUsers,
  FaHome,
  FaExclamationTriangle,
  FaUserCircle,
  FaRupeeSign,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [analytics, setAnalytics] = useState({
    properties: 0,
    totalTenants: 0,
    complaints: 0,
    workers: 0,
    totalExpenses: 0,
    totalCollection: 0,
    totalDues: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ==================== TIME UPDATE ==================== */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).toUpperCase();
      const date = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      setCurrentTime(`${time} IST, ${date}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* ==================== DATA FETCHING ==================== */
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const getCount = (data, key) => {
      if (!data) return 0;
      if (typeof data === "number") return data;
      if (data[key] !== undefined) return data[key];
      if (Array.isArray(data)) return data.length;
      if (Array.isArray(data.data)) return data.data.length;
      if (Array.isArray(data.results)) return data.results.length;
      return 0;
    };

    const fetchAnalytics = async () => {
      setLoading(true);
      const a = { ...analytics };

      try {
        const [
          propRes,
          compRes,
          workRes,
          tenRes,
          expRes,
          collRes,
          duesRes,
        ] = await Promise.all([
          fetch("https://api.gharzoreality.com/api/pm/properties", { headers }).catch(() => null),
          fetch("https://api.gharzoreality.com/api/pm/complaints/all", { headers }).catch(() => null),
          fetch("https://api.gharzoreality.com/api/pm/workers", { headers }).catch(() => null),
          fetch("https://api.gharzoreality.com/api/pm/tenants/count", { headers }).catch(() => null),
          fetch("https://api.gharzoreality.com/api/pm/expenses/analytics/trend/yearly", { headers }).catch(() => null),
          fetch("https://api.gharzoreality.com/api/pm/collections/summary", { headers }).catch(() => null),
          fetch("https://api.gharzoreality.com/api/pm/dues", { headers }).catch(() => null),
        ]);

        // Properties
        if (propRes?.ok) {
          const d = await propRes.json();
          a.properties = getCount(d, "total") || d.length || 0;
        }

        // Complaints
        if (compRes?.ok) {
          const d = await compRes.json();
          a.complaints = d.totalComplaints || d.complaints?.length || 0;
        }

        // Workers
        if (workRes?.ok) {
          const d = await workRes.json();
          a.workers = Array.isArray(d.workers) ? d.workers.length : getCount(d, "total") || d.length || 0;
        }

        // Tenants
        if (tenRes?.ok) {
          const d = await tenRes.json();
          a.totalTenants = d.count || 0;
        }

        // Expenses (Current Year)
        if (expRes?.ok) {
          const d = await expRes.json();
          const currentYear = new Date().getFullYear();
          const yearData = d.yearlyData?.find(y => y.year === currentYear);
          a.totalExpenses = yearData?.totalAmount || 0;
        }

        // Collection
        if (collRes?.ok) {
          const d = await collRes.json();
          a.totalCollection = d.summary?.totalCollected || 0;
        }

        // Total Dues - Calculate from fixed type dues
        if (duesRes?.ok) {
          const d = await duesRes.json();
          if (d.success && Array.isArray(d.dues)) {
            // Sum all ACTIVE fixed dues amounts
            a.totalDues = d.dues
              .filter(due => due.type === "fixed" && due.status === "ACTIVE")
              .reduce((sum, due) => sum + (due.amount || 0), 0);
            
            console.log(`Total Dues Calculated: ₹${a.totalDues.toLocaleString()}`);
          }
        }

        setAnalytics(a);
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  /* ==================== NAVIGATION ==================== */
  const go = (path) => () => navigate(path);

  const nav = {
    properties: go("/property-manager/propertyList"),
    tenants: go("/property-manager/tenants"),
    complaints: go("/property-manager/dash-cmpln"),
    workers: go("/property-manager/workersList"),
    expenses: go("/property-manager/expenses"),
    collection: go("/property-manager/collection"),
    dues: go("/property-manager/dues"),
  };

  /* ==================== CHART DATA ==================== */
  const chartData = [
    { name: "Properties", value: analytics.properties, fill: "#3b82f6" },
    { name: "Tenants", value: analytics.totalTenants, fill: "#10b981" },
    { name: "Complaints", value: analytics.complaints, fill: "#ef4444" },
    { name: "Workers", value: analytics.workers, fill: "#f59e0b" },
    { name: "Expenses (k)", value: analytics.totalExpenses / 1000, fill: "#6366f1" },
    { name: "Collection (k)", value: analytics.totalCollection / 1000, fill: "#16a34a" },
    { name: "Dues (k)", value: analytics.totalDues / 1000, fill: "#dc2626" },
  ];

  /* ==================== CARDS CONFIG ==================== */
  const cards = [
    { 
      label: "Total Properties", 
      value: analytics.properties, 
      icon: <FaHome className="text-white" />, 
      onClick: nav.properties 
    },
    { 
      label: "Total Tenants", 
      value: analytics.totalTenants, 
      icon: <FaUsers className="text-white" />, 
      onClick: nav.tenants 
    },
    { 
      label: "Total Complaints", 
      value: analytics.complaints, 
      icon: <FaExclamationTriangle className="text-white" />, 
      onClick: nav.complaints 
    },
    { 
      label: "Total Workers", 
      value: analytics.workers, 
      icon: <FaUserCircle className="text-white" />, 
      onClick: nav.workers 
    },
    { 
      label: "Total Expenses", 
      value: `₹${analytics.totalExpenses.toLocaleString()}`, 
      icon: <FaFileInvoiceDollar className="text-white" />, 
      onClick: nav.expenses 
    },
    { 
      label: "Total Collection", 
      value: `₹${analytics.totalCollection.toLocaleString()}`, 
      icon: <FaMoneyBillWave className="text-white" />, 
      onClick: nav.collection 
    },
    {
      label: "Total Dues",
      value: `₹${analytics.totalDues.toLocaleString()}`,
      icon: <FaRupeeSign className="text-white" />,
      onClick: nav.dues,
    },
  ];

  /* ==================== LOADING STATE ==================== */
  if (loading) {
    return (
      <div className="p-4 min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-72 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl h-32"></div>
              ))}
            </div>
            <div className="h-64 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== MAIN RENDER ==================== */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 min-h-screen bg-gray-100"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-800">
            📊 Dashboard
          </h2>
          <p className="text-gray-600 mt-1">{currentTime}</p>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={card.onClick}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all"
            >
              <div
                className="p-6 text-white"
                style={{
                  backgroundImage: "linear-gradient(to right, #2563eb, #22c55e)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold opacity-90">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <div className="text-4xl">{card.icon}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Analytics Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip
                  formatter={(v, n) =>
                    n.includes("k") ? `₹${(v * 1000).toLocaleString()}` : v
                  }
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={(d) => d.fill} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard