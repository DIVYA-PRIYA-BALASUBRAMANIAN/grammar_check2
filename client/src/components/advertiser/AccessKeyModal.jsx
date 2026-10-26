import React, { useState } from 'react';
import {
  X,
  Key,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import zenveLogo from '../../assets/zenve_logo.png';

export function AccessKeyModal({ isOpen, onClose, accessKey, token, onKeyUpdated }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentKey, setCurrentKey] = useState(accessKey);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!currentKey) return;
    navigator.clipboard?.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating this access key will immediately invalidate the previous key. Any integrated scripts will need to be updated. Proceed?')) {
      return;
    }

    try {
      setRegenerating(true);
      const res = await api.advertisers.regenerateKey(token);
      if (res.accessKey) {
        setCurrentKey(res.accessKey);
        onKeyUpdated?.(res.accessKey);
      }
    } catch (err) {
      alert('Failed to regenerate key: ' + err.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="advertiser-modal-backdrop" onClick={onClose}>
      <div className="advertiser-modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
          <img
            src={zenveLogo}
            alt="Zenve Vet"
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
          />
          <button className="advertiser-modal-close" onClick={onClose} style={{ position: 'static' }}>
            <X size={18} />
          </button>
        </div>

        <div className="advertiser-modal-header" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#003822', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Advertiser Access Key</h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Authenticate your account across devices and API integrations.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label className="advertiser-form-label">Live API Access Key</label>
          <div className="advertiser-key-box">
            <code>{currentKey || 'zenve_adv_live_...'}</code>
            <button
              className="advertiser-btn-copy"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <button
              type="button"
              disabled={regenerating}
              onClick={handleRegenerate}
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
              <span>{regenerating ? 'Regenerating...' : 'Regenerate Key'}</span>
            </button>

            <span style={{ fontSize: '11px', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
              <ShieldCheck size={13} />
              <span>Active & Verified</span>
            </span>
          </div>

          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '14px', lineHeight: 1.45 }}>
            Pass this key in the <code>X-Advertiser-Key</code> HTTP header or use it to sign in directly without a password on any clinical device.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="advertiser-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessKeyModal;
