import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import CandidateRegistrationPage from './pages/CandidateRegistrationPage'
import CandidatesPage from './pages/CandidatesPage'
import CandidateDetailsPage from './pages/CandidateDetailsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/cadastro" replace />}
        />

        <Route
          path="/cadastro"
          element={<CandidateRegistrationPage />}
        />

        <Route
          path="/candidatos"
          element={<CandidatesPage />}
        />

        <Route
          path="/candidatos/:id"
          element={<CandidateDetailsPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/cadastro" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App