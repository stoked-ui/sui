import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { BlendMode, Fit, IEditorAction } from '../EditorAction/EditorAction';
import { IEditorFile } from '../EditorFile/EditorFile';
import { IEditorTrack } from '../EditorTrack/EditorTrack';
import { useEditorContext } from "../EditorProvider/EditorContext";


export default function ContextMenu({ type,  context }:{ type: 'DETAIL_TRACK' | 'DETAIL_ACTION' | 'DETAIL_PROJECT',  context: IEditorAction | IEditorTrack | IEditorFile }) {
  const { state: { settings }, dispatch } = useEditorContext();

  const handleClose = () => {
    const { contextMenu, ...updatedSettings } = settings;
    dispatch({ type: 'SET_SETTING', payload: { key: 'contextMenu', value: updatedSettings }})
  };

  const handleTrackDetail = () => {
    dispatch({ type: 'DETAIL_OPEN' });
  }

  const getName = () => {
    switch (type) {
      case 'DETAIL_TRACK':
        return 'Track';
      case 'DETAIL_ACTION':
        return 'Action';
      case 'DETAIL_PROJECT':
        return 'Project';
      default:
        throw new Error('Invalid type');
    }
  }

  const handleBlendMode = (event: SelectChangeEvent<BlendMode>, child: React.ReactNode) => {
    dispatch({ type: 'SET_BLEND_MODE', payload: { contextId: context.id, value: event.target.value as BlendMode }})
  }

  const handleFit = (event: SelectChangeEvent<Fit>, child: React.ReactNode) => {
    dispatch({ type: 'SET_FIT', payload: { contextId: context.id, value: event.target.value as Fit }})
  }
  return (
    <Menu
      open={settings.contextMenu}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        settings.contextMenu !== null
          ? { top: settings.contextMenu.mouseY, left: settings.contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={handleClose}>{`View ${getName()} Detail`}</MenuItem>
      <MenuItem onClick={handleClose}>
        <FormControl fullWidth>
          <InputLabel id="set-blend-mode">Blend Mode</InputLabel>
          <Select
            labelId="set-blend-mode"
            id="set-blend-mode-select"
            value={context.blendMode}
            label="Set Blend Mode"
            onChange={handleBlendMode}
          >
            <MenuItem value={'normal'}>normal</MenuItem>
            <MenuItem value={'multiply'}>multiply</MenuItem>
            <MenuItem value={'screen'}>screen</MenuItem>
            <MenuItem value={'overlay'}>overlay</MenuItem>
            <MenuItem value={'darken'}>darken</MenuItem>
            <MenuItem value={'lighten'}>lighten</MenuItem>
            <MenuItem value={'color-dodge'}>color-dodge</MenuItem>
            <MenuItem value={'color-burn'}>color-burn</MenuItem>
            <MenuItem value={'hard-light'}>hard-light</MenuItem>
            <MenuItem value={'soft-light'}>soft-light</MenuItem>
            <MenuItem value={'difference'}>difference</MenuItem>
            <MenuItem value={'exclusion'}>exclusion</MenuItem>
            <MenuItem value={'hue'}>hue</MenuItem>
            <MenuItem value={'saturation'}>saturation</MenuItem>
            <MenuItem value={'color'}>color</MenuItem>
            <MenuItem value={'luminosity'}>luminosity</MenuItem>
            <MenuItem value={'plus-darker'}>plus-darker</MenuItem>
            <MenuItem value={'plus-lighter'}>plus-lighter</MenuItem>
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onClick={handleClose}>
        <FormControl fullWidth>
          <InputLabel id="set-fit">Fit</InputLabel>
          <Select
            labelId="set-fit"
            id="set-fit-select"
            value={context.fit}
            label="Set Fit"
            onChange={handleFit}
          >
            <MenuItem value={'none'}>none</MenuItem>
            <MenuItem value={'contain'}>contain</MenuItem>
            <MenuItem value={'cover'}>cover</MenuItem>
            <MenuItem value={'fill'}>fill</MenuItem>
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onClick={handleClose}>Email</MenuItem>
    </Menu>
  );
}

