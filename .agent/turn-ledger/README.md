# Agent Turn Ledger

This folder stores per-turn records for meaningful agent work.

Use a ledger entry when a turn makes or plans a change that affects architecture, canonical route state, route pruning, validation coverage, replay status, kit/domain boundaries, or future agent direction.

Do not require a ledger entry for tiny typo fixes or mechanical edits that do not affect project direction.

## File Naming

```txt
YYYY-MM-DD-<short-topic>.md
```

Example:

```txt
2026-06-25-agent-ledger-bootstrap.md
```

## Required Shape

Use `.agent/templates/ledger-entry-template.md` unless a cycle report is more appropriate.

Each entry should record:

- the goal;
- files read first;
- files changed;
- checks run or intentionally not run;
- decision notes;
- risks or watch items;
- the next ledge;
- what not to do next.

## Relationship to Cycle State

`.agent/cycle-state.md` remains the compact current-state summary. Ledger entries preserve turn-level reasoning and outcomes without overloading the current-state file.
