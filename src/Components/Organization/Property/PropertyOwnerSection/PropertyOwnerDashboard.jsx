import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Home,
  Building2,
  LogOut,
  Edit,
  MapPin,
  Phone,
  Mail,
  Key,
  DollarSign,
  Eye,
  Image as ImageIcon,
  Info,
  Star,
  Users,
  X,
} from "lucide-react";

function PropertyOwnerDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("propertyOwner");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      // Redirect to login if no data
      navigate("/Property_Owner/login");
    }

    // Fetch properties
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/Property_Owner/login");
          return;
        }

        const response = await fetch("https://api.gharzoreality.com/api/property-owner/properties", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setProperties(result.properties || []);
          } else {
            setError("Failed to fetch properties");
          }
        } else {
          setError("Server error while fetching properties");
        }
      } catch (err) {
        console.error("Properties fetch error:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("propertyOwner");
    navigate("/Property_Owner_login");
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setActiveTab('overview');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setActiveTab('overview');
  };

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-gray-600">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  // 3D Icon Component
  const ThreeDIcon = ({ Icon, color, size = 24, className = "" }) => (
    <motion.div
      className={`relative inline-block ${className}`}
      whileHover={{ rotateY: 10, scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Icon
        size={size}
        className={`drop-shadow-lg ${color} hover:drop-shadow-2xl transition-shadow duration-300`}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );

  // Tab Component for Modal
  const Tab = ({ active, onClick, children, icon: Icon }) => (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        active
          ? "bg-blue-500 text-white shadow-lg"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      whileHover={{ scale: 1.05 }}
    >
      <ThreeDIcon Icon={Icon} color={active ? "text-white" : "text-gray-500"} size={18} />
      {children}
    </motion.button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <ThreeDIcon Icon={Building2} color="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <p className="font-semibold">{selectedProperty.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <ThreeDIcon Icon={MapPin} color="text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="font-semibold">{selectedProperty.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <ThreeDIcon Icon={Key} color="text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Property ID</p>
                    <p className="font-semibold">{selectedProperty.propertyId}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
                  <ThreeDIcon Icon={Phone} color="text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact</p>
                    <p className="font-semibold">{selectedProperty.contactNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                  <ThreeDIcon Icon={Users} color="text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Owner</p>
                    <p className="font-semibold">{selectedProperty.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
                  <ThreeDIcon Icon={MapPin} color="text-pink-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="font-semibold">
                      {selectedProperty.city}, {selectedProperty.state} - {selectedProperty.pinCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{selectedProperty.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedProperty.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                Status: {selectedProperty.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-sm text-gray-600">
                Created: {new Date(selectedProperty.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      case 'images':
        return (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Property Images</h3>
            {selectedProperty.images && selectedProperty.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedProperty.images.map((image, index) => (
                  <motion.div
                    key={index}
                    className="relative group overflow-hidden rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="text-white" size={24} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-500 mt-4">No images available for this property</p>
              </div>
            )}
          </div>
        );
      case 'financial':
        return (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="text-green-500" size={20} />
                  Monthly Collection
                </h4>
                <p className="text-2xl font-bold text-green-600">₹{selectedProperty.monthlyCollection}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="text-red-500" size={20} />
                  Pending Dues
                </h4>
                <p className="text-2xl font-bold text-red-600">₹{selectedProperty.pendingDues}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="text-blue-500" size={20} />
                  Total Capacity
                </h4>
                <p className="text-2xl font-bold text-blue-600">{selectedProperty.totalCapacity}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="text-indigo-500" size={20} />
                  Occupied Space
                </h4>
                <p className="text-2xl font-bold text-indigo-600">{selectedProperty.occupiedSpace}</p>
              </div>
            </div>
          </div>
        );
      case 'ratings':
        return (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Ratings & Reviews</h3>
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="text-yellow-500" size={20} />
                  Average Rating
                </h4>
                <p className="text-3xl font-bold text-yellow-600">{selectedProperty.ratingSummary?.averageRating || 0}/5</p>
                <p className="text-sm text-gray-600">Based on {selectedProperty.ratingSummary?.totalRatings || 0} ratings</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-2">Rating Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(selectedProperty.ratingSummary?.ratingDistribution || {}).map(([rating, count]) => (
                    <div key={rating} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">{rating}</span>
                        Stars
                      </span>
                      <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold mb-2">Comments</h4>
                <p className="text-gray-600">Total Comments: {selectedProperty.commentCount}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThreeDIcon Icon={Building2} color="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">Property Owner Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThreeDIcon Icon={User} color="text-green-600" size={24} />
              <span className="text-sm font-medium text-gray-700 hidden md:block">{userData.name}</span>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <ThreeDIcon Icon={LogOut} color="text-white" size={20} />
                Logout
              </motion.button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Box */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-white/50"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <ThreeDIcon Icon={User} color="text-white" size={40} />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{userData.name}</h2>
              <p className="text-green-600 font-semibold">Property Owner</p>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
             <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
  <ThreeDIcon Icon={Mail} color="text-blue-500" />
  <div className="min-w-0"> {/* important for truncate to work */}
    <p className="text-xs text-gray-500">Email</p>
    <p className="font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">
      {userData.email}
    </p>
  </div>
</div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <ThreeDIcon Icon={Phone} color="text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Mobile</p>
                  <p className="font-medium">{userData.mobile}</p>
                </div>
              </div>
            </div>

            {/* View Profile Button */}
            <motion.button
              onClick={() => navigate('/property-owner/profile')}
              whileHover={{ scale: 1.02 }}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              View Profile
            </motion.button>
          </motion.aside>

          {/* Properties Section */}
          <motion.main
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <ThreeDIcon Icon={Home} color="text-indigo-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property, index) => (
                  <motion.div
                    key={property._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <Building2 className="text-gray-400" size={32} />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">{property.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <ThreeDIcon Icon={MapPin} color="text-red-500" size={16} />
                        <p className="text-sm text-gray-600">{property.address}, {property.city}</p>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <ThreeDIcon Icon={DollarSign} color="text-green-500" size={16} />
                          <span className="font-semibold text-green-600">₹{property.monthlyCollection}/month</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {property.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => handleViewDetails(property)}
                        whileHover={{ scale: 1.05 }}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.main>
        </div>
      </div>

      {/* Property Details Modal */}
      {isModalOpen && selectedProperty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-hide shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-6 border-b rounded-t-2xl z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProperty.name}</h2>
                <motion.button
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </motion.button>
              </div>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b pb-2">
                <Tab
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                  icon={Info}
                >
                  Overview
                </Tab>
                <Tab
                  active={activeTab === 'images'}
                  onClick={() => setActiveTab('images')}
                  icon={ImageIcon}
                >
                  Images
                </Tab>
                <Tab
                  active={activeTab === 'financial'}
                  onClick={() => setActiveTab('financial')}
                  icon={DollarSign}
                >
                  Financial
                </Tab>
                {/* <Tab
                  active={activeTab === 'ratings'}
                  onClick={() => setActiveTab('ratings')}
                  icon={Star}
                >
                  Ratings
                </Tab> */}
              </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export default PropertyOwnerDashboard;