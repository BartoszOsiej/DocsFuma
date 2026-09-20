---
description: 'VIVIA: Beyond the Known (internally `NV_ENGINE`, repository: `NV2_ENGINE`) is a **shipped commercial voxel game** written in Rust (47 source files, 15,800+'
keywords:
- Bartosz Osiej Docs
- multiplayer
- networking
- Python
- neural renderer
- rendering
- voxel engine
- Rust
- wgpu
- documentation
title: 'VIVIA: Beyond the Known (formerly NV2 Engine)'
---
# VIVIA: Beyond the Known (formerly NV2 Engine)

<a class="tests-cta" href="./tests">🧪 View animated test results — 224 passed / 225 total →</a>

> **A complete voxel survival sandbox with AI-powered terrain, multiplayer networking, and a custom neural network — built from scratch in Rust. Premiering on Epic Games Store, August 2026.**

VIVIA: Beyond the Known (internally `NV_ENGINE`, repository: `NV2_ENGINE`) is a
**shipped commercial voxel game** written in Rust (47 source files, 15,800+
lines). It features procedural terrain generation with real-world NASA climate
data, an embedded neural network (MeMLP) that learns vegetation placement
while you play, a full mob system with AI-generated 3D models, multiplayer
TCP networking, procedural audio, and a survival gameplay loop — all rendered
on GPU via wgpu.

**Developer:** Terra Nova Gameworks · **Version:** 1.0.0 · **Price:** $9.99 (launch $7.49)
**Platforms:** Linux, Windows · **Stores:** Epic Games Store, itch.io

**Stack:** Rust 2021 · wgpu 0.20 · winit 0.30 · cgmath 0.18 · OpenSimplex2 ·
rayon · tokio · ndarray · meshopt · bincode · rodio · fontdue · bytemuck ·
Epic Online Services · C#/.NET 8 (content tools) · Python (AI/texture tools)

---

## Feature matrix

### World & terrain
| Feature | Detail |
|---|---|
| **Procedural generation** | OpenSimplex2 heightmaps, caves, ores, water-aware column sampling |
| **Chunk dimensions** | 16×512×16 — double-height chunks (raised from 256) for tall mountains & deep caves |
| **Biomes** | 9 climate-driven biomes: Ocean, Coast, Plains, Forest, Dark Forest, Swamp, Taiga, Desert, Mountains |
| **Climate model** | Temperature + humidity drive block distribution, vegetation density, fog and ambient color |
| **Generation channels** | Dedicated OpenSimplex channels + seeds for continent shape, temperature, humidity, erosion, peaks/relief, height/detail, warp, caves, ores, water |
| **Async generation** | Bounded work queue, in-flight dedup, rayon parallel generation, mpsc delivery to main thread |

### AI-driven vegetation — MeMLP
| Feature | Detail |
|---|---|
| **Architecture** | **MeMLP** (Modular embedded Multi-layer Perceptron Model) — modular, in-process, pure CPU, one JSON checkpoint |
| **Vegetation head** | Deep MLP 8→24→16→4, ~0.3 µs/prediction (3.4 M/s) |
| **Biome head** | 8→12→9 — biome classification driving biome-aware decorations |
| **Texture head** | 8→12→6 — procedural texture-style selection |
| **Input features** | 8 terrain features: height, slope, temperature, humidity, water distance, plant density, light, noise seed |
| **Output classes** | 4 vegetation classes: flowers, ferns/water plants, sticks/decorations, pebbles/rocks |
| **Background training** | Continuous thread, 240+ samples/epoch across all heads, &lt;1% CPU overhead |
| **Training method** | Online SGD + cross-entropy, backprop through all layers; trains on player feedback, online climate data (offline-safe) and synthetic samples |
| **Checkpoints** | Single JSON file; legacy 8→16→4 checkpoints migrate automatically |
| **Vegetation blocks** | 22 new block types: roses, tulips (4 colors), dandelions, cornflower, allium, azalea, ferns, lily pads, seagrass, kelp, moss carpet, vines, sticks, pebbles |
| **Confidence threshold** | 0.40 — only high-confidence predictions place blocks |

