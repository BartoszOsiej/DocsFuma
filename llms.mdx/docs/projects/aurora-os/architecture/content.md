# Aurora — Architecture (/docs/projects/aurora-os/architecture)



# Aurora — Architecture [#aurora--architecture]

An in-depth look at every subsystem of the \~4,500-line Aurora codebase
(3,118 lines of TypeScript across 16 modules + 1,376 lines of CSS).

## System overview [#system-overview]

```
┌───────────────────────────── Browser tab ─────────────────────────────┐
│                                                                       │
│  boot() ──► boot screen (progress ring) ──► desktop shell             │
│                                                                       │
│  ┌──────────────┐   ┌────────────────┐   ┌────────────────────┐       │
│  │ WindowManager│   │ ProcessManager │   │   AppRegistry      │       │
│  │ drag · resize│   │ pid · ps · kill│   │ 8 apps registered  │       │
│  │ focus · z    │   │ telemetry tick │   │ single-instance    │       │
│  └──────┬───────┘   └───────┬────────┘   └────────┬───────────┘       │
│         └───────────────────┼─────────────────────┘                   │
│                      ┌──────▼───────┐                          ┌──────▼──────┐
│                      │   EventBus   │◄── every module talks     │ FileSystem  │
│                      │ typed pub/sub│     only through events   │ POSIX-lite  │
│                      └──────┬───────┘                          │ +persistence│
│                             │                                  └─────────────┘
│                       ┌─────▼────────┐                              ▲
│                       │  shell layer │  Terminal ⇄ commands.ts ⇄ ───┘
│                       │ 35+ commands │  (pure interpreter, no DOM)
│                       └──────────────┘
│                                                                       │
│  SoundSystem (WebAudio) · Settings (themes/wallpapers) · Lock screen │
└───────────────────────────────────────────────────────────────────────┘
```

## Module map (measured) [#module-map-measured]

| Module                       | Lines | Responsibility                                                                              |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| `src/main.ts`                | 486   | Kernel entry — boot sequence, desktop shell, taskbar, start menu, context menu, lock screen |
| `src/term/commands.ts`       | 670   | The shell interpreter — 35+ commands, redirection, quoting, ANSI output (pure)              |
| `src/fs/FileSystem.ts`       | 385   | Virtual filesystem — paths, CRUD, recursive ops, error codes, persistence                   |
| `src/core/WindowManager.ts`  | 267   | Window lifecycle — drag, 8-way resize, focus, z-order, maximize/minimize                    |
| `src/term/Terminal.ts`       | 195   | Terminal UI — history, Tab completion, click-to-focus, paste                                |
| `src/apps/SettingsApp.ts`    | 122   | Theme / wallpaper / sound / clock settings + persistence                                    |
| `src/apps/MonitorApp.ts`     | 111   | Live CPU + memory graphs, process table, canvas rendering                                   |
| `src/sound/SoundSystem.ts`   | 110   | Procedural WebAudio — oscillators + gain envelopes                                          |
| `src/core/EventBus.ts`       | 102   | Typed pub/sub backbone with history and error isolation                                     |
| `src/apps/PaintApp.ts`       | 102   | Canvas drawing with palette, brush size, eraser, PNG export                                 |
| `src/core/AppRegistry.ts`    | 84    | Declarative app catalogue + launcher                                                        |
| `src/core/ProcessManager.ts` | 84    | PID allocation, process table, fake telemetry walk                                          |
| `src/apps/AboutApp.ts`       | 82    | System info window with live uptime                                                         |
| `src/apps/CalculatorApp.ts`  | 81    | Expression evaluator with sanitized input                                                   |
| `src/apps/EditorApp.ts`      | 75    | Text editor with open/save + Ctrl+S                                                         |
| `src/apps/FilesApp.ts`       | 128   | Graphical file manager with breadcrumbs                                                     |
| `src/apps/TerminalApp.ts`    | 34    | Terminal-as-app adapter                                                                     |
| `src/style.css`              | 1,376 | Entire OS stylesheet — glass UI, wallpapers, animations                                     |

## Boot sequence [#boot-sequence]

1. `main.ts` renders the boot screen with a progress ring (SVG
   `stroke-dashoffset` animated from 326 → 0) and a status line.
2. Five staged steps run with randomized pacing: kernel → filesystem mount →
   window manager → applications → shell services.
