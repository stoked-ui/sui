import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { ITimelineTrack } from '@stoked-ui/timeline/TimelineTrack'
import { TimelineAction, TimelineState } from "@stoked-ui/timeline";
import { EditorLabelsClasses } from './editorLabelsClasses';
import {
  TimelineLabelsProps,
} from "@stoked-ui/timeline/TimelineLabels/TimelineLabels.types";

export interface EditorLabelsProps extends TimelineLabelsProps { }
