import { Route, Routes } from 'react-router-dom'
import Home from './components/dashboard/PromptForgeLandingPage'
import AppLayout from './components/layout/AppLayout'
import { TokenUsageView } from './components/dashboard/TokenUsageView'
import { ModelSelectionView } from './components/dashboard/ModelSelectionView'
import { WorkspaceView } from './components/dashboard/WorkspaceView'
import { GenerateView } from './components/dashboard/GenerateView'
import ProtectedRoute from './auth/ProtectedRoute'
import { Login } from './components/Login'


function App() {
  

  return (
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} /> {/* Renders Home at the root path */}
          <Route element={<ProtectedRoute redirectTo='/login' />}>
            <Route path="/generate" element={<GenerateView />} />
            <Route path="/workspace" element={<WorkspaceView />} />
            <Route path="/models" element={<ModelSelectionView />} />
            <Route path="/tokens" element={<TokenUsageView />} />
          </Route>
          <Route path="/login" element={<Login />} /> {/* Renders Home at the root path */}          
        </Route>

      </Routes>
  )
}

export default App
