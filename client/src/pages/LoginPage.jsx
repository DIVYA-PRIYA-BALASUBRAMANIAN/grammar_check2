import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  PawPrint,
  Stethoscope,
  Award,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';
import { api } from '../services/api';

export function LoginPage({ onLoginSuccess, onCancel }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Email ID
    password: '',
    name: '',
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
          specialty: formData.specialty,
          city: formData.city,
          state: formData.state
        });
      } else {
        loggedInUser = await api.auth.login(formData.identifier, formData.password);
      }

      if (formData.rememberMe && loggedInUser) {
        localStorage.setItem('doctor_vet_user', JSON.stringify(loggedInUser));
      }

      setIsLoading(false);
      onLoginSuccess && onLoginSuccess(loggedInUser);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="login-page-container">
      {/* Back to Platform Button */}
      {onCancel && (
        <button className="login-back-btn" onClick={onCancel} title="Return to Platform">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>
      )}

      {/* Main Glassy Authentication Card Split Layout */}
      <div className="login-glass-card">
        {/* Left Side: Brand Story & Testimonial with Hero Image */}
        <div className="login-left-brand-panel">
          <div className="login-brand-header">
            <div className="brand-paw-emblem">
              <PawPrint size={22} fill="#ffffff" />
            </div>
            <div>
              <span className="brand-main-name">Zenve Vet</span>
              <span className="brand-main-subtitle">The Professional Network</span>
            </div>
          </div>

          <div className="login-hero-pitch">
            <span className="hero-tag-kicker" style={{ color: '#a7f3d0' }}>
              Verified Veterinary Practitioners
            </span>
            <h1 className="login-hero-headline">
              A World of Care.<br />
              <span style={{ color: '#2ee59d' }}>Connected.</span>
            </h1>
            <p className="login-hero-subtext">
              Join 10,000+ veterinary surgeons, physicians, and specialists across 28 states sharing complex clinical cases and clinical breakthroughs.
            </p>
          </div>

          {/* Golden Retriever & Doctor Visual Banner Preview */}
          <div className="login-hero-image-wrap">
            <img
              src={heroVetImg}
              alt="Veterinarian with dog"
              className="login-hero-img"
            />
            <div className="login-image-overlay-pill">
              <ShieldCheck size={13} color="#2ee59d" />
              <span>Verified Veterinary Community</span>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="login-trust-points">
            <div className="login-trust-item">
              <CheckCircle2 size={15} color="#2ee59d" />
              <span>Peer-reviewed case discussions</span>
            </div>
            <div className="login-trust-item">
              <CheckCircle2 size={15} color="#2ee59d" />
              <span>Accredited CME & Surgical wet labs</span>
            </div>
            <div className="login-trust-item">
              <CheckCircle2 size={15} color="#2ee59d" />
              <span>24/7 Medico-legal advisory helpline</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="login-right-form-panel">
          {/* Top Form Header */}
          <div className="login-form-header">
            <h2 className="login-form-title">
              {isRegister ? 'Create Doctor Account' : 'Welcome to Doctor Vet'}
            </h2>
            <p className="login-form-subtitle">
              {isRegister
                ? 'Join India’s verified veterinary medical registry'
                : 'Sign in with your registered Email ID'}
            </p>
          </div>

          {/* Tab Switcher: Sign In vs Register */}
          <div className="login-tabs-bar">
            <button
              type="button"
              className={`login-tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="login-error-alert">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form-fields">
            {/* If Registering: Name & Specialty */}
            {isRegister && (
              <>
                <div className="form-group-field">
                  <label className="field-label">Full Doctor Name *</label>
                  <div className="field-input-wrap">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Priya Nair, BVSc"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group-field">
                    <label className="field-label">Specialty</label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="pill-select-control"
                      style={{ width: '100%' }}
                    >
                      {SPECIALTIES.filter(s => s !== 'All specialties').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-field">
                    <label className="field-label">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="pill-select-control"
                      style={{ width: '100%' }}
                    >
                      {STATES_INDIA.filter(s => s !== 'All states').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email ID */}
            <div className="form-group-field">
              <label className="field-label">
                {isRegister ? 'Official Email ID *' : 'Registered Email ID *'}
              </label>
              <div className="field-input-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  required
                  placeholder="doctor@clinic.com"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  className="text-input-field"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label">Password *</label>
                {!isRegister && (
                  <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert('Password reset instructions will be sent to your registered Email ID.'); }}>
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="field-input-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="text-input-field"
                />
                <button
                  type="button"
                  className="field-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="login-checkbox-row">
              <label className="checkbox-label-wrap">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="checkbox-input"
                />
                <span>Remember me on this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit-auth"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Authenticating...' : isRegister ? 'Register & Verify Credentials' : 'Sign In to Doctor Vet'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Terms & Notice */}
          <div className="login-footer-disclaimer">
            <ShieldCheck size={14} color="#059669" />
            <span>
              Zenve Vet strictly authenticates licensed veterinary surgeons and clinical residents under State & National Veterinary Council frameworks.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
