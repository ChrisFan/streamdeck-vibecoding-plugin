import streamDeck, {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { startWatching, getSessions } from "../lib/session-watcher";
import {
  getPendingPermissions,
  respondToPermission,
  startWatchingPending,
} from "../lib/permission-ipc";
import {
  renderControlButton,
  svgToBase64,
} from "../lib/button-renderer";
import { getCurrentSkin, onSkinChange } from "../lib/skin-manager";
import type { PendingPermission, SessionSlot, ControlType } from "../lib/types";

const logger = streamDeck.logger.createScope("ClaudeControl");

// Session change listeners (sessions.json — used by Interrupt)
const sessionListeners = new Set<(slots: SessionSlot[]) => void>();
let sessionWatcherRegistered = false;

// Pending change listeners (pending dir — used by Approve/Reject/ApproveAll)
const pendingListeners = new Set<() => void>();
let pendingWatcherRegistered = false;

function ensureSessionWatcher(): void {
  if (!sessionWatcherRegistered) {
    sessionWatcherRegistered = true;
    startWatching((slots) => {
      for (const cb of sessionListeners) cb(slots);
    });
  }
}

function ensurePendingWatcher(): void {
  if (!pendingWatcherRegistered) {
    pendingWatcherRegistered = true;
    startWatchingPending(() => {
      for (const cb of pendingListeners) cb();
    });
  }
}

function findFirstByStatus(
  ...statuses: string[]
): SessionSlot | undefined {
  return getSessions()
    .filter((s) => statuses.includes(s.session.status))
    .sort((a, b) => a.session.last_event - b.session.last_event)[0];
}

/** Cross-reference pending files with sessions.json — only return sessions
 *  that are BOTH pending AND in "permission" status. Prevents stale pending
 *  files from lighting the button and ensures approve targets the right session. */
function getApprovableSessions(): {
  sessionId: string;
  pending: PendingPermission;
}[] {
  const sessions = getSessions().filter(
    (s) => s.session.status === "permission",
  );
  const pending = getPendingPermissions();
  const pendingMap = new Map(pending.map((p) => [p.session_id, p]));
  const results: { sessionId: string; pending: PendingPermission }[] = [];
  for (const s of sessions) {
    const p = pendingMap.get(s.sessionId);
    if (p) results.push({ sessionId: s.sessionId, pending: p });
  }
  return results;
}

function updateControlButtons(
  actions: Iterable<{ setImage(image: string): Promise<void> }>,
  type: ControlType,
  active: boolean,
): void {
  const skin = getCurrentSkin();
  const svg = renderControlButton(type, active, skin);
  const img = svgToBase64(svg);
  for (const ctx of actions) {
    ctx.setImage(img);
  }
}

// ── Approve ─────────────────────────────────────────────

@action({ UUID: "com.chris.claude-sessions.approve" })
export class ApproveAction extends SingletonAction {
  #started = false;
  #unsubSkin: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#started) {
      this.#started = true;
      ensureSessionWatcher();
      ensurePendingWatcher();
      pendingListeners.add(this.#onChange);
      sessionListeners.add(this.#onChange);
      this.#unsubSkin = onSkinChange(() => this.#render());
    }
    this.#render();
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    if (Array.from(this.actions).length === 0) {
      pendingListeners.delete(this.#onChange);
      sessionListeners.delete(this.#onChange);
      this.#started = false;
      this.#unsubSkin?.();
      this.#unsubSkin = null;
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const approvable = getApprovableSessions();
    if (approvable.length === 0) {
      ev.action.showAlert();
      return;
    }
    try {
      respondToPermission(approvable[0].sessionId, "allow");
      ev.action.showOk();
    } catch {
      ev.action.showAlert();
    }
  }

  #onChange = (): void => {
    this.#render();
  };

  #render(): void {
    const active = getApprovableSessions().length > 0;
    updateControlButtons(this.actions, "approve", active);
  }
}

// ── Reject ──────────────────────────────────────────────

@action({ UUID: "com.chris.claude-sessions.reject" })
export class RejectAction extends SingletonAction {
  #started = false;
  #unsubSkin: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#started) {
      this.#started = true;
      ensureSessionWatcher();
      ensurePendingWatcher();
      pendingListeners.add(this.#onChange);
      sessionListeners.add(this.#onChange);
      this.#unsubSkin = onSkinChange(() => this.#render());
    }
    this.#render();
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    if (Array.from(this.actions).length === 0) {
      pendingListeners.delete(this.#onChange);
      sessionListeners.delete(this.#onChange);
      this.#started = false;
      this.#unsubSkin?.();
      this.#unsubSkin = null;
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const approvable = getApprovableSessions();
    if (approvable.length === 0) {
      ev.action.showAlert();
      return;
    }
    try {
      respondToPermission(approvable[0].sessionId, "deny");
      ev.action.showOk();
    } catch {
      ev.action.showAlert();
    }
  }

  #onChange = (): void => {
    this.#render();
  };

  #render(): void {
    const active = getApprovableSessions().length > 0;
    updateControlButtons(this.actions, "reject", active);
  }
}

// ── Interrupt ───────────────────────────────────────────

@action({ UUID: "com.chris.claude-sessions.interrupt" })
export class InterruptAction extends SingletonAction {
  #started = false;
  #unsubSkin: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#started) {
      this.#started = true;
      ensureSessionWatcher();
      sessionListeners.add(this.#onSessionChange);
      this.#unsubSkin = onSkinChange(() => this.#render());
    }
    this.#render();
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    if (Array.from(this.actions).length === 0) {
      sessionListeners.delete(this.#onSessionChange);
      this.#started = false;
      this.#unsubSkin?.();
      this.#unsubSkin = null;
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const target = findFirstByStatus("working", "permission");
    if (!target?.session.pid) {
      ev.action.showAlert();
      return;
    }
    try {
      process.kill(target.session.pid, "SIGINT");
      ev.action.showOk();
    } catch {
      ev.action.showAlert();
    }
  }

  #onSessionChange = (_slots: SessionSlot[]): void => {
    this.#render();
  };

  #render(): void {
    const active = !!findFirstByStatus("working", "permission");
    updateControlButtons(this.actions, "interrupt", active);
  }
}

// ── Approve All ─────────────────────────────────────────

@action({ UUID: "com.chris.claude-sessions.approve-all" })
export class ApproveAllAction extends SingletonAction {
  #started = false;
  #unsubSkin: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#started) {
      this.#started = true;
      ensureSessionWatcher();
      ensurePendingWatcher();
      pendingListeners.add(this.#onChange);
      sessionListeners.add(this.#onChange);
      this.#unsubSkin = onSkinChange(() => this.#render());
    }
    this.#render();
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    if (Array.from(this.actions).length === 0) {
      pendingListeners.delete(this.#onChange);
      sessionListeners.delete(this.#onChange);
      this.#started = false;
      this.#unsubSkin?.();
      this.#unsubSkin = null;
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const approvable = getApprovableSessions();
    if (approvable.length === 0) {
      ev.action.showAlert();
      return;
    }
    let allOk = true;
    for (const a of approvable) {
      try {
        respondToPermission(a.sessionId, "allow");
      } catch {
        allOk = false;
      }
    }
    allOk ? ev.action.showOk() : ev.action.showAlert();
  }

  #onChange = (): void => {
    this.#render();
  };

  #render(): void {
    const active = getApprovableSessions().length > 0;
    updateControlButtons(this.actions, "approve-all", active);
  }
}
