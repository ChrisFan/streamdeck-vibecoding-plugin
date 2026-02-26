import type { Skin } from "../lib/types";

const PIXEL_ICONS = {
  sword: `<path d="M7,0 h2 v10 h-2 z" fill="#e2ecf5"/><path d="M4,10 h8 v2 h-8 z M3,12 h2 v2 h-2 z M11,12 h2 v2 h-2 z" fill="#3a8cc7"/><path d="M7,12 h2 v4 h-2 z" fill="#e2b822"/><path d="M6,16 h4 v2 h-4 z" fill="#3a8cc7"/>`,
  tent: `<path d="M7,2 h2 v2 h-2 z M6,4 h4 v2 h-4 z M4,6 h8 v2 h-8 z M2,8 h12 v2 h-12 z M0,10 h16 v6 h-16 z" fill="#5c4033"/><path d="M7,4 h2 v2 h-2 z M6,6 h4 v2 h-4 z M5,8 h6 v2 h-6 z M4,10 h2 v6 h-2 z M10,10 h2 v6 h-2 z" fill="#d9c59a"/><path d="M6,10 h4 v6 h-4 z" fill="#222"/>`,
  exclamation: `<path d="M6,0 h4 v10 h-4 z M6,12 h4 v4 h-4 z" fill="#fff"/>`,
  heart: `<path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/>`,
  bomb: `<path d="M4,6 h8 v8 h-8 z M2,8 h12 v4 h-12 z M6,4 h4 v2 h-4 z" fill="#111"/><path d="M8,2 h2 v2 h-2 z" fill="#888"/><path d="M10,0 h2 v2 h-2 z M12,2 h2 v2 h-2 z" fill="#e2b822"/><path d="M4,8 h2 v2 h-2 z" fill="#555"/>`,
  shield: `<path d="M2,2 h12 v6 h-12 z M4,8 h8 v4 h-8 z M6,12 h4 v2 h-4 z" fill="#3a8cc7"/><path d="M2,2 h12 v2 h-12 z" fill="#c0c0c0"/><path d="M7,4 h2 v6 h-2 z M5,6 h6 v2 h-6 z" fill="#ff4444"/><path d="M3,4 h2 v2 h-2 z" fill="#8bc1e9"/>`,
  chest: `<path d="M2,4 h12 v8 h-12 z" fill="#333"/><path d="M2,4 h12 v2 h-12 z" fill="#444"/><path d="M7,6 h2 v2 h-2 z" fill="#666"/>`,
  hearts3: `<g transform="translate(-14, 0)"><path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/></g><g transform="translate(0, 0)"><path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/></g><g transform="translate(14, 0)"><path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/></g>`,
  campfire: `<path d="M6,0 h4 v2 h-4 z" fill="#ffdd44"/><path d="M4,2 h8 v2 h-8 z" fill="#ffaa22"/><path d="M3,4 h10 v2 h-10 z" fill="#ff6611"/><path d="M4,6 h8 v4 h-8 z" fill="#ff4400"/><path d="M5,10 h6 v2 h-6 z" fill="#cc3300"/><path d="M2,12 h12 v2 h-12 z" fill="#5c4033"/><path d="M0,14 h16 v2 h-16 z" fill="#5c4033"/>`,
  scroll: `<path d="M4,0 h8 v2 h-8 z M2,2 h12 v12 h-12 z M4,14 h8 v2 h-8 z" fill="#d9c59a"/><path d="M4,0 h8 v2 h-8 z M4,14 h8 v2 h-8 z" fill="#b8a47a"/><path d="M5,4 h6 v2 h-6 z M5,8 h6 v2 h-6 z M5,12 h4 v1 h-4 z" fill="#5c4033"/>`,
};

export const rpgSkin: Skin = {
  id: "rpg",
  name: "RPG",

  statusColors: {
    working: { bg: "#2d7a3e", text: "#ffffff", border: "#113d1b", subtext: "#c4e5ca", highlight: "#3da654" },
    idle: { bg: "#d9c59a", text: "#2b1f15", border: "#5c4033", subtext: "#6b4a35", highlight: "#ebd9b2" },
    permission: { bg: "#bf2a2a", text: "#ffffff", border: "#4a0b0b", subtext: "#ffcccc", highlight: "#e33d3d" },
  },

  statusLabels: {
    working: "QUESTING",
    idle: "RESTING",
    permission: "ENCOUNTER!",
  },

  statusIcons: {
    working: PIXEL_ICONS.sword,
    idle: PIXEL_ICONS.tent,
    permission: PIXEL_ICONS.exclamation,
  },

  empty: {
    colors: { bg: "#1a1a1a", text: "#888888", border: "#000000", subtext: "#555555", highlight: "#2a2a2a" },
    icon: PIXEL_ICONS.chest,
    label: "NO DATA",
  },

  controlColors: {
    active: { bg: "#d9c59a", text: "#3d2b1f", border: "#5c4033", subtext: "#6b4a35", highlight: "#ebd9b2" },
    inactive: { bg: "#1a1a1a", text: "#555555", border: "#000000", subtext: "#333333", highlight: "#2a2a2a" },
  },

  controls: {
    approve: { icon: PIXEL_ICONS.heart, label: "APPROVE" },
    reject: { icon: PIXEL_ICONS.bomb, label: "REJECT" },
    interrupt: { icon: PIXEL_ICONS.shield, label: "STOP" },
    "approve-all": { icon: PIXEL_ICONS.hearts3, label: "ALL OK" },
  },

  caffeinate: {
    icon: PIXEL_ICONS.campfire,
    activeLabel: "AWAKE",
    inactiveLabel: "SLEEP OK",
    active: { bg: "#8b4513", text: "#ffd700", border: "#5c2d0e", subtext: "#cc9900", highlight: "#a0522d" },
    inactive: { bg: "#1a1a1a", text: "#555555", border: "#000000", subtext: "#333333", highlight: "#2a2a2a" },
  },

  toggle: {
    colors: { bg: "#5c4033", text: "#d9c59a", border: "#3a2518", subtext: "#8b6b4a", highlight: "#7a5a45" },
    icon: PIXEL_ICONS.scroll,
  },
};
