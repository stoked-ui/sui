import * as React from "react";
import { Breadcrumbs, Link, styled, Typography } from "@mui/material";
import DetailTracks from "./DetailTracks";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { IEditorAction } from "../EditorAction";
import DetailActions from "./DetailActions";

const Root = styled(Breadcrumbs, {
})(({ theme }) => ({
  '& p.MuiFormHelperText-root.MuiFormHelperText-sizeSmall.MuiFormHelperText-contained': {
    display: 'none'
  },
  '& li .MuiBox-root .MuiFormControl-root .MuiFormLabel-root': {
    padding: 0
  },
  '& .MuiFormLabel-root.MuiInputLabel-root':{
    '& .MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-shrink': {
      display: 'none'
    }
  }
}))
export function DetailBreadcrumbs(){
  const sxSelectedLabel = (theme) => ({ color: theme.palette.text.primary, padding: '0 10px', borderRadius: '6px' });
  const { file, selectedType, selectedAction, selectedTrack, selectedDetail, dispatch, settings } = useEditorContext();
  const selectProject = () => {
    dispatch({ type: 'SELECT_PROJECT' });
  }

  return <Root aria-label="breadcrumb">
    <Typography sx={{ color: 'text.primary' }}>Project</Typography>
    { (!selectedDetail || selectedDetail.project)
      ? (<Link component={'button'} underline="hover" color="inherit" onClick={selectProject}>{selectedDetail?.project?.name}</Link>)
      : <Typography sx={sxSelectedLabel}>{file?.name}</Typography>
    }
    <Typography sx={{ color: 'text.primary' }}>Track</Typography>
    {!selectedTrack &&
      <DetailTracks
        size={'small'}
        sx={{background: 'transparent'}}
      />}
    {selectedTrack && <Typography sx={sxSelectedLabel}>{selectedTrack?.name}</Typography>}

  </Root>
}
