import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import api from '../services/api';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scenario Simulator Local Inputs
  const [simCost, setSimCost] = useState(0);
  const [simProgress, setSimProgress] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      const p = res.data.project;
      setProjectData(p);
      setSimCost(p.current_cost);
      setSimProgress(p.actual_progress);
    } catch (err) {
      console.error('Failed to load project detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!projectData) return;
    setSimulating(true);
    try {
      const res = await api.post('/scenario/analyze', {
        project_id: projectData.id,
        hypothetical_current_cost: parseFloat(simCost),
        hypothetical_actual_progress: parseFloat(simProgress),
        hypothetical_remaining_months: 12
      });
      setSimResult(res.data);
    } catch (err) {
      console.error('Scenario simulation failed', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading project details...</div>;
  }

  if (!projectData) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-rose)' }}>Project not found.</div>;
  }

  const pred = projectData.latest_prediction || { overall_risk_score: 50, overall_risk_category: 'MEDIUM', cost_risk_score: 50, schedule_risk_score: 50 };
  const isHigh = pred.overall_risk_category === 'HIGH';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button & Title header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {projectData.project_name}
            </h1>
            <span style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              backgroundColor: isHigh ? 'var(--risk-high-bg)' : 'var(--risk-medium-bg)',
              color: isHigh ? 'var(--risk-high)' : 'var(--risk-medium)'
            }}>
              {pred.overall_risk_score}/100 {pred.overall_risk_category} RISK
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Project ID: <span style={{ color: 'var(--accent-cyan)' }}>{projectData.project_id}</span> • Sector: {projectData.sector} • Ministry: {projectData.ministry}
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <DetailKpi title="Original Budget" value={`₹${projectData.planned_cost} Cr`} icon={DollarSign} color="var(--accent-cyan)" />
        <DetailKpi title="Current Revised Budget" value={`₹${projectData.current_cost} Cr`} icon={DollarSign} color={projectData.current_cost > projectData.planned_cost ? 'var(--accent-rose)' : 'var(--accent-emerald)'} />
        <DetailKpi title="Cumulative Expenditure" value={`₹${projectData.expenditure} Cr`} icon={TrendingUp} color="var(--accent-blue)" />
        <DetailKpi title="Physical Progress" value={`${projectData.actual_progress}%`} icon={Clock} color="var(--accent-amber)" />
      </div>

      {/* Main Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        {/* Left Column: AI Risk Decomposition & Factors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Risk Breakdown Box */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              AI Risk Score Decomposition
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <RiskGauge title="Cost Overrun Risk" score={pred.cost_risk_score} category={pred.cost_risk_category} color="var(--accent-rose)" />
              <RiskGauge title="Schedule Delay Risk" score={pred.schedule_risk_score} category={pred.schedule_risk_category} color="var(--accent-amber)" />
              <RiskGauge title="Overall Risk Index" score={pred.overall_risk_score} category={pred.overall_risk_category} color="var(--accent-blue)" />
            </div>

            {/* Explainable AI Contributing Factors */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Explainable AI (XAI) Contributing Risk Factors
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projectData.risk_factors?.map((f) => (
                <div key={f.id} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <AlertCircle size={18} color={f.impact_level === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-amber)'} style={{ marginTop: '2px' }} />
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {f.factor_name} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>({f.impact_level} IMPACT)</span>
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assisted Recommendations */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} color="var(--accent-amber)" /> AI-Assisted Recommended Action Guidance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}>
                <strong>Cost Management Intervention:</strong> Conduct detailed cost variance audit to verify revised material estimates against line-ministry approved expenditure baselines.
              </div>
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}>
                <strong>Timeline Acceleration:</strong> Perform critical path review and reallocate site equipment to resolve physical progress lag.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive What-If Scenario Sandbox */}
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
            Interactive What-If Scenario Sandbox
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Simulate hypothetical project budget and progress adjustments to calculate anticipated risk reduction.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Hypothetical Revised Cost (₹ Cr)
              </label>
              <input
                type="number"
                value={simCost}
                onChange={(e) => setSimCost(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Hypothetical Progress Target (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={simProgress}
                onChange={(e) => setSimProgress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-blue)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              <Play size={16} /> {simulating ? 'Calculating...' : 'Run Simulation'}
            </button>
          </div>

          {/* Scenario Result Card */}
          {simResult && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--accent-blue)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Simulated Risk Score:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{simResult.scenario_risk_score} / 100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Risk Improvement:</span>
                <span style={{ color: simResult.risk_improvement >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 'bold' }}>
                  {simResult.risk_improvement >= 0 ? `+${simResult.risk_improvement}` : simResult.risk_improvement} pts
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                {simResult.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailKpi({ title, value, icon: Icon, color }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: `rgba(255, 255, 255, 0.05)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={20} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{title}</p>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</h3>
      </div>
    </div>
  );
}

function RiskGauge({ title, score, category, color }) {
  return (
    <div style={{
      padding: '1rem',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{title}</p>
      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: color }}>{score}</h3>
      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>{category}</span>
    </div>
  );
}
