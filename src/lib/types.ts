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
