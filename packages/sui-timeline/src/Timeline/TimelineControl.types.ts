/**
 * @interface TimelineControlPropsBase
 * @description Properties for the Timeline Control component.
 *
 * @property {number} [scale] - Single tick mark category (>0)
 * @property {number} [minScaleCount] - Minimum number of ticks (>=1)
 * @property {number} [maxScaleCount] - Maximum number of scales (>=minScaleCount)
 * @property {number} [scaleSplitCount] - Number of single scale subdivision units (>0 integer)
 * @property {number} [scaleWidth] - Display width of a single scale (>0, unit: px)
 * @property {number} [startLeft] - The distance from the start of the scale to the left (>=0, unit: px)
 * @property {number} [trackHeight] - Default height of each edit line (>0, unit: px)
 * @property {boolean} [gridSnap] - Whether to enable grid movement adsorption
 * @property {boolean} [dragLine] - Start dragging auxiliary line adsorption
 * @property {boolean} [hideCursor] - whether to hide the cursor
 * @property {boolean} [disableDrag] - Disable dragging of all action areas
 *
 * @description Custom scale rendering
 * @property {(scale: number) => React.ReactNode} [getScaleRender]
 *
 * @description Get the action id list to prompt the auxiliary line. Calculate it when move/resize start.
 * @property {(params: {action: ActionType; tracks: TrackType[]; track: TrackType}) => string[]} [getAssistDragLineActionIds]
 *
 * @description Click time area event, prevent setting time when returning false
 * @property {(time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined} [onClickTimeArea]
 *
 * @property {SxProps<Theme>} [sx]
 */