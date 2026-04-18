import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALL_SYMPTOMS, ICONS } from '../data/symptoms';
import { confidenceLabel } from '../utils/helpers';

export default function DiagnosisCard({ r, index }) {
  const { t, i18n } = useTranslation();
  const cl = confidenceLabel(r.confidence, t);

  return (
    <div className={`diagnosis-card glass-panel ${r.urgent ? 'urgent-border' : ''}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span className="rank-badge">#{index + 1}</span>
        <span style={{ fontWeight: 600, fontSize: 18, color: "var(--color-text-primary)", flex: 1 }}>{r.label}</span>
        {r.urgent && (
          <span className="urgent-badge">{t('urgent', { defaultValue: 'Urgent' })}</span>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: cl.color, fontWeight: 600 }}>{cl.text}</span>
          <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
            {t('symptoms_matched', { matched: r.matchCount, total: r.total, confidence: r.confidence, defaultValue: `${r.matchCount}/${r.total} Match (${r.confidence}%)` })}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ background: cl.color, width: `${r.confidence}%` }} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {r.matched.map(s => {
          const sym = ALL_SYMPTOMS.find(x => x.id === s);
          return (
            <span key={s} className="matched-symptom-badge">
              {ICONS[s]} {t(`sym_${s}_label`, { defaultValue: sym?.label || s })}
            </span>
          );
        })}
      </div>

      <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
        {t(`dis_${r.disease}_desc`, { defaultValue: r.desc })}
      </div>

      <div className={`advice-box ${r.urgent ? "urgent-advice" : "standard-advice"}`} style={{ marginBottom: 12 }}>
        <strong>{r.urgent ? "⚠ " : (i18n.language === 'ar' ? "← " : "→ ")}</strong>
        {t(`dis_${r.disease}_advice`, { defaultValue: r.advice })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="prevention-box">
          <strong className="box-title">{t('prevention_label', { defaultValue: 'Prevention' })}:</strong>
          <span>{t(`dis_${r.disease}_prev`, { defaultValue: r.prevention })}</span>
        </div>
        <div className="cure-box">
          <strong className="box-title">{t('cure_label', { defaultValue: 'Cure' })}:</strong>
          <span>{t(`dis_${r.disease}_cure`, { defaultValue: r.cure })}</span>
        </div>
      </div>
    </div>
  );
}
