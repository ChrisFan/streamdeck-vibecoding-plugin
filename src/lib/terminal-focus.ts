import { spawn, execFileSync } from "child_process";
import { openSync, writeSync, closeSync, constants } from "fs";

/**
 * Get the TTY device path for a PID (e.g. "/dev/ttys003").
 */
function getTTYPath(pid: number): string | null {
  try {
    const tty = execFileSync("ps", ["-o", "tty=", "-p", String(pid)], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (!tty || tty === "??") return null;
    return `/dev/${tty}`;
  } catch {
    return null;
  }
}

/**
 * Write an OSC 2 (set window title) escape sequence to a TTY device.
 */
function setTTYTitle(ttyPath: string, title: string): void {
  try {
    const fd = openSync(ttyPath, constants.O_WRONLY | constants.O_NOCTTY);
    writeSync(fd, `\x1b]2;${title}\x07`);
    closeSync(fd);
  } catch {
    // TTY might not be writable (process exited, permissions, etc.)
  }
}

function escapeAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Focus the Ghostty tab for a specific Claude Code session.
 *
 * Multi-strategy approach (tab titles vary by session state):
 *   - hook.sh-set titles:  "project: status"  (idle sessions that retained our write)
 *   - zsh-set titles:      "~/path/to/project" (idle sessions where prompt overwrote)
 *   - Claude Code titles:  "✳ Claude Code"     (working sessions with spinner)
 *
 * Strategy:
 *   1. Write unique marker to TTY, search tab titles for marker (exact match)
 *   2. Search tab titles for project name (matches hook.sh + zsh formats)
 *   3. Same for single-tab windows (window title instead of tab buttons)
 *   4. Fallback: activate Ghostty without targeting a specific tab
 */
export async function focusGhosttyWindow(
  project: string,
  pid?: number,
): Promise<boolean> {
  if (!pid) return false;

  const ttyPath = getTTYPath(pid);
  if (!ttyPath) return false;

  // Write a unique marker to the TTY — works when nothing overwrites it quickly
  const marker = `__sd_focus_${pid}__`;
  setTTYTitle(ttyPath, marker);

  // Brief delay for Ghostty to process the OSC title change
  await new Promise((r) => setTimeout(r, 80));

  const markerEsc = escapeAppleScript(marker);
  const projectEsc = escapeAppleScript(project);

  const script = `
tell application "System Events"
  if not (exists process "Ghostty") then
    return "not_running"
  end if
  tell process "Ghostty"
    repeat with w in windows
      set tg to missing value
      try
        set tg to first UI element of w whose role is "AXTabGroup"
      end try

      if tg is not missing value then
        set tabButtons to radio buttons of tg

        -- Pass 1: exact marker match (unique, works for idle sessions)
        repeat with t in tabButtons
          try
            if title of t contains "${markerEsc}" then
              perform action "AXPress" of t
              tell application "Ghostty" to activate
              return "found"
            end if
          end try
        end repeat

        -- Pass 2: project name match (hook.sh "project: status" or zsh "~/path/project")
        repeat with t in tabButtons
          try
            if title of t contains "${projectEsc}" then
              perform action "AXPress" of t
              tell application "Ghostty" to activate
              return "found"
            end if
          end try
        end repeat
      end if

      -- Pass 3: single-tab window (no tab bar) — check window title
      try
        if title of w contains "${markerEsc}" then
          perform action "AXRaise" of w
          tell application "Ghostty" to activate
          return "found"
        end if
      end try
      try
        if title of w contains "${projectEsc}" then
          perform action "AXRaise" of w
          tell application "Ghostty" to activate
          return "found"
        end if
      end try
    end repeat
  end tell
end tell

-- Nothing matched — just bring Ghostty to front
tell application "Ghostty" to activate
return "fallback"
`;

  const result = await runOsascript(script);

  // Restore a meaningful title so future focus attempts can match by project name
  setTTYTitle(ttyPath, `${project}: focused`);

  return result;
}

function runOsascript(script: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const proc = spawn("osascript", ["-"]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`osascript exited ${code}: ${stderr.trim()}`));
        return;
      }
      // "found" = exact tab, "fallback" = just activated Ghostty
      // Both are acceptable — only "not_running" is a true failure
      resolve(stdout.trim() !== "not_running");
    });

    proc.stdin.write(script);
    proc.stdin.end();
  });
}
