/**
 * EdgeSnap component displays an icon for edge snap feature.
 * @param {object} props - The props for the EdgeSnap component.
 * @property {string} props.title - The title attribute for the icon.
 * @property {string} props.color - The color of the icon.
 * @returns {JSX.Element} Rendered EdgeSnap component.
 * @example
 * <EdgeSnap title="Edge Snap" color="primary" />
 */
import * as React from 'react';
import {createSvgIcon} from '@mui/material/utils';

const EdgeSnap = createSvgIcon(
  <React.Fragment>
    <path d="M 16.569 8.516 L 10.189 8.516 L 10.189 12.916 L 16.569 12.916 C 18.263 12.916 19.321 14.749 18.474 16.216 C 18.081 16.897 17.355 17.316 16.569 17.316 L 10.189 17.316 L 10.189 21.716 L 16.569 21.716 C 21.65 21.716 24.825 16.216 22.285 11.816 C 21.106 9.774 18.927 8.516 16.569 8.516 Z M 11.289 9.616 L 13.489 9.616 L 13.489 11.816 L 11.289 11.816 L 11.289 9.616 Z M 11.289 18.416 L 13.489 18.416 L 13.489 20.616 L 11.289 20.616 L 11.289 18.416 Z M 16.569 20.616 L 14.589 20.616 L 14.589 18.416 L 16.569 18.416 C 19.109 18.416 20.697 15.666 19.427 13.466 C 18.837 12.445 17.748 11.816 16.569 11.816 L 14.589 11.816 L 14.589 9.616 L 16.569 9.616 C 20.803 9.616 23.449 14.199 21.332 17.866 C 20.35 19.568 18.534 20.616 16.569 20.616 Z" />
    <path d="M 8 -5 L -14 -5 L -14 7 L 8 7 L 8 -5 M 8 8 L 7 8 L 7 12 L 8 12 L 8 8 Z M 7 13 L 7 17 L 8 17 L 8 13 L 7 13 Z M 7 18 L 8 18 L 8 22 L 7 22 L 7 18 Z"/>
  </React.Fragment>,
  'FeatureSnapIcon',
);

export default EdgeSnap;