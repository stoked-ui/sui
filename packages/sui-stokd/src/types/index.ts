/**
 * @stoked-ui/stokd — UX view-model types (source of truth).
 *
 * These types are the data contract for the Stokd "Current Activity" component
 * set. Each host (the Stokd web dashboard, the VS Code extension webview, and
 * future contexts) maps its own domain data into these plain models via a thin
 * adapter; the components never import a host/app package.
 *
 * Anything domain-specific that must be RESOLVED (a session's display status,
 * a work item's ship status) is resolved by the consumer adapter and passed in
 * already-resolved, keeping these components purely presentational.
 */

/** Work classification (mirror of the platform WorkType union). */
export type WorkTypeModel = 'project' | 'task' | 'planning';

/** UI-only label override for governed planning vs concrete work. */
export type ActiveCardDisplayType = WorkTypeModel;

/** Resolved, presentational session status (consumer maps via its resolver). */
export type DisplayStatusModel =
  | 'working'
  | 'validating'
  | 'analyzing'
  | 'prompting'
  | 'needs-input'
  | 'idle'
  | 'stopped';

/** Semantic badge color kind. */
export type StatusKind = 'success' | 'warning' | 'error' | 'neutral' | 'info';

/** Canonical agent-provider identity. */
export type ProviderId =
  | 'claude'
  | 'codex'
  | 'gemini'
  | 'amp'
  | 'grok'
  | 'stokd'
  | 'local'
  | 'unknown';

/** Light/dark theming hint (defaults to dark when omitted). */
export type ThemeMode = 'light' | 'dark';

/**
 * Ship-status mini-pipeline state (AX-REPO-SHIP-PROVENANCE). Always all three;
 * each flag is "has this work shipped to that environment". Resolved by the
 * consumer from recorded provenance — never from live queries.
 */
export interface ShipStatusModel {
  main: boolean;
  stage: boolean;
  prod: boolean;
}

/** Server-derived prerequisite status for a work item. */
export interface PrerequisiteStatusModel {
  hash: string;
  hashShort?: string;
  title?: string;
  status: string;
  satisfied: boolean;
}

/** Governance contract status used to drive the task stage strip. */
export type GovernanceStatusModel =
  | 'planning_required'
  | 'contract_draft'
  | 'contract_valid'
  | 'write_unlocked'
  | 'validation_required'
  | 'validated'
  | 'violated';

/** A single governed acceptance criterion. */
export interface GovernanceCriterionModel {
  id?: string;
  description: string;
  passed?: boolean | null;
}

/** Conversation message kinds. */
export type MessageTypeModel = 'user_prompt' | 'agent_response' | 'summary';

/** A normalized conversation message. */
export interface MessageModel {
  message_id?: string;
  message_type: MessageTypeModel;
  content: string;
  created_at: string;
}

/** A normalized telemetry tool action. */
export interface ToolActionModel {
  toolName?: string;
  turnNumber?: number;
  timestamp?: string;
  completed: boolean;
  filesAffected?: string[];
  toolContext?: string;
  activitySummary?: string;
  commandName?: string;
}

/** A file touched by a session (for live-activity fallback). */
export interface SessionFileContextModel {
  path: string;
}

/**
 * A normalized agent session. The consumer resolves `displayStatus` with its
 * own resolver and maps the remaining live-activity fields verbatim.
 */
export interface SessionModel {
  sessionId: string;
  displayStatus?: DisplayStatusModel;
  state?: string;
  provider?: string | null;
  branch?: string | null;
  started_at?: string | null;
  last_event_at?: string | null;
  totalTurns?: number;
  totalCostUsd?: number;
  currentTool?: string | null;
  currentAction?: string | null;
  lastActivitySummary?: string | null;
  toolContext?: string | null;
  commandName?: string | null;
  filesContext?: SessionFileContextModel[];
  prompt_text?: string | null;
  objectiveSummary?: string | null;
  requestContext?: string | null;
}

/** An independent unit of work grouped under one task. */
export interface TaskLineItemModel {
  id: string;
  title: string;
  status: string;
}

/** A single initiative progress bullet. */
export interface InitiativeBulletModel {
  text: string;
  done: boolean;
}

/** Initiative progress (project bullet checklist). */
export interface InitiativeModel {
  bullets: InitiativeBulletModel[];
}

/** The subset of a governed task record the activity card renders. */
export interface TaskModel {
  status: string;
  hashShort?: string;
  task_number?: number;
  started_at?: string;
  resolution?: string;
  acceptance_criteria?: string;
  source_prompt?: string;
  line_items?: TaskLineItemModel[];
  prerequisites_status?: PrerequisiteStatusModel[];
  prerequisites_blocked?: boolean;
  metadata?: Record<string, unknown>;
  governance?: {
    status?: GovernanceStatusModel;
    acceptance_criteria_items?: GovernanceCriterionModel[];
  };
}

/** Pipeline stage identity (project execution phases). */
export type PipelineStageId =
  | 'analysis'
  | 'planning'
  | 'implementation'
  | 'validation'
  | 'integration';

/** Pipeline stage status. */
export type PipelineStageStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/** A single project pipeline stage. */
export interface PipelineStageModel {
  stage_id: PipelineStageId;
  name: string;
  status: PipelineStageStatus;
}

/** A grouped request (one card) of sessions sharing a work item. */
export interface SessionGroupModel<S extends { started_at?: string | null } = SessionModel> {
  key: string;
  title: string;
  sessions: S[];
  workType: WorkTypeModel;
}
