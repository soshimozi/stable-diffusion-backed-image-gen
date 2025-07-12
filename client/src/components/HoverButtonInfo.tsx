import { Box, Button, type SxProps, type Theme } from "@mui/material";
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

export interface HoverButtonInfoProps  {
  onMouseOver?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseOut?: () => void;
  ref?: React.Ref<HTMLElement>;
}


export const HoverButtonInfo: React.FC<HoverButtonInfoProps> = ({ onMouseOver, onMouseOut }) => {


  return (
    <Box
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <InfoOutlineIcon       
        sx={{
          padding: 0,
          width: "16px",
          height: "16px",
        }}
      />
    </Box>
  );
};

