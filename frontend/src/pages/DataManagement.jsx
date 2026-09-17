import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Database, Check } from 'lucide-react';
import api from '../services/api';

export default function DataManagement() {
  const [status, setStatus] = useState(null);
  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/data/status');
      setStatus(res.data);
    } catch (err) {}
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidation(null);
      setMessage(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/data/upload-validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValidation(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Validation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/data/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: `Successfully imported ${res.data.imported_projects} infrastructure projects into SQLite database!` });
      fetchStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          Data Management & Ingestion Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Upload CSV dataset files, validate records, map columns, and update SQLite project repository.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
          color: message.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          fontSize: '0.85rem'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Upload & Validation Studio */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Upload & Validate Dataset
          </h3>

          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-primary)',
            cursor: 'pointer'
          }}>
            <Upload size={32} color="var(--accent-cyan)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '500' }}>
              Select CSV Dataset file to upload
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Supports .CSV files (Max 50MB)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
            />
          </div>

          {file && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleValidate}
                disabled={loading}
                style={{
                  padding: '0.65rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                {loading ? 'Validating...' : 'Validate Dataset'}
              </button>

              {validation && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent-emerald)',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}
                >
                  {importing ? 'Importing...' : 'Confirm & Import to SQLite'}
                </button>
              )}
            </div>
          )}

          {/* Validation Metrics Summary */}
          {validation && (
            <div style={{
              padding: '1.25rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                Dataset Validation Report
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div>Total Rows: <strong>{validation.total_rows}</strong></div>
                <div>Columns: <strong>{validation.total_columns}</strong></div>
                <div>Valid Rows: <strong style={{ color: 'var(--accent-emerald)' }}>{validation.valid_rows}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Dataset History Panel */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Active Dataset Status
          </h3>
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>Status: <strong style={{ color: 'var(--accent-emerald)' }}>Active</strong></p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>File Location: <code>/data/infrastructure_projects.csv</code></p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Database Storage: <code>SQLite (infrastructure_monitoring.db)</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
