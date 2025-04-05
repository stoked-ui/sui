/**
 * ContextMenu component for displaying context menu options.
 *
 * @param {Object} props - The props object.
 * @param {string} props.type - The type of context menu ('DETAIL_TRACK' | 'DETAIL_ACTION' | 'DETAIL_PROJECT').
 * @param {Object} props.context - The context object (IEditorAction | IEditorTrack | IEditorFile).
 * 
 * @returns {JSX.Element} The rendered ContextMenu component.
 * 
 * @example
 * <ContextMenu type='DETAIL_TRACK' context={trackData} />
 * <ContextMenu type='DETAIL_ACTION' context={actionData} />
 * <ContextMenu type='DETAIL_PROJECT' context={projectData} />
 */
export default function ContextMenu({ type, context }:{ type: 'DETAIL_TRACK' | 'DETAIL_ACTION' | 'DETAIL_PROJECT', context: IEditorAction | IEditorTrack | IEditorFile }) {
  const { state: { settings }, dispatch } = useEditorContext();

  /**
   * Handles closing the context menu.
   */
  const handleClose = () => {
    const { contextMenu, ...updatedSettings } = settings;
    dispatch({ type: 'SET_SETTING', payload: { key: 'contextMenu', value: updatedSettings }})
  };

  /**
   * Handles opening the detail view for a track.
   */
  const handleTrackDetail = () => {
    dispatch({ type: 'DETAIL_OPEN' });
  }

  /**
   * Gets the name based on the context type.
   * 
   * @returns {string} The name based on the context type.
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
   * Handles setting the blend mode.
   * 
   * @param {SelectChangeEvent<BlendMode>} event - The select change event.
   * @param {React.ReactNode} child - The child element.
   */
  const handleBlendMode = (event: SelectChangeEvent<BlendMode>, child: React.ReactNode) => {
    dispatch({ type: 'SET_BLEND_MODE', payload: { contextId: context.id, value: event.target.value as BlendMode }})
  }

  /**
   * Handles setting the fit.
   * 
   * @param {SelectChangeEvent<Fit>} event - The select change event.
   * @param {React.ReactNode} child - The child element.
   */
  const handleFit = (event: SelectChangeEvent<Fit>, child: React.ReactNode) => {
    dispatch({ type: 'SET_FIT', payload: { contextId: context.id, value: event.target.value as Fit }})
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
            <MenuItem value={'hue'}>hue</MenuItem>
            <MenuItem value={'saturation'}>saturation</MenuItem>
            <MenuItem value={'color'}>color</MenuItem>
            <MenuItem value={'luminosity'}>luminosity</MenuItem>
            <MenuItem value={'plus-darker'}>plus-darker</MenuItem>
            <MenuItem value={'plus-lighter'}>plus-lighter</MenuItem>
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
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onClick={handleClose}>Email</MenuItem>
    </Menu>
  );
}