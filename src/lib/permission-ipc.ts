import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  renameSync,
  unlinkSync,
  watch,
  type FSWatcher,
} from "fs";
import { homedir } from "os";
import path from "path";
import type { PendingPermission } from "./types";

const STATE_DIR = path.join(homedir(), ".claude", "hooks", "streamdeck");
const PENDING_DIR = path.join(STATE_DIR, "pending");
const RESPONSES_DIR = path.join(STATE_DIR, "responses");

type ChangeCallback = () => void;

let watcher: FSWatcher | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let listeners: ChangeCallback[] = [];
let started = false;

/** Read all pending permission requests from the pending directory. */
export function getPendingPermissions(): PendingPermission[] {
  try {
    const files = readdirSync(PENDING_DIR).filter((f) => f.endsWith(".json"));
    const results: PendingPermission[] = [];
    for (const f of files) {
      try {
        const raw = readFileSync(path.join(PENDING_DIR, f), "utf-8");
        results.push(JSON.parse(raw) as PendingPermission);
      } catch {
        // Corrupt or mid-write — skip
      }
    }
    return results.sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return [];
  }
}

/** Write a response file for a permission gate to pick up (atomic: tmp + rename). */
export function respondToPermission(
  sessionId: string,
  action: "allow" | "deny",
): void {
  mkdirSync(RESPONSES_DIR, { recursive: true });
  const response = { action, timestamp: Date.now() / 1000 };
  const tmpFile = path.join(RESPONSES_DIR, `${sessionId}.json.tmp`);
  const finalFile = path.join(RESPONSES_DIR, `${sessionId}.json`);
  writeFileSync(tmpFile, JSON.stringify(response));
  renameSync(tmpFile, finalFile);
  // Also delete pending file to immediately update button state
  try {
    unlinkSync(path.join(PENDING_DIR, `${sessionId}.json`));
  } catch {
    // Already removed or never existed
  }
}

/** Watch the pending directory for changes and invoke callbacks. */
export function startWatchingPending(callback: ChangeCallback): void {
  listeners.push(callback);

  if (started) return;
  started = true;

  mkdirSync(PENDING_DIR, { recursive: true });

  // Initial callback
  callback();

  // fs.watch on pending directory
  try {
    watcher = watch(PENDING_DIR, () => {
      for (const cb of listeners) cb();
    });
    watcher.on("error", () => {
      // Silently ignore — polling fallback covers us
    });
  } catch {
    // Directory may not exist yet
  }

  // Polling fallback
  pollTimer = setInterval(() => {
    for (const cb of listeners) cb();
  }, 2000);
}
