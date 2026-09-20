---
description: Dynamic liquid behavior lives in `world/liquid.rs`, with world integration in `world/mod.rs` and a dedicated translucent render path in `renderer/mesh.rs`.
keywords:
- Bartosz Osiej Docs
- rendering
- voxel engine
- documentation
title: Water Simulation
---
# Water Simulation

Dynamic liquid behavior lives in `world/liquid.rs`, with world integration in
`world/mod.rs` and a dedicated translucent render path in `renderer/mesh.rs`.

## Water metadata encoding

Each chunk stores a per-voxel `water_meta` byte:

| Value | Meaning |
|---|---|
| `0` | No dynamic state |
| `1..=7` | Flowing water (level = height of the flow column) |
| `8` | Water source (`SOURCE_LEVEL`) |

The raw byte is decoded into a dynamic liquid level and re-encoded with
`encode_level()` / `decode_level()` helpers.

## Simulation constants

| Constant | Value | Purpose |
|---|---|---|
| `SEA_LEVEL` | 46 | World sea level (from biomes) |
| `SOURCE_LEVEL` | 8 | Source block |
| `FLOW_MAX` | 7 | Max flow level |
| `MAX_CHANGES_PER_STEP` | 2048 | Hard cap on block changes per simulation tick |

## Solver algorithm

The solver is **gravity-first**:

```
For each simulation step:
  1. Collect candidate sources (level 8) and flow blocks.
  2. Sort highest-Y first so gravity chains downward in one pass.
  3. For each candidate:
     - Downward gravity takes absolute priority:
       if the block below is empty, flow down (full flow level).
     - If downward flow is blocked, spread laterally
       (4 directions: +X, -X, +Z, -Z) with FLOW_MAX as the best incoming.
  4. Respect MAX_CHANGES_PER_STEP — stop enqueueing changes at 2048.
  5. Apply changes: set water_meta to 0 (empty) or encode_level(level).
```

Key details:

- **Gravity beats lateral spread** — a block with an open space below never
  spreads sideways.
- **Sorting highest-Y first** lets water fall through multiple blocks in a
  single pass instead of one step per block.
- **Hard cap** prevents pathological cascades from stalling the frame.

## Rendering & updates

- Water is a **separate mesh and pipeline path** from solid geometry.
- `renderer::State::update(...)` drives simulation **on a timer** before
  triggering throttled mesh updates.
- Water mesh recombination is separated from full water mesh rebuilds.
- Only **changed chunks** rebuild water meshes — static water never triggers
  a rebuild.
- `water_sim_interval` and `water_rebuild_interval` (settings.rs) control
  simulation frequency; Low-End-PC mode reduces the update frequency.

## World integration

- `World::set_water_meta(wx, wy, wz, level)` applies simulation writes.
- Water metadata is **persisted in saves** alongside chunk block data.
- Water-aware column sampling in the biome generator positions water bodies
  relative to sea level.
