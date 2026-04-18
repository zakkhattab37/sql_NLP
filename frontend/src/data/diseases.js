export const KB = {
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

export const DISEASE_LABELS_AR = {
  influenza: "الإنفلونزا", common_cold: "الزكام", covid19: "كوفيد-19",
  pneumonia: "الالتهاب الرئوي", heart_disease: "أمراض القلب", gastroenteritis: "التهاب المعدة والأمعاء",
  dengue_fever: "حمى الضنك", malaria: "الملاريا", diabetes: "السكري", tuberculosis: "السل",
  asthma: "الربو", migraine: "الصداع النصفي", anemia: "فقر الدم"
};

export const DISEASE_LABELS_EN = {
  influenza: "Influenza", common_cold: "Common Cold", covid19: "COVID-19",
  pneumonia: "Pneumonia", heart_disease: "Heart Disease", gastroenteritis: "Gastroenteritis",
  dengue_fever: "Dengue Fever", malaria: "Malaria", diabetes: "Diabetes", tuberculosis: "Tuberculosis",
  asthma: "Asthma", migraine: "Migraine", anemia: "Anemia"
};
