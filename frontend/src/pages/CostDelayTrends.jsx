import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Clock, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export default function CostDelayTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/cost-delay-trends');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load cost & delay trends', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
        Loading Cost & Delay Trends Analysis...
      </div>
    );
  }

  const { summary, escalation_distribution, sector_trends, top_cost_overruns } = data;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  const escalationPieData = Object.entries(escalation_distribution || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <TrendingUp color="#00d2ff" size={24} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
            Cost Overrun & Schedule Delay Intelligence
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Comprehensive national fiscal variance, budget escalation drivers, and timeline slippage analytics across 1,775 projects.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        
        {/* Card 1: Total Cost Overrun */}
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #142238',
          borderRadius: '10px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
              Total Budget Overrun
            </span>
            <DollarSign size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f43f5e' }}>
            ₹{(summary.total_cost_overrun || 0).toLocaleString()} Cr
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Planned: ₹{(summary.total_planned_cost || 0).toLocaleString()} Cr | Revised: ₹{(summary.total_current_cost || 0).toLocaleString()} Cr
          </div>
        </div>

        {/* Card 2: Overrun Rate */}
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #142238',
          borderRadius: '10px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
              Affected Projects
            </span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b' }}>
            {summary.projects_with_cost_overrun} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ {summary.total_projects}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {((summary.projects_with_cost_overrun / summary.total_projects) * 100).toFixed(1)}% of projects experiencing cost escalation
          </div>
        </div>

        {/* Card 3: Utilization Rate */}
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #142238',
          borderRadius: '10px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
              Expenditure Utilization
            </span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
            {summary.overall_utilization_pct}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Spent: ₹{(summary.total_expenditure || 0).toLocaleString()} Cr out of revised budget
          </div>
        </div>

        {/* Card 4: High Schedule Delay */}
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #142238',
          borderRadius: '10px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
              High Schedule Risk
            </span>
            <Clock size={18} color="#00d2ff" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00d2ff' }}>
            {summary.projects_with_high_delay} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Projects</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Subject to potential timeline milestone extensions
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem' }}>
        
        {/* Sector Cost Comparison Bar Chart */}
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #142238',
          borderRadius: '10px',
          padding: '1.25rem'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Planned Budget vs Current Revised Cost by Sector (₹ Cr)
          </h3>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sector_trends.slice(0, 8)}>
                <XAxis dataKey="sector" tick={{ fill: '#64748b', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#050c18', borderColor: '#142238', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="planned_cost" name="Planned Budget" fill="#0066ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current_cost" name="Latest Revised Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalation Severity Breakdown Pie Chart */}
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #142238',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
            Cost Escalation Severity Breakdown
          </h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={escalationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {escalationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#050c18', borderColor: '#142238', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {escalationPieData.map((item, idx) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {item.name}
                </span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>{item.value}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Top Cost Overrun Projects Table */}
      <div style={{
        backgroundColor: '#0a1628',
        border: '1px solid #142238',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
              Highest Capital Escalation Projects
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Top infrastructure projects ranked by absolute monetary cost overrun
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #142238', color: '#64748b', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Project ID & Name</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Sector</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Planned Cost</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Revised Cost</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Overrun (Cr)</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Escalation %</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {top_cost_overruns.map((proj) => (
                <tr key={proj.id} style={{ borderBottom: '1px solid #0d1e36', color: '#cbd5e1' }}>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <div style={{ fontWeight: '700', color: '#00d2ff' }}>{proj.project_id}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{proj.project_name}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', color: '#94a3b8' }}>{proj.sector}</td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>₹{proj.planned_cost.toLocaleString()} Cr</td>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '600' }}>₹{proj.current_cost.toLocaleString()} Cr</td>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '800', color: '#f43f5e' }}>
                    +₹{proj.overrun.toLocaleString()} Cr
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                      color: '#f43f5e',
                      fontWeight: '700',
                      fontSize: '0.72rem'
                    }}>
                      +{proj.pct_increase}%
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: proj.risk_score > 66 ? '#f43f5e' : (proj.risk_score > 33 ? '#f59e0b' : '#10b981')
                      }}></span>
                      <span style={{ fontWeight: '700' }}>{proj.risk_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
