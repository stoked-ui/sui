import { Check, Circle } from 'lucide-react';
import type { ShipStatusModel } from '../../types';
import './ShipStatusChips.css';

export interface ShipStatusChipsProps {
  status: ShipStatusModel;
  className?: string;
}

const CHIP_DEFS: Array<{ key: keyof ShipStatusModel; label: string }> = [
  { key: 'main', label: 'main' },
  { key: 'stage', label: 'stage' },
  { key: 'prod', label: 'prod' },
];

/**
 * Ship-status mini-pipeline (AX-REPO-SHIP-PROVENANCE): main → stage → prod,
 * always all three, dim until achieved. State is passed in already-resolved
 * from recorded provenance — this component never queries anything.
 */
export function ShipStatusChips({ status, className = '' }: ShipStatusChipsProps) {
  return (
    <div data-testid="ship-status-chips" className={`sui-ship-chips ${className}`.trim()}>
      {CHIP_DEFS.map(({ key, label }) => {
        const achieved = status[key];
        return (
          <span
            key={key}
            data-testid={`ship-status-chip-${key}`}
            data-state={achieved ? 'achieved' : 'pending'}
            data-env={key}
            title={achieved ? `Shipped to ${label}` : `Not yet on ${label}`}
            className="sui-ship-chip"
          >
            {achieved ? (
              <Check className="sui-ship-chip__icon" aria-hidden />
            ) : (
              <Circle className="sui-ship-chip__icon sui-ship-chip__icon--dim" aria-hidden />
            )}
            {label}
          </span>
        );
      })}
    </div>
  );
}
