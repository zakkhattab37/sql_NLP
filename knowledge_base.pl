% =============================================================================
% knowledge_base.pl
% Medical Diagnosis System — Knowledge Base
% Defines all symptoms, diseases, and their mappings.
% =============================================================================

:- module(knowledge_base, [
    symptom/1,
    disease/1,
    disease_symptom/2,
    disease_description/2,
    disease_advice/2
]).

% -----------------------------------------------------------------------------
% SYMPTOMS (20 total)
% symptom(+Name)
% -----------------------------------------------------------------------------
symptom(fever).
symptom(cough).
symptom(sore_throat).
symptom(runny_nose).
symptom(fatigue).
symptom(headache).
symptom(body_aches).
symptom(chest_pain).
symptom(shortness_of_breath).
symptom(nausea).
symptom(vomiting).
symptom(diarrhea).
symptom(abdominal_pain).
symptom(loss_of_appetite).
symptom(skin_rash).
symptom(joint_pain).
symptom(chills).
symptom(night_sweats).
symptom(frequent_urination).
symptom(blurred_vision).

% -----------------------------------------------------------------------------
% DISEASES (10 total)
% disease(+Name)
% -----------------------------------------------------------------------------
disease(influenza).
disease(common_cold).
disease(covid19).
disease(pneumonia).
disease(heart_disease).
disease(gastroenteritis).
disease(dengue_fever).
disease(malaria).
disease(diabetes).
disease(tuberculosis).

% -----------------------------------------------------------------------------
% DISEASE → SYMPTOM MAPPINGS
% disease_symptom(+Disease, +Symptom)
% A disease may have multiple symptom entries.
% Overlapping symptoms between diseases are intentional (real-world behavior).
% -----------------------------------------------------------------------------

% Influenza (flu)
disease_symptom(influenza, fever).
disease_symptom(influenza, cough).
disease_symptom(influenza, body_aches).
disease_symptom(influenza, fatigue).
disease_symptom(influenza, headache).
disease_symptom(influenza, chills).

% Common Cold
disease_symptom(common_cold, runny_nose).
disease_symptom(common_cold, sore_throat).
disease_symptom(common_cold, cough).
disease_symptom(common_cold, headache).
disease_symptom(common_cold, fatigue).

% COVID-19
disease_symptom(covid19, fever).
disease_symptom(covid19, cough).
disease_symptom(covid19, shortness_of_breath).
disease_symptom(covid19, fatigue).
disease_symptom(covid19, body_aches).
disease_symptom(covid19, headache).
disease_symptom(covid19, sore_throat).

% Pneumonia
disease_symptom(pneumonia, fever).
disease_symptom(pneumonia, cough).
disease_symptom(pneumonia, chest_pain).
disease_symptom(pneumonia, shortness_of_breath).
disease_symptom(pneumonia, fatigue).
disease_symptom(pneumonia, chills).

% Heart Disease
disease_symptom(heart_disease, chest_pain).
disease_symptom(heart_disease, shortness_of_breath).
disease_symptom(heart_disease, fatigue).
disease_symptom(heart_disease, nausea).

% Gastroenteritis (Stomach Flu)
disease_symptom(gastroenteritis, nausea).
disease_symptom(gastroenteritis, vomiting).
disease_symptom(gastroenteritis, diarrhea).
disease_symptom(gastroenteritis, abdominal_pain).
disease_symptom(gastroenteritis, fever).

% Dengue Fever
disease_symptom(dengue_fever, fever).
disease_symptom(dengue_fever, headache).
disease_symptom(dengue_fever, body_aches).
disease_symptom(dengue_fever, joint_pain).
disease_symptom(dengue_fever, skin_rash).
disease_symptom(dengue_fever, fatigue).

% Malaria
disease_symptom(malaria, fever).
disease_symptom(malaria, chills).
disease_symptom(malaria, headache).
disease_symptom(malaria, nausea).
disease_symptom(malaria, vomiting).
disease_symptom(malaria, night_sweats).
disease_symptom(malaria, fatigue).

% Diabetes (Type 2 early symptoms)
disease_symptom(diabetes, frequent_urination).
disease_symptom(diabetes, fatigue).
disease_symptom(diabetes, blurred_vision).
disease_symptom(diabetes, headache).
disease_symptom(diabetes, loss_of_appetite).

% Tuberculosis
disease_symptom(tuberculosis, cough).
disease_symptom(tuberculosis, night_sweats).
disease_symptom(tuberculosis, fever).
disease_symptom(tuberculosis, fatigue).
disease_symptom(tuberculosis, loss_of_appetite).
disease_symptom(tuberculosis, chest_pain).

% -----------------------------------------------------------------------------
% DISEASE DESCRIPTIONS — human-readable explanations
% disease_description(+Disease, +Description)
% -----------------------------------------------------------------------------
disease_description(influenza,
    'Influenza (flu) is a contagious respiratory illness caused by influenza viruses.').
disease_description(common_cold,
    'The common cold is a viral infection of the upper respiratory tract.').
disease_description(covid19,
    'COVID-19 is an infectious disease caused by the SARS-CoV-2 coronavirus.').
disease_description(pneumonia,
    'Pneumonia is an infection that inflames the air sacs in one or both lungs.').
disease_description(heart_disease,
    'Heart disease refers to conditions affecting the heart\'s structure and function.').
disease_description(gastroenteritis,
    'Gastroenteritis (stomach flu) is inflammation of the stomach and intestines.').
disease_description(dengue_fever,
    'Dengue fever is a mosquito-borne viral disease common in tropical regions.').
disease_description(malaria,
    'Malaria is a life-threatening disease caused by Plasmodium parasites via mosquitoes.').
disease_description(diabetes,
    'Diabetes is a chronic condition affecting how the body processes blood sugar.').
disease_description(tuberculosis,
    'Tuberculosis (TB) is a serious bacterial infection primarily affecting the lungs.').

% -----------------------------------------------------------------------------
% DISEASE ADVICE — recommended actions
% disease_advice(+Disease, +Advice)
% -----------------------------------------------------------------------------
disease_advice(influenza,
    'Rest, stay hydrated, and take antipyretics. Antiviral drugs may help if taken early.').
disease_advice(common_cold,
    'Rest, stay hydrated. Symptoms typically resolve in 7-10 days. Use decongestants if needed.').
disease_advice(covid19,
    'Isolate immediately. Seek medical evaluation. Monitor oxygen levels closely.').
disease_advice(pneumonia,
    'Seek immediate medical attention. Antibiotics (bacterial) or antivirals may be required.').
disease_advice(heart_disease,
    'Seek emergency care immediately. Do not drive yourself. Call emergency services.').
disease_advice(gastroenteritis,
    'Stay hydrated with clear fluids. Rest. Seek care if symptoms exceed 48 hours.').
disease_advice(dengue_fever,
    'No specific antiviral exists. Rest, fluids, and paracetamol. Avoid NSAIDs.').
disease_advice(malaria,
    'Seek immediate medical treatment. Antimalarial drugs are essential and time-sensitive.').
disease_advice(diabetes,
    'Consult an endocrinologist. Lifestyle changes, monitoring, and medication may be needed.').
disease_advice(tuberculosis,
    'Requires 6-month antibiotic course. Seek medical evaluation immediately.').
