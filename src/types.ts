export interface PineScriptSubmission {
  id: string;
  originalCode: string;
  guestId: string;
  createdAt: any;
  userEmail?: string;
}

export enum TerminalStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  timestamp: number;
}
