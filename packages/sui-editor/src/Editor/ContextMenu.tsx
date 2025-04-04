/**
 * Context Menu component
 *
 * This component provides a context menu for the editor, allowing users to view track details,
 * set blend modes and fit options, and send an email.
 */

export default function ContextMenu({
  /**
   * The type of context menu item (track, action, or project)
   */
  type: 'DETAIL_TRACK' | 'DETAIL_ACTION' | 'DETAIL_PROJECT',
  /**
   * The current editor context
   */
  context: IEditorAction | IEditorTrack | IEditorFile,
}) {
  /**
   * Get the current editor settings and dispatch function from the context provider
   */
  const { state: { settings }, dispatch } = useEditorContext();

  /**
   * Handle close event for the context menu
   */
  const handleClose = () => {
    const { contextMenu, ...updatedSettings } = settings;
    dispatch({ type: 'SET_SETTING', payload: { key: 'contextMenu', value: updatedSettings } })
  };

  /**
   * Handle track detail click event
   */
  const handleTrackDetail = () => {
    dispatch({ type: 'DETAIL_OPEN' });
  }

  /**
   * Get the name of the context menu item based on its type
   *
   * @returns {string} The name of the context menu item (track, action, or project)
   */
  const getName = () => {
    switch (type) {
      case 'DETAIL_TRACK':
        return 'Track';
      case 'DETAIL_ACTION':
        return 'Action';
      case 'DETAIL_PROJECT':
        return 'Project';
      default:
        throw new Error('Invalid type');
    }
  }

  /**
   * Handle blend mode change event
   *
   * @param {SelectChangeEvent<BlendMode>} event The select change event
   * @param {React.ReactNode} child The child component
   */
  const handleBlendMode = (event: SelectChangeEvent<BlendMode>, child: React.ReactNode) => {
    dispatch({ type: 'SET_BLEND_MODE', payload: { contextId: context.id, value: event.target.value as BlendMode } })
  }

  /**
   * Handle fit change event
   *
   * @param {SelectChangeEvent<Fit>} event The select change event
   * @param {React.ReactNode} child The child component
   */
  const handleFit = (event: SelectChangeEvent<Fit>, child: React.ReactNode) => {
    dispatch({ type: 'SET_FIT', payload: { contextId: context.id, value: event.target.value as Fit } })
  }

  return (
    <Menu
      open={settings.contextMenu}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        settings.contextMenu !== null
          ? { top: settings.contextMenu.mouseY, left: settings.contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={handleClose}>{`View ${getName()} Detail`}</MenuItem>
      <MenuItem onClick={handleClose}>
        <FormControl fullWidth>
          <InputLabel id="set-blend-mode">Blend Mode</InputLabel>
          <Select
            labelId="set-blend-mode"
            id="set-blend-mode-select"
            value={context.blendMode}
            label="Set Blend Mode"
            onChange={handleBlendMode}
          >
            <MenuItem value={'normal'}>normal</MenuItem>
            <MenuItem value={'multiply'}>multiply</MenuItem>
            <MenuItem value={'screen'}>screen</MenuItem>
            <MenuItem value={'overlay'}>overlay</MenuItem>
            <MenuItem value={'darken'}>darken</MenuItem>
            <MenuItem value={'lighten'}>lighten</MenuItem>
            <MenuItem value={'color-dodge'}>color-dodge</MenuItem>
            <MenuItem value={'color-burn'}>color-burn</MenuItem>
            <MenuItem value={'hard-light'}>hard-light</MenuItem>
            <MenuItem value={'soft-light'}>soft-light</MenuItem>
            <MenuItem value={'difference'}>difference</MenuItem>
            <MenuItem value={'exclusion'}>exclusion</MenuItem>
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onClick={handleClose}>
        <FormControl fullWidth>
          <InputLabel id="set-fit">Fit</InputLabel>
          <Select
            labelId="set-fit"
            id="set-fit-select"
            value={context.fit}
            label="Set Fit"
            onChange={handleFit}
          >
            <MenuItem value={'none'}>none</MenuItem>
            <MenuItem value={'contain'}>contain</MenuItem>
            <MenuItem value={'cover'}>cover</MenuItem>
            <MenuItem value={'fill'}>fill</MenuItem>
            <MenuItem value={'inside'}>inside</MenuItem>
            <MenuItem value={'outside'}>outside</MenuItem>
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onClick={handleClose}>Email</MenuItem>
    </Menu>
  );
}