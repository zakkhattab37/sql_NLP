% =============================================================================
% main.pl
% Medical Diagnosis System — Entry Point & CLI Interface
% =============================================================================
%
% HOW TO RUN (SWI-Prolog):
%   swipl -g main -t halt main.pl
%
% Or interactively:
%   swipl main.pl
%   ?- main.
%   ?- run_with_symptoms([fever, cough, fatigue]).  % programmatic mode
%
% =============================================================================

:- use_module(knowledge_base).
:- use_module(engine).
:- use_module(rules).

% =============================================================================
% TOP-LEVEL ENTRY POINT
% =============================================================================

main :-
    print_banner,
    main_menu.

% -----------------------------------------------------------------------------
% main_menu/0 — interactive CLI loop
% -----------------------------------------------------------------------------
main_menu :-
    nl,
    format("  ┌──────────────────────────────────────┐~n"),
    format("  │           MAIN MENU                  │~n"),
    format("  │  [1] Start New Diagnosis              │~n"),
    format("  │  [2] Reset Session                    │~n"),
    format("  │  [3] Show All Diseases                │~n"),
    format("  │  [4] Show All Symptoms                │~n"),
    format("  │  [5] Exit                             │~n"),
    format("  └──────────────────────────────────────┘~n"),
    format("  Choose an option: "),
    read_term(Choice, [atom(true)]),
    handle_menu(Choice).

handle_menu('1') :- !, run_diagnosis.
handle_menu('2') :- !, reset_session, main_menu.
handle_menu('3') :- !, list_diseases, main_menu.
handle_menu('4') :- !, list_symptoms, main_menu.
handle_menu('5') :- !,
    format("~n  Thank you for using the Medical Diagnosis System.~n"),
    format("  Always consult a real doctor for medical decisions.~n~n").
handle_menu(_) :-
    format("  Invalid option. Please try again.~n"),
    main_menu.

% =============================================================================
% DIAGNOSIS WORKFLOW
% =============================================================================

run_diagnosis :-
    ( session_active ->
        format("~n  ⚠  A session is already active.~n"),
        format("  Reset it first or continue adding symptoms.~n"),
        confirm_continue
    ; true ),
    print_section("SYMPTOM ASSESSMENT"),
    format("  I will ask you about common symptoms.~n"),
    format("  Answer [yes] or [no] for each question.~n"),
    format("  Type exactly: yes. or no. (with a period)~n~n"),
    % Ask about all 20 known symptoms
    findall(S, symptom(S), Symptoms),
    ask_all_symptoms(Symptoms),
    % Compute urgency flags
    check_urgency,
    % Display results
    print_diagnosis_results.

% -----------------------------------------------------------------------------
% ask_all_symptoms(+List) — iterate through symptom list
% -----------------------------------------------------------------------------
ask_all_symptoms([]).
ask_all_symptoms([H|T]) :-
    ( already_asked(H) ->
        true
    ;
        ignore(has(H))      % has/1 may fail if user says no; that's fine
    ),
    ask_all_symptoms(T).

% -----------------------------------------------------------------------------
% confirm_continue/0 — ask user if they want to continue with active session
% -----------------------------------------------------------------------------
confirm_continue :-
    format("  Continue with current session? [yes/no]: "),
    read_term(A, [atom(true)]),
    ( member(A, [yes, y]) -> true ; reset_session ).

% =============================================================================
% RESULTS DISPLAY
% =============================================================================

print_diagnosis_results :-
    print_section("DIAGNOSIS RESULTS"),
    all_confirmed_symptoms(Confirmed),
    ( Confirmed = [] ->
        format("  You reported no symptoms. No diagnosis possible.~n")
    ;
        format("  Confirmed symptoms: ~w~n~n", [Confirmed]),
        ranked_diagnoses(Results),
        ( Results = [] ->
            print_no_match
        ;
            print_results(Results, 1)
        )
    ),
    print_disclaimer,
    format("~n  Press Enter to return to menu...~n"),
    read_term(_, [atom(true)]),
    main_menu.

% -----------------------------------------------------------------------------
% print_results(+List, +Rank)
% -----------------------------------------------------------------------------
print_results([], _).
print_results([diag(Disease, Conf, Match, Total, Desc, Advice)|Rest], Rank) :-
    confidence_label(Conf, Label),
    urgency_marker(Disease, Marker),
    format("  ~`═t~50|~n"),
    format("  #~w  ~w ~w~n", [Rank, Disease, Marker]),
    format("  ~`─t~50|~n"),
    format("  Confidence : ~w% (~w / ~w symptoms matched)~n", [Conf, Match, Total]),
    format("  Assessment : ~w~n", [Label]),
    format("  About      : ~w~n", [Desc]),
    format("  Advice     : ~w~n", [Advice]),
    nl,
    NextRank is Rank + 1,
    print_results(Rest, NextRank).

% -----------------------------------------------------------------------------
% urgency_marker(+Disease, -Marker)
% -----------------------------------------------------------------------------
urgency_marker(Disease, '⚠ URGENT') :-
    current_predicate(urgent_flag/1),
    urgent_flag(Disease), !.
urgency_marker(_, '').

