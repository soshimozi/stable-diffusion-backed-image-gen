import { Box, Typography } from '@mui/material';
import {  styled } from '@mui/material/styles';
import { useState } from 'react';

const ModelImage = styled('img')(() => ({
      display: "block", 
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      objectFit: "cover",
      height: "350px",
      width: "100%",
}));

const TagDisplay = styled(Box)(() => ({
  display: "flex",
  width: "120px",
  minWidth: "120px",
  maxWidth: "120px",
  borderRadius: "100px",
  backgroundColor: "rgba(40, 240, 40, .5)",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
  textOverflow: "ellipsis"
}));

interface ModelViewProps {
  onClick: () => void;
  image: string;
  name: string;
  tags: string[];
  selected: boolean;
  model_url?: string;
}

function cleanUrl(url: string): string {
  // Remove "http://" or "https://" from the beginning
  let cleaned = url.replace(/^https?:\/\//, '');

  // Remove trailing slash if present
  cleaned = cleaned.replace(/\/$/, '');

  return cleaned;
}

const ModelLink = styled('a')(() => ({
  color: "#fff",
  textDecoration: "none",
  '&:hover': {
      color: 'red',
  }  
}));

export const ModelView : React.FC<ModelViewProps> = ({onClick, image, name, tags, selected, model_url}) => {

  const [hover, setHover] = useState(false)
  

  return (
          <Box 
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            sx={{
            backgroundColor: "rgb(20, 23, 24)",
            overflow: "hidden",
            position: "relative",
            border: selected || hover ? "3px solid white" : "3px solid rgb(20, 23, 24)",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.02)", // Increase size by 5%
            },            
            borderRadius: "16px",
            width: "300px"
        }}>
          
          <ModelImage src={image} onClick={onClick} />
          <Box sx={{
            width: "100%",
            height: "100px",
            position:"absolute",
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, .5)"
          }}>
            <Box sx={{textAlign: "flex-start", paddingTop: "10px", paddingLeft: "10px", paddingRight: "10px", height: "45px"}} >
              <Typography variant="subtitle2">{name}</Typography>
              {model_url ? (
                <ModelLink target='new'  href={model_url}>{cleanUrl(model_url)}</ModelLink>
              ): <Box>&nbsp;</Box>}
              <Box sx={{display: "flex", height: "100%", justifyContent: "flex-end", alignItems: "flex-end" }}>
                <Box sx={{display:"flex", flexWrap: "no-wrap", width: "100%", gap: "5px", justifyContent: "flex-start"}}>
                  {tags.slice(0, 2).map((t, i) => {
                    return <TagDisplay key={i}>
                      <Typography variant='subtitle2'>
                        {t}
                      </Typography>
                      </TagDisplay>
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
          {/* <Box sx={{textAlign: "center"}} >
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2">{description}</Typography>
          </Box> */}
        </Box>

  )
}