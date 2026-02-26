import { readFileSync, statSync, watch, type FSWatcher } from "fs";
import { execFileSync } from "child_process";
import { homedir } from "os";
import path from "path";
import type { SessionsState, SessionSlot } from "./types";

const STATE_DIR = path.join(homedir(), ".claude", "hooks", "streamdeck");
const STATE_FILE = path.join(STATE_DIR, "sessions.json");
const POLL_INTERVAL = 2000;

type ChangeCallback = (slots: SessionSlot[]) => void;

let watcher: FSWatcher | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastMtime = 0;
let listeners: ChangeCallback[] = [];
let started = false;

function readSessions(): SessionsState {
  try {
    const raw = readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(raw) as SessionsState;
  } catch {
    return { version: 1, updated_at: 0, sessions: {} };
  }
}

function getMtime(): number {
  try {
    return statSync(STATE_FILE).mtimeMs;
  } catch {
    return 0;
  }
}

export function getSessions(): SessionSlot[] {
  const state = readSessions();

  // Show ALL sessions from sessions.json — no timeout filtering.
  // Sessions are removed by: SessionEnd hook, or manual long-press deletion.
  const entries = Object.entries(state.sessions)
    .sort(([, a], [, b]) => a.started_at - b.started_at);

  return entries.map(([id, session]) => ({ sessionId: id, session }));
}

/**
 * Remove a session from sessions.json atomically (with file locking).
 * Uses the same fcntl.flock mechanism as hook.sh to prevent races.
 */
export function removeSession(sessionId: string): void {
  try {
    execFileSync("python3", ["-c", `
import json, os, fcntl
STATE_DIR = os.path.expanduser('~/.claude/hooks/streamdeck')
STATE_FILE = os.path.join(STATE_DIR, 'sessions.json')
LOCK_FILE = os.path.join(STATE_DIR, '.lock')
sid = os.environ['SD_REMOVE_SID']
lock_fd = open(LOCK_FILE, 'w')
fcntl.flock(lock_fd, fcntl.LOCK_EX)
try:
    with open(STATE_FILE, 'r') as f:
        state = json.load(f)
    if sid in state.get('sessions', {}):
        del state['sessions'][sid]
        state['updated_at'] = __import__('time').time()
        tmp = STATE_FILE + '.tmp'
        with open(tmp, 'w') as f:
            json.dump(state, f, indent=2)
        os.replace(tmp, STATE_FILE)
finally:
    fcntl.flock(lock_fd, fcntl.LOCK_UN)
    lock_fd.close()
`], { env: { ...process.env, SD_REMOVE_SID: sessionId } });
  } catch {
    // Best effort — if lock/write fails, session stays until next SessionEnd
  }
}

function checkAndNotify(): void {
  const mtime = getMtime();
  if (mtime !== lastMtime) {
    lastMtime = mtime;
    const slots = getSessions();
    for (const cb of listeners) {
      cb(slots);
    }
  }
}

export function startWatching(callback: ChangeCallback): void {
  listeners.push(callback);

  if (started) return;
  started = true;

  // Initial read
  lastMtime = getMtime();
  callback(getSessions());

  // fs.watch on directory (catches atomic rename)
  try {
    watcher = watch(STATE_DIR, (eventType, filename) => {
      if (filename === "sessions.json" || filename === "sessions.json.tmp") {
        checkAndNotify();
      }
    });
    watcher.on("error", () => {
      // Silently ignore — polling fallback covers us
    });
  } catch {
    // Directory may not exist yet
  }

  // Polling fallback
  pollTimer = setInterval(checkAndNotify, POLL_INTERVAL);
}

export function stopWatching(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  listeners = [];
  started = false;
}
