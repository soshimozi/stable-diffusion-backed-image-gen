import { Box, Typography, Tooltip, TextField, styled, MenuItem, InputLabel, Slider, type SliderValueLabelProps, Button } from "@mui/material";
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { type AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  type AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { HoverTooltip } from "./HoverTooltip";
import { ToolTipContent } from "./ToolTipContent";
import { HoverButtonInfo } from "./HoverButtonInfo";
import { useState } from "react";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { isNumeric } from "../helpers/parsingFunctions";
import type { AIModel } from "../types/AIModel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";


export interface SideBarProps {
  onPromptChange: (prompt: string) => void;
  onImageWidthChange: (width: string) => void;
  onImageHeightChange: (height: string) => void;
  onChangeModelClick: () => void;
  prompt: string;
  imageWidth: string;
  imageHeight: string;
  selectedModel: AIModel;
  modelExpanded: boolean;
  onModelExpanded: (expanded:boolean) => void;
  promptExpanded: boolean;
  onPromptExpanded: (expanded: boolean) => void;
  outputSizeExpanded: boolean;
  onOutputSizeExpanded: (expanded: boolean) => void;
  advancedSettingsExpanded: boolean;
  onAdvancedSettingsExpanded: (expanded: boolean) => void;

}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(-2)
}));

function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}


const MAX_HEIGHT = 1440
const MAX_WIDTH = 1440


