export type AgentKind = 'hermes' | 'cli';

export interface AgentMeta {
  id: string;
  name: string;
  desc: string;
  color?: string;
  kind: AgentKind;
  iconUrl?: string;
  online?: boolean;
}

export interface LlmConfig {
  providers: string[];
  bedrockModels: string[];
}

export type ChatRole = 'user' | 'assistant' | 'system' | 'agent';

export type ChatAttachmentKind = 'image' | 'audio' | 'video' | 'file';

/** A file attached to a chat message. `url` is a served href (or a data URL for
 *  optimistic, not-yet-persisted messages); `kind` drives inline rendering. */
export interface ChatAttachment {
  url: string;
  name?: string;
  kind: ChatAttachmentKind;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  failed?: boolean;
  /** Attachments of any type; image/audio/video render inline, others as a
   *  download chip. */
  attachments?: ChatAttachment[];
  /** Legacy: bare image urls / data URLs on older messages that predate
   *  `attachments`. Still rendered when `attachments` is absent. */
  images?: string[];
}

export interface ChatSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  active: boolean;
  hasTranscript: boolean;
}

export interface WorkspaceFile {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: string;
  path: string;
}

export interface AgentFileEntry {
  id: string;
  title: string;
  fileName: string;
  path: string;
  purpose: string;
  exists: boolean;
  content: string;
}

export interface AgentProfile {
  name: string;
  root: string;
  files: AgentFileEntry[];
}

export interface McpServer {
  name: string;
  status: string;
  url: string;
  icon?: string;
}

export type GoalStatus = 'Planning' | 'Running' | 'Done' | 'Failed';

export interface GoalItem {
  id: string;
  title: string;
  status: GoalStatus;
  progress: number;
  logs: string[];
  mtime: string;
}

export type DrawerOrientation = 'right' | 'bottom';

export type MenuOrientation = 'horizontal' | 'vertical';

export type DrawerTabId = 'chat' | 'talk' | 'studio' | 'sessions' | 'workspace' | 'mcp' | 'manage' | 'goal';

export interface DrawerTab {
  id: DrawerTabId;
  label: string;
  desc: string;
}

export interface ContextMeterState {
  usedTokens: number | null;
  windowTokens: number;
  transcriptBytes: number;
}

export interface ModelOption {
  id: string;
  label: string;
}

export interface GroupedAgents {
  hermes: AgentMeta[];
  cli: AgentMeta[];
}