// PoliceVerification.jsx (Full updated working version)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaMapMarkerAlt, FaUserTie, FaUsers, FaSyncAlt, FaCheckCircle,
  FaExclamationTriangle, FaFileAlt, FaClock, FaUserCheck, FaImage,
  FaIdCard, FaPhone, FaEnvelope, FaMapPin, FaBirthdayCake, FaVenusMars,
  FaUniversity, FaRupeeSign, FaTimes, FaEye, FaChevronDown, FaChevronUp,
  FaEyeSlash, FaShieldAlt, FaExternalLinkAlt, FaDownload, FaThumbsUp,
  FaThumbsDown
} from 'react-icons/fa';

const API_BASE_URL = 'https://api.gharzoreality.com/api/verification';
const LANDLORD_API_BASE_URL = 'https://api.gharzoreality.com/api/landlord';
const BASE_IMAGE_URL = 'https://api.gharzoreality.com';

const PoliceVerification = () => {
  const navigate = useNavigate();
  const { verificationId } = useParams();
  const isViewMode = !!verificationId;

  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [linkedLandlord, setLinkedLandlord] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal states
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
  const [showTenantDocsModal, setShowTenantDocsModal] = useState(false);
  const [selectedTenantDocs, setSelectedTenantDocs] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [showFullLandlordDetails, setShowFullLandlordDetails] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVerificationId, setRejectingVerificationId] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');

  // auth info
const getAuthData = () => {
  const token = localStorage.getItem('token');
  return { token };
};

const { token } = getAuthData();

// landlordId comes ONLY from API
const [landlordId, setLandlordId] = useState(null);

