import { useEffect, useMemo, useRef } from 'react';
import { Bot, Circle, Clock, DollarSign, Square, Terminal, WandSparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DisplayStatusModel, MessageModel, SessionModel, ToolActionModel } from '../../types';
import { ProviderBadge } from '../ProviderBadge';
import { StatusBadge } from '../StatusBadge';
import {
  displayStatusKind,
  displayStatusLabel,
  isEngagedDisplayStatus,
  pickGroupDisplayStatus,
} from '../../utils/status';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/format';
import {
  formatToolName,
  fullText,
  meaningfulActionText,
  sameAsTitle,
  summarizeFiles,
  trimText,
} from '../../utils/text';
import './InteractiveSessionCard.css';

type InteractiveEntryKind = 'user' | 'thinking' | 'assistant' | 'tool';

interface InteractiveEntry {
  id: string;
  sessionId: string;
  kind: InteractiveEntryKind;
  text: string;
  detail?: string;
  timestamp?: string;
  completed?: boolean;
}

export interface InteractiveSessionCardProps {
  title: string;
  sessions: SessionModel[];
  isDisconnected?: boolean;
  telemetryActions?: Map<string, ToolActionModel[]>;
  sessionMessages?: Map<string, MessageModel[]>;
  /** Called with the set of cancellable session ids when the stop button is hit. */
  onCancel?: (sessionIds: string[]) => void;
  /** BCP-47 locale for number/date formatting. */
  locale?: string;
}

function roleLabel(kind: InteractiveEntryKind): string {
  if (kind === 'user') return 'Prompt';
  if (kind === 'thinking') return 'Summary';
  if (kind === 'tool') return 'Tool';
  return 'Response';
}

function kindIcon(kind: InteractiveEntryKind): LucideIcon {
  if (kind === 'user') return Circle;
  if (kind === 'thinking') return WandSparkles;
  if (kind === 'tool') return Terminal;
  return Bot;
}

function earliestStartedAt(sessions: SessionModel[]): string | undefined {
  const starts = sessions
    .map((session) => session.started_at)
    .filter((value): value is string => !!value)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));
  if (starts.length === 0) return undefined;
  return new Date(Math.min(...starts)).toISOString();
}

