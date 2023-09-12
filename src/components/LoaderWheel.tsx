import React from "react";
import Image from "next/image";
import { Box, styled } from "@mui/material";
import { keyframes } from "@emotion/react";

const rotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinSvg = styled(Box)`
  animation: ${rotation} 2s infinite linear;
  transform-origin: 50% 50%;
`;

interface LoaderWheelProps {
  size?: number;
  sx?: any;
}

const SpinnerSvg = ({ size }: { size: number }) => (
  <svg
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    id="screenshot-800d54c4-5e36-802c-8003-00862b9a2920"
    viewBox="0 0 112 112"
    style={{ WebkitPrintColorAdjust: "exact" }}
    fill="none"
    version="1.1"
  >
    <g id="shape-800d54c4-5e36-802c-8003-00862b9a2920" rx="0" ry="0">
      <g id="shape-800d54c4-5e36-802c-8003-008624ea501f">
        <g className="fills" id="fills-800d54c4-5e36-802c-8003-008624ea501f">
          <path
            rx="0"
            ry="0"
            d="M16.000,16.000L32.000,16.000L32.000,32.000L16.000,32.000L16.000,16.000ZM32.068,96.000L32.000,80.000L16.000,80.068L16.068,96.068L32.068,96.000ZM81.000,96.000L80.067,96.004L80.000,80.068L96.000,80.000L96.000,80.000L96.068,96.000L81.000,96.000ZL81.067,112.000L33.068,112.203L33.000,96.203L80.067,96.004M80.067,16.000L80.000,0.000L32.000,0.203L32.068,16.203L80.067,16.000ZM80.033,16.000L96.000,16.000L96.000,32.000L80.000,32.000L80.033,16.000ZM80.000,16.000L80.000,16.000ZM80.000,16.000L80.000,16.000ZM0.000,32.000L16.000,32.000L16.000,80.000L0.000,80.000L0.000,32.000ZM96.000,32.000L112.000,32.000L112.000,80.000L96.000,80.000L96.000,32.000Z"
            style={{ fill: "rgb(158, 147, 139)", fillOpacity: 1 }}
          />
        </g>
      </g>
      <g id="shape-800d54c4-5e36-802c-8003-008619e34214">
        <g className="fills" id="fills-800d54c4-5e36-802c-8003-008619e34214">
          <path
            rx="0"
            ry="0"
            d="M32.270,80.000L16.000,80.000L16.000,32.000L32.067,32.000L32.000,16.203L80.000,16.000L80.067,32.000L96.000,32.000L96.000,80.000L80.270,80.000L80.338,95.999L32.339,96.202L32.270,80.000Z"
            style={{ fill: "rgb(255, 249, 229)", fillOpacity: 1 }}
          />
        </g>
      </g>
    </g>
  </svg>
);

const LoaderWheel: React.FC<LoaderWheelProps> = ({ size = 100, sx }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={sx}>
      <SpinSvg>
        <SpinnerSvg size={size} />
      </SpinSvg>
    </Box>
  );
};

export default LoaderWheel;
