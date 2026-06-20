# Nexus Realtime Ideas

This folder tracks game ideas, arcade concepts, experiment concepts, and future playable slices for NexusRealtime.

Each idea should live in its own **idea packet folder**.

An idea packet is a small folder that keeps the concept, prototype plan, scoring notes, playtest notes, and lifecycle status together.

## Why this exists

Ideas should not disappear inside chat threads.

Every useful idea should become a small, reviewable packet.

The packet does not need to be perfect at first.

It only needs to be easy to find, improve, and eventually move toward prototype.

## Folder structure

```txt
Ideas/
├─ README.md
├─ tracking/
│  ├─ idea-index.md
│  └─ status-board.md
├─ templates/
│  ├─ idea-packet-template/
│  │  ├─ README.md
│  │  ├─ concept.md
│  │  ├─ prototype-plan.md
│  │  ├─ scoring-rubric.md
│  │  └─ playtest-notes.md
│  └─ single-file-game-idea-template.md
└─ packets/
   └─ example-arcade-idea/
      ├─ README.md
      ├─ concept.md
      ├─ prototype-plan.md
      ├─ scoring-rubric.md
      └─ playtest-notes.md
```

## Idea lifecycle

```txt
raw
  ↓
refined
  ↓
ready-for-prototype
  ↓
playtest-candidate
  ↓
production-candidate
  ↓
shipped / merged / retired / superseded
```

## Packet rule

Every substantial idea gets a folder.

Each folder should contain:

- `README.md` for the packet summary.
- `concept.md` for the full game idea.
- `prototype-plan.md` for the smallest playable test.
- `scoring-rubric.md` for evaluation.
- `playtest-notes.md` for feedback over time.

## Naming rule

Use lowercase, hyphenated folder names.

Good:

```txt
packets/neon-orbit-racer/
packets/goblin-copy-office/
packets/haunted-pinball-defense/
```

Avoid:

```txt
packets/New Game Idea 1/
packets/final-final-game/
```

## Current goal

Use this folder as the living backlog for future NexusRealtime and Nexus Arcade game ideas.
