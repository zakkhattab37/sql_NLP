import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Data and utils
import { ALL_SYMPTOMS } from "./data/symptoms";
import { KB, DISEASE_LABELS_AR, DISEASE_LABELS_EN } from "./data/diseases";

// Components
import SettingsSidebar from "./components/SettingsSidebar";
import SymptomGrid from "./components/SymptomGrid";
import SymptomList from "./components/SymptomList";
import DiagnosisCard from "./components/DiagnosisCard";

const API_BASE = "http://localhost:3001";

const STEP_INTRO    = "intro";
const STEP_SYMPTOMS = "symptoms";
const STEP_RESULTS  = "results";

export default function App() {
  const { t, i18n } = useTranslation();
  
  const [step, setStep]               = useState(STEP_INTRO);
  const [selected, setSelected]       = useState({});  // id → true/false/null
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [results, setResults]         = useState([]);
  const [mode, setMode]               = useState("step"); // "step" | "grid"
  const [animIn, setAnimIn]           = useState(true);
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState(null);
  
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const fade = (fn) => { setAnimIn(false); setTimeout(() => { fn(); setAnimIn(true); }, 200); };

  const handleStart = (m) => {
    setMode(m);
    setSelected({});
    setCurrentIdx(0);
    fade(() => setStep(STEP_SYMPTOMS));
  };

  const answer = (id, val) => {
    setSelected(prev => ({ ...prev, [id]: val }));
    if (currentIdx < ALL_SYMPTOMS.length - 1) {
      fade(() => setCurrentIdx(i => i + 1));
    } else {
      finishSession({ ...selected, [id]: val });
    }
  };

  const toggleGrid = (id) => {
    setSelected(prev => ({ ...prev, [id]: prev[id] ? null : true }));
  };

  const finishSession = useCallback(async (sel = selected) => {
    const confirmed = Object.entries(sel).filter(([,v]) => v === true).map(([k]) => k);
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: confirmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      
      const mapped = (data.diagnoses || []).map(d => ({
        disease:     d.disease,
        label:       (i18n.language === 'ar' ? DISEASE_LABELS_AR[d.disease] : DISEASE_LABELS_EN[d.disease]) || d.disease,
        confidence:  d.confidence,
        matchCount:  d.matched,
        total:       d.total,
        matched:     ALL_SYMPTOMS.filter(s =>
                       (d.matched_symptoms || []).includes(s.id) ||
                       (KB[d.disease]?.symptoms || []).includes(s.id) && confirmed.includes(s.id)
                     ).map(s => s.id),
        urgent:      d.urgent === true || d.urgent === "true",
        desc:        d.description,
        advice:      d.advice,
        prevention:  d.prevention,
        cure:        d.cure
      }));
      setResults(mapped);
      fade(() => setStep(STEP_RESULTS));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selected, i18n.language]);

  const reset = () => { setSelected({}); setCurrentIdx(0); fade(() => setStep(STEP_INTRO)); };

  const progress = mode === "step"
    ? Math.round((currentIdx / ALL_SYMPTOMS.length) * 100)
    : Math.round((Object.keys(selected).length / ALL_SYMPTOMS.length) * 100);

  const confirmedCount = Object.values(selected).filter(v => v === true).length;

  return (
    <>
      <SettingsSidebar isDark={isDark} toggleTheme={toggleTheme} toggleLanguage={toggleLanguage} />

      <main className="main-content glass-panel" style={{ opacity: animIn ? 1 : 0, transition: "opacity 0.2s ease", position: "relative" }}>
        
        {/* Dynamic Gradient Background Blob */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: 48, marginBottom: 8, animation: "float 6s ease-in-out infinite" }}>🩺</div>
          <h1 className="app-title">{t('app_title', { defaultValue: 'Medical Diagnosis System' })}</h1>
          <p className="app-subtitle">{t('app_subtitle', { defaultValue: 'Powered by Prolog Inference Engine' })}</p>
        </div>

        <div style={{ minHeight: 300, position: "relative", zIndex: 10 }}>
          
          {/* STEP: INTRO */}
          {step === STEP_INTRO && (
            <div className="intro-container step-anim">
              <p className="intro-text">
                {t('step_intro_desc', { defaultValue: 'This system uses a Prolog knowledge base of diseases and symptoms to logically infer possible conditions. It uses logic rules to evaluate confidence—not neural networks.' })}
              </p>
              
              <div className="action-buttons">
                <button className="glass-btn primary" onClick={() => handleStart("step")}>
                  {t('start_diagnosis_step', { defaultValue: 'Start Diagnosis (Step-by-Step)' })}
                </button>
                <button className="glass-btn secondary" onClick={() => handleStart("grid")}>
                  {t('start_diagnosis_grid', { defaultValue: 'Start Diagnosis (Grid View)' })}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SYMPTOMS */}
          {step === STEP_SYMPTOMS && (
            <div className="symptoms-container step-anim">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: 1 }}>{t('progress', { defaultValue: 'PROGRESS' })}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{progress}%</span>
              </div>
              <div className="progress-track" style={{ marginBottom: "1.5rem" }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              {mode === "step" ? (
                <SymptomList currentIdx={currentIdx} selected={selected} answer={answer} />
              ) : (
                <>
                  <div style={{ fontSize: 16, textAlign: "center", color: "var(--color-text-primary)", fontWeight: 500, marginBottom: "0.5rem" }}>
                    {t('select_symptoms', { defaultValue: 'Select all your symptoms:' })}
                  </div>
                  <SymptomGrid selected={selected} toggleGrid={toggleGrid} />
                  
                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--color-text-secondary)", background: "var(--color-background-tertiary)", padding: "4px 10px", borderRadius: 99 }}>
                      {t('symptoms_selected', { count: confirmedCount, defaultValue: `${confirmedCount} selected` })}
                    </span>
                    <button className="glass-btn primary" onClick={() => finishSession()} disabled={loading} style={{ padding: "10px 24px" }}>
                      {loading ? t('loading', { defaultValue: 'Loading...' }) : t('diagnose_btn', { defaultValue: 'Diagnose' })}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP: RESULTS */}
          {step === STEP_RESULTS && (
            <div className="results-container step-anim">
              <h2 className="results-title">{t('results_title', { defaultValue: 'Diagnostic Results' })}</h2>
              
              {apiError && (
                <div className="error-box">
                  <strong>{t('error_label', { defaultValue: 'Error' })}:</strong> {apiError}
                </div>
              )}

              {results.length === 0 && !apiError ? (
                <div className="no-results-box">
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
                  <div className="app-subtitle">{t('no_diagnosis', { defaultValue: 'No Match Found' })}</div>
                  <p style={{ marginTop: 8 }}>{t('no_diagnosis_desc', { defaultValue: 'Your symptoms do not match our KB.' })}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {results.map((r, i) => (
                    <DiagnosisCard key={r.disease} r={r} index={i} />
                  ))}
                </div>
              )}

              <div className="warning-disclaimer">
                {t('warning_disclaimer', { defaultValue: 'Please consult a doctor for official medical advice.' })}
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button className="glass-btn secondary" onClick={reset}>{t('start_over', { defaultValue: 'Start Over' })}</button>
                <button className="glass-btn primary" onClick={() => fade(() => setStep(STEP_SYMPTOMS))}>
                  {t('adjust_symptoms', { defaultValue: 'Adjust Symptoms' })}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
