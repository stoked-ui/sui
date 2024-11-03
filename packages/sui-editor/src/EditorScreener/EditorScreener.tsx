import {useEditorContext} from "../EditorProvider";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import * as React from "react";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { IMediaFile } from "@stoked-ui/media-selector";
import {EditorScreenerProps, VersionProps} from "./EditorScreener.types";
import {EditorPopover, MediaScreener} from "../Editor/Editor.styled";
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
  const { id, file, versions, engine, dispatch } = useEditorContext();
  const handleVersionChange = async (event: SelectChangeEvent<unknown>) => {
   /*  const outputData = await file!.loadOutput()
    engine.screenerBlob = screenerBlob;
    setCurrentVersion(versions.key); */
    console.info('handle version change', event);
  }

  React.useEffect(() => {
    if (file) {
      file.loadOutput()
        .then((idbVersions) => dispatch({ type: 'LOAD_VERSIONS', payload: idbVersions ?? [] }))
    }
  }, [])

  React.useEffect(() => {
    /* if (versions.length && engine) {
      const previousVersion = versions[versions.length - 1];
      if (!engine.screenerBlob || engine.screenerBlob.key !== previousVersion.key) {
        EditorEngine.loadVersion(previousVersion.key)
        .then((blob) => {
          engine.screenerBlob = blob
        })
        .catch((err) => {
          console.error(`Error loading previous version: ${previousVersion.id} v${previousVersion.version} - ${err}`)
        })
      }
    } */
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

const EditorScreenerMobile = React.forwardRef(function EditorScreenerMobile(
  inProps: EditorScreenerProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { versions, detailAnchor, file, engine, dispatch } = useEditorContext();

  if (engine) {
    engine.detailMode = true;
  }

  const commonProps = {
    tracks: file?.tracks ?? [],
    engine,
  };

  return (
    <EditorPopover
      ref={ref}
      open={!!detailAnchor}
    >
      <MediaScreener mediaFile={inProps.mediaFile} />
    </EditorPopover>);
})

