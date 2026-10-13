import React from 'react';
import { X, Activity, FileCheck, Stethoscope, Eye, MessageCircle, Heart } from 'lucide-react';

export function ClinicalCaseModal({ clinicalCase, onClose }) {
  if (!clinicalCase) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B', background: '#E8F3ED', padding: '3px 8px', borderRadius: '4px' }}>
              Clinical Case Study
            </span>
            <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '6px' }}>{clinicalCase.title}</h3>
            <p style={{ fontSize: '13px', color: '#64726A' }}>By {clinicalCase.authorName} · {clinicalCase.authorSpecialty}</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {clinicalCase.mediaUrl && (
            <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '280px' }}>
              <img src={clinicalCase.mediaUrl} alt={clinicalCase.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ padding: '12px 16px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5E9E5' }}>
            <strong style={{ fontSize: '13px', color: '#121A15', display: 'block', marginBottom: '4px' }}>Patient Signalment</strong>
            <span style={{ fontSize: '14px', color: '#0D472B', fontWeight: '600' }}>{clinicalCase.species}</span>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B', marginBottom: '6px' }}>
              Presenting Complaint & History
            </h4>
            <p style={{ fontSize: '14px', color: '#344038', lineHeight: '1.6' }}>
              {clinicalCase.presentingComplaint}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B', marginBottom: '6px' }}>
              Clinical & Physical Exam Findings
            </h4>
            <p style={{ fontSize: '14px', color: '#344038', lineHeight: '1.6' }}>
              {clinicalCase.clinicalFindings}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B', marginBottom: '6px' }}>
              Diagnostics (Lab & Imaging)
            </h4>
            <p style={{ fontSize: '14px', color: '#344038', lineHeight: '1.6' }}>
              {clinicalCase.diagnostics}
            </p>
          </div>

          <div style={{ padding: '14px 16px', background: '#F4EEDC', borderRadius: '8px', border: '1px solid #E8D9B8' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#795715', marginBottom: '4px' }}>
              Confirmed Diagnosis
            </h4>
            <p style={{ fontSize: '14px', color: '#553E12', fontWeight: '600' }}>
              {clinicalCase.diagnosis}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B', marginBottom: '6px' }}>
              Therapeutic Protocol & Management
            </h4>
            <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', fontSize: '13.5px', color: '#344038', background: '#F8F9FA', padding: '12px', borderRadius: '8px', border: '1px solid #E5E9E5' }}>
              {clinicalCase.treatmentProtocol}
            </pre>
          </div>

          <div style={{ padding: '12px 16px', background: '#E8F3ED', borderRadius: '8px', border: '1px solid #C8DEC9' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B', marginBottom: '4px' }}>
              Clinical Outcome
            </h4>
            <p style={{ fontSize: '13.5px', color: '#135E3B' }}>
              {clinicalCase.outcome}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
