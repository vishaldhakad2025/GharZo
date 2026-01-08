import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faBuilding, faSave, faCog, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom"; // <-- ADDED

function PropertyManagerCreate() {
  const navigate = useNavigate(); // <-- ADDED

  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Token not found! </strong>
          <span className="block sm:inline">Please login first.</span>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    properties: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [allProperties, setAllProperties] = useState([]);
  const [organizationId, setOrganizationId] = useState('');
  const [regionalManagerId, setRegionalManagerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Aadhaar states
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  // Mobile validation
  const [mobileError, setMobileError] = useState("");

  const validateMobile = (number) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  const handleMobileChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const value = raw.slice(0, 10);

    setFormData(prev => ({ ...prev, mobile: value }));

    if (value.length === 10) {
      if (!validateMobile(value)) {
        setMobileError("Invalid mobile number. Must start with 6-9 and be 10 digits.");
      } else {
        setMobileError("");
      }
    } else {
      setMobileError("Mobile number must be 10 digits.");
    }
  };

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchSelfCreatedProperties = async () => {
    try {
      const response = await fetch('https://api.gharzoreality.com/api/rm/properties', {
        method: 'GET',
        headers: headers
      });
      if (response.ok) {
        const data = await response.json();
        return data.properties || [];
      } else {
        throw new Error('Failed to fetch self-created properties');
      }
    } catch (error) {
      console.error('Error fetchSelfCreatedProperties:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error fetching self-created properties',
      });
      return [];
    }
  };

  const generateOtp = async (e) => {
    e.preventDefault();

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Aadhaar',
        text: 'Valid 12-digit Aadhaar number is required',
      });
      return;
    }

    try {
      const response = await fetch('https://api.gharzoreality.com/api/kyc/aadhaar/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber }),
      });

      const res = await response.json();

      if (res.success) {
        setTxnId(res.txnId);
        setShowOtpInput(true);

        Swal.fire({
          icon: 'success',
          title: 'OTP Generated',
          text: res.message,
        });

        setOtpTimer(30);
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to generate OTP',
        });
      }

    } catch (error) {
      console.error('OTP generation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error generating OTP',
      });
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid OTP',
        text: 'Valid 6-digit OTP is required',
      });
      return;
    }
    if (!txnId) return;
    try {
      const response = await fetch('https://api.gharzoreality.com/api/kyc/aadhaar/submit-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txnId, otp }),
      });
      const res = await response.json();
      if (res.success) {
        const data = res.data;
        if (!formData.name) {
          setFormData((prev) => ({ ...prev, name: data.full_name || prev.name }));
        } else if (formData.name.toUpperCase() !== (data.full_name || '').toUpperCase()) {
          Swal.fire({
            icon: 'warning',
            title: 'Name Mismatch',
            text: `Form (${formData.name}) vs Aadhaar (${data.full_name}). Using form name.`,
          });
        }
        setAadhaarVerified(true);
        setShowOtpInput(false);
        setOtp('');
        Swal.fire({
          icon: 'success',
          title: 'Verified',
          text: res.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to verify OTP',
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error verifying OTP',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const profileResponse = await fetch('https://api.gharzoreality.com/api/regional-managers/profile', {
          method: 'GET',
          headers: headers
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileJson = await profileResponse.json();
        const data = profileJson.data;

        const permMap = {
          canViewWorkers: data.permissions?.canViewWorkers || false,
          canCreateWorker: data.permissions?.canCreateWorker || false,
          canUpdateWorker: data.permissions?.canUpdateWorker || false,
          canDeleteWorker: data.permissions?.canDeleteWorker || false,
          canAssignWorker: data.permissions?.canAssignWorker || false,
          canAssignTasksToWorkers: data.permissions?.canAssignTasksToWorkers || false,
          canAddTenant: data.permissions?.canManageTenants || false,
          canUpdateTenant: data.permissions?.canManageTenants || false,
          canRemoveTenant: data.permissions?.canManageTenants || false,
          canViewTenantDetails: data.permissions?.canViewTenantDetails || false,
          canAllocateRoom: data.permissions?.canManageTenants || false,
          canChangeRoom: data.permissions?.canManageTenants || false,
          canViewOccupancy: data.permissions?.canViewTenantDetails || false,
          canAddComplaint: data.permissions?.canManageMaintenance || false,
          canViewComplaints: data.permissions?.canManageMaintenance || false,
          canUpdateComplaint: data.permissions?.canManageMaintenance || false,
          canCollectRent: data.permissions?.canUpdateCollections || false,
          canViewCollections: data.permissions?.canViewFinancials || false,
          canUpdatePayments: data.permissions?.canUpdateCollections || false,
          canCreateMaintenanceRequest: data.permissions?.canManageMaintenance || false,
          canUpdateMaintenanceRequest: data.permissions?.canManageMaintenance || false,
          canCloseMaintenanceRequest: data.permissions?.canApproveMaintenanceRequests || false,
          canViewMaintenance: data.permissions?.canManageMaintenance || false,
          canSendNotifications: data.permissions?.canSendNotifications || false,
          canContactTenants: data.permissions?.canContactTenants || false,
          canContactWorkers: data.permissions?.canViewWorkers || false,
          canViewPropertyReports: data.permissions?.canViewReports || false,
          canGenerateCustomReports: data.permissions?.canViewReports || false,
          canViewAssignedProperties: data.permissions?.canAssignPropertyToManager || false
        };
        setPermissions(permMap);

        const fetchedOrgId = data.organizationId || '';
        const fetchedRmId = data.id || '';
        setOrganizationId(fetchedOrgId);
        setRegionalManagerId(fetchedRmId);

        const assigned = data.properties || [];
        const selfCreated = await fetchSelfCreatedProperties();

        const combined = [...assigned, ...selfCreated];
        const uniqueProps = combined.filter((prop, idx, arr) => 
          idx === arr.findIndex(p => p._id === prop._id)
        );

        setAllProperties(uniqueProps);
      } catch (err) {
        console.error('Error in loadData:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error loading profile data',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleProperty = (id) => {
    const stringId = String(id);
    setFormData(prev => {
      let newProps;
      if (prev.properties.includes(stringId)) {
        newProps = prev.properties.filter(p => p !== stringId);
      } else {
        newProps = [...prev.properties, stringId];
      }
      return { ...prev, properties: newProps };
    });
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaarVerified) {
      Swal.fire({
        icon: 'error',
        title: 'Aadhaar Required',
        text: 'Aadhaar verification is required!',
      });
      return;
    }

    if (!formData.mobile || formData.mobile.length !== 10 || !validateMobile(formData.mobile)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Mobile',
        text: 'Please enter a valid 10-digit mobile number starting with 6-9.',
      });
      return;
    }

    if (!organizationId || !regionalManagerId) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Missing organization or regional manager details. Please reload.',
      });
      return;
    }
    if (formData.properties.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Property Selected',
        text: 'Please assign at least one property.',
      });
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      aadhaar: aadhaarNumber,
      properties: formData.properties,
      organizationId,
      regionalManagerId,
      role: "property_manager",
      permissions
    };

    try {
      const response = await fetch('https://api.gharzoreality.com/api/property-managers', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resJson = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: resJson.message || 'Property manager created successfully.',
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          mobile: '',
          password: '',
          properties: []
        });
        setAadhaarNumber('');
        setOtp('');
        setTxnId(null);
        setShowOtpInput(false);
        setAadhaarVerified(false);

        // REDIRECT HERE
        navigate("/regional_manager/team_management/view_managers");

      } else {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.message || 'Failed to create property manager';
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errMsg
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to create property manager',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const permissionKeys = Object.keys(permissions);
  const enabledPermissionsCount = Object.values(permissions).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <FontAwesomeIcon icon={faUser} className="text-red-500 hover:animate-spin transition-transform duration-500" />
            Create Property Manager
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-red-500" />
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                placeholder="Enter full name"
              />
            </div>
            <div className="relative">
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-teal-500" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                placeholder="Enter email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="mobile" className="block mb-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
                Mobile
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleMobileChange}
                required
                maxLength={10}
                className={`w-full p-4 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 ${mobileError ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Enter 10 digit mobile number"
              />
              {mobileError && (
                <p className="text-red-600 text-sm mt-2">{mobileError}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-purple-500" />
                Aadhaar Verification
              </label>
              {!aadhaarVerified ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      placeholder="Enter 12-digit Aadhaar Number"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={12}
                      className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={generateOtp}
                      disabled={!aadhaarNumber || aadhaarNumber.length !== 12 || otpTimer > 0}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-xl font-medium transition duration-300 transform hover:scale-105"
                    >
                      {otpTimer > 0 ? `Wait ${otpTimer}s` : 'Generate OTP'}
                    </button>
                  </div>
                  {showOtpInput && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 6}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-xl font-medium transition duration-300 transform hover:scale-105"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-100 rounded-xl border border-green-300">
                  <span className="text-green-600 font-medium flex items-center">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Aadhaar Verified Successfully
                  </span>
                  <span className="text-sm text-gray-500">({aadhaarNumber})</span>
                </div>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-purple-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 pl-12 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-4 text-lg font-semibold text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
              Assigned Properties
            </label>
            {loading ? (
              <p className="text-gray-500">Loading properties...</p>
            ) : allProperties.length === 0 ? (
              <p className="text-gray-500">No properties available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allProperties.map(prop => {
                  const isSelected = formData.properties.includes(String(prop._id));
                  return (
                    <button
                      key={prop._id}
                      type="button"
                      onClick={() => toggleProperty(prop._id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 border text-left ${
                        isSelected
                          ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-md'
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {prop.name}<br />
                      <span className="text-xs">{prop.address}, {prop.city}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-4 text-lg font-semibold text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faCog} className="text-purple-500" />
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {permissionKeys.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePermission(key)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    permissions[key]
                      ? 'bg-green-500 text-white shadow-lg hover:shadow-green-400'
                      : 'bg-orange-400 text-white shadow-md hover:shadow-orange-300 opacity-50'
                  }`}
                >
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Total Permissions Enabled: <span className="font-semibold text-green-600">{enabledPermissionsCount}</span> / {permissionKeys.length}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300 shadow-lg"
            disabled={submitting || loading || !aadhaarVerified}
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Create Property Manager
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PropertyManagerCreate;