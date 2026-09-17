import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Target, BarChart2, CheckCircle2, AlertCircle, Clock 
} from 'lucide-react';
import api from '../services/api';

export default function Benchmarks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/benchmarks');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load benchmarks data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
        Loading National Infrastructure Benchmarks & SLA Standards...
      </div>
    );
  }

  const { national_summary, sector_benchmarks, sla_benchmarks } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Award color="#00d2ff" size={24} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
            National Infrastructure Benchmarks & Performance Standards
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Comparative sector risk baselines, regulatory clearance SLA benchmarks, and operational efficiency rankings.
        </p>
      </div>

      {/* Benchmark Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        
        {/* KPI 1 */}
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
              National Risk Benchmark
            </span>
            <ShieldCheck size={18} color="#00d2ff" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00d2ff' }}>
            {national_summary.national_risk_index} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Baseline risk index across all 1,775 projects
          </div>
        </div>

        {/* KPI 2 */}
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
              Cost Variance Baseline
            </span>
            <BarChart2 size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b' }}>
            +{national_summary.national_cost_variance_pct}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Average national capital variance standard
          </div>
        </div>

        {/* KPI 3 */}
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
              Expenditure Efficiency
            </span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
            {national_summary.national_expenditure_efficiency}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Fund utilization benchmark against revised budget
          </div>
        </div>

        {/* KPI 4 */}
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
              SLA Target Compliance
            </span>
            <Target size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#a855f7' }}>
            {national_summary.sla_compliance_rate}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Regulatory clearance & mobilization benchmark
          </div>
        </div>

      </div>

      {/* Regulatory & Approval SLA Benchmarks */}
      <div style={{
        backgroundColor: '#0a1628',
        border: '1px solid #142238',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
              Regulatory Clearance & Project Execution SLA Benchmarks
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Statutory timeline targets vs actual national average execution days
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #142238', color: '#64748b', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Milestone / Regulatory Metric</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Target SLA (Days)</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>National Avg (Days)</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Compliance Rate</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Benchmark Status</th>
              </tr>
            </thead>
            <tbody>
              {sla_benchmarks.map((sla, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #0d1e36', color: '#cbd5e1' }}>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '700', color: '#ffffff' }}>
                    {sla.metric}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', color: '#00d2ff', fontWeight: '700' }}>
                    {sla.sla_target_days} Days
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '700', color: sla.national_avg_days > sla.sla_target_days ? '#f43f5e' : '#10b981' }}>
                    {sla.national_avg_days} Days
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#050c18', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${sla.compliance_pct}%`, height: '100%', backgroundColor: sla.compliance_pct > 80 ? '#10b981' : '#f59e0b' }}></div>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>{sla.compliance_pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      backgroundColor: sla.status === 'On Track' ? 'rgba(16, 185, 129, 0.15)' : (sla.status === 'Delayed' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)'),
                      color: sla.status === 'On Track' ? '#10b981' : (sla.status === 'Delayed' ? '#f59e0b' : '#f43f5e')
                    }}>
                      {sla.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Efficiency Scorecard Ranking Table */}
      <div style={{
        backgroundColor: '#0a1628',
        border: '1px solid #142238',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
              Sector Performance & Risk Efficiency Benchmark Matrix
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              National sector rankings sorted by Risk Index Efficiency (#1 to #{sector_benchmarks.length})
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #142238', color: '#64748b', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Rank</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Sector</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Projects</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Cost Var %</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Fund Utilization</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Avg Risk Index</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Benchmark Classification</th>
              </tr>
            </thead>
            <tbody>
              {sector_benchmarks.map((b) => (
                <tr key={b.sector} style={{ borderBottom: '1px solid #0d1e36', color: '#cbd5e1' }}>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '800', color: '#00d2ff' }}>
                    {b.rank}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '700', color: '#ffffff' }}>
                    {b.sector}
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>{b.total_projects}</td>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: '600', color: b.cost_variance_pct > 20 ? '#f43f5e' : (b.cost_variance_pct > 5 ? '#f59e0b' : '#10b981') }}>
                    +{b.cost_variance_pct}%
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>{b.utilization_pct}%</td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: b.avg_risk_score > 55 ? '#f43f5e' : (b.avg_risk_score > 35 ? '#f59e0b' : '#10b981')
                      }}></span>
                      <span style={{ fontWeight: '700' }}>{b.avg_risk_score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.8rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      backgroundColor: b.status === 'High Benchmark Efficiency' ? 'rgba(16, 185, 129, 0.15)' : (b.status === 'Standard Performance' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(244, 63, 94, 0.15)'),
                      color: b.status === 'High Benchmark Efficiency' ? '#10b981' : (b.status === 'Standard Performance' ? '#3b82f6' : '#f43f5e')
                    }}>
                      {b.status}
                    </span>
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
