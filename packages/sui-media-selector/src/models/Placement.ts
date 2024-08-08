import React from 'react';

export enum PlacementPosition {
  TopLeft,
  Top,
  TopRight,
  Right,
  BottomRight,
  Bottom,
  BottomLeft,
  Left,
}

export type MarginProperty = Pick<React.CSSProperties, 'margin'>;
export type PaddingProperty = Pick<React.CSSProperties, 'padding'>;

export interface IPlacement {
  placement?: PlacementPosition
  margin?: MarginProperty
  padding?: PaddingProperty
}
