---
description: 'Everything you need to live inside the OS: desktop navigation, shortcuts, the eight applications, and the complete shell command reference.'
keywords:
- Bartosz Osiej Docs
- networking
- documentation
title: Aurora — User Guide
---
# Aurora — User Guide

Everything you need to live inside the OS: desktop navigation, shortcuts,
the eight applications, and the complete shell command reference.

## Desktop navigation

| Element | How to use it |
|---|---|
| **Desktop icons** | Single click selects, double click launches |
| **Start menu (◈)** | Click the start button; grid of all apps; Lock and Restart in the footer |
| **Taskbar** | One button per running app; click toggles minimize/restore; active app is highlighted |
| **Right-click desktop** | Context menu: Open Terminal, New Folder…, New File…, Change Wallpaper, Lock Screen, Restart |
| **Double-click wallpaper** | Opens a Terminal |
| **📶 tray icon** | Virtual network status popup (AuroraNet) |
| **Ctrl+Alt+L** | Lock the system; click or press any key to unlock |

## Keyboard shortcuts

| Keys | Action |
|---|---|
| `Ctrl+Alt+L` | Lock screen |
| `Escape` | Close start menu / context menu |
| `Ctrl+S` (in Editor) | Save the current file |
| `Ctrl+L` (in Terminal) | Clear the terminal screen |
| `Ctrl+C` (in Terminal) | Cancel the current input line |
| `↑` / `↓` (in Terminal) | Command history |
| `Tab` (in Terminal) | Path completion |

## Applications

| App | Icon | What it does |
|---|---|---|
| **Files** | 📁 | Graphical file manager — breadcrumbs, path input, new file/folder, refresh, up-navigation; double-click files to open them in Editor |
| **Terminal** | ⌨️ | The shell — full command reference below |
| **Editor** | 📝 | Plain-text editor with Open / Save and Ctrl+S; accepts a file path as a launch argument (`open editor /path/file.txt`) |
| **Calculator** | 🧮 | Expression calculator — operators `+ − × ÷`, parentheses, 30-char limit, error handling |
| **Paint** | 🎨 | Canvas drawing — 12-color palette, brush size 1–24 px, eraser, Clear, PNG export |
| **System Monitor** | 📊 | Live CPU and memory graphs, process table with per-process CPU/mem, session stats |
| **Settings** | ⚙️ | 5 themes, 5 wallpapers, sound toggle, 12/24-hour clock |
| **About** | ◈ | Version, live session uptime, subsystem statistics, feature grid |

## Shell — complete command reference

The AURORA shell (`aurora-sh`) ships **37 commands**. Type `help` in the
terminal for the same list, or `man &lt;command&gt;` for the manual entry.

### Files & directories

| Command | Usage | Description |
|---|---|---|
| `ls` | `ls [path]` | List directory contents (directories in cyan) |
| `ll` | `ll [path]` | Long listing with type and human-readable sizes |
| `cd` | `cd &lt;path&gt;` | Change directory (default: home) |
| `pwd` | `pwd` | Print the working directory |
| `tree` | `tree [path] [depth]` | Recursive directory tree |
| `mkdir` | `mkdir [-p] &lt;dir&gt;` | Create a directory (`-p` creates parents) |
| `rm` | `rm [-r] &lt;path&gt;` | Remove a file (`-r` for directories) |
| `cp` | `cp &lt;src&gt; &lt;dst&gt;` | Copy file or directory (recursive) |
| `mv` | `mv &lt;src&gt; &lt;dst&gt;` | Move or rename |

### Reading & writing

| Command | Usage | Description |
|---|---|---|
| `cat` | `cat &lt;file&gt;...` | Concatenate files to stdout |
| `echo` | `echo &lt;text&gt;` | Print text (supports `"quoted"` arguments) |
| `touch` | `touch &lt;file&gt;` | Create an empty file |
| `head` | `head [-n N] &lt;file&gt;` | First N lines (default 10) |
| `tail` | `tail [-n N] &lt;file&gt;` | Last N lines (default 10) |
| `wc` | `wc &lt;file&gt;` | Count lines, words and characters |
| `grep` | `grep &lt;pattern&gt; &lt;file&gt;` | Search a file for a pattern |

### Redirection

| Example | Effect |
|---|---|
| `echo hello > out.txt` | Write output to a file (overwrite) |
| `ls > listing.txt` | Redirect any command output |
| `echo more >> out.txt` | Append output to a file |

### System information

| Command | Usage | Description |
|---|---|---|
| `date` | `date` | Current date and time |
| `whoami` | `whoami` | Print the current user (`user`) |
| `hostname` | `hostname` | Print the machine name (`aurora`) |
| `uname` | `uname [-a]` | Kernel / system information |
| `uptime` | `uptime` | Time since boot |
| `neofetch` | `neofetch` | System banner with logo |
| `df` | `df` | Filesystem usage across the virtual disk |
| `du` | `du &lt;path&gt;` | Disk usage of a path |
| `version` | `version` | OS, kernel, shell and window-manager versions |

### Processes & apps

| Command | Usage | Description |
|---|---|---|
| `ps` | `ps` | Table of running processes (PID, CPU, memory) |
| `kill` | `kill &lt;pid&gt;` | Terminate a process by PID |
| `open` | `open &lt;app&gt; [args]` | Launch an application (e.g. `open editor file.txt`) |
| `apps` | `apps` | List installed applications with categories |

### Shell conveniences

| Command | Usage | Description |
|---|---|---|
| `help` | `help [command]` | List commands or show help for one |
| `man` | `man &lt;command&gt;` | Manual entry for a command |
| `history` | `history` | Show command history |
| `clear` | `clear` | Clear the screen |
| `exit` | `exit` | Close the terminal |
| `sudo` | `sudo &lt;command&gt;` | Execute as root — you already are root |
| `shutdown` | `shutdown` | Reboot Aurora |
| `fortune` | `fortune` | Random quote |

## Tips

- **Tab** completes paths; type a prefix and press Tab. Multiple matches are
  listed inline.
- **↑/↓** cycle through command history; `history` shows the numbered list.
- **Redirection** works with any command, not just `echo`.
- Files created in the terminal appear instantly in the **Files** app — the
  filesystem broadcasts `fs:changed` over the EventBus.
- The filesystem persists across page reloads (localStorage). Use
  `rm -r` carefully — `EPERM` protects the root directory.

## Troubleshooting

| Symptom | Fix |
|---|---|
| No sound | Sound requires a first user interaction (autoplay policy) — click anywhere, then check Settings → Behavior → Sound |
| Files missing after reload | Open Settings → theme change reloads cleanly; if storage was cleared, the seed image is restored automatically |
| Terminal not focused | Click inside the terminal; the app focuses itself on open |
| Windows off-screen | Windows cascade and clamp to the viewport; maximize (□) resets geometry |

---

*Back to [Overview](/docs/projects/aurora-os/) · [Architecture](./architecture.md)*
