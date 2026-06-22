import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Code,
  DollarSign,
  FileText,
  GitBranch,
  Hash,
  Play,
  Shield,
  Square,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ActiveCardDisplayType,
  DisplayStatusModel,
  GovernanceCriterionModel,
  GovernanceStatusModel,
  InitiativeModel,
  MessageModel,
  SessionModel,
  ShipStatusModel,
  TaskModel,
  ThemeMode,
  ToolActionModel,
  WorkTypeModel,
} from '../../types';
import { StatusBadge } from '../StatusBadge';
import { LiveTimer } from '../LiveTimer';
import { ProviderBadge } from '../ProviderBadge';
import { ShipStatusChips } from '../ShipStatusChips';
import { PrerequisiteBadge } from '../PrerequisiteBadge';
import { isEngagedDisplayStatus } from '../../utils/status';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/format';
import {
  formatElapsedLabel,
  formatToolName,
  isInternalStokdPrompt,
  summarizeFiles,
  trimText,
} from '../../utils/text';
import './ActiveTaskCard.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface AcceptanceCriterionDisplay {
  id: string;
  description: string;
  passed: boolean | null;
}

type TaskStageId = 'planning' | 'implementation' | 'validation';
type TaskStageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface TaskStageDisplay {
  id: TaskStageId;
  label: string;
  status: TaskStageStatus;
}

interface TaskStageState {
  stages: TaskStageDisplay[];
  summary: string;
}

function parseAcceptanceCriteriaMarkdown(markdown?: string): AcceptanceCriterionDisplay[] {
  if (!markdown) return [];
  return markdown
    .split('\n')
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const checked = /^\s*[-*]\s*\[x\]\s*/i.test(line);
      const unchecked = /^\s*[-*]\s*\[\s?\]\s*/.test(line);
      const description = line.replace(/^[-*]\s*(\[[ x]?\]\s*)?/, '').trim();
      if (!description) return null;
      const item: AcceptanceCriterionDisplay = {
        id: `markdown-${index}`,
        description,
        passed: checked ? true : unchecked ? null : null,
      };
      return item;
    })
    .filter((item): item is AcceptanceCriterionDisplay => !!item);
}

/**
 * Bulleted "what this task will achieve" list parsed from the governed plan in
 * `source_prompt`. Bullets inside Acceptance Criteria, Validation Plan, and
 * Axiom Changes sections are excluded.
 */
function parsePlanBullets(sourcePrompt?: string): string[] {
  if (!sourcePrompt) return [];
  const skipSections = new Set(['acceptance criteria', 'validation plan', 'axiom changes']);
  let currentSection = '';
  const bullets: string[] = [];
  for (const rawLine of sourcePrompt.split('\n')) {
    const line = rawLine.trim();
    const isBullet = /^[-*]\s+/.test(line);
    const headerMatch = isBullet ? null : line.match(/^([A-Za-z][A-Za-z ()/-]{0,40}):/);
    if (headerMatch) {
      currentSection = headerMatch[1].trim().toLowerCase();
      continue;
    }
    if (skipSections.has(currentSection)) continue;
    if (!isBullet) continue;
    const text = line
      .replace(/^[-*]\s+/, '')
      .replace(/^\[[ xX]?\]\s*/, '')
      .trim();
    if (text) bullets.push(text);
  }
  return bullets.slice(0, 8);
}

function resolveAcceptanceCriteria(task?: TaskModel): AcceptanceCriterionDisplay[] {
  const governanceCriteria = task?.governance?.acceptance_criteria_items ?? [];
  if (governanceCriteria.length > 0) {
    return governanceCriteria.map((criterion: GovernanceCriterionModel, index) => ({
      id: criterion.id || `governance-${index}`,
      description: criterion.description,
      passed: typeof criterion.passed === 'boolean' ? criterion.passed : null,
    }));
  }
  return parseAcceptanceCriteriaMarkdown(task?.acceptance_criteria);
}

const TASK_STAGE_DEFS: Array<{ id: TaskStageId; label: string; icon: LucideIcon }> = [
  { id: 'planning', label: 'Planning', icon: FileText },
  { id: 'implementation', label: 'Implementation', icon: Code },
  { id: 'validation', label: 'Validation', icon: Shield },
];

