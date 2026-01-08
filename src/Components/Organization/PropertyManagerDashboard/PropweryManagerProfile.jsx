import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye, EyeOff, Building2, MapPin, Bed, Users, IndianRupee, AlertCircle } from 'lucide-react';

function Profilepropmng() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(new Error("Authentication token missing"));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://api.gharzoreality.com/api/property-managers/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");
        const json = await response.json();

        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.message || "Invalid response");
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("https://api.gharzoreality.com/api/property-managers/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();
      if (json.success) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert(json.message || "Logout failed");
      }
    } catch (err) {
      alert("Logout error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
                Property Manager Profile
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {data.name.split(' ')[0]}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Name", value: data.name },
              { label: "Email", value: data.email },
              { label: "Mobile", value: data.mobile },
              { label: "Role", value: data.role.replace(/_/g, " ").toUpperCase() },
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">{item.label}</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Permissions - छोटे कार्ड */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></div>
              Permissions
            </h2>
            <button
              onClick={() => setShowAllPermissions(!showAllPermissions)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {showAllPermissions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAllPermissions ? "Hide" : "Show All"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {Object.entries(data.permissions)
              .slice(0, showAllPermissions ? undefined : 10)
              .map(([key, value]) => {
                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg text-center text-xs font-medium text-white shadow-sm transition-all ${
                      value
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}
                  >
                    <p className="truncate">{displayKey}</p>
                   
                  </div>
                );
              })}
          </div>
          {!showAllPermissions && Object.keys(data.permissions).length > 10 && (
            <p className="text-center text-gray-500 mt-3 text-sm">
              ...and {Object.keys(data.permissions).length - 10} more
            </p>
          )}
        </section>

        {/* Properties -  */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
            Assigned Properties
          </h2>

          {data.properties.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">No properties assigned yet.</p>
              <p className="text-sm text-gray-500 mt-1">Contact admin to get properties assigned.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.properties.map((property) => (
                <div
                  key={property._id}
                  className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{property.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <MapPin className="w-4 h-4" />
                    {property.address}, {property.city}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-gray-600 font-medium">Total Rooms</p>
                      <p className="text-xl font-bold text-blue-700">{property.totalRooms}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-gray-600 font-medium">Total Beds</p>
                      <p className="text-xl font-bold text-indigo-700">{property.totalBeds}</p>
                    </div>
                   
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Profilepropmng;