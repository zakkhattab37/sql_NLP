% =============================================================================
% rules.pl
% Medical Diagnosis System — Inference Rules
% Computes disease scores, confidence levels, and rankings.
% =============================================================================

:- module(rules, [
    disease_score/3,
    all_disease_scores/1,
    ranked_diagnoses/1,
    confidence_label/2
]).

:- use_module(knowledge_base).
:- use_module(engine).

% -----------------------------------------------------------------------------
% disease_score(+Disease, +MatchCount, +TotalSymptoms)
%
% Counts how many of a disease's known symptoms the user has reported,
% and how many total symptoms the disease is associated with.
%
% Strategy:
%   score = matched / total  → used to compute confidence percentage
% -----------------------------------------------------------------------------
disease_score(Disease, MatchCount, TotalSymptoms) :-
    disease(Disease),
    % Find all symptoms defined for this disease
    findall(S, disease_symptom(Disease, S), AllSymptoms),
    length(AllSymptoms, TotalSymptoms),
    TotalSymptoms > 0,
    % Find which of those symptoms the user has confirmed
    findall(S, (
        disease_symptom(Disease, S),
        has(S)          % engine.pl dynamic predicate
    ), MatchedSymptoms),
    length(MatchedSymptoms, MatchCount).

% -----------------------------------------------------------------------------
% all_disease_scores(-ScoreList)
%
% Returns a list of disease-score pairs sorted by confidence (descending).
% Format: [score(Disease, MatchCount, TotalSymptoms, Confidence), ...]
%
% Only includes diseases with at least 1 matched symptom.
% Confidence is expressed as a percentage (0–100), rounded to 1 decimal.
% -----------------------------------------------------------------------------
all_disease_scores(Sorted) :-
    findall(
        score(Disease, Match, Total, Confidence),
        (
            disease_score(Disease, Match, Total),
            Match > 0,
            Confidence is round((Match / Total) * 1000) / 10   % 1 decimal place
        ),
        Scores
    ),
    % Sort descending by confidence (4th argument = Confidence)
    sort(4, @>=, Scores, Sorted).

% -----------------------------------------------------------------------------
% ranked_diagnoses(-RankedList)
%
% Public predicate: returns ranked, human-readable diagnoses.
% Format: [diag(Disease, Confidence, Description, Advice), ...]
% Only returns diagnoses with confidence ≥ 30%.
% -----------------------------------------------------------------------------
ranked_diagnoses(Results) :-
    all_disease_scores(Scores),
    include(above_threshold, Scores, Filtered),
    maplist(to_diagnosis, Filtered, Results).

above_threshold(score(_, Match, Total, _)) :-
    Match >= 2,                             % at least 2 symptoms matched
    Ratio is Match / Total,
    Ratio >= 0.30.                          % at least 30% symptom overlap

to_diagnosis(score(Disease, Match, Total, Conf), diag(Disease, Conf, Match, Total, Desc, Advice)) :-
    disease_description(Disease, Desc),
    disease_advice(Disease, Advice).

% -----------------------------------------------------------------------------
% confidence_label(+Confidence, -Label)
%
% Maps numeric confidence to a human-readable urgency label.
% -----------------------------------------------------------------------------
confidence_label(Conf, 'High Confidence') :- Conf >= 70, !.
confidence_label(Conf, 'Moderate Confidence') :- Conf >= 45, !.
confidence_label(Conf, 'Low Confidence') :- Conf >= 30, !.
confidence_label(_, 'Unlikely').

% -----------------------------------------------------------------------------
% PRIORITY RULES (hard-coded critical conditions)
%
% Certain disease combinations trigger an immediate urgent flag
% regardless of confidence score.
% -----------------------------------------------------------------------------

% Heart disease with specific symptom combo is always URGENT
:- dynamic urgent_flag/1.

check_urgency :-
    retractall(urgent_flag(_)),
    ( (has(chest_pain), has(shortness_of_breath))
    -> assertz(urgent_flag(heart_disease))
    ; true ),
    ( (has(fever), has(night_sweats), has(cough))
    -> assertz(urgent_flag(tuberculosis))
    ; true ).
