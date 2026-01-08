// TenantPoliceVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaShieldAlt,
  FaUserTie,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaCloudUploadAlt,
} from 'react-icons/fa';

const API_BASE_URL = 'https://api.gharzoreality.com/api/verification';
const TENANT_API_BASE_URL = 'https://api.gharzoreality.com/api/tenant'; // Assuming tenant profile endpoint base
const FILE_BASE_URL = 'https://api.gharzoreality.com';

const TenantPoliceVerification = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState([]);
  const [tenantId, setTenantId] = useState(null); // State for tenantId fetched from profile
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedDocName, setSelectedDocName] = useState('Aadhar');
  const [selectedFile, setSelectedFile] = useState(null);

  // Common document types
  const documentTypes = [
    { value: 'Aadhar', label: 'Aadhar Card' },
    { value: 'PAN', label: 'PAN Card' },
    { value: 'Passport', label: 'Passport' },
    { value: 'Driving License', label: 'Driving License' },
    { value: 'Voter ID', label: 'Voter ID' },
  ];

  // Decode JWT from token (fallback, but we'll fetch profile instead)
  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id; // Fallback if profile fetch fails
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  // Fetch tenant profile to get tenantId
  const fetchTenantProfile = async (token) => {
    if (!token) return null;
    try {
      const response = await axios.get(`${TENANT_API_BASE_URL}/profile`, { // Adjust endpoint if needed, e.g., /tenant/profile
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        return response.data.tenant.tenantId; // Extract tenantId from profile response
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch tenant profile:', err);
      // Fallback to JWT decode
      return decodeJWT(token);
    }
  };

  // Fetch police verifications
  const fetchVerifications = async (token, fetchedTenantId) => {
    if (!token || !fetchedTenantId) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/tenant/${fetchedTenantId}/police-verification`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVerifications(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
      setError(err.response?.data?.message || 'Failed to fetch police verification records');
    } finally {
      setLoading(false);
    }
  };

  // Initial setup: Get token and fetch profile
  useEffect(() => {
    const token = localStorage.getItem('tenanttoken');
    if (!token) {
      navigate('/tenant-login'); // Adjust route as needed
      return;
    }

    const init = async () => {
      const fetchedTenantId = await fetchTenantProfile(token);
      if (!fetchedTenantId) {
        navigate('/tenant-login');
        return;
      }
      setTenantId(fetchedTenantId);
    };

    init();
  }, [navigate]);

  // Fetch verifications once tenantId is available
  useEffect(() => {
    const token = localStorage.getItem('tenanttoken');
    if (tenantId && token) {
      fetchVerifications(token, tenantId);
    }
  }, [tenantId]);

  // Handle document upload/reupload
  const handleUploadDocument = async (verificationId) => {
    if (!selectedDocName || !selectedFile || !tenantId) {
      setError('Please select a document type and file');
      return;
    }

    const formData = new FormData();
    formData.append('name', selectedDocName);
    formData.append('document', selectedFile);
    formData.append('tenantId', tenantId); // Use the fetched tenantId

    try {
      setUploadLoading(true);
      setError('');
      setMessage('');
      const token = localStorage.getItem('tenanttoken');
      const response = await axios.post(
        `${API_BASE_URL}/tenant/reupload/${verificationId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage(response.data.message || 'Document uploaded successfully');
      setSelectedDocName('Aadhar');
      setSelectedFile(null);
      // Refetch verifications to update the list
      await fetchVerifications(token, tenantId);
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
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

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-green-600 to-cyan-700 px-8 py-6 text-white">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-3xl" />
              <div>
                <h1 className="text-3xl font-bold">Police Verification</h1>
                
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {(message || error) && (
              <div
                className={`rounded-xl p-4 shadow-lg ${
                  message ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {message && (
                  <div className="flex items-center space-x-3 text-green-700">
                    <FaCheckCircle className="text-xl" />
                    <span className="font-medium">{message}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center space-x-3 text-red-700">
                    <FaExclamationTriangle className="text-xl" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}
              </div>
            )}

            {verifications.length === 0 && !loading && (
              <div className="text-center py-12">
                <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No verifications</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by checking your assignments.</p>
              </div>
            )}

            {verifications.map((verification) => (
              <div key={verification.verificationId} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FaUserTie className="text-2xl text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">{verification.region}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(verification.status)}
                    {verification.remarks && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Remarks: {verification.remarks}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Landlord</p>
                    <p className="text-lg font-bold text-gray-900">{verification.landlord.name}</p>
                    <p className="text-sm text-gray-500">{verification.landlord.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Created At</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </p>
                    {verification.verifiedAt && (
                      <p className="text-sm text-green-600">Verified: {new Date(verification.verifiedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Assigned Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FaFileAlt className="text-blue-600" />
                    <span>Assigned Documents ({verification.documents.length})</span>
                  </h3>
                  {verification.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {verification.documents.map((doc, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                            <a
                              href={`${FILE_BASE_URL}${doc.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <FaDownload className="w-4 h-4" />
                              <span>Download</span>
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Uploaded by: {doc.uploadedBy === 'Tenant' ? 'You' : doc.uploadedBy}</p>
                          <p className="text-xs text-gray-500">At: {new Date(doc.uploadedAt).toLocaleString()}</p>
                          {doc.fileUrl && (doc.fileUrl.endsWith('.png') || doc.fileUrl.endsWith('.jpg') || doc.fileUrl.endsWith('.jpeg')) && (
                            <img
                              src={`${FILE_BASE_URL}${doc.fileUrl}`}
                              alt={doc.name}
                              className="mt-2 w-full h-32 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No documents assigned yet.</p>
                  )}
                </div>

                {/* Tenant Documents Upload Form */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FaCloudUploadAlt className="text-purple-600" />
                    <span>Upload Document</span>
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                        <select
                          value={selectedDocName}
                          onChange={(e) => setSelectedDocName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={uploadLoading}
                        >
                          {documentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={uploadLoading}
                        />
                        {selectedFile && (
                          <p className="text-xs text-gray-500 mt-1">{selectedFile.name}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUploadDocument(verification.verificationId)}
                      disabled={!selectedDocName || !selectedFile || uploadLoading}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FaCloudUploadAlt className="w-4 h-4" />
                      <span>{uploadLoading ? 'Uploading...' : 'Upload Document'}</span>
                    </button>
                  </div>
                </div>

                {/* Tenant Documents */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FaFileAlt className="text-green-600" />
                    <span>Your Uploaded Documents ({verification.tenantdocuments.length})</span>
                  </h3>
                  {verification.tenantdocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {verification.tenantdocuments.map((doc, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">{doc.name}</span>
                            <a
                              href={`${FILE_BASE_URL}${doc.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                            >
                              <FaDownload className="w-4 h-4" />
                              <span>Download</span>
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Uploaded by: {doc.uploadedBy === 'Tenant' ? 'You' : doc.uploadedBy}</p>
                          {doc.uploadedAt && (
                            <p className="text-xs text-gray-500">At: {new Date(doc.uploadedAt).toLocaleString()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No documents uploaded yet. Please upload the required documents above for verification.</p>
                  )}
                </div>

                {verification.policeReportUrl && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Police Report</p>
                    <a
                      href={`${FILE_BASE_URL}${verification.policeReportUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaDownload className="w-4 h-4" />
                      <span>Download Police Report</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantPoliceVerification;