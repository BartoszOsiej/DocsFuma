---
description: 'Novactorio (repository: `Factorio-web-game`) is a complete browser game: an original 2D engine, chunk-based infinite world generation, supply chains,'
keywords:
- Bartosz Osiej Docs
- multiplayer
- TypeScript
- deployment
- networking
- browser
- rendering
- AST
- documentation
title: Novactorio
---
# Novactorio

<a class="tests-cta" href="./tests">🧪 View animated quality gates — typecheck · build · lint →</a>

> **A browser factory-automation game in the spirit of Factorio, written from scratch in TypeScript with a hand-built Canvas 2D engine.**

Novactorio (repository: `Factorio-web-game`) is a complete browser game: an
original 2D engine, chunk-based infinite world generation, supply chains,
conveyor belts, pipe networks, enemy AI, pollution, co-op multiplayer, 23
localizations, and a Stripe-powered premium tier.

**Stack:** TypeScript 5.5 (strict), React 18, Vite 6, Supabase (Auth,
Realtime, storage), Stripe, Deno Edge Functions, Cloudflare Pages/Wrangler.

## Highlights

- **Hand-written engine** — ~2,500 lines of Canvas 2D rendering with no game
  frameworks (no Phaser, no Pixi).
- **Factorio-like depth** — conveyor belts, inserters, pipe networks, research
  tree, pollution, enemy evolution.
- **Infinite world** — chunk-based terrain with Perlin noise, seamless
  scrolling.
- **Co-op multiplayer** — Supabase Realtime broadcasts player positions and
  build actions (place/remove).
- **23 languages** — runtime-switchable i18n; Polish and English fully
  translated.
- **Cloud saves** — world snapshots backed up to Supabase
  (`world_snapshots.save_data`).
- **Premium monetization** — Stripe Checkout subscriptions (Starter/Premium)
  via Deno Edge Functions; webhooks update `profiles.premium_tier`.

## Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.5, `strict: true` |
| UI | React 18 (overlay), TailwindCSS |
| Build | Vite 6 |
| Rendering | Hand-written Canvas 2D engine |
| Backend | Supabase (Auth, Realtime, Postgres, Storage) |
| Payments | Stripe Checkout + webhooks (Deno Edge Functions) |
| Edge functions | Deno (`supabase/functions/`) |
| Deployment | Cloudflare (Wrangler) |

## Repository layout (highlights)

```
Factorio-web-game/
├── src/
│   ├── game/            # engine.ts, renderer.ts, systems.ts, world.ts, noise.ts, ...
│   ├── render/          # render pipeline modules
│   ├── core/            # engine/systems/types
│   ├── components/      # React UI: AuthScreen, BuildMenu, ChatPanel, ...
│   ├── services/        # auth, coop, trade
│   ├── config/          # env, admin flags
│   └── i18n.ts          # 23-language localization
├── supabase/
│   ├── functions/       # stripe-checkout, stripe-webhook, trade-fee-checkout, trade-webhook
│   └── migrations/
├── docs/                # planning docs (e.g. plan-NETWORK.md)
├── tools/               # easter-egg script, slicer.html
└── package.json
```

## Related pages

- [Architecture](/docs/projects/factorio-web-game/architecture) — engine, renderer, world, UI layering
- [Gameplay Systems](/docs/projects/factorio-web-game/gameplay) — supply chains, belts, pipes, enemies, pollution
- [Backend & Monetization](/docs/projects/factorio-web-game/backend) — Supabase, Stripe, edge functions
