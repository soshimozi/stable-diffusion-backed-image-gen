import { Box } from "@mui/material";
import "./Loader.css";

export const Loader: React.FC = () => {
  return (
    <Box 
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh" // full viewport height
      width="100vw" // optional: ensures full viewport width
    >
      <span className="loader"></span>
    </Box>    
    
  )
}