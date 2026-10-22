import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  KeyRound,
  Send
} from 'lucide-react';
import { api } from '../services/api';

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onPasswordResetSuccess }) {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [identifier, setIdentifier] = useState(initialEmail);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setIdentifier(initialEmail || '');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setInfoMsg('');
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Send OTP to registered email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!identifier || !identifier.trim()) {
      setErrorMsg('Please enter your registered email address or mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword(identifier.trim());
      setMaskedEmail(res.maskedEmail || res.email || identifier.trim());
      setTargetEmail(res.email || identifier.trim());
      setStep('otp');
      setResendCooldown(45); // 45 seconds cooldown before requesting again
      setInfoMsg('A 6-digit verification code has been dispatched from no-reply@zenvevet.com.');
    } catch (err) {
      setErrorMsg(err.message || 'Could not dispatch verification code. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    try {
      const res = await api.auth.forgotPassword(targetEmail || identifier.trim());
      setResendCooldown(45);
      setInfoMsg('A new verification code has been dispatched from no-reply@zenvevet.com.');
    } catch (err) {
      setErrorMsg(err.message || 'Could not resend OTP. Please try again in a few moments.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanOtp = otp.trim().replace(/\s+/g, '');
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.resetPassword(targetEmail, cleanOtp, newPassword);
      setStep('success');
      setInfoMsg(res.message || 'Your password has been changed successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please ensure the OTP is correct and not expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(targetEmail || identifier);
    }
    onClose();
  };

  return (
    <div
      className="zenve-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="zenve-modal-container"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 56, 34, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInModal 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003822 0%, #0D9488 100%)',
            padding: '20px 24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <KeyRound size={20} color="#FFFFFF" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#A7F3D0',
                  marginBottom: '2px'
                }}
              >
                Zenve Vet Security
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Reset Account Password
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          {/* Status / Alert Banners */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: '#B91C1C',
                lineHeight: 1.45
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: '#166534',
                lineHeight: 1.45
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#16A34A' }} />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email / Identifier */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5 }}>
                Enter your registered veterinary email address. We will immediately dispatch a secure 6-digit One-Time Password (OTP) from <strong style={{ color: '#003822' }}>no-reply@zenvevet.com</strong> to verify your account.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                  Registered Email Address *
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#F9FAFB',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <Mail size={16} color="#6B7280" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="doctor@clinic.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#64748B'
                }}
              >
                <Shield size={16} color="#0D9488" style={{ flexShrink: 0 }} />
                <span>
                  Official dispatch sender: <strong style={{ color: '#0F172A' }}>no-reply@zenvevet.com</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#003822',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  boxShadow: '0 4px 12px rgba(0, 56, 34, 0.25)',
                  opacity: isLoading ? 0.75 : 1
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code (OTP)</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP & Set New Password */}
          {step === 'otp' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#166534',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  Sent to: <strong>{maskedEmail}</strong>
                  <div style={{ fontSize: '11px', color: '#15803D' }}>
                    From: <strong>no-reply@zenvevet.com</strong> (Valid for 10 min)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#047857',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Change
                </button>
              </div>

              {/* OTP Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                    Enter 6-Digit OTP *
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? '#9CA3AF' : '#0D9488',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: resendCooldown > 0 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={11} className={isLoading ? 'spin-animation' : ''} />
                    <span>
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </span>
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#F9FAFB',
                    border: '1.5px solid #0D9488',
                    borderRadius: '10px',
                    padding: '10px 14px'
                  }}
                >
                  <KeyRound size={16} color="#0D9488" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '18px',
                      fontWeight: 800,
                      letterSpacing: '6px',
                      color: '#003822'
                    }}
                  />
                </div>
              </div>

              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                  New Password *
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#F9FAFB',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '10px 14px'
                  }}
                >
                  <Lock size={16} color="#6B7280" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                  Confirm New Password *
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#F9FAFB',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '10px 14px'
                  }}
                >
                  <Lock size={16} color="#6B7280" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-type your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#003822',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  boxShadow: '0 4px 12px rgba(0, 56, 34, 0.25)',
                  opacity: isLoading ? 0.75 : 1
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset & Update Password</span>
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Success State */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  border: '3px solid #86EFAC'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                Password Changed Successfully!
              </h4>

              <p style={{ margin: '0 0 18px 0', fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5 }}>
                Your account password has been updated. A security confirmation email has been dispatched from <strong style={{ color: '#003822' }}>no-reply@zenvevet.com</strong> to your registered email address.
              </p>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '12.5px',
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 600, marginBottom: '4px' }}>
                  <ShieldCheck size={16} color="#0D9488" />
                  <span>Account Protected</span>
                </div>
                <span>All active sessions have been secured. You can now log in with your new password.</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                style={{
                  width: '100%',
                  backgroundColor: '#003822',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 56, 34, 0.25)'
                }}
              >
                <span>Sign In to Zenve Vet</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
