import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState } from "react";
import type { Thumbnail } from "../types/Thumbnail";
import { Loader } from "./Loader";
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

export interface ThumbnailComponentProps {
  thumb: Thumbnail, 
  index: number, 
  setOpenImage: (url: string) => void,
  loading: boolean
  hasError: boolean
}

export const ThumbnailComponent : React.FC<ThumbnailComponentProps> = ({thumb, index, setOpenImage, loading, hasError}) => {
  const [hovered, setHovered] = useState(false);

  if(loading) {
    return (
    <Box
      sx={{
        position: "relative",
        width: "115px",
        height: "115px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Box 
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress size={40} />
      </Box>          
    </Box> 
    )
  }

  if(hasError) {
    return (
    <Box
      sx={{
        position: "relative",
        width: "115px",
        height: "115px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Box 
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <BrokenImageIcon sx={{fontSize: "40px", color: "#ee2323"}} />
      </Box>          
    </Box> 
    )
  }

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        width: "115px",
        height: "115px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <img
        src={thumb.url}
        alt={`Thumbnail ${index + 1}`}
        onClick={() => setOpenImage(thumb.url)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {hovered && (
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            right: 4,
            display: "flex",
            flexDirection: "column-reverse",
            gap: 1,
          }}
        >
          {/* Trash Icon */}
          <Tooltip title="Remove file from collection">
            <IconButton
              size="small"
              sx={{
                width: 24,
                height: 24,
                borderRadius: "6px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 1)",
                },
                color: "white",
                p: 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                // handle delete here
                console.log("Delete clicked");
              }}
            >
              <DeleteIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>

          {/* Download Icon */}
          <Tooltip title="Download raw file" placement="top">
          <IconButton
            size="small"
            sx={{
              width: 24,
              height: 24,
              borderRadius: "6px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 1)",
              },
              color: "white",
              p: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              // handle download here
              console.log("Download clicked");
            }}
          >
            <DownloadIcon sx={{ fontSize: 12 }} />
          </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};