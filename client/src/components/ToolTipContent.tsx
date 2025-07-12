import { Box, Typography } from "@mui/material"

interface ToolTipContentProps {
  title: string;
  children?: React.ReactNode; 
}
export const ToolTipContent: React.FC<ToolTipContentProps> = ({title, children}) => {
  return (
    <Box sx={{maxWidth: "320px"}}>
      <Box sx={{marginBottom: "5px"}}>
        <Typography sx={{fontWeight: 500, fontSize: "14px", color: "#1E1E24"}}>
        {title}
        </Typography>
      </Box>
      <Box>
        {children}
      </Box>
    </Box>
  )
}