import React, { useState } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your InfraPredict AI Assistant. Ask me anything about project risk scores, sector overruns, ministry delays, or high-risk projects.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let reply = "";
      const lower = userMsg.toLowerCase();

      if (lower.includes('high risk') || lower.includes('critical')) {
        const res = await api.get('/projects?limit=5&risk_category=HIGH');
        const count = res.data.total;
        const items = res.data.items.slice(0, 3).map(i => `${i.project_name} (${i.sector})`).join(', ');
        reply = `There are currently ${count} High Risk projects monitored in SQLite. Top critical projects include: ${items}.`;
      } else if (lower.includes('sector')) {
        const res = await api.get('/analytics/sector');
        const topSec = res.data[0];
        reply = `The sector with the highest total project volume and risk impact is ${topSec.sector} with ${topSec.total_projects} projects and ₹${topSec.cost_variance} Cr in cost variance.`;
      } else if (lower.includes('ministry')) {
        const res = await api.get('/analytics/ministry');
        const topMin = res.data[0];
        reply = `The line ministry managing the highest project volume is ${topMin.ministry} (${topMin.total_projects} projects).`;
      } else {
        const kpiRes = await api.get('/risk/summary');
        reply = `InfraPredict AI is currently monitoring ${kpiRes.data.total_projects} projects across India, with ${kpiRes.data.high_risk_projects} High Risk projects and an average risk index of ${kpiRes.data.avg_risk_score}/100.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I ran into an issue querying the project database.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
          AI Infrastructure Assistant
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Query real-time project risk metrics, sector cost variances, and predictive intelligence.
        </p>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: '#0b1626',
        border: '1px solid #182840',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Chat History */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '0.75rem',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}>
              {m.role === 'assistant' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d2ff', flexShrink: 0 }}>
                  <Sparkles size={16} />
                </div>
              )}
              <div style={{
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                backgroundColor: m.role === 'user' ? '#0066ff' : '#14253d',
                color: '#ffffff',
                fontSize: '0.88rem',
                lineHeight: '1.4'
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>AI Assistant is querying SQLite repository...</div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #182840', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Ask about high risk projects, sector overruns, ministry delays..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: '#050c18',
              border: '1px solid #182840',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#0066ff',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
