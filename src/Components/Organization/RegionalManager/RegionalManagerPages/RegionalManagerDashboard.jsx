import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaBuilding,
  FaBed,
  FaUsers,
  FaExclamationTriangle,
  FaDollarSign,
  FaMoneyBillWave,
  FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalRegions: 0,
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    totalTenants: 0,
    totalManagers: 0,
    monthlyCollection: 0,
    pendingDues: 0,
    totalComplaints: 0,
    totalExpenses: 0,
  });
  const [profile, setProfile] = useState(null);
  const [expensesSummary, setExpensesSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Smooth zoom effect
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch assigned properties
        const assignedPropsResponse = await axios.get(
          "https://api.gharzoreality.com/api/regional-managers/assigned-properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch RM properties
        const rmPropsResponse = await axios.get(
          "https://api.gharzoreality.com/api/rm/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const assignedProperties = assignedPropsResponse.data.data || [];
        const rmProperties = rmPropsResponse.data.properties || [];

        // Combine all properties
        const allProperties = [...assignedProperties, ...rmProperties];

        let totalRooms = 0;
        let totalBeds = 0;
        let totalTenants = 0;
        let monthlyCollection = 0;
        let pendingDues = 0;

        allProperties.forEach((prop) => {
          totalRooms += prop.totalRooms || 0;
          totalBeds += prop.totalBeds || 0;
          monthlyCollection += prop.monthlyCollection || 0;
          pendingDues += prop.pendingDues || 0;

          // Calculate total tenants by summing tenants in beds
          if (prop.rooms && prop.rooms.length > 0) {
            prop.rooms.forEach((room) => {
              if (room.beds && room.beds.length > 0) {
                room.beds.forEach((bed) => {
                  if (bed.tenants && bed.tenants.length > 0) {
                    totalTenants += bed.tenants.length;
                  }
                });
              }
            });
          }
        });

        // Fetch profile data
        const profileResponse = await axios.get(
          "https://api.gharzoreality.com/api/regional-managers/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (profileResponse.data.data) {
          const profileData = profileResponse.data.data;
          setProfile(profileData);

          // Fetch total managers using the provided API
          const rmId = profileData.id;
          const managersResponse = await axios.get(
            `https://api.gharzoreality.com/api/property-managers/${rmId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          let totalManagers = 0;
          if (managersResponse.data && managersResponse.data.data) {
            // Assuming the response has a 'data' array of managers; adjust if different
            totalManagers = managersResponse.data.data.length || 0;
          }

          // Fetch expenses data
          const expensesResponse = await axios.get(
            `https://api.gharzoreality.com/api/rm-expenses/analytics/summary?rm=${rmId}&year=2025`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          let totalExpenses = 0;
          let summaryData = [];
          if (expensesResponse.data.success) {
            totalExpenses = expensesResponse.data.grandTotal || 0;
            summaryData = expensesResponse.data.summary || [];
            setExpensesSummary(summaryData);
          }

          setDashboardStats({
            totalRegions: 1, // Assuming one region from profile
            totalProperties: allProperties.length,
            totalRooms,
            totalBeds,
            totalTenants,
            totalManagers,
            monthlyCollection,
            pendingDues,
            totalComplaints: 12, // Dummy as no API provided
            totalExpenses,
          });
        } else {
          setError("Failed to fetch profile data.");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const expensesChartData = {
    labels: expensesSummary.map((item) => item._id || `Category ${expensesSummary.indexOf(item) + 1}`),
    datasets: [
      {
        label: 'Total Amount',
        data: expensesSummary.map(s => s.totalAmount),
        backgroundColor: 'rgba(75, 85, 99, 0.2)',
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 1,
      },
      {
        label: 'Count',
        data: expensesSummary.map(s => s.count * 100), // Scaled for visibility if count is small
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const expensesChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expenses Summary for 2025',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h3 className="text-center"><b>Regional   Manager</b></h3>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
    <FaUser className="text-3xl sm:text-4xl text-green-800 drop-shadow-lg relative z-10" /> {profile?.name}!     
 </h1>
      <p className="text-gray-600 mb-6">
        Welcome {profile?.name}! Manage your regions, properties, and team
        efficiently.
      </p>

      {/* Big Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Regions Card */}
        {/* <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg cursor-default"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Regions</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaHome className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Your managed regions.</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalRegions}</h3>
        </motion.div> */}

        {/* Properties Card */}
        <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/regional_manager_property")}
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Properties</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaBuilding className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Manage all properties in your regions.</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalProperties}</h3>
        </motion.div>

        {/* Managers Card */}
        <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/team_management/view_managers")}
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">My Managers</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaUserTie className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Your team of property managers.</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalManagers}</h3>
        </motion.div>

        {/* Rooms Card */}
        <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Total Rooms</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaBed className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalRooms}</h3>
        </motion.div>

        {/* Beds Card */}
        <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Total Beds</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaBed className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalBeds}</h3>
        </motion.div>

        {/* Tenants Card */}
        <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Total Tenants</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaUsers className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalTenants}</h3>
        </motion.div>

        {/* Complaints Card */}
        {/* <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/complaints")}
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Complaints</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaExclamationTriangle className="text-3xl sm:text-4xl  text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{dashboardStats.totalComplaints}</h3>
        </motion.div> */}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-10">
        {/* Monthly Collection */}
        <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Monthly Collection</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaMoneyBillWave className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Total monthly collections</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ₹{dashboardStats.monthlyCollection.toLocaleString()}
          </h3>
        </motion.div>

        {/* Pending Dues */}
        <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Pending Dues</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaDollarSign className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Outstanding payments</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ₹{dashboardStats.pendingDues.toLocaleString()}
          </h3>
        </motion.div>

        {/* Total Expenses */}
        <motion.div
          className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-lg"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Total Expenses</h2>
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-xl shadow-lg"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaDollarSign className="text-3xl sm:text-4xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-xl -inset-1 shadow-inner"></div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Total expenses for 2025</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ₹{dashboardStats.totalExpenses.toLocaleString()}
          </h3>
        </motion.div>
      </div>

      {/* Expenses Analytics Chart */}
      {expensesSummary.length > 0 && (
        <div className="mt-6 sm:mt-10 p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Expenses Analytics 2025</h2>
          <div className="w-full h-64 sm:h-96">
            <Bar data={expensesChartData} options={expensesChartOptions} />
          </div>
        </div>
      )}

      {/* Small Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mt-6 sm:mt-10">
        {/* Complaints */}
        {/* <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/complaints")}
          className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-md cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <motion.div 
              className="relative p-1 sm:p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-lg shadow-lg mb-2"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaExclamationTriangle className="text-2xl sm:text-3xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-lg -inset-1 shadow-inner"></div>
            </motion.div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Complaints</h3>
          </div>
        </motion.div> */}

        {/* Dues */}
        {/* <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/dues")}
          className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-md cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <motion.div 
              className="relative p-1 sm:p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-lg shadow-lg mb-2"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaDollarSign className="text-2xl sm:text-3xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-lg -inset-1 shadow-inner"></div>
            </motion.div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Dues</h3>
          </div>
        </motion.div> */}

        {/* Collections */}
        {/* <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/collections")}
          className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-md cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <motion.div 
              className="relative p-1 sm:p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-lg shadow-lg mb-2"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaMoneyBillWave className="text-2xl sm:text-3xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-lg -inset-1 shadow-inner"></div>
            </motion.div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Collections</h3>
          </div>
        </motion.div> */}

        {/* Managers */}
        {/* <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/my_owner")}
          className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-md cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <motion.div 
              className="relative p-1 sm:p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-lg shadow-lg mb-2"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaUserTie className="text-2xl sm:text-3xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-lg -inset-1 shadow-inner"></div>
            </motion.div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">My Owner</h3>
          </div>
        </motion.div> */}

        {/* Regions */}
        {/* <motion.div
          role="button"
          onClick={() => navigate("/regional_manager/regions")}
          className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-md cursor-pointer hover:bg-gray-50"
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <motion.div 
              className="relative p-1 sm:p-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-lg shadow-lg mb-2"
              whileHover={{ rotateY: 10 }}
              style={{ perspective: 1000 }}
            >
              <FaHome className="text-2xl sm:text-3xl text-white drop-shadow-lg relative z-10" />
              <div className="absolute inset-0 bg-green-600 rounded-lg -inset-1 shadow-inner"></div>
            </motion.div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Regions</h3>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
};

export default Dashboard;