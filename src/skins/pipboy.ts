import type { Skin } from "../lib/types";

const ICONS = {
  computing: `<path d="M6,0 h4 v2 h-4 z M5,2 h6 v2 h-6 z M4,4 h8 v2 h-8 z M3,6 h10 v2 h-10 z M2,8 h12 v2 h-12 z M1,10 h14 v2 h-14 z M2,12 h12 v2 h-12 z M3,14 h10 v2 h-10 z" fill="#33ff33" opacity="0.8"/><circle cx="8" cy="8" r="3" fill="#000000"/><path d="M8,8 l-3,3 M8,8 l3,3 M8,8 v-4" stroke="#000000" stroke-width="2"/>`,
  standby: `<path d="M4,12 h8 v2 h-8 z" fill="#33ff33"/><path d="M4,12 h8 v2 h-8 z" fill="#33ff33" opacity="0.5" transform="translate(0, -10)"/>`, // Cursor
  override: `<path d="M7,0 h2 v2 h-2 z M6,2 h4 v2 h-4 z M5,4 h6 v2 h-6 z M4,6 h8 v2 h-8 z M3,8 h10 v2 h-10 z M2,10 h12 v2 h-12 z M1,12 h14 v2 h-14 z M0,14 h16 v2 h-16 z" fill="#ffaa00"/><path d="M7,4 h2 v6 h-2 z M7,12 h2 v2 h-2 z" fill="#000000"/>`,
  empty: `<rect x="2" y="4" width="12" height="8" fill="#113311"/><rect x="4" y="6" width="8" height="4" fill="#000000"/>`,
  thumb: `<path d="M2,8 h4 v8 h-4 z M6,6 h2 v2 h-2 z M8,4 h2 v2 h-2 z M10,4 h2 v6 h-2 z M12,6 h2 v4 h-2 z M6,16 h6 v-2 h-6 z M10,10 h4 v-2 h-4 z" fill="#33ff33"/>`,
  skull: `<path d="M4,2 h8 v2 h-8 z M2,4 h12 v6 h-12 z M0,6 h16 v4 h-16 z M2,10 h12 v2 h-12 z M4,12 h8 v4 h-8 z" fill="#33ff33"/><rect x="4" y="6" width="2" height="2" fill="#000000"/><rect x="10" y="6" width="2" height="2" fill="#000000"/><rect x="7" y="10" width="2" height="2" fill="#000000"/><path d="M5,13 h6 v2 h-6 z" fill="#000000"/>`,
  shield: `<path d="M2,2 h12 v8 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#33ff33"/><path d="M2,2 h12 v2 h-12 z" fill="#115511"/><path d="M7,4 h2 v6 h-2 z M5,6 h6 v2 h-6 z" fill="#000000"/>`,
  allok: `<g transform="translate(-14, 0)"><path d="M2,8 h4 v8 h-4 z M6,6 h2 v2 h-2 z M8,4 h2 v2 h-2 z M10,4 h2 v6 h-2 z M12,6 h2 v4 h-2 z M6,16 h6 v-2 h-6 z M10,10 h4 v-2 h-4 z" fill="#33ff33"/></g><g transform="translate(0, 0)"><path d="M2,8 h4 v8 h-4 z M6,6 h2 v2 h-2 z M8,4 h2 v2 h-2 z M10,4 h2 v6 h-2 z M12,6 h2 v4 h-2 z M6,16 h6 v-2 h-6 z M10,10 h4 v-2 h-4 z" fill="#33ff33"/></g><g transform="translate(14, 0)"><path d="M2,8 h4 v8 h-4 z M6,6 h2 v2 h-2 z M8,4 h2 v2 h-2 z M10,4 h2 v6 h-2 z M12,6 h2 v4 h-2 z M6,16 h6 v-2 h-6 z M10,10 h4 v-2 h-4 z" fill="#33ff33"/></g>`,
  coffee: `<path d="M4,4 h8 v10 h-8 z" fill="#33ff33"/><path d="M12,6 h2 v4 h-2 z" fill="#33ff33"/><path d="M13,8 h1 v1 h-1 z" fill="#000000"/><path d="M6,0 h2 v2 h-2 z M10,0 h2 v2 h-2 z M7,2 h1 v1 h-1 z M11,2 h1 v1 h-1 z" fill="#33ff33"/>`,
  terminal: `<rect x="1" y="2" width="14" height="10" fill="#113311"/><rect x="0" y="1" width="16" height="12" fill="none" stroke="#33ff33" stroke-width="2"/><path d="M3,4 l3,3 l-3,3" stroke="#33ff33" stroke-width="2" fill="none"/><rect x="7" y="9" width="4" height="2" fill="#33ff33"/>`,
};

// Colors inspired by CRT monitors / Fallout Pip-Boy
const GREEN = "#33ff33";
const GREEN_DIM = "#1a801a";
const GREEN_DARK = "#0a330a";
const BLACK = "#050505";
const AMBER = "#ffaa00";
const AMBER_DIM = "#805500";
const AMBER_DARK = "#332200";

export const pipboySkin: Skin = {
  id: "pipboy",
  name: "PIP-BOY",

  statusColors: {
    working: { bg: GREEN_DARK, text: GREEN, border: GREEN_DIM, subtext: GREEN_DIM, highlight: GREEN_DIM },
    idle: { bg: BLACK, text: GREEN_DIM, border: GREEN_DARK, subtext: GREEN_DARK, highlight: GREEN_DARK },
    permission: { bg: AMBER_DARK, text: AMBER, border: AMBER_DIM, subtext: AMBER_DIM, highlight: AMBER_DIM },
  },

  statusLabels: {
    working: "COMPUTING",
    idle: "STANDBY",
    permission: "OVERRIDE",
  },

  statusIcons: {
    working: ICONS.computing,
    idle: ICONS.standby,
    permission: ICONS.override,
  },

  empty: {
    colors: { bg: BLACK, text: "#222222", border: "#111111", subtext: "#111111", highlight: "#1a1a1a" },
    icon: ICONS.empty,
    label: "NO DATA",
  },

  controlColors: {
    active: { bg: GREEN_DARK, text: GREEN, border: GREEN_DIM, subtext: GREEN_DIM, highlight: GREEN_DIM },
    inactive: { bg: BLACK, text: "#333333", border: "#111111", subtext: "#222222", highlight: "#1a1a1a" },
  },

  controls: {
    approve: { icon: ICONS.thumb, label: "APPROVE" },
    reject: { icon: ICONS.skull, label: "REJECT" },
    interrupt: { icon: ICONS.shield, label: "HALT" },
    "approve-all": { icon: ICONS.allok, label: "ALL OK" },
  },

  caffeinate: {
    icon: ICONS.coffee,
    activeLabel: "AWAKE",
    inactiveLabel: "SLEEP OK",
    active: { bg: AMBER_DARK, text: AMBER, border: AMBER_DIM, subtext: AMBER_DIM, highlight: AMBER_DIM },
    inactive: { bg: BLACK, text: "#333333", border: "#111111", subtext: "#222222", highlight: "#1a1a1a" },
  },

  toggle: {
    colors: { bg: GREEN_DARK, text: GREEN, border: GREEN_DIM, subtext: GREEN_DIM, highlight: GREEN_DIM },
    icon: ICONS.terminal,
  },
};
