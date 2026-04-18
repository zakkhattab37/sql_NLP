import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALL_SYMPTOMS, ICONS } from '../data/symptoms';

export default function SymptomGrid({ selected, toggleGrid }) {
  const { t } = useTranslation();

  return (
    <div className="symptom-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: 12,
      marginTop: 20
    }}>
      {ALL_SYMPTOMS.map((sym, i) => {
        const isSel = selected[sym.id] === true;
        return (
          <button
            key={sym.id}
            onClick={() => toggleGrid(sym.id)}
            className={`symptom-card glass-btn ${isSel ? 'selected' : ''}`}
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              animation: `fade-in-up 0.4s ease forwards ${i * 0.02}s`,
              opacity: 0,
            }}
          >
            <div style={{ fontSize: 28 }}>{ICONS[sym.id] || "🦠"}</div>
            <div style={{ fontSize: 13, fontWeight: 500, textAlign: "center", wordWrap: "break-word", width: "100%" }}>
              {t(`sym_${sym.id}_label`, { defaultValue: sym.label })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
