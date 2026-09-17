import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '../services/api';

export default function Reports() {
  const handleDownloadPdf = async () => {
    try {
      const response = await api.get('/reports/risk-summary/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'InfraPredict_Executive_Risk_Report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('PDF export failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          Executive Reports Exporter
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Generate official PDF and Excel project risk reports for government authorities.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <FileText size={24} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                National Risk Summary PDF
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Comprehensive PDF document listing critical high-risk infrastructure projects, cost overruns, and AI recommendations.
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            style={{
              padding: '0.65rem 1.2rem',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-blue)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={16} /> Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
