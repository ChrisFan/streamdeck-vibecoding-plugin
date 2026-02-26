#!/bin/bash
# permission-gate: Blocking hook for Stream Deck approve/deny via file IPC
# Registered for PermissionRequest only. Writes pending file, polls for response.
set -uo pipefail

INPUT=$(cat)

python3 -c "
import sys, json, os, time, atexit, fcntl

STATE_DIR = os.path.expanduser('~/.claude/hooks/streamdeck')
PENDING_DIR = os.path.join(STATE_DIR, 'pending')
RESPONSES_DIR = os.path.join(STATE_DIR, 'responses')
LOG_FILE = os.path.join(STATE_DIR, 'debug.log')
POLL_INTERVAL = 0.2
TIMEOUT = 120

event_data = json.loads(sys.stdin.read())
session_id = event_data.get('session_id', '')
perm_mode = event_data.get('permission_mode', '')

# Filter out delegate (agent) sub-sessions
if perm_mode == 'delegate':
    sys.exit(0)

if not session_id:
    sys.exit(0)

# UI-interactive tools: user handles these in CC UI, not via Stream Deck
UI_TOOLS = {'ExitPlanMode', 'AskUserQuestion', 'EnterPlanMode'}
tool = event_data.get('tool_name', '')
if tool in UI_TOOLS:
    sys.exit(0)

os.makedirs(PENDING_DIR, exist_ok=True)
os.makedirs(RESPONSES_DIR, exist_ok=True)

pending_file = os.path.join(PENDING_DIR, session_id + '.json')
response_file = os.path.join(RESPONSES_DIR, session_id + '.json')

pending = {
    'session_id': session_id,
    'tool_name': tool,
    'tool_input': event_data.get('tool_input', {}),
    'timestamp': time.time(),
}
tmp = pending_file + '.tmp'
with open(tmp, 'w') as f:
    json.dump(pending, f)
os.replace(tmp, pending_file)

now = time.time()
with open(LOG_FILE, 'a') as lf:
    lf.write('{} gate: pending sid={} tool={}\n'.format(now, session_id[:8], tool))

def cleanup():
    try:
        os.unlink(pending_file)
    except FileNotFoundError:
        pass

atexit.register(cleanup)

# SIGTERM handler: Python default SIGTERM exits without running atexit
import signal
def sigterm_handler(signum, frame):
    cleanup()
    sys.exit(0)
signal.signal(signal.SIGTERM, sigterm_handler)

# Prevent consuming stale responses from a previous gate cycle
try:
    os.unlink(response_file)
except FileNotFoundError:
    pass

start = time.time()
while time.time() - start < TIMEOUT:
    try:
        with open(response_file, 'r') as f:
            resp = json.load(f)
        try:
            os.unlink(response_file)
        except FileNotFoundError:
            pass
        cleanup()
        atexit.unregister(cleanup)

        action = resp.get('action', '')
        if action == 'allow':
            output = {
                'hookSpecificOutput': {
                    'hookEventName': 'PermissionRequest',
                    'decision': {'behavior': 'allow'}
                }
            }
        elif action == 'deny':
            output = {
                'hookSpecificOutput': {
                    'hookEventName': 'PermissionRequest',
                    'decision': {
                        'behavior': 'deny',
                        'message': 'Denied via Stream Deck'
                    }
                }
            }
        else:
            sys.exit(0)

        # Update sessions.json: permission resolved -> working
        try:
            state_file = os.path.join(STATE_DIR, 'sessions.json')
            lock_fp = os.path.join(STATE_DIR, '.lock')
            lfd = open(lock_fp, 'w')
            fcntl.flock(lfd, fcntl.LOCK_EX)
            try:
                with open(state_file, 'r') as sf:
                    st = json.load(sf)
                ss = st.get('sessions', {})
                if session_id in ss:
                    ss[session_id]['status'] = 'working'
                    ss[session_id]['last_event'] = time.time()
                    ss[session_id]['last_event_type'] = 'PermissionResolved'
                    st['updated_at'] = time.time()
                    tmp_sf = state_file + '.tmp'
                    with open(tmp_sf, 'w') as wf:
                        json.dump(st, wf, indent=2)
                    os.replace(tmp_sf, state_file)
            finally:
                fcntl.flock(lfd, fcntl.LOCK_UN)
                lfd.close()
        except Exception:
            pass

        with open(LOG_FILE, 'a') as lf:
            lf.write('{} gate: responded sid={} action={}\n'.format(time.time(), session_id[:8], action))
        print(json.dumps(output))
        sys.exit(0)

    except (FileNotFoundError, json.JSONDecodeError):
        pass

    time.sleep(POLL_INTERVAL)

with open(LOG_FILE, 'a') as lf:
    lf.write('{} gate: timeout sid={}\n'.format(time.time(), session_id[:8]))
cleanup()
atexit.unregister(cleanup)
sys.exit(0)
" <<< "$INPUT"

exit 0
