---
description: NV2 Engine is engineered so that GPU bandwidth, draw calls, and CPU meshing stay proportional to what actually changed — not the whole world.
keywords:
- Bartosz Osiej Docs
- performance
- networking
- neural renderer
- rendering
- Rust
- documentation
title: Performance
---
# Performance

NV2 Engine is engineered so that GPU bandwidth, draw calls, and CPU meshing
stay proportional to what actually changed — not the whole world.

## GPU bandwidth: packed vertices

- CPU-side vertices are **72 bytes**; the GPU-resident `PackedVertex`
  (defined in `renderer/vertices.rs`) packs them to **36 bytes**
  (Snorm8x4 / Unorm8x4).
- Vertex bandwidth is **halved** for every chunk upload.

## Per-chunk GPU buffers

A block edit re-uploads only the affected chunk instead of the whole loaded
area (previously ~81 chunks per change). GPU uploads are additionally
**debounced** rather than re-uploaded every time a single chunk changes.

## Frustum culling

Gribb–Hartmann plane extraction culls chunks outside the view, with a safety
margin and a **protected 3×3 area around the player** to prevent
over-culling. This reduces visible chunks by roughly half on typical scenes
while keeping the player's surroundings always rendered.

## Incremental water simulation

- Only **changed chunks** rebuild water meshes — static water never triggers
  a rebuild.
- Simulation and meshing are interval-based (`water_sim_interval`,
  `water_rebuild_interval`).
- Water mesh recombination is separated from full water mesh rebuilds.

## CPU meshing budget

- Mesh creation is **rate-limited** — only a small number of chunks are built
  per frame (`mesh_build_budget`).
- **Seam repair** rebuilds only neighboring chunk borders when new chunks
  arrive.
- Chunk meshes and water meshes are cached separately by chunk coordinate.

## Async chunk generation

- Bounded work queue with in-flight deduplication
- Parallel generation via `rayon` (`into_par_iter()`)
- Results delivered over `mpsc` — world insertion and mesh coordination stay
  on the main thread

## Background AI training

The neural-network vegetation trainer runs on a background thread:

| Metric | Value |
|---|---|
| Gameplay overhead | ~0.8% |
| Epoch time | ~5–10 ms (100 samples) |
| Memory | ~1.2 KB model + 256 KB thread stack |

## Performance profiles (`settings.rs`)

All tunables below are centralized in `settings.rs` and switched by the
**Low-End-PC** mode (one key in the menus, persisted across runs via
`settings.json` next to the executable).

| Setting | Effect |
|---|---|
| `load_radius` | How far the world generates |
| `render_radius` | How far the world renders |
| `cleanup_radius` | When far chunks are unloaded |
| `mesh_build_budget` | Chunks rebuilt per frame |
| `water_sim_interval` | Water simulation frequency |
| `water_rebuild_interval` | Water meshing frequency |
| Foliage density | Vegetation placement density |
| Fog density | Atmosphere draw distance |
| Vsync | Frame pacing |

`AppSettings` is serialized with serde (pretty JSON), loaded with graceful
fallbacks on parse/read errors, and exposed through `SharedSettings`
(an `Arc<RwLock&lt;AppSettings&gt;>`) for safe concurrent access.

## AI implementation impact (measured)

| Scenario | Before | After |
|---|---|---|
| Compile | 45 s | 52 s (+ndarray/tokio) |
| Startup | ~100 ms | ~105 ms (+AI thread spawn) |
| Gameplay CPU | 0% AI overhead | 0.8% |
| Memory | baseline | +1.2 KB model + 256 KB stack |
