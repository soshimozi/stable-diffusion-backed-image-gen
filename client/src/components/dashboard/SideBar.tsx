import { Box, Typography, Tooltip, TextField, styled, MenuItem, Slider, type SliderValueLabelProps, Button, Stack, CircularProgress, Switch } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { type AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  type AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { HoverTooltip } from "../HoverTooltip";
import { HoverButtonInfo } from "../HoverButtonInfo";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { isNumeric } from "../../helpers/parsingFunctions";
import type { AIModel } from "../../types/AIModel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export type AspectRatioType = "square" | "widescreen" | "art-print" | "classic" | "photo" | "book" | "portrait" | "vertical" | "mobile" | "ultrawide" | "tall" | "";

export interface SideBarProps {
  onPromptChange: (prompt: string) => void;
  onNegativePromptChange: (prompt: string) => void;
  onImageWidthChange: (width: string) => void;
  onImageHeightChange: (height: string) => void;
  onChangeModelClick: () => void;
  prompt: string;
  negativePrompt: string | undefined;
  imageWidth: string;
  imageHeight: string;
  selectedModel?: AIModel;
  modelExpanded: boolean;
  aspectRatio: AspectRatioType;
  ratioLocked: boolean;
  dataLoading: boolean;
  useSeed: boolean;
  seed?: number;
  steps: number;
  cfg: number;
  onCFGChange: (value: string) => void;
  onStepsChanged: (value: string) => void;
  onRatioLockClick: () => void;
  onModelExpanded: (expanded:boolean) => void;
  promptExpanded: boolean;
  onPromptExpanded: (expanded: boolean) => void;
  outputSizeExpanded: boolean;
  onOutputSizeExpanded: (expanded: boolean) => void;
  advancedSettingsExpanded: boolean;
  onAdvancedSettingsExpanded: (expanded: boolean) => void;
  onAspectRatioChanged: (ratio: AspectRatioType) => void;
  onUseSeedChange: (value: boolean) => void;
  onSeedChanged: (value: string) => void;
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
))(() => ({
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: 0,
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing("20px"),
  marginTop: theme.spacing(-2)
}));

export function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}


const MAX_HEIGHT = 1024
const MAX_WIDTH = 1024


