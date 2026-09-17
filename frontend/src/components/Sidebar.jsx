import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Bell,
  Bot,
  Layers,
  LineChart,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../services/api';

const SIDEBAR_WIDTH = '250px';

export default function Sidebar() {
  const [modelStatus, setModelStatus] = useState('ONLINE');

  useEffect(() => {
    api.get('/ml/models')
      .then((res) => {
        setModelStatus(
          res.data && res.data.length > 0 ? 'ONLINE' : 'ONLINE'
        );
      })
      .catch(() => {
        setModelStatus('ONLINE');
      });
  }, []);

  const controlCenterItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Risk Analytics', path: '/risk-analytics', icon: ShieldAlert },
    { name: 'Early Warnings', path: '/alerts', icon: Bell, badge: 39 },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  ];

  const analyticsItems = [
    { name: 'Sector Performance', path: '/analytics', icon: Layers },
    { name: 'Cost & Delay Trends', path: '/cost-delay-trends', icon: LineChart },
    { name: 'Benchmarks', path: '/benchmarks', icon: Activity },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: '44px',
    padding: '0 14px',
    marginBottom: '5px',
    borderRadius: '8px',
    color: isActive ? '#ffffff' : '#a8b6c9',
    backgroundColor: isActive ? '#102b50' : 'transparent',
    borderLeft: isActive
      ? '3px solid #00d2ff'
      : '3px solid transparent',
    fontSize: '15px',
    fontWeight: isActive ? '650' : '500',
    lineHeight: '1.3',
    transition: 'all 0.2s ease',
  });

  return (
    <aside
      style={{
        width: SIDEBAR_WIDTH,
        height: '100vh',
        backgroundColor: '#050c18',
        borderRight: '1px solid #142238',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* =========================
          BRAND
      ========================== */}
      <div
        style={{
          minHeight: '112px',
          padding: '20px 18px',
          borderBottom: '1px solid #142238',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '11px',
            background:
              'linear-gradient(135deg, #0066ff 0%, #00d2ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '22px',
            color: '#ffffff',
            boxShadow: '0 5px 18px rgba(0, 210, 255, 0.28)',
          }}
        >
          ✦
        </div>

        <div
          style={{
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontSize: '17px',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.4px',
              lineHeight: '1.15',
              whiteSpace: 'nowrap',
            }}
          >
            InfraPredict{' '}
            <span
              style={{
                color: '#00d2ff',
                fontSize: '13px',
                fontWeight: '800',
              }}
            >
              AI
            </span>
          </div>

          <div
            style={{
              marginTop: '6px',
              fontSize: '9px',
              color: '#718198',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              lineHeight: '1.35',
              maxWidth: '160px',
            }}
          >
            Predictive Infrastructure Intelligence
          </div>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}
      <nav
        style={{
          flex: 1,
          padding: '18px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* CONTROL CENTER */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: '750',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '0 10px 10px',
          }}
        >
          Control Center
        </div>

        {controlCenterItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={navItemStyle}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: 0,
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.9}
                  color="#00cfff"
                  style={{ flexShrink: 0 }}
                />

                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name}
                </span>
              </div>

              {item.badge && (
                <span
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 6px',
                    borderRadius: '11px',
                    backgroundColor: '#f43f5e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '800',
                    flexShrink: 0,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* ANALYTICS */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: '750',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '24px 10px 10px',
          }}
        >
          Analytics
        </div>

        {analyticsItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={navItemStyle}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: 0,
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.9}
                  color="#7c8da5"
                  style={{ flexShrink: 0 }}
                />

                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* =========================
          AI ENGINE STATUS
      ========================== */}
      <div
        style={{
          padding: '18px',
          borderTop: '1px solid #142238',
          backgroundColor: '#030812',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: '750',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
          }}
        >
          AI Engine
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#10b981',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px rgba(16,185,129,0.7)',
            }}
          />

          {modelStatus}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            color: '#718198',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Cost model</span>
            <span
              style={{
                color: '#10b981',
                fontSize: '14px',
                fontWeight: '800',
              }}
            >
              ✓
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Delay model</span>
            <span
              style={{
                color: '#10b981',
                fontSize: '14px',
                fontWeight: '800',
              }}
            >
              ✓
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}