export const SideBar: React.FC<SideBarProps> = ({
  onPromptChange, 
  onImageWidthChange, 
  onImageHeightChange, 
  onChangeModelClick,
  onModelExpanded,
  onPromptExpanded,
  onOutputSizeExpanded,
  onAdvancedSettingsExpanded,
  prompt, 
  imageWidth, 
  imageHeight, 
  selectedModel, 
  modelExpanded,
  promptExpanded,
  outputSizeExpanded,
  advancedSettingsExpanded
  
  }) => {
  const [aspectRatio, setAspectRatio] = useState("");
  const [ratioLocked, setRatioLocked] = useState(true);


  const navigate = useNavigate();

  function getAspectRatio(aspect: string) {

    switch(aspect) {
      case "square":
        return 1;

      case "portrait":
        return 9 / 16;

      case "vertical":
        return 4 / 5;

      case "tablet":
        return 2 / 3;

      case "landscape":
        return 3 / 2;

      case "cinema":
        return 16 / 9;

      case "art-print":
        return 5 / 4;
    }

    return 1;

  }

  function changeAspectRatio(value: string) {
    const ratio = getAspectRatio(value);

    switch(value) {
      case "square":
        onImageHeightChange(MAX_HEIGHT.toFixed(0));
        onImageWidthChange(MAX_WIDTH.toFixed(0));
        break;
      case "portrait":
        onImageHeightChange(MAX_HEIGHT.toFixed(0));
        onImageWidthChange((MAX_HEIGHT * ratio).toFixed(0));
        break;

      case "vertical":
        onImageHeightChange(MAX_HEIGHT.toFixed(0));
        onImageWidthChange((MAX_HEIGHT * ratio).toFixed(0));
        break;

      case "tablet":
        onImageHeightChange(MAX_HEIGHT.toFixed(0));
        onImageWidthChange((MAX_HEIGHT * ratio).toFixed(0));
        break;

      case "landscape":
        onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
        onImageWidthChange(MAX_WIDTH.toFixed(0));
        break;

      case "cinema":
        onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
        onImageWidthChange(MAX_WIDTH.toFixed(0));
        break;

      case "art-print":
        onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
        onImageWidthChange(MAX_WIDTH.toFixed(0));
        break;
    }
    
    setAspectRatio(value)
  }

  function changeImageWidth(value: string) {

    if(ratioLocked) {

      const width = parseInt(value);

      const newHeight = width * (1/getAspectRatio(aspectRatio));
      if(newHeight > MAX_HEIGHT) {

        // can't go past bounds
        onImageWidthChange((MAX_WIDTH * getAspectRatio(aspectRatio)).toFixed(0));

        onImageHeightChange(MAX_HEIGHT.toFixed(0));

      } else {
        onImageWidthChange(value);
        onImageHeightChange(newHeight.toFixed(0));
      }

    } else {
      onImageWidthChange(value)
      // change to default
      setAspectRatio("");
    }

  }

  function changeImageHeight(value: string) {

    if(ratioLocked) {

      const height = parseInt(value);

      const newWidth = height * getAspectRatio(aspectRatio);
      if(newWidth > MAX_WIDTH) {

        // can't go past bounds
        onImageWidthChange(MAX_HEIGHT.toFixed(0));

        onImageHeightChange((MAX_WIDTH * 1/getAspectRatio(aspectRatio)).toFixed(0));

      } else {
        onImageWidthChange(newWidth.toFixed(0));
        onImageHeightChange(value);
      }

    } else {
      onImageHeightChange(value);
      // change to default
      setAspectRatio("");
    }

  }

  return (
    <>
        <Accordion 
          expanded={modelExpanded} 
          onChange={(evt, isExpanded) => {
            onModelExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
            
          >
              <Typography component="span" sx={{ width: '100%', flexShrink: 1 }}>
                Model
              </Typography>
            
          </AccordionSummary>
          <AccordionDetails>
          <Box sx={{ height: 100, overflow: "hidden", position: "relative", border: "1px solid #555", borderRadius: "5px" }}>
            <img
              src={selectedModel.image_data}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <Box sx={{paddingLeft: "5px", paddingRight: "5px", display: "flex", position: "absolute", justifyContent:"space-between", alignItems: "center", height: "100%", width: "100%", background: "rgba(0, 0, 0, 0.60)", left: 0, right: 0, top: 0, color: "#fff"}}>
              <Typography variant="subtitle1">{selectedModel.name}</Typography>
              <Button
                onClick={onChangeModelClick}
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": {
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Switch
              </Button>            
            </Box>
          </Box>            
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={promptExpanded} 
          onChange={(evt, isExpanded) => {
            onPromptExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Box display={"flex"} flexDirection={"row"}>
              <Typography component="span" sx={{ width: '100%', flexShrink: 1 }}>
                Prompt
              </Typography>
              <HoverTooltip content={
                <Box>
                    <Typography variant="subtitle1">The description of what you want to see in the image.</Typography>
                    <Typography 
                      sx={{
                        fontSize: "12px", 
                        fontWeight: 400}}
                      >
                        See our <a target="new" style={{textDecoration: "none", fontWeight: 700}} href="prompt_guide.pdf">prompt guide</a> for help on creating prompts.
                      </Typography> 
                </Box>
                
              } placement="right">
                {({ onMouseEnter, onMouseLeave }) => (
                  <HoverButtonInfo
                    onMouseOver={onMouseEnter}
                    onMouseOut={onMouseLeave}
                  />
                )}
              </HoverTooltip>                
              {/* <Tooltip title="The description of what you want to see in the image." >
                <InfoOutlineIcon sx={{fontSize: "18px"}} />
              </Tooltip> */}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
          <Box sx={{ width: "100%" }}>
            <TextField
              rows={4}
              value={prompt}
              placeholder="e.g. A dog playing with a ball.  All languages are supported."
              multiline
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                onPromptChange(event.target.value);
              }}
            />
          </Box>              
          </AccordionDetails>
        </Accordion>          
        <Accordion
          expanded={outputSizeExpanded} 
          onChange={(evt, isExpanded) => {
            onOutputSizeExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography component="span" sx={{ width: '100%', flexShrink: 0 }}>
              Output Size
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
              <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", gap: "2"}}>
                <Typography>Aspect Ratio</Typography>
                <Box sx={{display: "flex", alignItems: "center", gap: "2px"}}>
                  <FormControl sx={{ m: 1, minWidth: 160 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={aspectRatio}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}                    
                      onChange={(e) => {changeAspectRatio(e.target.value)}}
                    >
                      <MenuItem value={''}>
                      Default
                      </MenuItem>

                      <MenuItem value={'square'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "100%", height: "18px"}}></Box></Box>
                          <Typography>Square (1:1)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={'cinema'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "100%", height: "10.125px"}}></Box></Box>
                          <Typography>Cinema (16:9)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={'art-print'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "100%", height: "14.4px"}}></Box></Box>
                          <Typography>Art Print (5:4)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={'landscape'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "100%", height: "12px"}}></Box></Box>
                          <Typography>Landscape (3:2)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={'tablet'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "12px", height: "100%"}}></Box></Box>
                          <Typography>Tablet (2:3)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={'vertical'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "14.4px", height: "100%"}}></Box></Box>
                          <Typography>Vertical (4:5)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={'portrait'}>
                        <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                          <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}><Box sx={{boxSizing: "border-box", border: "2px solid white", width: "10.125px", height: "100%"}}></Box></Box>
                          <Typography>Portrait (9:16)</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  {aspectRatio !== "" && (
                  <Box sx={{padding: "4px", background: ratioLocked ? "rgba(13, 153, 255, 0.1)" : "transparent", borderRadius: "4px", display: "flex", alignItems: "center", cursor: "pointer"}} onClick={() => setRatioLocked(!ratioLocked)}>
                    {ratioLocked ? (
                      <LockOutlineIcon sx={{color: "rgb(13, 153, 255)", size: "12px"}} />
                    ) : <LockOpenIcon  />}
                  </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: "16px"}}>
                <Typography sx={{width: "50px"}}>Width</Typography>
                <Slider
                  value={parseInt(imageWidth)}
                  valueLabelDisplay="auto"
                  slots={{
                    valueLabel: ValueLabelComponent,
                  }}
                  aria-label="custom thumb label"
                  min={1}
                  max={MAX_WIDTH}
                  defaultValue={MAX_WIDTH}
                  sx={{maxWidth: "120px", flexGrow: "1 1 auto"}}
                  onChange={(e, v) => changeImageWidth(v.toString())}
                />                
                <TextField variant="outlined" value={imageWidth} sx={{maxWidth: "80px"}}
                  onChange={(e) => {
                    
                    if(isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 1 || !isNumeric(e.target.value)) {
                      onImageWidthChange(imageWidth);
                      return;
                    }

                    if(parseInt(e.target.value) > MAX_WIDTH) {
                      onImageWidthChange(imageWidth);
                      return;
                    }

                    changeImageWidth(e.target.value);
                  }}

                  size="small" />

              </Box>
              <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: "16px"}}>
                <Typography sx={{width: "50px"}}>Height</Typography>
                <Slider
                  value={parseInt(imageHeight)}
                  valueLabelDisplay="auto"
                  slots={{
                    valueLabel: ValueLabelComponent,
                  }}
                  aria-label="custom thumb label"
                  defaultValue={MAX_HEIGHT}
                  min={1}
                  max={MAX_HEIGHT}
                  sx={{maxWidth: "120px", flexGrow: "1 1 auto"}}
                  onChange={(e, v) => changeImageHeight(v.toString())}

                />                
                <TextField variant="outlined" value={imageHeight} sx={{maxWidth: "80px"}}
                  onChange={(e) => {

                    if(isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 1 || !isNumeric(e.target.value)) {
                      onImageHeightChange(imageHeight);
                      return;
                    }

                    if(parseInt(e.target.value) > MAX_HEIGHT) {
                      onImageHeightChange(imageHeight);
                      return;
                    }

                    changeImageHeight(e.target.value)
                  }}

                  size="small" />

              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={advancedSettingsExpanded} 
          onChange={(evt, isExpanded) => {
            onAdvancedSettingsExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography component="span" sx={{ width: '100%', flexShrink: 0 }}>
              Advanced Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{height: "400px"}}>
            Details Comming!
            </Box>
          </AccordionDetails>
        </Accordion>
      </>
    )
}