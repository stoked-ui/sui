import * as React from "react";
import { IMediaFile } from "@stoked-ui/media-selector";

import Select, {SelectChangeEvent} from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import {useEditorContext} from "../EditorProvider/EditorContext";
import {VersionProps} from "./EditorScreener.types";
import {MediaScreener} from "../Editor/Editor.styled";
import {styled} from "../internals/zero-styled";

const VersionRoot = styled(FormControl)({
  justifySelf: 'flex-end',
  alignContent: 'center',
  marginRight: '2px',
});

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

function Versions ({currentVersion, setCurrentVersion }: VersionProps) {
  const { file, settings,  } = useEditorContext();
  const { timeline: { versions }} = settings;
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
        {version.name} v{version.version}
      </MenuItem>))}
    </VersionSelect>
  </VersionRoot>
}
