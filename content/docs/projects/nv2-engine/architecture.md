---
description: 'NV2 Engine is a layered Rust application: a `winit` event-driven shell, a `wgpu` renderer, a procedural world simulation, and a GUI stack — plus'
keywords:
- Bartosz Osiej Docs
- architecture
- networking
- Python
- neural renderer
- rendering
- Rust
- wgpu
- AST
- documentation
title: Architecture
---
# Architecture

NV2 Engine is a layered Rust application: a `winit` event-driven shell, a
`wgpu` renderer, a procedural world simulation, and a GUI stack — plus
auxiliary .NET and Python content-pipeline tools. This page documents every
layer in detail, module by module, based on the actual source.

## Source map (Core/Src, 15,800+ lines)

| Module | Lines | Responsibility |
|---|---|---|
| `main.rs` | 674 | App shell, winit event loop, 3 runtime modes, save/load, menus |
| `renderer/mod.rs` | 2,223 | Renderer state, all pipelines, culling, day/night, UI |
| `interaction.rs` | 1,566 | DDA raycast, mining, placement, tool gating, drops, GUI layer |
| `world/block.rs` | 1,294 | Block registry (97 types), tool tiers, hardness, movement mediums |
| `world/biomes.rs` | 999 | 9 biome definitions, climate model, terrain generation |
| `world/mod.rs` | 961 | World container, chunk streaming, save/load, tree propagation |
| `crafting.rs` | 899 | Recipe registry, shaped/shapeless matching, NVCrafter states |
| `world/vegetation.rs` | 868 | Trees, grass, AI vegetation placement |
| `renderer/camera.rs` | 645 | First-person camera, movement, collision, flight, water |
| `renderer/text.rs` | 631 | fontdue rasterization, text measurement, layers |
| `inventory.rs` | 597 | 36-slot inventory, hotbar, stacks, durability |
| `renderer/mesh.rs` | 551 | Solid + water chunk meshing |
| `renderer/texture_atlas.rs` | 530 | Dynamic atlas, texture packs, UV lookup |
| `assets.rs` | 519 | Block models, JSON recipes, texture discovery |
| `world/ai_generator.rs` | 410 | Neural network, forward/backward pass, training thread |
| `commands.rs` | 375 | `/locate`, `/tp` with tests |
| `world/liquid.rs` | 286 | Water simulation (gravity-first solver, flow encoding) |
| `renderer/texture_registry.rs` | 177 | Texture name normalization, tile functions |
| `renderer/vertices.rs` | 160 | Vertex + PackedVertex (36 B) definitions |
| `settings.rs` | 144 | AppSettings, Low-End-PC profile, settings.json persistence |
| `world/generator.rs` | 139 | Async chunk generation queue |
| `world/chunk.rs` | 131 | 16×512×16 chunk storage, water_meta |
| `world/raycast.rs` | 91 | DDA voxel raycasting |
| `input.rs` | 84 | Keyboard/mouse state |
| `world/worldgen.rs` | 80 | WorldGenWriter abstraction |
| `renderer/instance.rs` | 78 | Instance rendering helpers |
| `world/decorations.rs` | 52 | Decorative block placement |
| `world/decoration_ai.rs` | 44 | AI-driven decorations |
| `renderer/menu.rs` | 148 | Main/pause menu rendering |
| `renderer/texture.rs` | 28 | Texture loading |
| `world/palette.rs` | 24 | Block palette helpers |
| `world/online_trainer.rs` | 14 | Optional cloud-assisted training stub |

## Layer overview

