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


export const ModelSelectionView: React.FC = () => {

  const models = useTypedSelector((state) => state.model.modelList);
  const selectedModel = useTypedSelector((state) => state.model.selectedModel);

  const { isLoading, getAccessTokenSilently } = useAuth0();

  const [profile] = useState<UserProfile>(() => { 
    const saved = localStorage.getItem("profile") ?? "";
    const initialValue = JSON.parse(saved);
    return initialValue || { email: "", selectedModelId: undefined};
  });

  const modelsService = new ModelsService();

  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {

    if(dataLoading || isLoading || models.length > 0 || error) return;

    (async() => {

      setDataLoading(true);

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://promptforge/api`,
            scope: "read:models",
          },
        });

        const modelList = await modelsService.getModels(accessToken);
        dispatch(actions.models.setModels(modelList));


      } catch (e: any) {
        console.error(e.message);
        setError(e.message);
      }
      finally {
        setDataLoading(false);
      }

    })();

  }, [models, dataLoading, isLoading, error]);  

  const onModelClick = (model: AIModel): void => {
    dispatch(actions.models.setModel(model))

    const newProfile = { ...profile };
    newProfile.selectedModelId = model.id;

    localStorage.setItem("profile", JSON.stringify(newProfile));
  }

  if(isLoading || dataLoading) return <Loader />


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
      <Box key={index} sx={{
        width: "200px",
        padding: "5px",
        height: "auto",
        border: hasBorder ? "1px solid #223399" : "none",
        borderRadius: "5px"
        
      }}>
        
        <img src={model.image_data} width={"100%"} height={"auto"} style={{borderRadius: "5px", cursor: "pointer"}} onClick={() => onModelClick(model)} />
        <Box sx={{textAlign: "center"}} >
        <Typography sx={{fontWeight: "800", fontSize: "18px"}}>{model.name}</Typography>
        <Typography sx={{fontWeight: "300", fontSize: "12px"}}>{model.description}</Typography>
        </Box>
      </Box>
    )
  })}
</Box>
  );
}