# Next Ledge

A NexusRealtime playable experiment for the **Next Ledge** cinematic grapple-climb prototype.

This folder is intentionally small. Gameplay rules live in the ProtoKit:

```txt
NexusRealtime-ProtoKits/protokits/next-ledge-kit/cinematic-ascent-kit.js
```

The Experiment host only:

```txt
imports NexusRealtime and the ProtoKit
maps browser input into engine.nextLedge APIs
ticks the runtime
renders the snapshot with Three.js
plays small Web Audio cues from kit events
shows two tiny HUD readouts
exposes window.GameHost for inspection
```

## Run

Open this file from a static server:

```txt
experiments/next-ledge/index.html
```

The browser needs internet access for CDN module imports:

```txt
NexusRealtime runtime
next-ledge-kit ProtoKit
Three.js
```

If a CDN import fails, the visible error panel prints the startup error instead of silently showing a blank screen.

## Controls

```txt
Click / tap / Space  release, fire, retract, or cancel depending on current mode
A / D or arrows      swing momentum while tethered
R                    restart current sector
N                    advance to next generated sector
```

## Debug

In the browser console:

```js
GameHost.getState();
GameHost.engine.nextLedge.getSnapshot();
GameHost.restart();
GameHost.advanceSector();
GameHost.tick(1 / 60, { action: true });
```

## Architecture

```txt
ProtoKit owns:
  procedural ledges
  sector progression
  stamina
  swing/fall/grapple/reel/win/death rules
  rope nodes
  trajectory descriptors
  gameplay event log

Renderer owns:
  Three.js scene setup
  mesh/material synchronization
  screen-to-world projection

Input owns:
  keyboard/pointer/mobile pad collection
  one-frame command flushing into kit APIs

HUD owns:
  small read-only text binding
```

See `PLAN.md` for the full conversion and promotion plan.
