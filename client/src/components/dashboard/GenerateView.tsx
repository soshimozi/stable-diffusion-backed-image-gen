import { Box, Button, CircularProgress, IconButton, Modal, Slider, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTypedSelector } from "../../store/hooks";
import type { ThumbnailData } from "../../types/ThumbnailData";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { ThumbnailComponent } from "../ThumbnailComponent";
import { ImageService } from "../../services/ImageService";
import { SideBar, ValueLabelComponent } from "../SideBar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ModelView } from "../ModelView";
import { dispatch } from "../../store/store";
import { actions } from "../../store/actions";
import { useQuery } from "@tanstack/react-query";
import { ModelsService } from "../../services/ModelsService";

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
  const [imageWidth, setImageWidth] = useState("1440");
  const [imageHeight, setImageHeight] = useState("1440");
  const [showSelectModelView, setShowSelectModelView] = useState(false);
  const [modelExpanded, setModelExpanded] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(true);
  const [outputSizeExpanded, setOutputSizeExpanded] = useState(false);
  const [advancedSettingsExpanded, setAdvancedSettingsExpanded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("");
  const [ratioLocked, setRatioLocked] = useState(false);
  const [negative, setNegative] = useState<string | undefined>()
  const [loadingImages, setLoadingImages] = useState<string[]>([])

  const modelsService = new ModelsService();

  const accessToken = useTypedSelector((state) => state.appState.token);
  //const models = useTypedSelector((state) => state.model.modelList);

  const { data: models, isLoading: dataLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => modelsService.getModels(accessToken!)
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
              model: selectedModel?.id ?? "",
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
          throw new Error("Failed to get results");
        }
      } catch (error) {

        console.error("Error polling results:", error);
        
        setLoadingImages([]);

        clearInterval(pollInterval);
      }
      
    }, 1000);
  }


  const requestImageJob = async () => {

    setLoading(true);

    const triggerWord = selectedModel?.trigger_word ? selectedModel.trigger_word + " " : ""
    const fullPrompt = triggerWord + prompt;
    const model_id =  selectedModel?.id || "flux"

    try {
      const jobId:string = await imageService.startImageJob(accessToken, 
        { 
          prompt: fullPrompt, 
          model_id: model_id, 
          width: parseInt(imageWidth), 
          height: parseInt(imageHeight), 
          negative_prompt: negative, 
          num_images: parseInt(numberImages), 
          guidance: 3.0,
          iterations: 75
        })
      startJobPolling(jobId);

      // add loading images
      const jobIds:string[] = []
      for(var i = 0; i < parseInt(numberImages); i++) {

        jobIds.push(jobId);

      // const th: ThumbnailData = {
      //   url:"",
      //   prompt,
      //   model: model_id,
      //   loading: true,
      //   hasError: false
      // };

      // thumbnails.push(th);
      }

      setLoadingImages((_) => {
        return [...jobIds];
      })

      //setCallId(result);
    }
    catch (e) {

      // todo fix spinners

      // if(lastThumbnail) {
      //   updateThumbnail({...lastThumbnail, loading: false, hasError: true})
      // }

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
                  onClick={() => { dispatch(actions.models.setModel(model)); setShowSelectModelView(false); }} 
                  selected={model.id === currentModel?.id} 
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
        </Box>

      <Box sx={{display: "flex", flexGrow: "1", borderTop: "1px solid #333"}}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          width: "22%",
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
                dataLoading={dataLoading}
                advancedSettingsExpanded={advancedSettingsExpanded}
                outputSizeExpanded={outputSizeExpanded}
                aspectRatio={aspectRatio}
                ratioLocked={ratioLocked}
                negative={negative}
                onNegativeChange={setNegative}
                onModelExpanded={setModelExpanded}
                onAdvancedSettingsExpanded={setAdvancedSettingsExpanded}
                onOutputSizeExpanded={setOutputSizeExpanded}
                onPromptExpanded={setPromptExpanded}
                onAspectRatioChanged={setAspectRatio}
                onRatioLockClick={() => setRatioLocked(!ratioLocked)}
                selectedModel={selectedModel || (models ? models[0] : undefined)} 
                onChangeModelClick={() => setShowSelectModelView(true)} />
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