import React from "react";
import { styled } from "@mui/material/styles";
import { prefix } from "../../utils/deal_class_prefix";
const DragLinesRoot = styled('div')({
    position: 'absolute',
    height: '100%',
    top: 0,
    left: 0,
});
const DragLineRoot = styled('div')({
    width: 0,
    position: 'absolute',
    top: 0,
    height: '99%',
    borderLeft: '1px dashed rgba(82, 151, 255, 0.6)',
});
/** drag guide lines */
export const DragLines = ({ isMoving, movePositions = [], assistPositions = [], scrollLeft, }) => {
    return (React.createElement(DragLinesRoot, { className: prefix('drag-line-container') }, isMoving && movePositions.filter(item => assistPositions.includes(item)).map(((linePos, index) => {
        return (React.createElement(DragLineRoot, { key: index, className: prefix('drag-line'), style: { left: linePos - scrollLeft } }));
    }))));
};
//# sourceMappingURL=drag_lines.js.map