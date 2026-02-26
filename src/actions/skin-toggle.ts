import {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { getCurrentSkin, cycleNextSkin, onSkinChange } from "../lib/skin-manager";
import { renderSkinToggleButton, svgToBase64 } from "../lib/button-renderer";

@action({ UUID: "com.chris.claude-sessions.skin-toggle" })
export class SkinToggleAction extends SingletonAction {
  #unsubscribe: (() => void) | null = null;

  override onWillAppear(_ev: WillAppearEvent): void {
    if (!this.#unsubscribe) {
      this.#unsubscribe = onSkinChange(() => this.#render());
    }
    this.#render();
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    if (Array.from(this.actions).length === 0 && this.#unsubscribe) {
      this.#unsubscribe();
      this.#unsubscribe = null;
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    await cycleNextSkin();
  }

  #render(): void {
    const skin = getCurrentSkin();
    const svg = renderSkinToggleButton(skin);
    const img = svgToBase64(svg);
    for (const ctx of this.actions) {
      ctx.setImage(img);
    }
  }
}
