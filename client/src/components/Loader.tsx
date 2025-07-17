import { Box } from "@mui/material";
import "./Loader.css";

export const Loader: React.FC = () => {
  return (
    <Box 
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="90vh" // full viewport height
      width="100%" // optional: ensures full viewport width
    >
      <span className="loader"></span>
    </Box>    
    
  )
}