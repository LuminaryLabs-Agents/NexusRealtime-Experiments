# Domain Ideas

This folder tracks atomic domain candidates for NexusRealtime / ProtoKit DSK planning.

These are not full games.

These are possible domain boundaries, scoped domains, and atomic domains that may eventually become installable Domain Service Kits when they prove they own reusable rules.

## Mental model

```txt
Domain
  = a boundary of meaning.

Scoped domain
  = a domain at a smaller boundary.

Atomic domain
  = the smallest useful boundary that owns real reusable rules.

DSK
  = the installable service kit for that domain boundary.

Game
  = horizontal composition of many DSKs.
```

Every kit is a domain kit at some scale.

## Folder structure

```txt
Ideas/domain-ideas/
├─ README.md
├─ tracking/
│  └─ domain-index.md
├─ templates/
│  └─ domain-idea-packet-template.md
└─ packets/
   ├─ food-surface-domains/
   ├─ food-container-utensil-domains/
   ├─ collectible-paper-light-flexible-domains/
   ├─ nature-hard-surface-interaction-domains/
   └─ descriptor-optimization-audio-domains/
```

## Packet rule

A domain idea packet should explain:

- which atomic domain candidates it contains
- what each domain boundary might own
- what proof object or interaction could validate it
- whether it should update an existing DSK first
- whether it is likely reusable across many games

## Domain-update-first rule

Before creating a new DSK:

```txt
1. Check whether an existing domain owns the behavior.
2. Check whether this is only a preset/config.
3. Check whether this is only bridge code inside an experiment.
4. Create a new DSK only if the boundary owns reusable service rules.
```
