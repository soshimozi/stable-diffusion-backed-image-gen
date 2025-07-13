import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, CircularProgress, IconButton, Modal, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTypedSelector } from "../../store/hooks";
import type { Thumbnail } from "../../types/Thumbnail";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { ThumbnailComponent } from "../ThumbnailComponent";
import { type ImageSettings } from "../../types/Settings";
import { ImageService, type ImageGenerationOptions } from "../../services/ImageService";
import { SideBar } from "../SideBar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ModelView } from "../ModelView";
import { dispatch } from "../../store/store";
import { actions } from "../../store/actions";

type GenerateViewState = {
  prompt: string;
}

const imageService = new ImageService();
export const GenerateView : React.FC = () => {

  const selectedModel = useTypedSelector((state) => state.model.selectedModel);
  
  const DEFAULT_SETTINGS:ImageSettings = {
    height: 1024,
    width: 1024,
    guidance: 3,
    steps: 28
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [openImage, setOpenImage] = useState<string | null>(null);  
  
  const location = useLocation();
  const defaultPrompt = (location.state as GenerateViewState)?.prompt || ""; // Accessing state data
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(DEFAULT_SETTINGS);
  const [callId, setCallId] = useState<string | null>(null);
  const [lastThumbnail, setLastThumbnail] = useState<Thumbnail | null>(null);
  const [numberImages, setNumberImages] = useState("1");
  const [cost, setCost] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState("1440");
  const [imageHeight, setImageHeight] = useState("1440");
  const [showSelectModelView, setShowSelectModelView] = useState(false);
  const [modelExpanded, setModelExpanded] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(true);
  const [outputSizeExpanded, setOutputSizeExpanded] = useState(true);
  const [advancedSettingsExpanded, setAdvancedSettingsExpanded] = useState(false);


  const accessToken = useTypedSelector((state) => state.appState.token);
  const models = useTypedSelector((state) => state.model.modelList);
  
  useEffect(() => {
    
    setCost(parseInt(numberImages) * 5);

  }, [numberImages])

  useEffect(() => {
    if (!callId || !accessToken) return;

    const pollInterval = setInterval(async () => {
      try {

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/job/${callId}`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          }          
        );

        if (response.status === 202) {
          return;
        }

        if (response.ok) {
          const blob = await response.blob();

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

        if(lastThumbnail) {
          updateThumbnail({ ...lastThumbnail, loading: false, hasError: true});          
        }

        clearInterval(pollInterval);
        setCallId(null);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [callId, accessToken]);  

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
        loading: true,
        hasError: false
      }
      return [...state, th];

    });
  }

  const generate = async () => {

    setLoading(true);

    // add a new thumbnail
    createThumbnail();

    const triggerWord = selectedModel?.trigger_word ? selectedModel.trigger_word + " " : ""
    const fullPrompt = triggerWord + prompt;
    const model_id =  selectedModel?.id || "flux"

    setLastThumbnail({
      url: "",
      prompt,
      model: model_id,
      loading: false,
      settings: {
        ...imageSettings
      },
      hasError: false,
    });
    
    try {
      const result = await imageService.startImageJob(accessToken, { prompt: fullPrompt, model_id: model_id, width: parseInt(imageWidth), height: parseInt(imageHeight)})
      setCallId(result);
    }
    catch (e) {

      if(lastThumbnail) {
        updateThumbnail({...lastThumbnail, loading: false, hasError: true})
      }

      console.error(e);
    } finally {
      setLoading(false);
    }      

  };  

  if(showSelectModelView) {

    return (
        <Box sx={{width: "100%", display: "flex", flexDirection: "column"}}>
          <Box sx={{display: "flex", flexDirection: "row", gap: "10px", cursor: "pointer"}} onClick={() => setShowSelectModelView(false)} >
            <ArrowBackIcon />
            <Typography>Back</Typography>
          </Box>
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",      // Allow items to wrap to the next line
            gap: 1,
          }}>
            {models.map((model, index) => {

              if(!model.available) return null;

              return (

                <ModelView 
                  key={index} 
                  name={model.name} 
                  description={model.description} 
                  image={model.image_data} 
                  tags={model.tags} 
                  onClick={() => { dispatch(actions.models.setModel(model)); setShowSelectModelView(false); }} 
                  selected={model.id === selectedModel?.id} 
                />
              )
            })}
          </Box>          
        </Box>
    )
  }

  return (
    <>
      <Box sx={{
        padding: "5px",
        display: "flex",
        flexDirection: "column",
      }}>
        <Box sx={{display: "flex", flexDirection: "row", alignItems: "flex-end", width: "100%"}}>
          <Box sx={{width: "22%"}}>
            <Typography variant="h6">Bring your ideas to life</Typography>
          </Box>
          <Box sx={{marginLeft: "15px"}}></Box>
        </Box>

      <Box sx={{display: "flex", flexGrow: "1", borderTop: "1px solid #333"}}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          width: "25%",
          paddingRight: "15px",
          marginTop: "8px"
        }}>

          <Box sx={{
            height: "calc(90vh - 100px - 64px - 64px)",
            overflowY: "auto",
            marginBottom: "15px",
          }}>
            <Box sx={{paddingRight: "4px"}}>
            <SideBar onPromptChange={(prompt) => setPrompt(prompt)} 
                prompt={prompt} 
                imageHeight={imageHeight}  imageWidth={imageWidth} 
                onImageHeightChange={setImageHeight} 
                onImageWidthChange={setImageWidth} 
                promptExpanded={promptExpanded}
                modelExpanded={modelExpanded}
                advancedSettingsExpanded={advancedSettingsExpanded}
                outputSizeExpanded={outputSizeExpanded}
                onModelExpanded={setModelExpanded}
                onAdvancedSettingsExpanded={setAdvancedSettingsExpanded}
                onOutputSizeExpanded={setOutputSizeExpanded}
                onPromptExpanded={setPromptExpanded}
                selectedModel={selectedModel || models[0]} onChangeModelClick={() => setShowSelectModelView(true)} />
            </Box>
          </Box>

          <Box sx={{minHeight: "100px", display: "flex", alignItems: "flex-start", flexDirection: "column", gap: "6px", borderTop: "1px solid #333",  flexGrow: "1 1"}}>
            <Box sx={{display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", width: "100%", height: "100%", marginTop: "6px"}}>
              <Typography sx={{fontWeight: 400, fontSize: "14px"}}>Number of Images</Typography>
              <Box sx={{width: "60px"}}>
                <TextField variant="outlined" value={numberImages} 
                  onChange={(e) => {
                    
                    if(isNaN(parseInt(e.target.value))) {
                      setNumberImages("1");
                      return;
                    }

                    if(parseInt(e.target.value) < 1) return;

                    setNumberImages(e.target.value)
                  }}

                  size="small" />
              </Box>
            </Box>

            <Button sx={{width: "100%"}} variant={"contained"} disabled={loading || !prompt} onClick={generate} endIcon={loading ? <CircularProgress size={10} /> : null}>Create</Button>
            <Box>
              <Typography>You will be charged {cost} tokens.</Typography>
            </Box>

          </Box>

        </Box>

        <Box display="flex" flexGrow={"1 1 auto"} flexDirection={"column"} borderLeft={"1px solid #333"} paddingLeft={"25px"} width={"100%"}>

          <Box
            sx={{
              marginTop: "6px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(115px, 1fr))",          
              maxWidth: "100%",
              gap: "10px",
              overflowY: "auto",          // show scrollbar only when needed
              overflowX: "hidden",        // prevent horizontal scroll
              userSelect: "none",
              maxHeight: "calc(90vh - 64px - 64px)",
            }}
          >
            {thumbnails.map((thumb, index) => (<ThumbnailComponent setOpenImage={setOpenImage} index={index} thumb={thumb} key={index} loading={thumb.loading} hasError={thumb.hasError} />))}
          </Box>


        </Box>
        
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