import * as React from 'react';
import { FileExplorerProps } from './FileExplorer.types';
import { FileExplorer } from './FileExplorer';
import { FeatureFlag, useFeatureFlag } from '../featureFlags';
import { FileExplorerLegacy } from './FileExplorerLegacy';

/**
 * FileExplorer with Feature Flag Integration
 *
 * This component wraps the FileExplorer and provides feature flag-based
 * rendering with automatic fallback to legacy rendering when needed.
 *
 * **Feature Flags:**
 * - useMuiXRendering: Controls whether to use MUI X RichTreeView or legacy rendering
 * - dndInternal: Controls internal drag-and-drop
 * - dndExternal: Controls external drag-and-drop
 * - dndTrash: Controls trash management
 *
 * **Rollback Capability:**
 * When useMuiXRendering=false, automatically falls back to legacy rendering
 * without any user-visible errors.
 *
 * @example
 * ```tsx
 * import { FeatureFlagProvider } from '@stoked-ui/file-explorer/featureFlags';
 * import { FileExplorerWithFlags } from '@stoked-ui/file-explorer';
 *
 * <FeatureFlagProvider userId="user-123">
 *   <FileExplorerWithFlags items={files} />
 * </FeatureFlagProvider>
 * ```
 */
export const FileExplorerWithFlags = React.forwardRef(function FileExplorerWithFlags<
  Multiple extends boolean | undefined = undefined,
>(props: FileExplorerProps<Multiple>, ref: React.Ref<HTMLUListElement>) {
  // Check if MUI X rendering is enabled
  const useMuiXRendering = useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING);

  // Check feature-specific flags
  const dndInternalEnabled = useFeatureFlag(FeatureFlag.DND_INTERNAL);
  const dndExternalEnabled = useFeatureFlag(FeatureFlag.DND_EXTERNAL);
  const dndTrashEnabled = useFeatureFlag(FeatureFlag.DND_TRASH);

  // Work Item 4.4: Feature Flag Implementation - Rollback Capability
  // When useMuiXRendering is disabled, fall back to legacy rendering
  if (!useMuiXRendering) {
    return <FileExplorerLegacy ref={ref} {...props} />;
  }

  // Work Item 4.4: Feature flags control each major feature independently
  // Override prop-based flags with feature flag state
  const enhancedProps = {
    ...props,
    // AC-4.4.a: Feature flags control each major feature independently
    dndInternal: dndInternalEnabled ? props.dndInternal : undefined,
    dndExternal: dndExternalEnabled ? props.dndExternal : undefined,
    dndTrash: dndTrashEnabled ? props.dndTrash : undefined,
  };

  // Use MUI X rendering (current implementation)
  return <FileExplorer ref={ref} {...enhancedProps} />;
});

/**
 * Type export for FileExplorerWithFlags
 */
export type FileExplorerWithFlagsComponent = typeof FileExplorerWithFlags;
