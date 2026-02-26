import type { Skin } from "../lib/types";

const ICONS = {
  pickaxe: `<path d="M0,14 l2,2 l14,-14 l-2,-2 z" fill="#8b5a2b"/><path d="M10,0 l6,0 l0,6 l-4,-2 l-2,-4 z" fill="#00ffff"/><path d="M12,2 l2,0 l0,2 l-2,-2 z" fill="#ffffff"/>`,
  crafting: `<rect x="2" y="4" width="12" height="12" fill="#8b5a2b"/><rect x="2" y="0" width="12" height="4" fill="#cd853f"/><rect x="4" y="2" width="2" height="2" fill="#5c3a21"/><rect x="10" y="2" width="2" height="2" fill="#5c3a21"/><rect x="4" y="8" width="8" height="2" fill="#5c3a21"/><rect x="4" y="12" width="2" height="4" fill="#5c3a21"/><rect x="10" y="12" width="2" height="4" fill="#5c3a21"/>`,
  creeper: `<rect x="2" y="2" width="12" height="12" fill="#32cd32"/><rect x="4" y="4" width="2" height="2" fill="#000000"/><rect x="10" y="4" width="2" height="2" fill="#000000"/><rect x="6" y="8" width="4" height="6" fill="#000000"/><rect x="4" y="10" width="2" height="4" fill="#000000"/><rect x="10" y="10" width="2" height="4" fill="#000000"/>`,
  empty: `<path d="M2,4 h12 v8 h-12 z" fill="#555555" stroke="#333333" stroke-width="2"/>`,
  emerald: `<path d="M4,0 h8 l4,4 v8 l-4,4 h-8 l-4,-4 v-8 z" fill="#32cd32"/><path d="M6,2 h4 l2,2 v8 l-2,2 h-4 l-2,-2 v-8 z" fill="#98fb98"/><path d="M8,4 h2 v4 h-2 z" fill="#ffffff"/>`,
  tnt: `<rect x="2" y="2" width="12" height="12" fill="#ff0000"/><rect x="2" y="6" width="12" height="4" fill="#ffffff"/><text x="8" y="9.5" font-family="sans-serif" font-size="4" font-weight="bold" fill="#000" text-anchor="middle">TNT</text>`,
  barrier: `<rect x="2" y="2" width="12" height="12" fill="#333333"/><line x1="4" y1="4" x2="12" y2="12" stroke="#ff0000" stroke-width="2"/><line x1="12" y1="4" x2="4" y2="12" stroke="#ff0000" stroke-width="2"/>`,
  emeralds: `<g transform="translate(-14, 0)"><path d="M4,2 h8 l2,2 v8 l-2,2 h-8 l-2,-2 v-8 z" fill="#32cd32"/></g><g transform="translate(0, 0)"><path d="M4,2 h8 l2,2 v8 l-2,2 h-8 l-2,-2 v-8 z" fill="#32cd32"/></g><g transform="translate(14, 0)"><path d="M4,2 h8 l2,2 v8 l-2,2 h-8 l-2,-2 v-8 z" fill="#32cd32"/></g>`,
  furnace: `<rect x="2" y="2" width="12" height="12" fill="#777777"/><rect x="4" y="8" width="8" height="4" fill="#222222"/><rect x="6" y="10" width="4" height="2" fill="#ff4500"/><rect x="4" y="4" width="8" height="2" fill="#555555"/>`,
  grass: `<rect x="2" y="6" width="12" height="8" fill="#8b5a2b"/><rect x="2" y="2" width="12" height="4" fill="#32cd32"/><path d="M2,6 v2 h2 v-2 h2 v2 h2 v-2 h2 v2 h2 v-2 h2 v-2 h-12 z" fill="#32cd32"/>`,
};

export const minecraftSkin: Skin = {
  id: "minecraft",
  name: "BLOCKS",

  statusColors: {
    working: { bg: "#4682b4", text: "#ffffff", border: "#1e90ff", subtext: "#b0e0e6", highlight: "#87ceeb" }, // Diamond blue
    idle: { bg: "#8b5a2b", text: "#ffffff", border: "#5c3a21", subtext: "#deb887", highlight: "#a0522d" }, // Dirt/Wood brown
    permission: { bg: "#228b22", text: "#ffffff", border: "#006400", subtext: "#90ee90", highlight: "#32cd32" }, // Creeper green
  },

  statusLabels: {
    working: "MINING",
    idle: "CRAFTING",
    permission: "CREEPER!",
  },

  statusIcons: {
    working: ICONS.pickaxe,
    idle: ICONS.crafting,
    permission: ICONS.creeper,
  },

  empty: {
    colors: { bg: "#333333", text: "#777777", border: "#111111", subtext: "#555555", highlight: "#444444" }, // Stone
    icon: ICONS.empty,
    label: "NO DATA",
  },

  controlColors: {
    active: { bg: "#a9a9a9", text: "#ffffff", border: "#696969", subtext: "#d3d3d3", highlight: "#dcdcdc" }, // Stone slab
    inactive: { bg: "#222222", text: "#555555", border: "#000000", subtext: "#333333", highlight: "#333333" }, // Obsidian
  },

  controls: {
    approve: { icon: ICONS.emerald, label: "ACCEPT" },
    reject: { icon: ICONS.tnt, label: "REJECT" },
    interrupt: { icon: ICONS.barrier, label: "BLOCK" },
    "approve-all": { icon: ICONS.emeralds, label: "ALL OK" },
  },

  caffeinate: {
    icon: ICONS.furnace,
    activeLabel: "BURNING",
    inactiveLabel: "COLD",
    active: { bg: "#8b0000", text: "#ffd700", border: "#800000", subtext: "#ff8c00", highlight: "#b22222" }, // Netherrack/Fire
    inactive: { bg: "#222222", text: "#555555", border: "#000000", subtext: "#333333", highlight: "#333333" },
  },

  toggle: {
    colors: { bg: "#8b5a2b", text: "#32cd32", border: "#5c3a21", subtext: "#deb887", highlight: "#a0522d" },
    icon: ICONS.grass,
  },
};