### Rendering (wgpu 0.20)
| Feature | Detail |
|---|---|
| **Per-chunk GPU buffers** | A block edit re-uploads only that chunk (previously ~81 chunks per change) |
| **Frustum culling** | Gribb–Hartmann plane extraction with safety margin + protected 3×3 area around player |
| **Packed vertices** | 72-byte CPU vertices → 36-byte GPU format (Snorm8x4/Unorm8x4) |
| **Incremental water meshing** | Only changed chunks rebuild; interval-based simulation |
| **Separate pipelines** | Solid world, water, flat UI panels, sprite UI icons, text rendering |
| **Texture atlas** | Dynamic atlas, switchable texture packs, top/bottom/side variants |
| **Text rendering** | fontdue rasterization, custom text layers |

### Gameplay
| Feature | Detail |
|---|---|
| **Block interaction** | DDA raycast targeting, held-break mining, right-click placement |
| **Tool tiers** | Hand → Flint → Stone → Iron → Diamond → Netherite, with power values and durability |
| **Inventory** | 36-slot inventory + 9-slot hotbar, stack merging, drag-and-drop |
| **Crafting** | 2×2 player grid + 3×3 NVCrafter station, shaped & shapeless recipes |
| **Recipes** | 18 recipes: planks, sticks, NVCrafter, wooden pickaxe/axe/shovel/hoe, torches, chest, door, trapdoor, ladder, fence, fence gate, workbench upgrade, flint/stone/iron pickaxes |
| **Movement** | Walk, sprint (FOV kick), jump, flight, water gravity/sinking, AABB collision, foliage movement modifiers |
| **Commands** | `/locate <biome> [--tp]`, `/tp <x> <y> <z>`, `/attack` |
| **Persistence** | JSON world saves (seed, chunk blocks, water metadata, NVCrafter states) |
| **Left-click attack** | `attack_nearest()` with 0.4s cooldown — default mouse button when cursor locked |

### Mob system
| Feature | Detail |
|---|---|
| **Enemies** | 36 hostile mobs across 11 families: Frost Hound, Sand Reaper, Bone Colossus, Void Wraith, Ash Crawler, Lava Brute, Swamp Toxin, Plague Mother, Wretched Flyer, Shadow Stalker, World Serpent, Iron Golem, Night Wisp, Deep Maw, Sand Hydra |
| **Animals** | 41 passive mobs: Deer, Rabbit, Wolf, Bear, Eagle, Chicken, Horse, Pig, Cow, Sheep, Cat, Dog, Turtle, Frog, Snake, Bat, Mouse, Fox, Boar, Bee |
| **AI** | Melee/ranged/hunter/guardian behavior per family, 15-attack damage spread, `attack_nearest()`, `attack_closest_enemy()`, `attack_weakest()` |
| **3D models** | 11 GLB mesh files (ARACHNID, BOSS, BRUTE, CANID, CRAWLER, FLYER, GOLEM, HUMANOID, WISP, WORM, WRAITH) with meshopt optimization, tint + scale in shader |
| **Families** | 11 base shapes cover 77/100 mobs; 23 small animals use voxel fallback |

### Multiplayer
| Feature | Detail |
|---|---|
| **Networking** | TCP (tokio async), length-prefixed bincode serialization, 20Hz tick rate |
| **Protocol** | 18 packet types: Join, Leave, GameState, Input, Chat, Ping, etc. |
| **Server** | Headless TCP server (`--server --port 26400 --seed 42`), server authoritative |
| **Client** | `--connect <addr> --name <nick>`, crossbeam channels (sync ↔ async) |
| **NAT traversal** | playit.gg — zero cost, 4-100 players |
| **Remote players** | Rendered as humanoid cubes with blue tint |
| **Shared seed** | Server and client use identical world generation seed |

### Special gameplay logic
| Feature | Detail |
|---|---|
| **Flint drops** | Gravel can drop flint via deterministic seeded logic |
| **Tree harvesting** | Destroying a trunk harvests the connected trunk/leaves cluster |
| **Leaf drops** | Leaves drop saplings and sticks with deterministic odds |
| **Crafter flush** | Breaking an NVCrafter flushes stored contents into world drops |
| **Placement guard** | Blocks cannot be placed inside the player AABB |

---

## Quick start

