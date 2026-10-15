import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';

export function CampaignFormModal({ isOpen, onClose, onCampaignCreated, token, accessKey }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [posterUploading, setPosterUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campaignType: 'Clinical Masterclass',
    destinationUrl: '',
    placement: 'Feed & Clinical Cases',
    targetAudience: 'All Veterinarians',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dailyBudget: '2500',
    posterUrl: ''
  });

  if (!isOpen) return null;

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPosterUploading(true);
      setErrorMsg('');
      const res = await api.media.upload(file);
      if (res.url) {
        setFormData(prev => ({ ...prev, posterUrl: res.url }));
      }
    } catch (err) {
      setErrorMsg('Failed to upload poster image: ' + err.message);
    } finally {
      setPosterUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Campaign title is required');
      return;
    }
    if (!formData.destinationUrl.trim()) {
      setErrorMsg('Destination URL is required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.campaigns.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        campaignType: formData.campaignType,
        destinationUrl: formData.destinationUrl.trim(),
        placement: formData.placement,
        targetAudience: formData.targetAudience,
        startDate: formData.startDate,
        endDate: formData.endDate,
        dailyBudget: Number(formData.dailyBudget || 2500),
        posterUrl: formData.posterUrl,
        status: 'Live' // Submitted & active for immediate testing, or 'Pending Review'
      }, token, accessKey);

      onCampaignCreated(res);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit campaign. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advertiser-modal-backdrop" onClick={onClose}>
      <div
        className="advertiser-modal-content"
        style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="advertiser-modal-header">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>Create New Campaign</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              Upload your clinical creative, specify your destination link, and select launch dates.
            </p>
          </div>
          <button className="advertiser-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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
            marginBottom: '14px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="advertiser-modal-form">
          <div>
            <label className="advertiser-form-label">Campaign Title *</label>
            <input
              type="text"
              required
              className="advertiser-form-input"
              placeholder="e.g. Companion Animal Orthopedic Masterclass 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="advertiser-form-label">Campaign Description (Optional)</label>
            <textarea
              rows={2}
              className="advertiser-form-input"
              placeholder="Summary of the sponsored initiative, workshop benefits, or product debut..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="advertiser-form-label">Campaign Type *</label>
              <select
                className="advertiser-form-input"
                value={formData.campaignType}
                onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
              >
                <option value="Clinical Masterclass">Clinical Masterclass / CME</option>
                <option value="Sponsored Post">Sponsored Feed Post</option>
                <option value="Product Launch">Pharma / Device Launchpad</option>
                <option value="Hospital Recruitment">Specialist Recruitment</option>
                <option value="CME Banner">Top CME Banner</option>
              </select>
            </div>

            <div>
              <label className="advertiser-form-label">Network Placement *</label>
              <select
                className="advertiser-form-input"
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
              >
                <option value="Feed & Clinical Cases">Feed & Clinical Cases (Recommended)</option>
                <option value="Short Videos Stream">Short Videos Stream</option>
                <option value="Specialist Recruitment Spotlight">Specialist Spotlight</option>
                <option value="Sponsored CME Banner">CME Header Banner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="advertiser-form-label">Destination URL *</label>
            <input
              type="text"
              required
              className="advertiser-form-input"
              placeholder="https://yourbrand.com/registration"
              value={formData.destinationUrl}
              onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
            />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Where veterinarians are redirected when clicking your campaign.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="advertiser-form-label">Target Audience</label>
              <select
                className="advertiser-form-input"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                <option value="All Veterinarians">All Verified Practitioners (Pan-India)</option>
                <option value="Surgeons & Specialists">Surgeons & Specialty Consultants</option>
                <option value="Companion Animal Practitioners">Small Animal / Pet Practitioners</option>
                <option value="Large Animal Practitioners">Large Animal / Equine / Bovine</option>
              </select>
            </div>

            <div>
              <label className="advertiser-form-label">Daily Budget (INR ₹)</label>
              <input
                type="number"
                min="500"
                step="500"
                className="advertiser-form-input"
                placeholder="2500"
                value={formData.dailyBudget}
                onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="advertiser-form-label">Start Date *</label>
              <input
                type="date"
                required
                className="advertiser-form-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="advertiser-form-label">End Date *</label>
              <input
                type="date"
                required
                className="advertiser-form-input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Advertisement Poster Image Upload */}
          <div>
            <label className="advertiser-form-label">Advertisement Poster / Image</label>
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              cursor: 'pointer'
            }}>
              <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <UploadCloud size={24} color="#003822" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                  {posterUploading ? 'Uploading poster...' : (formData.posterUrl ? 'Replace Poster Image' : 'Choose Poster Image (PNG, JPG, WebP)')}
                </span>
                <span style={{ fontSize: '11.5px', color: '#6b7280' }}>Recommended size: 1200 × 630 or 1080 × 1080</span>
                <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: 'none' }} />
              </label>

              {formData.posterUrl && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#047857', fontSize: '12px', fontWeight: '600' }}>
                  <CheckCircle2 size={15} />
                  <span>Poster successfully uploaded</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="advertiser-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || posterUploading}
              className="advertiser-btn-primary"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CampaignFormModal;
