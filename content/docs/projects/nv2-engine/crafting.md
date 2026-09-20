---
description: Every recipe registered in `crafting.rs`, with the **exact patterns from the source code**. The engine supports **shaped recipes** (fixed patterns with
keywords:
- Bartosz Osiej Docs
- documentation
title: Crafting Reference
---
# Crafting Reference

Every recipe registered in `crafting.rs`, with the **exact patterns from the
source code**. The engine supports **shaped recipes** (fixed patterns with
offset matching) and **shapeless recipes** (multiset matching).

Legend: `P` = Planks · `S` = Stick · `L` = log (any early-game wood) ·
`ST` = Stone · `I` = Iron Ingot · `F` = Flint

## Surfaces

| Surface | Grid | Notes |
|---|---|---|
| Player crafting | 2×2 | Always available via `E` |
| NVCrafter | 3×3 | World-placed station; state persists in saves |

## Shapeless recipes

| Output | Count | Input |
|---|---|---|
| Planks | ×4 | 1 log (any `EARLY_GAME_LOGS` wood) |
| Flint Pickaxe | ×1 | Flint + Stick |

## Shaped recipes

### Wood processing
**Sticks ×4** — grid 1×2
```
[P]
[P]
```

### NVCrafter ×1 — grid 3×3 (planks ring, log center)
```
[P][P][P]
[P][L][P]
[P][P][P]
```

### Wooden tools (×1 each)

**Wooden Pickaxe** — 3×3
```
[P][P][P]
[ ][S][ ]
[ ][S][ ]
```

**Wooden Axe** — 2×3
```
[P][P]
[P][S]
[ ][S]
```

**Wooden Shovel** — 1×3
```
[P]
[S]
[S]
```

**Wooden Hoe** — 2×3
```
[P][P]
[ ][S]
[ ][S]
```

### Torches ×4 — grid 1×2 (stick over log)
```
[S]
[L]
```

### Storage & furniture

**Chest ×1** — 3×3 (planks ring, empty center)
```
[P][P][P]
[P][ ][P]
[P][P][P]
```

**Door ×3** — 2×3 (6 planks)
```
[P][P]
[P][P]
[P][P]
```

**Trapdoor ×2** — 3×2 (6 planks)
```
[P][P][P]
[P][P][P]
```

**Ladder ×3** — 3×3 (stick/plank columns)
```
[S][P][S]
[S][P][S]
[S][P][S]
```

**Fence ×3** — 3×2
```
[S][P][S]
[S][P][S]
```

**Fence Gate ×1** — 3×2
```
[P][S][P]
[P][S][P]
```

**Workbench Upgrade ×1** — 3×3 (log cross, planks corners)
```
[P][L][P]
[L][L][L]
[P][L][P]
```

### Pickaxe progression

**Stone Pickaxe ×1** — 3×3
```
[ST][ST][ST]
[ ][S][ ]
[ ][S][ ]
```

**Iron Pickaxe ×1** — 3×3
```
[I][I][I]
[ ][S][ ]
[ ][S][ ]
```

> The Diamond and Netherite pickaxes exist as block types; their upgrade
> recipes are the next tier of the same head shape.

## Matching logic

- **Shaped:** `shaped_recipe_matches(grid, recipe)` — pattern matched with
  offset support against the grid.
- **Shapeless:** `shapeless_recipe_matches(grid, recipe)` — multiset matching
  (order does not matter).
- `RecipeRegistry::match_grid()` returns the first matching shaped recipe,
  then falls back to shapeless.
- Output is an `ItemStack` (`stack_of(block, count)`).

## NVCrafter state

`NVCrafterState` is stored per block in the world (`world/mod.rs`) and is
persisted in saves. When a GUI closes, inputs return to the player inventory
(or drop into the world if there is no room). Breaking an NVCrafter flushes
its contents into world drops.

## JSON recipes

`assets.rs` also loads and validates recipes from JSON, with utilities for
shaped/shapeless recipe parsing alongside block-model loading.
