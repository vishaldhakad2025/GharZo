'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, Send, CheckCircle, AlertCircle, Building2, Users,
  Clock, FileCheck, FileX, Download, XCircle, Check, Eye, RefreshCw,
} from 'lucide-react';

export default function PropertyManagerPropertyDocuments() {
  /* ────────────────────── AUTH & DATA ────────────────────── */
  const [token, setToken] = useState('');
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [tenantsInProperty, setTenantsInProperty] = useState([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState([]);

  /* ────────────────────── FORM ────────────────────── */
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('Rental Agreement Form');
  const [description, setDescription] = useState('Tenant needs to fill and sign');
  const [sendToAll, setSendToAll] = useState(true);

  /* ────────────────────── UI ────────────────────── */
  const [loading, setLoading] = useState(false);
  const [fetchingProps, setFetchingProps] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  /* ────────────────────── DOCUMENTS LIST ────────────────────── */
  const [documents, setDocuments] = useState([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [docsError, setDocsError] = useState('');

  /* ────────────────────── REVIEW MODAL ────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedFilledFile, setSelectedFilledFile] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  /* ────────────────────── 1. GET TOKEN ────────────────────── */
  useEffect(() => {
    const t =
      localStorage.getItem('pm_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token');
    if (t) setToken(t);
    else setError('Login required. No token found.');
  }, []);

  /* ────────────────────── 2. LOAD PROPERTIES ────────────────────── */
  useEffect(() => {
    if (!token) return;
    const fetchProps = async () => {
      setFetchingProps(true);
      setError('');
      try {
        const res = await fetch('https://api.gharzoreality.com/api/pm/properties', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed');
        const list = Array.isArray(data) ? data : data.properties || data.data || [];
        setProperties(list);
        if (list[0]?._id) setSelectedProperty(list[0]._id);
      } catch (e) {
        setError(e.message);
      } finally {
        setFetchingProps(false);
      }
    };
    fetchProps();
  }, [token]);

  /* ────────────────────── 3. TENANTS IN SELECTED PROPERTY ────────────────────── */
  useEffect(() => {
    if (!selectedProperty) {
      setTenantsInProperty([]);
      return;
    }
    const prop = properties.find(p => p._id === selectedProperty);
    if (!prop) return;

    const tenants = [];
    const seen = new Set();
    prop.rooms.forEach(room =>
      room.beds.forEach(bed =>
        bed.tenants.forEach(t => {
          if (t.tenantId && !seen.has(t.tenantId)) {
            seen.add(t.tenantId);
            tenants.push({
              tenantId: t.tenantId,
              name: t.name,
              email: t.email || '',
              mobile: t.mobile || '',
            });
          }
        })
      )
    );
    setTenantsInProperty(tenants);
    setSelectedTenantIds([]);
  }, [selectedProperty, properties]);

  /* ────────────────────── 4. LOAD ALL SENT DOCUMENTS (FINAL - NEVER LOSES STATUS) ────────────────────── */
/* ────────────────────── 4. LOAD ALL SENT DOCUMENTS (NEVER LOSES STATUS) ────────────────────── */
const fetchAllDocs = async () => {
  if (!token) return;

  setFetchingDocs(true);
  setDocsError('');

  try {
    const res = await fetch('https://api.gharzoreality.com/api/pm/documents/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');

    const freshDocs = Array.isArray(data) ? data : data.documents || data.data || [];

    // Load local reviews from localStorage
    const localReviews = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('doc_review_')) {
        try {
          const docId = key.replace('doc_review_', '');
          localReviews[docId] = JSON.parse(localStorage.getItem(key));
        } catch (e) {}
      }
    }

    // Merge: Local review WINS over API
    setDocuments(freshDocs.map(freshDoc => {
      const local = localReviews[freshDoc._id];
      if (!local) return freshDoc;

      const merged = { ...freshDoc };

      if (local.sendToAll && local.review) {
        merged.review = local.review;
        merged.status = local.review.status;
      } else if (!local.sendToAll && local.filledFiles) {
        merged.filledFiles = (freshDoc.filledFiles || []).map(f => {
          const localFile = local.filledFiles.find(
            lf => lf.tenantId === f.uploadedBy?.tenantId
          );
          if (localFile?.review) {
            return { ...f, review: localFile.review };
          }
          return f;
        });
      }

      return merged;
    }));

  } catch (e) {
    setDocsError(e.message);
  } finally {
    setFetchingDocs(false);
  }
};

  useEffect(() => {
    if (token) fetchAllDocs();
  }, [token]);

  /* ────────────────────── PDF UPLOAD (only .pdf) ────────────────────── */
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else {
      setFile(null);
      setError('Only PDF files are allowed.');
      e.target.value = '';
    }
  };

  /* ────────────────────── TENANT CHECKBOX HELPERS ────────────────────── */
  const toggleTenant = (id) => {
    setSelectedTenantIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const selectAll = () => setSelectedTenantIds(tenantsInProperty.map(t => t.tenantId));
  const deselectAll = () => setSelectedTenantIds([]);

  /* ────────────────────── SUBMIT NEW DOCUMENT ────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    if (!token) return setError('Login required');
    if (!selectedProperty) return setError('Select a property');
    if (!file) return setError('Upload a PDF');
    if (!sendToAll && selectedTenantIds.length === 0)
      return setError('Select at least one tenant');

    setLoading(true);
    const fd = new FormData();
    fd.append('templateFile', file);
    fd.append('title', title.trim());
    fd.append('description', description.trim());
    fd.append('propertyId', selectedProperty);
    fd.append('sendToAll', sendToAll.toString());
    if (!sendToAll) fd.append('tenantIds', selectedTenantIds.join(','));

    try {
      const res = await fetch('https://api.gharzoreality.com/api/pm/documents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setResponse(data);
      setFile(null);
      setSelectedTenantIds([]);
      document.getElementById('pdf-upload').value = '';
      await fetchAllDocs();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────── OPEN REVIEW MODAL ────────────────────── */
  const openReview = (doc) => {
    setSelectedDoc(doc);
    setSelectedFilledFile(null);
    setReviewNote('');
    setReviewError('');
    setModalOpen(true);
  };

  /* ────────────────────── REVIEW: DOCUMENT-LEVEL (sendToAll:true) ────────────────────── */
  const reviewDocumentLevel = async (action) => {
    if (!selectedDoc) return;
    setReviewing(true);
    setReviewError('');
    try {
      const res = await fetch(
        `https://api.gharzoreality.com/api/pm/documents/${selectedDoc._id}/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            reviewNotes: reviewNote.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      return data;
    } catch (e) {
      setReviewError(e.message);
      throw e;
    } finally {
      setReviewing(false);
    }
  };

  /* ────────────────────── REVIEW: PER-TENANT (sendToAll:false) ────────────────────── */
  const reviewTenantLevel = async (action) => {
    if (!selectedDoc || !selectedFilledFile) {
      setReviewError('Select a tenant submission');
      return;
    }
    const tenantId = selectedFilledFile.uploadedBy?.tenantId;
    if (!tenantId) {
      setReviewError('Invalid tenant ID');
      return;
    }

    setReviewing(true);
    setReviewError('');
    try {
      const res = await fetch(
        `https://api.gharzoreality.com/api/pm/documents/${selectedDoc._id}/review/${tenantId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            reviewNotes: reviewNote.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      return data;
    } catch (e) {
      setReviewError(e.message);
      throw e;
    } finally {
      setReviewing(false);
    }
  };

  /* ────────────────────── SUBMIT REVIEW (PERSIST TO localStorage) ────────────────────── */
 const submitReview = async (action) => {
  if (!selectedDoc) return;

  try {
    let data;
    if (selectedDoc.sendToAll) {
      data = await reviewDocumentLevel(action);
    } else {
      data = await reviewTenantLevel(action);
    }

    // Save to localStorage
    const reviewKey = `doc_review_${selectedDoc._id}`;
    const localData = {
      sendToAll: selectedDoc.sendToAll,
      review: data?.review || {
        status: action,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "You",
      },
    };

    if (!selectedDoc.sendToAll && selectedFilledFile) {
      localData.filledFiles = selectedDoc.filledFiles.map(f => ({
        tenantId: f.uploadedBy?.tenantId,
        review: f.uploadedBy?.tenantId === data?.tenant?.tenantId
          ? localData.review
          : f.review
      }));
    }

    localStorage.setItem(reviewKey, JSON.stringify(localData));

    // Update UI
    setDocuments(prev => prev.map(doc => {
      if (doc._id !== selectedDoc._id) return doc;
      const updated = { ...doc };
      if (selectedDoc.sendToAll) {
        updated.status = action;
        updated.review = localData.review;
      } else {
        updated.filledFiles = updated.filledFiles.map(f => {
          if (f.uploadedBy?.tenantId === data?.tenant?.tenantId) {
            return { ...f, review: localData.review };
          }
          return f;
        });
      }
      return updated;
    }));

    setSelectedDoc(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (prev.sendToAll) {
        updated.status = action;
        updated.review = localData.review;
      } else {
        updated.filledFiles = updated.filledFiles.map(f => {
          if (f.uploadedBy?.tenantId === data?.tenant?.tenantId) {
            return { ...f, review: localData.review };
          }
          return f;
        });
      }
      return updated;
    });

  } catch (e) {
    setReviewError(e.message || 'Review failed');
  }
};
  /* ────────────────────── HELPERS ────────────────────── */
  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getDerivedStatus = (doc) => {
    if (!doc) return "pending";
    if (doc.review?.status) return doc.review.status.toLowerCase();
    if (doc.sendToAll && doc.status) return doc.status.toLowerCase();

    if (Array.isArray(doc.filledFiles) && doc.filledFiles.length > 0) {
      const reviewed = doc.filledFiles.filter(f => f.review?.status);
      const total = doc.filledFiles.length;
      if (reviewed.length === 0) return "submitted";
      if (reviewed.every(f => f.review.status === "accepted")) return "accepted";
      if (reviewed.some(f => f.review.status === "rejected")) return "rejected";
      if (reviewed.length < total) return "partial";
    }
    return "pending";
  };

  const statusBadge = (doc) => {
    const status = getDerivedStatus(doc);
    const badge = (icon, label, from, to) => (
      <div
        className="inline-flex items-center gap-2 px-5 py-2 text-base font-bold text-white bg-gradient-to-r rounded-full shadow-lg border"
        style={{ backgroundImage: `linear-gradient(to right, ${from}, ${to})` }}
      >
        {icon}
        {label}
      </div>
    );

    switch (status) {
      case "accepted": return badge(<Check className="w-5 h-5" />, "ACCEPTED", "#10b981", "#059669");
      case "rejected": return badge(<XCircle className="w-5 h-5" />, "REJECTED", "#ef4444", "#dc2626");
      case "submitted": return badge(<FileCheck className="w-5 h-5" />, "SUBMITTED", "#8b5cf6", "#7c3aed");
      case "partial": return badge(<Clock className="w-5 h-5" />, "PARTIAL", "#f59e0b", "#d97706");
      default: return badge(<Clock className="w-5 h-5" />, "PENDING", "#3b82f6", "#2563eb");
    }
  };

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50" />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">

            {/* Header */}
            <div className="px-7 py-7 text-white" style={{ backgroundImage: 'linear-gradient(to right, #2563eb, #22c55e)' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Send Document to Tenants</h1>
                  <p className="text-base text-white/90">Upload to Tenants fill & sign</p>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-7">

              {/* Global Error */}
              {error && (
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-base">
                  <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* ==== FORM ==== */}
              <form onSubmit={handleSubmit} className="space-y-7">

                {/* Property */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" /> Property <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProperty}
                    onChange={e => setSelectedProperty(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm text-base"
                    disabled={fetchingProps}
                    required
                  >
                    <option value="">-- Choose Property --</option>
                    {properties.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.address ? `— ${p.address}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">PDF Template <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-blue-200 rounded-xl p-10 text-center hover:border-green-400 bg-blue-50/30 hover:bg-green-50/30 transition-all cursor-pointer">
                    <input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="pdf-upload" className="cursor-pointer block">
                      {file ? (
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle className="w-14 h-14 text-green-600" />
                          <span className="font-bold text-gray-800 truncate max-w-xs text-lg">{file.name}</span>
                          <span className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-14 h-14 mx-auto text-blue-500" />
                          <p className="text-base font-bold text-gray-700">Click to upload PDF</p>
                          <p className="text-sm text-gray-500">Only .pdf files</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Instructions</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none bg-white shadow-sm text-base"
                  />
                </div>

                {/* Send to All */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                  <input
                    id="sendAll"
                    type="checkbox"
                    checked={sendToAll}
                    onChange={e => {
                      setSendToAll(e.target.checked);
                      if (e.target.checked) setSelectedTenantIds([]);
                    }}
                    className="w-6 h-6 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                  />
                  <label htmlFor="sendAll" className="text-base font-semibold text-gray-700 cursor-pointer select-none">
                    Send to <span className="text-green-600 font-bold">all tenants</span> in property
                  </label>
                </div>

                {/* Tenant List */}
                {!sendToAll && tenantsInProperty.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-green-50">
                    <div className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
                      <span className="text-base font-semibold text-gray-600">
                        {selectedTenantIds.length} / {tenantsInProperty.length} selected
                      </span>
                      <div className="flex gap-4 text-base font-medium">
                        <button type="button" onClick={selectAll} className="text-blue-600 hover:text-blue-700">Select All</button>
                        <button type="button" onClick={deselectAll} className="text-red-600 hover:text-red-700">Clear</button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {tenantsInProperty.map(t => (
                        <label
                          key={t.tenantId}
                          className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-white/70 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTenantIds.includes(t.tenantId)}
                            onChange={() => toggleTenant(t.tenantId)}
                            className="w-6 h-6 text-blue-600 rounded border-blue-300"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-base">
                              {t.name}
                              <span className="ml-2 text-sm text-gray-500">({t.tenantId})</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {t.email} {t.email && t.mobile && ' | '} {t.mobile}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !file || !selectedProperty || !token || (!sendToAll && selectedTenantIds.length === 0)}
                  className={`w-full py-5 rounded-xl text-lg font-bold text-white flex items-center justify-center gap-3 transition-all shadow-xl ${
                    loading || !file || !selectedProperty || !token || (!sendToAll && selectedTenantIds.length === 0)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'hover:from-blue-700 hover:to-green-700 active:scale-95'
                  }`}
                  style={{
                    backgroundImage:
                      loading || !file || !selectedProperty || !token || (!sendToAll && selectedTenantIds.length === 0)
                        ? undefined
                        : 'linear-gradient(to right, #2563eb, #22c55e)',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send to {sendToAll ? 'All Tenants' : `${selectedTenantIds.length} Tenant(s)`}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Success */}
              {response?.success && (
                <div className="mt-8 p-7 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 text-green-800 font-bold mb-3 text-lg">
                    <CheckCircle className="w-7 h-7" />
                    Document sent successfully!
                  </div>
                  <div className="text-base text-gray-700 space-y-2">
                    <p><strong>ID:</strong> <code className="bg-white px-3 py-1 rounded text-sm font-mono border">{response.document._id}</code></p>
                    <p><strong>Status:</strong> {statusBadge(response.document)}</p>
                    <p><strong>Recipients:</strong> <span className="text-blue-600 font-bold">{response.document.tenants?.length || 0}</span> tenant(s)</p>
                  </div>
                </div>
              )}

              {/* Sent Documents */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-blue-600" />
                    Sent Documents
                  </h2>
                  <button 
                    onClick={fetchAllDocs} 
                    disabled={fetchingDocs}
                    className="text-base text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className={`w-5 h-5 ${fetchingDocs ? 'animate-spin' : ''}`} />
                    {fetchingDocs ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {fetchingDocs && (
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-700 text-base">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading documents...
                  </div>
                )}

                {docsError && (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-base">{docsError}</div>
                )}

                {!fetchingDocs && documents.length === 0 && (
                  <div className="p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500">
                    <FileX className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-xl font-bold">No documents sent yet</p>
                    <p className="text-base mt-2">Send your first document using the form above</p>
                  </div>
                )}

                <div className="grid gap-6">
                  {documents.map(doc => {
                    const hasPending = doc.filledFiles?.some(f => !f.review?.status) || false;

                    return (
                      <div
                        key={doc._id}
                        onClick={() => hasPending && openReview(doc)}
                        className={`p-7 bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all cursor-pointer group backdrop-blur-sm ${
                          hasPending ? 'hover:border-blue-300' : 'opacity-90 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {doc.title}
                          </h3>
                          <div className="flex-shrink-0">{statusBadge(doc)}</div>
                        </div>

                        {doc.description && (
                          <p className="text-base text-gray-600 italic mb-5 line-clamp-2">"{doc.description}"</p>
                        )}

                        <div className="flex flex-wrap gap-5 text-sm text-gray-600 mb-5">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{formatDate(doc.createdAt)}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{doc.tenants?.length || 0} tenant(s)</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-500" />
                            <span className="font-medium truncate max-w-xs">
                              {properties.find(p => p._id === doc.property)?.name || '—'}
                            </span>
                          </span>
                        </div>

                        {doc.filledFiles?.length > 0 && (
                          <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-2 text-base font-bold text-green-700">
                              <FileCheck className="w-5 h-5" />
                              {doc.filledFiles.filter(f => f.review?.status === 'accepted').length} accepted • {doc.filledFiles.filter(f => !f.review?.status).length} pending
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-500">
                            {hasPending ? 'Click to review pending submissions' : 'All submissions reviewed'}
                          </span>
                          {hasPending && (
                            <button
                              onClick={e => { e.stopPropagation(); openReview(doc); }}
                              className="text-base text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                              Review Document
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== REVIEW MODAL ==================== */}
        {modalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="p-7 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Document Review
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <XCircle className="w-7 h-7" />
                  </button>
                </div>
              </div>

              <div className="p-7 space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Title</div>
                    <div className="font-medium text-gray-900">{selectedDoc.title}</div>
                  </div>
                  {selectedDoc.description && (
                    <div>
                      <div className="font-semibold text-gray-700 mb-2">Instructions</div>
                      <div className="text-gray-600">{selectedDoc.description}</div>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Status</div>
                    {statusBadge(selectedDoc)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Sent on</div>
                    <div className="text-gray-900">{formatDate(selectedDoc.createdAt)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="font-semibold text-gray-700 mb-2">Sent by</div>
                    <div className="text-gray-900">
                      {selectedDoc.createdBy?.name} ({selectedDoc.createdBy?.email})
                    </div>
                  </div>
                </div>

                {selectedDoc.sendToAll && selectedDoc.filledFiles?.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-medium text-gray-700">All tenants submitted the same file.</p>
                    {selectedDoc.filledFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium">{f.uploadedBy?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{formatDate(f.uploadedAt)}</p>
                        </div>
                        <a
                          href={`https://api.gharzoreality.com${f.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {!selectedDoc.sendToAll && selectedDoc.filledFiles?.length > 0 && (
                  <div className="space-y-4">
                    {selectedDoc.filledFiles
                      .filter(f => !f.review?.status)
                      .map((f, i) => {
                        const tenantId = f.uploadedBy?.tenantId;
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                            <label className="flex items-center gap-4 p-5 hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name="filledFile"
                                checked={selectedFilledFile?.uploadedBy?.tenantId === tenantId}
                                onChange={() => setSelectedFilledFile(f)}
                                className="w-5 h-5 text-blue-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {f.uploadedBy?.name || 'Unknown Tenant'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {f.uploadedBy?.email} • {tenantId}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">{formatDate(f.uploadedAt)}</p>
                                  </div>
                                </div>
                              </div>
                              <a
                                href={`https://api.gharzoreality.com${f.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                                onClick={e => e.stopPropagation()}
                              >
                                <Download className="w-4 h-4" />
                                View
                              </a>
                            </label>
                          </div>
                        );
                      })}

                    {selectedDoc.filledFiles.every(f => f.review?.status) && (
                      <div className="p-6 text-center bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-600" />
                        <p className="text-lg font-semibold text-green-800">All submissions reviewed!</p>
                      </div>
                    )}
                  </div>
                )}

                {(selectedDoc.sendToAll || selectedFilledFile) && (
                  <div className="pt-5 border-t border-gray-200">
                    <div className="mb-5">
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Review Note (optional)
                      </label>
                      <textarea
                        rows={4}
                        value={reviewNote}
                        onChange={e => setReviewNote(e.target.value)}
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white shadow-sm text-base"
                        placeholder="Add any comments..."
                      />
                    </div>

                    {reviewError && (
                      <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-base mb-4">
                        {reviewError}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => submitReview('accept')}
                        disabled={reviewing}
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50"
                      >
                        {reviewing ? (
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="w-6 h-6" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => submitReview('reject')}
                        disabled={reviewing}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50"
                      >
                        {reviewing ? (
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-6 h-6" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </>
  );
}