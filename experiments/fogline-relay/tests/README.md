# Fogline Relay test notes

The current repository-hosted experiment is browser-first because it imports NexusRealtime and ProtoKits from CDN. The debug contract supports manual smoke testing from the browser console:

```js
GameHost.getState()
GameHost.tick(1 / 60)
GameHost.engine.foglineRelay.getState()
GameHost.engine.visualPipeline.validate()
```

A later CI pass should add headless tests once this experiment's local package wiring is available to Node without CDN imports.
