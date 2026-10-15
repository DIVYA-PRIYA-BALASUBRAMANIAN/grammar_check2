import React, { useState } from 'react';
import { 
  Target, 
  ArrowRight, 
  PawPrint, 
  Megaphone, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Send, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  GraduationCap 
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';

export function AdvertiseView() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    tierInterest: 'Sponsored Clinical Masterclass',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const adTiers = [
    {
      title: "Sponsored Clinical Masterclass",
      target: "Specialists & Veterinary Surgeons",
      desc: "Promote hands-on clinical wet labs, surgical demo webinars, or diagnostic imaging workshops directly to verified veterinary practitioners.",
      reach: "5,000+ Active Surgeons",
      icon: GraduationCap,
      color: "teal"
    },
    {
      title: "Pharmaceutical & Nutrition Launchpad",
      target: "Companion Animal & Dairy Practitioners",
      desc: "Feature peer-reviewed clinical trial summaries and therapeutic efficacy data for newly registered veterinary molecules and formulations.",
      reach: "All India Coverage",
      icon: Sparkles,
      color: "gold"
    },
    {
      title: "Hospital Career & Specialist Recruitment",
      target: "Veterinary Residents & Senior Consultants",
      desc: "Targeted job advertisements for super-specialty veterinary hospitals, equine stud farms, and state academic institutions.",
      reach: "100% Verified Doctors",
      icon: Building2,
      color: "purple"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactEmail) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ companyName: '', contactEmail: '', tierInterest: 'Sponsored Clinical Masterclass', message: '' });
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner with Veterinarian & Dog matching site UI */}
      <div className="cases-hero-banner-light">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">Zenve Vet Partner Ecosystem</span>
            <h1 className="hero-headline">Reach 10,000+ Verified Veterinary Doctors.</h1>
            <p className="hero-subtext">
              Connect your pharmaceutical portfolio, surgical instrumentation, or academic conferences with India's leading veterinary minds.
            </p>
            <a 
              href="#inquiry-form" 
              className="btn-make-mark-link"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Request Media Kit</span>
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="hero-photo-wrap">
            <PawPrint size={90} className="hero-paw-watermark" style={{ color: 'rgba(0, 56, 34, 0.12)' }} />
            <img 
              src={heroVetImg} 
              alt="Veterinarian with golden retriever" 
              className="hero-photo-img" 
            />
          </div>
        </div>
      </div>

      {/* 2. Frosted Glass Ecosystem Metric Stats Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '16px 18px',
          boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '4px' }}>
            <Users size={16} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Audience</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: '#003822' }}>10,000+</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Verified Doctors</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '16px 18px',
          boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Coverage</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: '#003822' }}>28 States</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Pan-India Clinics</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '16px 18px',
          boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', marginBottom: '4px' }}>
            <BarChart3 size={16} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Influence</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: '#003822' }}>85%</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Prescribing Leads</div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '16px 18px',
          boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9333ea', marginBottom: '4px' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Engagement</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: '#003822' }}>4.8x</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Higher CTR</div>
        </div>
      </div>

      {/* 3. Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '800', color: '#111827' }}>
          Partnership & Sponsorship Packages
        </h3>
        <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
          Transparent Clinical Distribution
        </span>
      </div>

      {/* 4. Frosted Glass Sponsorship Tiers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {adTiers.map((tier, idx) => {
          const IconComponent = tier.icon;
          return (
            <div 
              key={idx} 
              className="ad-tier-glass-card"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                borderRadius: '18px',
                padding: '24px 22px',
                boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 45, 25, 0.09), 0 0 0 1px rgba(16, 185, 129, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 45, 25, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)';
              }}
            >
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '12px', 
                background: tier.color === 'teal' ? '#e6f7ef' : tier.color === 'gold' ? '#fef3c7' : '#f3e8ff', 
                color: tier.color === 'teal' ? '#003822' : tier.color === 'gold' ? '#d97706' : '#9333ea', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '14px',
                border: '1px solid rgba(0, 168, 107, 0.15)'
              }}>
                <IconComponent size={21} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                {tier.title}
              </h3>

              <div style={{ 
                display: 'inline-block',
                alignSelf: 'flex-start',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                fontSize: '10px',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Target: {tier.target}
              </div>

              <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                {tier.desc}
              </p>

              <div style={{ 
                borderTop: '1px solid #edf0ee', 
                paddingTop: '14px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12.5px', color: '#003822', fontWeight: '700' }}>
                  {tier.reach}
                </span>

                <button
                  style={{
                    backgroundColor: 'rgba(232, 247, 240, 0.9)',
                    color: '#00482b',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '9999px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tierInterest: tier.title }));
                    document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Select</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Frosted Glass Inquiry & Media Kit Form */}
      <div 
        id="inquiry-form"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '18px',
          padding: '28px',
          boxShadow: '0 6px 24px rgba(0, 45, 25, 0.05), 0 0 0 1px rgba(229, 231, 235, 0.6)',
          marginTop: '10px'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '4px' }}>
            <Megaphone size={16} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Direct Media Desk
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: '#003822' }}>
            Request Official Media Kit & Rate Card
          </h3>
          <p style={{ fontSize: '13.5px', color: '#4b5563', marginTop: '2px' }}>
            Our clinical partnerships team will respond with demographic insights and scheduling within 24 hours.
          </p>
        </div>

        {isSubmitted ? (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#065f46'
          }}>
            <CheckCircle2 size={24} color="#059669" />
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '15px' }}>Inquiry Submitted Successfully</h4>
              <p style={{ fontSize: '13px', color: '#047857' }}>
                Thank you! Our veterinary media coordinator has received your details and will dispatch the media kit to your inbox shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Company / Brand Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Zenve Animal Health, Boehringer Labs"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Work Email Address *
                </label>
                <input 
                  type="email"
                  required
                  placeholder="partnerships@brand.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                Campaign Focus or Package
              </label>
              <select 
                value={formData.tierInterest}
                onChange={(e) => setFormData({ ...formData, tierInterest: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none'
                }}
              >
                <option value="Sponsored Clinical Masterclass">Sponsored Clinical Masterclass (Surgeons & Specialists)</option>
                <option value="Pharmaceutical & Nutrition Launchpad">Pharmaceutical & Nutrition Launchpad (Pan-India)</option>
                <option value="Hospital Career & Specialist Recruitment">Hospital Career & Specialist Recruitment</option>
                <option value="Custom Multi-Channel Campaign">Custom Multi-Channel Campaign</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                Campaign Goals & Target Timelines (Optional)
              </label>
              <textarea 
                rows={3}
                placeholder="Share your target audience specialities, launch dates, or key message requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                type="submit"
                style={{
                  backgroundColor: '#003822',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 56, 34, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00a86b';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#003822';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Submit Media Request</span>
                <Send size={15} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 6. Trusted Footer Divider */}
      <div className="search-trusted-footer-divider">
        <div className="search-divider-line" />
        <div className="search-trusted-text">
          <ShieldCheck size={15} color="#059669" />
          <span>Trusted by 50+ veterinary pharmaceuticals & medical device partners across India</span>
        </div>
        <div className="search-divider-line" />
      </div>
    </div>
  );
}
