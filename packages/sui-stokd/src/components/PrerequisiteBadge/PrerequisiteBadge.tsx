import type { PrerequisiteStatusModel } from '../../types';
import './PrerequisiteBadge.css';

export interface PrerequisiteBadgeProps {
  /** Server-derived prerequisite status list (from the work-item record). */
  prerequisites?: PrerequisiteStatusModel[] | null;
  /** Server-derived blocked flag; falls back to "any unsatisfied prerequisite". */
  blocked?: boolean;
}

/**
 * Render-only badge for a work item's prerequisite/blocked state. Shows a
 * "Blocked — waiting on N prerequisites" pill while any prerequisite is
 * unsatisfied, a quiet "Prerequisites met" once they all complete, and nothing
 * when the work item declares no prerequisites. Never participates in ordering.
 */
export function PrerequisiteBadge({ prerequisites, blocked }: PrerequisiteBadgeProps) {
  const list = prerequisites ?? [];
  if (list.length === 0) {
    return null;
  }

  const pending = list.filter((p) => !p.satisfied);
  const isBlocked = blocked ?? pending.length > 0;

  if (!isBlocked) {
    return (
      <span
        data-testid="prereq-badge"
        data-blocked="false"
        className="sui-prereq-badge sui-prereq-badge--met"
      >
        Prerequisites met
      </span>
    );
  }

  const label = (p: PrerequisiteStatusModel) => `${p.title ?? p.hashShort ?? p.hash} (${p.status})`;

  return (
    <span
      data-testid="prereq-badge"
      data-blocked="true"
      title={`Waiting on: ${pending.map(label).join(', ')}`}
      className="sui-prereq-badge sui-prereq-badge--blocked"
    >
      Blocked — waiting on {pending.length} prerequisite{pending.length === 1 ? '' : 's'}
    </span>
  );
}