useEffect(() => {
  const fetchLandlordProfile = async () => {
    try {
      const res = await fetch("https://api.gharzoreality.com/api/landlord/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data?.landlord?._id) {
        setLandlordId(data.landlord._id); // only set in state
      }
    } catch (error) {
      console.error("Failed to fetch landlord profile:", error);
    }
  };

  if (token) fetchLandlordProfile();
}, [token]);
  // if no token or invalid, redirect to login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch landlordId by calling the tenant endpoint (user requested)
  useEffect(() => {
    const fetchLandlordIdFromTenantAPI = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // The user asked specifically: use https://api.gharzoreality.com/api/landlord/tenant to get landlordId
        const res = await axios.get(`${LANDLORD_API_BASE_URL}/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Many APIs nest data differently; try a few fallbacks
        const data = res.data || {};
        // Try common shapes
        const maybeLandlordId =
          data.landlordId ||
          data.data?.landlordId ||
          data?.tenants?.[0]?.landlordId ||
          data?.tenants?.[0]?._id ||
          data?.tenants?.[0]?.landlord;

        if (maybeLandlordId) {
          setLandlordId(maybeLandlordId);
        } else {
          // If no landlordId returned, but tenants list exists, try to infer landlord id from tenant entries (if any)
          if (Array.isArray(data.tenants) && data.tenants.length > 0) {
            // maybe tenant object contains landlordId
            const fallback = data.tenants[0].landlordId || data.tenants[0].landlord;
            if (fallback) setLandlordId(fallback);
          }
        }
      } catch (err) {
        console.warn('Could not fetch landlordId from tenant API:', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    // call only if not in view mode (if view mode we may use verification path)
    fetchLandlordIdFromTenantAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch verification or landlord details (on reload or when verificationId/landlordId becomes available)
  // useEffect(() => {
  //   const fetchVerificationDetailsOnReload = async () => {
  //     const effectiveId = landlordId;
  //     if (!effectiveId || !token) return;
  //     try {
  //       console.log(effectiveId)
  //       setLoading(true);
  //       const response = await axios.get(`${API_BASE_URL}/${effectiveId}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = response.data?.data || response.data;
  //       if (verificationId) {
  //         setVerificationData(data);
  //       } else {
  //         setLinkedLandlord(data);
  //       }
  //       // set region selection from returned data if available
  //       if (!isViewMode && data?.regionId) {
  //         const regionId = typeof data.regionId === 'object' ? data.regionId._id : data.regionId;
  //         setSelectedRegionId(regionId);
  //       }
  //       if (!isViewMode && data?.regionIds?.length > 0) {
  //         setSelectedRegionId(data.regionIds[0]._id || '');
  //       }
  //     } catch (err) {
  //       console.error('Failed to auto-fetch details:', err?.response?.data || err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchVerificationDetailsOnReload();
  // }, [token, landlordId, verificationId, isViewMode]);

  // Fetch regions for selection (public)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/public/all`);
        setRegions(response.data?.data || []);
      } catch (err) {
        toast.error('Failed to fetch regions');
      } finally {
        setLoading(false);
      }
    };
    if (!isViewMode) fetchRegions();
  }, [isViewMode]);

  // Fetch tenants list (for assign UI)
  useEffect(() => {
    const fetchTenants = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await axios.get(`${LANDLORD_API_BASE_URL}/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Accept multiple response shapes
        const tenantsList = response.data?.tenants || response.data?.data || response.data;
        if (Array.isArray(tenantsList)) setTenants(tenantsList);
        else setTenants([]);
      } catch (err) {
        toast.error('Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    };
    if (!isViewMode) fetchTenants();
  }, [token, isViewMode]);

  // Fetch assignments for landlord in selected region
  const fetchAssignments = async () => {
    if (!selectedRegionId || !landlordId) {
      toast.error('Please select a region first');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/assignments/${landlordId}/${selectedRegionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(response.data?.data || []);
      setShowAssignments(true);
    } catch (err) {
      toast.error('Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkLandlord = async () => {
    if (isViewMode || !selectedRegionId) {
      toast.error('Please select a region');
      return;
    }
    if (!token) {
      toast.error('Not authenticated');
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/linkedLandlords`,
        { regionId: selectedRegionId },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      toast.success('Landlord linked to region successfully');
      // refresh landlord details
      fetchLandlordDetails();
    } catch (err) {
      toast.error('Failed to link landlord to region');
    } finally {
      setLoading(false);
    }
  };

  const fetchLandlordDetails = async () => {
    if (isViewMode || !landlordId) return;
    try {
    console.log("landlordId",landlordId     )
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${landlordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("wertyuiop")
      setLinkedLandlord(response.data?.data || response.data);
    } catch (err) {
      toast.error('Failed to fetch landlord details');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignments = () => {
    if (!showAssignments) fetchAssignments();
    else setShowAssignments(false);
  };

  const getRegionName = (region) => {
    if (!region) return 'N/A';
    if (Array.isArray(region)) return region.map(r => typeof r === 'object' ? `${r.name} (${r.code})` : r).join(', ');
    if (typeof region === 'object') return `${region.name} (${region.code || ''})`;
    return region;
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.tenantId === tenantId || t._id === tenantId);
    return tenant ? `${tenant.name} (${tenant.mobile || tenant.email || 'Unnamed'})` : tenantId;
  };

  const getDocumentInfo = (docs) => {
    if (!docs || docs.length === 0) return { count: 0, types: [] };
    const typeCounts = docs.reduce((acc, doc) => {
      acc[doc.name] = (acc[doc.name] || 0) + 1;
      return acc;
    }, {});
    return { count: docs.length, types: Object.entries(typeCounts).map(([n, c]) => `${n} (${c})`).join(', ') };
  };

  const getStatusBadge = (status) => {
    const styles = {
      under_review: 'bg-orange-100 text-orange-800',
      verified: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const cls = styles[status] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{(status || 'N/A').replace('_', ' ').toUpperCase()}</span>;
  };

  // Render document card used in modals/tables
  const renderDocumentCard = (doc, index, verificationIdParam = null, isUnderReview = false) => {
    const fileUrl = doc.fileUrl || doc.url || doc.path || '';
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_IMAGE_URL}${fileUrl}`;
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
    return (
      <div key={index} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-gray-800 truncate max-w-[240px]">{doc.name || doc.type || 'Document'}</h4>
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs"><FaDownload /></a>
        </div>
        {isImage ? (
          <img src={fullUrl} alt={doc.name} className="w-full h-32 object-cover rounded-lg cursor-pointer" onClick={() => { setSelectedImageUrl(fullUrl); setShowImageModal(true); }} />
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center"><FaFileAlt className="text-4xl text-gray-400" /></div>
        )}
        {isUnderReview && verificationIdParam && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => handleApprove(verificationIdParam)} className="flex-1 bg-green-600 text-white py-1.5 rounded text-xs"><FaThumbsUp className="inline mr-1" />Approve</button>
            <button onClick={() => { setRejectingVerificationId(verificationIdParam); setShowRejectModal(true); }} className="flex-1 bg-red-600 text-white py-1.5 rounded text-xs"><FaThumbsDown className="inline mr-1" />Reject</button>
          </div>
        )}
      </div>
    );
  };

  // Approve verification
  const handleApprove = async (id) => {
    if (!token) { toast.error('Not authenticated'); return; }
    try {
      setLoading(true);
      // TODO: update to correct endpoint if different
      await axios.post(`${API_BASE_URL}/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Verification approved');
      // refresh assignments view if visible
      fetchAssignments();
    } catch (err) {
      toast.error('Approve failed');
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reject verification with remark
  const handleReject = async (id, remark) => {
    if (!token) { toast.error('Not authenticated'); return; }
    if (!remark || remark.trim().length < 3) {
      toast.error('Please provide a reject remark (min 3 chars)');
      return;
    }
    try {
      setLoading(true);
      // TODO: update to correct endpoint if different
      await axios.post(`${API_BASE_URL}/reject/${id}`, { remark }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Verification rejected');
      setShowRejectModal(false);
      setRejectRemark('');
      // refresh assignments
      fetchAssignments();
    } catch (err) {
      toast.error('Reject failed');
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Row click => show details modal for assignment
  const handleRowClick = async (assignmentId) => {
    if (!assignmentId) return;
    const assignment = assignments.find(a => a._id === assignmentId) || assignments.find(a => a.assignmentId === assignmentId);
    if (!assignment) {
      toast.error('Assignment not found');
      return;
    }
    // Show tenant details in modal (fetch tenant details if needed)
    const tenantId = assignment.tenantId;
    setSelectedTenantDetails({ ...assignment, tenantInfo: tenants.find(t => t.tenantId === tenantId || t._id === tenantId) });
    setShowTenantModal(true);
  };

  // Open tenant docs modal - fetch tenant documents if needed
  const handleViewTenantDocs = async (tenantId) => {
    if (!tenantId) return;
    // try to find tenant from loaded tenants
    const tenant = tenants.find(t => t.tenantId === tenantId || t._id === tenantId);
    if (tenant && tenant.documents) {
      setSelectedTenantDocs(tenant.documents);
      setShowTenantDocsModal(true);
      return;
    }
    // otherwise, fetch docs from API
    try {
      setLoading(true);
      const res = await axios.get(`${LANDLORD_API_BASE_URL}/tenant/${tenantId}/docs`, { headers: { Authorization: `Bearer ${token}` } });
      const docs = res.data?.data || res.data;
      setSelectedTenantDocs(Array.isArray(docs) ? docs : []);
      setShowTenantDocsModal(true);
    } catch (err) {
      toast.error('Failed to fetch tenant documents');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelect = (id) => {
    setSelectedTenants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Assign to selected tenants
const handleAssignSelected = async () => {
  if (!landlordId) { toast.error('Landlord not found'); return; }
  if (!selectedRegionId) { toast.error('Select a region'); return; }
  if (!selectedTenants || selectedTenants.length === 0) { toast.error('Select at least one tenant'); return; }

  try {
    setLoading(true);

    const payload = {
      tenantIds: selectedTenants,
    };

    const url = `${API_BASE_URL}/assign/${landlordId}/${selectedRegionId}`;

    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success('Assigned to selected tenants');
    fetchAssignments();

  } catch (err) {
    console.error('Assign selected failed', err?.response?.data || err.message);
    toast.error('Assign failed');
  } finally {
    setLoading(false);
  }
};
  // Assign to all tenants (send to all)
  const handleAssignAll = async () => {
    if (!landlordId) { toast.error('Landlord not found'); return; }
    if (!selectedRegionId) { toast.error('Select a region'); return; }
    try {
      setLoading(true);
      // gather all tenant ids currently loaded
      const allTenantIds = tenants.map(t => t.tenantId || t._id).filter(Boolean);
      if (allTenantIds.length === 0) { toast.error('No tenants to assign'); return; }
      const payload = {
        landlordId,
        regionId: selectedRegionId,
        tenantIds: allTenantIds,
      };
      await axios.post(`${API_BASE_URL}/send-all/${landlordId}/${selectedRegionId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Assigned to all tenants');
      // refresh assignments
      fetchAssignments();
    } catch (err) {
      console.error('Assign all failed', err?.response?.data || err.message);
      toast.error('Assign all failed');
    } finally {
      setLoading(false);
    }
  };

  // small helper to render documents arrays safely
  const DocumentsGrid = ({ docs = [], underReviewForId = null }) => {
    if (!docs || docs.length === 0) return <p className="text-sm text-gray-500">No documents.</p>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {docs.map((d, i) => renderDocumentCard(d, i, underReviewForId, underReviewForId !== null))}
      </div>
    );
  };

  // If token missing, show redirect UI
  if (!token) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-xl">Redirecting to login...</div>;
  }

  const currentData = verificationData || linkedLandlord;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-cyan-600 to-green-600 px-6 sm:px-8 py-5 sm:py-6 text-white">
            <div className="flex items-center space-x-4">
              <FaShieldAlt className="text-3xl sm:text-4xl" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Police Verifications</h1>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Region Selection */}
            {!isViewMode && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FaMapMarkerAlt className="text-2xl text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Select Region</h2>
                </div>
                {loading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div></div>}
                {!loading && (
                  <>
                    <select value={selectedRegionId} onChange={(e) => setSelectedRegionId(e.target.value)}
                      className="w-full p-4 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 shadow-sm text-gray-800 font-medium transition-all">
                      <option value="">Choose a region...</option>
                      {regions.map(r => <option key={r._id} value={r._id}>{r.name} ({r.code})</option>)}
                    </select>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      <button onClick={handleLinkLandlord} disabled={!selectedRegionId || loading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-5 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center space-x-2">
                        <FaUserTie className="text-lg" /><span>Link Landlord</span>
                      </button>
                      <button onClick={fetchLandlordDetails} disabled={!selectedRegionId || loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-5 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center space-x-2">
                        <FaSyncAlt className="text-lg" /><span>Refresh Details</span>
                      </button>
                      <button onClick={toggleAssignments} disabled={!selectedRegionId || loading}
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 px-5 rounded-xl font-bold hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center space-x-2 col-span-1 sm:col-span-2 lg:col-span-1">
                        {showAssignments ? <><FaEyeSlash className="text-lg" /><span>Hide Assigned</span></> : <><FaUserCheck className="text-lg" /><span>View Assigned</span></>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Landlord Details */}
            {currentData && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <FaUserTie className="text-2xl text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">Linked Landlord Profile</h2>
                  </div>
                  <button onClick={() => setShowFullLandlordDetails(!showFullLandlordDetails)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center space-x-2">
                    {showFullLandlordDetails ? <><FaChevronUp /><span>Collapse</span></> : <><FaChevronDown /><span>Expand</span></>}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-5 rounded-xl shadow-md">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Landlord Name</p>
                    <p className="text-lg font-bold text-gray-900">{currentData.name}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-md">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Region</p>
                    <p className="text-lg font-bold text-gray-900">{getRegionName(currentData.regionIds || currentData.regionId)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <div className="bg-white p-5 rounded-xl shadow-md text-center">
                    <FaImage className="text-5xl text-indigo-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-3">Profile Photo</p>
                    {currentData.profilePhoto ? (
                      <img src={`${BASE_IMAGE_URL}${currentData.profilePhoto}`} alt="Profile" className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-emerald-300" />
                    ) : <p className="text-sm text-gray-500">No profile photo</p>}
                  </div> */}
                  {currentData.regionIds?.[0]?.documentUrl ? (
                    <div className="bg-white p-5 rounded-xl shadow-md text-center">
                      <FaFileAlt className="text-5xl text-purple-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-3">Region Document</p>
                      <img src={`${BASE_IMAGE_URL}${currentData.regionIds[0].documentUrl}`} alt="Region Doc" className="w-full h-40 object-cover rounded-lg cursor-pointer" onClick={() => { setSelectedImageUrl(`${BASE_IMAGE_URL}${currentData.regionIds[0].documentUrl}`); setShowImageModal(true); }} />
                    </div>
                  ) : null}
                </div>
                {showFullLandlordDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <div className="flex items-center space-x-2 mb-1"><FaPhone className="text-lg text-emerald-600" /><p className="text-sm font-semibold text-gray-600">Mobile</p></div>
                      <p className="text-base font-bold text-gray-900">{currentData.mobile || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <div className="flex items-center space-x-2 mb-1"><FaEnvelope className="text-lg text-emerald-600" /><p className="text-sm font-semibold text-gray-600">Email</p></div>
                      <p className="text-base font-bold text-gray-900">{currentData.email || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <div className="flex items-center space-x-2 mb-1"><FaMapPin className="text-lg text-emerald-600" /><p className="text-sm font-semibold text-gray-600">Address</p></div>
                      <p className="text-base font-bold text-gray-900">{currentData.address || 'N/A'}</p>
                    </div>
                    {/* add other landlord fields as needed */}
                  </div>
                )}
              </div>
            )}

            {/* Assigned Tenants Table */}
            {showAssignments && assignments.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FaUserCheck className="text-2xl text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Assigned Tenants ({assignments.length})</h2>
                  </div>
                  <button onClick={() => setShowAssignments(false)} className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-md flex items-center space-x-2">
                    <FaEyeSlash /><span>Hide</span>
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl shadow-inner">
                  <table className="min-w-full divide-y divide-purple-200">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tenant</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Docs Assigned</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tenant Docs</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Updated</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.map((a) => {
                        const docInfo = getDocumentInfo(a.documents);
                        const tenantDocInfo = getDocumentInfo(a.tenantdocuments || []);
                        return (
                          <tr key={a._id} className="hover:bg-purple-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-indigo-900 cursor-pointer hover:text-purple-700" onClick={() => handleRowClick(a._id)}>{getTenantName(a.tenantId)}</td>
                            <td className="px-4 py-3 text-sm">{getStatusBadge(a.status)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{docInfo.count} docs</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{tenantDocInfo.count} docs</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(a.updatedAt || a.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); handleViewTenantDocs(a.tenantId); }} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"><FaExternalLinkAlt className="text-xs" /><span>Docs</span></button>
                                {a.status === 'under_review' && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); handleApprove(a._id); }} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"><FaThumbsUp className="text-xs" /><span>Approve</span></button>
                                    <button onClick={(e) => { e.stopPropagation(); setRejectingVerificationId(a._id); setShowRejectModal(true); }} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"><FaThumbsDown className="text-xs" /><span>Reject</span></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={fetchAssignments} className="mt-5 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-5 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center space-x-2">
                  <FaSyncAlt /><span>Refresh Assignments</span>
                </button>
              </div>
            )}

            {/* Assign to Tenants */}
            {!isViewMode && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FaUsers className="text-2xl text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-900">Assign Document to Tenants</h2>
                </div>
                <div className="bg-white rounded-xl shadow-inner p-4 mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-pink-600 to-purple-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          <input type="checkbox" className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500" onChange={(e) => setSelectedTenants(e.target.checked ? tenants.map(t => t.tenantId || t._id) : [])} checked={selectedTenants.length === tenants.length && tenants.length > 0} />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tenants.map((t) => {
                        const tid = t.tenantId || t._id;
                        const selected = selectedTenants.includes(tid);
                        return (
                          <tr key={tid} className={selected ? 'bg-pink-100' : ''}>
                            <td className="px-4 py-3"><input type="checkbox" className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500" checked={selected} onChange={() => handleTenantSelect(tid)} /></td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{t.mobile || t.email || 'N/A'}</td>
                            <td className="px-4 py-3"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-xl mb-6 text-center">
                  <p className="text-lg font-bold text-indigo-800">Selected: <span className="text-purple-700">{selectedTenants.length}</span> tenant{selectedTenants.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={handleAssignSelected} disabled={selectedTenants.length === 0 || loading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center space-x-2">
                    <FaUsers className="text-lg" /><span>Assign to Selected</span>
                  </button>
                  <button onClick={handleAssignAll} disabled={tenants.length === 0 || loading}
                    className="bg-gradient-to-r from-orange-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:from-orange-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center space-x-2">
                    <FaShieldAlt className="text-lg" /><span>Send to All Tenants</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- MODALS ---- */}

        {/* Tenant Details Modal */}
        {showTenantModal && selectedTenantDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
              <button onClick={() => setShowTenantModal(false)} className="absolute top-4 right-4 text-gray-500"><FaTimes /></button>
              <h3 className="text-xl font-bold mb-3">Tenant Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-bold">{selectedTenantDetails.tenantInfo?.name || selectedTenantDetails.tenantName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-bold">{selectedTenantDetails.tenantInfo?.mobile || selectedTenantDetails.tenantInfo?.email || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Documents</p>
                  <div className="mt-2">
                    <DocumentsGrid docs={selectedTenantDetails.tenantdocuments || selectedTenantDetails.documents || []} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Docs Modal */}
        {showTenantDocsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 relative">
              <button onClick={() => setShowTenantDocsModal(false)} className="absolute top-4 right-4 text-gray-500"><FaTimes /></button>
              <h3 className="text-xl font-bold mb-3">Tenant Documents</h3>
              <div className="mt-4">
                <DocumentsGrid docs={selectedTenantDocs || []} />
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-w-4xl w-full">
              <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 z-50 text-white text-2xl"><FaTimes /></button>
              <img src={selectedImageUrl} alt="Preview" className="w-full h-auto rounded-xl shadow-xl" />
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
              <button onClick={() => { setShowRejectModal(false); setRejectRemark(''); }} className="absolute top-4 right-4 text-gray-500"><FaTimes /></button>
              <h3 className="text-xl font-bold mb-3">Reject Verification</h3>
              <p className="text-sm text-gray-600 mb-3">Provide a remark explaining why this verification is being rejected.</p>
              <textarea value={rejectRemark} onChange={(e) => setRejectRemark(e.target.value)} rows={4} className="w-full border rounded p-3 mb-4" placeholder="Enter remark..."></textarea>
              <div className="flex gap-3">
                <button onClick={() => handleReject(rejectingVerificationId, rejectRemark)} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>
                <button onClick={() => { setShowRejectModal(false); setRejectRemark(''); }} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" className="mt-16" />
    </div>
  );
};

export default PoliceVerification;
