import { Box, Typography, Tooltip, TextField, styled } from "@mui/material";
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


export interface SideBarProps {
  onPromptChange: (prompt: string) => void;
  prompt: string;
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


export const SideBar: React.FC<SideBarProps> = ({onPromptChange, prompt}) => {
  return (
    <>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
          >
            <Typography component="span" sx={{ width: '100%', flexShrink: 0 }}>
              Model
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{height: "400px"}}>
            Details Comming!
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
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
        <Accordion>
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
            <Box sx={{height: "400px"}}>
            Details Comming!
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
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