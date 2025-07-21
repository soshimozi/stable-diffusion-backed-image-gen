import { Box, Button, CircularProgress, IconButton, Modal, Slider, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTypedSelector } from "../../store/hooks";
import type { ThumbnailData } from "../../types/ThumbnailData";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { ThumbnailComponent } from "../ThumbnailComponent";
import { ImageService } from "../../services/ImageService";
import { type AspectRatioType, SideBar, ValueLabelComponent } from "./SideBar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ModelView } from "../ModelView";
import { dispatch } from "../../store/store";
import { actions } from "../../store/actions";
import { useQuery } from "@tanstack/react-query";
import { ModelsService } from "../../services/ModelsService";
import { useSnackbar } from "../SnackbarContext";
import { ErrorPage } from "./ErrorPage";
import { useAuth0 } from "@auth0/auth0-react";
import type { AIModel } from "../../types/AIModel";

type GenerateViewState = {
  prompt: string;
}

const imageService = new ImageService();
export const GenerateView : React.FC = () => {

  const selectedModel = useTypedSelector((state) => state.model.selectedModel);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([])
  const [openImage, setOpenImage] = useState<string | null>(null);  
  
  const location = useLocation();
  const defaultPrompt = (location.state as GenerateViewState)?.prompt || ""; // Accessing state data
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [numberImages, setNumberImages] = useState("1");
  const [cost, setCost] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState("1024");
  const [imageHeight, setImageHeight] = useState("1024");
  const [showSelectModelView, setShowSelectModelView] = useState(false);
  const [modelExpanded, setModelExpanded] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(true);
  const [outputSizeExpanded, setOutputSizeExpanded] = useState(false);
  const [advancedSettingsExpanded, setAdvancedSettingsExpanded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("");
  const [ratioLocked, setRatioLocked] = useState(false);
  const [loadingImages, setLoadingImages] = useState<string[]>([])
  const [useSeed, setUseSeed] = useState(false);
  const [seed, setSeed] = useState<number | undefined>();
  const [negativePrompt, setNegativePrompt] = useState<string | undefined>(undefined);
  const [ accessToken, setAccessToken ] = useState<string | undefined>();
  const [ error, setError ] = useState<string | undefined>();
  const [steps, setSteps] = useState(30);
  const [cfg, setCFG] = useState(3.0);

  const modelsService = new ModelsService();

  const { showSnackbar } = useSnackbar();

  const models = useTypedSelector((state) => state.model.modelList);
  const { isLoading: authLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [dataLoading, setDataLoading] = useState(false);
  
  useEffect(() => {
    if(authLoading || !isAuthenticated || dataLoading || models.length > 0 || error) return;

    (async () => {

      setDataLoading(true);

      let token = undefined;
      try {
        token = await getAccessTokenSilently({            
            authorizationParams: {
              audience: import.meta.env.VITE_OKTA_AUDIENCE,
              scope: "read:models",
            },
        });

      } catch (err) {
        console.error("TokenFetcher error:", err);
        setError((err as any).message);
      }

      if(!token) return;

      dispatch(actions.appState.setToken(token));
      setAccessToken(token);

      var models = await modelsService.getModels(token);
      dispatch(actions.models.setModels(models));

      const profileUrl = `${import.meta.env.VITE_BASE_URL}/me`;

      const profileResponse = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const profile = await profileResponse.json();

      console.log('profile', profile)

      
      const selectedModel = models.find((m) => m.id === profile.selected_model_id);
      dispatch(actions.models.setModel(selectedModel ? selectedModel : models[0]));

      setDataLoading(false);

    })();

  });

  useEffect(() => {
    
    setCost(parseInt(numberImages) * 5);

  }, [numberImages])

  function startJobPolling(jobId: string) {

    let complete = false;

    const pollInterval = setInterval(async () => {

      if(complete) {
        clearInterval(pollInterval);
        return;
      }

      try {

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/job/${jobId}`, 
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
          complete = true;

          clearInterval(pollInterval);

          // TODO: have a list based on job id for the settings
          // once job is done pull those values from the list,
          // removing them at the same time, and then use those values
          // to set the thumbnail information below
          // eventually we will can an api endpoint to save the image
          // or we will save the image to the database when generating
          // this queue/registry will be part of redux state

          const thumbs:ThumbnailData[] = [];

          const { images } = await response.json() as { images: string[] };


          images.forEach((b64) => {
            // simplest: data-URL directly on <img>
            const src = `data:image/png;base64,${b64}`;

            // TODO: get image settings from queued request
            // key request dictionary by job id - that way we can look up the request from the request dictionary by job id

            const th:ThumbnailData = {
              url: src,
              prompt: prompt,
              model: selectedModel?.id || -1,
              settings: {
                height: parseInt(imageHeight),
                width: parseInt(imageWidth),
                //guidance: imageSettings.guidance,
                //seed: imageSettings.seed,
                //steps: imageSettings.steps
              },
              loading: false,
              hasError: false
            };

            thumbs.push(th);
          });

          console.log('thumbs: ', thumbs);

          setLoadingImages([]);

          // remove the loader (s) and update with new thumbs
          setThumbnails((state) => {
            return [ ...thumbs, ...state];
          });


        } else {
          console.log(response.status)

          if(!complete)
            throw new Error("Failed to get results");
        }
      } catch (error) {

        console.error("Error polling results:", error);
        

        showSnackbar({message: "Failed to complete image generation.  Your tokens will be refunded.", variant: "error", verticalAnchor: "top", horizontalAnchor: "right"});

        setLoadingImages([]);

        clearInterval(pollInterval);
      }
      
    }, 2000);
  }


  function normalizeToGCF(value: number, gcf: number): number {
    
    const normalizeFactor = Math.floor(value / gcf);
    return Math.floor(gcf * normalizeFactor);

  }

  
  const requestImageJob = async () => {

    if(!accessToken) {
      showSnackbar({message: "No access token.  Try refreshing."});
      return;
    }

    setLoading(true);

    const triggerWord = selectedModel?.trigger_word ? selectedModel.trigger_word + " " : ""
    const fullPrompt = triggerWord + prompt;
    const model_id =  selectedModel?.model_id || ""

    // normalize imageWidth and imageHeight
    const width = normalizeToGCF(parseInt(imageWidth), 16);
    const height = normalizeToGCF(parseInt(imageHeight), 16);

    const jobRequest = { 
          prompt: fullPrompt, 
          model_id: model_id, 
          width: width, 
          height: height, 
          negative_prompt: negativePrompt, 
          seed: useSeed ? seed : undefined,
          num_images: parseInt(numberImages), 
          guidance: cfg, // 3.0, /* parseInt(guidance) */
          iterations: steps
    };

    let jobId: string | undefined = undefined;
    try {

      jobId = await imageService.startImageJob(accessToken, jobRequest);
      showSnackbar({message: "Image generation starting.  This could take a few minutes, so please be patient.", variant: "success", verticalAnchor: "top", horizontalAnchor: "right"});
    }
    catch (e) {
      console.error(e);
      showSnackbar({message: "Failed to start image generation job.", variant: "error", verticalAnchor: "top", horizontalAnchor: "right"});
    } finally {
      setLoading(false);
    }      

    if(!jobId) return;

    // add jobId to each loading image for later retrieval
    const imageIds:string[] = []
    for(var i = 0; i < parseInt(numberImages); i++) {
      imageIds.push(jobId);
    }

    setLoadingImages((_) => {
      return [...imageIds];
    })

    startJobPolling(jobId);
  }; 
  
  // const { data: models, isLoading: dataLoading, isError, error: loadingError } = useQuery({
  //   queryKey: ['models'],
  //   queryFn: async () => modelsService.getModels(accessToken),
  //   retry: 3,
  //   retryDelay: (attempt) => attempt * 1000
  // });  


  //if(isError) return <ErrorPage error={`Failed to load models: ${loadingError.message} ${loadingError.cause ? "-" + loadingError.cause : ""}`} />


  if(showSelectModelView) {

    return (
        <Box sx={{width: "100%", display: "flex", flexDirection: "column"}}>
          <Box sx={{display: "flex", flexDirection: "row", gap: "10px", cursor: "pointer"}} onClick={() => setShowSelectModelView(false)} >
            <ArrowBackIcon />
            <Typography sx={{marginBottom: "10px"}}>Back</Typography>
          </Box>
          <Box sx={{
            display: "flex",
            flexFlow: "wrap",      // Allow items to wrap to the next line
            alignItems: "stretch",
            width: "100%",
            gap: 1,
          }}>
            {models?.map((model, index) => {


              if(!model.available) return null;

              //const selected = (model.id === (selectedModel ? selectedModel.id : (models ? models[0] : -1)));

              const currentModel = (selectedModel ? selectedModel : (models ? models[0] : undefined));

              console.log('selectedModelId: ', currentModel);


              return (

                <ModelView 
                  key={index} 
                  name={model.name} 
                  image={model.image_data} 
                  tags={model.tags} 
                  model_url={model.model_url}
                  onClick={() => { setShowSelectModelView(false); updateModel(model)}} 
                  selected={model.id === currentModel?.id} 
                />
              )
            })}
          </Box>          
        </Box>
    )
  }

type UpdateModelRequest = {
  selected_model_id: number
};

async function updateModel(model: AIModel) {

  dispatch(actions.models.setModel(model)); 

  const request:UpdateModelRequest = {
    selected_model_id: model.id
  }

  try {

    await fetch(
      `${import.meta.env.VITE_BASE_URL}/me`, 
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(request)
      }          
    );
  } catch(e) {
    console.error(e)

    showSnackbar({message: "Could not save profile.", variant: "error", verticalAnchor: "top", horizontalAnchor: "right"})
  }

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
        </Box>

      <Box sx={{display: "flex", flexGrow: "1", borderTop: "1px solid #333"}}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          width: "25%",
          marginTop: "8px",
          gap: 0
        }}>

          <Box sx={{
            height: "calc(90vh - 100px - 64px - 64px - 20px)",
            overflowY: "auto",
            marginBottom: "15px",
            scrollbarGutter: 'stable',
          }}>
            <Box>
            <SideBar 
                onPromptChange={(prompt) => setPrompt(prompt)} 
                onNegativePromptChange={(prompt) => setNegativePrompt(prompt)}
                prompt={prompt} 
                negativePrompt={negativePrompt}
                imageHeight={imageHeight}  imageWidth={imageWidth} 
                onImageHeightChange={setImageHeight} 
                onImageWidthChange={setImageWidth} 
                promptExpanded={promptExpanded}
                modelExpanded={modelExpanded}
                seed={seed}
                steps={steps}
                onStepsChanged={(value) => {
                  
                  const intVal = parseInt(value);

                  if(!isNaN(intVal)) {
                    setSteps(intVal);
                  }

                }}
                onSeedChanged={(value) => {
                    const intVal = parseInt(value);
                    isNaN(intVal) ?
                      setSeed(undefined)
                    :
                      setSeed(intVal);
                  }
                }
                cfg={cfg}
                onCFGChange={(v) => {
                  const floatValue = parseFloat(v);
                  if(isNaN(floatValue)) return;
                  setCFG(parseFloat(floatValue.toFixed(2)))
                }}
                dataLoading={dataLoading}
                advancedSettingsExpanded={advancedSettingsExpanded}
                outputSizeExpanded={outputSizeExpanded}
                aspectRatio={aspectRatio}
                ratioLocked={ratioLocked}
                onModelExpanded={setModelExpanded}
                onAdvancedSettingsExpanded={setAdvancedSettingsExpanded}
                onOutputSizeExpanded={setOutputSizeExpanded}
                onPromptExpanded={setPromptExpanded}
                onAspectRatioChanged={setAspectRatio}
                onRatioLockClick={() => setRatioLocked(!ratioLocked)}
                selectedModel={selectedModel || (models ? models[0] : undefined)} 
                onChangeModelClick={() => setShowSelectModelView(true)} 
                onUseSeedChange={setUseSeed}
                useSeed={useSeed}
                ></SideBar>
            </Box>
          </Box>

          <Box sx={{minHeight: "100px", display: "flex", alignItems: "flex-start", flexDirection: "column", gap: "6px", borderTop: "1px solid #333",  flexGrow: "1", mr: "15px"}}>
            <Box sx={{display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", width: "100%", height: "100%", marginTop: "6px"}}>
              <Typography sx={{fontWeight: 400, fontSize: "14px"}}>Number of Images</Typography>
              <Box sx={{width: "60px"}}>
                <TextField variant="outlined" value={numberImages} 
                  onChange={(e) => {
                    
                    if(isNaN(parseInt(e.target.value))) {
                      setNumberImages("1");
                      return;
                    }

                    if(parseInt(e.target.value) < 1) {
                      setNumberImages("1");
                      return;
                    };

                    if(parseInt(e.target.value) > 4) {
                      setNumberImages("4");
                      return;
                    }

                    setNumberImages(e.target.value)
                  }}

                  size="small" />
              </Box>
            </Box>
            <Slider
              value={parseInt(numberImages)}
              valueLabelDisplay="auto"
              slots={{
                valueLabel: ValueLabelComponent,
              }}
              aria-label="custom thumb label"
              defaultValue={1}
              min={1}
              max={4}
              onChange={(_, v) => setNumberImages(v.toString())}

            />             

            <Button sx={{width: "100%"}} variant={"contained"} disabled={loading || !prompt} onClick={requestImageJob} endIcon={loading ? <CircularProgress size={10} /> : null}>Create</Button>
            <Box>
              <Typography>You will be charged {cost} tokens.</Typography>
            </Box>

          </Box>

        </Box>

        <Box display="flex" flexGrow={"1 1 auto"} flexDirection={"column"} borderLeft={"1px solid #333"} paddingLeft={"25px"} width={"80%"}>

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
            {loadingImages.map((_, index) => (
              <ThumbnailComponent index={index} key={index} loading={true} hasError={false} thumb={undefined} />
            ))}

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