function buildTaskStageState(task?: TaskModel): TaskStageState | null {
  if (!task) return null;
  const governanceStatus = task.governance?.status;
  if (governanceStatus) {
    return buildGovernanceTaskStageState(governanceStatus);
  }
  return buildFallbackTaskStageState(task.status);
}

function buildGovernanceTaskStageState(status: GovernanceStatusModel): TaskStageState {
  const stages: TaskStageDisplay[] = TASK_STAGE_DEFS.map((stage) => ({ ...stage, status: 'pending' }));
  switch (status) {
    case 'planning_required':
    case 'contract_draft':
      stages[0].status = 'in_progress';
      return { stages, summary: 'Planning in progress' };
    case 'contract_valid':
      stages[0].status = 'completed';
      return { stages, summary: 'Planning complete' };
    case 'write_unlocked':
      stages[0].status = 'completed';
      stages[1].status = 'in_progress';
      return { stages, summary: 'Implementation in progress' };
    case 'validation_required':
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'in_progress';
      return { stages, summary: 'Validation in progress' };
    case 'validated':
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'completed';
      return { stages, summary: 'Validated' };
    case 'violated':
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'failed';
      return { stages, summary: 'Validation failed' };
  }
  return { stages, summary: 'Planning in progress' };
}

function buildFallbackTaskStageState(status: string): TaskStageState {
  const stages: TaskStageDisplay[] = TASK_STAGE_DEFS.map((stage) => ({ ...stage, status: 'pending' }));
  switch (status) {
    case 'pending':
      stages[0].status = 'in_progress';
      return { stages, summary: 'Planning in progress' };
    case 'in_progress':
      stages[0].status = 'completed';
      stages[1].status = 'in_progress';
      return { stages, summary: 'Implementation in progress' };
    case 'completed':
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'completed';
      return { stages, summary: 'Completed' };
    case 'failed':
    case 'blocked':
    case 'cancelled':
      stages[0].status = 'completed';
      stages[1].status = 'failed';
      return { stages, summary: 'Implementation blocked' };
  }
  return { stages, summary: 'Planning in progress' };
}

function TaskStageIcon({ status, Icon }: { status: TaskStageStatus; Icon: LucideIcon }) {
  if (status === 'completed') return <CheckCircle2 className="sui-icon-sm sui-atc-stage-icon--done" aria-hidden />;
  if (status === 'failed') return <XCircle className="sui-icon-sm sui-atc-stage-icon--fail" aria-hidden />;
  if (status === 'pending') return <Circle className="sui-icon-sm sui-atc-stage-icon--pending" aria-hidden />;
  return <Icon className="sui-icon-sm sui-atc-stage-icon--active" aria-hidden />;
}

const WORK_TYPE_LABELS: Record<ActiveCardDisplayType, string> = {
  project: 'Project',
  task: 'Task',
  planning: 'Planning',
};

function displayStatusLabel(status: DisplayStatusModel): string {
  if (status === 'working') return 'Working';
  if (status === 'analyzing') return 'Analyzing';
  if (status === 'idle') return 'Idle';
  return 'Stopped';
}

function resolveToolTitle(action: ToolActionModel): string {
  return trimText(action.activitySummary, 160) ?? formatToolName(action.toolName);
}

function resolveToolDetail(action: ToolActionModel): string | undefined {
  const parts = [
    action.activitySummary ? formatToolName(action.toolName) : undefined,
    trimText(action.toolContext, 180),
    trimText(summarizeFiles(action.filesAffected), 180),
    trimText(action.commandName, 120),
  ].filter((part): part is string => !!part);
  if (parts.length === 0) return undefined;
  return parts.join(' • ');
}

type TimelineKind = 'prompt' | 'summary' | 'tool' | 'response';

const TIMELINE_KIND_LABELS: Record<TimelineKind, string> = {
  prompt: 'Prompt',
  summary: 'Summary',
  tool: 'Tool',
  response: 'Response',
};

