# NexusRealtime Experiments

Browser experiments that compose NexusRealtime kits into playable slices.

## Next Ledge

experiments/next-ledge/ is a cinematic grapple-climb validation demo. It imports the real NexusRealtime runtime, composes the Next Ledge cinematic ascent ProtoKit, maps browser input into engine.nextLedge APIs, ticks the runtime, and renders engine.nextLedge.getSnapshot() with Three.js.

Open experiments/next-ledge/index.html in a browser or serve the repository with any static file server.

Controls: Click/tap/Space release or fire grapple, A/D or arrows swing momentum, R restart, N advance sector.

## Fogline Relay

experiments/fogline-relay/ is a first-person fog-forest relay experiment. It imports NexusRealtime 0.0.1, composes stable kits with the ProtoKits render-layer-kit, keeps the Canvas renderer presentation-only, and validates renderer-agnostic visual buckets, fog volumes, volumetric light descriptors, relay scanning, objective flow, and wraith hazards.

Open experiments/fogline-relay/index.html in a browser or serve the repository with any static file server.

Controls: WASD move, mouse or arrow keys look, hold E scan, R restart, click canvas for pointer lock.

## Sora The Infinite

experiments/sora-the-infinite/ is a branded aerial-flight validation demo for the generic aerial ProtoKit stack. It imports the real NexusRealtime runtime, composes createGenericAerialAdventureKits, maps keyboard input into engine.genericFlightInput.setInput(), ticks the runtime, and renders engine.genericAerialRenderDescriptor.getState().

Open experiments/sora-the-infinite/index.html in a browser or serve the repository with any static file server.

Controls: W/S pitch, A/D bank, Space boost, debug key logs debug state.

## Zombie Orchard

experiments/zombie-orchard/ is a kit-composed survival experiment. It intentionally does not define a new engine. The game layer only composes kits, defines content, feeds input into kit APIs/resources, reads snapshots/events, and renders a canvas view.

Open experiments/zombie-orchard/index.html in a browser or serve the repository with any static file server.

Controls: WASD/arrows move, Shift sprint, Space dodge, E collect or pick up, mouse/J use equipped gear, 1/2/3 swap, R force next round, P pause.
