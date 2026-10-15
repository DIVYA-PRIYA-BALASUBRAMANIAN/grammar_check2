import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Eye,
  Film
} from 'lucide-react';

const isVideoMedia = (url) => {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg') || clean.endsWith('.mkv');
};

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

  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'live' | 'completed'

  const filteredCampaigns = campaigns.filter(c => {
    if (filterTab === 'live') return c.status === 'Live';
    if (filterTab === 'completed') return c.status === 'Completed';
    return true;
  });

  const liveCount = campaigns.filter(c => c.status === 'Live').length;
  const completedCount = campaigns.filter(c => c.status === 'Completed').length;

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
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
      {/* Table Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafbfc'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: filterTab === 'all' ? '1px solid #003822' : '1px solid #e2e8f0',
              background: filterTab === 'all' ? '#003822' : '#ffffff',
              color: filterTab === 'all' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            All Campaigns ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('live')}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: filterTab === 'live' ? '1px solid #059669' : '1px solid #e2e8f0',
              background: filterTab === 'live' ? '#ecfdf5' : '#ffffff',
              color: filterTab === 'live' ? '#065f46' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Active on Live Feed ({liveCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: filterTab === 'completed' ? '1px solid #475569' : '1px solid #e2e8f0',
              background: filterTab === 'completed' ? '#f1f5f9' : '#ffffff',
              color: filterTab === 'completed' ? '#0f172a' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Campaign History ({completedCount})
          </button>
        </div>

        <span style={{ fontSize: '11px', color: '#64748b' }}>
          {completedCount > 0 ? 'Expired live ads are archived here in history' : 'Live ads appear in home feed until time ends'}
        </span>
      </div>

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
                {filterTab === 'live' ? 'No active live campaigns. Launch a campaign to see it in the live feed!' : filterTab === 'completed' ? 'No completed history yet. Expired campaigns will be archived here.' : 'No campaigns yet.'}
              </td>
            </tr>
          ) : (
            sortedCampaigns.map((c) => {
              const ctrFormatted = c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(2) + '%' : '0.00%';
              const isLive = c.status === 'Live';
              const isCompleted = c.status === 'Completed';

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {c.posterUrl ? (
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#090d16',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isVideoMedia(c.posterUrl) ? (
                            <video
                              src={c.posterUrl}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              muted
                            />
                          ) : (
                            <img
                              src={c.posterUrl}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </div>
                      ) : null}
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '13.5px' }}>{c.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <a
                            href={c.destinationUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '11px', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                          >
                            <span>{c.destinationUrl}</span>
                            <ExternalLink size={10} color="#94a3b8" />
                          </a>
                          {c.endDate && (
                            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              · {c.startDate} to {c.endDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {isLive ? (
                      <span className="status-pill" style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '11px'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        Live on Feed
                      </span>
                    ) : isCompleted ? (
                      <span className="status-pill" style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '11px'
                      }}>
                        Completed (In History)
                      </span>
                    ) : (
                      <span className="status-pill status-review">
                        {c.status}
                      </span>
                    )}
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
