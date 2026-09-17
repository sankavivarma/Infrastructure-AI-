import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

export default function Analytics() {
  const [sectorData, setSectorData] = useState([]);
  const [ministryData, setMinistryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [secRes, minRes] = await Promise.all([
        api.get('/analytics/sector'),
        api.get('/analytics/ministry')
      ]);
      setSectorData(secRes.data || []);
      setMinistryData(minRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          Sector & Ministry Analytics Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          National cost variance trends, expenditure utilization, and risk breakdown by government ministry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Sector Cost Variance */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Cost Overrun by Sector (₹ Cr)
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData.slice(0, 8)}>
                <XAxis dataKey="sector" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: '#fff' }} />
                <Bar dataKey="cost_variance" name="Cost Overrun (Cr)" fill="var(--accent-rose)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ministry Projects Distribution */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Top Line Ministries by Project Volume
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ministryData.slice(0, 6)} layout="vertical">
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis dataKey="ministry" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={140} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: '#fff' }} />
                <Bar dataKey="total_projects" name="Total Projects" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
