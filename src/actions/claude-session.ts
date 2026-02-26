import streamDeck, {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { focusGhosttyWindow } from "../lib/terminal-focus";
import { startWatching, stopWatching, getSessions } from "../lib/session-watcher";
import {
  renderSessionButton,
  renderEmptyButton,
  svgToBase64,
} from "../lib/button-renderer";
import type { SessionSlot } from "../lib/types";

const logger = streamDeck.logger.createScope("ClaudeSession");

@action({ UUID: "com.chris.claude-sessions.session" })
export class ClaudeSessionAction extends SingletonAction {
  #refreshTimer: ReturnType<typeof setInterval> | null = null;
  #watcherStarted = false;
  #slotMap = new Map<string, SessionSlot | null>();

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
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const slot = this.#slotMap.get(ev.action.id);
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
    this.#slotMap.clear();

    buttons.forEach((ctx, index) => {
      const slot = index < slots.length ? slots[index] : null;
      this.#slotMap.set(ctx.id, slot);
      const svg = slot ? renderSessionButton(slot) : renderEmptyButton();
      const base64 = svgToBase64(svg);
      ctx.setImage(base64);
    });
  }
}
