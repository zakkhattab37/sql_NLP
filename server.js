// =============================================================================
// server.js  —  Node.js Bridge: REST API → SWI-Prolog
// =============================================================================
// Exposes the Prolog engine over HTTP so the React frontend can call it.
//
// Install: npm install express cors
// Run:     node server.js
//
// Endpoints:
//   POST /diagnose      body: { symptoms: ["fever","cough",...] }
//   GET  /symptoms      returns all known symptoms
//   GET  /diseases      returns all known diseases
//   GET  /health        health check
// =============================================================================

const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');

// Absolute path to SWI-Prolog (not in system PATH on this machine)
const SWIPL      = process.env.SWIPL_PATH || 'C:\\Program Files\\swipl\\bin\\swipl.exe';
const PROLOG_DIR = path.join(__dirname, 'prolog');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// runProlog(goal) → Promise<string>
// Spawns SWI-Prolog, runs a single goal, captures stdout.
// ---------------------------------------------------------------------------
function runProlog(goal) {
  return new Promise((resolve, reject) => {
    const args = [
      '-g', goal,
      '-t', 'halt',
      path.join(PROLOG_DIR, 'main.pl')
    ];

    execFile(SWIPL, args, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        // swipl exits with code 1 after -t halt even on success; only reject on real failures
        if (error.killed) return reject(new Error('Prolog process timed out'));
        if (error.code === 'ENOENT' || error.code === 'EACCES')
          return reject(new Error(`Cannot spawn SWI-Prolog: ${error.message}`));
        // For other codes (e.g. 1 from halt), still try to parse stdout
        if (!stdout || stdout.trim() === '')
          return reject(new Error(`Prolog error: ${stderr || error.message}`));
      }
      resolve(stdout.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// POST /diagnose
// Body: { symptoms: string[] }
// Returns ranked diagnoses as JSON
// ---------------------------------------------------------------------------
app.post('/diagnose', async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ error: 'Please provide a non-empty symptoms array.' });
  }

  // Sanitize symptom names (only allow lowercase letters and underscores)
  const safe = symptoms
    .map(s => s.toLowerCase().replace(/[^a-z_]/g, ''))
    .filter(Boolean);

  if (safe.length === 0) {
    return res.status(400).json({ error: 'All symptom names were invalid.' });
  }

  // Build a Prolog list literal, e.g. [fever,cough,fatigue]
  const prologList = `[${safe.join(',')}]`;
  const goal = `get_diagnosis_json(${prologList}, J), write(J)`;

  try {
    const raw = await runProlog(goal);
    // Prolog outputs the JSON string directly
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error('Prolog error:', err.message);
    res.status(500).json({ error: 'Diagnosis engine error', detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /symptoms  — returns all known symptoms with labels
// ---------------------------------------------------------------------------
app.get('/symptoms', async (req, res) => {
  // This is static data — no need to call Prolog at runtime.
  // Keeping it here so frontend has a single source of truth.
  const symptoms = [
    { id: 'fever',               label: 'Fever (high body temperature)' },
    { id: 'cough',               label: 'Cough (persistent or dry)' },
    { id: 'sore_throat',         label: 'Sore throat' },
    { id: 'runny_nose',          label: 'Runny or stuffy nose' },
    { id: 'fatigue',             label: 'Fatigue / persistent tiredness' },
    { id: 'headache',            label: 'Headache' },
    { id: 'body_aches',          label: 'Body aches or muscle pain' },
    { id: 'chest_pain',          label: 'Chest pain or tightness' },
    { id: 'shortness_of_breath', label: 'Shortness of breath' },
    { id: 'nausea',              label: 'Nausea' },
    { id: 'vomiting',            label: 'Vomiting' },
    { id: 'diarrhea',            label: 'Diarrhea' },
    { id: 'abdominal_pain',      label: 'Abdominal / stomach pain' },
    { id: 'loss_of_appetite',    label: 'Loss of appetite' },
    { id: 'skin_rash',           label: 'Skin rash' },
    { id: 'joint_pain',          label: 'Joint pain' },
    { id: 'chills',              label: 'Chills or shivering' },
    { id: 'night_sweats',        label: 'Night sweats' },
    { id: 'frequent_urination',  label: 'Frequent urination' },
    { id: 'blurred_vision',      label: 'Blurred or impaired vision' }
  ];
  res.json({ symptoms });
});

// ---------------------------------------------------------------------------
// GET /diseases — returns all known diseases
// ---------------------------------------------------------------------------
app.get('/diseases', (_req, res) => {
  const diseases = [
    { id: 'influenza',       label: 'Influenza (Flu)' },
    { id: 'common_cold',     label: 'Common Cold' },
    { id: 'covid19',         label: 'COVID-19' },
    { id: 'pneumonia',       label: 'Pneumonia' },
    { id: 'heart_disease',   label: 'Heart Disease' },
    { id: 'gastroenteritis', label: 'Gastroenteritis (Stomach Flu)' },
    { id: 'dengue_fever',    label: 'Dengue Fever' },
    { id: 'malaria',         label: 'Malaria' },
    { id: 'diabetes',        label: 'Diabetes (Type 2)' },
    { id: 'tuberculosis',    label: 'Tuberculosis (TB)' }
  ];
  res.json({ diseases });
});

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'SWI-Prolog', version: '1.0.0' });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🩺 Medical Diagnosis API running at http://localhost:${PORT}`);
  console.log('  POST /diagnose   { symptoms: [...] }');
  console.log('  GET  /symptoms');
  console.log('  GET  /diseases\n');
});
