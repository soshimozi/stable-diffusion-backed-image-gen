import React, { useState, useRef } from "react";
import { Popper, Box, Paper, useTheme } from "@mui/material";

interface HoverTooltipProps {
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  children: (triggerProps: {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    ref: React.RefObject<HTMLElement | null>;
  }) => React.ReactNode;
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({
  content,
  placement = "bottom",
  children,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    clearTimeout(closeTimer.current!);
    setAnchorEl(e.currentTarget);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setAnchorEl(null);
    }, 200);
  };

  return (
    <>
      {children({
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ref: triggerRef,
      })}

      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement={placement}
        modifiers={[
          {
            name: "offset",
            options: { offset: [0, 8] },
          },
          {
            name: "arrow",
            enabled: true,
            options: { element: arrowRef.current },
          },
        ]}
        onMouseEnter={() => clearTimeout(closeTimer.current!)}
        onMouseLeave={handleMouseLeave}
        sx={{ zIndex: 9999 }}
      >
        <Paper
          elevation={3}
          sx={{
            position: "relative",
            padding: 1,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
          }}
        >
          {content}
        </Paper>
      </Popper>
    </>
  );
};
