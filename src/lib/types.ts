export type SessionStatus = "working" | "idle" | "permission";

export interface Session {
  project: string;
  cwd: string;
  status: SessionStatus;
  started_at: number;
  last_event: number;
  last_event_type: string;
  pid?: number;
}

export interface SessionsState {
  version: number;
  updated_at: number;
  sessions: Record<string, Session>;
}

export interface SessionSlot {
  sessionId: string;
  session: Session;
}

export interface PendingPermission {
  session_id: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
  timestamp: number;
}

export type ControlType = "approve" | "reject" | "interrupt" | "approve-all";

export interface ColorSet {
  bg: string;
  text: string;
  border: string;
  subtext: string;
  highlight: string;
}

export interface Skin {
  id: string;
  name: string;

  // Session buttons
  statusColors: Record<SessionStatus, ColorSet>;
  statusLabels: Record<SessionStatus, string>;
  statusIcons: Record<SessionStatus, string>;

  // Empty slot
  empty: { colors: ColorSet; icon: string; label: string };

  // Control buttons (approve/reject/interrupt/approve-all)
  controlColors: { active: ColorSet; inactive: ColorSet };
  controls: Record<ControlType, { icon: string; label: string }>;

  // Caffeinate
  caffeinate: {
    icon: string;
    activeLabel: string;
    inactiveLabel: string;
    active: ColorSet;
    inactive: ColorSet;
  };

  // Toggle button itself
  toggle: { colors: ColorSet; icon: string };
}