interface TimelineEntry {
  kind: TimelineKind;
  title: string;
  detail?: string;
  sessionId: string;
  completed: boolean;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ActiveTaskCardProps {
  title: string;
  workType: WorkTypeModel;
  displayWorkType?: ActiveCardDisplayType;
  sessions: SessionModel[];
  dbTask?: TaskModel;
  isDisconnected?: boolean;
  issueNumber?: number;
  issueTitle?: string;
  initiative?: InitiativeModel;
  workItemId?: string;
  projectNumber?: number;
  telemetryActions?: Map<string, ToolActionModel[]>;
  sessionMessages?: Map<string, MessageModel[]>;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  /** Called with cancellable session ids when the stop button is hit. */
  onCancel?: (sessionIds: string[]) => void;
  /** Pre-resolved ship status (consumer resolves from recorded provenance). */
  shipStatus?: ShipStatusModel;
  /** Open the full task view (SPA nav on web, a webview message in the IDE). */
  onOpenTask?: (task: TaskModel) => void;
  theme?: ThemeMode;
  locale?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActiveTaskCard({
  title,
  workType,
  displayWorkType,
  sessions,
  dbTask,
  isDisconnected,
  issueNumber,
  issueTitle,
  initiative,
  workItemId,
  projectNumber,
  telemetryActions,
  sessionMessages,
  onContinue,
  continueDisabled,
  continueLabel = 'Continue',
  onCancel,
  shipStatus,
  onOpenTask,
  theme = 'dark',
  locale,
}: ActiveTaskCardProps) {
  const [acExpanded, setAcExpanded] = useState(true);
  const commandTimelineRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const sessionDisplayStatuses = new Map<string, DisplayStatusModel>(
    sessions.map((session) => [session.sessionId, session.displayStatus ?? 'stopped']),
  );
  const sessionStatusList = sessions.map(
    (session) => sessionDisplayStatuses.get(session.sessionId) ?? 'stopped',
  );
  const groupDisplayStatus: DisplayStatusModel = sessionStatusList.includes('working')
    ? 'working'
    : sessionStatusList.includes('analyzing')
      ? 'analyzing'
      : sessionStatusList.includes('idle')
        ? 'idle'
        : 'stopped';
  const engagedSessions = sessions.filter((session) =>
    isEngagedDisplayStatus(sessionDisplayStatuses.get(session.sessionId) ?? 'stopped'),
  );
  const isActive = !isDisconnected && isEngagedDisplayStatus(groupDisplayStatus);

  const resolvedDisplayWorkType = displayWorkType ?? workType;

  const sessionStarts = sessions
    .map((s) => s.started_at)
    .filter((v): v is string => !!v)
    .map((v) => new Date(v).getTime());
  const earliestSessionStart = sessionStarts.length > 0 ? Math.min(...sessionStarts) : undefined;

  const startedAt =
    dbTask?.started_at ?? (earliestSessionStart ? new Date(earliestSessionStart).toISOString() : undefined);

  const metadata = (dbTask?.metadata ?? {}) as Record<string, unknown>;
  const runtimeTotalMs = typeof metadata.runtime_ms_total === 'number' ? Math.max(0, metadata.runtime_ms_total) : 0;
  const runtimeCurrentStartedAt =
    typeof metadata.runtime_current_started_at === 'string' ? metadata.runtime_current_started_at : undefined;
  const runtimeTimerStart = isActive ? runtimeCurrentStartedAt ?? startedAt : undefined;
  const startedAtLabel = startedAt ? formatDateTime(startedAt, locale) : undefined;

  const taskStageState = resolvedDisplayWorkType === 'task' ? buildTaskStageState(dbTask) : null;

  const acItems = resolveAcceptanceCriteria(dbTask);
  const hasAC = resolvedDisplayWorkType === 'task' && acItems.length > 0;

  const lineItems = resolvedDisplayWorkType === 'task' ? dbTask?.line_items ?? [] : [];
  const hasLineItems = lineItems.length > 0;

  const planBullets = resolvedDisplayWorkType === 'task' ? parsePlanBullets(dbTask?.source_prompt) : [];

  const totalCost = sessions.reduce((sum, s) => sum + (s.totalCostUsd ?? 0), 0);

  const sessionStartById = new Map(sessions.map((session) => [session.sessionId, session.started_at ?? undefined]));

  // Live fallback actions from responding sessions when no telemetry stream exists.
  const fallbackActions: Array<{ sessionId: string; action: ToolActionModel }> = [];
  for (const session of engagedSessions) {
    const activitySummary = trimText(session.currentAction) || trimText(session.lastActivitySummary);
    const toolContext =
      trimText(session.toolContext) || trimText(session.currentAction) || trimText(session.lastActivitySummary);
    if (!session.currentTool && !activitySummary && !toolContext) continue;
    fallbackActions.push({
      sessionId: session.sessionId,
      action: {
        toolName: session.currentTool ?? 'activity',
        turnNumber: session.totalTurns ?? 0,
        timestamp: session.last_event_at ?? session.started_at ?? new Date().toISOString(),
        completed: false,
        filesAffected: session.filesContext?.map((file) => file.path),
        toolContext,
        activitySummary,
        commandName: session.commandName ?? undefined,
      },
    });
  }

  const messageTimeline: TimelineEntry[] = [];
  const sessionsWithPromptMessages = new Set<string>();
  if (sessionMessages) {
    for (const session of sessions) {
      const messages = sessionMessages.get(session.sessionId) ?? [];
      for (const message of messages) {
        if (message.message_type === 'user_prompt' && isInternalStokdPrompt(message.content)) {
          sessionsWithPromptMessages.add(session.sessionId);
          continue;
        }
        const titleText = trimText(message.content, 220);
        if (!titleText) continue;
        if (message.message_type === 'user_prompt') {
          sessionsWithPromptMessages.add(session.sessionId);
        }
        const kind: TimelineKind =
          message.message_type === 'user_prompt'
            ? 'prompt'
            : message.message_type === 'summary'
              ? 'summary'
              : 'response';
        messageTimeline.push({
          kind,
          title: titleText,
          sessionId: session.sessionId,
          completed: true,
          timestamp: message.created_at,
        });
      }
    }
  }

  for (const session of sessions) {
    if (sessionsWithPromptMessages.has(session.sessionId)) continue;
    const rawPromptText = session.prompt_text ?? session.objectiveSummary ?? session.requestContext;
    if (isInternalStokdPrompt(rawPromptText)) continue;
    const promptText = trimText(rawPromptText, 220);
    if (!promptText) continue;
    messageTimeline.push({
      kind: 'prompt',
      title: promptText,
      sessionId: session.sessionId,
      completed: true,
      timestamp: session.started_at ?? session.last_event_at ?? undefined,
    });
  }

  const telemetryTimeline: TimelineEntry[] = [];
  if (telemetryActions) {
    for (const session of sessions) {
      const actions = telemetryActions.get(session.sessionId) ?? [];
      for (const action of actions) {
        telemetryTimeline.push({
          kind: 'tool',
          title: resolveToolTitle(action),
          detail: resolveToolDetail(action),
          sessionId: session.sessionId,
          completed: action.completed,
          timestamp: action.timestamp,
        });
      }
    }
  }

  const toolTimeline =
    telemetryTimeline.length > 0
      ? [...telemetryTimeline]
      : fallbackActions.map(({ sessionId, action }) => ({
          kind: 'tool' as const,
          title: resolveToolTitle(action),
          detail: resolveToolDetail(action),
          sessionId,
          completed: action.completed,
          timestamp: action.timestamp,
        }));

  if (telemetryTimeline.length > 0 && fallbackActions.length > 0) {
    for (const { sessionId, action: liveAction } of fallbackActions) {
      const nextEntry: TimelineEntry = {
        kind: 'tool',
        title: resolveToolTitle(liveAction),
        detail: resolveToolDetail(liveAction),
        sessionId,
        completed: false,
        timestamp: liveAction.timestamp,
      };
      const lastForSession = [...toolTimeline].reverse().find((entry) => entry.sessionId === sessionId);
      const sameAsLast =
        !!lastForSession &&
        lastForSession.kind === 'tool' &&
        lastForSession.title === nextEntry.title &&
        lastForSession.detail === nextEntry.detail;
      if (sameAsLast && !lastForSession.completed) continue;
      toolTimeline.push(nextEntry);
    }
  }

  const commandTimeline = [...messageTimeline, ...toolTimeline].sort((a, b) => {
    const aTs = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTs = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    if (aTs !== bTs) return aTs - bTs;
    if (a.kind === b.kind) return 0;
    const order: Record<TimelineKind, number> = { prompt: 0, summary: 1, tool: 2, response: 3 };
    return order[a.kind] - order[b.kind];
  });

  const displayedCommands = commandTimeline.slice(-16);
  const firstResponseIdx = displayedCommands.findIndex((entry) => entry.kind === 'response');

  useEffect(() => {
    const node = commandTimelineRef.current;
    if (!node || !shouldAutoScrollRef.current) return;
    node.scrollTop = node.scrollHeight;
  }, [displayedCommands]);

  const finalResponse = trimText(
    [...sessions]
      .flatMap((session) => sessionMessages?.get(session.sessionId) ?? [])
      .filter((message) => message.message_type === 'agent_response')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .at(-1)?.content ||
      dbTask?.resolution ||
      sessions.find((s) => s.state === 'stopped' && s.lastActivitySummary)?.lastActivitySummary ||
      sessions.find((s) => s.lastActivitySummary)?.lastActivitySummary,
    420,
  );

  const taskNumber = dbTask?.hashShort ?? dbTask?.task_number;
  const branch = sessions.find((s) => s.branch)?.branch;
  const isWorktree = branch && branch !== 'main' && branch !== 'master';
  const isTerminalTask = dbTask ? ['completed', 'failed', 'cancelled'].includes(dbTask.status) : false;
  const canContinue =
    !!onContinue && resolvedDisplayWorkType === 'task' && !isDisconnected && !isActive && !isTerminalTask;
  const canCancel =
    !isDisconnected &&
    sessions.some((session) => (sessionDisplayStatuses.get(session.sessionId) ?? 'stopped') !== 'stopped');

  const handleCancel = () => {
    const targetIds = sessions
      .filter((s) => s.state === 'responding' || s.state === 'idle')
      .map((s) => s.sessionId);
    onCancel?.(targetIds);
  };

  const handleCommandTimelineScroll = () => {
    const node = commandTimelineRef.current;
    if (!node) return;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom <= 12;
  };

  const numberBadgeContent = taskNumber ?? dbTask?.hashShort ?? projectNumber;
  const showNumberBadge =
    (taskNumber !== null && taskNumber !== undefined) ||
    (projectNumber !== null && projectNumber !== undefined) ||
    !!dbTask?.hashShort;

  return (
    <div
      data-testid="active-task-card"
      data-worktype={resolvedDisplayWorkType}
      data-active={isActive ? 'true' : 'false'}
      data-theme={theme}
      className="sui-atc"
    >
      {/* Header */}
      <div className="sui-atc__header">
        <div className="sui-atc__header-row">
          <div className="sui-atc__header-left">
            <span className="sui-atc__pulse">
              <span className={`sui-atc__dot${isActive ? ' sui-atc__dot--active' : ''}`} />
              {isActive && <span className="sui-atc__dot sui-atc__dot--ping" />}
            </span>

            {showNumberBadge &&
              (dbTask?.hashShort && onOpenTask ? (
                <button
                  type="button"
                  onClick={() => onOpenTask(dbTask)}
                  title="View full task"
                  className="sui-atc__number-badge sui-atc__number-badge--link"
                >
                  {numberBadgeContent}
                </button>
              ) : (
                <span className="sui-atc__number-badge">{numberBadgeContent}</span>
              ))}

            <span className="sui-atc__type-badge">{WORK_TYPE_LABELS[resolvedDisplayWorkType]}</span>

            <span className="sui-atc__title">{title}</span>

            <PrerequisiteBadge
              prerequisites={dbTask?.prerequisites_status}
              blocked={dbTask?.prerequisites_blocked}
            />
          </div>

          <div className="sui-atc__header-right">
            {(runtimeTotalMs > 0 || runtimeTimerStart) && (
              <div className="sui-atc__timer">
                <Clock className="sui-icon-xs" aria-hidden />
                <LiveTimer
                  startTime={runtimeTimerStart}
                  baseMs={runtimeTotalMs}
                  paused={!isActive}
                  locale={locale}
                />
                <span>total</span>
              </div>
            )}
            <StatusBadge
              status={displayStatusLabel(groupDisplayStatus)}
              type={
                groupDisplayStatus === 'working'
                  ? 'success'
                  : groupDisplayStatus === 'analyzing'
                    ? 'info'
                    : 'neutral'
              }
              pulse={groupDisplayStatus === 'working'}
            />
            {canContinue && (
              <button
                type="button"
                onClick={onContinue}
                disabled={continueDisabled}
                title={`${continueLabel} this task`}
                aria-label={`${continueLabel} task`}
                className="sui-atc__continue"
              >
                <Play className="sui-icon-xs sui-icon-fill" aria-hidden />
                <span>{continueLabel}</span>
              </button>
            )}
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                title="Stop this task"
                aria-label="Stop this task"
                className="sui-atc__stop"
              >
                <Square className="sui-icon-xs sui-icon-fill" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {issueNumber !== null && issueNumber !== undefined && (
          <div className="sui-atc__issue">
            <span className="sui-atc__issue-num">#{issueNumber}</span>
            {issueTitle && <span className="sui-atc__issue-title">{issueTitle}</span>}
          </div>
        )}

        {branch && (
          <div className="sui-atc__branch">
            <GitBranch className={`sui-icon-xs${isWorktree ? ' sui-atc__branch--wt' : ''}`} aria-hidden />
            <span className={`sui-atc__branch-name${isWorktree ? ' sui-atc__branch--wt' : ''}`}>{branch}</span>
          </div>
        )}

        {workItemId && (
          <div className="sui-atc__workitem">
            <Hash className="sui-icon-xs" aria-hidden />
            <span className="sui-atc__workitem-id">{workItemId}</span>
          </div>
        )}

        {dbTask && shipStatus && (
          <div className="sui-atc__ship">
            <ShipStatusChips status={shipStatus} />
          </div>
        )}
      </div>

      {resolvedDisplayWorkType === 'task' && taskStageState && (
        <div className="sui-atc__section">
          <div className="sui-atc__section-head">
            <p className="sui-atc__section-label">Task Stage</p>
            <span className="sui-atc__stage-summary">{taskStageState.summary}</span>
          </div>
          <div data-testid="task-stage-strip" className="sui-atc__stage-strip">
            {taskStageState.stages.map((stage, index) => {
              const isLast = index === taskStageState.stages.length - 1;
              const nextStage = isLast ? null : taskStageState.stages[index + 1];
              const Icon = TASK_STAGE_DEFS[index]?.icon ?? FileText;
              return (
                <div key={stage.id} className="sui-atc__stage">
                  <div className="sui-atc__stage-node">
                    <div className="sui-atc__stage-circle" data-status={stage.status}>
                      <TaskStageIcon status={stage.status} Icon={Icon} />
                    </div>
                    <span className="sui-atc__stage-name" data-status={stage.status}>
                      {stage.label}
                    </span>
                  </div>
                  {!isLast && nextStage && (
                    <div className="sui-atc__stage-conn-wrap">
                      <div
                        className="sui-atc__stage-conn"
                        data-left={stage.status}
                        data-right={nextStage.status}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {planBullets.length > 0 && (
        <div className="sui-atc__section">
          <p className="sui-atc__section-label">Plan</p>
          <div className="sui-atc__list">
            {planBullets.map((bullet, idx) => (
              <div key={idx} className="sui-atc__list-row">
                <Circle className="sui-icon-sm sui-atc__bullet-dim" aria-hidden />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {initiative?.bullets && initiative.bullets.length > 0 && (
        <div className="sui-atc__section sui-atc__list">
          {initiative.bullets.map((bullet, idx) => (
            <div key={idx} className="sui-atc__list-row">
              {bullet.done ? (
                <CheckCircle2 className="sui-icon-sm sui-atc__bullet-done" aria-hidden />
              ) : (
                <Circle className="sui-icon-sm sui-atc__bullet-dim" aria-hidden />
              )}
              <span className={bullet.done ? 'sui-atc__struck' : undefined}>{bullet.text}</span>
            </div>
          ))}
        </div>
      )}

      {hasLineItems && (
        <div data-testid="task-line-items" className="sui-atc__section sui-atc__list">
          <span className="sui-atc__section-label">Line Items ({lineItems.length})</span>
          {lineItems.map((li) => {
            const done = li.status === 'completed' || li.status === 'cancelled';
            return (
              <div key={li.id} className="sui-atc__list-row">
                {done ? (
                  <CheckCircle2 className="sui-icon-sm sui-atc__bullet-done" aria-hidden />
                ) : (
                  <Circle className="sui-icon-sm sui-atc__bullet-dim" aria-hidden />
                )}
                <span className={done ? 'sui-atc__struck' : undefined}>{li.title}</span>
              </div>
            );
          })}
        </div>
      )}

      {hasAC && (
        <div data-testid="task-acceptance-criteria" className="sui-atc__ac">
          <button type="button" onClick={() => setAcExpanded(!acExpanded)} className="sui-atc__ac-toggle">
            {acExpanded ? <ChevronDown className="sui-icon-xs" aria-hidden /> : <ChevronRight className="sui-icon-xs" aria-hidden />}
            <span>Acceptance Criteria ({acItems.length})</span>
          </button>
          {acExpanded && (
            <div className="sui-atc__ac-list">
              {acItems.map((ac) => (
                <div key={ac.id} className="sui-atc__list-row">
                  {ac.passed === true ? (
                    <CheckCircle2 className="sui-icon-sm sui-atc__bullet-done" aria-hidden />
                  ) : ac.passed === false ? (
                    <XCircle className="sui-icon-sm sui-atc__bullet-fail" aria-hidden />
                  ) : (
                    <Circle className="sui-icon-sm sui-atc__bullet-dim" aria-hidden />
                  )}
                  <span className={ac.passed === true ? 'sui-atc__struck' : undefined}>{ac.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {commandTimeline.length === 0 && isActive && (
        <div className="sui-atc__timeline-wrap">
          <div className="sui-atc__timeline-empty">No tool calls yet</div>
        </div>
      )}
      {commandTimeline.length > 0 && (
        <div className="sui-atc__timeline-wrap">
          <div
            ref={commandTimelineRef}
            onScroll={handleCommandTimelineScroll}
            data-testid="command-timeline"
            className="sui-atc__timeline"
          >
            {displayedCommands.map((entry, idx) => {
              const startedAtForEntry = sessionStartById.get(entry.sessionId);
              const timeLabel = formatElapsedLabel(startedAtForEntry, entry.timestamp);
              const isCompletedTool = entry.kind === 'tool' && entry.completed;
              const isCollapsedResponse = entry.kind === 'response' && idx !== firstResponseIdx;
              const chipLabel = isCollapsedResponse ? '-' : TIMELINE_KIND_LABELS[entry.kind];
              return (
                <div
                  key={`${entry.sessionId}-${entry.timestamp ?? String(idx)}-${String(entry.kind)}-${entry.title}`}
                  className="sui-atc__entry"
                >
                  <span className="sui-atc__entry-chip" data-kind={entry.kind}>
                    {chipLabel}
                  </span>
                  <div className="sui-atc__entry-body">
                    <p className={`sui-atc__entry-title${isCompletedTool ? ' sui-atc__struck-dim' : ''}`}>
                      {entry.title}
                    </p>
                    {entry.detail && (
                      <p className={`sui-atc__entry-detail${isCompletedTool ? ' sui-atc__struck-dim' : ''}`}>
                        {entry.detail}
                      </p>
                    )}
                  </div>
                  <div className="sui-atc__entry-meta">
                    {timeLabel && <span className="sui-atc__entry-time">{timeLabel}</span>}
                    {idx === displayedCommands.length - 1 &&
                      groupDisplayStatus === 'working' &&
                      entry.kind === 'tool' &&
                      !entry.completed && <span className="sui-atc__entry-live" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {finalResponse && (
        <div data-testid="final-response-summary" className="sui-atc__timeline-wrap">
          <div className="sui-atc__summary">
            <p className="sui-atc__summary-label">SUMMARY</p>
            <p className="sui-atc__summary-text">{finalResponse}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sui-atc__footer">
        <span className="sui-atc__meta-item">
          {formatNumber(sessions.length, locale)} session{sessions.length !== 1 ? 's' : ''}
          {engagedSessions.length > 0 && engagedSessions.length < sessions.length
            ? ` (${formatNumber(engagedSessions.length, locale)} active)`
            : ''}
        </span>
        <ProviderBadge provider={sessions[0]?.provider || 'claude-code'} size="xs" theme={theme} />
        {startedAtLabel && (
          <span className="sui-atc__meta-item">
            <Clock className="sui-icon-xs" aria-hidden />
            Started {startedAtLabel}
          </span>
        )}
        {initiative && initiative.bullets.length > 0 && (
          <span className="sui-atc__meta-item">
            {formatNumber(initiative.bullets.filter((b) => b.done).length, locale)}/
            {formatNumber(initiative.bullets.length, locale)} tasks
          </span>
        )}
        {totalCost > 0 && (
          <span className="sui-atc__meta-item">
            <DollarSign className="sui-icon-xs" aria-hidden />
            {formatCurrency(totalCost, 'USD', locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
          </span>
        )}
      </div>
    </div>
  );
}
