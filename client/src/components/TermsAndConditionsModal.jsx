import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Shield,
  ShieldCheck,
  Search,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Scale,
  Sparkles,
  Lock,
  Mail,
  Award
} from 'lucide-react';
import { TERMS_METADATA, TERMS_SECTIONS } from '../data/termsData';

export function TermsAndConditionsModal({
  isOpen,
  onClose,
  initialSectionId = null,
  onAccept = null,
  requireAcceptance = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId || 'introduction');
  const [hasAgreed, setHasAgreed] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(TERMS_SECTIONS.map((s) => s.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter sections by search and category
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

  if (!isOpen) return null;

  const handleAcceptSubmit = () => {
    if (onAccept) {
      onAccept();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className="terms-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div
        className="terms-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <header className="terms-modal-header">
          <div className="terms-header-left">
            <div className="terms-brand-badge-wrap">
              <ShieldCheck size={22} className="terms-shield-icon" />
            </div>
            <div>
              <div className="terms-entity-subline">
                <span>{TERMS_METADATA.companyName}</span>
                <span className="terms-meta-bullet">•</span>
                <span className="terms-platform-tag">Official Legal Agreement</span>
              </div>
              <h2 id="terms-modal-title" className="terms-modal-title">
                Terms and Conditions of Service
              </h2>
            </div>
          </div>

          <div className="terms-header-actions">
            <button
              type="button"
              className="terms-close-btn"
              onClick={onClose}
              aria-label="Close Terms modal"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* METADATA STRIP */}
        <div className="terms-meta-strip">
          <div className="terms-meta-item">
            <Building2 size={14} color="#059669" />
            <span><strong>Operating Entity:</strong> {TERMS_METADATA.companyName}</span>
          </div>
          <div className="terms-meta-divider" />
          <div className="terms-meta-item">
            <Scale size={14} color="#059669" />
            <span><strong>Governing Law:</strong> {TERMS_METADATA.jurisdiction}</span>
          </div>
          <div className="terms-meta-divider" />
          <div className="terms-meta-item">
            <Award size={14} color="#c5a059" />
            <span><strong>Release:</strong> {TERMS_METADATA.version}</span>
          </div>
          <div className="terms-meta-divider" />
          <div className="terms-meta-item">
            <CheckCircle2 size={14} color="#059669" />
            <span><strong>Effective Date:</strong> {TERMS_METADATA.effectiveDate}</span>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH & CATEGORY PILLS */}
        <div className="terms-controls-bar">
          <div className="terms-search-wrap">
            <Search size={15} className="terms-search-icon" />
            <input
              type="text"
              placeholder="Search legal clauses, clinical disclaimers, advertiser standards..."
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
                <X size={13} />
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
        </div>

        {/* MODAL MAIN CONTENT AREA: TWO-COLUMN WORKSPACE */}
        <div className="terms-main-layout">
          {/* LEFT INDEX NAV */}
          <nav className="terms-toc-sidebar" aria-label="Table of Contents">
            <div className="terms-toc-header">
              <span>TABLE OF CONTENTS</span>
            </div>
            <ul className="terms-toc-list">
              {filteredSections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <li key={sec.id}>
                    <button
                      type="button"
                      className={`terms-toc-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSectionId(sec.id);
                        const el = document.getElementById(`terms-sec-${sec.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      <div className="terms-toc-label-wrap">
                        <span className="terms-toc-title">{sec.title}</span>
                        <span className="terms-toc-category-tag">{sec.category}</span>
                      </div>
                      <ChevronRight size={13} className="terms-toc-arrow" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT SCROLLABLE DOCUMENT BODY */}
          <div className="terms-document-scroll">
            {/* Quick Summary Banner */}
            <div className="terms-summary-callout">
              <div className="summary-callout-icon">
                <Shield size={20} color="#003822" />
              </div>
              <div>
                <h4 className="summary-callout-title">
                  Zenve Pets Healthcare Pvt. Ltd. Regulatory Framework
                </h4>
                <p className="summary-callout-desc">
                  Zenve Vet is an evidence-based clinical platform restricted to registered veterinary doctors, surgeons,
                  and verified healthcare enterprises. All users are bound to clinical peer review standards, patient owner
                  privacy protections, and Indian Information Technology & DPDP Act compliance.
                </p>
              </div>
            </div>

            {filteredSections.length === 0 ? (
              <div className="terms-empty-search">
                <Search size={32} color="#9ca3af" />
                <h4>No matching terms or clauses found</h4>
                <p>Try searching with another keyword like "clinical", "privacy", "liability", or "advertiser".</p>
                <button
                  type="button"
                  className="terms-reset-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredSections.map((section) => {
                const isClinicalDisclaimer = section.id === 'clinical-disclaimer';
                const isPatientPrivacy = section.id === 'patient-privacy';
                const isAdvertiser = section.id === 'advertisers';

                return (
                  <section
                    key={section.id}
                    id={`terms-sec-${section.id}`}
                    className={`terms-section-block ${isClinicalDisclaimer ? 'highlight-clinical' : ''} ${isPatientPrivacy ? 'highlight-privacy' : ''}`}
                  >
                    <div className="terms-section-header">
                      <div className="terms-sec-badge-row">
                        <span className="terms-sec-tag">{section.category}</span>
                        {isClinicalDisclaimer && (
                          <span className="terms-special-badge clinical-alert">
                            <AlertTriangle size={12} />
                            <span>Mandatory Clinical Protocol</span>
                          </span>
                        )}
                        {isPatientPrivacy && (
                          <span className="terms-special-badge privacy-alert">
                            <Lock size={12} />
                            <span>Confidentiality Mandate</span>
                          </span>
                        )}
                        {isAdvertiser && (
                          <span className="terms-special-badge commercial-badge">
                            <Sparkles size={12} />
                            <span>Enterprise Advertiser Standards</span>
                          </span>
                        )}
                      </div>
                      <h3 className="terms-section-heading">{section.title}</h3>
                      <p className="terms-section-summary">{section.summary}</p>
                    </div>

                    <div className="terms-section-clauses">
                      {section.content.map((clause, idx) => (
                        <div key={idx} className="terms-clause-item">
                          <h4 className="terms-clause-subtitle">{clause.subtitle}</h4>
                          <p className="terms-clause-text">{clause.text}</p>
                        </div>
                      ))}
                    </div>

                    {isClinicalDisclaimer && (
                      <div className="terms-callout-warning-box">
                        <AlertTriangle size={18} color="#b45309" className="warning-box-icon" />
                        <div>
                          <strong>Important Clinical Notice:</strong>
                          <p>
                            Zenve Vet facilitates peer collaboration only. The attending veterinarian holds exclusive
                            statutory and clinical liability for animal diagnosis, treatment decisions, drug prescriptions,
                            and surgical interventions.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })
            )}

            {/* Corporate Footer Inset */}
            <div className="terms-document-corporate-footer">
              <div className="corporate-emblem-row">
                <Building2 size={16} color="#059669" />
                <span className="corporate-name">{TERMS_METADATA.companyName}</span>
              </div>
              <p className="corporate-address">
                Registered under the Companies Act, India • Bengaluru, Karnataka, India
              </p>
              <p className="corporate-contact-links">
                <span>Member Support: <a href={`mailto:${(TERMS_METADATA.supportEmail || '').replace(/[\[\]]/g, '')}`}>{(TERMS_METADATA.supportEmail || '').replace(/[\[\]]/g, '')}</a></span>
              </p>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <footer className="terms-modal-footer">
          <div className="terms-footer-left">
            {requireAcceptance ? (
              <label className="terms-agree-checkbox-label">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="terms-checkbox-input"
                />
                <span>
                  I confirm that I am a licensed veterinary professional/partner and I accept the Terms & Conditions of <strong>Zenve Pets Healthcare Pvt. Ltd.</strong>
                </span>
              </label>
            ) : (
              <span className="terms-copyright-copy">
                © {new Date().getFullYear()} {TERMS_METADATA.companyName}. All rights reserved.
              </span>
            )}
          </div>

          <div className="terms-footer-right">
            {requireAcceptance ? (
              <>
                <button
                  type="button"
                  className="terms-cancel-btn"
                  onClick={onClose}
                >
                  Decline & Close
                </button>
                <button
                  type="button"
                  className="terms-accept-btn"
                  disabled={!hasAgreed}
                  onClick={handleAcceptSubmit}
                >
                  <CheckCircle2 size={16} />
                  <span>Accept & Continue</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="terms-primary-close-btn"
                onClick={onClose}
              >
                <span>Close Document</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TermsAndConditionsModal;
