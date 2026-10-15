import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Key,
  LogOut,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { api } from '../services/api';
import { AdvertiserAuthModal } from '../components/advertiser/AdvertiserAuthModal';
import { CampaignFormModal } from '../components/advertiser/CampaignFormModal';
import { AccessKeyModal } from '../components/advertiser/AccessKeyModal';
import { AnalyticsChart } from '../components/advertiser/AnalyticsChart';
import { CampaignPerformanceTable } from '../components/advertiser/CampaignPerformanceTable';
import { AdvertiseHeroBanner } from '../components/advertiser/AdvertiseHeroBanner';

export function AdvertiseView({ onCampaignsUpdated }) {
  // 1. Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('zenve_advertiser_token') || '');
  const [account, setAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('zenve_advertiser_account');
      if (saved) return JSON.parse(saved);
      return null;
    } catch (e) {
      return null;
    }
  });

  // 2. Active Tab ('campaigns' | 'reports')
  const [activeTab, setActiveTab] = useState('campaigns');

  // 3. Campaigns List State
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // 4. Reports Tab State
  const [reportPreset, setReportPreset] = useState('Last 7 days');
  const [fromDate, setFromDate] = useState('2026-10-09');
  const [toDate, setToDate] = useState('2026-10-15');
  const [reportsData, setReportsData] = useState({
    totalViews: 0,
    totalClicks: 0,
    ctr: '0.00%',
    chartData: [],
    campaigns: []
  });
  const [loadingReports, setLoadingReports] = useState(false);

  // 5. Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isAccessKeyOpen, setIsAccessKeyOpen] = useState(false);

  // 6. Notifications
  const [successToast, setSuccessToast] = useState('');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Listen for advertiser:unauthorized events
  useEffect(() => {
    const onAdvUnauthorized = () => {
      localStorage.removeItem('zenve_advertiser_token');
      localStorage.removeItem('zenve_advertiser_account');
      setToken('');
      setAccount(null);
      setCampaigns([]);
    };
    window.addEventListener('advertiser:unauthorized', onAdvUnauthorized);
    return () => window.removeEventListener('advertiser:unauthorized', onAdvUnauthorized);
  }, []);

  // Sync profile from backend on mount
  useEffect(() => {
    async function loadProfile() {
      if (!account) return;
      if (!token && !account.accessKey) return;
      try {
        const profile = await api.advertisers.getMe(token, account.accessKey);
        if (profile) {
          const updated = {
            name: profile.fullName || account.name,
            email: profile.businessEmail || account.email,
            company: profile.companyName || account.company,
            accessKey: profile.accessKey || account.accessKey,
            accountType: profile.accountType
          };
          setAccount(updated);
          localStorage.setItem('zenve_advertiser_account', JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('Backend advertiser profile fetch (using local state):', err.message);
        if (err.message && err.message.includes('Unauthorized')) {
          localStorage.removeItem('zenve_advertiser_token');
          localStorage.removeItem('zenve_advertiser_account');
          setToken('');
          setAccount(null);
          setCampaigns([]);
        }
      }
    }
    loadProfile();
  }, [token]);

  // Load Campaigns from backend
  const fetchCampaigns = async () => {
    if (!account) return;
    if (!token && !account.accessKey) return;
    try {
      setLoadingCampaigns(true);
      const res = await api.campaigns.getAll(token, account.accessKey);
      if (Array.isArray(res)) {
        setCampaigns(res.map(c => ({
          ...c,
          views: c.viewsCount || 0,
          clicks: c.clicksCount || 0
        })));
      }
    } catch (err) {
      console.warn('Failed to load campaigns from backend:', err.message);
      if (err.message && err.message.includes('Unauthorized')) {
        localStorage.removeItem('zenve_advertiser_token');
        localStorage.removeItem('zenve_advertiser_account');
        setToken('');
        setAccount(null);
        setCampaigns([]);
      }
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [account, token]);

  // Load Reports from backend
  const fetchReports = async () => {
    if (!account) return;
    if (!token && !account.accessKey) return;
    try {
      setLoadingReports(true);
      const res = await api.campaigns.getReports({
        preset: reportPreset,
        from: fromDate,
        to: toDate
      }, token, account.accessKey);

      if (res) {
        setReportsData({
          totalViews: res.totalViews || 0,
          totalClicks: res.totalClicks || 0,
          ctr: res.ctr || '0.00%',
          chartData: res.chartData || [],
          campaigns: res.campaigns || []
        });
      }
    } catch (err) {
      console.warn('Failed to load reports from backend:', err.message);
      if (err.message && err.message.includes('Unauthorized')) {
        localStorage.removeItem('zenve_advertiser_token');
        localStorage.removeItem('zenve_advertiser_account');
        setToken('');
        setAccount(null);
      }
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, reportPreset, fromDate, toDate, account, token]);

  // Handle Sign Out
  const handleSignOut = () => {
    if (window.confirm('Sign out of your advertiser dashboard?')) {
      localStorage.removeItem('zenve_advertiser_token');
      localStorage.removeItem('zenve_advertiser_account');
      setToken('');
      setAccount(null);
      setCampaigns([]);
    }
  };

  // Handle Successful Login or Registration
  const handleAuthSuccess = (newAccount, newToken) => {
    setAccount({
      name: newAccount.fullName || newAccount.name,
      email: newAccount.businessEmail || newAccount.email,
      company: newAccount.companyName || newAccount.company,
      accessKey: newAccount.accessKey,
      accountType: newAccount.accountType
    });
    setToken(newToken);
    showToast(`Welcome, ${newAccount.fullName || newAccount.name}! Advertiser dashboard is ready.`);
    fetchCampaigns();
  };

  // Handle Campaign Created
  const handleCampaignCreated = (newCamp) => {
    setCampaigns(prev => [newCamp, ...prev]);
    showToast('Campaign successfully submitted and published live on Home Feed!');
    fetchCampaigns();
    if (onCampaignsUpdated) onCampaignsUpdated();
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset) => {
    setReportPreset(preset);
    if (preset === 'Today') {
      setFromDate('2026-10-15');
      setToDate('2026-10-15');
    } else if (preset === 'Last 7 days') {
      setFromDate('2026-10-09');
      setToDate('2026-10-15');
    } else if (preset === 'Last 30 days') {
      setFromDate('2026-09-15');
      setToDate('2026-10-15');
    } else if (preset === 'This month') {
      setFromDate('2026-10-01');
      setToDate('2026-10-15');
    }
  };

  // Handle CSV Download
  const handleDownloadCSV = () => {
    try {
      const url = api.campaigns.getCsvUrl(fromDate, toDate, token, account?.accessKey);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `zenve_advertiser_report_${fromDate}_to_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Clinical advertising report CSV downloaded.');
    } catch (err) {
      alert('Failed to download CSV: ' + err.message);
    }
  };

  // Computed Metrics
  const totalCampaigns = campaigns.length;
  const liveCampaigns = campaigns.filter(c => c.status === 'Live').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;
  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);

  // If no account is logged in, show the Onboarding View with the Hero Banner and Register / Sign in buttons
  if (!account) {
    return (
      <div className="advertiser-dashboard-wrapper" style={{ paddingTop: '16px' }}>
        {/* Value Proposition Hero Banner */}
        <AdvertiseHeroBanner />

        <div className="advertiser-onboard-card" style={{ maxWidth: '640px', margin: '24px auto', textAlign: 'center' }}>
          <div className="advertiser-onboard-icon-badge">
            <Megaphone size={32} color="#003822" />
          </div>

          <span className="advertiser-kicker" style={{ color: '#059669', marginBottom: '6px', display: 'inline-block' }}>
            Zenve Vet Partner Portal
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            Welcome to the Advertiser Portal
          </h1>
          <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: 1.5, marginBottom: '28px' }}>
            Reach 10,000+ verified veterinary surgeons and clinical specialists across India. Promote clinical wet labs, pharmaceutical masterclasses, surgical instrumentation, and specialist careers.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', margin: '0 auto' }}>
            <button
              className="advertiser-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
            >
              <span>Create Advertiser Account</span>
            </button>

            <button
              className="advertiser-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
            >
              <span>Existing Advertiser Sign In</span>
            </button>
          </div>

          <AdvertiserAuthModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="advertiser-dashboard-wrapper">
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#003822',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '12px 20px',
          boxShadow: '0 8px 24px rgba(0, 56, 34, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: '700',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} color="#2ee59d" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 0. Value Proposition Hero Banner (Exact match to user uploaded reference) */}
      <AdvertiseHeroBanner />

      {/* 1. Header Row (ADVERTISER DASHBOARD / vasanth M / Access key / Sign out) */}
      <div className="advertiser-header-row">
        <div>
          <div className="advertiser-kicker">ADVERTISER DASHBOARD</div>
          <h1 className="advertiser-name">{account.name}</h1>
          <div className="advertiser-email">{account.email}</div>
        </div>

        <div className="advertiser-header-actions">
          <button
            className="advertiser-btn-secondary"
            onClick={() => setIsAccessKeyOpen(true)}
            title="View or copy your advertiser API access key"
          >
            <Key size={14} />
            <span>Access key</span>
          </button>

          <button
            className="advertiser-btn-secondary"
            onClick={handleSignOut}
            title="Sign out of advertiser dashboard"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* 2. Tabs Bar Row (Campaigns / Reports / + New campaign) */}
      <div className="advertiser-tabs-bar">
        <div className="advertiser-tabs-left">
          <button
            className={`advertiser-tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <Megaphone size={15} />
            <span>Campaigns</span>
          </button>

          <button
            className={`advertiser-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span>Reports</span>
          </button>
        </div>

        <button
          className="advertiser-btn-new-campaign"
          onClick={() => setIsNewCampaignOpen(true)}
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>New campaign</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: CAMPAIGNS VIEW (Exact Match to Reference Image 1)
          ======================================================== */}
      {activeTab === 'campaigns' && (
        <div className="advertiser-tab-body">
          {/* 4 Metric Stat Cards */}
          <div className="advertiser-metric-grid-4">
            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label">TOTAL CAMPAIGNS</div>
              <div className="advertiser-stat-value">{totalCampaigns}</div>
            </div>

            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label" style={{ color: '#047857' }}>ACTIVE ON LIVE FEED</div>
              <div className="advertiser-stat-value" style={{ color: '#047857' }}>{liveCampaigns}</div>
            </div>

            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label" style={{ color: '#475569' }}>CAMPAIGN HISTORY</div>
              <div className="advertiser-stat-value" style={{ color: '#475569' }}>{completedCampaigns}</div>
            </div>

            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label">ALL-TIME VIEWS</div>
              <div className="advertiser-stat-value">{totalViews.toLocaleString()}</div>
            </div>
          </div>

          {/* Empty State / Campaigns List */}
          {campaigns.length === 0 ? (
            <div className="advertiser-empty-box">
              <div className="advertiser-empty-icon-wrap">
                <Megaphone size={36} color="#d97706" strokeWidth={1.8} />
              </div>
              <h3 className="advertiser-empty-title">Create your first campaign</h3>
              <p className="advertiser-empty-desc">
                Upload a poster, add your link and pick your dates. Our team reviews it before it goes live.
              </p>
            </div>
          ) : (
            <div className="advertiser-campaigns-list-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>Your Active Campaigns</h3>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                  {liveCampaigns} Running Pan-India
                </span>
              </div>

              <div className="advertiser-campaigns-grid">
                {campaigns.map((c) => (
                  <div key={c.id} className="advertiser-campaign-item-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className={`status-pill ${c.status === 'Live' ? 'status-live' : 'status-review'}`}>
                            {c.status}
                          </span>
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>{c.placement}</span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '4px 0' }}>
                          {c.title}
                        </h4>
                        <a
                          href={c.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '12px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                        >
                          <span>{c.destinationUrl}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Daily Budget</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#003822' }}>
                          {typeof c.dailyBudget === 'number' ? `₹${c.dailyBudget.toLocaleString()}` : c.dailyBudget}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', gap: '18px' }}>
                        <div>
                          <div style={{ fontSize: '10.5px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700' }}>Views</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{(c.views || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10.5px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700' }}>Clicks</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{(c.clicks || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10.5px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700' }}>CTR</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}>
                            {c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(2) + '%' : '0.00%'}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                        {c.startDate} to {c.endDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: REPORTS VIEW (Exact Match to Reference Image 2)
          ======================================================== */}
      {activeTab === 'reports' && (
        <div className="advertiser-tab-body">
          {/* Reports Filter Bar */}
          <div className="advertiser-reports-filter-bar">
            {/* Presets Group: Today / Last 7 days / Last 30 days / This month */}
            <div className="advertiser-presets-group">
              {['Today', 'Last 7 days', 'Last 30 days', 'This month'].map((preset) => (
                <button
                  key={preset}
                  className={`advertiser-preset-btn ${reportPreset === preset ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Date Range Pickers (From [ 10/09/2026 📅 ]  To [ 10/15/2026 📅 ]) */}
            <div className="advertiser-date-range-group">
              <div className="advertiser-date-input-wrap">
                <span className="advertiser-date-label">From</span>
                <div className="advertiser-date-field">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Calendar size={13} className="advertiser-date-icon" />
                </div>
              </div>

              <div className="advertiser-date-input-wrap">
                <span className="advertiser-date-label">To</span>
                <div className="advertiser-date-field">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <Calendar size={13} className="advertiser-date-icon" />
                </div>
              </div>
            </div>

            {/* Download CSV Button */}
            <button
              className="advertiser-btn-secondary"
              onClick={handleDownloadCSV}
              title="Download reports data as CSV"
            >
              <Download size={14} />
              <span>Download CSV</span>
            </button>
          </div>

          {/* 3 Metric Stat Cards (VIEWS / CLICKS / CLICK-THROUGH RATE) */}
          <div className="advertiser-metric-grid-3">
            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label">VIEWS</div>
              <div className="advertiser-stat-value">{reportsData.totalViews}</div>
              <div className="advertiser-stat-sub">-</div>
            </div>

            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label">CLICKS</div>
              <div className="advertiser-stat-value">{reportsData.totalClicks}</div>
              <div className="advertiser-stat-sub">-</div>
            </div>

            <div className="advertiser-stat-card">
              <div className="advertiser-stat-label">CLICK-THROUGH RATE</div>
              <div className="advertiser-stat-value">{reportsData.ctr}</div>
              <div className="advertiser-stat-sub">-</div>
            </div>
          </div>

          {/* Chart Container (Views green, Clicks gold) */}
          <AnalyticsChart
            chartData={reportsData.chartData}
            totalViews={reportsData.totalViews}
            totalClicks={reportsData.totalClicks}
          />

          {/* Campaign Performance Table */}
          <CampaignPerformanceTable
            campaigns={campaigns}
          />
        </div>
      )}

      {/* ========================================================
          MODALS
          ======================================================== */}
      {/* 1. New Campaign Modal */}
      <CampaignFormModal
        isOpen={isNewCampaignOpen}
        onClose={() => setIsNewCampaignOpen(false)}
        onCampaignCreated={handleCampaignCreated}
        token={token}
        accessKey={account.accessKey}
      />

      {/* 2. Access Key Modal */}
      <AccessKeyModal
        isOpen={isAccessKeyOpen}
        onClose={() => setIsAccessKeyOpen(false)}
        accessKey={account.accessKey}
        token={token}
        onKeyUpdated={(newKey) => {
          setAccount(prev => ({ ...prev, accessKey: newKey }));
          showToast('New access key active.');
        }}
      />

      {/* 3. Advertiser Auth Modal (for switching accounts or registering) */}
      <AdvertiserAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default AdvertiseView;
