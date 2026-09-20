---
description: 'Novactorio recreates the factory-automation loop in the browser: gather resources, build machines, route materials, research, and survive.'
keywords:
- Bartosz Osiej Docs
- networking
- browser
- rendering
- AST
- documentation
title: Gameplay Systems
---
# Gameplay Systems

Novactorio recreates the factory-automation loop in the browser: gather
resources, build machines, route materials, research, and survive.

## Core loop

1. **Mine** raw resources from the procedurally generated world.
2. **Build** machines, belts, pipes, and inserters to automate production.
3. **Research** upgrades in the research tree.
4. **Expand** — pollution attracts and evolves enemies.
5. **Co-op** — share the factory with friends in real time.

## Supply chains & logistics

`systems.ts` implements the material-flow simulation:

- **Conveyor belts** — items move along belts and merge/split at junctions.
- **Inserters** — transfer items between belts, containers, and machines.
- **Pipe networks** — fluids and materials flow through connected pipes.
- **Supply chains** — recipes consume inputs and produce outputs; machines
  pause when inputs run dry.

## World generation

- **Chunk-based** infinite world (`world.ts`).
- **Perlin noise** terrain (`noise.ts`) with smooth height variation.
- **Seamless scrolling** — chunks generate and unload around the player.

## Combat & evolution

- **Enemy AI** — enemies spawn, path toward your pollution/factory, and attack.
- **Pollution** — production emits pollution; higher pollution drives faster
  enemy evolution (bigger, tougher enemies over time).
- Pollution is visualized in-game via the `PollutionOverlay` render module.

## Combat & interactions

- **Build / remove** blocks and machines with a build menu.
- **Inventory** per player with hotbar-style access.
- **Particles & damage numbers** for juicy feedback (`renderer.ts`).

## Visual & ambient systems (`src/render/`)

| Module | In-game effect |
|---|---|
| `AmbientAtmosphere.ts` | Sky and atmosphere grading |
| `ParticleEffects.ts` | Smoke, sparks, explosion particles |
| `PollutionOverlay.ts` | Pollution haze over polluted areas |
| `ScreenEffects.ts` | Screen-space feedback (flash, vignette) |
| `SpriteManager.ts` | Efficient sprite atlas rendering |
| `WeatherSystem.ts` | Dynamic weather conditions |

## Audio

`audio.ts` provides procedural sound effects tied to gameplay events —
builds, mining, combat, and ambient feedback.

## Post-processing

`postproc.ts` layers post-processing effects over the base canvas render for
visual polish.

## Co-op multiplayer

Supabase Realtime broadcasts:

- Player positions (movement sync)
- Build actions (place / remove)
- Chat messages (`ChatPanel`)

Each client runs the deterministic simulation locally; realtime events keep
shared state consistent across players.

## Trading

Players can trade with each other; trades are secured with a fee checkout
handled by `trade-fee-checkout` and settled by `trade-webhook` Edge
Functions.

## Premium features

A premium tier (Stripe) unlocks additional content. See
[Backend & Monetization](./backend.md) for the payment flow.

## Controls & UI

- Responsive UI works on desktop and mobile (touch input).
- 23 languages via runtime i18n switching.
