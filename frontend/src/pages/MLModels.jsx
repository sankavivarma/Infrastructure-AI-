import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, CheckCircle, Award } from 'lucide-react';
import api from '../services/api';

export default function MLModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ml/models');
      setModels(res.data || []);
    } catch (err) {
      console.error('Failed to load ML models', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setTraining(true);
    setMessage(null);
    try {
      const res = await api.post('/ml/train');
      setMessage({ type: 'success', text: 'ML Models retrained and evaluated successfully!' });
      fetchModels();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Training failed' });
    } finally {
      setTraining(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Machine Learning Model Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Model registry, classification accuracy, regression metrics, and retraining pipeline.
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={training}
          style={{
            padding: '0.65rem 1.2rem',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-blue)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} /> {training ? 'Training Models...' : 'Retrain ML Models'}
        </button>
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

      {/* Model Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {models.map((m) => (
          <div key={m.id} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-blue)'
                }}>
                  <Cpu size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{m.model_name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Version: {m.version} • {m.algorithm}</span>
                </div>
              </div>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)'
              }}>
                {m.status}
              </span>
            </div>

            {/* Performance Metrics Grid */}
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              fontSize: '0.82rem'
            }}>
              {m.model_type === 'Cost Overrun' ? (
                <>
                  <div>Accuracy: <strong style={{ color: 'var(--accent-emerald)' }}>{(m.accuracy * 100).toFixed(1)}%</strong></div>
                  <div>Precision: <strong>{(m.precision * 100).toFixed(1)}%</strong></div>
                  <div>Recall: <strong>{(m.recall * 100).toFixed(1)}%</strong></div>
                  <div>F1-Score: <strong>{m.f1_score}</strong></div>
                  <div>ROC-AUC: <strong style={{ color: 'var(--accent-cyan)' }}>{m.roc_auc}</strong></div>
                </>
              ) : (
                <>
                  <div>MAE: <strong>{m.mae}</strong></div>
                  <div>RMSE: <strong>{m.rmse}</strong></div>
                  <div>R² Score: <strong style={{ color: 'var(--accent-cyan)' }}>{m.r2_score}</strong></div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
