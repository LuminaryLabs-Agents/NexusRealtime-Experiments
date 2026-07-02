# NexusRealtime-KitInjector

Linear CLI for turning route feedback into kit-injection proposals.

## What It Reads

- Repo memory: `memory.md`.
- Agent state: `.agent/START_HERE.md`, `.agent/cycle-state.md`, `.agent/protokit-map.md`.
- Route files from `--game`.
- Route feedback from `--feedback`.
- Existing local kit folders under `protokits/`.
- Sibling ProtoKits folders when `../NexusRealtime-ProtoKits/protokits/` exists.

## What It Writes

By default it writes only a context packet:

```txt
feedback/<route-slug>/kit-injector/context-packet.md
```

When `--call-nim` is passed and `NVIDIA_API_KEY` or `NVIDIA_NIM_API_KEY` is set, it also writes:

```txt
feedback/<route-slug>/kit-injector/response.md
```

## Usage

```txt
npm run kit:inject -- --game games/rogue-lite-hellscape-siege --feedback feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md
```

Call NVIDIA NIM GLM 5.1:

```txt
NVIDIA_API_KEY=<key> npm run kit:inject -- --game games/rogue-lite-hellscape-siege --feedback feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md --call-nim
```

## NIM Defaults

- Base URL: `https://integrate.api.nvidia.com/v1`
- Model: `z-ai/glm-5.1`

Override with:

```txt
--base-url https://integrate.api.nvidia.com/v1 --model z-ai/glm-5.1
```

## Boundary

This CLI does not mutate game files. It produces a reviewed proposal packet first. Code edits should happen only after the target kit repo and preservation checks are clear.