```
┌──────────────────────────────────────────────────────────────┐
│  App shell (main.rs)                                          │
│  winit::application::ApplicationHandler                       │
│  Modes: MainMenu · Playing · PauseMenu                        │
│  input routing · save/load · status messages · slash commands │
└──────────────┬───────────────────────┬───────────────────────┘
               │                       │
┌──────────────▼───────────────┐  ┌────▼───────────────────────┐
│  Renderer (renderer/)       │  │  World (world/)            │
│  wgpu surface/device/queue  │  │  (cx,cz) -> Chunk map      │
│  5 pipeline categories      │  │  BiomeGenerator            │
│  frustum culling            │  │  ChunkGenerator (async)    │
│  per-chunk GPU buffers      │  │  water simulation          │
│  texture atlas + packs      │  │  AI system + training      │
│  menu/text/inventory UI     │  │  NVCrafter states          │
└──────────────┬───────────────┘  └────┬───────────────────────┘
               │                       │
               └───────────┬───────────┘
                           ▼
          InteractionController (interaction.rs)
          bridges gameplay <-> GUI slot transactions
```

## 1. Application shell (`main.rs`)

The entry point uses `winit::application::ApplicationHandler` and manages
three explicit runtime modes:

```rust
enum AppMode { MainMenu, Playing, PauseMenu }
```

The `App` struct owns:

- renderer state
- the `World` instance
- input accumulation state
- save/load path handling (`exe_dir/saves/world.json`)
- status/subtitle messaging
- slash-command input state
- main menu and pause menu selection state

**Runtime flows implemented in the shell:**

- New game flow → `start_new_game()` sets `AppMode::Playing`
- Save flow → `save_game()` calls `world.save_to_file()` and shows a status message
- Load flow → `load_game()` calls `World::load_from_file_with_settings()`, falls back to `MainMenu` on error
- Pause/resume transitions with cursor capture toggling
- Slash-command prompt opened with `/`, routed through `commands::execute(...)`
- Low-End-PC toggle with on-screen feedback and persisted settings

## 2. Rendering architecture (`renderer/mod.rs`)

`renderer::State` owns the WGPU surface/device/queue/configuration, camera
uniforms, material/biome uniforms, a depth texture, the texture atlas and
bind groups, and **five pipeline categories**:

| Pipeline | Geometry |
|---|---|
| Solid world | Opaque chunk meshes |
| Water | Translucent water meshes (separate path) |
| Flat UI panels | Procedural panel quads |
| Sprite UI icons | Atlas-derived item icons |
| Text | fontdue rasterized glyph layers |

**Key renderer-side implementation details:**

- Chunk meshes and water meshes cached separately by chunk coordinate
- Mesh creation rate-limited: only a small number of chunks per frame
- GPU uploads debounced (not re-uploaded on every single chunk change)
- Water mesh recombination separated from full water mesh rebuilds
- Seam repair rebuilds neighboring chunk borders when new chunks arrive
- Conservative submission near the player

**Gameplay-visible systems driven by the renderer:**

- Day/night phase progression via `elapsed_time`
- Water animation timing
- Climate/biome-driven fog + ambient color uniforms
- Crosshair, subtitle overlays, command prompt overlays
- Main menu, pause menu, inventory, and crafter panel rendering

## 3. World & chunk streaming (`world/mod.rs`)

`World` stores:

- Loaded chunks in a `(cx, cz) -> Chunk` map
- A shared `BiomeGenerator`
- A `ChunkGenerator` for background generation + a receiver for completed chunks
- Pending chunk tracking and pending cross-chunk world writes
- Tree-population tracking for already-processed chunks
- Per-block `NVCrafterState` entries
- Buffered `WorldItemDrop` entities

**World features:**

- Synchronous near-player chunk materialization
- Background generation of distant chunks
- Unloading of far chunks with a buffer radius
- Cross-chunk world-write buffering
- Lazy chunk generation when cross-border mutations require a destination chunk
- Block read/write by world coordinates + numeric block ID helpers
- Block placement/destruction helpers
- Runtime item-drop buffering and draining
- Save/load support (seed, flattened chunk blocks, water metadata, crafter states)
- Safe teleport position resolution
- Spawn search based on real block occupancy and runtime clearance

### Async generation (`world/generator.rs`)

