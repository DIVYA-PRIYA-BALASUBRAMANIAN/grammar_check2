import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Shield,
  Search,
  ChevronRight,
  Building2,
  Scale,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowLeft,
  Mail,
  ExternalLink
} from 'lucide-react';
import { TERMS_METADATA, TERMS_SECTIONS } from '../data/termsData';

export function TermsView({ onBackToFeed }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSectionId, setActiveSectionId] = useState('introduction');

  const categories = useMemo(() => {
    const set = new Set(TERMS_SECTIONS.map((s) => s.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredSections = useMemo(() => {
    return TERMS_SECTIONS.filter((section) => {
      const matchesCategory = selectedCategory === 'All' || section.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = section.title.toLowerCase().includes(q);
      const matchSummary = section.summary.toLowerCase().includes(q);
      const matchContent = section.content.some(
        (c) => c.subtitle.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)
      );

      return matchTitle || matchSummary || matchContent;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="terms-page-view">
      {/* HERO BANNER */}
      <section className="terms-hero-banner">
        <div className="terms-hero-inner">
          <div className="terms-hero-nav-row">
            {onBackToFeed && (
              <button
                type="button"
                className="terms-hero-back-btn"
                onClick={onBackToFeed}
              >
                <ArrowLeft size={16} />
                <span>Return to Feed</span>
              </button>
            )}
            <div className="terms-hero-badge">
              <ShieldCheck size={14} color="#059669" />
              <span>Official Regulatory & Legal Standards</span>
            </div>
          </div>

          <div className="terms-hero-content">
            <h1 className="terms-hero-title">
              Terms & Conditions
            </h1>
            <p className="terms-hero-subtitle">
              Master service agreement and clinical governance guidelines for <strong>{TERMS_METADATA.companyName}</strong>,
              operating the Zenve Vet professional healthcare network.
            </p>
          </div>

          {/* Quick Meta Stats Strip */}
          <div className="terms-hero-stats-row">
            <div className="terms-hero-stat-pill">
              <Building2 size={14} color="#34d399" />
              <span>Entity: <strong>{TERMS_METADATA.companyName}</strong></span>
            </div>
            <div className="terms-hero-stat-pill">
              <Scale size={14} color="#34d399" />
              <span>Jurisdiction: <strong>{TERMS_METADATA.jurisdiction}</strong></span>
            </div>
            <div className="terms-hero-stat-pill">
              <Award size={14} color="#fbbf24" />
              <span>Version: <strong>{TERMS_METADATA.version}</strong></span>
            </div>
            <div className="terms-hero-stat-pill">
              <CheckCircle2 size={14} color="#34d399" />
              <span>Effective: <strong>{TERMS_METADATA.effectiveDate}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTER BAR */}
      <section className="terms-page-controls">
        <div className="terms-search-wrap">
          <Search size={16} className="terms-search-icon" />
          <input
            type="text"
            placeholder="Search clauses (e.g. clinical disclaimer, privacy, advertising, dispute resolution)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="terms-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="terms-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="terms-categories-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`terms-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              {cat === 'All' && ` (${TERMS_SECTIONS.length})`}
            </button>
          ))}
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="terms-page-body-grid">
        {/* STICKY LEFT TOC SIDEBAR */}
        <aside className="terms-page-toc-aside">
          <div className="terms-page-toc-card">
            <h4 className="terms-page-toc-title">DOCUMENT SECTIONS</h4>
            <ul className="terms-page-toc-nav">
              {filteredSections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#page-terms-sec-${sec.id}`}
                    className={`terms-page-toc-link ${activeSectionId === sec.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSectionId(sec.id);
                      const el = document.getElementById(`page-terms-sec-${sec.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    <span className="toc-link-text">{sec.title}</span>
                    <ChevronRight size={13} className="toc-link-icon" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="terms-toc-support-card">
              <Mail size={16} color="#059669" />
              <div>
                <strong>Member Support</strong>
                <p>Questions regarding our clinical terms?</p>
                <a href={`mailto:${(TERMS_METADATA.supportEmail || '').replace(/[\[\]]/g, '')}`} className="terms-toc-email-link">
                  {(TERMS_METADATA.supportEmail || '').replace(/[\[\]]/g, '')}
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT DOCUMENT ARTICLES */}
        <main className="terms-page-articles-col">
          {/* Clinical Highlight Alert */}
          <div className="terms-page-notice-card">
            <div className="notice-icon-box">
              <Shield size={22} color="#003822" />
            </div>
            <div>
              <h3 className="notice-title">
                Notice to Veterinary Surgeons & Clinical Partners
              </h3>
              <p className="notice-copy">
                These Terms and Conditions govern the professional relationship between your clinical practice and
                <strong> Zenve Pets Healthcare Pvt. Ltd.</strong> Every practitioner is expected to observe standard
                clinical ethics, redact pet parent identifiers in public clinical reels, and practice within their
                statutory licensure.
              </p>
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <div className="terms-empty-search">
              <Search size={34} color="#9ca3af" />
              <h3>No matching clauses found</h3>
              <p>We couldn't find any terms matching "{searchQuery}".</p>
              <button
                type="button"
                className="terms-reset-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredSections.map((section) => {
              const isClinicalDisclaimer = section.id === 'clinical-disclaimer';
              const isPatientPrivacy = section.id === 'patient-privacy';
              const isAdvertiser = section.id === 'advertisers';

              return (
                <article
                  key={section.id}
                  id={`page-terms-sec-${section.id}`}
                  className={`terms-page-article-card ${isClinicalDisclaimer ? 'highlight-clinical' : ''} ${isPatientPrivacy ? 'highlight-privacy' : ''}`}
                >
                  <div className="article-header">
                    <div className="article-tag-row">
                      <span className="article-category-badge">{section.category}</span>
                      {isClinicalDisclaimer && (
                        <span className="terms-special-badge clinical-alert">
                          <AlertTriangle size={12} />
                          <span>Clinical Peer Exchange Only</span>
                        </span>
                      )}
                      {isPatientPrivacy && (
                        <span className="terms-special-badge privacy-alert">
                          <Lock size={12} />
                          <span>Strict De-Identification Required</span>
                        </span>
                      )}
                      {isAdvertiser && (
                        <span className="terms-special-badge commercial-badge">
                          <Sparkles size={12} />
                          <span>Commercial Verification Mandate</span>
                        </span>
                      )}
                    </div>
                    <h2 className="article-heading">{section.title}</h2>
                    <p className="article-summary">{section.summary}</p>
                  </div>

                  <div className="article-body">
                    {section.content.map((clause, idx) => (
                      <div key={idx} className="article-clause-block">
                        <h4 className="clause-subtitle">{clause.subtitle}</h4>
                        <p className="clause-text">{clause.text}</p>
                      </div>
                    ))}
                  </div>

                  {isClinicalDisclaimer && (
                    <div className="terms-callout-warning-box">
                      <AlertTriangle size={20} color="#b45309" className="warning-box-icon" />
                      <div>
                        <strong>Statutory Medical Disclaimer:</strong>
                        <p>
                          Zenve Vet does not practice veterinary medicine or provide clinical consultations directly to pet owners.
                          Treating veterinary surgeons maintain individual, full professional and legal accountability for
                          all medical diagnoses, prescriptions, surgical procedures, and clinical outcomes.
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}

          {/* Corporate Footer */}
          <footer className="terms-page-corporate-footer">
            <div className="footer-company-row">
              <Building2 size={18} color="#059669" />
              <h3>{TERMS_METADATA.companyName}</h3>
            </div>
            <p className="footer-reg-details">
              Incorporated under the Companies Act, India • Bengaluru, Karnataka, India
            </p>
            <div className="footer-links-grid" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
              <div>
                <strong>Doctor & Advertiser Support Desk</strong>
                <p>Technical assistance, campaigns & verified accounts</p>
                <a href={`mailto:${(TERMS_METADATA.supportEmail || '').replace(/[\[\]]/g, '')}`}>{(TERMS_METADATA.supportEmail || '').replace(/[\[\]]/g, '')}</a>
              </div>
            </div>
            <div className="footer-copyright-row">
              <span>© {new Date().getFullYear()} {TERMS_METADATA.companyName}. All rights reserved.</span>
              <span className="dot">•</span>
              <span>Zenve Vet™ is a registered service of Zenve Pets Healthcare Pvt. Ltd.</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default TermsView;
