import React from 'react';
import { styled } from "@mui/material/styles";
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { EditAction } from './edit_action';
const EditRowRoot = styled('div')(({ theme }) => ({
    backgroundRepeat: 'no-repeat, repeat',
    backgroundImage: `linear-gradient(${theme.palette.background.default}, ${theme.palette.background.default}), linear-gradient(90deg, ${theme.palette.action.selected} 1px, transparent 0)`,
    display: 'flex',
    flexDirection: 'row',
    boxSizing: 'border-box',
}));
export function EditRow(props) {
    const { rowData, style = {}, onClickRow, onDoubleClickRow, onContextMenuRow, areaRef, scrollLeft, startLeft, scale, scaleWidth, } = props;
    const classNames = ['edit-row'];
    if (rowData?.selected)
        classNames.push('edit-row-selected');
    const handleTime = (e) => {
        if (!areaRef.current)
            return;
        const rect = areaRef.current.getBoundingClientRect();
        const position = e.clientX - rect.x;
        const left = position + scrollLeft;
        const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
        return time;
    };
    return (React.createElement(EditRowRoot, { className: `${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')}`, style: style, onClick: (e) => {
            if (rowData && onClickRow) {
                const time = handleTime(e);
                onClickRow(e, { row: rowData, time: time });
            }
        }, onDoubleClick: (e) => {
            if (rowData && onDoubleClickRow) {
                const time = handleTime(e);
                onDoubleClickRow(e, { row: rowData, time: time });
            }
        }, onContextMenu: (e) => {
            if (rowData && onContextMenuRow) {
                const time = handleTime(e);
                onContextMenuRow(e, { row: rowData, time: time });
            }
        } }, (rowData?.actions || []).map((action) => (React.createElement(EditAction, { key: action.id, ...props, handleTime: handleTime, row: rowData, action: action })))));
}
;
//# sourceMappingURL=edit_row.js.map