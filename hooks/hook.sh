#!/bin/bash
# streamdeck-sessions: Update session state for Stream Deck display
# Reads Claude Code hook JSON from stdin, updates sessions.json atomically
set -uo pipefail

INPUT=$(cat)

HOOK_PPID=$PPID python3 -c "
import sys, json, os, time, fcntl

STATE_DIR = os.path.expanduser('~/.claude/hooks/streamdeck')
STATE_FILE = os.path.join(STATE_DIR, 'sessions.json')
LOCK_FILE = os.path.join(STATE_DIR, '.lock')

event_data = json.loads(sys.stdin.read())
event = event_data.get('hook_event_name', '')
session_id = event_data.get('session_id', '')
cwd = event_data.get('cwd', '')
perm_mode = event_data.get('permission_mode', '')
ntype = event_data.get('notification_type', '')

# Filter out delegate (agent) sub-sessions
if perm_mode == 'delegate':
    sys.exit(0)

if not session_id:
    sys.exit(0)

# Derive project name from cwd
project = os.path.basename(cwd) if cwd else 'unknown'

os.makedirs(STATE_DIR, exist_ok=True)

# Acquire file lock
lock_fd = open(LOCK_FILE, 'w')
fcntl.flock(lock_fd, fcntl.LOCK_EX)

try:
    # Read existing state
    try:
        with open(STATE_FILE, 'r') as f:
            state = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        state = {'version': 1, 'updated_at': 0, 'sessions': {}}

    sessions = state.get('sessions', {})
    now = time.time()
    pid = int(os.environ.get('HOOK_PPID', '0'))

    # Debug log
    LOG_FILE = os.path.join(STATE_DIR, 'debug.log')
    with open(LOG_FILE, 'a') as lf:
        lf.write(f'{now} event={event} sid={session_id[:8]} pid={pid} ntype={ntype} existing={list(sessions.keys())}\\n')

    # Resolve target: exact session_id match, or fallback to PID match
    target = session_id if session_id in sessions else None
    if not target and pid:
        pid_matches = [sid for sid, s in sessions.items() if s.get('pid') == pid]
        if pid_matches:
            target = pid_matches[0]

    # Map event to status
    if event == 'SessionStart':
        if target:
            # Resume/clear fires new SessionStart with new PID — update identity fields
            sessions[target]['last_event'] = now
            sessions[target]['last_event_type'] = event
            sessions[target]['pid'] = pid
            sessions[target]['project'] = project
            sessions[target]['cwd'] = cwd
        else:
            sessions[session_id] = {
                'project': project,
                'cwd': cwd,
                'status': 'idle',
                'started_at': now,
                'last_event': now,
                'last_event_type': event,
                'pid': pid,
            }
            # Clean up genuinely dead sessions for same project (PID no longer alive)
            import subprocess
            stale = []
            for sid, s in sessions.items():
                if sid == session_id:
                    continue
                if s.get('project') != project:
                    continue
                old_pid = s.get('pid')
                if not old_pid:
                    stale.append(sid)
                    continue
                try:
                    os.kill(old_pid, 0)
                except ProcessLookupError:
                    stale.append(sid)
                except PermissionError:
                    pass  # PID alive but different user — keep
            for sid in stale:
                del sessions[sid]
    elif event == 'Stop':
        # Stop fires after every response, NOT only on exit — just mark idle
        if target:
            sessions[target]['status'] = 'idle'
            sessions[target]['last_event'] = now
            sessions[target]['last_event_type'] = event
    elif event == 'UserPromptSubmit':
        if target:
            sessions[target]['status'] = 'working'
            sessions[target]['last_event'] = now
            sessions[target]['last_event_type'] = event
    elif event == 'Notification':
        if target:
            if ntype == 'idle_prompt':
                sessions[target]['status'] = 'idle'
            elif ntype == 'permission_prompt':
                sessions[target]['status'] = 'permission'
            sessions[target]['last_event'] = now
            sessions[target]['last_event_type'] = f'Notification:{ntype}'
    elif event == 'PermissionRequest':
        if target:
            sessions[target]['status'] = 'permission'
            sessions[target]['last_event'] = now
            sessions[target]['last_event_type'] = event
    elif event == 'SessionEnd':
        # True exit (Ctrl+C, /exit, /clear) — remove session
        if target:
            del sessions[target]
        # Also remove by exact session_id if different from PID-resolved target
        if session_id in sessions and session_id != target:
            del sessions[session_id]

    state['sessions'] = sessions
    state['updated_at'] = now

    # Atomic write: tmp + rename
    tmp_file = STATE_FILE + '.tmp'
    with open(tmp_file, 'w') as f:
        json.dump(state, f, indent=2)
    os.replace(tmp_file, STATE_FILE)

    # Set Ghostty tab title via TTY device
    eff_sid = target or session_id
    if eff_sid in sessions and pid:
        try:
            tty_name = os.popen(f'ps -o tty= -p {pid}').read().strip()
            if tty_name and tty_name != '??':
                s = sessions[eff_sid]
                title = s['project'] + ': ' + s['status']
                fd = os.open(f'/dev/{tty_name}', os.O_WRONLY | os.O_NOCTTY)
                os.write(fd, f'\033]2;{title}\007'.encode())
                os.close(fd)
        except Exception:
            pass

finally:
    fcntl.flock(lock_fd, fcntl.LOCK_UN)
    lock_fd.close()
" <<< "$INPUT"

exit 0
