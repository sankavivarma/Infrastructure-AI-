import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#050c18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#0b1526',
        border: '1px solid #142238',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0066ff, #00d2ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#fff',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 20px rgba(0, 210, 255, 0.3)'
          }}>
            ✦
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
            InfraPredict <span style={{ color: '#00d2ff' }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.3rem' }}>
            Infrastructure Intelligence Center • Sign In
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid #f43f5e',
            color: '#f43f5e',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.2rem',
                  backgroundColor: '#050c18',
                  border: '1px solid #142238',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.2rem',
                  backgroundColor: '#050c18',
                  border: '1px solid #142238',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#0066ff',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Intelligence Center'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #142238', fontSize: '0.75rem', color: '#64748b' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.4rem', color: '#94a3b8' }}>Demo Accounts (Password: admin123):</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {['admin', 'govt_admin', 'pm_user', 'analyst', 'viewer'].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => { setUsername(u); setPassword('admin123'); }}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: '#050c18',
                  border: '1px solid #142238',
                  color: '#00d2ff',
                  fontSize: '0.72rem'
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