Requires a Rust toolchain (stable is enough) and a GPU with
Vulkan/Metal/DX12/GL support.

```bash
cd Core
cargo run --release
```

The game opens a window with the main menu:

| Menu item | Action |
|---|---|
| **New Game** | Start a new procedurally generated world |
| **Load/Save** | Load the saved world |
| **Low-End-PC** | Toggle the low-end performance profile |
| **Quit** | Exit |

> **Note:** `cargo run` in dev mode already builds third-party crates at
> `opt-level 3`, so even a debug build plays smoothly.

**CLI flags:**

| Flag | Action |
|---|---|
| `--server` | Run headless multiplayer server (no GPU/okna) |
| `--port <N>` | Server port (default: 26400) |
| `--seed <N>` | World generation seed |
| `--connect <addr>` | Connect to multiplayer server |
| `--name <nick>` | Set player nickname |
| `--autostart` | Skip main menu, start new game immediately |
| `--night` | Start at night (for testing) |

**First minutes in-game:** spawn near a forest → punch trees with your bare
hands → gather wood → open the 2×2 crafting grid (`E`) → craft wooden
planks → sticks → a wooden pickaxe → mine stone → craft a stone pickaxe →
mine iron → eventually craft an NVCrafter for 3×3 recipes.

**Multiplayer (local):**
```bash
# Terminal 1 — server
cargo run --release -- --server --seed 42

# Terminal 2 — player 1
cargo run --release -- --connect 127.0.0.1:26400 --name Alice

# Terminal 3 — player 2
cargo run --release -- --connect 127.0.0.1:26400 --name Bob
```

**Multiplayer (internet via playit.gg):** see [MULTIPLAYER.md](https://github.com/BartoszOsiej/VIVIA-Beyond-the-Known/blob/main/MULTIPLAYER.md)

---

## Documentation index

| Page | Contents |
|---|---|
| [Architecture](/docs/projects/nv2-engine/architecture) | Full runtime, renderer, world, UI layering — module by module |
| [Gameplay](/docs/projects/nv2-engine/gameplay) | Controls, interaction, inventory, crafting, commands, persistence |
| [Blocks & Biomes](/docs/projects/nv2-engine/blocks) | Complete 97-block registry, tool tiers, 9 biome definitions, ores |
| [Crafting Reference](/docs/projects/nv2-engine/crafting) | Every recipe with exact patterns |
| [Water Simulation](/docs/projects/nv2-engine/water) | Liquid encoding, solver, and rendering internals |
| [AI Vegetation System](/docs/projects/nv2-engine/ai) | Network math, training loop, hyperparameters, integration |
| [Performance](/docs/projects/nv2-engine/performance) | GPU bandwidth, culling, meshing budgets, profiles |
| [Development](/docs/projects/nv2-engine/development) | Build, module map, testing, extending the engine |
| [Roadmap & Changelog](/docs/projects/nv2-engine/roadmap) | History, Phase 2 plans, known limitations |

---

## 🚀 VIVIA: Beyond the Known — Epic Games Store Launch

**Premiere:** August 2026 (Monday) · **Price:** $9.99 (launch promo $7.49)
**Publisher:** Terra Nova Gameworks · **Stores:** Epic Games Store + itch.io

The project was renamed from **NV2 Engine** to **VIVIA: Beyond the Known** for
the commercial release. The internal engine code retains the `NV_ENGINE` prefix;
the game title on all store pages and marketing material is **VIVIA**.

### Build pipeline
- Linux + Windows builds via `build.sh`
- GitHub Actions CI (`.github/workflows/windows-build.yml`)
- Epic Games Store submission kit: `EGS/` directory with manifest, build, store assets
- Store assets: capsule art (5 sizes) + gameplay screenshots in `store_assets/`

### Engine stats at launch
| Metric | Value |
|---|---|
| Source files | 47 `.rs` files + 10 `.wgsl` shaders |
| Test cases | 224 passed / 225 total (3 ignored) |
| GLB models | 11 AI mesh families, ~45 MB total |
| Block types | 97 |
| Biomes | 9 climate-driven |
| Mob families | 11 base shapes, 77/100 mobs covered |
| Multiplayer | TCP, 20Hz tick, headless server mode |
