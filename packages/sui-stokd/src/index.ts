/**
 * @stoked-ui/stokd — Stokd "Current Activity" UX.
 *
 * Host-agnostic, CSS-variable-themed React components plus the view-model types
 * that are their data contract. Import the default theme once per host:
 *
 *   import '@stoked-ui/stokd/theme.css';
 *
 * then override the --sui-* variables to match the host (Tailwind tokens on the
 * web, --vscode-* tokens in a VS Code webview).
 */

export * from './types';

export {
  formatDuration,
  formatDateTime,
  formatNumber,
  formatCurrency,
} from './utils/format';
export {
  isEngagedDisplayStatus,
  pickGroupDisplayStatus,
  displayStatusLabel,
  displayStatusKind,
  isGenericSessionTitle,
  GROUP_STATUS_ORDER,
} from './utils/status';
export {
  groupSessionsByRequest,
  compareSessionGroups,
} from './grouping/groupSessions';
export type { GroupKeyResolution } from './grouping/groupSessions';

export { ShipStatusChips } from './components/ShipStatusChips';
export type { ShipStatusChipsProps } from './components/ShipStatusChips';

export { StatusBadge } from './components/StatusBadge';
export type { StatusBadgeProps } from './components/StatusBadge';

export { LiveTimer } from './components/LiveTimer';
export type { LiveTimerProps } from './components/LiveTimer';

export { ProviderBadge, normalizeProviderId, providerLabel } from './components/ProviderBadge';
export type { ProviderBadgeProps } from './components/ProviderBadge';

export { PrerequisiteBadge } from './components/PrerequisiteBadge';
export type { PrerequisiteBadgeProps } from './components/PrerequisiteBadge';

export { ActiveTaskCard } from './components/ActiveTaskCard';
export type { ActiveTaskCardProps } from './components/ActiveTaskCard';

export { InteractiveSessionCard } from './components/InteractiveSessionCard';
export type { InteractiveSessionCardProps } from './components/InteractiveSessionCard';

export { PipelineShellCard } from './components/PipelineShellCard';
export type { PipelineShellCardProps } from './components/PipelineShellCard';
