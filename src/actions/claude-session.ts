import streamDeck, {
  action,
  SingletonAction,
  type KeyDownEvent,
  type KeyUpEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { focusGhosttyWindow } from "../lib/terminal-focus";
import { startWatching, stopWatching, getSessions, removeSession } from "../lib/session-watcher";
import {
  renderSessionButton,
  renderEmptyButton,
  svgToBase64,
} from "../lib/button-renderer";
import { getCurrentSkin, onSkinChange } from "../lib/skin-manager";
import type { SessionSlot } from "../lib/types";

const logger = streamDeck.logger.createScope("ClaudeSession");

@action({ UUID: "com.chris.claude-sessions.session" })
export class ClaudeSessionAction extends SingletonAction {
  static readonly #LONG_PRESS_MS = 1000;

  #refreshTimer: ReturnType<typeof setInterval> | null = null;
  #watcherStarted = false;
  #slotMap = new Map<string, SessionSlot | null>();
  #keyDownAt = new Map<string, number>();
  #unsubSkin: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#watcherStarted) {
      this.#watcherStarted = true;

      startWatching((slots) => {
        logger.info(`watcher: ${slots.length} sessions`);
        this.#updateAllButtons(slots);
      });

      // 5s timer to refresh "Xm ago" display
      this.#refreshTimer = setInterval(() => {
        this.#updateAllButtons(getSessions());
      }, 5000);

      this.#unsubSkin = onSkinChange(() => {
        this.#updateAllButtons(getSessions());
      });
    }
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    // Check if any buttons remain visible
    const contexts = Array.from(this.actions);
    if (contexts.length === 0) {
      this.#cleanup();
    }
  }

  #cleanup(): void {
    stopWatching();
    this.#watcherStarted = false;
    if (this.#refreshTimer) {
      clearInterval(this.#refreshTimer);
      this.#refreshTimer = null;
    }
    if (this.#unsubSkin) {
      this.#unsubSkin();
      this.#unsubSkin = null;
    }
  }

  override onKeyDown(ev: KeyDownEvent): void {
    this.#keyDownAt.set(ev.action.id, Date.now());
  }

  override async onKeyUp(ev: KeyUpEvent): Promise<void> {
    const downAt = this.#keyDownAt.get(ev.action.id);
    this.#keyDownAt.delete(ev.action.id);
    const slot = this.#slotMap.get(ev.action.id);

    const held = downAt ? Date.now() - downAt : 0;

    if (held >= ClaudeSessionAction.#LONG_PRESS_MS && slot) {
      // Long press → delete session
      logger.info("Long-press delete: %s (%s)", slot.sessionId, slot.session.project);
      removeSession(slot.sessionId);
      ev.action.showOk();
      return;
    }

    // Short press → focus terminal
    if (!slot?.session.pid) return;
    try {
      const focused = await focusGhosttyWindow(slot.session.project, slot.session.pid);
      if (focused) {
        ev.action.showOk();
      } else {
        ev.action.showAlert();
      }
    } catch {
      ev.action.showAlert();
    }
  }

  #updateAllButtons(slots: SessionSlot[]): void {
    const buttons = Array.from(this.actions);
    const skin = getCurrentSkin();
    this.#slotMap.clear();

    buttons.forEach((ctx, index) => {
      const slot = index < slots.length ? slots[index] : null;
      this.#slotMap.set(ctx.id, slot);
      const svg = slot ? renderSessionButton(slot, skin) : renderEmptyButton(skin);
      const base64 = svgToBase64(svg);
      ctx.setImage(base64);
    });
  }
}
