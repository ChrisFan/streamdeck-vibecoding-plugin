import streamDeck from "@elgato/streamdeck";
import type { Skin } from "./types";
import { SKINS, DEFAULT_SKIN, getSkinById } from "../skins";

let currentSkin: Skin = DEFAULT_SKIN;
const listeners = new Set<(skin: Skin) => void>();

export function getCurrentSkin(): Skin {
  return currentSkin;
}

export async function cycleNextSkin(): Promise<Skin> {
  const idx = SKINS.findIndex((s) => s.id === currentSkin.id);
  const next = SKINS[(idx + 1) % SKINS.length];
  currentSkin = next;
  await streamDeck.settings.setGlobalSettings({ skinId: next.id });
  notifyListeners();
  return next;
}

export function onSkinChange(cb: (skin: Skin) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(): void {
  for (const cb of listeners) cb(currentSkin);
}

export async function initSkinManager(): Promise<void> {
  const settings = await streamDeck.settings.getGlobalSettings<{ skinId?: string }>();
  if (settings.skinId) {
    const restored = getSkinById(settings.skinId);
    if (restored.id !== currentSkin.id) {
      currentSkin = restored;
      notifyListeners();
    }
  }
}