export const SideBar: React.FC<SideBarProps> = ({
  onPromptChange, 
  onNegativePromptChange,
  onImageWidthChange, 
  onImageHeightChange, 
  onChangeModelClick,
  onAspectRatioChanged,
  onRatioLockClick,
  onModelExpanded,
  onPromptExpanded,
  onOutputSizeExpanded,
  onAdvancedSettingsExpanded,
  onSeedChanged,
  seed,
  steps,
  onStepsChanged,
  cfg,
  onCFGChange,
  prompt, 
  negativePrompt,
  imageWidth, 
  imageHeight, 
  selectedModel, 
  aspectRatio,
  modelExpanded,
  promptExpanded,
  outputSizeExpanded,
  advancedSettingsExpanded,
  ratioLocked,
  dataLoading,
  useSeed,
  onUseSeedChange
  }) => {

    const [ showMoreSettings, setShowMoreSettings ] = useState(false);
    
    const aspectRatioMenu = [
      {
        value: 'square',
        display: 'Square (1:1)',
        iconWidth: "100%",
        iconHeight: "18px"
      },
      {
        value: 'widescreen',
        display: 'Widescreen (16:9)',
        iconWidth: "100%",
        iconHeight: "10.125px"
      },
      {
        value: 'art-print',
        display: 'Art Print (5:4)',
        iconWidth: "100%",
        iconHeight: "14.4px"
      },      
      {
        value: 'classic',
        display: 'Classic (4:3)',
        iconWidth: "100%",
        iconHeight: "13.5px"
      },      
      {
        value: 'photo',
        display: 'Photo (3:2)',
        iconWidth: "100%",
        iconHeight: "12px"
      },      
      {
        value: 'book',
        display: 'Book (2:3)',
        iconWidth: "12px",
        iconHeight: "100%"
      },      
      {
        value: 'portrait',
        display: 'Portrait (3:4)',
        iconWidth: "13.5px",
        iconHeight: "100%"
      },      
      {
        value: 'vertical',
        display: 'Vertical (4:5)',
        iconWidth: "14.4px",
        iconHeight: "100%"
      },      
      {
        value: 'mobile',
        display: 'Mobile (9:16)',
        iconWidth: "10.125px",
        iconHeight: "100%"
      },      
      {
        value: 'ultrawide',
        display: 'Ultrawide (21:9)',
        iconWidth: "100%",
        iconHeight: "7.71429px"
      },      
      {
        value: 'tall',
        display: 'Tall (21:9)',
        iconWidth: "13.7143px",
        iconHeight: "100%"
      },      
    ]
  

    /*

Square (1:1)
Widescreen (16:9) (width: 100%, height: 10.125px)
Art Print (5:4) (width: 100%, height: 14.4px)
Classic (4:3) (width: 100%, height: 13.5px)
Photo (3:2) (width: 100%, height: 12px)
Book (2:3) (width: 12px, height: 100%)
Portrait (3:4) (width: 13.5px, height: 100%)
Vertical (4:5) (width: 14.4px, height: 100%)
Mobile (9:16) (width: 10.125px, height: 100%)
Ultrawide (21:9) (width: 100%, height: 7.71429px)
Tall (16:21) (width: 13.7143px, height: 100%)

*/


    function getAspectRatio(aspect: AspectRatioType) {

      switch(aspect) {
        case "square":
          return 1;

        case "portrait":
          return 3 / 4;

        case "vertical":
          return 4 / 5;

        case "book":
          return 2 / 3;

        case "photo":
          return 3 / 2;

        case "widescreen":
          return 16 / 9;

        case "art-print":
          return 5 / 4;
        
        case 'mobile':
          return 9 / 16;

        case 'classic':
           return 4 / 3;

        case 'ultrawide':
          return 21 / 9;

        case 'tall':
          return 16 / 21;

        
      }

      return 1;

    }

    function changeAspectRatio(value: AspectRatioType) {
      const ratio = getAspectRatio(value);

      switch(value) {
        case "mobile":
          onImageHeightChange(MAX_HEIGHT.toFixed(0));
          onImageWidthChange((MAX_HEIGHT * ratio).toFixed(0));
          break;
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

        case "photo":
          onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
          onImageWidthChange(MAX_WIDTH.toFixed(0));
          break;

        case "widescreen":
          onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
          onImageWidthChange(MAX_WIDTH.toFixed(0));
          break;

        case "art-print":
          onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
          onImageWidthChange(MAX_WIDTH.toFixed(0));
          break;

        case 'ultrawide':
          onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
          onImageWidthChange(MAX_WIDTH.toFixed(0));
          break;

        case 'tall':
          onImageHeightChange(MAX_HEIGHT.toFixed(0));
          onImageWidthChange((MAX_HEIGHT * ratio).toFixed(0));
          break;

        case 'book':
          onImageHeightChange(MAX_HEIGHT.toFixed(0));
          onImageWidthChange((MAX_HEIGHT * ratio).toFixed(0));
          break;

        case 'classic':
          onImageHeightChange((MAX_WIDTH * 1/ratio).toFixed(0));
          onImageWidthChange(MAX_WIDTH.toFixed(0));
          break;


      }
      
      onAspectRatioChanged(value)
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
        onAspectRatioChanged("");
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
        onAspectRatioChanged("");
      }

    }

    function generateGuidanceSection() {

      if(showMoreSettings) {

        return (
          <Box sx={{display: "flex", flexDirection: "column", mt: 1}} onClick={() => setShowMoreSettings(true)}>    
            <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
              <Box sx={{display: "flex", flexDirection: "row", gap: "1px"}}>
                  <Typography variant="button">
                    Prompt Guidance (CFG)
                  </Typography>
                  <HoverTooltip content={
                    <Box>
                        <Typography variant="subtitle1">How strictly the AI will stick to the prompt.  Lower numbers allow the AI to be more creative, while higher numbers force it to stick to the prompt.</Typography>
                    </Box>
                  } placement="right">
                    {({ onMouseEnter, onMouseLeave }) => (
                      <HoverButtonInfo
                        onMouseOver={onMouseEnter}
                        onMouseOut={onMouseLeave}
                      />
                    )}
                  </HoverTooltip>                
              </Box>
              <TextField value={cfg} size="small" variant="outlined" sx={{width: "80px"}} onChange={(e) => onCFGChange(e.target.value)} />
            </Box>
            <Slider 
                value={cfg}
                onChange={(_, v) => onCFGChange(v.toString())}
                min={1.0}
                max={7.0}
                shiftStep={.1}
                valueLabelDisplay="auto"
                slots={{
                  valueLabel: ValueLabelComponent,
                }}
                aria-label="custom thumb label"
             />
        </Box>
                  
        )
      } else {
        return (
          <Box sx={{display: "flex", flexDirection: "row", mt: 1, cursor: "pointer"}} onClick={() => setShowMoreSettings(true)}>
            <Typography>Show More Settings </Typography>
            <ChevronRightIcon />
          </Box>
        )
      }
    }

    return (
      <Fragment>
        <Accordion 
          expanded={modelExpanded} 
          onChange={(_, isExpanded) => {
            onModelExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
            
          >
              <Typography variant="button"  sx={{ width: '100%', flexShrink: 1 }}>
                Model
              </Typography>
            
          </AccordionSummary>
          <AccordionDetails>
          <Box sx={{ height: 100, overflow: "hidden", position: "relative", border: "1px solid #555", borderRadius: "5px" }}>
            {dataLoading ? (
              <Box sx={{paddingLeft: "5px", paddingRight: "5px", display: "flex", justifyContent:"center", alignItems: "center", height: "100%", width: "100%", color: "#fff"}}>
                <CircularProgress color={"primary"} size={50} /></Box>
            ) : (
              <>
              {selectedModel && 
              (
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${selectedModel.image_url}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              )}

              <Box sx={{paddingLeft: "5px", paddingRight: "5px", display: "flex", position: "absolute", justifyContent:"space-between", alignItems: "center", height: "100%", width: "100%", background: "rgba(0, 0, 0, 0.60)", left: 0, right: 0, top: 0, color: "#fff"}}>
                <Typography variant="subtitle1">
                  {selectedModel ? selectedModel.name : "Select Model" }
                  </Typography>
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
                  {selectedModel ?
                  <>Switch</> : <>Select</>}
                </Button>            
              </Box>
            </>
            )}
          </Box>            
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={promptExpanded} 
          onChange={(_, isExpanded) => {
            onPromptExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Box display={"flex"} flexDirection={"row"}>
              <Typography variant="button"  sx={{ width: '100%', flexShrink: 1 }}>
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
            <Box sx={{display: "flex", flexDirection: "column", gap: "12px"}}>
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
              {selectedModel && selectedModel.negative_available && (
                <Box sx={{display: "flex", flexDirection: "column", gap: "4px"}}>
                <Box sx={{display: "flex", flexDirection: "row", gap: "1px"}}>
                    <Typography variant="button">
                      Negative Prompt
                    </Typography>
                    <HoverTooltip content={
                      <Box>
                          <Typography variant="subtitle1">The description of what you don't want to see in the image.</Typography>
                      </Box>
                    } placement="right">
                      {({ onMouseEnter, onMouseLeave }) => (
                        <HoverButtonInfo
                          onMouseOver={onMouseEnter}
                          onMouseOut={onMouseLeave}
                        />
                      )}
                    </HoverTooltip>                
                </Box>
                <TextField
                  placeholder="Anything you want to exclude?"
                  fullWidth
                  value={negativePrompt}
                  onChange={((e) => {
                    onNegativePromptChange(e.target.value);
                  })}
                />

                </Box>
              )}
              {selectedModel?.guidance_available && generateGuidanceSection()}
            </Box>
          </Box>              
          </AccordionDetails>
        </Accordion>          
        <Accordion
          expanded={outputSizeExpanded} 
          onChange={(_, isExpanded) => {
            onOutputSizeExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography variant="button" sx={{ width: '100%', flexShrink: 0 }}>
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

                      {aspectRatioMenu.map((mi, index) => {
                        return (
                          <MenuItem value={mi.value} key={index}>
                            <Box sx={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                              <Box sx={{height: "18px", width: "18px", display: "flex", alignItems: "center"}}>
                                <Box sx={{boxSizing: "border-box", border: "2px solid white", width: mi.iconWidth, height: mi.iconHeight}}></Box>
                              </Box>
                              <Typography>{mi.display}</Typography>
                            </Box>
                          </MenuItem>
                        )
                      })}

                    </Select>
                  </FormControl>
                  <Box sx={{padding: "4px", background: ratioLocked ? "rgba(13, 153, 255, 0.1)" : "transparent", borderRadius: "4px", display: "flex", alignItems: "center", cursor: "pointer"}} onClick={onRatioLockClick}>
                    {ratioLocked ? (
                      <LockOutlineIcon sx={{color: "rgb(13, 153, 255)", size: "12px"}} />
                    ) : <LockOpenIcon  />}
                  </Box>
                </Box>
              </Box>
              {selectedModel?.resize_available && (
                <>
                  <Box sx={{ width: "100%"}}>
                    <Stack spacing={2} direction="row" sx={{ alignItems: "center", mb: 1}}>
                      <Typography sx={{width: "50px"}}>Width*</Typography>
                      <Slider
                        value={parseInt(imageWidth)}
                        valueLabelDisplay="auto"
                        slots={{
                          valueLabel: ValueLabelComponent,
                        }}
                        aria-label="custom thumb label"
                        min={16}
                        max={MAX_WIDTH}
                        shiftStep={32}
                        step={16}
                        defaultValue={MAX_WIDTH}
                        onChange={(_, v) => changeImageWidth(v.toString())}
                      ></Slider>                
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
                        size="small"></TextField>
                    </Stack>
                  </Box>              
                  <Box sx={{ width: "100%"}}>
                      <Stack spacing={2} direction="row" sx={{ alignItems: "center", mb: 1}}>
                    <Typography sx={{width: "50px"}}>Height*</Typography>
                    <Slider
                      value={parseInt(imageHeight)}
                      valueLabelDisplay="auto"
                      slots={{
                        valueLabel: ValueLabelComponent,
                      }}
                      aria-label="custom thumb label"
                      defaultValue={MAX_HEIGHT}
                      shiftStep={32}
                      step={16}
                      min={16}
                      max={MAX_HEIGHT}
                      onChange={(_, v) => changeImageHeight(v.toString())}

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

                      size="small"></TextField>


                    </Stack>
                  </Box>
                </>
              )}
                <Box sx={{paddingTop: "0px"}}>
                  <Typography sx={{fontStyle: "italic", fontSize: "10px"}}>*Values will be rounded to the nearest factor of 16 when submitting.</Typography>
                  </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={advancedSettingsExpanded} 
          onChange={(_, isExpanded) => {
            onAdvancedSettingsExpanded(isExpanded);
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography variant="button"  sx={{ width: '100%', flexShrink: 0 }}>
              Advanced Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
              <Box sx={{display: "flex", flexDirection: "row", gap: "0"}}>
                <Typography variant="button">Use Seed</Typography>
                <HoverTooltip content={
                <Box>
                    <Typography variant="subtitle1">A number that generates noise during image generation.</Typography>
                    <Typography variant="subtitle1">Using the same number usually results in the same or very similar output.</Typography>
                </Box>
                
                } placement="right">
                  {({ onMouseEnter, onMouseLeave }) => (
                    <HoverButtonInfo
                      onMouseOver={onMouseEnter}
                      onMouseOut={onMouseLeave}
                    />
                  )}
                </HoverTooltip>    
              </Box>
              {/* <Checkbox value={useSeed} onChange={(_, checked) => onUseSeedChange(checked)} /> */}
              <Switch value={useSeed} onChange={(e) => onUseSeedChange(e.target.checked)} />

            </Box>
            {useSeed && (
              <TextField placeholder="Random" size="small" variant="outlined" value={seed} onChange={(e) => onSeedChanged(e.target.value)} sx={{width: "100%"}} />
            )}
            {selectedModel?.steps_available && (
            <Box sx={{mt: 3}}>
              <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <Box sx={{display: "flex", flexDirection: "row", gap: "0"}}>
                  <Typography variant="button">Steps</Typography>
                  <HoverTooltip content={
                  <Box>
                      <Typography variant="subtitle1">The number of times the AI runs.  Higher values usually result in better quality, but there are dimensioning returns.</Typography>
                      <Typography variant="subtitle1">A good default value is 30, but you can experiment.</Typography>
                  </Box>
                  
                  } placement="right">
                    {({ onMouseEnter, onMouseLeave }) => (
                      <HoverButtonInfo
                        onMouseOver={onMouseEnter}
                        onMouseOut={onMouseLeave}
                      />
                    )}
                  </HoverTooltip>    
                </Box>
                <TextField value={steps} variant="outlined" size="small" sx={{maxWidth: "80px"}} onChange={(e) => onStepsChanged(e.target.value)} />
              </Box>
              <Slider valueLabelDisplay="auto"
                    onChange={(_, v) => onStepsChanged(v.toString())}
                    value={steps}
                        slots={{
                          valueLabel: ValueLabelComponent,
                        }}
                        aria-label="custom thumb label"
                        min={1}
                        max={75}
                        />
            </Box>
            )}

          </AccordionDetails>
        </Accordion>
      </Fragment>
    )
  }