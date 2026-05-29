import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Building2, Mail, Lock, Phone, ShoppingCart, Factory } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import logoFornex from '../assets/fornex.jpeg'

// ==========================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ==========================================
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

const registerSchema = z.object({
  nome_empresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  whatsapp: z.string().min(10, 'Digite o WhatsApp com DDD'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  tipo_perfil: z.enum(['comprador', 'fornecedor'], {
    errorMap: () => ({ message: 'Selecione se você é Comprador ou Fornecedor' })
  }),
})

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================
export default function LandingPage() {
  const { user, perfil } = useAuth()
  const [view, setView] = useState('login') // 'login' ou 'register'

  // Se o usuário já estiver logado e com perfil carregado, manda pro painel dele
  if (user && perfil) {
    return <Navigate to={`/dashboard/${perfil}`} replace />
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado Esquerdo - Branding (Escondido em telas pequenas) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-blue-900 text-white p-16">
        <div className="flex items-center gap-4 mb-6">
          <img src={logoFornex} alt="Logo Fornex" className="h-16 w-auto rounded-xl shadow-lg" />
          <h1 className="text-5xl font-black tracking-tight">FORNEX.</h1>
        </div>
        <p className="text-xl text-blue-200 mb-12 max-w-md leading-relaxed">
          O primeiro hub de leilão reverso B2B exclusivo para o setor têxtil e de confecção.
        </p>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-800 rounded-lg"><ShoppingCart size={24} className="text-blue-300" /></div>
            <div>
              <h3 className="font-bold text-lg">Para Marcas</h3>
              <p className="text-blue-300">Publique demandas e receba lances sem expor seu contato.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-800 rounded-lg"><Factory size={24} className="text-blue-300" /></div>
            <div>
              <h3 className="font-bold text-lg">Para Fábricas</h3>
              <p className="text-blue-300">Encontre demandas abertas e feche negócios diretos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulários */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {view === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-gray-500 mt-2">
              {view === 'login' 
                ? 'Acesse sua conta para continuar' 
                : 'Junte-se à revolução da cadeia têxtil'}
            </p>
          </div>

          {view === 'login' ? <LoginForm /> : <RegisterForm />}

          <div className="mt-8 text-center text-sm text-gray-600">
            {view === 'login' ? (
              <p>Ainda não tem conta? <button onClick={() => setView('register')} className="text-blue-600 font-bold hover:underline">Cadastre-se</button></p>
            ) : (
              <p>Já possui conta? <button onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">Faça Login</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE: FORMULÁRIO DE LOGIN
// ==========================================
function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
      setLoading(false)
    } else {
      toast.success('Login realizado com sucesso!')
      // O AuthContext vai detectar a sessão e fazer o redirecionamento automático
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail Corporativo</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input {...register('email')} type="email" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="contato@suaempresa.com" />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input {...register('password')} type="password" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
      </div>

      <button disabled={loading} type="submit" className="w-full mt-6 bg-blue-900 text-white font-bold py-3.5 rounded-lg hover:bg-blue-950 transition active:scale-95 disabled:opacity-70">
        {loading ? 'Entrando...' : 'Entrar na Plataforma'}
      </button>
    </form>
  )
}

// ==========================================
// COMPONENTE: FORMULÁRIO DE REGISTRO
// ==========================================
function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const perfilSelecionado = watch('tipo_perfil')

  const onSubmit = async (data) => {
    setLoading(true)
    
    // 1. Cria o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }

    // 2. Insere os dados extras na tabela users_profiles
    if (authData.user) {
      const { error: profileError } = await supabase.from('users_profiles').insert({
        id: authData.user.id,
        nome_empresa: data.nome_empresa,
        whatsapp: data.whatsapp,
        tipo_perfil: data.tipo_perfil
      })

      if (profileError) {
        toast.error('Erro ao salvar perfil. Contate o suporte.')
        setLoading(false)
        return
      }

      toast.success('Conta criada com sucesso!')
      
      // FIX: Força um rápido recarregamento para o AuthContext puxar o perfil novo do banco
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* SELEÇÃO OBRIGATÓRIA DE PERFIL */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Qual é o seu objetivo na Fornex?</label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition ${perfilSelecionado === 'comprador' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-500 hover:border-blue-200'}`}>
            <input {...register('tipo_perfil')} type="radio" value="comprador" className="hidden" />
            <ShoppingCart size={24} />
            <span className="text-sm font-bold text-center leading-tight">Sou Comprador<br/><span className="text-xs font-normal opacity-80">Quero comprar</span></span>
          </label>
          
          <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition ${perfilSelecionado === 'fornecedor' ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 text-gray-500 hover:border-green-200'}`}>
            <input {...register('tipo_perfil')} type="radio" value="fornecedor" className="hidden" />
            <Factory size={24} />
            <span className="text-sm font-bold text-center leading-tight">Sou Fornecedor<br/><span className="text-xs font-normal opacity-80">Quero vender</span></span>
          </label>
        </div>
        {errors.tipo_perfil && <p className="text-red-500 text-xs mt-2 font-semibold text-center">{errors.tipo_perfil.message}</p>}
      </div>

      <div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input {...register('nome_empresa')} type="text" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome da Empresa / Marca" />
        </div>
        {errors.nome_empresa && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nome_empresa.message}</p>}
      </div>

      <div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input {...register('whatsapp')} type="text" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="WhatsApp (com DDD)" />
        </div>
        {errors.whatsapp && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.whatsapp.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input {...register('email')} type="email" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E-mail" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input {...register('password')} type="password" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Senha" />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
        </div>
      </div>

      <button disabled={loading} type="submit" className="w-full mt-6 bg-blue-900 text-white font-bold py-3.5 rounded-lg hover:bg-blue-950 transition active:scale-95 disabled:opacity-70">
        {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
      </button>
    </form>
  )
}