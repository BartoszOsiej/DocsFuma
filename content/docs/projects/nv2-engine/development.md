---
description: How to build, test, and extend NV2 Engine.
keywords:
- Bartosz Osiej Docs
- configuration
- testing
- Python
- Rust
- Bash
- wgpu
- AST
- documentation
title: Development
---
# Development

How to build, test, and extend NV2 Engine.

## Prerequisites

- **Rust toolchain** (stable is enough for the game)
- **GPU** with Vulkan / Metal / DX12 / GL support (wgpu backends)
- For the content tools: **.NET 8 SDK** (`Bridge/Tools`) and **Python 3 +
  Pillow** (`generate_textures.py`)

## Build & run

```bash
cd Core
cargo run --release        # optimized build
cargo run                  # dev build (third-party crates still at opt-level 3)
cargo check --release      # fast compile check
cargo test                 # unit tests (commands, crafting, AI)
```

## VS Code

`.vscode/tasks.json` already configures a task to run the engine executable
from the workspace. A custom Vulkan layer (`VkLayer_NV20.json` /
`VkLayer_NV20.dll`) can be attached from the launch configuration.

## Testing

Unit tests exist in key modules:

| Module | Tests cover |
|---|---|
| `crafting.rs` | Shaped recipe matching with offset alignment, shapeless multiset matching |
| `commands.rs` | Command execution flows (locate forest/highland, `/ai_*` round-trips and validation) |
| `world/ai_generator.rs` | Forward pass validity, training loss decrease, NaN hardening, model bundles, datasets, preferences |
| `world/memplp.rs` | MLP forward/train, deterministic init, legacy migration, NaN survival |

## AI commands

| Command | Effect |
|---|---|
| `/ai_export <path> [author]` | Export the live model as a portable community bundle |
| `/ai_import <path>` | Import a shared model bundle and persist it |
| `/ai_dataset <path> [epochs]` | Train the vegetation head on a JSON dataset |
| `/ai_stats` | Show live model stats + player preferences |

## Extending: add a block type

1. Add the variant to `BlockType` enum (`world/block.rs`).
2. Register it in `BLOCK_REGISTRY`: `(id, "name", "texture_name")`.
3. Add hardness in the `hardness()` match.
4. Map the texture in the texture registry match.
5. Add a display name in `name()`.
6. (Optional) Teach the AI to place it in `place_ai_vegetation()`.

## Extending: add a recipe

Shaped (in `crafting.rs` `default_recipes()`):

```rust
recipes.register_shaped(ShapedRecipe {
    pattern: vec![Some(BlockType::Planks), Some(BlockType::Planks)],
    output:  stack_of(BlockType::Stick, 4),
    // ...
});
```

Shapeless:

```rust
recipes.register_shapeless(ShapelessRecipe {
    ingredients: vec![/* ... */],
    output:      stack_of(BlockType::FlintPickaxe, 1),
});
```

Recipes can also be loaded from JSON through `assets.rs` utilities.

## Extending: disable the AI (testing)

In `vegetation.rs` `populate_world_trees_for_chunk()`:

```rust
pub fn populate_world_trees_for_chunk(...) {
    self.place_trees(world, generator, cx, cz);
    // self.place_ai_vegetation(world, generator, cx, cz);  // comment out
}
```

## Content pipeline

| Tool | Purpose |
|---|---|
| `Bridge/Tools/Slicer` | .NET 8 atlas slicer — scans atlas PNGs, extracts block textures via predefined or analyzed tile rectangles |
| `generate_textures.py` | Pillow texture transforms — rotate, flip, grayscale, invert, darken, brighten |
| `Assets/Blocks/` | Runtime texture discovery for the dynamic atlas |

## Save format

Worlds persist to `saves/world.json` (next to the executable):

```json
{
  "seed": "...",
  "chunks": { "...": "flattened block data" },
  "water_meta": "...",
  "crafters": { "...": "NVCrafterState" }
}
```

Settings persist to `settings.json` (pretty JSON via serde).

## Migration / backward compatibility

- **Old worlds load fine** — AI only affects newly generated chunks.
- **Public APIs are stable** — `ai_system` is `pub` but non-blocking to
  existing systems; new block types don't conflict.
