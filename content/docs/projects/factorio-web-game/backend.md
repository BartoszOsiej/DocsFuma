---
description: Novactorio's backend is **Supabase** (auth, realtime, Postgres, storage) with **Stripe** payments handled by four **Deno Edge Functions**.
keywords:
- Bartosz Osiej Docs
- multiplayer
- AST
- documentation
title: Backend & Monetization
---
# Backend & Monetization

Novactorio's backend is **Supabase** (auth, realtime, Postgres, storage)
with **Stripe** payments handled by four **Deno Edge Functions**.

## Services

| Service | Role |
|---|---|
| **Supabase Auth** | Accounts, sessions (`@supabase/supabase-js` ^2.57) |
| **Supabase Realtime** | Co-op multiplayer: player positions + build actions |
| **Supabase Postgres** | World snapshots, profiles, trades |
| **Supabase Storage** | Save data / snapshot storage |
| **Stripe** | Checkout subscriptions (Starter/Premium) + trade fees |
| **Deno Edge Functions** | Payment orchestration + webhooks |

## Database (supabase-schema.sql)

Key tables:

| Table | Purpose |
|---|---|
| `profiles` | User profiles; `premium_tier` updated by webhooks |
| `world_snapshots` | Cloud saves (`save_data` payload) |
| trades / trade state | Player-to-player trading |

## Edge functions (`supabase/functions/`)

| Function | Purpose |
|---|---|
| `stripe-checkout` | Creates a Stripe Checkout session for premium subscriptions (Starter/Premium) |
| `stripe-webhook` | Verifies Stripe webhooks; updates `profiles.premium_tier` |
| `trade-fee-checkout` | Checkout for trade fee payments |
| `trade-webhook` | Confirms trade fees and settles trades |

### Flow: premium subscription

```
Player clicks "Go Premium"
      │
      ▼
stripe-checkout (Edge Function)
      │  creates Checkout Session
      ▼
Stripe Checkout page (hosted)
      │  payment success
      ▼
stripe-webhook (Edge Function, signature-verified)
      │  updates profiles.premium_tier
      ▼
Player has premium benefits
```

### Flow: player trading

```
Player A initiates trade with Player B
      │
      ▼
trade-fee-checkout (Edge Function)
      │  fee payment processed
      ▼
trade-webhook (Edge Function)
      │  settles trade, transfers assets
      ▼
Both players receive items
```

## Co-op multiplayer

Supabase Realtime broadcasts:

- **Player positions** — live movement of other players
- **Build actions** — place/remove events replicated to all clients

## Cloud saves

World snapshots are backed up to Supabase:

- `world_snapshots.save_data` holds serialized world state
- Restorable from the game's save/load UI

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `VITE_ADMIN_USERS` | Comma-separated admin usernames |
| Stripe secret keys | Edge function secrets (Stripe API + webhook signing) |

## Deployment

```bash
# Deploy edge functions
supabase functions deploy

# Deploy the game to Cloudflare
npm run deploy   # = npm run build && wrangler deploy
```

Configuration lives in `wrangler.jsonc`; Supabase CLI handles function
deployments with per-function secrets.
