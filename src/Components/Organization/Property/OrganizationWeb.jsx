import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {getSubdomain} from "./subdomin.jsx"; // Function to get subdomain

const OrganizationWeb = () => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = localStorage.getItem("orgToken"); // Standardized to "token"
        if (!token) {
          throw new Error("No authentication token found");
        }
        const res = await fetch("https://api.gharzoreality.com/api/organization/my-website", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch organization data");  
        
        const json = await res.json();
        if (json.success) {
          setOrg(json.data);
        } else {
          throw new Error(json.message || "No data received");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgData();
  }, []);
  
  console.log("Subdomain:", getSubdomain());
const handleVisitWebsite = (orgSubdomain) => {
  const host = window.location.hostname;
  const port = window.location.port || 5173; // default fallback

  if (host.includes("localhost")) {
    window.open(`http://${host}:${port}/website/${orgSubdomain}`, "_blank");
  } else {
    window.open(`https://${orgSubdomain}.drazeindia.com/website/${orgSubdomain}`, "_blank");
  }
};
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading organization details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-red-500">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg font-medium">Error loading details</p>
          <p className="text-sm mt-2 opacity-80">{error}</p>
        </div>
      </div>
    );

  if (!org) return null; // Safety check

  const themeColor = org.website?.themeColor || "#ff6600";
  const logoUrl = org.logoUrl
    ? `https://api.gharzoreality.com${org.logoUrl}` // API base prepend
    : "https://via.placeholder.com/150?text=Logo";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-md w-full">
        <div
          className="bg-white rounded-3xl shadow-xl p-8 text-center transition-all duration-300 hover:shadow-2xl"
          style={{ 
            borderTop: `6px solid ${themeColor}`,
            boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
          }}
        >
          {/* Logo */}
          <div className="relative mb-6">
            <img
              src={logoUrl}
              alt="Organization Logo"
              className="h-24 w-24 mx-auto rounded-full object-cover border-4 shadow-lg transition-transform duration-300 hover:scale-105"
              style={{ borderColor: themeColor }}
            />
            <div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"
              style={{ boxShadow: `0 0 0 3px ${themeColor}` }}
            >
              <span className="text-xs text-white font-bold">✓</span>
            </div>
          </div>

          {/* Org Name */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {org.organizationName}
          </h2>

          {/* About */}
          <p className="text-gray-600 mb-6 text-base leading-relaxed max-w-xs mx-auto">
            {org.website?.about ||
              "Welcome to our organization. We are committed to delivering excellence in everything we do."}
          </p>

          {/* Website Link */}
          {org.fullUrl && (
            <button
              onClick={() => handleVisitWebsite(org.subdomain)}
              className="group inline-flex items-center px-6 py-3 mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800"
            >
              <span className="mr-2">Visit Website</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">↗</span>
            </button>
          )}

          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            {org.website?.socialLinks?.facebook && (
              <a
                href={org.website.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-110"
                style={{ color: themeColor }}
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
            )}
            {org.website?.socialLinks?.instagram && (
              <a
                href={org.website.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-pink-100 hover:bg-pink-200 transition-all duration-300 hover:scale-110"
                style={{ color: themeColor }}
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
            )}
            {org.website?.socialLinks?.linkedin && (
              <a
                href={org.website.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-110"
                style={{ color: themeColor }}
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-lg"></i>
              </a>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
            Powered by DrazeApp
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationWeb;