import React from 'react';
import { Users, ShieldCheck, Eye } from 'lucide-react';

export function AdvertiseHeroBanner() {
  return (
    <div className="advertiser-hero-banner">
      <div className="advertiser-hero-kicker">ADVERTISE ON ZENVE VET</div>

      <h2 className="advertiser-hero-heading">
        Reach India’s veterinary professionals where they share their work.
      </h2>

      <p className="advertiser-hero-subtitle">
        Your poster appears as a sponsored post inside the doctors’ feed — clearly labelled, reviewed by our team, measured with daily views and clicks.
      </p>

      <div className="advertiser-hero-cards-grid">
        <div className="advertiser-hero-card">
          <div className="advertiser-hero-card-icon">
            <Users size={24} color="#c5a059" strokeWidth={1.8} />
          </div>
          <h3 className="advertiser-hero-card-title">Doctors & clinics</h3>
          <p className="advertiser-hero-card-desc">
            Small-animal, livestock, equine and research professionals across India.
          </p>
        </div>

        <div className="advertiser-hero-card">
          <div className="advertiser-hero-card-icon">
            <ShieldCheck size={24} color="#c5a059" strokeWidth={1.8} />
          </div>
          <h3 className="advertiser-hero-card-title">Reviewed before going live</h3>
          <p className="advertiser-hero-card-desc">
            Every campaign is checked by the Zenve Vet team, keeping the feed trustworthy.
          </p>
        </div>

        <div className="advertiser-hero-card">
          <div className="advertiser-hero-card-icon">
            <Eye size={24} color="#c5a059" strokeWidth={1.8} />
          </div>
          <h3 className="advertiser-hero-card-title">Transparent reports</h3>
          <p className="advertiser-hero-card-desc">
            Views, clicks and click-through rate by day and by campaign.
          </p>
        </div>
      </div>

      <div className="advertiser-hero-footer">
        Pricing on request — write to{' '}
        <a
          href="mailto:zenvefashions@gmail.com"
          className="advertiser-hero-email-link"
        >
          zenvefashions@gmail.com
        </a>
        .
      </div>
    </div>
  );
}

export default AdvertiseHeroBanner;
