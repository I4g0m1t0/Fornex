import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, allowedProfile }) {
  const { user, perfil, loading } = useAuth()

  // Enquanto o Supabase pensa, mostramos um loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500 font-medium animate-pulse">Carregando plataforma...</span>
      </div>
    )
  }

  // Se não tem usuário logado, manda pro Login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se o usuário tentar acessar a URL do painel errado, mandamos ele pro painel certo
  if (allowedProfile && perfil && perfil !== allowedProfile) {
    return <Navigate to={`/dashboard/${perfil}`} replace />
  }

  return children
}