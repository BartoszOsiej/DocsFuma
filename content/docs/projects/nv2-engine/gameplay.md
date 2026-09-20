---
description: 'NV2 Engine is a survival-sandbox loop: generate a procedural world, break and place blocks with tool-gated harvesting, gather resources, craft tools and'
keywords:
- Bartosz Osiej Docs
- voxel engine
- AST
- documentation
title: Gameplay
---
# Gameplay

NV2 Engine is a survival-sandbox loop: generate a procedural world, break and
place blocks with tool-gated harvesting, gather resources, craft tools and
furniture, and explore climate-driven biomes where an AI places vegetation.

## Controls

| Input | Action |
|---|---|
| `W` `A` `S` `D` | Move |
| `Space` | Jump (or ascend in flight mode) |
| `Shift` | Sprint (with FOV kick) |
| `F` | Toggle flight mode |
| `E` | Open / close inventory |
| `Esc` | Pause menu (or close inventory) |
| `/` | Open the command prompt |
| Left mouse | Break block (hold to keep mining; tool-gated) |
| Right mouse | Place block / use item |
| Mouse wheel | Switch hotbar slot |
| Mouse | Look around (captured while playing) |

**In menus:** `↑` / `↓` (or `W` / `S`) navigate, `Enter` / `Space` confirm,
`N` starts a new game, `L` loads from the main menu.

---

## Block interaction (`interaction.rs`)

### Targeting
DDA (Digital Differential Analyzer) voxel raycasting via `world/raycast.rs`
projects from the camera through the crosshair to find the targeted block.

### Mining
- **Left mouse** starts breaking; **holding** continues with persistent
  break-progress state.
- Harvesting is **tool-gated**: each block has a hardness value and a required
  tool tier; the held tool's power must meet or exceed the requirement.
- Successful harvests consume **tool durability**.

### Placement
- **Right mouse** places the block from the active inventory stack.
- Placement is blocked **inside the player AABB** (you cannot build inside
  yourself).

### Special drop logic
| Case | Behavior |
|---|---|
| Gravel | Can drop **flint** via deterministic seeded drop logic |
| Tree trunk | Destroying a trunk harvests the **connected trunk/leaves cluster**, not just one block |
| Leaves | Can additionally drop **saplings and sticks** with deterministic odds |
| NVCrafter | Breaking it **flushes stored contents** into world drops before removal |

---

## Tool tiers & durability

| Tier | Power | Tools |
|---|---|---|
| Hand | 1 | Bare hands |
| Flint | 2 | Flint pickaxe |
| Stone | 3 | Stone pickaxe |
| Iron | 5 | Iron pickaxe |
| Diamond | 7 | Diamond pickaxe |
| Netherite | 8 | Netherite pickaxe |

Every tool tracks `max_durability`; mining valid targets consumes durability.
Tool power gates which blocks can be broken — a wooden tier cannot harvest
stone-tier blocks.

---

## Inventory & hotbar (`inventory.rs`)

- **36-slot player inventory**
- **9-slot hotbar** mapped to the tail of the inventory
- Active hotbar selection with mouse-wheel scrolling
- **Stack merging and overflow handling**
- Tool durability tracking
- Separation between placeable items and inventory-only items
- Built-in **2×2 player crafting grid** with output slot

Drag-and-drop stack management works across all GUI slot types (inventory,
crafting inputs/output, NVCrafter).

---

## Crafting (`crafting.rs`)

Two crafting surfaces:

| Surface | Grid | Where |
|---|---|---|
| Player crafting | 2×2 | Always available in the inventory screen |
| NVCrafter | 3×3 | World-placed crafting station (has persistent state) |

`RecipeRegistry` supports **shaped recipes** (pattern matching with offset
support) and **shapeless recipes** (multiset matching). Recipes are also
loadable from JSON (`assets.rs`). See the [Crafting Reference](./crafting.md) for
every recipe with exact patterns.

---

## Movement & physics (`renderer/camera.rs`)

- Walking, **sprinting with FOV kick**, jumping
- Gravity with fall-speed limiting
- **Flight mode** (`F`) — disables gravity, `Space` ascends
- **Water physics** — water-specific gravity and sinking behavior
- AABB collision against solid blocks
- **Movement mediums** — standing in foliage applies a 0.55× movement speed
  multiplier (0.65× sprint, 0.35× fall), with sound dampening tracked for
  future audio

---

## Commands (`commands.rs`)

Open the prompt with `/`:

| Command | Description |
|---|---|
| `/locate &lt;biome&gt; [--tp]` | Find the nearest biome by sampling chunk rings outward from the player; `--tp` teleports there |
| `/tp &lt;x&gt; &lt;y&gt; &lt;z&gt;` | Teleport to absolute coordinates (resolved safely) |

Responses and errors appear both on stdout and in-engine as subtitle/command
prompt messages. Teleports use `World::safe_teleport_position(...)` to avoid
placing the player inside solid blocks.

---

## Persistence

The world serializes to **JSON** at `saves/world.json` (next to the
executable). Saved data:

- World seed
- Flattened chunk block data
- Chunk water metadata
- Persisted NVCrafter states

The pause menu offers **Save** and **Save & Exit**; the main menu offers
**Load/Save**. Old saves remain fully compatible — AI vegetation only kicks in
for newly generated chunks.

---

## Day/night & atmosphere

The renderer drives day/night phase progression through `elapsed_time`,
water animation timing, and climate/biome-driven fog and ambient color
uniforms — each biome tints the scene (e.g. forest `[0.50, 0.86, 0.42]`,
dark forest `[0.38, 0.72, 0.34]`).
