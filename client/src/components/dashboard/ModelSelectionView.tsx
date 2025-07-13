import { Box, Typography } from "@mui/material";
import type { AIModel } from "../../types/AIModel";
import { actions } from '../../store/actions';
import { dispatch } from "../../store/store";
import { useTypedSelector } from "../../store/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { ModelsService } from "../../services/ModelsService";
import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { type UserProfile } from "../../types/UserProfile";
import { ModelView } from "../ModelView";


export const ModelSelectionView: React.FC = () => {

  const models = useTypedSelector((state) => state.model.modelList);
  const selectedModel = useTypedSelector((state) => state.model.selectedModel);

  const { isLoading } = useAuth0();

  const [profile] = useState<UserProfile>(() => { 
    const saved = localStorage.getItem("profile") ?? "";
    const initialValue = JSON.parse(saved);
    return initialValue || { email: "", selectedModelId: undefined};
  });



  const onModelClick = (model: AIModel): void => {
    console.log('onModalClick');
    
    dispatch(actions.models.setModel(model))

    const newProfile = { ...profile };
    newProfile.selectedModelId = model.id;

    localStorage.setItem("profile", JSON.stringify(newProfile));
  }

  if(isLoading) return <Loader />


return (
<Box sx={{
  display: "flex",
  flexWrap: "wrap",      // Allow items to wrap to the next line
  gap: 1,
}}>
  {models.map((model, index) => {

    const hasBorder = model.id === selectedModel?.id;

    if(!model.available) return null;

    return (

      <ModelView key={index} name={model.name} description={model.description} image={model.image_data} tags={model.tags} onClick={() => onModelClick(model)} selected={model.id === selectedModel?.id} />
      
      // <Box key={index} sx={{
      //   width: "200px",
      //   padding: "5px",
      //   height: "auto",
      //   border: hasBorder ? "1px solid #223399" : "none",
      //   borderRadius: "5px"
        
      // }}>
        
      //   <img src={model.image_data} width={"100%"} height={"auto"} style={{borderRadius: "5px", cursor: "pointer"}} onClick={() => onModelClick(model)} />
      //   <Box sx={{textAlign: "center"}} >
      //   <Typography variant="h6">{model.name}</Typography>
      //   <Typography variant="body2">{model.description}</Typography>
      //   </Box>
      // </Box>
    )
  })}
</Box>
  );
}