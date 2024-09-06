import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import PropTypes from "prop-types";
import {styled } from "@mui/material/styles";
import { shouldForwardProp } from '@mui/system';

Slack.propTypes = {
  variant: PropTypes.oneOf(["default","monochrome", "hover-color"])
};

const StyledPath = styled(SvgIcon, {
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'grow' &&
    prop !== 'cell' &&
    prop !== 'last' &&
    prop !== 'header' &&
    prop !== 'first',
})<{ hoverColor: string, colors: string }>(({ hoverColor, color, theme }) => ({
  fill: color,
  '&:hover': {
    fill: hoverColor,
  }
}));
export default function Slack(props: { variant: "default" | "monochrome" | 'hover-color' } & SvgIconProps) {
  const [hover, setHover] = React.useState(false);
  const monochrome = (props.variant === "monochrome" || props.variant === 'hover-color') ? 'currentColor' : undefined;
  const colors = [monochrome ?? "#E01E5A", monochrome ?? "#36C5F0", monochrome ?? "#2EB67D", monochrome ?? "#ECB22E"];
  const hoverColor = props.variant ==='hover-color'  ? ["#E01E5A", "#36C5F0", "#2EB67D", "#ECB22E"] : colors;

  return (
    <SvgIcon {...props} viewBox={'0 0 127 127'} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <path fill={hover ? hoverColor[0] : colors[0]}
            d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z"/>
      <path fill={hover ? hoverColor[1] : colors[1]}
            d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z"/>
      <path fill={hover ? hoverColor[2] : colors[2]}
            d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z"/>
      <path fill={hover ? hoverColor[3] : colors[3]}
            d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z"/>
    </SvgIcon>
  );
}
