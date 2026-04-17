import { useState, useCallback } from "react";

const API_BASE = "http://localhost:3001";

// ─── Symptom Master List ──────────────────────────────────────────────────────
const ALL_SYMPTOMS = [
  { id: "fever",               label: "Fever",                desc: "High body temperature" },
  { id: "cough",               label: "Cough",                desc: "Persistent or dry cough" },
  { id: "sore_throat",         label: "Sore Throat",          desc: "Pain or irritation in throat" },
  { id: "runny_nose",          label: "Runny Nose",           desc: "Runny or stuffy nose" },
  { id: "fatigue",             label: "Fatigue",              desc: "Persistent tiredness" },
  { id: "headache",            label: "Headache",             desc: "Pain in head or temples" },
  { id: "body_aches",          label: "Body Aches",           desc: "Muscle pain or soreness" },
  { id: "chest_pain",          label: "Chest Pain",           desc: "Tightness or pain in chest" },
  { id: "shortness_of_breath", label: "Breathlessness",       desc: "Difficulty breathing" },
  { id: "nausea",              label: "Nausea",               desc: "Feeling of sickness" },
  { id: "vomiting",            label: "Vomiting",             desc: "Forceful emptying of stomach" },
  { id: "diarrhea",            label: "Diarrhea",             desc: "Loose or watery stools" },
  { id: "abdominal_pain",      label: "Abdominal Pain",       desc: "Stomach or gut pain" },
  { id: "loss_of_appetite",    label: "Loss of Appetite",     desc: "Reduced desire to eat" },
  { id: "skin_rash",           label: "Skin Rash",            desc: "Red, itchy skin patches" },
  { id: "joint_pain",          label: "Joint Pain",           desc: "Aching in joints" },
  { id: "chills",              label: "Chills",               desc: "Shivering or feeling cold" },
  { id: "night_sweats",        label: "Night Sweats",         desc: "Sweating heavily at night" },
  { id: "frequent_urination",  label: "Frequent Urination",   desc: "Urinating more than usual" },
  { id: "blurred_vision",      label: "Blurred Vision",       desc: "Impaired or cloudy vision" },
];

// ─── Prolog-equivalent inference engine (JS port) ────────────────────────────
const KB = {
  influenza:       { symptoms: ["fever","cough","body_aches","fatigue","headache","chills"],            desc: "Influenza (flu) is a contagious respiratory illness caused by influenza viruses.",            advice: "Rest, stay hydrated, and take antipyretics. Antiviral drugs may help if taken early." },
  common_cold:     { symptoms: ["runny_nose","sore_throat","cough","headache","fatigue"],               desc: "The common cold is a viral infection of the upper respiratory tract.",                       advice: "Rest, stay hydrated. Symptoms typically resolve in 7-10 days. Use decongestants if needed." },
  covid19:         { symptoms: ["fever","cough","shortness_of_breath","fatigue","body_aches","headache","sore_throat"], desc: "COVID-19 is an infectious disease caused by the SARS-CoV-2 coronavirus.",    advice: "Isolate immediately. Seek medical evaluation. Monitor oxygen levels closely." },
  pneumonia:       { symptoms: ["fever","cough","chest_pain","shortness_of_breath","fatigue","chills"], desc: "Pneumonia is an infection that inflames the air sacs in one or both lungs.",                advice: "Seek immediate medical attention. Antibiotics or antivirals may be required." },
  heart_disease:   { symptoms: ["chest_pain","shortness_of_breath","fatigue","nausea"],                desc: "Heart disease refers to conditions affecting the heart's structure and function.",            advice: "⚠ Seek emergency care immediately. Do not drive yourself. Call emergency services." },
  gastroenteritis: { symptoms: ["nausea","vomiting","diarrhea","abdominal_pain","fever"],              desc: "Gastroenteritis (stomach flu) is inflammation of the stomach and intestines.",               advice: "Stay hydrated with clear fluids. Rest. Seek care if symptoms exceed 48 hours." },
  dengue_fever:    { symptoms: ["fever","headache","body_aches","joint_pain","skin_rash","fatigue"],   desc: "Dengue fever is a mosquito-borne viral disease common in tropical regions.",                 advice: "No specific antiviral exists. Rest, fluids, and paracetamol. Avoid NSAIDs." },
  malaria:         { symptoms: ["fever","chills","headache","nausea","vomiting","night_sweats","fatigue"], desc: "Malaria is a life-threatening disease caused by Plasmodium parasites via mosquitoes.",  advice: "Seek immediate medical treatment. Antimalarial drugs are essential and time-sensitive." },
  diabetes:        { symptoms: ["frequent_urination","fatigue","blurred_vision","headache","loss_of_appetite"], desc: "Diabetes is a chronic condition affecting how the body processes blood sugar.", advice: "Consult an endocrinologist. Lifestyle changes, monitoring, and medication may be needed." },
  tuberculosis:    { symptoms: ["cough","night_sweats","fever","fatigue","loss_of_appetite","chest_pain"], desc: "Tuberculosis (TB) is a serious bacterial infection primarily affecting the lungs.",      advice: "Requires a 6-month antibiotic course. Seek medical evaluation immediately." },
};

