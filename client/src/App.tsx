import { Route, Routes } from 'react-router-dom'
import Home from './components/dashboard/PromptForgeLandingPage'
import AppLayout from './components/layout/AppLayout'
import { TokenUsageView } from './components/dashboard/TokenUsageView'
import { WorkspaceView } from './components/dashboard/WorkspaceView'
import { GenerateView } from './components/dashboard/GenerateView'
import ProtectedRoute from './auth/ProtectedRoute'
import { Login } from './components/Login'


function App() {

  //const { isLoading } = useAuth0();

  // // const { VITE_BASE_URL } = import.meta.env;

  // // const modelsService = new ModelsService();
  // // const models = useTypedSelector((state) => state.model.modelList)

  // // const [dataLoading, setDataLoading] = useState(false);
  // // const [error, setError] = useState<string | undefined>(undefined);

  // // useEffect(() => {

  // //   if(dataLoading || isLoading || models.length > 0 || error) return;

  // //   setDataLoading(true);

  // //   (async() => {

  // //     try {

  // //       const accessToken = await getAccessTokenSilently({
  // //         authorizationParams: {
  // //           audience: `https://promptforge/api`,
  // //           scope: "read:models",
  // //         },
  // //       });

  // //       dispatch(actions.appState.setToken(accessToken));

  // //       const modelList = await modelsService.getModels(accessToken);

  // //       const profileResponse = await fetch(`${VITE_BASE_URL}/me`, 
  // //         {
  // //           headers: {
  // //             Authorization: `Bearer ${accessToken}`,
  // //           },          
  // //         }
  // //       )

  // //       let selectedModel;
  // //       if(profileResponse.status === 200) {
  // //         console.log('profile: ', await profileResponse.json())
  // //       }

  // //       dispatch(actions.models.setModels(modelList));
  // //       dispatch(actions.models.setModel(selectedModel || modelList[0]));

  // //     } catch (e: any) {
  // //       console.error(e.message);
  // //       setError(e.message);
  // //     }
  // //     finally {
  // //       setDataLoading(false);
  // //     }

  // //   })();

  // // }, [models, dataLoading, isLoading, error]);


  // if(isLoading) return (
  //   <Loader />
  // )
  
  return (
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} /> {/* Renders Home at the root path */}
          <Route element={<ProtectedRoute redirectTo='/login' />}>
            <Route path="/generate" element={<GenerateView />} />
            <Route path="/workspace" element={<WorkspaceView />} />
            <Route path="/tokens" element={<TokenUsageView />} />
          </Route>
          <Route path="/login" element={<Login />} /> {/* Renders Home at the root path */}          
        </Route>

      </Routes>
  )
}

export default App;
