import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(15);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sector, setSector] = useState('All');
  const [riskCategory, setRiskCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [sectorsList, setSectorsList] = useState([]);

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [page, search, sector, riskCategory]);

  const fetchSectors = async () => {
    try {
      const res = await api.get('/analytics/sector');
      setSectorsList(res.data.map(s => s.sector));
    } catch (err) {}
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const skip = page * limit;
      let url = `/projects?skip=${skip}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (sector !== 'All') url += `&sector=${encodeURIComponent(sector)}`;
      if (riskCategory !== 'All') url += `&risk_category=${encodeURIComponent(riskCategory)}`;

      const res = await api.get(url);
      setProjects(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load projects list', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Infrastructure Project Explorer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Showing {projects.length} of {total} total tracked national projects
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, name, sector..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.2rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(0); }}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="All">All Infrastructure Sectors</option>
              {sectorsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <select
            value={riskCategory}
            onChange={(e) => { setRiskCategory(e.target.value); setPage(0); }}
            style={{
              padding: '0.55rem 1rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="All">All Risk Levels</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="LOW">LOW Risk</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading infrastructure projects...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'rgba(31, 41, 55, 0.5)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Project ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Project Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Sector</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Planned Cost</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Revised Cost</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Expenditure</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Progress</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const score = p.latest_prediction?.overall_risk_score || 50;
                  const cat = p.latest_prediction?.overall_risk_category || 'MEDIUM';
                  const isHigh = cat === 'HIGH';
                  const isMed = cat === 'MEDIUM';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>
                        <span 
                          onClick={() => navigate(`/projects/${p.project_id}`)}
                          style={{ color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'none' }}
                          title="Click to view details"
                        >
                          {p.project_id}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '500', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span 
                          onClick={() => navigate(`/projects/${p.project_id}`)}
                          style={{ color: 'var(--text-primary)', cursor: 'pointer' }}
                          title="Click to view details"
                        >
                          {p.project_name}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{p.sector}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>₹{p.planned_cost} Cr</td>
                      <td style={{ padding: '0.85rem 1rem', color: p.current_cost > p.planned_cost ? 'var(--accent-rose)' : 'inherit' }}>
                        ₹{p.current_cost} Cr
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>₹{p.expenditure} Cr</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{p.actual_progress}%</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-medium-bg)' : 'var(--risk-low-bg)',
                          color: isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'
                        }}>
                          {score}/100 {cat}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} records
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                opacity: page === 0 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                opacity: (page + 1) * limit >= total ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
