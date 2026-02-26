import type { SessionSlot, SessionStatus } from "./types";

const SIZE = 144;

const THEME = {
  working: { bg: "#2d7a3e", text: "#ffffff", border: "#113d1b", subtext: "#c4e5ca", highlight: "#3da654" },
  idle: { bg: "#d9c59a", text: "#2b1f15", border: "#5c4033", subtext: "#6b4a35", highlight: "#ebd9b2" },
  permission: { bg: "#bf2a2a", text: "#ffffff", border: "#4a0b0b", subtext: "#ffcccc", highlight: "#e33d3d" },
  empty: { bg: "#1a1a1a", text: "#888888", border: "#000000", subtext: "#555555", highlight: "#2a2a2a" },
};

const STATUS_LABELS: Record<SessionStatus, string> = {
  working: "QUESTING",
  idle: "RESTING",
  permission: "ENCOUNTER!",
};

const PIXEL_ICONS = {
  sword: `<path d="M7,0 h2 v10 h-2 z" fill="#e2ecf5"/><path d="M4,10 h8 v2 h-8 z M3,12 h2 v2 h-2 z M11,12 h2 v2 h-2 z" fill="#3a8cc7"/><path d="M7,12 h2 v4 h-2 z" fill="#e2b822"/><path d="M6,16 h4 v2 h-4 z" fill="#3a8cc7"/>`,
  tent: `<path d="M7,2 h2 v2 h-2 z M6,4 h4 v2 h-4 z M4,6 h8 v2 h-8 z M2,8 h12 v2 h-12 z M0,10 h16 v6 h-16 z" fill="#5c4033"/><path d="M7,4 h2 v2 h-2 z M6,6 h4 v2 h-4 z M5,8 h6 v2 h-6 z M4,10 h2 v6 h-2 z M10,10 h2 v6 h-2 z" fill="#d9c59a"/><path d="M6,10 h4 v6 h-4 z" fill="#222"/>`,
  exclamation: `<path d="M6,0 h4 v10 h-4 z M6,12 h4 v4 h-4 z" fill="#fff"/>`,
  heart: `<path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/>`,
  bomb: `<path d="M4,6 h8 v8 h-8 z M2,8 h12 v4 h-12 z M6,4 h4 v2 h-4 z" fill="#111"/><path d="M8,2 h2 v2 h-2 z" fill="#888"/><path d="M10,0 h2 v2 h-2 z M12,2 h2 v2 h-2 z" fill="#e2b822"/><path d="M4,8 h2 v2 h-2 z" fill="#555"/>`,
  shield: `<path d="M2,2 h12 v6 h-12 z M4,8 h8 v4 h-8 z M6,12 h4 v2 h-4 z" fill="#3a8cc7"/><path d="M2,2 h12 v2 h-12 z" fill="#c0c0c0"/><path d="M7,4 h2 v6 h-2 z M5,6 h6 v2 h-6 z" fill="#ff4444"/><path d="M3,4 h2 v2 h-2 z" fill="#8bc1e9"/>`,
  chest: `<path d="M2,4 h12 v8 h-12 z" fill="#333"/><path d="M2,4 h12 v2 h-12 z" fill="#444"/><path d="M7,6 h2 v2 h-2 z" fill="#666"/>`,
  hearts3: `<g transform="translate(-14, 0)"><path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/></g><g transform="translate(0, 0)"><path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/></g><g transform="translate(14, 0)"><path d="M2,2 h4 v2 h-4 z M10,2 h4 v2 h-4 z M0,4 h16 v4 h-16 z M2,8 h12 v2 h-12 z M4,10 h8 v2 h-8 z M6,12 h4 v2 h-4 z" fill="#ff4444"/><path d="M2,4 h2 v2 h-2 z" fill="#ffaaaa"/></g>`
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatTimeAgo(epochSec: number): string {
  const diffSec = Math.floor(Date.now() / 1000 - epochSec);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

function truncateProject(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + "…";
}

function renderBox(bg: string, border: string, highlight: string) {
  return `
    <!-- Main Background -->
    <rect x="8" y="4" width="128" height="136" fill="${bg}"/>
    <rect x="4" y="8" width="136" height="128" fill="${bg}"/>
    
    <!-- Top/Left Highlight for 3D Bevel -->
    <rect x="8" y="4" width="128" height="4" fill="${highlight}"/>
    <rect x="4" y="8" width="4" height="128" fill="${highlight}"/>
    
    <!-- Outer Border -->
    <rect x="8" y="0" width="128" height="4" fill="${border}"/>
    <rect x="8" y="140" width="128" height="4" fill="${border}"/>
    <rect x="0" y="8" width="4" height="128" fill="${border}"/>
    <rect x="140" y="8" width="4" height="128" fill="${border}"/>
    
    <!-- Outer Corners -->
    <rect x="4" y="4" width="4" height="4" fill="${border}"/>
    <rect x="136" y="4" width="4" height="4" fill="${border}"/>
    <rect x="4" y="136" width="4" height="4" fill="${border}"/>
    <rect x="136" y="136" width="4" height="4" fill="${border}"/>
  `;
}

export function renderSessionButton(slot: SessionSlot): string {
  const { session } = slot;
  const theme = THEME[session.status];
  const label = STATUS_LABELS[session.status];
  const project = escapeXml(truncateProject(session.project, 12).toUpperCase());
  const timeAgo = escapeXml(formatTimeAgo(session.last_event).toUpperCase());

  let icon = "";
  if (session.status === "working") icon = PIXEL_ICONS.sword;
  else if (session.status === "idle") icon = PIXEL_ICONS.tent;
  else if (session.status === "permission") icon = PIXEL_ICONS.exclamation;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(theme.bg, theme.border, theme.highlight)}
  
  <g transform="translate(48, 16) scale(3)">
    ${icon}
  </g>

  <text x="${SIZE / 2}" y="82" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${theme.text}" text-anchor="middle" letter-spacing="1">${label}</text>
  
  <rect x="16" y="92" width="112" height="4" fill="${theme.border}"/>
  
  <text x="${SIZE / 2}" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${theme.text}" text-anchor="middle" letter-spacing="0">${project}</text>
  <text x="${SIZE / 2}" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="${theme.subtext}" text-anchor="middle" letter-spacing="0">${timeAgo}</text>
</svg>`;
}

export function renderEmptyButton(): string {
  const theme = THEME.empty;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(theme.bg, theme.border, theme.highlight)}
  <g transform="translate(48, 36) scale(3)" opacity="0.5">
    ${PIXEL_ICONS.chest}
  </g>
  <text x="${SIZE / 2}" y="104" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${theme.text}" text-anchor="middle" letter-spacing="1">NO DATA</text>
</svg>`;
}

export function svgToBase64(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export type ControlType = "approve" | "reject" | "interrupt" | "approve-all";

const CONTROL_CONFIG: Record<ControlType, { icon: string; label: string }> = {
  approve: { icon: PIXEL_ICONS.heart, label: "APPROVE" },
  reject: { icon: PIXEL_ICONS.bomb, label: "REJECT" },
  interrupt: { icon: PIXEL_ICONS.shield, label: "STOP" },
  "approve-all": { icon: PIXEL_ICONS.hearts3, label: "ALL OK" },
};

export function renderControlButton(type: ControlType, active: boolean): string {
  const cfg = CONTROL_CONFIG[type];
  
  const bg = active ? "#d9c59a" : "#1a1a1a";
  const border = active ? "#5c4033" : "#000000";
  const highlight = active ? "#ebd9b2" : "#2a2a2a";
  const text = active ? "#3d2b1f" : "#555555";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(bg, border, highlight)}
  <g transform="translate(48, 24) scale(3)" opacity="${active ? 1 : 0.3}">
    ${cfg.icon}
  </g>
  <text x="${SIZE / 2}" y="116" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${text}" text-anchor="middle" letter-spacing="1">${cfg.label}</text>
</svg>`;
}
