
export interface Task {
  id: string;
  text: string;
  completedA: boolean;
  completedB: boolean;
  isDueA: boolean;
  isDueB: boolean;
  createdAt: number;
}

export interface UserStats {
  userId: string;
  totalStudyTime: number; // in seconds
  lastReset: string; // ISO date
}

export interface HistoryEntry {
  date: string;
  tasks: Task[];
  stats: Record<string, UserStats>;
}

export interface AppNotification {
  id: string;
  forUserId: 'user_a' | 'user_b';
  message: string;
  timestamp: number;
  read: boolean;
}

export enum AppTab {
  TASKS = 'tasks',
  DUE = 'due',
  TIMER = 'timer',
  PROGRESS = 'progress',
  PROFILE = 'profile'
}

export interface UserSettings {
  nameA: string;
  nameB: string;
  currentUserId: 'user_a' | 'user_b';
  theme: 'light' | 'dark';
}

export type TimerMode = 'countdown' | 'stopwatch';

export interface TimerState {
  isActive: boolean;
  mode: TimerMode;
  seconds: number;
  initialSeconds: number;
}
