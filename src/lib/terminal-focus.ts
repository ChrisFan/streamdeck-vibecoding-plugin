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

/**
 * Focus the Ghostty tab for a specific Claude Code session.
 *
 * Strategy:
 * 1. Use the session PID to find its TTY device
 * 2. Write a unique temporary title (including PID) to that TTY via OSC 2
 * 3. AppleScript finds the AXRadioButton in AXTabGroup matching that title
 * 4. Click it to switch tabs, then activate Ghostty
 * 5. Restore original title (project: status format)
 *
 * Returns true if the tab was found and focused, false otherwise.
 */
export async function focusGhosttyWindow(
  project: string,
  pid?: number,
): Promise<boolean> {
  if (!pid) return false;

  const ttyPath = getTTYPath(pid);
  if (!ttyPath) return false;

  // Set a unique temporary title so we can locate the exact tab
  const marker = `__sd_focus_${pid}__`;
  setTTYTitle(ttyPath, marker);

  // Wait for Ghostty to process the OSC title change
  await new Promise((r) => setTimeout(r, 150));

  const escaped = marker.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

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
        repeat with t in tabButtons
          try
            if title of t contains "${escaped}" then
              -- Click the tab to switch to it
              perform action "AXPress" of t
              tell application "Ghostty" to activate
              return "found"
            end if
          end try
        end repeat
      end if
    end repeat
  end tell
end tell

-- Tab not found by marker — just activate Ghostty
tell application "Ghostty" to activate
return "fallback"
`;

  const result = await runOsascript(script);

  // Restore meaningful title (matches hook.sh format)
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
      resolve(stdout.trim() === "found");
    });

    proc.stdin.write(script);
    proc.stdin.end();
  });
}
