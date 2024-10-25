import {Breadcrumbs, Link, styled, Typography} from "@mui/material";
import * as React from "react";
import DetailTrackActions from "./DetailTrackActions";
import {useController} from "react-hook-form";
import DetailTracks from "./DetailTracks";

const Root = styled(Breadcrumbs, {

})(({ theme }) => ({
  '& p.MuiFormHelperText-root.MuiFormHelperText-sizeSmall.MuiFormHelperText-contained': {
    display: 'none'
  },
  '& li .MuiBox-root .MuiFormControl-root .MuiFormLabel-root': {
    padding: 0
  }
}))
export default function DetailBreadcrumbs({ formData, detail, setDetail, control, onClickEdit  }) {
  const sxSelectedLabel = (theme) => ({ color: theme.palette.background.paper, backgroundColor: theme.palette.text.primary, padding: '0 10px', borderRadius: '6px' });
  return <Root aria-label="breadcrumb">
    <Typography sx={{ color: 'text.primary' }}>Video</Typography>
    { detail.track ?
      <Link component={'button'} underline="hover" color="inherit" onClick={()=> {
        setDetail({
          video: detail.video,
          track: undefined,
          action: undefined
        }) }}
      >
        {detail.video.name}
      </Link> :
      <Typography sx={sxSelectedLabel}>{detail.video.name}</Typography>
    }
    <Typography sx={{ color: 'text.primary' }}>Tracks</Typography>
    {!detail.track && <DetailTracks setDetail={setDetail} detail={detail} tracks={formData.tracks} editMode={true} onClickEdit={onClickEdit} size={'small'} sx={{background: 'transparent'}}/>}
    {(detail.track && detail.action) &&
     <Link component={'button'} underline="hover" color="inherit" onClick={() => {
       setDetail({
         ...detail,
         track: detail.track,
         action: undefined
       }) }} >
       {detail.track!.name}
     </Link>
    }
    {(detail.track && !detail.action) && <Typography sx={sxSelectedLabel}>{detail.track!.name}</Typography>}
    {detail.track && <Typography sx={{ color: 'text.primary' }}>Actions</Typography>}
    {detail.action && <Typography sx={sxSelectedLabel}>{ detail.action?.name }</Typography>}
    {detail.track && !detail.action && <DetailTrackActions setDetail={setDetail} detail={detail} editMode={true} control={control} onClickEdit={onClickEdit} size={'small'} sx={{background: 'transparent'}}/>}
  </Root>
}
