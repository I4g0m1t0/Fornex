import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import CompradorDashboard from './pages/CompradorDashboard'
import FornecedorDashboard from './pages/FornecedorDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Routes>
            {/* Rota Pública */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Rota Protegida do Comprador */}
            <Route 
              path="/dashboard/comprador" 
              element={
                <ProtectedRoute allowedProfile="comprador">
                  <CompradorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota Protegida do Fornecedor */}
            <Route 
              path="/dashboard/fornecedor" 
              element={
                <ProtectedRoute allowedProfile="fornecedor">
                  <FornecedorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback: se digitar URL louca, volta pro início */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}