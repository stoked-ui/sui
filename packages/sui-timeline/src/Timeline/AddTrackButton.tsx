import * as React from "react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

export default function AddTrackButton({ onAddFiles }: { onAddFiles?: () => void }) {
  // {(!file?.tracks || !file?.tracks.length) &&
   return (
     <Fab color="primary"
       size={'small'}
       sx={{position: 'absolute', marginLeft: '4px', marginTop: '3px', scale: 0.8, transformOrigin: '0% 0%'}}
       onClick={() => {
         if (onAddFiles) {
           onAddFiles();
         }
       }}>
      <AddIcon fontSize={'large'}/>
    </Fab>)
}
