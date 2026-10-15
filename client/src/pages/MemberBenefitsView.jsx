import React from 'react';
import { 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Tag, 
  ArrowRight, 
  Crown, 
  Sparkles, 
  PawPrint 
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';

export function MemberBenefitsView({ onOpenCreateProfile }) {
  const benefits = [
    {
      icon: Award,
      title: "Accredited Veterinary CME Programs",
      desc: "Earn verified Continuing Medical Education points across small animal orthopedics, feline internal medicine, and equine sports health.",
      badge: "Accredited Points",
      color: "gold"
    },
    {
      icon: Tag,
      title: "Consortium Group Discounts on Equipment",
      desc: "Direct negotiated volume rates on digital radiography, autoclave sterilizers, dental scaling units, and specialized orthopedic surgical sets.",
      badge: "Up to 30% Savings",
      color: "teal"
    },
    {
      icon: ShieldCheck,
      title: "Medico-Legal Advisory & Defense Hotline",
      desc: "Confidential 24/7 clinical malpractice advisory with senior veterinary council legal consultants.",
      badge: "Legal Protection",
      color: "green"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Drug Index & Formularies",
      desc: "Instant access to evidence-based multi-species dosing calculators, antimicrobial stewardship guidelines, and drug interaction checkers.",
      badge: "Clinical Tool",
      color: "purple"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner with Veterinarian & Dog */}
      <div className="cases-hero-banner-light">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">Zenve Vet Privilege</span>
            <h1 className="hero-headline">Elevate Your Veterinary Practice.</h1>
            <p className="hero-subtext">
              Exclusive clinical privileges, accredited continuing education, and institutional discounts for verified veterinarians.
            </p>
            <button 
              className="btn-make-mark-link"
              onClick={onOpenCreateProfile}
            >
              <span>Claim Member Privileges</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="hero-photo-wrap">
            <PawPrint size={90} className="hero-paw-watermark" style={{ color: 'rgba(0, 56, 34, 0.15)' }} />
            <img 
              src={heroVetImg} 
              alt="Veterinarian with dog" 
              className="hero-photo-img" 
            />
          </div>
        </div>
      </div>

      {/* 2. Glassy Member Benefits Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
        {benefits.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div 
              key={idx} 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid rgba(229, 231, 235, 0.9)',
                boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 45, 25, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 45, 25, 0.04)';
              }}
            >
              {/* Card Header with Icon & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: b.color === 'gold' ? '#fef3c7' : b.color === 'teal' ? '#e0f2fe' : b.color === 'purple' ? '#f3e8ff' : '#ecfdf5',
                  color: b.color === 'gold' ? '#d97706' : b.color === 'teal' ? '#0284c7' : b.color === 'purple' ? '#9333ea' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} />
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  padding: '3px 9px',
                  borderRadius: '4px'
                }}>
                  {b.badge}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16.5px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                {b.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', marginBottom: '18px', flex: 1 }}>
                {b.desc}
              </p>

              {/* Action Button */}
              <button 
                onClick={onOpenCreateProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#003822',
                  fontWeight: '700',
                  fontSize: '13px',
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: '12px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#00a86b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#003822'}
              >
                <span>Access Benefit</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
