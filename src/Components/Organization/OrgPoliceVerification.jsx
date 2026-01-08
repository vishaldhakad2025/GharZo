// OrgPoliceVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaMapMarkerAlt, FaUserTie, FaUsers, FaSyncAlt, FaCheckCircle,
  FaExclamationTriangle, FaFileAlt, FaClock, FaUserCheck, FaImage,
  FaIdCard, FaPhone, FaEnvelope, FaMapPin, FaBirthdayCake, FaVenusMars,
  FaUniversity, FaRupeeSign, FaTimes, FaEye, FaChevronDown, FaChevronUp,
  FaEyeSlash, FaShieldAlt, FaExternalLinkAlt, FaDownload, FaThumbsUp,
  FaThumbsDown,
} from 'react-icons/fa';

const API_BASE_URL = 'https://api.gharzoreality.com/api/verification';
const LANDLORD_API_BASE_URL = 'https://api.gharzoreality.com/api/landlord';
const ORG_API_BASE_URL = 'https://api.gharzoreality.com/api/organization';
const BASE_IMAGE_URL = 'https://api.gharzoreality.com';

const OrgPoliceVerification = () => {
  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [linkedLandlord, setLinkedLandlord] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
  const [tenantLoading, setTenantLoading] = useState(false);

  // NEW: DOC MODAL
  const [showTenantDocsModal, setShowTenantDocsModal] = useState(false);
  const [selectedTenantDocs, setSelectedTenantDocs] = useState(null);

  const [tenantDocsLoading, setTenantDocsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [showFullLandlordDetails, setShowFullLandlordDetails] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVerificationId, setRejectingVerificationId] = useState(null);
  const [forceShowReview, setForceShowReview] = useState(true);

  // ==== AUTH: orgToken + orgId ====
  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.orgId || payload.id || payload.landlordId || null;
    } catch (err) {
      return null;
    }
  };

  const getAuthData = () => {
    const token = localStorage.getItem('orgToken');
    if (!token) return { token: null, orgId: null };
    const orgId = decodeJWT(token);
    return { token, orgId };
  };

  const { token, orgId: tokenOrgId } = getAuthData();
  const [orgId, setOrgId] = useState(tokenOrgId);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      toast.error("Please login as Organization");
      navigate('/organization/login');
    }
  }, [token, navigate]);

  // Fetch orgId from profile
  useEffect(() => {
    if (!token || orgId) return;

    const fetchOrgProfile = async () => {
      try {
        const res = await axios.get(`${ORG_API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedOrgId = res.data.organization?._id || res.data._id;
        setOrgId(fetchedOrgId);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrgProfile();
  }, [token, orgId]);

  // Fetch Organization Details
  useEffect(() => {
    if (!token || !orgId) return;

    const fetchOrgDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/org/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data;
        setLinkedLandlord(data);
        if (data?.regionIds?.length > 0) {
          setSelectedRegionId(data.regionIds[0]);
        }
      } catch (err) {
        toast.error('Failed to load organization details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrgDetails();
  }, [token, orgId]);

  // Fetch Regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/public/all`);
        setRegions(response.data.data || []);
      } catch (err) {
        toast.error('Failed to fetch regions');
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch Tenants
  useEffect(() => {
    if (!token) return;

    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${LANDLORD_API_BASE_URL}/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTenants(response.data.tenants || []);
      } catch (err) {
        toast.error('Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, [token]);

  // Fetch Assignments
  const fetchAssignments = async () => {
    if (!selectedRegionId || !orgId) {
      toast.error('Please select a region first');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/assignments-org/${orgId}/${selectedRegionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(response.data.data || []);
      setShowAssignments(true);
    } catch (err) {
      toast.error('Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelect = (tenantId) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId) ? prev.filter(id => id !== tenantId) : [...prev, tenantId]
    );
  };

  const handleAssignToTenants = async () => {
    if (selectedTenants.length === 0) {
      toast.error('Select at least one tenant');
      return;
    }
    if (!selectedRegionId || !orgId) {
      toast.error('Region or Organization not ready');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/assigntoorg/${orgId}/${selectedRegionId}`,
        { tenantIds: selectedTenants },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Assigned to ${response.data.assignedCount} tenant(s)`);

      setSelectedTenants([]);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAllTenants = async () => {
    if (!selectedRegionId || !orgId) {
      toast.error('Region or Organization not ready');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/send-alltoorg/${orgId}/${selectedRegionId}`,
        { assignToAll: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Assigned to all ${response.data.assignedCount} tenants`);
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign to all');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignments = () => {
    if (!showAssignments) fetchAssignments();
    else setShowAssignments(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="text-white text-xl font-semibold">Redirecting to Organization Login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-cyan-600 to-green-600 px-6 py-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaShieldAlt /> Police Verifications
            </h1>
          </div>

          <div className="p-6 sm:p-8 space-y-8">

            {/* Region Selection */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                <FaMapMarkerAlt className="text-indigo-600" /> Select Region
              </h2>

              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full p-4 border-2 border-indigo-300 rounded-xl shadow-sm"
              >
                <option value="">Choose a region...</option>
                {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={toggleAssignments}
                  disabled={!selectedRegionId}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 px-5 rounded-xl shadow-lg"
                >
                  {showAssignments ? "Hide Assigned" : "View Assigned"}
                </button>
              </div>

            </div>

            {/* ASSIGNMENTS SECTION — FULL UI */}
            {showAssignments && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-lg p-6">

                <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center gap-2">
                  <FaUserCheck /> Assigned Tenants
                </h2>

                {assignments.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">No assignments found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-purple-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Tenant</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Documents</th>
                          <th className="px-4 py-3 text-left">Last Updated</th>
                          <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignments.map((item) => (
                          <tr key={item._id}>

                            {/* TENANT */}
                            <td className="px-4 py-3">
                              <div className="font-bold">{item?.tenant?.name}</div>
                              <div className="text-sm text-gray-600">{item?.tenant?.mobile}</div>
                            </td>

                            {/* STATUS */}
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                                ${item.status === "under_review" ? "bg-yellow-100 text-yellow-800" :
                                  item.status === "verified" ? "bg-green-100 text-green-800" :
                                    "bg-red-100 text-red-800"}`}>
                                {item.status.replace("_", " ").toUpperCase()}
                              </span>
                            </td>

                            {/* DOCUMENT COUNT */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setSelectedTenantDocs(item.documents);
                                  setShowTenantDocsModal(true);
                                }}
                                className="px-3 py-1 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
                              >
                                View ({item.documents.length})
                              </button>
                            </td>

                            {/* DATE */}
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(item.updatedAt).toLocaleString()}
                            </td>

                            {/* ACTION BUTTONS */}
                            <td className="px-4 py-3">
                              <div className="flex gap-2">

                                {/* VIEW DETAILS */}
                                <button
                                  onClick={() => {
                                    setSelectedTenantDetails(item);
                                    setShowTenantModal(true);
                                  }}
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                  <FaEye />
                                </button>

                                {/* VIEW DOCS */}
                                <button
                                  onClick={() => {
                                    setSelectedTenantDocs(item.documents);
                                    setShowTenantDocsModal(true);
                                  }}
                                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                                >
                                  <FaFileAlt />
                                </button>

                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                )}

              </div>
            )}

            {/* === TENANT ASSIGNMENT AREA (unchanged, your original code) === */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                <FaUsers className="text-pink-600" /> Assign Document to Tenants
              </h2>

              <div className="bg-white rounded-xl shadow-inner p-4 mb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3"></th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map(t => {
                      const id = t.tenantId || t._id;
                      return (
                        <tr key={id}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedTenants.includes(id)}
                              onChange={() => handleTenantSelect(id)}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium">{t.name}</td>
                          <td className="px-4 py-3">{t.mobile}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <button
                  onClick={handleAssignToTenants}
                  className="bg-emerald-600 text-white py-4 px-6 rounded-xl shadow-lg"
                >
                  Assign to Selected
                </button>

                <button
                  onClick={handleSendToAllTenants}
                  className="bg-orange-600 text-white py-4 px-6 rounded-xl shadow-lg"
                >
                  Send to All Tenants
                </button>

              </div>

            </div>

          </div>
        </div>

        {/* --- DOCS MODAL (FULL FINAL) --- */}
        {showTenantDocsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative">

              <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
                <FaFileAlt /> Tenant Documents
              </h2>

              <div className="space-y-4 max-h-[350px] overflow-y-auto">

                {selectedTenantDocs?.map((doc) => (
                  <div key={doc._id} className="border p-3 rounded-lg shadow-sm bg-gray-50">
                    <div className="font-semibold">{doc.name}</div>

                    <img
                      src={`https://api.gharzoreality.com${doc.fileUrl}`}
                      alt="Document"
                      className="h-40 w-full object-cover rounded-lg mt-2 shadow"
                    />

                    <div className="text-xs text-gray-600 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                ))}

              </div>

              <button
                onClick={() => setShowTenantDocsModal(false)}
                className="mt-5 bg-red-500 text-white px-4 py-2 rounded-lg w-full font-bold"
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>

      <ToastContainer position="top-right" autoClose={4000} theme="light" />
    </div>
  );
};

export default OrgPoliceVerification;
