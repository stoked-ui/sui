/**
 * DetailBreadcrumbs component.
 *
 * Displays breadcrumbs for the current project and track selection.
 */

import * as React from "react";
import { Breadcrumbs, Link, styled, Typography } from "@mui/material";
import DetailTracks from "./DetailTracks";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { IEditorAction } from "../EditorAction";
import DetailActions from "./DetailActions";

const Root = styled(Breadcrumbs, {
  /**
   * Custom styles for the breadcrumbs component.
   */
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

/**
 * DetailBreadcrumbs function component.
 *
 * @returns {JSX.Element} The rendered breadcrumbs component.
 */
export function DetailBreadcrumbs(){
  const sxSelectedLabel = (theme) => ({ 
    /**
     * Custom styles for selected label.
     */
    color: theme.palette.text.primary, 
    padding: '0 10px', 
    borderRadius: '6px' 
  });

  const context = useEditorContext();
  const { state: {
    file,
    selectedType,
    selectedAction,
    selectedTrack,
    selectedDetail,
    settings
  }, dispatch } = context;

  /**
   * Dispatches the SELECT_PROJECT action.
   */
  const selectProject = () => {
    dispatch({ type: 'SELECT_PROJECT' });
  }

  return (
    <Root aria-label="breadcrumb">
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
  );
}