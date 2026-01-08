import React, { useState, useEffect } from "react";
import { MdAnnouncement } from "react-icons/md";
import { FaBullhorn } from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const TenantAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ tenantId from URL params
  const { tenantId } = useParams();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);

        // ✅ token from localStorage
        const token = localStorage.getItem("tenanttoken");

        // Fetch landlord announcements
        const landlordRes = await fetch(
          `https://api.gharzoreality.com/api/announcement/tenant/${tenantId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        let landlordData = [];
        if (landlordRes.ok) {
          const data = await landlordRes.json();
          landlordData = data.announcements || data || [];
        }

        // Fetch subowner announcements
        const subownerRes = await fetch(
          `https://api.gharzoreality.com/api/subowner/announcements/tenant/${tenantId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        let subownerData = [];
        if (subownerRes.ok) {
          const data = await subownerRes.json();
          subownerData = data.announcements || [];
        }

        // Merge and sort by createdAt desc
        const allAnnouncements = [...landlordData, ...subownerData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAnnouncements(allAnnouncements);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchAnnouncements();
    }
  }, [tenantId]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3"
      >
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 shadow-md text-white">
          <MdAnnouncement className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Announcements</h2>
          <p className="text-sm text-gray-500 text-center">
            Stay updated with the latest notices and alerts.
          </p>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center py-10"
        >
          Loading announcements...
        </motion.p>
      )}

      {/* Error State */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-center py-10"
        >
          Error: {error}
        </motion.p>
      )}

      {/* Announcement Lists with Headings */}
      {!loading && !error && announcements.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center py-10"
        >
          No announcements at this time.
        </motion.p>
      ) : (
        <div className="space-y-10">
          {/* Landlord Announcements */}
          <div>
            <h3 className="text-xl font-bold text-[#5C4EFF] mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 p-2 rounded-full text-white">
                <FaBullhorn />
              </span>
              Landlord Announcements
            </h3>
            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-1 md:grid-cols-2"
            >
              {announcements
                .filter(
                  (item) =>
                    !item.createdByType || item.createdByType === "LANDLORD"
                )
                .map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white shadow-md">
                        <FaBullhorn className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 mt-2">{item.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
          {/* SubOwner Announcements */}
          <div>
            <h3 className="text-xl font-bold text-[#1fc9b2] mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 p-2 rounded-full text-white">
                <FaBullhorn />
              </span>
              SubOwner Announcements
            </h3>
            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-1 md:grid-cols-2"
            >
              {announcements
                .filter((item) => item.createdByType === "SUBOWNER")
                .map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white shadow-md">
                        <FaBullhorn className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 mt-2">{item.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantAnnouncements;
