---
description: NV2 Engine embeds a small neural network — **MeMLP** (Modular embedded Multi-layer Perceptron Model) — that decides where vegetation belongs,
keywords:
- Bartosz Osiej Docs
- architecture
- networking
- neural renderer
- documentation
title: AI System — MeMLP (Modular embedded Multi-layer Perceptron Model)
---
# AI System — MeMLP (Modular embedded Multi-layer Perceptron Model)

NV2 Engine embeds a small neural network — **MeMLP** (Modular embedded
Multi-layer Perceptron Model) — that decides where vegetation belongs,
classifies biomes from climate features and selects procedural texture
styles. It trains **in the background while you play** with zero FPS impact
(&lt;1% CPU overhead). Everything lives in-process: pure CPU, one JSON
checkpoint, no cloud, no GPU.

Implementation: `world/memplp.rs` (MeMLP core) + `world/ai_generator.rs`
(engine-facing system), using `ndarray`.

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Game Thread                          │
│  World Generation                                           │
│   ├─ Chunk generation (BiomeGenerator)                      │
│   ├─ Tree placement (VegetationGenerator)                   │
│   └─ AI Vegetation (place_ai_vegetation) ◄──────┐           │
│                                                  │          │
└──────────────────────────────────────────────────┬──────────┘
                                                   │
            Queries AI for predictions (non-blocking
            via Arc<Mutex>)
                                                   │
┌──────────────────────────────────────────────────▼──────────┐
│              Background AI Thread (continuous)              │
│  TerrainAI → MeMLP modular model                            │
│   ├─ Vegetation head: 8 → 24 → 16 → 4 (deep MLP)           │
│   ├─ Biome head:      8 → 12 → 9                            │
│   ├─ Texture head:    8 → 12 → 6                            │
│   ├─ Player feedback  (world/ai_feedback.rs)                │
│   └─ Online datasets  (world/online_trainer.rs, offline-ok) │
│                                                             │
│  Training Loop (200+ samples/epoch):                        │
│   1. Drain player actions (highest priority)                │
│   2. Merge online climate data (every ~60 s, offline-safe)  │
│   3. Synthetic samples for all three heads                  │
│   4. Backpropagation (cross-entropy)                        │
│   5. Checkpoint every 20 epochs                             │
└─────────────────────────────────────────────────────────────┘
```

## Model

MeMLP is **modular**: one checkpoint file contains several specialist
multi-layer perceptrons, each solving one task.

| Module | Shape | Task |
|---|---|---|
| `vegetation` | 8 → 24 → 16 → 4 | flower / fern / stick / pebble placement |
| `biome` | 8 → 12 → 9 | biome classification (9 biomes, matches `BiomeId`) |
| `texture` | 8 → 12 → 6 | procedural texture-style selection |

- **Total parameters:** 1095 (fresh) / 623 (migrated legacy checkpoint)
- **Checkpoint:** single JSON file, ~1–4 KB (`Core/checkpoints/ai_model.json`)
- **Inference:** ~0.3 µs per head forward pass (release build)
- **Training:** ~0.5–1.2 M samples/s per head (release build)

> Old pre-MeMLP checkpoints (single hidden layer `8→16→4`) are **detected and
> migrated automatically** — trained weights are preserved, new heads start
> fresh. The shipped checkpoint is already v1 MeMLP.

## Input features (8)

| # | Feature | Range |
|---|---|---|
| 1 | Terrain height (normalized) | 0.0–1.0 |
| 2 | Terrain slope | 0.0–0.5 |
| 3 | Biome temperature | 0.0–1.0 |
| 4 | Biome humidity | 0.0–1.0 |
| 5 | Distance to nearest water | 0.0–1.0 |
| 6 | Nearby plant density | 0.0–1.0 |
| 7 | Light level | 0.0–1.0 |
| 8 | Procedural noise seed | 0.0–1.0 |

## Outputs (vegetation head, 4 classes)

| Output | Vegetation |
|---|---|
| 0 | Flowers — roses, tulips (4 colors), dandelions, cornflower, allium, azalea |
| 1 | Ferns & water plants — ferns, lily pads, seagrass, tall seagrass, kelp |
| 2 | Small sticks & decorative items |
| 3 | Pebbles & rocks (3 variants) |

## Mathematics

### Forward pass (per head)

```
Hidden:  h1 = ReLU(input @ w1 + b1)          where ReLU(x) = max(0, x)
         h2 = ReLU(h1 @ w2 + b2)             (deep heads)
