import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, IconButton, Modal, styled, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTypedSelector } from "../../store/hooks";
import type { Thumbnail } from "../../types/Thumbnail";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import MuiAccordion, { type AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordionSummary, {
  type AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { ThumbnailComponent } from "../ThumbnailComponent";
import { type ImageSettings } from "../../types/Settings";
import { ImageService, type ImageGenerationOptions } from "../../services/ImageService";
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

type GenerateViewState = {
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

const DEFAULT_PROMPT = "A racoon in a priests robe.";

const imageService = new ImageService();
export const GenerateView : React.FC = () => {

  const selectedModel = useTypedSelector((state) => state.model.selectedModel);
  

  const DEFAULT_SETTINGS:ImageSettings = {
    height: 1024,
    width: 1024,
    guidance: 3,
    steps: 28
  }

  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [openImage, setOpenImage] = useState<string | null>(null);  
  
  const location = useLocation();
  const defaultPrompt = (location.state as GenerateViewState)?.prompt || DEFAULT_PROMPT; // Accessing state data
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(DEFAULT_SETTINGS);
  const [callId, setCallId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lastThumbnail, setLastThumbnail] = useState<Thumbnail | null>(null);
  

  useEffect(() => {
    if (!callId || !token) return;

    const pollInterval = setInterval(async () => {
      try {
        console.log('checking result');

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}result/${callId}`, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }          
        );

        if (response.status === 202) {
          console.log('still working');
          return;
        }

        if (response.ok) {
          const blob = await response.blob();

          console.log('blob: ', blob)

          const url = URL.createObjectURL(blob);

          if(lastThumbnail) {
            updateThumbnail({ ...lastThumbnail, url, loading: false});          
          }

          clearInterval(pollInterval);
          setCallId(null);
        } else {
          throw new Error("Failed to get results");
        }
      } catch (error) {
        console.error("Error polling results:", error);
        clearInterval(pollInterval);
        setCallId(null);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [callId, token]);  

  const getAccessToken = async (): Promise<string | null> => {
    try {

      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://promptforge/api`,
          scope: "create:image",
        },
      });

      setToken(accessToken);

      return accessToken;
    }
    catch(ex) 
    {
      console.error(ex);
      return null;
    }
  }

  const updateThumbnail = (th: Thumbnail) => {

      setThumbnails((prev) => {
        if (prev.length === 0) return prev; // no-op if empty

        const updated = [...prev];
        updated[prev.length - 1] = th;
        return updated;      
      });

  }

  const createThumbnail = () => {
    setThumbnails((state) => {

      const th:Thumbnail = {
        url: "",
        prompt: "",
        model: "",
        settings: {
          height: imageSettings.height,
          width: imageSettings.width,
          guidance: imageSettings.guidance,
          seed: imageSettings.seed,
          steps: imageSettings.steps
        },
        loading: true
      }
      return [...state, th];

    });

  }

  const generate = async () => {

    setLoading(true);

    // add a new thumbnail
    createThumbnail();

    let accessToken;
    try {

      accessToken = await getAccessToken();
      if(!accessToken) {
        console.warn("Could not get an access token.");
        return;
      }

    } catch (e: any) {
      console.error(e.message);
      setLoading(false);
      return;
    }


    const triggerWord = selectedModel?.trigger_word ? selectedModel.trigger_word + " " : ""
    const fullPrompt = triggerWord + prompt;
    const model_id =  selectedModel?.id || "flux"

    setLastThumbnail({
      url: "",
      prompt,
      model: selectedModel?.id ?? "",
      loading: false,
      settings: {
        ...imageSettings
      }
    });
    
    try {
      const result = await imageService.generateImageAsync(accessToken, { prompt: fullPrompt, model_id: model_id})
      console.log('result: ', result);

      setCallId(result);
      // console.log('blob: ', blob)

      // const url = URL.createObjectURL(blob);
      // console.log('url: ', url)

      // updateThumbnail({ ...lastThumbnail, url, loading: false});
    }
    catch (e) {
      //updateThumbnail({...lastThumbnail, loading: false});
      console.error(e);
    } finally {
      setLoading(false);
    }      

  };  



  return (
    <>
      <Box sx={{
        padding: "5px",
        display: "flex",
        flexDirection: "row"
      }}>

        <Box sx={{
          display: "flex",
          flexDirection: "column",
          width: "20%",
          paddingRight: "15px",
        }}>

          <Box sx={{
            height: "calc(90vh - 100px - 64px)",
            overflowY: "auto",
            paddingBottom: "15px"
          }}>
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
                <Box>
                  <Typography component="span" sx={{ width: '100%', flexShrink: 0 }}>
                    Prompt
                  </Typography>
                  <Tooltip title="The description of what you want to see in the image." >
                  <InfoOutlineIcon sx={{fontSize: "18px"}} />
                  </Tooltip>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
              <Box sx={{ width: "100%" }}>
                <TextField
                  rows={4}
                  value={prompt}
                  placeholder="Enter an image prompt."
                  multiline
                  fullWidth
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setPrompt(event.target.value);
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
          </Box>

          <Box sx={{height: "100px", display: "flex", alignItems: "flex-start", flexDirection: "column", gap: "6px"}}>
            <Box sx={{display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", width: "100%"}}>
              <Typography sx={{fontWeight: 400, fontSize: "14px"}}>Number of Images</Typography><Box sx={{width: "60px"}}><TextField variant="outlined" size="small" /></Box>
            </Box>

            <Button sx={{width: "100%"}} variant={"contained"} disabled={loading} onClick={generate}>Create</Button>
            <Box>
              <Typography>You will be charged {10} tokens.</Typography>
            </Box>

          </Box>

        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(115px, 1fr))",          
            maxWidth: "100%",
            gap: "10px",
            overflowY: "auto",          // show scrollbar only when needed
            overflowX: "hidden",        // prevent horizontal scroll
            userSelect: "none"
          }}
        >
          {thumbnails.map((thumb, index) => (
            <ThumbnailComponent setOpenImage={setOpenImage} index={index} thumb={thumb} key={index} loading={thumb.loading} />
                // <Box
                //   onClick={() => setOpenImage(thumb.url)}
                //   key={index}
                //   sx={{
                //     width: "115px",
                //     height: "115px",
                //     border: "1px solid #ccc",
                //     borderRadius: "6px",
                //     overflow: "hidden",
                //     cursor: "pointer",
                //   }}
                // >
                //   <img
                //     src={thumb.url}
                //     alt={`Thumbnail ${index + 1}`}
                //     style={{ width: "100%", height: "100%", objectFit: "cover" }}
                //   />
                // </Box>
            ))
          }
        </Box>        
      </Box>
      <Modal
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "20px"
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            height: "100%",
            maxHeight: "90vh", // allow modal to fit within screen height
            backgroundColor: "#000",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            padding: "10px",
            flexDirection: "column"

          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setOpenImage(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#fff",
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{color: "#fff"}}>Stuff here</Box>

          {/* Full-size Image */}
          <img
            src={openImage ?? ""}
            alt="Full view"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: "20px"
            }}
          />
        </Box>
      </Modal>        
    </>
  );
}