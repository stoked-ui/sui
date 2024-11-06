import {Breadcrumbs, Link, styled, Typography} from "@mui/material";
import * as React from "react";
import DetailTracks from "./DetailTracks";
import { useEditorContext } from "../EditorProvider";

const Root = styled(Breadcrumbs, {
})(({ theme }) => ({
  '& p.MuiFormHelperText-root.MuiFormHelperText-sizeSmall.MuiFormHelperText-contained': {
    display: 'none'
  },
  '& li .MuiBox-root .MuiFormControl-root .MuiFormLabel-root': {
    padding: 0
  }
}))
export default function DetailBreadcrumbs({ formInfo, control, onClickEdit  }) {
  const sxSelectedLabel = (theme) => ({ color: theme.palette.background.paper, backgroundColor: theme.palette.text.primary, padding: '0 10px', borderRadius: '6px' });
  const { file, dispatch } = useEditorContext();
  const { detail, data } = formInfo;
  return <Root aria-label="breadcrumb">
    <Typography sx={{ color: 'text.primary' }}>Video</Typography>
    { detail.track ?
      <Link
        component={'button'}
        underline="hover"
        color="inherit"
        onClick={()=> {
            dispatch({ type: 'SELECT_VIDEO' })
        }}
      >

        {detail.video.name}
      </Link> :
      <Typography sx={sxSelectedLabel}>{detail.video.name}</Typography>
    }
    <Typography sx={{ color: 'text.primary' }}>Tracks</Typography>
    {!detail.track &&
      <DetailTracks
        detail={detail}
        tracks={file?.tracks}
        editMode
        onClickEdit={onClickEdit}
        size={'small'}
        sx={{background: 'transparent'}}
      />}
    {(detail.track && detail.action) &&
     <Link component={'button'} underline="hover" color="inherit"  onClick={()=> {
       dispatch({ type: 'SELECT_TRACK', payload: detail.track })
     }}
     >
       {detail.track!.name}
     </Link>
    }
    {(detail.track && !detail.action) && <Typography sx={sxSelectedLabel}>{detail.track!.name}</Typography>}
  </Root>
}
