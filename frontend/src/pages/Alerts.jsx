import React, { useState, useEffect } from 'react';
import { Bell, Check, ShieldAlert, Filter } from 'lucide-react';
import api from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/alerts?status_filter=${filter}`);
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      fetchAlerts();
    } catch (err) {}
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Early Warning Risk Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time threshold breaches, risk escalation alerts, and action tracking
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.55rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <option value="All">All Alerts Status</option>
          <option value="New">New Alerts</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading alerts...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Project Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Sector</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Risk Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Severity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Trigger Reason</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Score</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No risk alerts found.
                    </td>
                  </tr>
                ) : (
                  alerts.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>{a.project_name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{a.sector}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{a.risk_type}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          backgroundColor: a.severity === 'Critical' ? 'var(--risk-high-bg)' : 'var(--risk-medium-bg)',
                          color: a.severity === 'Critical' ? 'var(--risk-high)' : 'var(--risk-medium)'
                        }}>
                          {a.severity}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>{a.trigger_reason}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold' }}>{a.risk_score}/100</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{a.status}</td>
                      <td style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.4rem' }}>
                        {a.status === 'New' && (
                          <button
                            onClick={() => handleAcknowledge(a.id)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: 'var(--accent-amber)',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Acknowledge
                          </button>
                        )}
                        {a.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolve(a.id)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: 'var(--accent-emerald)',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
