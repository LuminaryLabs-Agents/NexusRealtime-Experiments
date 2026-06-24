# Gallery Redesign Change Ledger

## Goal

Move the NexusRealtime gallery from a loud showcase surface to a calm launcher where route covers provide the visual identity.

## Before

```txt
bright aurora background
high saturation
large glow fields
rainbow dividers
oversized animated rows
background competes with route content
```

## After

```txt
quiet dark neutral base
soft top gradient
compact cover-first rows
subtle dividers
reduced animation
real generated covers as the color source
```

## Implemented Changes

### Gallery Shell

```txt
experiments/_shared/nexus-experiments-shell.js
```

Replaced the high-saturation arcade styling with a calm cover-aware launcher.

Added generated cover manifest loading.

Added fallback placeholders for routes without generated covers.

Kept search, tabs, keyboard navigation, and route opening behavior.

### Root Page

```txt
index.html
```

Removed the arcade override script from the root page.

Updated the cache key for the calm cover-aware shell.

### Cover Manifest

```txt
experiments/_shared/generated-cover-manifest.json
```

Added the manifest scaffold used by the launcher.

### Cover Capture Tooling

```txt
tools/cover-capture.config.mjs
tools/route-cover-utils.mjs
tools/capture-route-covers.mjs
```

Added deterministic cover capture helpers and a Playwright-based capture script.

### Package Scripts

```txt
npm run check:covers
npm run capture:covers
```

Added dry-run and real capture commands.

## Fallback Order

```txt
generated cover manifest
route-defined cover field
quiet procedural placeholder
text-only row
```

## Acceptance Notes

The gallery should remain readable even if no generated covers exist yet.

Missing covers must not block route discovery.

The launcher should stay calm.

The routes should provide the visual richness.
