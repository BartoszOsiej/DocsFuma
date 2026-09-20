---
description: Novactorio is deliberately framework-free on the rendering side. The game loop, simulation, and drawing are hand-written on the Canvas 2D API; React is
keywords:
- Bartosz Osiej Docs
- configuration
- architecture
- TypeScript
- rendering
- documentation
title: Architecture
---
# Architecture

Novactorio is deliberately framework-free on the rendering side. The game
loop, simulation, and drawing are hand-written on the Canvas 2D API; React is
used only for UI overlays. The codebase spans **21,000+ lines of TypeScript**
(21,257 LOC across `src/`).

## Layer overview

```
┌─────────────────────────────────────────────────────────┐
│  React overlay (src/components/, src/ui/)               │
│  Auth → Start → Game routing, HUD, menus, chat, shop    │
└─────────────────────────┬───────────────────────────────┘
                          │ game state / events
┌─────────────────────────▼───────────────────────────────┐
│  Game engine (src/game/)                                │
│  engine.ts   — main loop: update() + render(), entities │
│  systems.ts  — supply chains, belts, pipes, AI, pollution│
│  world.ts    — chunk storage, infinite scrolling        │
│  noise.ts    — Perlin noise terrain generation          │
│  renderer.ts — 10 dedicated draw methods                │
│  constants.ts, types.ts, audio.ts, postproc.ts          │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Render pipeline (src/render/)                          │
│  AmbientAtmosphere · ParticleEffects · PollutionOverlay │
│  ScreenEffects · SpriteManager · WeatherSystem · utils  │
└─────────────────────────────────────────────────────────┘
```

## Source map (`src/`)

| Directory | Files | Responsibility |
|---|---|---|
| `game/` | 9 | Engine core: loop, systems, world, noise, renderer, audio, postprocessing |
| `core/` | engine, systems, types | Shared engine/system/type definitions |
| `render/` | 7 | Visual effects: atmosphere, particles, pollution, weather, sprites, screen FX |
| `components/` | — | React UI: AuthScreen, BuildMenu, ChatPanel, shop, HUD |
| `services/` | auth, coop, trade | Supabase-backed services |
| `config/` | — | Environment-driven configuration |
| `ui/` | — | Additional UI primitives |
| `easter/` | — | Easter-egg content |
| `shaders/` | — | Shader definitions |
| `lib/` | — | Shared utilities |

## Game engine (`src/game/`)

| Module | Responsibility |
|---|---|
| `engine.ts` | Game loop (`update`/`render`), entity lifecycle, building logic, inventory, combat, particles |
| `renderer.ts` | Extracted render passes: sky, ground, entities, damage numbers, etc. |
| `systems.ts` | Supply chains, conveyor belts, pipe networks, enemy AI, pollution |
| `world.ts` | Chunk-based world, block storage, infinite scrolling |
| `noise.ts` | Perlin noise for terrain generation |
| `types.ts` | Shared type definitions |
| `constants.ts` | Tuning constants |
| `audio.ts` | Sound effects |
| `postproc.ts` | Post-processing effects |

## Render pipeline (`src/render/`)

| Module | Responsibility |
|---|---|
| `AmbientAtmosphere.ts` | Sky/atmosphere rendering |
| `ParticleEffects.ts` | Particles (smoke, sparks, damage) |
| `PollutionOverlay.ts` | Pollution visualization |
| `ScreenEffects.ts` | Screen-space effects |
| `SpriteManager.ts` | Sprite atlas management |
| `WeatherSystem.ts` | Weather simulation |
| `utils.ts` | Render helpers |

## Services (`src/services/`)

| Service | Responsibility |
|---|---|
| `auth` | Supabase authentication integration |
| `coop` | Co-op multiplayer via Supabase Realtime |
| `trade` | Player trading (Stripe-fee checkout for trades) |

## Rendering approach

The renderer is organized as discrete draw methods (sky, ground, entities,
particles, damage numbers, …) rather than a monolithic draw call, keeping each
pass cheap and debuggable. World chunks are culled to the visible area while
scrolling. The render pipeline is further split into dedicated modules
(atmosphere, particles, pollution, weather) layered over the base canvas.

## UI overlay

React 18 renders the interface on top of the canvas: full screen routing
(Auth → Start → Game), build menu, chat panel, shop, stats, and settings.
State flows from the engine into React through a shared game-state bridge.

## TypeScript strictness

`tsconfig.app.json` runs with `strict` typing; the project validates with
`tsc --noEmit` (`npm run typecheck`) and lints with ESLint (`npm run lint`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run preview` | Build + local Wrangler preview |
| `npm run deploy` | Build + `wrangler deploy` (Cloudflare) |
| `npm run easter-egg` | Easter-egg generator script |

## Deployment target

The game builds with Vite and deploys to **Cloudflare** via Wrangler
(`wrangler.jsonc`), with Supabase as the backend.
