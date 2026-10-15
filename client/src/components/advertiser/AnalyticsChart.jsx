import React, { useState } from 'react';

export function AnalyticsChart({ chartData = [], totalViews = 0, totalClicks = 0 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // If chartData is empty or all zeroes, handle gracefully
  const hasData = chartData && chartData.length > 0 && chartData.some(d => d.views > 0 || d.clicks > 0);

  // Calculate scales
  const maxViews = Math.max(10, ...chartData.map(d => d.views || 0));
  const maxClicks = Math.max(5, ...chartData.map(d => d.clicks || 0));

  const svgWidth = 800;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = svgWidth - (paddingX * 2);
  const plotHeight = svgHeight - (paddingY * 2);

  // Map data to SVG coordinates
  const points = chartData.map((d, index) => {
    const x = chartData.length > 1
      ? paddingX + (index / (chartData.length - 1)) * plotWidth
      : paddingX + plotWidth / 2;
    const yViews = paddingY + plotHeight - ((d.views || 0) / maxViews) * plotHeight;
    const yClicks = paddingY + plotHeight - ((d.clicks || 0) / (maxViews || 1)) * plotHeight;
    return { ...d, x, yViews, yClicks };
  });

  // Construct SVG paths
  const viewsPath = points.length > 0
    ? points.map((p, i) => (i === 0 ? `M ${p.x},${p.yViews}` : `L ${p.x},${p.yViews}`)).join(' ')
    : '';

  const viewsAreaPath = points.length > 0
    ? `${viewsPath} L ${points[points.length - 1].x},${paddingY + plotHeight} L ${points[0].x},${paddingY + plotHeight} Z`
    : '';

  const clicksPath = points.length > 0
    ? points.map((p, i) => (i === 0 ? `M ${p.x},${p.yClicks}` : `L ${p.x},${p.yClicks}`)).join(' ')
    : '';

  return (
    <div className="advertiser-chart-card">
      <div className="advertiser-chart-canvas-wrap" style={{ position: 'relative' }}>
        <svg
          className="advertiser-chart-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={paddingY + plotHeight * 0.33} x2={svgWidth - paddingX} y2={paddingY + plotHeight * 0.33} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={paddingY + plotHeight * 0.66} x2={svgWidth - paddingX} y2={paddingY + plotHeight * 0.66} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={paddingY + plotHeight} x2={svgWidth - paddingX} y2={paddingY + plotHeight} stroke="#e2e8f0" strokeWidth="1" />

          {hasData ? (
            <>
              {/* Views Area Fill (Soft Green Gradient) */}
              <path d={viewsAreaPath} fill="rgba(16, 185, 129, 0.08)" />

              {/* Views Line (Dark Forest Green #003822) */}
              <path
                d={viewsPath}
                fill="none"
                stroke="#003822"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Clicks Line (Amber Gold #d97706) */}
              <path
                d={clicksPath}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />

              {/* Data Point Circles with Hover Interactions */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.yViews}
                    r={hoveredPoint?.date === p.date ? 5 : 3.5}
                    fill="#003822"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {p.clicks > 0 && (
                    <circle
                      cx={p.x}
                      cy={p.yClicks}
                      r={hoveredPoint?.date === p.date ? 4.5 : 3}
                      fill="#d97706"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )}
                </g>
              ))}
            </>
          ) : (
            // Subtle baseline placeholder when 0 views/clicks exist
            <line
              x1={paddingX}
              y1={paddingY + plotHeight * 0.75}
              x2={svgWidth - paddingX}
              y2={paddingY + plotHeight * 0.75}
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
          )}
        </svg>

        {/* Interactive Tooltip on Point Hover */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
            top: '20px',
            transform: 'translateX(-50%)',
            background: 'rgba(17, 24, 39, 0.95)',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontWeight: '700', color: '#a7f3d0' }}>{hoveredPoint.date}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <span>Views: <strong style={{ color: '#2ee59d' }}>{hoveredPoint.views}</strong></span>
              <span>Clicks: <strong style={{ color: '#fbbf24' }}>{hoveredPoint.clicks}</strong></span>
              <span>CTR: <strong>{hoveredPoint.views > 0 ? ((hoveredPoint.clicks / hoveredPoint.views) * 100).toFixed(1) + '%' : '0%'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend (Matches Reference Image 2) */}
      <div className="advertiser-chart-legend">
        <div className="legend-item">
          <span className="legend-square-green" />
          <span>Views</span>
        </div>
        <div className="legend-item">
          <span className="legend-line-amber" />
          <span>Clicks</span>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsChart;
