# 🩺 Medical Diagnosis System — Prolog + React

A complete expert system that simulates a virtual doctor.
Built with SWI-Prolog (inference engine) + Node.js (bridge API) + React (frontend).

---

## Project Structure

```
medical_diagnosis/
├── knowledge_base.pl   # 20 symptoms, 10 diseases, symptom→disease mappings
├── rules.pl            # Confidence scoring, ranking, urgency flags
├── engine.pl           # Dynamic session state, ask/has predicates
├── main.pl             # CLI entry point + JSON API for Node bridge
├── server.js           # Node.js REST bridge (Express)
└── frontend/
    └── App.jsx         # React frontend (step-by-step or grid selection)
```

---

## Prerequisites

| Tool         | Version  | Install |
|--------------|----------|---------|
| SWI-Prolog   | ≥ 8.x    | https://www.swi-prolog.org/Download.html |
| Node.js      | ≥ 18.x   | https://nodejs.org |
| npm          | ≥ 9.x    | bundled with Node |

---

## Option A — Pure Prolog CLI (no Node, no React)

### 1. Interactive mode (asks yes/no per symptom)

```bash
cd medical_diagnosis
swipl -g main -t halt main.pl
```

You'll see a menu:
```
  [1] Start New Diagnosis
  [2] Reset Session
  [3] Show All Diseases
  [4] Show All Symptoms
  [5] Exit
```

### 2. Programmatic mode (supply symptoms directly)

```prolog
swipl main.pl

# In the Prolog prompt:
?- run_with_symptoms([fever, cough, fatigue, headache]).
?- run_with_symptoms([chest_pain, shortness_of_breath, nausea]).
?- run_with_symptoms([fever, joint_pain, skin_rash, body_aches]).
```

### 3. JSON output (for integration)

```prolog
?- get_diagnosis_json([fever, cough, fatigue], J), writeln(J).
```

---

## Option B — Node.js API + React Frontend

### Step 1: Set up Node.js bridge

```bash
cd medical_diagnosis
npm init -y
npm install express cors
```

Copy your Prolog files into a `prolog/` subfolder so the server can find them:

```bash
mkdir prolog
cp *.pl prolog/
```

Start the API server:

```bash
node server.js
# → Running at http://localhost:3001
```

### Step 2: Set up React frontend

The `App.jsx` is a self-contained React component.
Drop it into any Vite/CRA project:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
# Replace src/App.jsx with the provided App.jsx
npm run dev
# → http://localhost:5173
```

The frontend runs the inference engine entirely in JavaScript (a faithful port
of the Prolog rules), so it works without the Node server too.

To connect to the Node server instead:
- Replace the `runDiagnosis()` call in App.jsx with a `fetch("http://localhost:3001/diagnose", ...)`

---

## Sample Test Queries (Prolog)

```prolog
# Flu
?- run_with_symptoms([fever, cough, body_aches, fatigue, chills]).

# COVID-19
?- run_with_symptoms([fever, cough, shortness_of_breath, fatigue, headache]).

# Heart disease (URGENT flag triggered)
?- run_with_symptoms([chest_pain, shortness_of_breath, fatigue, nausea]).

# Dengue fever
?- run_with_symptoms([fever, joint_pain, skin_rash, headache, body_aches]).

# Malaria
?- run_with_symptoms([fever, chills, nausea, night_sweats, vomiting]).

# Gastroenteritis
?- run_with_symptoms([nausea, vomiting, diarrhea, abdominal_pain]).

# Tuberculosis (URGENT flag triggered)
?- run_with_symptoms([cough, fever, night_sweats, fatigue, chest_pain]).

# Diabetes
?- run_with_symptoms([frequent_urination, fatigue, blurred_vision]).

# No match (too few symptoms)
?- run_with_symptoms([headache]).

# Overlapping (COVID vs Flu vs Pneumonia)
?- run_with_symptoms([fever, cough, fatigue, chills, shortness_of_breath]).
```

---

## Architecture

```
User Input
    │
    ▼
engine.pl         ← ask/1, has/1 predicates + session state (dynamic facts)
    │
    ▼
knowledge_base.pl ← symptom/1, disease/1, disease_symptom/2
    │
    ▼
rules.pl          ← disease_score/3, all_disease_scores/1, ranked_diagnoses/1
    │
    ▼
main.pl           ← CLI menus, JSON serialization, programmatic API
    │
    ▼ (optional)
server.js         ← REST API (Express, spawns Prolog subprocess)
    │
    ▼ (optional)
App.jsx           ← React UI (also contains JS port of inference engine)
```

### Confidence Scoring Formula

```
confidence = (matched_symptoms / total_disease_symptoms) × 100
```

A disease is included in results only if:
- At least **2 symptoms** matched
- Confidence ≥ **30%**

Results are ranked by confidence (highest first).

### Urgency Flags

Two hard-coded urgent conditions:
1. `chest_pain + shortness_of_breath` → **Heart disease: URGENT**
2. `fever + night_sweats + cough` → **Tuberculosis: URGENT**

---

## Extending the System

### Add a new disease:

In `knowledge_base.pl`:
```prolog
disease(migraine).
disease_symptom(migraine, headache).
disease_symptom(migraine, nausea).
disease_symptom(migraine, blurred_vision).
disease_description(migraine, 'Migraine is a neurological condition causing severe headaches.').
disease_advice(migraine, 'Rest in a dark room. Use prescribed migraine medication.').
```

### Add a new symptom:

In `knowledge_base.pl`:
```prolog
symptom(dizziness).
```

In `engine.pl`:
```prolog
symptom_label(dizziness, 'Dizziness or lightheadedness').
```

Then add it to any relevant disease's `disease_symptom/2` facts.

---

## Disclaimer

> This system is for **educational purposes only**.  
> It is not a substitute for professional medical advice, diagnosis, or treatment.  
> Always consult a qualified healthcare provider.
