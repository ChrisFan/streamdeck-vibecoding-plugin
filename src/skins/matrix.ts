import type { Skin } from "../lib/types";

const ICONS = {
  unlock: `<rect x="4" y="6" width="8" height="8" fill="#00ffff" opacity="0.8"/><path d="M5,6 v-2 a3,3 0 0 1 6,0" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.8"/><line x1="8" y1="9" x2="8" y2="11" stroke="#000000" stroke-width="2"/>`,
  incognito: `<path d="M2,8 c0,-6 12,-6 12,0" fill="none" stroke="#b026ff" stroke-width="2"/><circle cx="5" cy="10" r="2" fill="#b026ff"/><circle cx="11" cy="10" r="2" fill="#b026ff"/><line x1="7" y1="10" x2="9" y2="10" stroke="#b026ff" stroke-width="1"/>`,
  breach: `<path d="M8,1 l7,13 h-14 z" fill="none" stroke="#ff00ff" stroke-width="2"/><line x1="8" y1="5" x2="8" y2="10" stroke="#ff00ff" stroke-width="2"/><circle cx="8" cy="12" r="1" fill="#ff00ff"/>`,
  empty: `<rect x="4" y="6" width="8" height="4" fill="none" stroke="#333333" stroke-width="1" stroke-dasharray="2 1"/>`,
  bluepill: `<path d="M4,12 a3,3 0 0 1 4,-4 l4,4 a3,3 0 0 1 -4,4 l-4,-4 z" fill="#00ffff" opacity="0.9"/><path d="M4,12 l4,4" stroke="#000000" stroke-width="1"/>`,
  redpill: `<path d="M4,12 a3,3 0 0 1 4,-4 l4,4 a3,3 0 0 1 -4,4 l-4,-4 z" fill="#ff00ff" opacity="0.9"/><path d="M4,12 l4,4" stroke="#000000" stroke-width="1"/>`,
  firewall: `<rect x="2" y="2" width="12" height="12" fill="none" stroke="#ff00ff" stroke-width="2"/><line x1="2" y1="6" x2="14" y2="6" stroke="#ff00ff" stroke-width="1"/><line x1="2" y1="10" x2="14" y2="10" stroke="#ff00ff" stroke-width="1"/><line x1="6" y1="2" x2="6" y2="6" stroke="#ff00ff" stroke-width="1"/><line x1="10" y1="6" x2="10" y2="10" stroke="#ff00ff" stroke-width="1"/><line x1="6" y1="10" x2="6" y2="14" stroke="#ff00ff" stroke-width="1"/>`,
  allpass: `<g transform="translate(-14, 0)"><path d="M4,12 a3,3 0 0 1 4,-4 l4,4 a3,3 0 0 1 -4,4 l-4,-4 z" fill="#00ffff" opacity="0.9"/></g><g transform="translate(0, 0)"><path d="M4,12 a3,3 0 0 1 4,-4 l4,4 a3,3 0 0 1 -4,4 l-4,-4 z" fill="#00ffff" opacity="0.9"/></g><g transform="translate(14, 0)"><path d="M4,12 a3,3 0 0 1 4,-4 l4,4 a3,3 0 0 1 -4,4 l-4,-4 z" fill="#00ffff" opacity="0.9"/></g>`,
  jack: `<rect x="6" y="8" width="4" height="6" fill="#00ffff"/><rect x="7" y="2" width="2" height="6" fill="#cccccc"/><line x1="6" y1="10" x2="10" y2="10" stroke="#000000" stroke-width="1"/>`,
  matrix: `<text x="8" y="10" font-family="monospace" font-size="10" font-weight="bold" fill="#00ffff" text-anchor="middle">01</text><text x="8" y="14" font-family="monospace" font-size="8" fill="#ff00ff" text-anchor="middle" opacity="0.5">10</text>`,
};

const CYAN = "#00ffff";
const CYAN_DIM = "#006666";
const MAGENTA = "#ff00ff";
const MAGENTA_DIM = "#660066";
const PURPLE = "#6600cc";
const PURPLE_DIM = "#220044";
const BLACK = "#05050a";

export const matrixSkin: Skin = {
  id: "matrix",
  name: "CYBER",

  statusColors: {
    working: { bg: "#001122", text: CYAN, border: CYAN_DIM, subtext: CYAN_DIM, highlight: CYAN_DIM },
    idle: { bg: PURPLE_DIM, text: "#b026ff", border: "#440088", subtext: "#8844cc", highlight: "#330066" },
    permission: { bg: "#220011", text: MAGENTA, border: MAGENTA_DIM, subtext: MAGENTA_DIM, highlight: MAGENTA_DIM },
  },

  statusLabels: {
    working: "DECRYPTING",
    idle: "INCOGNITO",
    permission: "BREACH DETECTED",
  },

  statusIcons: {
    working: ICONS.unlock,
    idle: ICONS.incognito,
    permission: ICONS.breach,
  },

  empty: {
    colors: { bg: BLACK, text: "#334455", border: "#112233", subtext: "#223344", highlight: "#1a2a3a" },
    icon: ICONS.empty,
    label: "NO CONNECTION",
  },

  controlColors: {
    active: { bg: "#001122", text: CYAN, border: CYAN_DIM, subtext: CYAN_DIM, highlight: CYAN_DIM },
    inactive: { bg: BLACK, text: "#334455", border: "#112233", subtext: "#223344", highlight: "#1a2a3a" },
  },

  controls: {
    approve: { icon: ICONS.bluepill, label: "BYPASS" },
    reject: { icon: ICONS.redpill, label: "BLOCK" },
    interrupt: { icon: ICONS.firewall, label: "FIREWALL" },
    "approve-all": { icon: ICONS.allpass, label: "ALL BYPASS" },
  },

  caffeinate: {
    icon: ICONS.jack,
    activeLabel: "JACKED IN",
    inactiveLabel: "JACKED OUT",
    active: { bg: "#001122", text: CYAN, border: CYAN_DIM, subtext: CYAN_DIM, highlight: CYAN_DIM },
    inactive: { bg: BLACK, text: "#334455", border: "#112233", subtext: "#223344", highlight: "#1a2a3a" },
  },

  toggle: {
    colors: { bg: "#110022", text: MAGENTA, border: MAGENTA_DIM, subtext: MAGENTA_DIM, highlight: MAGENTA_DIM },
    icon: ICONS.matrix,
  },
};