% -----------------------------------------------------------------------------
% print_no_match/0
% -----------------------------------------------------------------------------
print_no_match :-
    format("  ─────────────────────────────────────────────────~n"),
    format("  No confident diagnosis could be established.~n"),
    format("~n  This may mean:~n"),
    format("    • Your symptoms match no common pattern~n"),
    format("    • You reported very few symptoms~n"),
    format("    • Your condition is rare or complex~n"),
    format("~n  ➜  Please consult a qualified healthcare provider.~n"),
    format("  ─────────────────────────────────────────────────~n").

% =============================================================================
% INFORMATIONAL DISPLAYS
% =============================================================================

list_diseases :-
    print_section("KNOWN DISEASES"),
    findall(D, disease(D), Diseases),
    forall(member(D, Diseases), (
        disease_description(D, Desc),
        format("  • ~w~n    ~w~n~n", [D, Desc])
    )).

list_symptoms :-
    print_section("KNOWN SYMPTOMS"),
    findall(S, symptom(S), Symptoms),
    forall(member(S, Symptoms), (
        symptom_label(S, Label),
        format("  • ~w~n", [Label])
    )).

% =============================================================================
% PROGRAMMATIC API
% Useful for testing and for the Node.js bridge
% =============================================================================

%% run_with_symptoms(+SymptomList)
%  Set symptoms programmatically and print diagnosis without CLI interaction.
%  Example: run_with_symptoms([fever, cough, fatigue, headache]).
run_with_symptoms(SymptomList) :-
    reset_session,
    forall(member(S, SymptomList), assert_symptom(S)),
    check_urgency,
    ranked_diagnoses(Results),
    ( Results = [] ->
        format("No confident diagnosis. Consult a doctor.~n")
    ;
        print_results(Results, 1)
    ).

%% get_diagnosis_json(+SymptomList, -JsonString)
%  Returns a JSON-formatted string for use by external systems (Node.js bridge).
%  Usage: get_diagnosis_json([fever, cough], JSON).
get_diagnosis_json(SymptomList, JsonString) :-
    reset_session,
    forall(member(S, SymptomList), assert_symptom(S)),
    check_urgency,
    ranked_diagnoses(Results),
    results_to_json(Results, JsonString).

results_to_json([], '{"diagnoses":[]}') :- !.
results_to_json(Results, Json) :-
    maplist(diag_to_json_obj, Results, Parts),
    atomic_list_concat(Parts, ',', Inner),
    atomic_list_concat(['{"diagnoses":[', Inner, ']}'], Json).

diag_to_json_obj(diag(D, Conf, Match, Total, Desc, Advice), Obj) :-
    ( current_predicate(urgent_flag/1), urgent_flag(D) -> Urgent = true ; Urgent = false ),
    confidence_label(Conf, Label),
    atomic_list_concat([
        '{"disease":"', D, '",',
        '"confidence":', Conf, ',',
        '"matched":', Match, ',',
        '"total":', Total, ',',
        '"label":"', Label, '",',
        '"urgent":', Urgent, ',',
        '"description":"', Desc, '",',
        '"advice":"', Advice, '"}'
    ], Obj).

% =============================================================================
% PRINT UTILITIES
% =============================================================================

print_banner :-
    nl,
    format("  ╔══════════════════════════════════════════════╗~n"),
    format("  ║     🩺  MEDICAL DIAGNOSIS SYSTEM  🩺          ║~n"),
    format("  ║         AI-Powered Symptom Checker           ║~n"),
    format("  ║         Built with SWI-Prolog                ║~n"),
    format("  ╚══════════════════════════════════════════════╝~n"),
    format("  ⚠  DISCLAIMER: For educational use only.       ~n"),
    format("     Always consult a real medical professional.  ~n"),
    nl.

print_section(Title) :-
    nl,
    format("  ╔══════════════════════════════════════════════╗~n"),
    format("  ║  ~w~t~46|║~n", [Title]),
    format("  ╚══════════════════════════════════════════════╝~n"),
    nl.

print_disclaimer :-
    nl,
    format("  ─────────────────────────────────────────────────~n"),
    format("  ⚠  IMPORTANT: This is NOT a medical diagnosis.~n"),
    format("     Consult a licensed doctor before taking action.~n"),
    format("  ─────────────────────────────────────────────────~n").

% =============================================================================
% SAMPLE TEST QUERIES (run from SWI-Prolog prompt)
% =============================================================================
%
%  Test 1 — Flu-like symptoms:
%    ?- run_with_symptoms([fever, cough, body_aches, fatigue, chills]).
%
%  Test 2 — COVID-like symptoms:
%    ?- run_with_symptoms([fever, cough, shortness_of_breath, fatigue, headache]).
%
%  Test 3 — Urgent cardiac:
%    ?- run_with_symptoms([chest_pain, shortness_of_breath, fatigue, nausea]).
%
%  Test 4 — Dengue:
%    ?- run_with_symptoms([fever, joint_pain, skin_rash, headache, body_aches]).
%
%  Test 5 — No match / too few symptoms:
%    ?- run_with_symptoms([headache]).
%
%  Test 6 — JSON output for Node.js bridge:
%    ?- get_diagnosis_json([fever, cough, fatigue], J), writeln(J).
%
%  Test 7 — Interactive CLI:
%    ?- main.
