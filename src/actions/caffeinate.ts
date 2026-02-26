import streamDeck, {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { spawn, execSync, type ChildProcess } from "child_process";
import { renderCaffeinateButton, svgToBase64 } from "../lib/button-renderer";
import { getCurrentSkin, onSkinChange } from "../lib/skin-manager";

const logger = streamDeck.logger.createScope("Caffeinate");

@action({ UUID: "com.chris.claude-sessions.caffeinate" })
export class CaffeinateAction extends SingletonAction {
  #proc: ChildProcess | null = null;
  #unsubSkin: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#unsubSkin) {
      this.#unsubSkin = onSkinChange(() => this.#render(!!this.#proc));
    }

    // Sync state with any existing caffeinate process
    if (!this.#proc) {
      try {
        const pid = execSync("pgrep -x caffeinate", { encoding: "utf8" }).trim();
        if (pid) {
          logger.info("Found existing caffeinate process: %s", pid);
          // We didn't spawn it, so just track the active state
          this.#render(true);
          return;
        }
      } catch {
        // pgrep returns non-zero when no match — not an error
      }
    }
    this.#render(!!this.#proc);
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    // Intentionally do NOT kill caffeinate here.
    // Screen lock triggers preview profile → onWillDisappear for all buttons.
    // Caffeinate should only stop on explicit user key press.
    if (Array.from(this.actions).length === 0 && this.#unsubSkin) {
      this.#unsubSkin();
      this.#unsubSkin = null;
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (this.#proc) {
      // Active → kill it
      this.#proc.kill();
      this.#proc = null;
      logger.info("Caffeinate stopped by user");
      this.#render(false);
      ev.action.showOk();
    } else {
      // Check if an external caffeinate is running
      let externalPid: number | null = null;
      try {
        const out = execSync("pgrep -x caffeinate", { encoding: "utf8" }).trim();
        if (out) externalPid = parseInt(out.split("\n")[0], 10);
      } catch {
        // No existing process
      }

      if (externalPid) {
        // Kill the external one so we can own the lifecycle
        try {
          process.kill(externalPid, "SIGTERM");
        } catch {
          // Already gone
        }
      }

      // Spawn new caffeinate
      const proc = spawn("caffeinate", ["-di"], {
        stdio: "ignore",
        detached: true,
      });
      proc.unref();
      this.#proc = proc;
      logger.info("Caffeinate started, pid=%d", proc.pid);

      proc.on("exit", () => {
        if (this.#proc === proc) {
          this.#proc = null;
          logger.info("Caffeinate exited externally");
          this.#render(false);
        }
      });

      this.#render(true);
      ev.action.showOk();
    }
  }

  #render(active: boolean): void {
    const skin = getCurrentSkin();
    const svg = renderCaffeinateButton(active, skin);
    const img = svgToBase64(svg);
    for (const ctx of this.actions) {
      ctx.setImage(img);
    }
  }
}
