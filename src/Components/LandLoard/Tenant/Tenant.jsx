import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Home, Users } from "lucide-react";

const Tenant = () => {
  const { id } = useParams(); // propertyId from route
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login again.");

        const res = await fetch(
          `https://api.gharzoreality.com/api/landlord/tenant/property/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const raw = await res.text();
        console.log("Raw tenant response:", raw);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${raw}`);
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          throw new Error("Invalid JSON response from server");
        }

        if (!Array.isArray(data)) {
          throw new Error("Expected an array of tenants");
        }

        setTenants(data);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-6">
          <div className="border-t-4 border-[#FF6B35] w-10 h-10 rounded-full animate-spin mx-auto"></div>
          <p className="text-[#003366] mt-3 font-medium text-sm">Loading tenants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center"
        >
          <p className="text-red-700 font-semibold text-sm">
            Failed to fetch tenants
          </p>
          <p className="text-red-600 text-xs mt-1">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold text-[#003366] flex items-center">
            <span className="w-1 h-6 bg-[#FF6B35] mr-3 rounded"></span>
            Tenants Overview
          </h2>
          
          {/* Total Tenants Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-90">Total</p>
              <p className="text-xl font-bold">{tenants.length}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {tenants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-[#FF6B35]/30 rounded-lg p-8 text-center shadow-lg"
        >
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-[#003366] text-sm font-semibold">
            No tenants found for this property
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Tenants will appear here once they are added
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant, idx) => (
            <Link
              key={tenant.tenantId || idx}
              to={`/landlord/tenant-details/${tenant.tenantId || tenant._id || idx}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-white shadow-lg rounded-lg p-4 border-2 border-[#FF6B35]/30 hover:border-[#FF6B35] hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Tenant Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003366] to-[#004999] flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#003366] truncate">
                      {tenant.name}
                    </h3>
                    <p className="text-xs text-gray-500">Tenant</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3 h-3 text-[#FF6B35]" />
                    </div>
                    <span className="text-[#003366] font-medium truncate">{tenant.mobile}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3 h-3 text-[#FF6B35]" />
                    </div>
                    <span className="text-[#003366] font-medium truncate">{tenant.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-[#003366]/5 to-[#FF6B35]/5 p-2 rounded">
                    <div className="w-6 h-6 rounded-full bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
                      <Home className="w-3 h-3 text-[#003366]" />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 bg-[#003366] text-white text-xs font-semibold rounded">
                        {tenant.accommodations?.[0]?.roomId || "N/A"}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-[#FF6B35] text-white text-xs font-semibold rounded truncate">
                        {tenant.accommodations?.[0]?.propertyName || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details */}
                <motion.div
                  className="mt-3 pt-3 border-t border-gray-100"
                  whileHover={{ x: 3 }}
                >
                  <div className="flex items-center justify-between text-[#FF6B35] font-semibold text-xs">
                    <span>View Details</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tenant;