3. Subsystems are constructed: `FileSystem` (hydrated from localStorage or
   seeded), `ProcessManager`, `WindowManager` (bound to `#windows-layer`),
   `AppRegistry` (8 apps registered).
4. The desktop shell is built (icons, taskbar, start menu, context menu,
   lock screen, clock), the boot screen fades out, and the login chime plays.

## EventBus — the communication backbone [#eventbus--the-communication-backbone]

Every subsystem communicates exclusively through named events; modules never
import each other directly. The bus provides:

* **Typed `on` / `once`** subscriptions with unsubscribe handles
* **Error isolation** — a throwing handler never breaks other listeners
* **History** — the last 200 emissions are kept for telemetry/debugging
* **`emitAsync`** — microtask-queued emission

Well-known events: `boot:*`, `window:*`, `process:*`, `fs:changed`,
`theme:changed`, `audio:volume`, `app:*`.

## ProcessManager [#processmanager]

Every window is backed by a `Process` record (PID, name, icon, state,
started-at, CPU/mem telemetry). PIDs start at 100. `ps` and `kill` operate
on this table; the System Monitor and taskbar read from it. A `tick()`
random-walk updates telemetry so the monitor looks alive.

## WindowManager [#windowmanager]

Windows are DOM elements with chrome built by the manager — apps never touch
the titlebar or controls. Features:

* Drag via titlebar (`mousedown` + window-level `mousemove`/`mouseup`)
* 8 resize handles (`n`, `s`, `e`, `w` + corners), 320×220 minimum size
* Focus raises z-index; the focused window gets an accent glow
* Maximize toggles to full-layer geometry; minimize animates out
* Cascading default placement; `singleInstance` apps reuse their window

## FileSystem — POSIX-lite [#filesystem--posix-lite]

* Path resolution supports absolute and relative paths with `.` and `..`
  (rejecting escapes above root with `EPERM`).
* `resolve(path, cwd)` normalizes; every operation throws typed `FSError`s:
  `ENOENT`, `EISDIR`, `ENOTDIR`, `EEXIST`, `EPERM`, `EINVAL`.
* Recursive ops: `mkdirp`, `removeRecursive`, `copy`, `move`, `tree`.
* Persistence: the tree serializes to `localStorage` (`aurora.fs.v1`) on
  every mutation and rehydrates at boot; `wipe()` restores the seed image.
* The default image ships a `/home/user` with Desktop, Documents, Pictures,
  Media and Projects plus system dirs (`/bin`, `/etc`, `/tmp`, `/var`).

## Shell interpreter (pure) [#shell-interpreter-pure]

`commands.ts` is fully DOM-free: `runCommand(line, shell, fs, ctx)` takes a
`Shell` (print callbacks + cwd) and works in Node. Highlights:

* **Redirection** — `>` and `>>` captured through a proxy shell
* **Quoting** — `tokenize()` honors double quotes
* **Command context** — `ps`/`kill`/`open`/`apps`/`history`/`shutdown` bind
  to the live process table and app registry
* **35+ commands** — full reference in the [user guide](./user-guide.md)

## Audio — no files, all synthesis [#audio--no-files-all-synthesis]

`SoundSystem.ts` lazily creates a single `AudioContext` on the first user
gesture (autoplay policy). Every effect is an oscillator + gain envelope:
boot chime (three rising notes), UI click, window open/close sweeps, error
buzz, unlock notification. The Settings app can disable it entirely.

## Theming & persistence [#theming--persistence]

* Settings live in `localStorage` (`aurora.settings.v1`).
* Themes map to CSS custom properties (`--acc`, `--acc2`, `--bg`) applied on
  `&lt;html&gt;data-theme>`; the light theme flips text/border tokens.
* Five wallpapers are pure CSS — the default "Aurora" animates two blurred
  gradient blobs with a 18s/22s drift loop (respects `prefers-reduced-motion`).

## Testing strategy [#testing-strategy]

The core is DOM-free and unit-tested: `npm test` bundles the pure modules
with esbuild and runs **34 assertions** covering the EventBus (emit, once,
unsubscribe, error isolation), FileSystem (paths, CRUD, error codes,
recursive ops) and shell (echo, cd/pwd, ls, redirection, cat, mkdir, touch,
wc, unknown-command handling).

***

*Next: [User guide — commands, shortcuts, apps](./user-guide.md) · [Overview](/docs/projects/aurora-os/)*
