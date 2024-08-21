import * as React from 'react';
import { styled } from "@mui/material/styles";
import { TimelineTrack } from '../../interface/TimelineAction';
import { CommonProps } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { ITimelineAction } from '../../TimelineAction/TimelineAction.types';
import { EditData } from "../../TimelineControl/TimelineControl.types";
import TimelineAction from "../../TimelineAction/TimelineAction";

export type EditRowProps = CommonProps & EditData & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineTrack;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (tracks: TimelineTrack[]) => void;
  /** scroll distance from left */
  scrollLeft: number;
  /** setUp scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

const EditRowRoot = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'Root'
})(({ theme }) => ({
  backgroundRepeat: 'no-repeat, repeat',
  backgroundImage: `linear-gradient(#0000, #0000), linear-gradient(90deg, ${theme.palette.action.selected} 1px, transparent 0)`,
  display: 'flex',
  flexDirection: 'row',
  boxSizing: 'border-box',
}));

export function EditRow(props: EditRowProps) {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
  } = props;

  const classNames = ['edit-track'];
  if (rowData?.selected) {
    classNames.push('edit-track-selected');
  }

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) {
      return undefined;
    }
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  return (
    <EditRowRoot
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(
        ' ',
      )}`}
      style={style}
      onKeyDown={(e) => {
        alert('hi')
        console.log('row root', e);
      }}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { track: rowData, time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { track: rowData, time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { track: rowData, time });
        }
      }}
    >
      {(rowData?.actions || []).map((action) => {
        return <TimelineAction
          key={action.id}
          {...props}
          handleTime={handleTime}
          track={rowData}
          action={action}
        />
      })}
    </EditRowRoot>
  );
};
