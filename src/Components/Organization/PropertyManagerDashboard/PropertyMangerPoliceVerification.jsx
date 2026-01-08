// PoliceVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaMapMarkerAlt,
  FaUserTie,
  FaUsers,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaClock,
  FaUserCheck,
  FaImage,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaMapPin,
  FaBirthdayCake,
  FaVenusMars,
  FaUniversity,
  FaRupeeSign,
  FaTimes,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaEyeSlash,
  FaShieldAlt,
  FaExternalLinkAlt, // New icon for View Docs button
  FaDownload, // Icon for download link
  FaThumbsUp, // Icon for approve
  FaThumbsDown, // Icon for reject
} from 'react-icons/fa';

const API_BASE_URL = 'https://api.gharzoreality.com/api/verification';
const LANDLORD_API_BASE_URL = 'https://api.gharzoreality.com/api/landlord';
const BASE_IMAGE_URL = 'https://api.gharzoreality.com';

const PoliceVerification = () => {
  const navigate = useNavigate();
  const { verificationId } = useParams(); // Dynamic ID from URL params
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [linkedLandlord, setLinkedLandlord] = useState(null);
  const [verificationData, setVerificationData] = useState(null); // New state for dynamic verification details
  const [tenants, setTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [assignments, setAssignments] = useState([]); // New state for fetched assignments
  const [loading, setLoading] = useState(false);
  const isViewMode = !!verificationId; // Determine if in view mode for dynamic ID

  // New: Modal state for tenant details
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
  const [tenantLoading, setTenantLoading] = useState(false);

  // New: Tenant Docs Modal (for the specific API call)
  const [showTenantDocsModal, setShowTenantDocsModal] = useState(false);
  const [selectedTenantDocs, setSelectedTenantDocs] = useState(null); // Now {data, tenantId}
  const [tenantDocsLoading, setTenantDocsLoading] = useState(false);

  // New: Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // New: State for landlord details expansion
  const [showFullLandlordDetails, setShowFullLandlordDetails] = useState(false);

  // New: State for assignments list visibility
  const [showAssignments, setShowAssignments] = useState(false);

  // New: State for reject form in modal
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');

  // New: State for table reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVerificationId, setRejectingVerificationId] = useState(null);

  // NEW: Force show review section for debugging (toggle)
  const [forceShowReview, setForceShowReview] = useState(true); // Set to true to always show

  // Decode JWT from token to get landlordId
  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  const getAuthData = () => {
    const token = localStorage.getItem('token');
    const landlordId = token ? decodeJWT(token) : null;
    return { token, landlordId };
  };

  const { token, landlordId } = getAuthData();

  // Redirect to login if no token or landlordId (skip in view mode if token present)
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!isViewMode && !landlordId) {
      navigate('/login');
      return;
    }
  }, [token, landlordId, navigate, isViewMode]);

  // ✅ Fetch verification details on reload/mount (supports dynamic ID)
  useEffect(() => {
    const fetchVerificationDetailsOnReload = async () => {
      const effectiveId = verificationId || landlordId;
      if (!effectiveId || !token) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/${effectiveId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (verificationId) {
          setVerificationData(data); // Set for dynamic view
        } else {
          setLinkedLandlord(data); // Set for landlord management
        }

        // Auto-select regionId if not in view mode
        if (!isViewMode && data?.regionId) {
          const regionId = typeof data.regionId === 'object' ? data.regionId._id : data.regionId;
          setSelectedRegionId(regionId);
        }
        // Prefer regionIds[0] if available
        if (!isViewMode && data?.regionIds?.length > 0) {
          setSelectedRegionId(data.regionIds[0]._id);
        }
        toast.success('Details loaded successfully');
      } catch (err) {
        console.error('Failed to auto-fetch details:', err);
        toast.error('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchVerificationDetailsOnReload();
  }, [token, landlordId, verificationId]); // Depend on dynamic ID too

  // Fetch all regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/public/all`);
        setRegions(response.data.data || []);
        toast.success('Regions fetched successfully');
      } catch (err) {
        toast.error('Failed to fetch regions');
      } finally {
        setLoading(false);
      }
    };
    if (!isViewMode) { // Skip in view mode
      fetchRegions();
    }
  }, [isViewMode]);

  // Fetch all tenants
  useEffect(() => {
    const fetchTenants = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await axios.get(`${LANDLORD_API_BASE_URL}/tenant`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTenants(response.data.tenants || []);
        toast.success('Tenants fetched successfully');
      } catch (err) {
        toast.error('Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    };
    if (!isViewMode) { // Skip in view mode
      fetchTenants();
    }
  }, [token, isViewMode]);

  // New: Fetch tenant-specific documents using the tenant API endpoint
  const fetchTenantSpecificDocs = async (tenantId) => {
    if (!tenantId) return;
    try {
      setTenantDocsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/tenant/${tenantId}/police-verification`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Using landlord token - adjust if needed for tenant token
          },
        }
      );
      console.log('Tenant Specific Docs Response:', response.data); // DEBUG LOG
      if (response.data.success && response.data.data.length > 0) {
        const data = response.data.data[0];
        // Fix: Ensure _id is set for consistency in approve/reject calls
        if (data.verificationId && !data._id) {
          data._id = data.verificationId;
        }
        setSelectedTenantDocs({ data, tenantId }); // Store data and tenantId
        toast.success('Tenant documents fetched successfully');
      } else {
        toast.error('No tenant documents found');
      }
    } catch (err) {
      console.error('Failed to fetch tenant specific docs:', err);
      toast.error('Failed to fetch tenant documents');
    } finally {
      setTenantDocsLoading(false);
    }
  };

  // New: Fetch assignments for the selected region
  const fetchAssignments = async () => {
    if (!selectedRegionId || !landlordId) {
      toast.error('Please select a region first');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/assignments/${landlordId}/${selectedRegionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssignments(response.data.data || []);
      console.log('Assignments fetched:', response.data.data); // DEBUG LOG
      toast.success(`Fetched ${response.data.count || 0} assigned tenants successfully`);
      setShowAssignments(true); // Show the list after fetch
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      toast.error('Failed to fetch assigned tenants');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // New: Toggle assignments visibility
  const toggleAssignments = async () => {
    if (!showAssignments) {
      await fetchAssignments();
    } else {
      setShowAssignments(false);
    }
  };

  // New: Fetch full tenant details for modal (using verificationId)
  const fetchTenantDetails = async (verificationIdParam) => {
    if (!verificationIdParam) return;
    try {
      setTenantLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${verificationIdParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      console.log('Tenant Details API Response:', data); // DEBUG LOG: Check full response
      console.log('Status:', data.status); // DEBUG: Status
      console.log('Tenant Documents:', data.documents); // DEBUG: tenantdocuments array (changed to documents)
      setSelectedTenantDetails(data);
      toast.success('Tenant details fetched successfully');
    } catch (err) {
      console.error('Failed to fetch tenant details:', err);
      toast.error('Failed to fetch tenant details');
    } finally {
      setTenantLoading(false);
    }
  };

  // Handle row click to show tenant details (fixed: pass verificationId)
  const handleRowClick = async (verificationIdParam) => {
    console.log('Clicked verificationId:', verificationIdParam); // DEBUG LOG
    await fetchTenantDetails(verificationIdParam);
    setShowTenantModal(true);
  };

  // New: Handle "View Tenant Docs" click
  const handleViewTenantDocs = async (tenantId) => {
    console.log('View Tenant Docs for tenantId:', tenantId); // DEBUG LOG
    await fetchTenantSpecificDocs(tenantId);
    setShowTenantDocsModal(true);
  };

  // Handle image click to open enlarged modal
  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  // New: Handle approve verification
  const handleApprove = async (verificationIdParam) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/landlord/review/${verificationIdParam}`,
        { action: 'approve' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(response.data.message);
      // Refetch assignments to update table
      if (!isViewMode) {
        await fetchAssignments();
      }
      // Refetch tenant details if modal is open
      if (showTenantModal && selectedTenantDetails?._id === verificationIdParam) {
        await fetchTenantDetails(verificationIdParam);
      }
      // Refetch tenant docs if modal is open
      if (showTenantDocsModal && selectedTenantDocs?.data?._id === verificationIdParam) {
        await fetchTenantSpecificDocs(selectedTenantDocs.tenantId);
      }
      // Refetch main data if viewing this verification
      if (verificationId === verificationIdParam) {
        // Trigger re-fetch by changing a key or call directly
        setVerificationData(null);
        // Re-run the useEffect by dependency
      }
    } catch (err) {
      console.error('Failed to approve verification:', err);
      toast.error(err.response?.data?.message || 'Failed to approve verification');
    }
  };

  // New: Handle reject verification
  const handleReject = async (verificationIdParam, remark) => {
    if (!remark.trim()) {
      toast.error('Please enter a remark for rejection');
      return;
    }
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/landlord/review/${verificationIdParam}`,
        { action: 'reject', remark },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(response.data.message);
      setShowRejectModal(false);
      setRejectRemark('');
      setRejectingVerificationId(null);
      // Refetch assignments to update table
      if (!isViewMode) {
        await fetchAssignments();
      }
      // Refetch tenant details if modal is open
      if (showTenantModal && selectedTenantDetails?._id === verificationIdParam) {
        await fetchTenantDetails(verificationIdParam);
      }
      // Refetch tenant docs if modal is open
      if (showTenantDocsModal && selectedTenantDocs?.data?._id === verificationIdParam) {
        await fetchTenantSpecificDocs(selectedTenantDocs.tenantId);
      }
      // Refetch main data if viewing this verification
      if (verificationId === verificationIdParam) {
        setVerificationData(null);
      }
    } catch (err) {
      console.error('Failed to reject verification:', err);
      toast.error(err.response?.data?.message || 'Failed to reject verification');
    }
  };

  // Link landlord to selected region
  const handleLinkLandlord = async () => {
    if (isViewMode) return; // Disable in view mode
    if (!selectedRegionId) {
      toast.error('Please select a region');
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/linkedLandlords`,
        { regionId: selectedRegionId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Landlord linked to region successfully');
      await fetchLandlordDetails();
    } catch (err) {
      toast.error('Failed to link landlord to region');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch landlord details manually or after linking (management only)
  const fetchLandlordDetails = async () => {
    if (isViewMode) return; // Disable in view mode
    if (!selectedRegionId) {
      toast.error('Please select a region first');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${landlordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      setLinkedLandlord(data);
      if (data?.regionId) {
        const regionId = typeof data.regionId === 'object' ? data.regionId._id : data.regionId;
        setSelectedRegionId(regionId);
      }
      if (data?.regionIds?.length > 0) {
        setSelectedRegionId(data.regionIds[0]._id);
      }
      toast.success('Landlord details fetched successfully');
    } catch (err) {
      toast.error('Failed to fetch landlord details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch verification details manually (for view mode refresh)
  const fetchVerificationDetails = async () => {
    if (!verificationId || !token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${verificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      setVerificationData(data);
      toast.success('Verification details refreshed successfully');
    } catch (err) {
      toast.error('Failed to fetch verification details');
    } finally {
      setLoading(false);
    }
  };

  // Assign document to selected tenants
  const handleAssignToTenants = async () => {
    if (isViewMode) return; // Disable in view mode
    if (!selectedRegionId || selectedTenants.length === 0) {
      toast.error('Please select a region and at least one tenant');
      return;
    }
    try {
      setLoading(true);
      const tenantIds = selectedTenants;
      const response = await axios.post(
        `${API_BASE_URL}/assign/${landlordId}/${selectedRegionId}`,
        { tenantIds },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Region document assigned successfully to selected tenants');
      setSelectedTenants([]);
      console.log('Assignment data:', response.data.data);
      // Optionally refetch assignments after assign
      await fetchAssignments();
    } catch (err) {
      toast.error('Failed to assign region document to tenants');
    } finally {
      setLoading(false);
    }
  };

  // Send to all tenants
  const handleSendToAllTenants = async () => {
    if (isViewMode) return; // Disable in view mode
    if (!selectedRegionId) {
      toast.error('Please select a region');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/send-all/${landlordId}/${selectedRegionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { message: apiMessage, assignedCount } = response.data;
      toast.success(`${apiMessage} (${assignedCount} tenants)`);
      setSelectedTenants([]);
      // Optionally refetch assignments after send-all
      await fetchAssignments();
    } catch (err) {
      toast.error('Failed to send region document to all tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelect = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedIds = options.map((option) => option.value);
    setSelectedTenants(selectedIds);
  };

  // Helper to get region name (updated to handle arrays and strings/objects)
  const getRegionName = (region) => {
    if (!region) return 'N/A';
    if (Array.isArray(region)) {
      return region.map((r) => {
        if (typeof r === 'string') return r;
        if (r.name) return `${r.name} (${r.code || ''})`;
        const found = regions.find((reg) => reg._id === r._id);
        return found ? `${found.name} (${found.code})` : 'Unknown';
      }).join(', ');
    }
    if (typeof region === 'string') return region;
    if (typeof region === 'object' && region.name) {
      return `${region.name} (${region.code || ''})`;
    }
    const r = regions.find((r) => r._id === region);
    return r ? `${r.name} (${r.code})` : 'N/A';
  };

  // Helper to get tenant name from tenants list (matching by tenantId)
  const getTenantName = (tenantId) => {
    const tenant = tenants.find((t) => t.tenantId === tenantId || t._id === tenantId);
    return tenant ? `${tenant.name} (${tenant.mobile || tenant.email || 'Unnamed Tenant'})` : tenantId;
  };

  // Helper to get document count and type
  const getDocumentInfo = (docs) => {
    if (!docs || docs.length === 0) return { count: 0, types: [] };
    const typeCounts = docs.reduce((acc, doc) => {
      acc[doc.name] = (acc[doc.name] || 0) + 1;
      return acc;
    }, {});
    return { count: docs.length, types: Object.entries(typeCounts).map(([name, count]) => `${name} (${count})`).join(', ') };
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    const badges = {
      under_review: { class: 'bg-yellow-100 text-yellow-800', icon: FaClock },
      verified: { class: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      rejected: { class: 'bg-red-100 text-red-800', icon: FaExclamationTriangle },
    };
    const badge = badges[status] || { class: 'bg-gray-100 text-gray-800', icon: FaClock };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Render Region Document Component (updated for dynamic data)
  const renderRegionDocument = (data, isLandlord = false) => {
    if (!data) return null;
    let documentUrl = null;
    if (Array.isArray(data.regionIds) && data.regionIds.length > 0) {
      documentUrl = data.regionIds[0].documentUrl;
    } else if (data.regionId) {
      documentUrl = typeof data.regionId === 'object' ? data.regionId.documentUrl : null;
    }
    if (!documentUrl) return null;
    const fullUrl = `${BASE_IMAGE_URL}${documentUrl}`;
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm text-center relative group">
        <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">{isLandlord ? 'Landlord Region Document' : 'Region Document'}</p>
        <div
          className="relative cursor-pointer"
          onClick={() => handleImageClick(fullUrl)}
        >
          <img
            src={fullUrl}
            alt="Region Document"
            className="w-full h-32 object-contain rounded-lg mx-auto border-2 border-green-200 group-hover:border-indigo-300 transition-colors"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <p className="text-xs text-gray-500 mt-2 hidden">Document not available</p>
          {/* Eye Icon Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
            <FaEye className="text-white text-2xl" />
          </div>
        </div>
      </div>
    );
  };

  // Close image modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowImageModal(false);
    }
  };

  // New helper: Render document card with error handling
  const renderDocumentCard = (doc, index, verificationIdParam = null, isUnderReview = false) => {
    const fullUrl = `${BASE_IMAGE_URL}${doc.fileUrl}`;
    const isImage = doc.fileUrl && doc.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i);
    return (
      <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{doc.name}</span>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
            download={doc.name}
          >
            <FaDownload />
            <span>Download</span>
          </a>
        </div>
        {isImage ? (
          <>
            <img
              src={fullUrl}
              alt={doc.name}
              className="w-full h-32 object-contain rounded cursor-pointer border"
              onClick={() => handleImageClick(fullUrl)}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <p className="text-xs text-red-500 mt-2 hidden">Failed to load image. Try downloading.</p>
          </>
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center border-dashed border-2 border-gray-300">
            <FaFileAlt className="text-2xl text-gray-400" />
            <p className="text-xs text-gray-500 ml-2">{doc.name} (Non-image file)</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedBy || 'Unknown'}</p>
        {isUnderReview && verificationIdParam && (
          <div className="flex space-x-2 mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => handleApprove(verificationIdParam)}
              className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 flex items-center justify-center space-x-1"
            >
              <FaThumbsUp className="text-xs" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => {
                setRejectingVerificationId(verificationIdParam);
                setRejectRemark('');
                setShowRejectModal(true);
              }}
              className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 flex items-center justify-center space-x-1"
            >
              <FaThumbsDown className="text-xs" />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    );
  }

  const currentData = verificationData || linkedLandlord; // Use verificationData in view mode, fallback to linkedLandlord
  const isActiveStatus = currentData?.isActive ?? true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-8 py-6 text-white">
            <div className="flex items-center space-x-3">
              <FaUserTie className="text-3xl" />
              <div>
                <h1 className="text-3xl font-bold">
                  {isViewMode ? 'Police Verification Details' : 'Police Verification Management'}
                </h1>
                <p className="text-blue-100 mt-1 opacity-90">
                  {isViewMode 
                    ? `Viewing details for ID: ${verificationId}` 
                    : 'Link regions to landlords and assign verification documents to tenants efficiently'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {!isViewMode ? (
              /* Region Selection - Management only */
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FaMapMarkerAlt className="text-2xl text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Select Region</h2>
                </div>

                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!loading && (
                  <>
                    <select
                      value={selectedRegionId}
                      onChange={(e) => setSelectedRegionId(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                      <option value="">Choose a region...</option>
                      {regions.map((region) => (
                        <option key={region._id} value={region._id}>
                          {region.name} ({region.code})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleLinkLandlord}
                      disabled={!selectedRegionId || loading}
                      className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg mb-4"
                    >
                      Link Landlord to Region
                    </button>

                    <button
                      onClick={fetchLandlordDetails}
                      disabled={!selectedRegionId || loading}
                      className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg mb-4"
                    >
                      <FaSyncAlt className="inline mr-2 text-sm" />
                      Get Linked Regions Details
                    </button>

                    {/* Toggle/Fetch Assignments Button */}
                    <button
                      onClick={toggleAssignments}
                      disabled={!selectedRegionId || loading}
                      className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      {showAssignments ? (
                        <>
                          <FaEyeSlash className="mr-2 text-sm" />
                          <span>View Less Assigned Tenants</span>
                        </>
                      ) : (
                        <>
                          <FaFileAlt className="mr-2 text-sm" />
                          <span>Fetch Assigned Tenants</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {/* ✅ Details Section - Always show if data available (landlord or dynamic verification) */}
            {currentData && (
              <div className={`border rounded-xl shadow-lg p-6 ${isViewMode ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <FaUserTie className={`text-2xl ${isViewMode ? 'text-blue-600' : 'text-green-600'}`} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isViewMode ? 'Verification Details' : 'Linked Landlord Details'}
                  </h2>
                </div>

                {/* Always Visible: Name, Region, and Document */}
                <div className="space-y-4 mb-6">
                  {/* Name Card */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 font-medium">Name</p>
                    <p className="text-lg font-bold text-gray-900">{currentData.name}</p>
                  </div>

                  {/* Region Card */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 font-medium">Region</p>
                    <p className="text-lg font-bold text-gray-900">
                      {getRegionName(currentData.regionIds || currentData.regionId)}
                    </p>
                  </div>

                  {/* Profile Photo and Region Document Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentData.profilePhoto && (
                      <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Profile Photo</p>
                        <img
                          src={`${BASE_IMAGE_URL}${currentData.profilePhoto}`}
                          alt="Profile"
                          className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-green-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2 hidden">Image not available</p>
                      </div>
                    )}
                    {renderRegionDocument(currentData, !isViewMode)}
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setShowFullLandlordDetails(!showFullLandlordDetails)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md mb-4"
                >
                  {showFullLandlordDetails ? (
                    <>
                      <FaChevronUp className="text-sm" />
                      <span>View Less</span>
                    </>
                  ) : (
                    <>
                      <FaChevronDown className="text-sm" />
                      <span>View More Details</span>
                    </>
                  )}
                </button>

                {/* Full Details Grid - Conditionally Rendered */}
                {showFullLandlordDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaPhone className="text-lg text-green-600" />
                        <p className="text-sm text-gray-600 font-medium">Mobile</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{currentData.mobile}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaEnvelope className="text-lg text-orange-600" />
                        <p className="text-sm text-gray-600 font-medium">Email</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{currentData.email}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaIdCard className="text-lg text-purple-600" />
                        <p className="text-sm text-gray-600 font-medium">Aadhaar Number</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{currentData.aadhaarNumber}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaMapPin className="text-lg text-indigo-600" />
                        <p className="text-sm text-gray-600 font-medium">Address</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {currentData.address}, {currentData.pinCode}, {currentData.state}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaIdCard className="text-lg text-red-600" />
                        <p className="text-sm text-gray-600 font-medium">PAN Number</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{currentData.panNumber}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaBirthdayCake className="text-lg text-pink-600" />
                        <p className="text-sm text-gray-600 font-medium">Date of Birth</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(currentData.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaVenusMars className="text-lg text-teal-600" />
                        <p className="text-sm text-gray-600 font-medium">Gender</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{currentData.gender}</p>
                    </div>
                    {currentData.bankAccount && (
                      <div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaUniversity className="text-lg text-gray-600" />
                          <p className="text-sm text-gray-600 font-medium">Bank Account</p>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">Holder: {currentData.bankAccount.accountHolderName}</p>
                          <p className="font-medium">Account: {currentData.bankAccount.accountNumber}</p>
                          <p className="font-medium">IFSC: {currentData.bankAccount.ifscCode}</p>
                          <p className="font-medium">Bank: {currentData.bankAccount.bankName} - {currentData.bankAccount.branchName}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaRupeeSign className="text-lg text-red-600" />
                        <p className="text-sm text-gray-600 font-medium">Total Outstanding</p>
                      </div>
                      <p className="text-lg font-bold text-red-600">
                        ₹{currentData.totalOutstanding?.toFixed(2) || 0}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaRupeeSign className="text-lg text-green-600" />
                        <p className="text-sm text-gray-600 font-medium">Total Collected</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        ₹{currentData.totalCollected?.toFixed(2) || 0}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaClock className="text-lg text-gray-600" />
                        <p className="text-sm text-gray-600 font-medium">Status</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{isActiveStatus ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={isViewMode ? fetchVerificationDetails : fetchLandlordDetails}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md"
                >
                  <FaSyncAlt className="text-sm" />
                  <span>{isViewMode ? 'Refresh Details' : 'Refresh Details'}</span>
                </button>
              </div>
            )}

            {!isViewMode && (
              /* Assigned Tenants Display - Management only */
              <>
                {/* New: Assigned Tenants Display - Conditionally Rendered */}
                {showAssignments && assignments.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <FaUserCheck className="text-2xl text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Assigned Tenants ({assignments.length})</h2>
                      </div>
                      <button
                        onClick={() => setShowAssignments(false)}
                        className="flex items-center space-x-2 bg-red-600 text-white py-1 px-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 text-sm"
                      >
                        <FaEyeSlash className="text-xs" />
                        <span>View Less</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents Assigned</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant Docs</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignments.map((assignment) => {
                            const docInfo = getDocumentInfo(assignment.documents);
                            const tenantDocInfo = getDocumentInfo(assignment.tenantdocuments || []); // Use tenantdocuments if available
                            const isUnderReview = assignment.status === 'under_review';
                            return (
                              <tr 
                                key={assignment._id} 
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => handleRowClick(assignment._id)}>
                                  {getTenantName(assignment.tenantId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {getStatusBadge(assignment.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {docInfo.count > 0 ? (
                                    <span title={docInfo.types}>{docInfo.count} docs ({docInfo.types})</span>
                                  ) : (
                                    'None'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {tenantDocInfo.count > 0 ? (
                                    <span title={tenantDocInfo.types}>{tenantDocInfo.count} docs</span>
                                  ) : (
                                    'None'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(assignment.updatedAt || assignment.createdAt).toLocaleDateString()} {/* Fallback to createdAt if needed */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click
                                        handleViewTenantDocs(assignment.tenantId);
                                      }}
                                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                                      title="View Tenant Documents"
                                    >
                                      <FaExternalLinkAlt className="text-xs" />
                                      <span>Docs</span>
                                    </button>
                                    {isUnderReview && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprove(assignment._id);
                                          }}
                                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                                          title="Approve Verification"
                                        >
                                          <FaThumbsUp className="text-xs" />
                                          <span>Approve</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setRejectingVerificationId(assignment._id);
                                            setRejectRemark('');
                                            setShowRejectModal(true);
                                          }}
                                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 flex items-center space-x-1"
                                          title="Reject Verification"
                                        >
                                          <FaThumbsDown className="text-xs" />
                                          <span>Reject</span>
                                        </button>
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
                    <button
                      onClick={fetchAssignments}
                      disabled={loading}
                      className="mt-4 flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md"
                    >
                      <FaSyncAlt className="text-sm" />
                      <span>Refresh Assignments</span>
                    </button>
                  </div>
                )}

                {/* Tenants Assignment - Management only */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FaUsers className="text-2xl text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Assign to Tenants</h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Tenants (Hold Ctrl/Cmd for multi-select)
                    </label>
                    <select
                      multiple
                      value={selectedTenants}
                      onChange={handleTenantSelect}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm h-64 bg-gray-50"
                      disabled={loading}
                    >
                      {tenants.length === 0 ? (
                        <option>No tenants found.</option>
                      ) : (
                        tenants.map((tenant) => (
                          <option key={tenant._id} value={tenant.tenantId}>
                            {tenant.name} ({tenant.mobile || tenant.email || 'Unnamed Tenant'})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="text-sm font-medium text-gray-600 mb-6 text-center bg-blue-50 p-3 rounded-lg">
                    Selected: {selectedTenants.length} tenants
                  </div>

                  <button
                    onClick={handleAssignToTenants}
                    disabled={!selectedRegionId || loading || selectedTenants.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg mb-2"
                  >
                    Assign Region Document to Selected Tenants
                  </button>

                  <button
                    onClick={handleSendToAllTenants}
                    disabled={!selectedRegionId || loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Assign Region Document to All Tenants
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tenant Details Modal */}
        {showTenantModal && selectedTenantDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Verification Details</h2>
                  <button
                    onClick={() => setShowTenantModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {tenantLoading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                )}
                {!tenantLoading && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium">Status: {getStatusBadge(selectedTenantDetails.status)}</p>
                      {selectedTenantDetails.remarks && (
                        <p className="text-sm text-red-600 mt-1">Remarks: {selectedTenantDetails.remarks}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Verification ID: {selectedTenantDetails.verificationId || selectedTenantDetails._id}</p>
                      <p className="text-sm text-gray-600">Region: {selectedTenantDetails.region}</p>
                      <p className="text-sm text-gray-600">Landlord: {selectedTenantDetails.landlord.name} ({selectedTenantDetails.landlord.email})</p>
                      <p className="text-sm text-gray-600">Created: {new Date(selectedTenantDetails.createdAt).toLocaleDateString()}</p>
                      {selectedTenantDetails.verifiedAt && (
                        <p className="text-sm text-gray-600">Verified: {new Date(selectedTenantDetails.verifiedAt).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Region/Landlord Documents */}
                    {selectedTenantDetails.documents && selectedTenantDetails.documents.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Region Documents ({selectedTenantDetails.documents.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedTenantDetails.documents.map((doc, index) => renderDocumentCard(doc, index))}
                        </div>
                      </div>
                    )}

                    {/* Tenant Documents */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tenant Documents ({selectedTenantDetails.tenantdocuments?.length || 0})</h3>
                      {selectedTenantDetails.tenantdocuments && selectedTenantDetails.tenantdocuments.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedTenantDetails.tenantdocuments.map((doc, index) => renderDocumentCard(doc, index, selectedTenantDetails._id, selectedTenantDetails.status === 'under_review'))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No documents uploaded by tenant.</p>
                      )}
                    </div>

                    {/* Review Section - Force show if debugging */}
                    {(selectedTenantDetails.status === 'under_review' || forceShowReview) && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="text-lg font-semibold mb-4">Review Verification</h3>
                        {selectedTenantDetails.status !== 'under_review' && (
                          <p className="text-sm text-yellow-700 mb-4">Status is not under review, but showing for debugging.</p>
                        )}
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleApprove(selectedTenantDetails._id)}
                            disabled={selectedTenantDetails.status !== 'under_review'}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <FaThumbsUp />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setShowRejectForm(!showRejectForm)}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <FaThumbsDown />
                            <span>{showRejectForm ? 'Cancel' : 'Reject'}</span>
                          </button>
                        </div>
                        {showRejectForm && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={rejectRemark}
                              onChange={(e) => setRejectRemark(e.target.value)}
                              placeholder="Enter reason for rejection..."
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                              rows={3}
                            />
                            <button
                              onClick={() => handleReject(selectedTenantDetails._id, rejectRemark)}
                              className="w-full bg-red-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-800 transition-all duration-300"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New: Tenant Docs Modal - From the specific API */}
        {showTenantDocsModal && selectedTenantDocs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Tenant Uploaded Documents</h2>
                  <button
                    onClick={() => setShowTenantDocsModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {tenantDocsLoading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                )}
                {!tenantDocsLoading && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium">Status: {getStatusBadge(selectedTenantDocs.data.status)}</p>
                      <p className="text-sm text-gray-600 mt-1">Verification ID: {selectedTenantDocs.data.verificationId || selectedTenantDocs.data._id}</p>
                      <p className="text-sm text-gray-600">Region: {selectedTenantDocs.data.region}</p>
                      <p className="text-sm text-gray-600">Landlord: {selectedTenantDocs.data.landlord.name} ({selectedTenantDocs.data.landlord.email})</p>
                    </div>

                    {/* Tenant Documents Grid - Fixed to use 'tenantdocuments' array */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Uploaded Documents ({selectedTenantDocs.data.tenantdocuments?.length || 0})</h3>
                      {selectedTenantDocs.data.tenantdocuments && selectedTenantDocs.data.tenantdocuments.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedTenantDocs.data.tenantdocuments.map((doc, index) => renderDocumentCard(doc, index, selectedTenantDocs.data._id, selectedTenantDocs.data.status === 'under_review'))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No documents uploaded by tenant.</p>
                      )}
                    </div>

                    {/* Also show landlord documents if available */}
                    {selectedTenantDocs.data.documents && selectedTenantDocs.data.documents.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Landlord/Region Documents ({selectedTenantDocs.data.documents.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedTenantDocs.data.documents.map((doc, index) => renderDocumentCard(doc, index))}
                        </div>
                      </div>
                    )}

                    {/* Review Section - Added for Tenant Docs Modal */}
                    {(selectedTenantDocs.data.status === 'under_review' || forceShowReview) && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="text-lg font-semibold mb-4">Review Verification</h3>
                        {selectedTenantDocs.data.status !== 'under_review' && (
                          <p className="text-sm text-yellow-700 mb-4">Status is not under review, but showing for debugging.</p>
                        )}
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleApprove(selectedTenantDocs.data._id)}
                            disabled={selectedTenantDocs.data.status !== 'under_review'}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <FaThumbsUp />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setShowRejectForm(!showRejectForm)}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <FaThumbsDown />
                            <span>{showRejectForm ? 'Cancel' : 'Reject'}</span>
                          </button>
                        </div>
                        {showRejectForm && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={rejectRemark}
                              onChange={(e) => setRejectRemark(e.target.value)}
                              placeholder="Enter reason for rejection..."
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                              rows={3}
                            />
                            <button
                              onClick={() => handleReject(selectedTenantDocs.data._id, rejectRemark)}
                              className="w-full bg-red-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-800 transition-all duration-300"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Reject Verification</h3>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectRemark('');
                      setRejectingVerificationId(null);
                    }}
                    className="text-white hover:text-gray-200"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReject(rejectingVerificationId, rejectRemark)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectRemark('');
                      setRejectingVerificationId(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New: Enlarged Image Modal */}
        {showImageModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 text-gray-800 text-2xl hover:text-gray-600 z-10 shadow-lg transition-all duration-200"
                aria-label="Close image"
              >
                <FaTimes />
              </button>
              <div 
                className="absolute inset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowImageModal(false);
                  }
                }}
                tabIndex={-1}
              />
              <img
                src={selectedImageUrl}
                alt="Enlarged Document"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-zoom-out"
                onError={(e) => {
                  setShowImageModal(false);
                  toast.error('Failed to load image');
                }}
              />
            </div>
          </div>
        )}

      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default PoliceVerification;