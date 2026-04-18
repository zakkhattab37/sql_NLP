import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALL_SYMPTOMS, ICONS } from '../data/symptoms';

export default function SymptomList({ currentIdx, selected, answer }) {
  const { t, i18n } = useTranslation();
  
  if (currentIdx >= ALL_SYMPTOMS.length) return null;
  const sym = ALL_SYMPTOMS[currentIdx];

  return (
    <div className="symptom-step glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
      <div className="icon-container" style={{ fontSize: 64, animation: "bounce 2s infinite ease-in-out" }}>
        {ICONS[sym.id] || "🦠"}
      </div>
      
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {t(`sym_${sym.id}_label`, { defaultValue: sym.label })}
        </h2>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)" }}>
          {t(`sym_${sym.id}_desc`, { defaultValue: sym.desc })}
        </p>
      </div>

      <div style={{ display: "flex", gap: "1rem", width: "100%", marginTop: "1rem" }}>
        <button 
          className="glass-btn btn-yes" 
          onClick={() => answer(sym.id, true)} 
          style={{ flex: 1, padding: "12px", fontSize: 16, fontWeight: 500, color: "var(--color-text-success)", borderColor: "var(--color-border-success)", background: selected[sym.id] === true ? "var(--color-background-success)" : undefined }}
        >
          {t('btn_yes')}
        </button>
        <button 
          className="glass-btn btn-no" 
          onClick={() => answer(sym.id, false)} 
          style={{ flex: 1, padding: "12px", fontSize: 16, fontWeight: 500, color: "var(--color-text-danger)", borderColor: "var(--color-border-danger)", background: selected[sym.id] === false ? "var(--color-background-danger)" : undefined }}
        >
          {t('btn_no')}
        </button>
      </div>

      <button className="text-btn" onClick={() => answer(sym.id, null)} style={{ fontSize: 13, background: "none", color: "var(--color-text-tertiary)", marginTop: "-0.5rem" }}>
        {t('btn_skip')}
      </button>
    </div>
  );
}
