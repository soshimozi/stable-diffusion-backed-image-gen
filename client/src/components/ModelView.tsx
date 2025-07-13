import { Box, Typography } from '@mui/material';
import {  useTheme } from '@mui/material/styles';

interface ModelViewProps {
  onClick: () => void;
  image: string;
  name: string;
  description: string;
  tags: string[];
  selected: boolean;
}

export const ModelView : React.FC<ModelViewProps> = ({onClick, image, name, description, tags, selected}) => {

  const theme = useTheme();

  return (
          <Box sx={{
          width: "200px",
          padding: "5px",
          height: "auto",
          border: selected ? "1px solid white" : "none",
          borderRadius: "5px"
          
        }}>
          
          <img src={image} width={"100%"} height={"auto"} style={{borderRadius: "5px", cursor: "pointer"}} onClick={onClick} />
          <Box sx={{textAlign: "center"}} >
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2">{description}</Typography>
          </Box>
        </Box>

  )
}