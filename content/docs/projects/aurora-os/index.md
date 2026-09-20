---
description: '**A complete operating system running in your browser.** Aurora is a from-scratch desktop environment — window manager, virtual'
keywords:
- Bartosz Osiej Docs
- operating system
- TypeScript
- filesystem
- browser
- kernel
- rendering
- documentation
title: ◈ Aurora
---
# ◈ Aurora

<a class="tests-cta" href="./tests">🧪 View animated test results — 56/56 →</a>

**A complete operating system running in your browser.**

Aurora is a from-scratch desktop environment — window manager, virtual
file system, shell, and eight applications — written entirely in TypeScript
with **zero runtime dependencies**. No frameworks, no server, no build
artifacts at runtime: the kernel boots, renders, and persists entirely in
your browser tab.

> *"Your browser is now your computer."*

---

## 🎯 What is Aurora?

Most "web OS" demos are a single window with buttons. Aurora is an actual
system: it boots through an animated kernel sequence, owns a process table,
multiplexes windows with full drag/resize/minimize/maximize semantics, hosts
a POSIX-flavored virtual filesystem with persistence, and ships an
interactive shell with **36+ commands** — all implemented from scratch.

The entire project is **~4,500 lines** of hand-written TypeScript + CSS
(3,118 lines of TS across 16 modules, 1,376 lines of CSS), with **no
external runtime dependencies**.

## ✨ Feature matrix

| Layer | Capabilities |
|---|---|
| 🧠 **Kernel** | Animated boot sequence with progress ring · typed EventBus (pub/sub, once, history, error isolation) · PID process table with telemetry · settings subsystem · localStorage persistence |
| 🪟 **Window manager** | Drag by titlebar · 8-direction resize handles · minimize / maximize / focus · cascading placement · z-order management · glassmorphism chrome · open/close animations · taskbar integration |
| 📂 **Virtual filesystem** | POSIX-inspired tree · absolute + relative paths with `.` / `..` resolution · `mkdir -p`, recursive `rm -r`, `cp`, `mv` · proper error codes (`ENOENT`, `EISDIR`, `EEXIST`, `EPERM`, `ENOTDIR`) · human-readable sizes · localStorage persistence |
| ⌨️ **Terminal & shell** | 36+ commands (incl. `find`) · command history (↑/↓) · Tab path completion · output redirection (`>` / `>>`) · ANSI color rendering · `neofetch`, `fortune`, `sudo` (you are root) · pure interpreter, fully unit-tested |
| 📱 **Applications** | Files · Terminal · Editor (Ctrl+S) · Calculator · Paint (PNG export) · System Monitor (live CPU/memory graphs) · Settings · About |
| 🎨 **Theming** | 5 themes: Aurora, Midnight, Ember, Forest, Daylight · 5 animated wallpapers: Aurora, Grid, Mountains, Waves, Dots |
| 🔊 **Audio** | Fully procedural WebAudio — boot chime, UI clicks, window swooshes, error buzzes, unlock notification. Zero audio files |
| 🔒 **Security theater** | Lock screen (Ctrl+Alt+L) · single-user model · filesystem permission boundaries |

## 🚀 Quick start

```bash
git clone https://github.com/BartoszOsiej/Aurora.git
cd AURORA-OS
npm install
npm run build      # bundles to dist/ (esbuild, dev-only tool)
npm run serve      # http://localhost:8080
```

| Command | Purpose |
|---|---|
| `npm run build` | esbuild bundle → `dist/main.js` + copy `dist/style.css` |
| `npm run typecheck` | strict `tsc` type checking |
| `npm test` | runs 34 core-logic tests (EventBus, FileSystem, shell) |
| `npm run serve` | static file server for the OS |

## 🖱️ First steps inside the OS

1. Double-click **Terminal** on the desktop (or open the ◈ Start menu).
2. Type `help` to list all commands, `neofetch` for the system banner.
3. Create a file: `echo hello > hello.txt`, then `cat hello.txt`.
4. Open it graphically: `open editor hello.txt`.
5. Right-click the desktop: new folder, new file, wallpaper, lock screen.
6. `ps` + `kill 101` to manage processes.
7. Press **Ctrl+Alt+L** to lock the system.

## 🔗 Links

| Resource | URL |
|---|---|
| Source code | https://github.com/BartoszOsiej/Aurora |
| Architecture | [Deep dive into every subsystem](/docs/projects/aurora-os/architecture) |
| User guide | [Terminal reference, shortcuts, apps](/docs/projects/aurora-os/user-guide) |

---

*Related documentation: [NV2 Engine](/docs/projects/nv2-engine/) · [CyberForge](/docs/projects/cybersec-tools/) · [LinkShort](/docs/projects/fastapi-url/) · [Novactorio](/docs/projects/factorio-web-game/)*
