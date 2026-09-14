export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  token: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  createdAt: string;
}

export interface CodeFile {
  name: string;
  content: string;
  language?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface TerminalLine {
  text: string;
  type: 'out' | 'err' | 'success' | 'warn' | 'log' | 'prompt';
  ts: string;
}

export interface SyntaxGroup {
  group: string;
  items: SyntaxItem[];
}

export interface SyntaxItem {
  cmd: string;
  desc: string;
  insert: string;
}

export interface ActivityEvent {
  ts: string;
  msg: string;
}

export type ViewType = 'hero' | 'dashboard' | 'workspace';

export type TerminalTab = 'output' | 'problems' | 'log';

export interface Variables {
  [key: string]: string | number | boolean | string[];
}

export interface Functions {
  [key: string]: string[];
}

export interface DashboardStats {
  files: number;
  lines: number;
  functions: number;
}
