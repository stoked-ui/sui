import { ADD_SCALE_COUNT } from "../interface/const";
/** time to pixel */
export function parserTimeToPixel(data, param) {
    const { startLeft, scale, scaleWidth } = param;
    return startLeft + (data / scale) * scaleWidth;
}
/** pixel to time */
export function parserPixelToTime(data, param) {
    const { startLeft, scale, scaleWidth } = param;
    return ((data - startLeft) / scaleWidth) * scale;
}
/** position width turn start end */
export function parserTransformToTime(data, param) {
    const { left, width } = data;
    const start = parserPixelToTime(left, param);
    const end = parserPixelToTime(left + width, param);
    return {
        start,
        end,
    };
}
/** start end to position width */
export function parserTimeToTransform(data, param) {
    const { start, end } = data;
    const left = parserTimeToPixel(start, param);
    const width = parserTimeToPixel(end, param) - left;
    return {
        left,
        width,
    };
}
/** Get the number of scales based on data */
export function getScaleCountByRows(data, param) {
    let max = 0;
    data.forEach((row) => {
        row.actions.forEach((action) => {
            max = Math.max(max, action.end);
        });
    });
    const count = Math.ceil(max / param.scale);
    return count + ADD_SCALE_COUNT;
}
/** Get the current tick number based on time */
export function getScaleCountByPixel(data, param) {
    const { startLeft, scaleWidth } = param;
    const count = Math.ceil((data - startLeft) / scaleWidth);
    return Math.max(count + ADD_SCALE_COUNT, param.scaleCount);
}
/** Get the position collection of the entire time of the action */
export function parserActionsToPositions(actions, param) {
    const positions = [];
    actions.forEach((item) => {
        positions.push(parserTimeToPixel(item.start, param));
        positions.push(parserTimeToPixel(item.end, param));
    });
    return positions;
}
//# sourceMappingURL=deal_data.js.map