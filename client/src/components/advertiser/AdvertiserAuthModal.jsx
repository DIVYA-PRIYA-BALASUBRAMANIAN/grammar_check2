import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Key,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../../services/api';

export function AdvertiserAuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'key' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    businessEmail: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    accountType: 'Pharmaceutical',
    website: '',
    logoUrl: '',
    termsAccepted: true,
    accessKey: ''
  });

  if (!isOpen) return null;

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await api.media.upload(file);
      if (res.url) {
        setFormData(prev => ({ ...prev, logoUrl: res.url }));
      }
    } catch (err) {
      setErrorMsg('Failed to upload company logo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!formData.fullName.trim()) throw new Error('Full name is required');
        if (!formData.companyName.trim()) throw new Error('Company name is required');
        if (!formData.businessEmail.trim()) throw new Error('Business email is required');
        if (!formData.mobileNumber.trim()) throw new Error('Mobile number is required');
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
        if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
        if (!formData.termsAccepted) throw new Error('You must accept the terms and conditions');

        const res = await api.advertisers.register({
          fullName: formData.fullName,
          companyName: formData.companyName,
          businessEmail: formData.businessEmail,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          accountType: formData.accountType,
          website: formData.website,
          logoUrl: formData.logoUrl,
          termsAccepted: formData.termsAccepted
        });

        localStorage.setItem('zenve_advertiser_token', res.token);
        localStorage.setItem('zenve_advertiser_account', JSON.stringify(res.advertiser));
        onAuthSuccess(res.advertiser, res.token);
        onClose();
      } else if (mode === 'login') {
        if (!formData.businessEmail.trim()) throw new Error('Email is required');
        if (!formData.password) throw new Error('Password is required');

        const res = await api.advertisers.login(formData.businessEmail, formData.password);
        localStorage.setItem('zenve_advertiser_token', res.token);
        localStorage.setItem('zenve_advertiser_account', JSON.stringify(res.advertiser));
        onAuthSuccess(res.advertiser, res.token);
        onClose();
      } else if (mode === 'key') {
        if (!formData.accessKey.trim()) throw new Error('Access key is required');

        const res = await api.advertisers.loginWithKey(formData.accessKey.trim());
        localStorage.setItem('zenve_advertiser_token', res.token);
        localStorage.setItem('zenve_advertiser_account', JSON.stringify(res.advertiser));
        onAuthSuccess(res.advertiser, res.token);
        onClose();
      } else if (mode === 'forgot') {
        if (!formData.businessEmail.trim()) throw new Error('Please enter your business email');
        const res = await api.advertisers.forgotPassword(formData.businessEmail);
        setSuccessMsg(res.message || 'Password reset instructions have been dispatched.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advertiser-modal-backdrop" onClick={onClose}>
      <div className="advertiser-modal-content" style={{ maxWidth: mode === 'register' ? '580px' : '460px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="advertiser-modal-header" style={{ marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003822', marginBottom: '4px' }}>
              <Building2 size={18} />
              <span className="advertiser-kicker" style={{ color: '#059669' }}>
                Zenve Vet Advertiser Portal
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
              {mode === 'register' && 'Register Advertiser Account'}
              {mode === 'login' && 'Advertiser Sign In'}
              {mode === 'key' && 'Sign In With Access Key'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
          </div>
          <button className="advertiser-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#047857',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* ================= REGISTER FIELDS ================= */}
          {mode === 'register' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="advertiser-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="advertiser-form-input"
                    placeholder="e.g. vasanth M"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="advertiser-form-label">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    className="advertiser-form-input"
                    placeholder="e.g. Zenve Health India"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="advertiser-form-label">Business Email *</label>
                  <input
                    type="email"
                    required
                    className="advertiser-form-input"
                    placeholder="partner@company.com"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="advertiser-form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="advertiser-form-input"
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="advertiser-form-label">Account Type *</label>
                  <select
                    className="advertiser-form-input"
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  >
                    <option value="Pharmaceutical">Veterinary Pharmaceuticals</option>
                    <option value="Medical Device / Equipment">Medical & Surgical Equipment</option>
                    <option value="Pet Nutrition">Pet Nutrition & Health Wellness</option>
                    <option value="Veterinary Hospital">Hospital & Clinic Chain</option>
                    <option value="CME / Education">Education & CME Organizer</option>
                    <option value="Other">Other Healthcare Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="advertiser-form-label">Company Website (Optional)</label>
                  <input
                    type="url"
                    className="advertiser-form-input"
                    placeholder="https://yourbrand.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="advertiser-form-label">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="advertiser-form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="advertiser-form-label">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="advertiser-form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="advertiser-form-label">Company Logo (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#f8fafc',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    <UploadCloud size={15} color="#003822" />
                    <span>Upload Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  {formData.logoUrl && (
                    <span style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Logo uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="adv-terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="adv-terms" style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>
                  I agree to Zenve Vet's Advertiser Terms, Clinical Advertising Standards, and Privacy Policy.
                </label>
              </div>
            </>
          )}

          {/* ================= LOGIN FIELDS ================= */}
          {mode === 'login' && (
            <>
              <div>
                <label className="advertiser-form-label">Registered Business Email</label>
                <input
                  type="email"
                  required
                  className="advertiser-form-input"
                  placeholder="partner@company.com"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="advertiser-form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{ background: 'none', border: 'none', color: '#003822', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="advertiser-form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= KEY LOGIN FIELDS ================= */}
          {mode === 'key' && (
            <div>
              <label className="advertiser-form-label">Advertiser Access Key</label>
              <input
                type="text"
                required
                className="advertiser-form-input"
                placeholder="zenve_adv_live_..."
                value={formData.accessKey}
                onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })}
              />
              <p style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '6px' }}>
                Paste the unique access key generated during your advertiser account creation.
              </p>
            </div>
          )}

          {/* ================= FORGOT PASSWORD ================= */}
          {mode === 'forgot' && (
            <div>
              <label className="advertiser-form-label">Registered Business Email</label>
              <input
                type="email"
                required
                className="advertiser-form-input"
                placeholder="partner@company.com"
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="advertiser-btn-primary"
            style={{ width: '100%', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Please wait...' : (
              mode === 'register' ? 'Complete Registration & Open Dashboard' :
              mode === 'login' ? 'Sign In to Dashboard' :
              mode === 'key' ? 'Authenticate With Key' : 'Send Reset Link'
            )}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: '12.5px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mode === 'login' && (
            <>
              <div>
                Don't have an advertiser account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'none', border: 'none', color: '#003822', fontWeight: '700', cursor: 'pointer' }}
                >
                  Create one now
                </button>
              </div>
              <div>
                Have an API key?{' '}
                <button
                  type="button"
                  onClick={() => setMode('key')}
                  style={{ background: 'none', border: 'none', color: '#003822', fontWeight: '700', cursor: 'pointer' }}
                >
                  Sign in with Access Key
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              Already have an advertiser account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#003822', fontWeight: '700', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          )}

          {(mode === 'key' || mode === 'forgot') && (
            <div>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#003822', fontWeight: '700', cursor: 'pointer' }}
              >
                ← Back to Email Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvertiserAuthModal;
