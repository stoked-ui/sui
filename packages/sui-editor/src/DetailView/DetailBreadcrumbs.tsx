import * as React from "react";
import { Breadcrumbs, Link, styled, Typography } from "@mui/material";
import DetailTracks from "./DetailTracks";
import { useEditorContext } from "../EditorProvider/EditorContext";

const Root = styled(Breadcrumbs, {
})(({ theme }) => ({
  '& p.MuiFormHelperText-root.MuiFormHelperText-sizeSmall.MuiFormHelperText-contained': {
    display: 'none'
  },
  '& li .MuiBox-root .MuiFormControl-root .MuiFormLabel-root': {
    padding: 0
  },
  '& .MuiFormLabel-root.MuiInputLabel-root':{
    background: 'white',
    '& .MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-shrink': {
      display: 'none'
    }
  }
}))
export function DetailBreadcrumbs({  control, editor  }) {
  const sxSelectedLabel = (theme) => ({ color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, padding: '0 10px', borderRadius: '6px' });
  const { file, selectedTrack, detail, dispatch } = useEditorContext();
  return <Root aria-label="breadcrumb">
    <Typography sx={{ color: 'text.primary' }}>Video</Typography>
    { detail.project ?
      <Link
        component={'button'}
        underline="hover"
        color="inherit"
        onClick={()=> {
            dispatch({ type: 'SELECT_PROJECT' })
        }}
      >

        {detail.project.name}
      </Link> :
      <Typography sx={sxSelectedLabel}>{file?.name}</Typography>
    }
    <Typography sx={{ color: 'text.primary' }}>Tracks</Typography>
    {!selectedTrack ?
      <DetailTracks
        tracks={file?.tracks || []}
        editor={editor}
        size={'small'}
        sx={{background: 'transparent'}}
      />
      :
      <Typography sx={sxSelectedLabel}>{selectedTrack!.name}</Typography>
    }
  </Root>
}
