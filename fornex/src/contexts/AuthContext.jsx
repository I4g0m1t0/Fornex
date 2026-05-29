import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Busca a sessão ativa ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escuta mudanças (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setPerfil(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Busca se o usuário é "comprador" ou "fornecedor"
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('users_profiles')
      .select('tipo_perfil')
      .eq('id', userId)
      .single()

    if (data) setPerfil(data.tipo_perfil)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)