Logits:  logits = h_last @ wN + bN
Softmax: p_i = exp(logits_i - max(logits)) / sum_j(exp(logits_j - max(logits)))
```

### Backward pass (cross-entropy, backprop through all layers)

```
Loss:         Loss = -sum_i(target_i * log(p_i))
Output grad:  dL/dz = p - target             (elementwise)
Weight grad:  dL/dw[k][i,j] = dL/dz[j] * h[k-1][i]
Hidden grad:  dL/dh = dL/dz @ w.T · ReLU'(z) (chain rule through ReLU)
```

### Gradient descent

```
w := w - learning_rate * dL/dw
b := b - learning_rate * dL/db
```

## Training loop

A background thread runs continuously, combining three signal sources:

1. **Player feedback** (highest priority) — `world/ai_feedback.rs` records
   every vegetation block the player places or breaks; the AI literally
   learns from what you do (buffer bounded at 4096 samples).
2. **Online climate data** — `world/online_trainer.rs` fetches real
   temperature/humidity from Open-Meteo (keyless, 8 cities spanning desert,
   rainforest, tundra…) every ~60 s, with a synthetic offline fallback.
3. **Synthetic samples** — heuristic targets keep all three heads sharp:
   200 vegetation samples + 40 biome/texture samples per epoch.

Checkpoint saved every 20 epochs to `Core/checkpoints/ai_model.json`.

### Hyperparameters

| Parameter | Value | Notes |
|---|---|---|
| Learning rate | 0.01 | Sweet spot; 0.1 oscillates, 0.001 too slow |
| Confidence threshold | 0.40 | Only high-confidence predictions place blocks |
| Cell size | 3×3 blocks | Procedural variety |
| Feedback buffer | 4096 | Bounded, newest samples win |

## Public API (`ai_generator.rs`)

```rust
pub struct TerrainAI {  // wraps the MeMLP, engine-facing API is stable
    model: MeMLP,       // vegetation (8→24→16→4) + biome (8→12→9) + texture (8→12→6)
    learning_rate: f32,
    training_samples: usize,
    // ...
}
```

| Method | Signature | Purpose |
|---|---|---|
| `forward` | `(&self, features: &[f32; 8]) -> [f32; 4]` | Vegetation head inference |
| `backward` | `(&mut self, features: &[f32; 8], target: [f32; 4]) -> f32` | One training step, returns loss |
| `predict_biome` | `(&self, features: &[f32; 8]) -> usize` | Biome head (0..9, `BiomeId` order) |
| `predict_texture_style` | `(&self, features: &[f32; 8]) -> usize` | Texture head (0..5) |
| `predict_vegetation` | `(&self, features: &[f32; 8]) -> (BlockType, f32)` | Thread-safe prediction |
| `save_checkpoint` / `load_checkpoint` | `(path)` | JSON persistence, legacy migration |
| `model_stats` | `() -> (usize, u32, usize)` | params, MeMLP version, samples |

## Integration points

1. **World initialization** — `World::new_with_settings()` spawns `AISystem`
   (background thread) and stores it with the message receiver.
2. **Feature extraction** — `place_ai_vegetation()` in `vegetation.rs`
   extracts the 8 terrain features per 3×3 cell.
3. **Prediction & placement** — `predict_vegetation(&features)` returns the
   block + confidence; blocks are placed only when `confidence > 0.40`.
4. **Biome-aware decorations** — `DecorationAI` uses `predict_biome()` to
   choose decoration style (fern in swamp/taiga, flowers in forests…).
5. **Player learning** — `interaction.rs` calls `ai_feedback::record_place` /
   `record_break` on every vegetation interaction.

## Phase-2 features (2026-08-13)

### Community model sharing

Models are portable. `/ai_export <path> [author]` writes an `nv2-model-bundle`
— the full checkpoint wrapped with author / description / biome-hint
metadata — and `/ai_import <path>` loads any shared bundle, sanitises it and
persists it to the runtime checkpoint. API: `AISystem::export_model` /
`import_model`. This is the local half of the cloud-sharing roadmap: files
can already be exchanged between players and servers.

### Training-dataset import

JSON datasets (`samples`: 8 terrain features, `targets`: 4-class vegetation
distributions) are validated and trained on directly — `/ai_dataset <path>
[epochs]` or `AISystem::train_on_dataset`. Empty or mismatched files are
rejected; non-finite rows are skipped.

### Player-preference learning

`TerrainAI` keeps per-class preference counters (flower / fern / stick /
pebble) inside the checkpoint (`#[serde(default)]` — old checkpoints stay
compatible). Placing a vegetation block increments its counter; the
background loop blends heuristic targets with the learned distribution
(30% weight), so the model leans toward what the player likes. `/ai_stats`
shows the live counters.

## Performance

| Aspect | Value |
|---|---|
| Model size | ~1–4 KB checkpoint |
| Inference | ~0.3 µs per head (3.4 M predictions/s) |
| Training | ~0.5–1.2 M samples/s per head |
| Gameplay overhead | ~0.8% (background thread on idle CPU) |
| Startup cost | ~+5 ms (thread spawn) |

Measured with `cargo test --release qa_benchmark_report -- --ignored --nocapture` —
full numbers in `TEST_REPORT.md`.

## Testing

32 AI/ML tests across `world::ai_generator` (16), `world::memplp` (10),
`world::online_trainer` (2), `world::vegetation` (3) and `world::biomes` (1):

- Forward pass produces a valid probability distribution
- Training decreases loss and fits simple patterns
- Checkpoint JSON round-trips exactly
- **Legacy checkpoints migrate** (both synthetic and the shipped file)
- Procedural textures are deterministic per seed
- Player-feedback buffer stays bounded
- Heuristic targets stay in range
- **Training survives extreme inputs** — gradient clipping + bounded
  updates mean weights can never explode into NaN
- **NaN inputs are rejected** without touching the weights
- **Poisoned checkpoints still load** — `null` (NaN) weights read back as
  `0.0` instead of failing the whole load
- **Model bundles round-trip** — export → import preserves metadata and
  parameters; non-bundle files are rejected
- **Datasets import and train** — validation rejects empty/mismatched files
- **Preferences shift targets** — the blend leans toward the player's
  favourite class and survives checkpoint round-trips

> Robustness: `Mlp::train` clips gradients (±5) and bounds per-parameter
> updates (±1), `save_checkpoint` sanitises NaN/Inf before writing, and
> `load_checkpoint` tolerates NaN weights serialised as JSON `null`.

## Roadmap (Phase 2)

See the [Roadmap](./roadmap.md) page for: real-time AI texture generation,
player-preference learning, cloud model sharing, seasonal vegetation,
multi-biome coordination, and GPU-accelerated training.
