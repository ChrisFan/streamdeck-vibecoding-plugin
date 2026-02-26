import type { SessionSlot, Skin, ControlType } from "./types";

const SIZE = 144;

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

export function renderSessionButton(slot: SessionSlot, skin: Skin): string {
  const { session } = slot;
  const colors = skin.statusColors[session.status];
  const label = skin.statusLabels[session.status];
  const icon = skin.statusIcons[session.status];
  const project = escapeXml(truncateProject(session.project, 12).toUpperCase());
  const timeAgo = escapeXml(formatTimeAgo(session.last_event).toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(colors.bg, colors.border, colors.highlight)}

  <g transform="translate(48, 16) scale(3)">
    ${icon}
  </g>

  <text x="${SIZE / 2}" y="82" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}" text-anchor="middle" letter-spacing="1">${label}</text>

  <rect x="16" y="92" width="112" height="4" fill="${colors.border}"/>

  <text x="${SIZE / 2}" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}" text-anchor="middle" letter-spacing="0">${project}</text>
  <text x="${SIZE / 2}" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="${colors.subtext}" text-anchor="middle" letter-spacing="0">${timeAgo}</text>
</svg>`;
}

export function renderEmptyButton(skin: Skin): string {
  const { colors, icon, label } = skin.empty;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(colors.bg, colors.border, colors.highlight)}
  <g transform="translate(48, 36) scale(3)" opacity="0.5">
    ${icon}
  </g>
  <text x="${SIZE / 2}" y="104" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}" text-anchor="middle" letter-spacing="1">${label}</text>
</svg>`;
}

export function svgToBase64(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function renderControlButton(type: ControlType, active: boolean, skin: Skin): string {
  const colors = active ? skin.controlColors.active : skin.controlColors.inactive;
  const cfg = skin.controls[type];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(colors.bg, colors.border, colors.highlight)}
  <g transform="translate(48, 24) scale(3)" opacity="${active ? 1 : 0.3}">
    ${cfg.icon}
  </g>
  <text x="${SIZE / 2}" y="116" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}" text-anchor="middle" letter-spacing="1">${cfg.label}</text>
</svg>`;
}

export function renderCaffeinateButton(active: boolean, skin: Skin): string {
  const colors = active ? skin.caffeinate.active : skin.caffeinate.inactive;
  const label = active ? skin.caffeinate.activeLabel : skin.caffeinate.inactiveLabel;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(colors.bg, colors.border, colors.highlight)}
  <g transform="translate(48, 24) scale(3)" opacity="${active ? 1 : 0.3}">
    ${skin.caffeinate.icon}
  </g>
  <text x="${SIZE / 2}" y="116" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}" text-anchor="middle" letter-spacing="1">${label}</text>
</svg>`;
}

export function renderSkinToggleButton(skin: Skin): string {
  const { colors, icon } = skin.toggle;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${renderBox(colors.bg, colors.border, colors.highlight)}
  <g transform="translate(48, 24) scale(3)">
    ${icon}
  </g>
  <text x="${SIZE / 2}" y="116" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}" text-anchor="middle" letter-spacing="1">${skin.name}</text>
</svg>`;
}
