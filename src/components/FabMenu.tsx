import React from 'react';
import { Fab, styled, FabProps } from "@mui/material";

const StyledFab = styled(Fab)({
  position: "fixed",
  top: 16,
  right: 16,
  svg: {
    fill: "white",
    marginRight: "0.4em",
  },
});

export const FabMenu = (props: React.PropsWithChildren<FabProps>) => {
  return <StyledFab {...props} />;
};