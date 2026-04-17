% =============================================================================
% engine.pl
% Medical Diagnosis System — Inference Engine
% Manages session state, user interaction, and symptom querying.
% =============================================================================

:- module(engine, [
    has/1,
    ask/1,
    assert_symptom/1,
    deny_symptom/1,
    reset_session/0,
    already_asked/1,
    all_confirmed_symptoms/1,
    session_active/0
]).

% -----------------------------------------------------------------------------
% DYNAMIC PREDICATES
%
% These store per-session state in memory (not persisted to disk).
%
%   symptom_yes(S)   — user confirmed they HAVE symptom S
%   symptom_no(S)    — user confirmed they DO NOT have symptom S
%   asked(S)         — symptom S has already been queried this session
% -----------------------------------------------------------------------------
:- dynamic symptom_yes/1.
:- dynamic symptom_no/1.
:- dynamic asked/1.

% -----------------------------------------------------------------------------
% has(+Symptom)
%
% Succeeds if the user has confirmed this symptom (either from cache or
% by asking the user directly via the CLI).
%
% Flow:
%   1. Already confirmed → succeed immediately
%   2. Already denied    → fail immediately
%   3. Not yet asked     → ask the user, then cache the answer
% -----------------------------------------------------------------------------
has(Symptom) :-
    symptom_yes(Symptom), !.        % already confirmed: fast path

has(Symptom) :-
    symptom_no(Symptom), !, fail.   % already denied: fast fail

has(Symptom) :-
    ask(Symptom),                   % prompt the user
    symptom_yes(Symptom), !.        % check if they said yes

% -----------------------------------------------------------------------------
% ask(+Symptom)
%
% Prints a formatted question and reads the user's yes/no answer.
% Caches the result using assert_symptom or deny_symptom.
% Marks the symptom as asked so it won't be asked again.
% -----------------------------------------------------------------------------
ask(Symptom) :-
    already_asked(Symptom), !, fail.   % never ask twice

ask(Symptom) :-
    assertz(asked(Symptom)),
    symptom_label(Symptom, Label),
    format("~n  ~`─t~50|~n", []),
    format("  Do you have: ~w?~n", [Label]),
    format("  ~`─t~50|~n", []),
    format("  Enter [yes/no/y/n] then press Enter: ", []),
    read_term(Answer, [atom(true)]),
    ( member(Answer, [yes, y]) ->
        assertz(symptom_yes(Symptom)),
        format("  ✓ Noted: ~w confirmed.~n", [Label])
    ;
        assertz(symptom_no(Symptom)),
        format("  ✗ Noted: ~w not present.~n", [Label])
    ).

% -----------------------------------------------------------------------------
% assert_symptom(+Symptom)
% deny_symptom(+Symptom)
%
% Programmatic (non-interactive) way to set symptoms.
% Used by the JSON/HTTP bridge for frontend integration.
% -----------------------------------------------------------------------------
assert_symptom(Symptom) :-
    retractall(symptom_no(Symptom)),
    ( symptom_yes(Symptom) -> true ; assertz(symptom_yes(Symptom)) ),
    ( asked(Symptom) -> true ; assertz(asked(Symptom)) ).

deny_symptom(Symptom) :-
    retractall(symptom_yes(Symptom)),
    ( symptom_no(Symptom) -> true ; assertz(symptom_no(Symptom)) ),
    ( asked(Symptom) -> true ; assertz(asked(Symptom)) ).

% -----------------------------------------------------------------------------
% already_asked(+Symptom)
%
% True if this symptom has already been presented to the user.
% -----------------------------------------------------------------------------
already_asked(Symptom) :-
    asked(Symptom).

% -----------------------------------------------------------------------------
% all_confirmed_symptoms(-List)
%
% Returns the list of all symptoms the user confirmed having.
% -----------------------------------------------------------------------------
all_confirmed_symptoms(List) :-
    findall(S, symptom_yes(S), List).

% -----------------------------------------------------------------------------
% reset_session/0
%
% Clears all session state. Call this to start a new diagnostic session.
% -----------------------------------------------------------------------------
reset_session :-
    retractall(symptom_yes(_)),
    retractall(symptom_no(_)),
    retractall(asked(_)),
    ( current_predicate(urgent_flag/1) -> retractall(urgent_flag(_)) ; true ),
    format("~n  Session reset. All symptom data cleared.~n~n", []).

% -----------------------------------------------------------------------------
% session_active/0
%
% True if at least one symptom has been assessed in the current session.
% -----------------------------------------------------------------------------
session_active :-
    ( symptom_yes(_) ; symptom_no(_) ), !.

% -----------------------------------------------------------------------------
% symptom_label(+Symptom, -Label)
%
% Maps internal atom names to readable English labels.
% -----------------------------------------------------------------------------
symptom_label(fever,               'Fever (high body temperature)').
symptom_label(cough,               'Cough (persistent or dry)').
symptom_label(sore_throat,         'Sore throat').
symptom_label(runny_nose,          'Runny or stuffy nose').
symptom_label(fatigue,             'Fatigue / persistent tiredness').
symptom_label(headache,            'Headache').
symptom_label(body_aches,          'Body aches or muscle pain').
symptom_label(chest_pain,          'Chest pain or tightness').
symptom_label(shortness_of_breath, 'Shortness of breath').
symptom_label(nausea,              'Nausea').
symptom_label(vomiting,            'Vomiting').
symptom_label(diarrhea,            'Diarrhea').
symptom_label(abdominal_pain,      'Abdominal / stomach pain').
symptom_label(loss_of_appetite,    'Loss of appetite').
symptom_label(skin_rash,           'Skin rash').
symptom_label(joint_pain,          'Joint pain').
symptom_label(chills,              'Chills or shivering').
symptom_label(night_sweats,        'Night sweats').
symptom_label(frequent_urination,  'Frequent urination').
symptom_label(blurred_vision,      'Blurred or impaired vision').
symptom_label(S,                   S).    % fallback: use atom as-is
