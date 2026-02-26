import type { Skin } from "../lib/types";
import { rpgSkin } from "./rpg";
import { pipboySkin } from "./pipboy";
import { evaSkin } from "./eva";
import { minecraftSkin } from "./minecraft";
import { matrixSkin } from "./matrix";

export const SKINS: readonly Skin[] = [rpgSkin, pipboySkin, evaSkin, minecraftSkin, matrixSkin];
export const DEFAULT_SKIN = SKINS[0];

export function getSkinById(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? DEFAULT_SKIN;
}
