# Next Ledge Grapple

A browser-playable NexusRealtime game folder for the cinematic grapple-climb loop.

## Run

Open:

    /games/next-ledge-grapple/

or serve the repository root and visit:

    http://localhost:PORT/games/next-ledge-grapple/

## Controls

    Click / Space: release, fire grapple, or restart after fail/win
    A / D or arrows: swing momentum while attached
    R: restart current sector
    N: advance sector

## Folder contract

This game folder keeps the presentation shell local and offloads reusable simulation to ProtoKits:

    index.html
    styles.css
    src/game.js
    README.md

## Kit contract

Gameplay state is owned by `NexusRealtime-ProtoKits/protokits/next-ledge-grapple-kit/`.
The game host imports NexusRealtime, imports the ProtoKit, composes it with `createRealtimeGame({ kits })`, maps input into `engine.nextLedgeGrapple`, ticks the runtime, and renders the returned snapshot with Three.js.

The game folder should not own reach checks, stamina rules, swing physics, grapple latch rules, reel-in behavior, win/loss, restart, or sector progression.
