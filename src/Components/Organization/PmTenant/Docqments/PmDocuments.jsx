// DocumentsPage.jsx   (pure React + JavaScript)
import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  FileText,
  Users,
  Calendar,
  User,
  AlertCircle,
  Lock,
  Upload,
  X,
  CheckCircle,
} from 'lucide-react';

const API_URL = 'https://api.gharzoreality.com/api/tenant/pm/documents';
const UPLOAD_URL = (docId) =>
  `https://api.gharzoreality.com/api/tenant/pm/documents/${docId}/upload`;

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // ---------- Token ----------
  useEffect(() => {
    const stored = localStorage.getItem('tenanttoken');
    if (stored) setToken(stored);
    else {
      setError('Please log in to view documents.');
      setLoading(false);
    }
  }, []);

  // ---------- Fetch Documents ----------
  useEffect(() => {
    if (!token) return;

    const fetchDocs = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('tenanttoken');
            setError('Session expired. Please log in again.');
            return;
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [token]);

  // ---------- Upload Logic ----------
  const uploadFile = async (docId, file, notes) => {
    const form = new FormData();
    form.append('file', file);
    if (notes) form.append('notes', notes);

    const res = await fetch(UPLOAD_URL(docId), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Upload failed');
    }
    return res.json(); // { success:true, file:{...} }
  };

  // ---------- Helpers ----------
  const getStatusColor = (s) =>
    s === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  const getTemplateUrl = (p) => (p ? `https://api.gharzoreality.com${p}` : null);

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3 max-w-md">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm">{error}</p>
            {error.includes('log in') && (
              <button
                onClick={() => (window.location.href = '/login')}
                className="mt-3 px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Rental Agreement Documents
            </h1>
            <p className="mt-2 text-gray-600">
              {documents.length} document{documents.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Lock className="w-4 h-4" />
            Authenticated
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              token={token}
              uploadFile={uploadFile}
              setDocuments={setDocuments}
              getStatusColor={getStatusColor}
              getTemplateUrl={getTemplateUrl}
              formatDate={formatDate}
            />
          ))}
        </div>

        {/* Empty */}
        {documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for new rental agreements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Individual Document Card + Upload UI                               */
/* ------------------------------------------------------------------ */
const DocumentCard = ({
  doc,
  token,
  uploadFile,
  setDocuments,
  getStatusColor,
  getTemplateUrl,
  formatDate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // ----- Drag & Drop -----
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const enter = (e) => {
      e.preventDefault();
      el.classList.add('border-blue-500', 'bg-blue-50');
    };
    const leave = (e) => {
      e.preventDefault();
      el.classList.remove('border-blue-500', 'bg-blue-50');
    };
    const drop = (e) => {
      e.preventDefault();
      el.classList.remove('border-blue-500', 'bg-blue-50');
      const files = e.dataTransfer.files;
      if (files.length) handleFile(files[0]);
    };

    el.addEventListener('dragenter', enter);
    el.addEventListener('dragover', enter);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    return () => {
      el.removeEventListener('dragenter', enter);
      el.removeEventListener('dragover', enter);
      el.removeEventListener('dragleave', leave);
      el.removeEventListener('drop', drop);
    };
  }, []);

  // ----- File handling -----
  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be < 10 MB');
      return;
    }
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress (optional – real progress needs XMLHttpRequest)
      const interval = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 200);

      const result = await uploadFile(doc._id, file, notes);
      clearInterval(interval);
      setProgress(100);

      // Optimistically add the new file
      const newFile = result.file;
      setDocuments((prev) =>
        prev.map((d) =>
          d._id === doc._id
            ? {
                ...d,
                filledFiles: [...(d.filledFiles || []), newFile],
                status: 'submitted',
              }
            : d
        )
      );

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setNotes('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 600);
    } catch (e) {
      alert(e.message);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {doc.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
          </div>
          <span
            className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              doc.status
            )}`}
          >
            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>
            Sent to{' '}
            <strong>
              {doc.sendToAll
                ? 'All Tenants'
                : `${doc.tenants.length} Tenant${
                    doc.tenants.length !== 1 ? 's' : ''
                  }`}
            </strong>
          </span>
        </div>

        {doc.property && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="" />
            {/* <span>Property ID: {doc.property}</span> */}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>
            by <strong>{doc.createdBy.name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(doc.createdAt)}</span>
        </div>
      </div>

      {/* Template */}
      {doc.templateFile && (
        <div className="px-5 pb-4">
          <a
            href={getTemplateUrl(doc.templateFile)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Download className="w-4 h-4" />
            Download Template
          </a>
        </div>
      )}

      {/* Upload Section (only if not already submitted) */}
      {doc.status !== 'submitted' && (
        <div className="border-t border-gray-100 p-5">
          <div
            ref={dropRef}
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload className="w-6 h-6 animate-bounce text-blue-600" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">Uploading… {progress}%</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto w-8 h-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag & drop or <span className="text-blue-600 underline">choose file</span>
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG (max 10 MB)</p>
              </>
            )}
          </div>

          {/* Optional notes */}
          <textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-3 w-full p-2 border rounded text-sm resize-none"
            rows={2}
            disabled={uploading}
          />
        </div>
      )}

      {/* Submitted Files */}
      {doc.filledFiles?.length > 0 && (
        <div className="bg-green-50 border-t border-green-100 px-5 py-3">
          <p className="text-sm font-medium text-green-800 mb-2">
            {doc.filledFiles.length} Filled & Signed
          </p>
          <div className="space-y-2">
            {doc.filledFiles.map((f, i) => (
              <div key={i} className="text-xs">
                <a
                  href={`https://api.gharzoreality.com${f.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  File {i + 1}
                </a>
                <p className="text-gray-500">
                  by {f.uploadedBy?.name || 'You'} • {formatDate(f.uploadedAt)}
                </p>
                {f.notes && <p className="text-gray-600 italic mt-1">"{f.notes}"</p>}
              </div>
            ))}
          </div>
          {doc.reviewNotes && (
            <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
              <strong>Reviewed:</strong> {doc.reviewNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;