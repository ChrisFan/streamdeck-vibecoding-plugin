# Claude Sessions — Stream Deck Plugin

Stream Deck MK2 plugin that shows active Claude Code session statuses in real-time, with approve/reject/interrupt controls.

## Architecture

Two processes communicate via files on disk. Neither talks to the other directly.

```
Claude Code hooks (bash+python)
  ├── hook.sh          → writes ~/.claude/hooks/streamdeck/sessions.json
  └── permission-gate.sh → writes pending/{sid}.json, polls responses/{sid}.json
         ▲                              │                       ▲
         │                              ▼                       │
         │                    Stream Deck plugin (Node.js)      │
         │                      ├── reads sessions.json         │
         │                      ├── reads pending/*.json        │
         │                      └── writes responses/*.json ────┘
         │
  ~/.claude/settings.json (hooks registered for all events)
```

- **State file** (`sessions.json`): source of truth for session status. Atomic writes via `fcntl.flock` + `os.replace`.
- **Permission IPC** (`pending/` + `responses/`): file-based request/response between gate and plugin. Gate is a blocking hook process — it blocks Claude Code until user approves or timeout (120s).

## Build & Dev

```sh
npm run build                                    # rollup → .sdPlugin/bin/plugin.js
streamdeck restart com.chris.claude-sessions     # REQUIRED after every build
```

`streamdeck restart` requires developer mode (`streamdeck dev`). Without it, restart silently does nothing.

## Code Layout

```
src/
  plugin.ts                  # Entry: registers actions, connects SDK
  actions/
    claude-session.ts        # Session display buttons (slot 0–N)
    claude-control.ts        # Approve / Reject / Interrupt / ApproveAll
  lib/
    session-watcher.ts       # fs.watch + 2s polling on sessions.json
    permission-ipc.ts        # Read pending, write responses, watch pending dir
    button-renderer.ts       # SVG → base64 (144x144px)
    terminal-focus.ts        # macOS terminal window focus via osascript
    types.ts                 # Shared TypeScript types

~/.claude/hooks/streamdeck/
    hook.sh                  # All-events hook → updates sessions.json
    permission-gate.sh       # PermissionRequest blocking hook → file IPC
    sessions.json            # Shared session state
    pending/                 # Gate → Plugin: pending permission requests
    responses/               # Plugin → Gate: user decisions
    debug.log                # Append-only debug log from hooks
```

## Key Constraints

**Embedded Python quoting** — Both hook scripts use `python3 -c "..."` inside bash. Python code cannot contain unescaped double quotes. Use single-quote f-strings (`f'{var}'`), never `f"{var}"`. See `memory/pitfalls.md` #1 for details.

**TC39 decorators** — SDK v2 requires TC39 decorators (not `experimentalDecorators`). Action classes must use `#` private fields to avoid decorator return-type issues.

**File IPC cleanup invariant** — Both sides must clean up:
- Gate cleans its own `pending/{sid}.json` on exit (including SIGTERM)
- Gate deletes stale `responses/{sid}.json` before polling
- Plugin deletes `pending/{sid}.json` after writing a response
- Button state cross-references both `pending/` and `sessions.json`

**Rollup** — Needs `@rollup/plugin-commonjs` (for `ws` CJS dep). Node builtins are external.

## Hook Event Mapping

| Event | → Status | Notes |
|---|---|---|
| SessionStart | idle | Also updates pid/project/cwd on resume |
| UserPromptSubmit | working | |
| Notification (idle_prompt) | idle | |
| Notification (permission_prompt) / PermissionRequest | permission | |
| Stop | idle | Fires after every response — NOT session end |
| SessionEnd | (remove) | |

`permission_mode=delegate` → filtered out (agent sub-sessions).

## Common Pitfalls

Detailed pitfalls and debug checklists are in `memory/pitfalls.md`. Key ones:

- Python SIGTERM skips `atexit` — must use `signal.signal(signal.SIGTERM, handler)` (#8)
- Stale file IPC causes phantom auto-approves — gate must delete old responses on startup (#9)
- Button state requires cross-source validation: pending dir + sessions.json (#10)
- `streamdeck restart` is silent no-op without dev mode (#2)
- Plugin never hot-reloads — always restart after build (#3)
