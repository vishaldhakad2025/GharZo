import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaRupeeSign,
  FaPlusCircle,
  FaBell,
  FaChartBar,
  FaWrench,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaTag,
  FaGlobe,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import baseurl from "../../../../BaseUrl";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [occupancy, setOccupancy] = useState({ totalRooms: 0, occupied: 0 });
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalRegionalManagers, setTotalRegionalManagers] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("orgToken"));
  const [organizationId, setOrganizationId] = useState(localStorage.getItem("id") || null);
  const [properties, setProperties] = useState([]);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [propertyMixData, setPropertyMixData] = useState([
    { name: "PG", value: 14 },
    { name: "Flats", value: 9 },
    { name: "Hostel", value: 20 },
  ]);
  const [occupancyTrendData, setOccupancyTrendData] = useState([
    { month: "Feb", occupied: 62 },
    { month: "Mar", occupied: 65 },
    { month: "Apr", occupied: 69 },
    { month: "May", occupied: 72 },
    { month: "Jun", occupied: 76 },
    { month: "Jul", occupied: 74 },
  ]);

  if (!token) {
    return <Navigate to="/organization/login" />;
  }

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const handleMouseEnter = () => setIsSidebarHovered(true);
      const handleMouseLeave = () => setIsSidebarHovered(false);
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const loadFallbackData = () => {
    const storedProperties = JSON.parse(localStorage.getItem("properties")) || [];
    const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [];
    setTotalProperties(storedProperties.length);
    setTotalTenants(storedTenants.length);
    setProperties(storedProperties);
    const totalRooms = storedProperties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
    setOccupancy({ totalRooms, occupied: storedTenants.length });
    setTotalVisits(0);
    setTotalCollected(0);
    setTotalRegionalManagers(0);
    setTotalExpenses(0);
    setTotalPlans(0);
  };

  const fetchToken = async () => {
    try {
      const response = await axios.post(`${baseurl}api/auth/login`, {
        username: "your-username",
        password: "your-password",
      });
      const newToken = response.data.token;
      const orgId = response.data.organizationId || response.data.orgId;
      localStorage.setItem("orgToken", newToken);
      if (orgId) {
        localStorage.setItem("id", orgId);
        setOrganizationId(orgId);
      }
      setToken(newToken);
      return { token: newToken, organizationId: orgId };
    } catch (err) {
      setError("Failed to authenticate. Please log in again.");
      return null;
    }
  };

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          const newData = await fetchToken();
          if (newData && newData.token) {
            error.config.headers.Authorization = `Bearer ${newData.token}`;
            if (newData.organizationId) {
              setOrganizationId(newData.organizationId);
            }
            return axios(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  useEffect(() => {
    loadFallbackData();

    const fetchDashboardData = async () => {
      if (!token) {
        const newData = await fetchToken();
        if (!newData || !newData.token) return;
      }

      setError(null);
      let currentOrgId = organizationId;

      if (!currentOrgId) {
        try {
          const profileRes = await axios.get(
            "https://api.gharzoreality.com/api/organization/profile",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          currentOrgId = profileRes.data.id;
          if (currentOrgId) {
            localStorage.setItem("id", currentOrgId);
            setOrganizationId(currentOrgId);
          } else {
            setError("Organization ID not found in profile.");
            return;
          }
        } catch (err) {
          setError("Failed to fetch organization profile.");
          return;
        }
      }

      if (!currentOrgId) return;

      let bedsPlans = [];
      let reelsPlans = [];

      try {
        const propertiesRes = await axios.get(`${baseurl}api/landlord/properties`);
        const fetchedProperties = propertiesRes.data?.properties || propertiesRes.data || [];
        setProperties(fetchedProperties);
        setTotalProperties(propertiesRes.data?.count || fetchedProperties.length);
      } catch (err) {
        console.error("Error fetching properties:", err);
      }

      try {
        const tenantsRes = await axios.get(`${baseurl}api/landlord/tenant/count`);
        setTotalTenants(tenantsRes.data?.count || 0);
      } catch (err) {
        console.error("Error fetching tenants:", err);
      }

      try {
        const collectionsRes = await axios.get(
          "https://api.gharzoreality.com/api/landlord/analytics/collections",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTotalCollected(collectionsRes.data?.totalCollected || 0);
      } catch (err) {
        console.error("Error fetching collections:", err);
      }

      try {
        const regionalManagersRes = await axios.get(
          `https://api.gharzoreality.com/api/regional-managers/${currentOrgId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const regionalManagers = regionalManagersRes.data?.data || [];
        setTotalRegionalManagers(Array.isArray(regionalManagers) ? regionalManagers.length : 0);
      } catch (err) {
        console.error("Error fetching regional managers:", err);
      }

      // Fixed: Total Expenses from correct API
      try {
        const expensesRes = await axios.get(
          `https://api.gharzoreality.com/api/org-expenses?organization=${currentOrgId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (expensesRes.data && Array.isArray(expensesRes.data.expenses)) {
          const totalAmount = expensesRes.data.expenses.reduce(
            (sum, exp) => sum + (exp.amount || 0),
            0
          );
          setTotalExpenses(totalAmount);
        } else {
          setTotalExpenses(0);
        }
      } catch (err) {
        console.error("Error fetching total expenses:", err);
        setTotalExpenses(0);
      }

      try {
        const bedsPlansRes = await axios.get(`${baseurl}api/landlord/subscriptions/plans`);
        bedsPlans = bedsPlansRes.data?.data || [];
      } catch (err) {
        console.error("Error fetching beds plans:", err);
      }

      try {
        const reelsPlansRes = await axios.get(`${baseurl}api/reel/reel-subscription-plans/active`);
        reelsPlans = reelsPlansRes.data?.data || [];
      } catch (err) {
        console.error("Error fetching reels plans:", err);
      }

      setTotalPlans(bedsPlans.length + reelsPlans.length);
    };

    fetchDashboardData();
  }, [token, organizationId]);

  useEffect(() => {
    const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
    const occupied = totalTenants;
    setOccupancy({ totalRooms, occupied });

    const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : 0;

    const updatedOccupancyTrend = occupancyTrendData.map((data) => ({
      ...data,
      occupied: parseFloat(occupancyRate),
    }));
    setOccupancyTrendData(updatedOccupancyTrend);

    const typeCounts = properties.reduce((acc, p) => {
      const type = p.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const updatedPropertyMix = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));
    setPropertyMixData(
      updatedPropertyMix.length > 0
        ? updatedPropertyMix
        : [
            { name: "PG", value: 14 },
            { name: "Flats", value: 9 },
            { name: "Hostel", value: 20 },
          ]
    );
  }, [properties, totalTenants]);

  const recentActivities = [
    "Added PG in Noida",
    "Received ₹8,000 from Ramesh",
    "Tenant Aman vacated property in Pune",
  ];
  const upcomingRent = [
    { name: "Ramesh Kumar", property: "PG in Noida", due: "28 Jul", amount: 8000 },
    { name: "Sita Devi", property: "Flat in Delhi", due: "01 Aug", amount: 12000 },
  ];
  const notifications = [
    "Tenant Amit’s rent is overdue",
    "2 properties have lease expiry this week",
    "Missing KYC for 3 tenants",
  ];
  const maintenanceRequests = [
    { tenant: "Vivek", issue: "Fan not working", room: "202", status: "Pending" },
    { tenant: "Pooja", issue: "Leaking Tap", room: "105", status: "In Progress" },
  ];
  const leaseExpiries = [
    { tenant: "Aman", property: "Flat-102", daysLeft: 12 },
    { tenant: "Sneha", property: "PG-Room 7", daysLeft: 25 },
  ];

  const occupancyRate = occupancy.totalRooms
    ? ((occupancy.occupied / occupancy.totalRooms) * 100).toFixed(1)
    : 0;

  const icon3DStyle =
    "drop-shadow-lg transform scale-110 hover:scale-125 transition-transform duration-300";

  const monthlyRentData = [
    { month: "Feb", collected: 52000, pending: 8000 },
    { month: "Mar", collected: 61000, pending: 6000 },
    { month: "Apr", collected: 58000, pending: 9000 },
    { month: "May", collected: 64000, pending: 5000 },
    { month: "Jun", collected: 70000, pending: 4000 },
    { month: "Jul", collected: 68000, pending: 7000 },
  ];

  const PIE_COLORS = ["#60A5FA", "#34D399", "#F59E0B"];

  return (
    <div
      className={`px-10 lg:px-8 py-2 mx-auto w-full min-h-screen text-black transition-all duration-500 min-w-0 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-6 text-center">
          {error}
        </div>
      )}
      <motion.h2
        className="text-3xl font-extrabold text-center mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Organization Dashboard
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 min-w-fit">
        {[
          {
            icon: FaBuilding,
            title: "Total Properties",
            value: totalProperties,
            link: "/organization/property-list",
            bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
          },
          {
            icon: FaUsers,
            title: "Total Tenants",
            value: totalTenants,
            link: "/organization/tenant-list",
            bg: "bg-gradient-to-r from-green-400 to-emerald-500",
          },
          {
            icon: FaRupeeSign,
            title: "Collections",
            value: totalCollected,
            link: "/organization/collections",
            bg: "bg-gradient-to-r from-cyan-400 to-green-500",
          },
          {
            icon: FaUsers,
            title: "Total Regional Managers",
            value: totalRegionalManagers,
            link: "/organization/add-regionalManager",
            bg: "bg-gradient-to-r from-cyan-400 to-green-500",
          },
          {
            icon: FaRupeeSign,
            title: "Total Expenses",
            value: totalExpenses,
            link: "/organization/expenses",
            bg: "bg-gradient-to-r from-red-400 to-red-500",
          },
          {
            icon: FaGlobe,
            title: "Organization Website",
            value: "Create",
            link: "/organization/create-website",
            bg: "bg-gradient-to-r from-purple-500 to-pink-500",
          },
          {
            icon: FaTag,
            title: "Subscription Plans",
            value: totalPlans,
            link: "/organization/subscription-plans",
            bg: "bg-gradient-to-r from-pink-500 to-rose-500",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const card = (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${stat.bg} rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all text-white flex-shrink-0 flex-grow-0`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`text-4xl ${icon3DStyle}`} />
                <h5 className="text-lg font-semibold">{stat.title}</h5>
              </div>
              <h3 className="text-3xl font-bold text-center">
                {stat.title.includes("Expenses") || stat.title.includes("Collections")
                  ? `₹${Number(stat.value).toLocaleString("en-IN")}`
                  : stat.value}
              </h3>
            </motion.div>
          );
          return stat.link ? (
            <Link key={i} to={stat.link}>
              {card}
            </Link>
          ) : (
            <div key={i}>{card}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <motion.div
          className="bg-darkblue-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h5 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <FaChartBar className={icon3DStyle} /> Occupancy Trend (Last 6 Months)
          </h5>
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrendData} margin={{ right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="occupied"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Occupied %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="bg-darkblue-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h5 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <FaChartBar className={icon3DStyle} /> Monthly Rent (Collected vs Pending)
          </h5>
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRentData} margin={{ right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="collected" name="Collected" fill="#34D399" />
                <Bar dataKey="pending" name="Pending" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="bg-darkblue-800 rounded-xl shadow-lg p-6 mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h5 className="font-semibold mb-4 flex items-center gap-2 text-white">
          <FaChartBar className={icon3DStyle} /> Property Mix
        </h5>
        <div className="w-full" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={propertyMixData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                label
              >
                {propertyMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;