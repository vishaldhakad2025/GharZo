import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Wrench,
  DollarSign,
  Star,
  Activity,
  Building,
  AlertCircle,
} from "lucide-react";

// Icon Wrapper with colorful 3D effect
const Colorful3DIcon = ({ Icon, gradient, size = 22 }) => (
  <motion.div
    className="relative p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
    whileHover={{ y: -2 }}
  >
    <div className={`bg-gradient-to-br ${gradient} rounded-full p-1 shadow-md`}>
      <Icon size={size} className="text-white drop-shadow-lg" />
    </div>
  </motion.div>
);

function WorkerProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------------------------- */
  /*                          FETCH PROFILE + COMPLAINTS                        */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/worker/login");
          return;
        }

        // Fetch worker profile
        const profileRes = await fetch(
          "https://api.gharzoreality.com/api/worker/auth/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const profileResult = await profileRes.json();

        if (profileRes.ok && profileResult.success) {
          setProfileData(profileResult.worker);
        } else {
          throw new Error("Failed to load profile");
        }

        // Fetch assigned complaints
        const complaintsRes = await fetch(
          "https://api.gharzoreality.com/api/workers/assigned-complaints",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const complaintsResult = await complaintsRes.json();

        if (complaintsRes.ok && complaintsResult.success) {
          setActiveComplaints(complaintsResult.complaints || []);
        } else {
          console.error("Failed to fetch complaints:", complaintsResult);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Something went wrong while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  /* -------------------------------------------------------------------------- */
  /*                              LOADING / ERROR                              */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">
          Loading Worker Profile...
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-red-600">
          {error || "No profile data found"}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                DESTRUCTURE                                 */
  /* -------------------------------------------------------------------------- */

  const {
    name,
    role,
    contactNumber,
    email,
    profileImage,
    chargePerService,
    status,
    ratings,
    assignedProperties = [],
  } = profileData;

  /* -------------------------------------------------------------------------- */
  /*                               MAIN CONTENT                                 */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 text-center border border-white/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center"
          >
            {profileImage ? (
              <img
                src={`https://api.gharzoreality.com${profileImage}`}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="text-white" size={50} />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{name}</h1>
          <p className="text-indigo-600 font-semibold text-lg">{role}</p>
          <span
            className={`inline-block mt-3 px-4 py-1 text-sm rounded-full font-semibold ${
              status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
        </motion.div>

        {/* Personal Info */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <Colorful3DIcon
              Icon={User}
              gradient="from-blue-400 to-indigo-500"
              size={28}
            />
            <h2 className="text-2xl font-bold text-gray-800">
              Personal Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: User,
                label: "Name",
                value: name,
                gradient: "from-blue-400 to-indigo-500",
              },
              {
                icon: Mail,
                label: "Email",
                value: email,
                gradient: "from-green-400 to-teal-500",
              },
              {
                icon: Phone,
                label: "Contact Number",
                value: contactNumber,
                gradient: "from-purple-400 to-pink-500",
              },
              {
                icon: Wrench,
                label: "Role",
                value: role,
                gradient: "from-orange-400 to-red-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all"
              >
                <Colorful3DIcon Icon={item.icon} gradient={item.gradient} />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {item.label}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {item.value || "N/A"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Work Details */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <Colorful3DIcon
              Icon={Activity}
              gradient="from-purple-400 to-pink-500"
              size={28}
            />
            <h2 className="text-2xl font-bold text-gray-800">Work Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <Colorful3DIcon
                Icon={DollarSign}
                gradient="from-green-400 to-emerald-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Charge per Service
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  ₹{chargePerService}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
              <Colorful3DIcon
                Icon={Star}
                gradient="from-yellow-400 to-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ratings (Avg / Count)
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {ratings?.average} ★ ({ratings?.count})
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Properties and Active Complaints */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned Properties */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-2">
                <Colorful3DIcon
                  Icon={Building}
                  gradient="from-blue-400 to-indigo-500"
                />
                <h3 className="text-lg font-bold text-gray-800">
                  Assigned Properties
                </h3>
              </div>
              {assignedProperties.length > 0 ? (
                <ul className="list-disc pl-6 text-gray-700">
                  {assignedProperties.map((p, i) => (
                    <li key={i}>
                      {p.name
                        ? `${p.name}, ${p.city} (${p.pinCode})`
                        : JSON.stringify(p)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">No properties assigned</p>
              )}
            </div>

            {/* Active Complaints from API */}
            {/* <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-3 mb-2">
                <Colorful3DIcon
                  Icon={AlertCircle}
                  gradient="from-pink-400 to-rose-500"
                />
                <h3 className="text-lg font-bold text-gray-800">
                  Active Complaint
                </h3>
              </div>
              {activeComplaints.length > 0 ? (
                <ul className="space-y-3 text-gray-700">
                  {activeComplaints.map((c, i) => (
                    <li
                      key={i}
                      className="p-3 bg-white/70 rounded-lg shadow-sm border border-gray-100"
                    >
                      <p className="font-semibold text-indigo-700">
                        {c.subject}
                      </p>
                      <p className="text-sm text-gray-600">{c.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Status:</strong> {c.status} |{" "}
                        <strong>Priority:</strong> {c.priority}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">No active complaints</p>
              )}
            </div> */}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default WorkerProfile;
