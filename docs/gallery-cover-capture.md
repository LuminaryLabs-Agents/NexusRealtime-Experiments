# Gallery Cover Capture

## Goal

The gallery should be calm and readable while each route provides its own visual identity through generated covers.

The cover flow is:

```txt
route loads
GameHost becomes ready
capture tool pauses normal loop
capture tool sets optional cover camera
capture tool ticks 90 frames at 1/60
capture tool screenshots the canvas
manifest maps route to webp cover
launcher displays the cover
```

## Default Capture Settings

```txt
viewport: 1280 x 720
deviceScaleFactor: 1
capture tick: 90
dt: 1 / 60
format: webp
quality: 82
```

## Manifest

The gallery reads:

```txt
experiments/_shared/generated-cover-manifest.json
```

A successful route entry looks like this:

```json
{
  "experiments/fogline-relay/": {
    "cover": "generated-covers/experiments-fogline-relay.webp",
    "capturedAtTick": 90,
    "viewport": [1280, 720],
    "format": "webp",
    "quality": 82,
    "source": "route-cover-capture",
    "status": "ok"
  }
}
```

A failed route entry should not break the gallery:

```json
{
  "games/example/": {
    "cover": null,
    "status": "failed",
    "reason": "GameHost not found"
  }
}
```

## Fallback Order

The launcher resolves covers in this order:

```txt
1. generated-cover-manifest.json entry with status ok
2. route-defined static coverImage / cover field
3. quiet procedural placeholder
4. text-only row if needed
```

## Commands

Dry-run manifest coverage:

```bash
npm run check:covers
```

Real capture against a local server:

```bash
NEXUS_COVER_BASE_URL=http://127.0.0.1:4173/ npm run capture:covers
```

The local server must host the repository root so routes like `./experiments/fogline-relay/` resolve correctly.

## Route Requirements

Playable routes should expose `window.GameHost` with:

```js
window.GameHost = {
  engine,
  tick(dt),
  getState(),
  captureReady()
};
```

Optional helpers:

```js
window.GameHost.setCoverCamera?.();
window.GameHost.hideHudForCapture?.();
window.GameHost.showHudAfterCapture?.();
window.GameHost.stop?.();
window.GameHost.start?.();
```

## Architecture Rule

The capture tool observes and ticks routes.

It does not own gameplay.

Routes render themselves.

The gallery displays the output.
