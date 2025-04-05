/**
 * React component for displaying and selecting versions.
 * @param {VersionProps} props - The props for the component.
 * @property {string} props.currentVersion - The current version.
 * @property {function} props.setCurrentVersion - Function to set the current version.
 * @returns {JSX.Element} - The rendered component.
 * @example
 * <Versions currentVersion="1.0" setCurrentVersion={handleVersionChange} />
 */
function Versions({ currentVersion, setCurrentVersion }: VersionProps) {
  const { state: { file, settings } } = useEditorContext();
  const { timeline: { versions } } = settings;

  /**
   * Handles the change event when selecting a version.
   * @param {SelectChangeEvent<unknown>} event - The select change event.
   */
  const handleVersionChange = async (event: SelectChangeEvent<unknown>) => {
    console.info('handle version change', event);
  }

  React.useEffect(() => {
    if (file) {
      // file.loadOutput()
      //   .then((idbVersions) => dispatch({ type: 'LOAD_VERSIONS', payload: idbVersions ?? [] }))
    }
  }, [])

  React.useEffect(() => {

  }, [versions])

  if (!versions.length) {
    return undefined;
  }

  return (
    <VersionRoot sx={{minWidth: '200px', marginRight: '6px'}} className="rate-control">
      <VersionSelect
        value={currentVersion}
        onChange={handleVersionChange}
        inputProps={{ 'aria-label': 'Play Rate' }}
        defaultValue={versions[versions.length - 1].id}
      >
        <MenuItem key={-1} value={-1}>
          <em>Version</em>
        </MenuItem>
        {versions.map((version: IMediaFile, index: number) => (
          <MenuItem key={index} value={version.id}>
            {version.name} v{version.media.version}
          </MenuItem>
        ))}
      </VersionSelect>
    </VersionRoot>
  );
}