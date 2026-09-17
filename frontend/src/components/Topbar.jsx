import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_WIDTH = '250px';

export default function Topbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(
        `/projects?search=${encodeURIComponent(searchTerm.trim())}`
      );
    }
  };

  return (
    <header
      style={{
        height: '64px',
        minHeight: '64px',
        backgroundColor: '#060d19',
        borderBottom: '1px solid #142238',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* SEARCH */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          width: '420px',
          maxWidth: '45%',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />

          <input
            type="text"
            placeholder="Search projects, ministries, sectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 16px 0 44px',
              backgroundColor: '#0c182b',
              border: '1px solid #1e2e4a',
              borderRadius: '22px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </form>

      {/* STATUS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <StatusBadge
          color="#10b981"
          background="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.35)"
          text="MONITORING ACTIVE"
        />

        <StatusBadge
          color="#38bdf8"
          background="rgba(56,189,248,0.12)"
          border="rgba(56,189,248,0.35)"
          text="AI RISK ENGINE ACTIVE"
        />
      </div>
    </header>
  );
}

function StatusBadge({ color, background, border, text }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 12px',
        borderRadius: '20px',
        backgroundColor: background,
        border: `1px solid ${border}`,
        color,
        fontSize: '12px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 7px ${color}`,
        }}
      />

      {text}
    </span>
  );
}