/** Interactive planning chat card: a streaming conversation bubble feed. */
export function InteractiveSessionCard({
  title,
  sessions,
  isDisconnected,
  telemetryActions,
  sessionMessages,
  onCancel,
  locale,
}: InteractiveSessionCardProps) {
  const sessionDisplayStatuses = new Map<string, DisplayStatusModel>(
    sessions.map((session) => [session.sessionId, session.displayStatus ?? 'stopped']),
  );
  const groupDisplayStatus = pickGroupDisplayStatus(
    sessions.map((session) => sessionDisplayStatuses.get(session.sessionId) ?? 'stopped'),
  );
  const isActive = !isDisconnected && isEngagedDisplayStatus(groupDisplayStatus);
  const totalCost = sessions.reduce((sum, session) => sum + (session.totalCostUsd ?? 0), 0);
  const startedAt = earliestStartedAt(sessions);
  const startedAtLabel = startedAt ? formatDateTime(startedAt, locale) : undefined;
  const canCancel =
    !isDisconnected &&
    sessions.some((session) => (sessionDisplayStatuses.get(session.sessionId) ?? 'stopped') !== 'stopped');

  const entries = useMemo(() => {
    const next: InteractiveEntry[] = [];
    const sessionsWithPromptMessages = new Set<string>();

    for (const session of sessions) {
      const messages = sessionMessages?.get(session.sessionId) ?? [];
      for (const message of messages) {
        const text = fullText(message.content);
        if (!text) continue;
        if (message.message_type === 'user_prompt') {
          sessionsWithPromptMessages.add(session.sessionId);
        }
        next.push({
          id: message.message_id ?? `msg-${session.sessionId}-${message.created_at}`,
          sessionId: session.sessionId,
          kind:
            message.message_type === 'user_prompt'
              ? 'user'
              : message.message_type === 'summary'
                ? 'thinking'
                : 'assistant',
          text,
          timestamp: message.created_at,
          completed: true,
        });
      }
    }

    for (const session of sessions) {
      if (sessionsWithPromptMessages.has(session.sessionId)) continue;
      const text = fullText(session.prompt_text ?? session.requestContext ?? session.objectiveSummary);
      if (!text) continue;
      if (sameAsTitle(text, title)) continue;
      next.push({
        id: `fallback-prompt-${session.sessionId}`,
        sessionId: session.sessionId,
        kind: 'user',
        text,
        timestamp: session.started_at ?? session.last_event_at ?? undefined,
        completed: true,
      });
    }

    for (const session of sessions) {
      const actions = telemetryActions?.get(session.sessionId) ?? [];
      for (const action of actions) {
        const text = meaningfulActionText(action.activitySummary, 220) ?? formatToolName(action.toolName);
        const detail = [
          trimText(action.toolContext, 180),
          trimText(summarizeFiles(action.filesAffected), 180),
          trimText(action.commandName, 120),
        ]
          .filter((part): part is string => !!part)
          .join(' • ');
        next.push({
          id: `tool-${session.sessionId}-${action.timestamp ?? text}-${action.turnNumber}`,
          sessionId: session.sessionId,
          kind: 'tool',
          text,
          detail: detail || undefined,
          timestamp: action.timestamp,
          completed: action.completed,
        });
      }
    }

    for (const session of sessions) {
      if (telemetryActions?.get(session.sessionId)?.length) continue;
      const text = meaningfulActionText(session.currentAction ?? session.lastActivitySummary, 220);
      const detail = trimText(
        [session.currentTool ? formatToolName(session.currentTool) : undefined, session.toolContext]
          .filter((part): part is string => !!part)
          .join(' • '),
        200,
      );
      if (!text && !detail && !session.currentTool) continue;
      next.push({
        id: `live-tool-${session.sessionId}`,
        sessionId: session.sessionId,
        kind: 'tool',
        text: text ?? formatToolName(session.currentTool ?? undefined),
        detail,
        timestamp: session.last_event_at ?? session.started_at ?? undefined,
        completed: false,
      });
    }

    return next.sort((a, b) => {
      const aTs = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTs = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTs - bTs;
    });
  }, [sessionMessages, sessions, telemetryActions, title]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pinnedToBottomRef = useRef(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinnedToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  const handleConversationScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  const handleCancel = () => {
    const targetIds = sessions
      .filter((session) => (sessionDisplayStatuses.get(session.sessionId) ?? 'stopped') !== 'stopped')
      .map((session) => session.sessionId);
    onCancel?.(targetIds);
  };

  return (
    <div
      data-testid="interactive-session-card"
      data-active={isActive ? 'true' : 'false'}
      className="sui-isc"
    >
      <div className="sui-isc__header">
        <div className="sui-isc__header-main">
          <div className="sui-isc__title-row">
            <span className="sui-isc__pulse">
              <span className={`sui-isc__dot${isActive ? ' sui-isc__dot--active' : ''}`} />
              {isActive && <span className="sui-isc__dot sui-isc__dot--ping" />}
            </span>
            <span className="sui-isc__type-badge">Planning</span>
            <span className="sui-isc__title">{title}</span>
          </div>
          <div className="sui-isc__meta">
            <ProviderBadge provider={sessions[0]?.provider || 'claude-code'} size="xs" />
            <span className="sui-isc__meta-item">
              {formatNumber(sessions.length, locale)} session{sessions.length !== 1 ? 's' : ''}
            </span>
            {startedAtLabel && (
              <span className="sui-isc__meta-item">
                <Clock className="sui-icon-xs" aria-hidden />
                Started {startedAtLabel}
              </span>
            )}
            {totalCost > 0 && (
              <span className="sui-isc__meta-item">
                <DollarSign className="sui-icon-xs" aria-hidden />
                {formatCurrency(totalCost, 'USD', locale, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}
              </span>
            )}
          </div>
        </div>

        <div className="sui-isc__header-actions">
          <StatusBadge
            status={displayStatusLabel(groupDisplayStatus)}
            type={displayStatusKind(groupDisplayStatus)}
            pulse={groupDisplayStatus === 'working'}
          />
          {canCancel && onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              title="Stop this session"
              aria-label="Stop this session"
              className="sui-isc__stop"
            >
              <Square className="sui-icon-xs sui-icon-fill" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleConversationScroll}
        data-testid="interactive-conversation"
        className="sui-isc__conversation"
      >
        {entries.length === 0 ? (
          <div className="sui-isc__empty">Waiting for conversation events.</div>
        ) : (
          entries.map((entry) => {
            const Icon = kindIcon(entry.kind);
            return (
              <div
                key={entry.id}
                className={`sui-isc__row${entry.kind === 'user' ? ' sui-isc__row--end' : ''}`}
              >
                <div className="sui-isc__bubble" data-kind={entry.kind}>
                  <div className="sui-isc__bubble-head">
                    <Icon className="sui-icon-xs" aria-hidden />
                    <span>{roleLabel(entry.kind)}</span>
                  </div>
                  <p className="sui-isc__bubble-text">{entry.text}</p>
                  {entry.detail && <p className="sui-isc__bubble-detail">{entry.detail}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