- Bounded queue of chunk coordinates
- In-flight set to deduplicate dispatch
- Batched flushing from the main thread each frame
- Parallel generation via `rayon::spawn(...)` + `into_par_iter()`
- Results delivered via `mpsc`

## 4. Procedural terrain & biomes (`world/biomes.rs`)

Nine biomes, each with temperature, humidity, tree/grass density, tree types,
surface block, and a vegetation tint:

| Biome | Temp | Humidity | Trees | Grass | Surface |
|---|---|---|---|---|---|
| Ocean | 0.48 | 0.88 | 0.00 | 0.00 | Sand |
| Coast | 0.62 | 0.54 | 0.02 | 0.10 | Sand |
| Plains | 0.58 | 0.46 | 0.05 | 0.72 | Grass |
| Forest | 0.54 | 0.62 | 0.46 | 0.46 | Grass |
| Dark Forest | 0.50 | 0.74 | 0.74 | 0.18 | ForestFloor |
| Swamp | — | — | — | — | — |
| Taiga | — | — | — | — | — |
| Desert | — | — | — | — | — |
| Mountains | — | — | — | — | — |

Generation combines multiple OpenSimplex-derived channels with dedicated
seeds: continent shape, temperature, humidity, erosion, peaks/relief,
height/detail, warp/surface variation, caves, ores, water. The generator
exposes climate data back to the renderer (ambient color, fog color/density,
scene grade, vegetation tint, warmth, moisture, lushness).

## 5. Vegetation & tree propagation (`world/vegetation.rs`)

- Terrain can emit **deferred world writes**
- Once a chunk exists, the explicit world-space tree pass runs
- `populate_world_trees_for_chunk(...)` applies post-insert vegetation only
  once per explicitly inserted chunk
- Cross-chunk canopy writes supported; spillover destination chunks remain
  terrain-only until explicitly loaded
- Trunk planning before canopy placement, biome-specific canopy shapes,
  support checks for terrain/grass/flower/shrub surfaces, deterministic
  seed-based variation, explicit world-space validation

## 6. Camera, movement & collision (`renderer/camera.rs`)

The authoritative movement path: input capture in `main.rs` →
`renderer::State::update(...)` → `Camera::tick_movement(...)`.

- First-person camera rotation, walking, sprinting, jumping
- Flight toggle (F) and gravity with fall-speed limiting
- Water-specific gravity and sinking behavior
- AABB-based collision against solid blocks
- Input-intent capture separated from movement integration
- Runtime movement modifiers from overlapping block mediums
  (`BlockType::movement_medium(...)`, tracking `in_foliage_medium` and
  `footstep_volume` for future audio hooks)

## 7. GUI & interaction layer (`interaction.rs`)

The `InteractionController` acts as the **GUI transaction layer** between
the player inventory and the world:

- Open/close inventory GUI
- Open an NVCrafter GUI when the targeted block supports it
- Slot hover detection
- Drag-and-drop between slot types
- Output-slot click handling
- Returning crafting inputs when a GUI closes
- Moving NVCrafter inputs back to inventory, or dropping them into the world

`UiSlotId` explicitly distinguishes: player inventory slots, player crafting
inputs, player crafting output, NVCrafter inputs, NVCrafter output.

## 8. Content pipeline tools

| Tool | Tech | Purpose |
|---|---|---|
| `Bridge/Tools/Slicer/Program.cs` | .NET 8 | Atlas slicing — scans atlas PNGs, extracts block textures |
| `generate_textures.py` | Python/Pillow | Rotate, flip, grayscale, invert, darken, brighten textures |
| `.vscode/tasks.json` | — | Run the engine executable from the workspace |
| `VulkanLayers/VkLayer_NV20.json` + `.dll` | — | Custom Vulkan layer packaging |

## 9. What is intentionally not yet implemented

- Dedicated gameplay audio system (movement-medium signals are already tracked)
- Networking / multiplayer
- In-engine content editor
- Formal ECS-style gameplay architecture
