import * as React from "react";
import { IMediaFile } from "@stoked-ui/media-selector";

/**
 * Importing required components and libraries
 */
import Select, {SelectChangeEvent} from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import {useEditorContext} from "../EditorProvider/EditorContext";
import {VersionProps} from "./EditorScreener.types";
import {MediaScreener} from "../Editor/Editor.styled";
import {styled} from "../internals/zero-styled";

/**
 * Styled component for VersionRoot
 */
const VersionRoot = styled(FormControl)({
  justifySelf: 'flex-end',
  alignContent: 'center',
  marginRight: '2px',
});

/**
 * Styled component for VersionSelect
 */
const VersionSelect = styled(Select)(({ theme }) => ({
  height: 40,
  background: theme.palette.background.default,
  '& .MuiSelect-select': {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 600,
    py: '4px',
    fontSize: 16,
  },
}));

/**
 * Function component for rendering the version select
 * @param {VersionProps} props - Props for the Version component
 * @returns {JSX.Element | undefined} - The rendered JSX element or undefined if no versions are available
 */
function Versions ({currentVersion, setCurrentVersion }: VersionProps) {
  /**
   * Getting file and settings from EditorContext
   */
  const { state: { file, settings }  } = useEditorContext();
  const { timeline: { versions }} = settings;

  /**
   * Handling version change event
   * @param {SelectChangeEvent<unknown>} event - The select change event
   */
  const handleVersionChange = async (event: SelectChangeEvent<unknown>) => {
    console.info('handle version change', event);
  }

  /**
   * Effect hook to load versions when file is available
   */
  React.useEffect(() => {
    if (file) {
      // file.loadOutput()
      //   .then((idbVersions) => dispatch({ type: 'LOAD_VERSIONS', payload: idbVersions ?? [] }))
    }
  }, [])

  /**
   * Effect hook to update versions when settings change
   */
  React.useEffect(() => {

  }, [versions])

  if (!versions.length) {
    return undefined;
  }
  return  <VersionRoot sx={{minWidth: '200px', marginRight: '6px'}} className="rate-control">
    <VersionSelect
      value={currentVersion}
      onChange={handleVersionChange}
      inputProps={{'aria-label': 'Play Rate'}}
      defaultValue={versions[versions.length - 1].id}
    >
      <MenuItem key={-1} value={-1}>
        <em>Version</em>
      </MenuItem>
      {versions.map((version: IMediaFile, index: number) => (<MenuItem key={index} value={version.id}>
        {version.name} v{version.media.version}
      </MenuItem>))}
    </VersionSelect>
  </VersionRoot>
}

export default Versions;