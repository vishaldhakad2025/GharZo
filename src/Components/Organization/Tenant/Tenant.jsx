import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Home } from "lucide-react";

const OrganizationTenant = () => {
  const { id } = useParams(); // propertyId from route
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("orgToken");
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

  if (loading) return <p className="text-center mt-10">Loading tenants...</p>;
  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        Failed to fetch tenants: {error}
      </p>
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-black">Tenants for Property</h2>

      {tenants.length === 0 ? (
        <p className="text-black">No tenants found for this property.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tenants.map((tenant, idx) => (
            <motion.div
              key={tenant.tenantId || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white shadow rounded-xl p-5 border"
            >
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {tenant.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Phone className="w-4 h-4" /> {tenant.mobile}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Mail className="w-4 h-4" /> {tenant.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="w-4 h-4" /> Room:{" "}
                {tenant.accommodations?.[0]?.roomId || "N/A"} • Property:{" "}
                {tenant.accommodations?.[0]?.propertyName || "N/A"}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationTenant;
