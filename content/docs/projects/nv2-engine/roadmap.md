---
description: Documentation for Roadmap & Changelog.
keywords:
- Bartosz Osiej Docs
- benchmark
- changelog
- documentation
title: Roadmap & Changelog
---
# Roadmap & Changelog

## Changelog

### Phase 2 — model sharing, datasets, player preferences (2026-08-13)

1. **Community model sharing** — portable `nv2-model-bundle` export/import
   (`/ai_export`, `/ai_import`), NaN-sanitised and persisted on import.
2. **Training-dataset import** — `/ai_dataset <path> [epochs]` trains the
   vegetation head on validated JSON datasets.
3. **Player-preference learning** — per-class counters in the checkpoint
   (backward compatible), blended into training targets (30%).
4. **NaN checkpoint hardening** — gradient clipping, sanitise-on-save,
   tolerant load; fixed a real corruption bug.

Suite: **96 passed / 0 failed** (97 total incl. ignored release benchmark).

### AI Phase 1 — vegetation intelligence (v1.0.0, complete)

**1. World height ceiling removed**
- `CHUNK_H` raised from **256 → 512** blocks
- Taller mountains, deeper caves, prepared for unlimited-height streaming

**2. 22 new vegetation block types** (`world/block.rs`)
- Flowers: rose, dandelion, tulips (4 colors), cornflower, allium, azalea
- Water plants: lily pad, fern, fern plant, seagrass, tall seagrass, kelp
- Decorations: small sticks, pebbles (3 variants), mossy cobble, vine,
  moss carpet

**3. AI generator module** (`world/ai_generator.rs`, NEW, ~600 lines)
- `TerrainAI` MLP: 8→16→4, 320 parameters, ~1.2 KB
- `AISystem` with background training thread
- `AIMessage` channel for training progress / texture generation /
  vegetation decisions

**4. AI integrated into world** (`world/mod.rs`)
- `World::new_with_settings()` spawns the AI system
- `ai_system` + `ai_receiver` stored on `World`

**5. Vegetation generation extended** (`world/vegetation.rs`)
- New `place_ai_vegetation()`: 3×3 cells, 8 terrain features, confidence
  threshold 0.5, biome-aware probabilities

**6. Dependencies added** (`Core/Cargo.toml`)
- `ndarray 0.15`, `rand 0.8`, `reqwest 0.11` (json), `tokio 1` (full)

### Behavior change (before → after)

| Aspect | Before | After |
|---|---|---|
| Flowers | Random noise-based | AI-predicted placement |
| Ferns | None | Wet, shaded areas |
| Sticks/pebbles | None | Natural distribution |
| Learning | — | Continuous background training |
| FPS impact | — | None (&lt;1%) |

## Roadmap — Phase 2

### Feature 1: Internet-based dataset integration — ✅ local part done
- ✅ Load + validate + train on JSON dataset files (`/ai_dataset`)
- ⬜ Cloud dataset repository / API endpoints
- ⬜ Live weather merge already runs (Open-Meteo, offline fallback)

### Feature 2: Real-time AI texture generation
- ⬜ Generate textures procedurally with the network
- ⬜ Integrate with the renderer's dynamic atlas
- ⬜ Emit generated textures via `AIMessage::TextureGenerated`

### Feature 3: Online learning from player actions — ✅ done (2026-08-13)
- ✅ Player choices tracked as preference counters in the checkpoint
- ✅ Training targets blended with learned preferences (30%)
- ✅ Privacy-safe: only local terrain features, no coordinates, no personal data

### Feature 4: Cloud model sharing (multiplayer) — ✅ local part done
- ✅ Portable `nv2-model-bundle` export/import (`/ai_export`, `/ai_import`)
- ⬜ Cloud upload/download endpoints / model marketplace
- ✅ Versioned, self-describing checkpoint format

### Feature 5: GPU acceleration
- ⬜ Parallelize training samples across GPU (batched forward/backward)
- ⬜ Larger models with no frame-time cost

### Feature 6: World & gameplay depth
- ⬜ Seasonal vegetation changes
- ⬜ Multi-biome coordination
- ⬜ Unlimited-height chunk streaming
- ⬜ Dedicated gameplay audio system (movement-medium signals already tracked)
- ⬜ Networking / multiplayer
- ⬜ In-engine content editor

## Known limitations (Phase 1)

1. No internet connectivity yet (Phase 2)
2. Synthetic training data only
3. Single-scale learning
4. No model persistence across sessions
5. Basic texture generation
