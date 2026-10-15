import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Shield,
  Users,
  Check,
  BadgeCheck,
  Headphones,
  FileText,
  Heart,
  ArrowLeft,
  Sparkles,
  Award,
  Activity,
  Phone
} from 'lucide-react';
import zenveLogo from '../assets/zenve_logo.png';
import loginBgVet from '../assets/login_bg_vet.png';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';
import { api } from '../services/api';

export function LoginPage({ onLoginSuccess, onCancel }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    name: '',
    vciNumber: '',
    phone: '',
    specialty: 'Small Animal Medicine',
    state: 'Karnataka',
    city: 'Bengaluru',
    rememberMe: true
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      let loggedInUser = null;
      if (isRegister) {
        loggedInUser = await api.auth.register({
          name: formData.name,
          email: formData.identifier,
          password: formData.password,
          phone: formData.phone,
          vciNumber: formData.vciNumber,
          specialty: formData.specialty,
          city: formData.city,
          state: formData.state
        });
      } else {
        loggedInUser = await api.auth.login(formData.identifier, formData.password);
      }

      if (loggedInUser?.token) {
        localStorage.setItem('doctor_vet_token', loggedInUser.token);
      }
      if (loggedInUser) {
        localStorage.setItem('doctor_vet_user', JSON.stringify(loggedInUser));
      }

      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div
      className="zenve-modern-portal"
      style={{ backgroundImage: `url(${loginBgVet})` }}
    >
      {/* TOP HEADER NAVIGATION BAR */}
      <header className="portal-topbar">
        <div className="portal-brand-group">
          <img
            src={zenveLogo}
            alt="Zenve Vet Logo"
            className="portal-header-zenve-logo"
          />
          <div className="portal-brand-text-block">
            <span className="brand-zenve">ZENVE</span>
            <span className="brand-vet">VET</span>
            <span className="brand-divider">|</span>
            <span className="brand-tagline">THE PROFESSIONAL NETWORK</span>
          </div>
        </div>

        <div className="portal-topbar-right">
          <div className="portal-tagline-cluster">
            <span className="cluster-item">Better Care</span>
            <span className="cluster-dot">•</span>
            <span className="cluster-item">Healthier Pets</span>
            <span className="cluster-dot">•</span>
            <span className="cluster-item">Stronger Communities</span>
          </div>

          {onCancel && (
            <button className="portal-back-btn" onClick={onCancel} title="Return to Feed">
              <ArrowLeft size={14} />
              <span>Explore Platform</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN TWO-COLUMN CONTENT WORKSPACE */}
      <main className="portal-main-grid">
        {/* LEFT COLUMN: HERO HEADLINE (TOP LEFT OVER OPEN WINDOW) */}
        <section className="portal-hero-column">
          {/* Trust Badge with Live Pulse */}
          <div className="portal-trust-badge">
            <div className="badge-shield-circle">
              <ShieldCheck size={14} color="#065F46" />
            </div>
            <span className="badge-text">Trusted by 10,000+ Veterinary Professionals</span>
            <span className="badge-live-dot" />
          </div>

          {/* Primary Headline */}
          <h1 className="portal-hero-title">
            A World of Care.<br />
            <span className="hero-gradient-text">Connected.</span>
          </h1>

          {/* Subtitle */}
          <p className="portal-hero-subtitle">
            Join 10,000+ veterinary surgeons, physicians, and specialists across 28 states.
          </p>
        </section>

        {/* RIGHT COLUMN: ELEVATED AUTHENTICATION CARD OVER MINT AREA */}
        <section className={`portal-card-column ${isRegister ? 'is-register-mode' : ''}`}>
          <div className={`portal-auth-card ${isRegister ? 'is-register-mode' : ''}`}>
            {/* Card Header with Zenve Golden Logo */}
            <div className="auth-card-header">
              <div className="auth-logo-badge-wrap">
                <img
                  src={zenveLogo}
                  alt="Zenve Logo"
                  className="auth-card-zenve-logo"
                />
              </div>
              <div className="auth-header-text">
                <h2 className="auth-header-title">
                  {isRegister ? 'Create Doctor Account' : 'Welcome to Zenve Vet'}
                </h2>
                <p className="auth-header-sub">
                  {isRegister
                    ? 'Join India’s verified veterinary medical registry'
                    : 'Sign in with your registered Email ID'}
                </p>
              </div>
            </div>

            {/* Segmented Switcher Pill Bar */}
            <div className="auth-segmented-pill-bar">
              <button
                type="button"
                className={`auth-switcher-btn ${!isRegister ? 'is-active' : ''}`}
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              >
                <User size={14} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-switcher-btn ${isRegister ? 'is-active' : ''}`}
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              >
                <UserPlus size={14} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="auth-error-banner">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="auth-form-fields">
              {isRegister ? (
                <>
                  {/* Row 1: Full Name & VCI Registration Number */}
                  <div className="auth-two-col-grid">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Full Name & Title *</label>
                      <div className="auth-input-container">
                        <User size={15} className="auth-input-lead-icon" />
                        <input
                          type="text"
                          required
                          placeholder="Dr. Arjun Mehta, BVSc"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="auth-text-input"
                        />
                      </div>
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-field-label">VCI Registration Number *</label>
                      <div className="auth-input-container">
                        <BadgeCheck size={15} className="auth-input-lead-icon" />
                        <input
                          type="text"
                          required
                          placeholder="VCI-MH-2024-XXXX"
                          value={formData.vciNumber}
                          onChange={(e) => setFormData({ ...formData, vciNumber: e.target.value })}
                          className="auth-text-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Specialty & State */}
                  <div className="auth-two-col-grid">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Specialty *</label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="auth-select-input"
                      >
                        {SPECIALTIES.filter(s => s !== 'All specialties').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-field-label">State *</label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="auth-select-input"
                      >
                        {STATES_INDIA.filter(s => s !== 'All states').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Official Email & Phone Number */}
                  <div className="auth-two-col-grid">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Official Email Address *</label>
                      <div className="auth-input-container">
                        <Mail size={15} className="auth-input-lead-icon" />
                        <input
                          type="email"
                          required
                          placeholder="doctor@clinic.com"
                          value={formData.identifier}
                          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                          className="auth-text-input"
                        />
                      </div>
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-field-label">Phone / Mobile Number</label>
                      <div className="auth-input-container">
                        <Phone size={15} className="auth-input-lead-icon" />
                        <input
                          type="tel"
                          placeholder="+91 98401 23456"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="auth-text-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Password */}
                  <div className="auth-field-group">
                    <label className="auth-field-label">Create Password *</label>
                    <div className="auth-input-container">
                      <Lock size={15} className="auth-input-lead-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Choose password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="auth-text-input"
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Email / Phone / Doctor Name */}
                  <div className="auth-field-group">
                    <label className="auth-field-label">Email ID, Phone Number, or Doctor Name *</label>
                    <div className="auth-input-container">
                      <User size={16} className="auth-input-lead-icon" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. doctor@clinic.com or +91 98401 23456"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        className="auth-text-input"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="auth-field-group">
                    <div className="auth-label-split">
                      <label className="auth-field-label">Password *</label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset verification link has been dispatched to your registered email.')}
                        className="auth-forgot-link"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="auth-input-container">
                      <Lock size={16} className="auth-input-lead-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="auth-text-input"
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="auth-remember-row">
                    <label
                      className="auth-custom-checkbox-label"
                      onClick={() => setFormData({ ...formData, rememberMe: !formData.rememberMe })}
                    >
                      <div className={`auth-custom-checkbox-box ${formData.rememberMe ? 'is-checked' : ''}`}>
                        {formData.rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3.5} />}
                      </div>
                      <span className="auth-checkbox-text">Remember me on this workstation</span>
                    </label>
                  </div>
                </>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? 'Authenticating...'
                    : isRegister
                      ? 'Create Account & Verify Credentials'
                      : 'Sign In to Zenve Vet'}
                </span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </button>
            </form>

            {/* Regulatory Compliance Footer */}
            <div className={`auth-regulatory-box ${isRegister ? 'is-register-mode' : ''}`}>
              <Shield size={15} className="regulatory-icon" />
              <p className="regulatory-copy">
                {isRegister
                  ? 'Zenve Vet authenticates licensed veterinary surgeons under State & National Veterinary Council frameworks.'
                  : 'Zenve Vet strictly authenticates licensed veterinary surgeons and clinical residents under State & National Veterinary Council frameworks.'}
              </p>
            </div>
          </div>

          {/* Compact Feature Pillars beneath Auth Card */}
          <div className="portal-right-pillars-row">
            <div className="right-pillar-pill">
              <Users size={13} color="#065F46" />
              <span>Peer-reviewed cases</span>
            </div>
            <div className="right-pillar-pill">
              <FileText size={13} color="#065F46" />
              <span>CME webinars</span>
            </div>
            <div className="right-pillar-pill">
              <Headphones size={13} color="#065F46" />
              <span>24/7 Helpline</span>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM FOREST GREEN METRICS BAR */}
      <footer className="portal-forest-wave-bar">
        <div className="wave-metric-chip">
          <ShieldCheck size={14} color="#6EE7B7" />
          <span>Real Cases</span>
        </div>
        <div className="wave-metric-sep" />
        <div className="wave-metric-chip">
          <Users size={14} color="#6EE7B7" />
          <span>Real Experts</span>
        </div>
        <div className="wave-metric-sep" />
        <div className="wave-metric-chip">
          <Heart size={14} color="#6EE7B7" />
          <span>Better Outcomes</span>
        </div>
        <div className="wave-metric-sep" />
        <div className="wave-metric-chip active-pulse">
          <Activity size={13} color="#34D399" />
          <span>1,240+ Doctors Online</span>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
