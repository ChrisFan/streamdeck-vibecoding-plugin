import type { Skin } from "../lib/types";

const ICONS = {
  sync: `<path d="M4,2 h2 v12 h-2 z M10,2 h2 v12 h-2 z M6,6 h4 v4 h-4 z M2,4 h2 v2 h-2 z M12,4 h2 v2 h-2 z M2,10 h2 v2 h-2 z M12,10 h2 v2 h-2 z" fill="#39ff14"/>`,
  cable: `<path d="M6,0 h4 v6 h-4 z M7,6 h2 v10 h-2 z M4,2 h8 v2 h-8 z" fill="#ff4d00"/>`,
  emergency: `<path d="M8,0 l8,4 v8 l-8,4 l-8,-4 v-8 z" fill="#ff003c"/><path d="M7,3 h2 v6 h-2 z M7,11 h2 v2 h-2 z" fill="#ffffff"/>`,
  empty: `<path d="M8,4 l6,3 v2 l-6,3 l-6,-3 v-2 z" fill="#222222" stroke="#444444" stroke-width="1"/>`,
  atfield: `<path d="M8,0 l8,8 l-8,8 l-8,-8 z" fill="#e0aaff" opacity="0.8"/><path d="M8,2 l6,6 l-6,6 l-6,-6 z" fill="#b026ff" opacity="0.6"/><path d="M8,4 l4,4 l-4,4 l-4,-4 z" fill="#ffffff" opacity="0.9"/>`,
  cut: `<path d="M6,0 h4 v4 h-4 z M4,2 h8 v2 h-8 z M2,10 h4 v6 h-4 z M10,10 h4 v6 h-4 z M4,12 h8 v2 h-8 z" fill="#ff003c"/><path d="M0,8 h16 v2 h-16 z" fill="#ffffff" opacity="0.8"/>`,
  stop: `<rect x="2" y="2" width="12" height="12" fill="#ff003c"/><rect x="4" y="4" width="8" height="8" fill="#000000"/><rect x="6" y="6" width="4" height="4" fill="#ff003c"/>`,
  allclear: `<g transform="translate(-14, 0)"><path d="M8,0 l8,8 l-8,8 l-8,-8 z" fill="#e0aaff" opacity="0.8"/><path d="M8,2 l6,6 l-6,6 l-6,-6 z" fill="#b026ff" opacity="0.6"/></g><g transform="translate(0, 0)"><path d="M8,0 l8,8 l-8,8 l-8,-8 z" fill="#e0aaff" opacity="0.8"/><path d="M8,2 l6,6 l-6,6 l-6,-6 z" fill="#b026ff" opacity="0.6"/></g><g transform="translate(14, 0)"><path d="M8,0 l8,8 l-8,8 l-8,-8 z" fill="#e0aaff" opacity="0.8"/><path d="M8,2 l6,6 l-6,6 l-6,-6 z" fill="#b026ff" opacity="0.6"/></g>`,
  battery: `<rect x="4" y="2" width="8" height="12" fill="#ff4d00"/><rect x="6" y="0" width="4" height="2" fill="#777777"/><rect x="6" y="4" width="4" height="8" fill="#39ff14"/>`,
  nerv: `<path d="M0,0 h16 v8 h-16 z" fill="#000000"/><path d="M2,2 h12 v4 h-12 z" fill="#ff003c"/><path d="M4,3 h8 v2 h-8 z" fill="#ffffff"/>`,
};

const PURPLE = "#5b009e";
const PURPLE_DIM = "#320059";
const PURPLE_DARK = "#19002e";
const NEON_GREEN = "#39ff14";
const NEON_GREEN_DIM = "#1f8a0b";
const ORANGE = "#ff4d00";
const ORANGE_DIM = "#992e00";
const RED = "#ff003c";
const RED_DIM = "#80001e";
const BLACK = "#0a0a0a";
const WHITE = "#ffffff";

export const evaSkin: Skin = {
  id: "eva",
  name: "MAGI",

  statusColors: {
    working: { bg: PURPLE_DIM, text: NEON_GREEN, border: PURPLE, subtext: NEON_GREEN_DIM, highlight: PURPLE },
    idle: { bg: BLACK, text: ORANGE, border: ORANGE_DIM, subtext: ORANGE_DIM, highlight: "#222222" },
    permission: { bg: RED_DIM, text: WHITE, border: RED, subtext: "#ffb3c6", highlight: RED },
  },

  statusLabels: {
    working: "SYNCHRONIZING",
    idle: "UMBILICAL",
    permission: "EMERGENCY",
  },

  statusIcons: {
    working: ICONS.sync,
    idle: ICONS.cable,
    permission: ICONS.emergency,
  },

  empty: {
    colors: { bg: BLACK, text: "#333333", border: "#111111", subtext: "#222222", highlight: "#1a1a1a" },
    icon: ICONS.empty,
    label: "NO DATA",
  },

  controlColors: {
    active: { bg: BLACK, text: NEON_GREEN, border: NEON_GREEN_DIM, subtext: NEON_GREEN_DIM, highlight: "#222222" },
    inactive: { bg: BLACK, text: "#444444", border: "#1a1a1a", subtext: "#222222", highlight: "#111111" },
  },

  controls: {
    approve: { icon: ICONS.atfield, label: "CLEAR" },
    reject: { icon: ICONS.cut, label: "ABORT" },
    interrupt: { icon: ICONS.stop, label: "FREEZE" },
    "approve-all": { icon: ICONS.allclear, label: "ALL CLEAR" },
  },

  caffeinate: {
    icon: ICONS.battery,
    activeLabel: "INTERNAL",
    inactiveLabel: "EXTERNAL",
    active: { bg: RED_DIM, text: WHITE, border: RED, subtext: "#ffb3c6", highlight: RED },
    inactive: { bg: BLACK, text: "#444444", border: "#1a1a1a", subtext: "#222222", highlight: "#111111" },
  },

  toggle: {
    colors: { bg: BLACK, text: ORANGE, border: ORANGE_DIM, subtext: ORANGE_DIM, highlight: "#222222" },
    icon: ICONS.nerv,
  },
};
