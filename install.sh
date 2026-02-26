#!/bin/bash
# Claude Sessions Stream Deck Plugin — Install Script
# Sets up hooks, registers them in Claude Code settings, builds and links the plugin.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_DIR="$HOME/.claude/hooks/streamdeck"
SETTINGS_FILE="$HOME/.claude/settings.json"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail()  { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }

# --- Prerequisites ---
echo ""
echo "=== Claude Sessions Stream Deck Plugin — Installer ==="
echo ""

command -v node >/dev/null 2>&1 || fail "node not found. Install Node.js 20+."
command -v npm >/dev/null 2>&1  || fail "npm not found. Install Node.js 20+."
command -v python3 >/dev/null 2>&1 || fail "python3 not found. Required by hook scripts."
command -v streamdeck >/dev/null 2>&1 || fail "streamdeck CLI not found. Install: npm install -g @elgato/cli"

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js 20+ required, found $(node -v)"
fi

ok "Prerequisites OK (node $(node -v), python3, streamdeck CLI)"

# --- Step 1: Install hooks ---
info "Installing hooks to $HOOK_DIR"
mkdir -p "$HOOK_DIR/pending" "$HOOK_DIR/responses"

cp "$SCRIPT_DIR/hooks/hook.sh" "$HOOK_DIR/hook.sh"
cp "$SCRIPT_DIR/hooks/permission-gate.sh" "$HOOK_DIR/permission-gate.sh"
chmod +x "$HOOK_DIR/hook.sh" "$HOOK_DIR/permission-gate.sh"

ok "Hooks installed"

# --- Step 2: Register hooks in settings.json ---
info "Registering hooks in $SETTINGS_FILE"

python3 -c "
import json, os, sys

SETTINGS = os.path.expanduser('~/.claude/settings.json')
HOOK_DIR = os.path.expanduser('~/.claude/hooks/streamdeck')

hook_cmd = os.path.join(HOOK_DIR, 'hook.sh')
gate_cmd = os.path.join(HOOK_DIR, 'permission-gate.sh')

# Hook entries we need registered
HOOK_ENTRY = {'type': 'command', 'command': hook_cmd, 'timeout': 10}
GATE_ENTRY = {'type': 'command', 'command': gate_cmd, 'timeout': 130}

# Events and which hooks they need
EVENT_HOOKS = {
    'SessionStart':      [HOOK_ENTRY],
    'UserPromptSubmit':  [HOOK_ENTRY],
    'Stop':              [HOOK_ENTRY],
    'Notification':      [HOOK_ENTRY],
    'PermissionRequest': [HOOK_ENTRY, GATE_ENTRY],
    'SessionEnd':        [HOOK_ENTRY],
}

# Read or create settings
try:
    with open(SETTINGS, 'r') as f:
        settings = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    settings = {}

hooks = settings.setdefault('hooks', {})

added = 0
for event, entries in EVENT_HOOKS.items():
    event_list = hooks.setdefault(event, [])

    # Find or create the catch-all matcher group
    group = None
    for g in event_list:
        if g.get('matcher', '') == '':
            group = g
            break
    if group is None:
        group = {'matcher': '', 'hooks': []}
        event_list.append(group)

    existing_cmds = {h.get('command') for h in group.get('hooks', [])}

    for entry in entries:
        if entry['command'] not in existing_cmds:
            group.setdefault('hooks', []).append(entry)
            added += 1

# Write back
tmp = SETTINGS + '.tmp'
with open(tmp, 'w') as f:
    json.dump(settings, f, indent=2)
    f.write('\n')
os.replace(tmp, SETTINGS)

print(f'  {added} hook entries added' if added else '  Hooks already registered')
"

ok "Settings updated"

# --- Step 3: Build plugin ---
info "Installing dependencies"
cd "$SCRIPT_DIR"
npm install --silent 2>&1 | tail -1 || true

info "Building plugin"
npm run build --silent 2>&1 | tail -1

ok "Plugin built"

# --- Step 4: Link plugin ---
info "Linking plugin to Stream Deck"
streamdeck link "$SCRIPT_DIR/com.chris.claude-sessions.sdPlugin" 2>&1 || true

ok "Plugin linked"

# --- Step 5: Enable dev mode ---
info "Enabling developer mode"
streamdeck dev 2>&1 || true

# --- Done ---
echo ""
echo "========================================"
echo -e "${GREEN} Installation complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Restart Stream Deck plugin:"
echo "       streamdeck restart com.chris.claude-sessions"
echo ""
echo "  2. Add buttons to your Stream Deck layout:"
echo "     - 'Claude Session' (one per session slot)"
echo "     - 'Approve' / 'Reject' / 'Interrupt'"
echo "     - 'Caffeinate' (optional)"
echo "     - 'Skin Toggle' (optional)"
echo ""
echo "  3. Open a Claude Code session — it should appear on your Stream Deck!"
echo ""
echo "Tips:"
echo "  - Short press a session button to focus its Ghostty tab"
echo "  - Long press (>1s) to remove a stale session"
echo "  - Approve/Reject buttons control permission requests"
echo ""
