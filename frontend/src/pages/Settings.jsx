import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Settings() {
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({
    high_risk_threshold: 67,
    medium_risk_threshold: 34,
    cost_risk_weight: 0.40,
    schedule_risk_weight: 0.40,
    progress_risk_weight: 0.20
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, setRes] = await Promise.all([
        api.get('/ml/audit-logs'),
        api.get('/ml/settings')
      ]);
      setLogs(logsRes.data || []);
      if (setRes.data) setSettings(setRes.data);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put(`/ml/settings?high_risk_threshold=${settings.high_risk_threshold}&medium_risk_threshold=${settings.medium_risk_threshold}&cost_risk_weight=${settings.cost_risk_weight}&schedule_risk_weight=${settings.schedule_risk_weight}&progress_risk_weight=${settings.progress_risk_weight}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          Platform Settings & Audit Logs
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Configure risk thresholds, scoring weights, and inspect user activity audit trails.
        </p>
      </div>

      {saved && (
        <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
          Risk Thresholds & Configuration updated successfully.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Risk Thresholds Config */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Configurable Risk Thresholds
          </h3>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              High Risk Score Threshold (0-100)
            </label>
            <input
              type="number"
              value={settings.high_risk_threshold}
              onChange={(e) => setSettings({ ...settings, high_risk_threshold: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.55rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Cost Risk Weighting Ratio
            </label>
            <input
              type="number"
              step="0.05"
              value={settings.cost_risk_weight}
              onChange={(e) => setSettings({ ...settings, cost_risk_weight: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.55rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Schedule Risk Weighting Ratio
            </label>
            <input
              type="number"
              step="0.05"
              value={settings.schedule_risk_weight}
              onChange={(e) => setSettings({ ...settings, schedule_risk_weight: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.55rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <button
            onClick={handleSaveSettings}
            style={{ padding: '0.65rem', borderRadius: '8px', backgroundColor: 'var(--accent-blue)', color: '#fff', fontWeight: '600', fontSize: '0.85rem', marginTop: '0.5rem' }}
          >
            Save Configuration
          </button>
        </div>

        {/* Audit Log Trail */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Platform Action Audit Trail
          </h3>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.5rem' }}>User</th>
                  <th style={{ padding: '0.5rem' }}>Action</th>
                  <th style={{ padding: '0.5rem' }}>Entity</th>
                  <th style={{ padding: '0.5rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{l.user_username}</td>
                    <td style={{ padding: '0.5rem' }}>{l.action}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{l.entity_type}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
