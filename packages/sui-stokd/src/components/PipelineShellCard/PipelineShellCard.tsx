import { Clock3, GitBranch, LoaderCircle } from 'lucide-react';
import type { DisplayStatusModel, PipelineStageId, PipelineStageModel } from '../../types';
import { isEngagedDisplayStatus } from '../../utils/status';
import { formatDateTime } from '../../utils/format';
import './PipelineShellCard.css';

export interface PipelineShellCardProps {
  title: string;
  projectNumber?: number;
  branchHint?: string;
  displayStatus?: DisplayStatusModel;
  currentStage?: PipelineStageId;
  startedAt?: string;
  locale?: string;
}

const PLACEHOLDER_STAGES: PipelineStageModel[] = [
  { stage_id: 'analysis', name: 'Analysis', status: 'pending' },
  { stage_id: 'planning', name: 'Planning', status: 'pending' },
  { stage_id: 'implementation', name: 'Implementation', status: 'pending' },
  { stage_id: 'validation', name: 'Validation', status: 'pending' },
  { stage_id: 'integration', name: 'Integration', status: 'pending' },
];

function badgeLabel(displayStatus: DisplayStatusModel): string {
  if (displayStatus === 'working') return 'Working';
  if (displayStatus === 'analyzing') return 'Analyzing';
  if (displayStatus === 'idle') return 'Idle';
  return 'Stopped';
}

/**
 * A lightweight project-pipeline shell card shown while the full pipeline view
 * loads. Renders a stepper of the five execution phases with the current stage
 * marked in-progress when the session is engaged.
 */
export function PipelineShellCard({
  title,
  projectNumber,
  branchHint,
  displayStatus = 'analyzing',
  currentStage = 'implementation',
  startedAt,
  locale,
}: PipelineShellCardProps) {
  const engaged = isEngagedDisplayStatus(displayStatus);
  const stages = PLACEHOLDER_STAGES.map((stage) =>
    stage.stage_id === currentStage && engaged ? { ...stage, status: 'in_progress' as const } : stage,
  );
  const startedAtLabel = startedAt ? formatDateTime(startedAt, locale) : undefined;

  return (
    <div data-testid="pipeline-shell-card" data-status={displayStatus} className="sui-psc">
      <div className="sui-psc__stepper">
        {stages.map((stage) => (
          <div
            key={stage.stage_id}
            className="sui-psc__step"
            data-status={stage.status}
            data-current={engaged && stage.stage_id === currentStage ? 'true' : 'false'}
          >
            <span className="sui-psc__step-dot" />
            <span className="sui-psc__step-name">{stage.name}</span>
          </div>
        ))}
      </div>

      <div className="sui-psc__body">
        <div className="sui-psc__badges">
          {projectNumber !== null && projectNumber !== undefined && (
            <span className="sui-psc__number">{projectNumber}</span>
          )}
          <span className="sui-psc__type">Project</span>
          <span className="sui-psc__status" data-status={displayStatus}>
            <span className="sui-psc__status-dot" />
            {badgeLabel(displayStatus)}
          </span>
        </div>

        <div className="sui-psc__meta">
          <h2 className="sui-psc__title">{title}</h2>
          {branchHint && (
            <span className="sui-psc__branch">
              <GitBranch className="sui-icon-xs" aria-hidden />
              {branchHint}
            </span>
          )}
          {startedAtLabel && (
            <span className="sui-psc__started">
              <Clock3 className="sui-icon-xs" aria-hidden />
              Started {startedAtLabel}
            </span>
          )}
        </div>

        <div className="sui-psc__note">
          <LoaderCircle
            className={`sui-icon-sm${engaged ? ' sui-psc__spin' : ' sui-psc__note-idle'}`}
            aria-hidden
          />
          <span>
            {displayStatus === 'idle'
              ? 'Project session is idle and waiting for the next prompt while pipeline data remains attached to this request.'
              : 'Project execution is attached to this request. Loading the full pipeline view.'}
          </span>
        </div>
      </div>
    </div>
  );
}
