import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Eye
} from 'lucide-react';

export function CampaignPerformanceTable({ campaigns = [], onStatusChange, onDelete }) {
  const [sortField, setSortField] = useState('views');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'ctr') {
      aVal = a.views > 0 ? (a.clicks / a.views) : 0;
      bVal = b.views > 0 ? (b.clicks / b.views) : 0;
    }

    if (aVal === bVal) return 0;
    if (sortOrder === 'desc') return aVal < bVal ? 1 : -1;
    return aVal > bVal ? 1 : -1;
  });

  return (
    <div className="advertiser-table-card">
      <table className="advertiser-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Campaign</th>
            <th style={{ width: '18%' }}>Status</th>
            <th
              style={{ width: '14%', cursor: 'pointer', color: sortField === 'views' ? '#b45309' : '#4b5563' }}
              onClick={() => handleSort('views')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Views</span>
                {sortField === 'views' && (sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
              </div>
            </th>
            <th
              style={{ width: '14%', cursor: 'pointer', color: sortField === 'clicks' ? '#b45309' : '#4b5563' }}
              onClick={() => handleSort('clicks')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Clicks</span>
                {sortField === 'clicks' && (sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
              </div>
            </th>
            <th
              style={{ width: '14%', cursor: 'pointer', color: sortField === 'ctr' ? '#b45309' : '#4b5563' }}
              onClick={() => handleSort('ctr')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>CTR</span>
                {sortField === 'ctr' && (sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCampaigns.length === 0 ? (
            <tr>
              <td colSpan="5" className="advertiser-table-empty">
                No campaigns yet.
              </td>
            </tr>
          ) : (
            sortedCampaigns.map((c) => {
              const ctrFormatted = c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(2) + '%' : '0.00%';
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '13.5px' }}>{c.title}</div>
                    <a
                      href={c.destinationUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      <span>{c.destinationUrl}</span>
                      <ExternalLink size={10} color="#94a3b8" />
                    </a>
                  </td>
                  <td>
                    <span className={`status-pill ${c.status === 'Live' ? 'status-live' : 'status-review'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{(c.views || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{(c.clicks || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>{ctrFormatted}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CampaignPerformanceTable;
