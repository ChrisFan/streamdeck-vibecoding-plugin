import { readFileSync, statSync, watch, type FSWatcher } from "fs";
import { homedir } from "os";
import path from "path";
import type { SessionsState, SessionSlot } from "./types";

const STATE_DIR = path.join(homedir(), ".claude", "hooks", "streamdeck");
const STATE_FILE = path.join(STATE_DIR, "sessions.json");
const POLL_INTERVAL = 2000;
const ZOMBIE_TIMEOUT = 600; // 10 minutes in seconds

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

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e: unknown) {
    // Only ESRCH (no such process) means definitely dead.
    // Any other error (EPERM, sandbox restrictions, etc.) → assume alive.
    return (e as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

export function getSessions(): SessionSlot[] {
  const state = readSessions();
  const now = Date.now() / 1000;

  // Filter zombies and dead PIDs client-side
  // If PID is alive, always show (regardless of last_event age)
  // If PID is dead/missing, use zombie timeout as cleanup
  const entries = Object.entries(state.sessions)
    .filter(([, s]) => {
      if (s.pid && isPidAlive(s.pid)) return true;
      return now - s.last_event < ZOMBIE_TIMEOUT;
    })
    .sort(([, a], [, b]) => a.started_at - b.started_at);

  return entries.map(([id, session]) => ({ sessionId: id, session }));
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