const DISEASE_LABELS = {
  influenza: "Influenza", common_cold: "Common Cold", covid19: "COVID-19",
  pneumonia: "Pneumonia", heart_disease: "Heart Disease", gastroenteritis: "Gastroenteritis",
  dengue_fever: "Dengue Fever", malaria: "Malaria", diabetes: "Diabetes", tuberculosis: "Tuberculosis",
};

function runDiagnosis(confirmedSymptoms) {
  const results = [];
  for (const [disease, data] of Object.entries(KB)) {
    const total = data.symptoms.length;
    const matched = data.symptoms.filter(s => confirmedSymptoms.includes(s));
    const matchCount = matched.length;
    if (matchCount === 0) continue;
    const confidence = Math.round((matchCount / total) * 1000) / 10;
    if (matchCount < 2 || confidence < 30) continue;
    const urgent = (
      (confirmedSymptoms.includes("chest_pain") && confirmedSymptoms.includes("shortness_of_breath") && disease === "heart_disease") ||
      (confirmedSymptoms.includes("fever") && confirmedSymptoms.includes("night_sweats") && confirmedSymptoms.includes("cough") && disease === "tuberculosis")
    );
    results.push({ disease, label: DISEASE_LABELS[disease], confidence, matchCount, total, matched, urgent, desc: data.desc, advice: data.advice });
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

function confidenceLabel(c) {
  if (c >= 70) return { text: "High confidence", color: "#1D9E75" };
  if (c >= 45) return { text: "Moderate confidence", color: "#BA7517" };
  return { text: "Low confidence", color: "#888780" };
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEP_INTRO    = "intro";
const STEP_SYMPTOMS = "symptoms";
const STEP_RESULTS  = "results";

// ─── Symptom Icon Map ─────────────────────────────────────────────────────────
const ICONS = {
  fever: "🌡", cough: "💨", sore_throat: "🗣", runny_nose: "💧",
  fatigue: "😴", headache: "🤕", body_aches: "💪", chest_pain: "❤️",
  shortness_of_breath: "🫁", nausea: "🤢", vomiting: "🤮", diarrhea: "🚻",
  abdominal_pain: "🔵", loss_of_appetite: "🍽", skin_rash: "🔴", joint_pain: "🦴",
  chills: "🥶", night_sweats: "💦", frequent_urination: "🔄", blurred_vision: "👁",
};

export default function App() {
  const [step, setStep]               = useState(STEP_INTRO);
  const [selected, setSelected]       = useState({});  // id → true/false/null
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [results, setResults]         = useState([]);
  const [mode, setMode]               = useState("step"); // "step" | "grid"
  const [animIn, setAnimIn]           = useState(true);
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState(null);

  const fade = (fn) => { setAnimIn(false); setTimeout(() => { fn(); setAnimIn(true); }, 160); };

  // ─── Start session ─────────────────────────────────────────────────────────
  const handleStart = (m) => {
    setMode(m);
    setSelected({});
    setCurrentIdx(0);
    fade(() => setStep(STEP_SYMPTOMS));
  };

  // ─── Step mode answer ──────────────────────────────────────────────────────
  const answer = (id, val) => {
    setSelected(prev => ({ ...prev, [id]: val }));
    if (currentIdx < ALL_SYMPTOMS.length - 1) {
      fade(() => setCurrentIdx(i => i + 1));
    } else {
      finishSession({ ...selected, [id]: val });
    }
  };

  // ─── Grid mode toggle ──────────────────────────────────────────────────────
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
      // Map Prolog JSON shape → UI shape
      const mapped = (data.diagnoses || []).map(d => ({
        disease:     d.disease,
        label:       DISEASE_LABELS[d.disease] || d.disease,
        confidence:  d.confidence,
        matchCount:  d.matched,
        total:       d.total,
        matched:     ALL_SYMPTOMS.filter(s =>
                       (d.matched_symptoms || []).includes(s.id) ||
                       // fallback: intersect confirmed with KB
                       (KB[d.disease]?.symptoms || []).includes(s.id) && confirmed.includes(s.id)
                     ).map(s => s.id),
        urgent:      d.urgent === true || d.urgent === "true",
        desc:        d.description,
        advice:      d.advice,
      }));
      setResults(mapped);
      fade(() => setStep(STEP_RESULTS));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const reset = () => { setSelected({}); setCurrentIdx(0); fade(() => setStep(STEP_INTRO)); };

  const progress = mode === "step"
    ? Math.round((currentIdx / ALL_SYMPTOMS.length) * 100)
    : Math.round((Object.keys(selected).length / ALL_SYMPTOMS.length) * 100);

  const confirmedCount = Object.values(selected).filter(v => v === true).length;

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h2 className="sr-only">Medical Diagnosis System</h2>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🩺</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, color: "var(--color-text-primary)", lineHeight: 1.2 }}>Medical diagnosis system</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Powered by Prolog inference engine</div>
        </div>
        {step !== STEP_INTRO && (
          <button onClick={reset} style={{ marginLeft: "auto", fontSize: 12, padding: "4px 10px" }}>Reset</button>
        )}
      </div>

      {/* ── Loading overlay ─────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>⚙</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Running Prolog inference engine…</div>
          <div style={{ fontSize: 12, marginTop: 4, color: "var(--color-text-tertiary)" }}>Querying SWI-Prolog via localhost:3001</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── API error banner ─────────────────────────────────────────────── */}
      {apiError && !loading && (
        <div style={{ marginBottom: "1rem", padding: "10px 14px", background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)", fontSize: 13, color: "var(--color-text-danger)", lineHeight: 1.5 }}>
          <strong>⚠ Backend error:</strong> {apiError}
          <br /><span style={{ fontSize: 11, opacity: 0.8 }}>Make sure <code>node server.js</code> is running and SWI-Prolog is installed.</span>
          <button onClick={() => setApiError(null)} style={{ float: "right", fontSize: 11, padding: "2px 8px", background: "transparent", border: "0.5px solid var(--color-border-danger)", color: "var(--color-text-danger)", borderRadius: 4 }}>✕ dismiss</button>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      {!loading && <div style={{ opacity: animIn ? 1 : 0, transition: "opacity 0.15s ease", minHeight: 400 }}>

        {/* ── INTRO ── */}
        {step === STEP_INTRO && (
          <div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                This system uses a <strong style={{ fontWeight: 500 }}>Prolog knowledge base</strong> with 10 diseases and 20 symptoms to infer probable conditions from your reported symptoms. It uses logical rules and confidence scoring — not neural networks.
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-danger)", padding: "8px 12px", background: "var(--color-background-danger)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-danger)" }}>
                ⚠ For educational purposes only. Always consult a licensed doctor.
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8 }}>Choose input mode:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { mode: "step", icon: "→", title: "Step-by-step", sub: "Answer one symptom at a time" },
                { mode: "grid", icon: "⊞", title: "Quick select",  sub: "Tap all symptoms at once" },
              ].map(o => (
                <button key={o.mode} onClick={() => handleStart(o.mode)}
                  style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem", textAlign: "left", cursor: "pointer" }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{o.icon}</div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)", marginBottom: 3 }}>{o.title}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{o.sub}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 8 }}>Knowledge base: {Object.keys(KB).length} diseases · {ALL_SYMPTOMS.length} symptoms</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.values(DISEASE_LABELS).map(d => (
                  <span key={d} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP MODE ── */}
        {step === STEP_SYMPTOMS && mode === "step" && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                <span>Question {currentIdx + 1} of {ALL_SYMPTOMS.length}</span>
                <span>{progress}% complete</span>
              </div>
              <div style={{ height: 3, background: "var(--color-background-secondary)", borderRadius: 99 }}>
                <div style={{ height: 3, background: "var(--color-text-info)", borderRadius: 99, width: `${progress}%`, transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* Question card */}
            {(() => {
              const sym = ALL_SYMPTOMS[currentIdx];
              return (
                <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ fontSize: 28, marginBottom: "0.5rem" }}>{ICONS[sym.id] || "•"}</div>
                  <div style={{ fontWeight: 500, fontSize: 18, color: "var(--color-text-primary)", marginBottom: 4 }}>{sym.label}</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>{sym.desc}</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: "1rem" }}>Are you experiencing this symptom?</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button onClick={() => answer(sym.id, true)}
                      style={{ padding: "10px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-success)", border: "0.5px solid var(--color-border-success)", color: "var(--color-text-success)", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                      Yes
                    </button>
                    <button onClick={() => answer(sym.id, false)}
                      style={{ padding: "10px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)", fontSize: 14, cursor: "pointer" }}>
                      No
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Previous answers preview */}
            {confirmedCount > 0 && (
              <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: "0.5rem" }}>
                {confirmedCount} symptom{confirmedCount !== 1 ? "s" : ""} confirmed so far
              </div>
            )}
          </div>
        )}

        {/* ── GRID MODE ── */}
        {step === STEP_SYMPTOMS && mode === "grid" && (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                Tap all symptoms you are currently experiencing, then click <strong style={{ fontWeight: 500 }}>Diagnose</strong>.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {ALL_SYMPTOMS.map(sym => {
                  const on = selected[sym.id] === true;
                  return (
                    <button key={sym.id} onClick={() => toggleGrid(sym.id)}
                      style={{
                        padding: "10px 8px", borderRadius: "var(--border-radius-md)", textAlign: "left", cursor: "pointer",
                        background: on ? "var(--color-background-info)" : "var(--color-background-secondary)",
                        border: on ? "0.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
                        transition: "all 0.12s",
                      }}>
                      <div style={{ fontSize: 16, marginBottom: 3 }}>{ICONS[sym.id] || "•"}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: on ? "var(--color-text-info)" : "var(--color-text-primary)", lineHeight: 1.3 }}>{sym.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "1rem" }}>
              <button onClick={() => finishSession()} style={{ padding: "10px 20px", fontWeight: 500, background: "var(--color-background-info)", border: "0.5px solid var(--color-border-info)", color: "var(--color-text-info)", borderRadius: "var(--border-radius-md)", cursor: "pointer" }}>
                Diagnose →
              </button>
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{confirmedCount} selected</span>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === STEP_RESULTS && (
          <div>
            {/* Confirmed symptoms */}
            {(() => {
              const conf = Object.entries(selected).filter(([,v]) => v === true).map(([k]) => k);
              return (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>Symptoms reported ({conf.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {conf.length === 0
                      ? <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>None</span>
                      : conf.map(s => {
                          const sym = ALL_SYMPTOMS.find(x => x.id === s);
                          return <span key={s} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 99, background: "var(--color-background-info)", color: "var(--color-text-info)", border: "0.5px solid var(--color-border-info)" }}>{ICONS[s]} {sym?.label || s}</span>;
                        })}
                  </div>
                </div>
              );
            })()}

            {results.length === 0 ? (
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)", marginBottom: 6 }}>No confident diagnosis</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  Your symptoms did not match any known pattern with sufficient confidence. Please consult a qualified healthcare provider.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.map((r, i) => {
                  const cl = confidenceLabel(r.confidence);
                  return (
                    <div key={r.disease}
                      style={{ background: "var(--color-background-primary)", border: r.urgent ? "1px solid var(--color-border-danger)" : "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" }}>#{i + 1}</span>
                        <span style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)", flex: 1 }}>{r.label}</span>
                        {r.urgent && (
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--color-background-danger)", color: "var(--color-text-danger)", border: "0.5px solid var(--color-border-danger)", fontWeight: 500 }}>URGENT</span>
                        )}
                      </div>

                      {/* Confidence bar */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: cl.color, fontWeight: 500 }}>{cl.text}</span>
                          <span style={{ color: "var(--color-text-secondary)" }}>{r.matchCount}/{r.total} symptoms matched · {r.confidence}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--color-background-secondary)", borderRadius: 99 }}>
                          <div style={{ height: 4, background: cl.color, borderRadius: 99, width: `${r.confidence}%`, transition: "width 0.5s ease" }} />
                        </div>
                      </div>

                      {/* Matched symptoms */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                        {r.matched.map(s => {
                          const sym = ALL_SYMPTOMS.find(x => x.id === s);
                          return <span key={s} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 99, background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}>{ICONS[s]} {sym?.label || s}</span>;
                        })}
                      </div>

                      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>{r.desc}</div>
                      <div style={{ fontSize: 13, color: r.urgent ? "var(--color-text-danger)" : "var(--color-text-primary)", lineHeight: 1.6, padding: "8px 12px", background: r.urgent ? "var(--color-background-danger)" : "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: `0.5px solid ${r.urgent ? "var(--color-border-danger)" : "var(--color-border-tertiary)"}` }}>
                        {r.urgent ? "⚠ " : "→ "}{r.advice}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: "1rem", padding: "10px 12px", background: "var(--color-background-warning)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-warning)", fontSize: 12, color: "var(--color-text-warning)", lineHeight: 1.5 }}>
              ⚠ This is not a medical diagnosis. Always consult a licensed healthcare professional before taking any action.
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: 8 }}>
              <button onClick={reset} style={{ padding: "8px 16px", fontSize: 13 }}>Start over</button>
              <button onClick={() => fade(() => setStep(STEP_SYMPTOMS))} style={{ padding: "8px 16px", fontSize: 13 }}>
                Adjust symptoms
              </button>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
