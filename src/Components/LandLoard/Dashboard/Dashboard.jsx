import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaRupeeSign,
  FaPlusCircle,
  FaBell,
  FaChartBar,
  FaWrench,
  FaVideo,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaTag,
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
  const [allComplaints, setAllComplaints] = useState(0);
  const [occupancy, setOccupancy] = useState({ totalRooms: 0, occupied: 0 });
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalSubAdmins, setTotalSubAdmins] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [properties, setProperties] = useState([]);
  const [plans, setPlans] = useState([]);
  const [landlordId, setLandlordId] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Redirect if no token
  if (!token) {
    return <Navigate to="/landlord_login" />;
  }

  // Sidebar hover effect
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

  // Load fallback data
  const loadFallbackData = useCallback(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties")) || [];
    const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [];
    setTotalProperties(storedProperties.length);
    setTotalTenants(storedTenants.length);
    setProperties(storedProperties);
    setOccupancy({ totalRooms: 50, occupied: 38 });
    setTotalVisits(0);
    setAllComplaints(0);
    setTotalCollected(0);
    setTotalSubAdmins(0);
    setTotalPlans(0);
    setTotalDues(0);
    setPlans([]);
    setLoading(false);
  }, []);

  // Fetch or refresh token
  const fetchToken = useCallback(async () => {
    try {
      const response = await axios.post(`${baseurl}api/auth/login`, {
        username: "your-username",
        password: "your-password",
      });
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      return newToken;
    } catch (err) {
      setError("Failed to authenticate. Please log in again.");
      return null;
    }
  }, []);

  // Axios interceptors
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
          const newToken = await fetchToken();
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
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
  }, [token, fetchToken]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let currentLandlordId = landlordId;
      if (!currentLandlordId) {
        const profileRes = await axios.get(`${baseurl}api/landlord/profile`).catch(() => ({ data: { landlord: { _id: null } } }));
        currentLandlordId = profileRes.data.landlord?._id;
        setLandlordId(currentLandlordId);
      }

      let duesTotal = 0;
      if (currentLandlordId) {
        const duesRes = await axios.get(`${baseurl}api/dues/getdue/${currentLandlordId}`).catch(() => ({ data: { tenants: [] } }));
        duesTotal = duesRes.data.tenants.reduce((sum, tenant) => sum + (tenant.totalAmount || 0), 0);
      }
      setTotalDues(duesTotal);

      const [
        propertiesRes,
        tenantsRes,
        visitsRes,
        complaintsRes,
        collectionsRes,
        subAdminsRes,
        bedsPlansRes,
        reelsPlansRes,
      ] = await Promise.all([
        axios.get(`${baseurl}api/landlord/properties`).catch(() => ({ data: { properties: [], count: 0 } })),
        axios.get(`${baseurl}api/landlord/tenant/count`).catch(() => ({ data: { count: 0 } })),
        axios.get(`${baseurl}api/visits/landlord`).catch(() => ({ data: { totalVisits: 0 } })),
        axios.get(`${baseurl}api/landlord/analytics/complaints`).catch(() => ({ data: { totalComplaints: 0 } })),
        axios.get(`${baseurl}api/landlord/analytics/collections`).catch(() => ({ data: { totalCollected: 0 } })),
        axios.get(`${baseurl}api/sub-owner/auth/sub-owners`).catch(() => ({ data: { subOwners: [] } })),
        axios.get(`${baseurl}api/landlord/subscriptions/plans`).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseurl}api/reel/reel-subscription-plans/active`).catch(() => ({ data: { data: [] } })),
      ]);

      const fetchedProperties = propertiesRes.data?.properties || propertiesRes.data || [];
      setProperties(fetchedProperties);
      setTotalProperties(propertiesRes.data?.count || fetchedProperties.length);
      setTotalTenants(tenantsRes.data?.count || 0);
      setTotalVisits(visitsRes.data?.totalVisits || 0);
      setAllComplaints(complaintsRes.data?.totalComplaints || 0);
      setTotalCollected(collectionsRes.data?.totalCollected || 0);

      const subOwners = subAdminsRes.data?.subOwners || [];
      setTotalSubAdmins(Array.isArray(subOwners) ? subOwners.length : 0);

      const bedsPlans = bedsPlansRes.data?.data || [];
      const reelsPlans = reelsPlansRes.data?.data || [];
      const combinedPlans = [...bedsPlans, ...reelsPlans];
      setPlans(combinedPlans);
      setTotalPlans(bedsPlans.length + reelsPlans.length);

      const totalRooms = fetchedProperties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
      const occupied = tenantsRes.data?.count || 0;
      setOccupancy({ totalRooms, occupied });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data. Using fallback data.");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  }, [landlordId, loadFallbackData]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      fetchToken().then((newToken) => {
        if (newToken) fetchDashboardData();
        else loadFallbackData();
      });
    }
  }, [token, fetchToken, fetchDashboardData, loadFallbackData]);

  // Update graph data
  useEffect(() => {
    const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
    const occupied = totalTenants;
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

  const occupancyRate = occupancy.totalRooms
    ? ((occupancy.occupied / occupancy.totalRooms) * 100).toFixed(1)
    : 0;

  const monthlyRentData = [
    { month: "Feb", collected: 52000, pending: 8000 },
    { month: "Mar", collected: 61000, pending: 6000 },
    { month: "Apr", collected: 58000, pending: 9000 },
    { month: "May", collected: 64000, pending: 5000 },
    { month: "Jun", collected: 70000, pending: 4000 },
    { month: "Jul", collected: 68000, pending: 7000 },
  ];

  // Brand Colors
  const ACCENT_ORANGE = "#f57c00"; // Vibrant orange for highlights
  const PIE_COLORS = ["#f57c00", "#ff9d3f", "#ffb87a"];

  return (
    <div
      className={`px-6 lg:px-12 py-8 mx-auto w-full min-h-screen text-gray-100 transition-all duration-500 ${
        isSidebarHovered
          ? "md:ml-[256px] md:w-[calc(100%-256px)]"
          : "md:ml-[64px] md:w-[calc(100%-64px)]"
      }`}
      style={{
        background: `radial-gradient(circle at center bottom, rgba(245, 124, 0, 0.35), transparent 60%), linear-gradient(rgb(7, 26, 47) 0%, rgb(13, 47, 82) 45%, rgb(18, 62, 107) 75%, rgb(11, 42, 74) 100%)`,
      }}
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/70 backdrop-blur-md text-white p-4 rounded-xl mb-8 text-center font-medium shadow-lg border border-red-500/50"
        >
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="text-center text-gray-400 text-lg py-12">Loading dashboard data...</div>
      )}

      <motion.h2
        className="text-5xl font-black text-center mb-12"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span style={{ color: ACCENT_ORANGE }}>Landlord Dashboard</span>
      </motion.h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: FaCalendarCheck,
            title: "Total Visits",
            value: totalVisits,
            link: "/landlord/visit-requests",
          },
          {
            icon: FaBuilding,
            title: "Total Properties",
            value: totalProperties,
            link: "/landlord/property",
          },
          {
            icon: FaUsers,
            title: "Total Tenants",
            value: totalTenants,
            link: "/landlord/tenant-list",
          },
          {
            icon: FaRupeeSign,
            title: "Collections",
            value: `₹${totalCollected.toLocaleString("en-IN")}`,
            link: "/landlord/collections",
          },
          {
            icon: FaUsers,
            title: "Total SubAdmins",
            value: totalSubAdmins,
            link: "/landlord/landlord_subadmin",
          },
          {
            icon: FaExclamationTriangle,
            title: "Total Complaints",
            value: allComplaints,
            link: "/landlord/allComplaints",
          },
          {
            icon: FaTag,
            title: "Subscription Plans",
            value: totalPlans,
            link: "/landlord/subscription-plans",
          },
          {
            icon: FaRupeeSign,
            title: "Total Dues",
            value: `₹${totalDues.toLocaleString("en-IN")}`,
            link: "/landlord/dues",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const card = (
            <motion.div
              whileHover={{ scale: 1.06, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 hover:shadow-orange-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="text-4xl text-orange-400" />
                <span className="text-sm font-medium text-gray-300">{stat.title}</span>
              </div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
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

      {/* Charts Section - Commented out as in original */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"> ... </div> */}

      {/* Property Mix Pie Chart */}
      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h5 className="text-2xl font-bold mb-8 text-center text-orange-300">
          Property Type Distribution
        </h5>
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend iconType="circle" />
            <Pie
              data={propertyMixData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              innerRadius={60}
              paddingAngle={5}
              label={({ name, value }) => `${name}: ${value}`}
              labelStyle={{ fill: "#fff", fontSize: "14px" }}
            >
              {propertyMixData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default Dashboard;