import type { StatusKind } from '../../types';
import './StatusBadge.css';

export interface StatusBadgeProps {
  status: string;
  type?: StatusKind;
  className?: string;
  pulse?: boolean;
}

/** A small status pill with an optional pulsing dot. */
export function StatusBadge({ status, type = 'neutral', className = '', pulse = false }: StatusBadgeProps) {
  return (
    <span data-testid="status-badge" data-type={type} className={`sui-status-badge ${className}`.trim()}>
      {type !== 'neutral' && (
        <span className="sui-status-badge__dot-wrap">
          <span className="sui-status-badge__dot" />
          {pulse && <span className="sui-status-badge__dot sui-status-badge__dot--ping" />}
        </span>
      )}
      {status}
    </span>
  );
}
