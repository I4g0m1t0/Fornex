import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PlusCircle, List, Package, CheckCircle2, ChevronDown, Clock, LogOut, Factory } from 'lucide-react' // <-- CORRIGIDO: Factory adicionado aqui
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import logoFornex from '../assets/fornex.jpeg'

// ==========================================
// SCHEMA DE VALIDAÇÃO (Roupas/Confecção)
// ==========================================
const pedidoSchema = z.object({
  titulo: z.string().min(5, 'O título precisa ter pelo menos 5 caracteres'),
  tipo_peca: z.string().min(1, 'Selecione o tipo de peça'),
  tecido: z.string().min(1, 'Selecione o tecido/material'),
  genero: z.string().min(1, 'Selecione o gênero'),
  tamanhos: z.array(z.string()).min(1, 'Selecione pelo menos um tamanho'),
  acabamento: z.string().optional(),
  quantidade: z.coerce.number().min(1, 'A quantidade deve ser maior que zero'),
  prazo_entrega: z.string().min(1, 'Defina o prazo de entrega'),
  condicao_pagamento: z.string().min(1, 'Selecione a condição de pagamento'),
  observacoes: z.string().optional()
})

const TAMANHOS_DISPONIVEIS = ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '38', '40', '42', '44', '46', '48']

export default function CompradorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('novo') // 'novo' | 'lista'
  const [pedidos, setPedidos] = useState([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)

  // ==========================================
  // BUSCAR PEDIDOS E PROPOSTAS DO BANCO
  // ==========================================
  const fetchPedidos = async () => {
    setLoadingPedidos(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        propostas (
          id, preco_total, status, created_at,
          users_profiles ( nome_empresa )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar seus leilões.')
      console.error(error)
    } else {
      setPedidos(data || [])
    }
    setLoadingPedidos(false)
  }

  useEffect(() => {
    if (activeTab === 'lista') fetchPedidos()
  }, [activeTab])

  // ==========================================
  // AÇÃO: ACEITAR PROPOSTA
  // ==========================================
  const aceitarProposta = async (pedidoId, propostaId) => {
    const confirmar = window.confirm('Tem certeza que deseja aceitar esta proposta? O leilão será encerrado.')
    if (!confirmar) return

    toast.loading('Encerrando leilão...', { id: 'aceite' })

    // 1. Atualiza a proposta vencedora
    const { error: errProp } = await supabase
      .from('propostas')
      .update({ status: 'aceita', accepted_at: new Date().toISOString() })
      .eq('id', propostaId)

    // 2. Rejeita as outras propostas deste pedido
    await supabase
      .from('propostas')
      .update({ status: 'recusada' })
      .eq('pedido_id', pedidoId)
      .neq('id', propostaId)

    // 3. Fecha o pedido
    const { error: errPed } = await supabase
      .from('pedidos')
      .update({ status: 'Fechado' })
      .eq('id', pedidoId)

    if (errProp || errPed) {
      toast.error('Ocorreu um erro ao processar o aceite.', { id: 'aceite' })
    } else {
      toast.success('Proposta aceita com sucesso! O fornecedor foi notificado.', { id: 'aceite' })
      fetchPedidos()
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* NAVBAR DO PAINEL */}
      <nav className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-wider flex items-center gap-3">
            <img src={logoFornex} alt="Logo Fornex" className="h-8 w-auto rounded" />
            FORNEX <span className="text-blue-400 font-medium text-sm hidden sm:inline-block">| Painel do Comprador</span>
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-950 transition">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200 pb-px overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button onClick={() => setActiveTab('novo')} className={`flex items-center gap-2 py-3 px-6 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'novo' ? 'bg-white text-blue-700 border-t border-l border-r border-gray-200 mb-[-1px]' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'}`}>
            <PlusCircle size={18} /> Publicar Nova Demanda
          </button>
          <button onClick={() => setActiveTab('lista')} className={`flex items-center gap-2 py-3 px-6 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'lista' ? 'bg-white text-blue-700 border-t border-l border-r border-gray-200 mb-[-1px]' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'}`}>
            <List size={18} /> Meus Leilões Ativos
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        {activeTab === 'novo' ? (
          <FormularioNovoPedido user={user} onSuccess={() => setActiveTab('lista')} />
        ) : (
          <ListaPedidos pedidos={pedidos} loading={loadingPedidos} onAccept={aceitarProposta} />
        )}
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE SECUNDÁRIO: FORMULÁRIO DE CRIAR PEDIDO
// ==========================================
function FormularioNovoPedido({ user, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(pedidoSchema)
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const payload = { ...data, user_id: user.id, status: 'Aberto' }
    
    const { error } = await supabase.from('pedidos').insert([payload])
    
    if (error) {
      toast.error('Erro ao publicar demanda. Tente novamente.')
      console.error(error)
    } else {
      toast.success('Leilão reverso iniciado com sucesso!')
      reset()
      onSuccess()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800">Nova Demanda de Confecção</h2>
        <p className="text-gray-500 text-sm mt-1">Preencha os detalhes técnicos para atrair os melhores lances das fábricas.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Título do Pedido</label>
          <input {...register('titulo')} type="text" placeholder="Ex: Patrulha de 2.000 Camisetas Básicas" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          {errors.titulo && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.titulo.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Peça</label>
            <select {...register('tipo_peca')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Selecione...</option>
              <option value="Camiseta">Camiseta</option>
              <option value="Calça">Calça</option>
              <option value="Moletom">Moletom</option>
              <option value="Vestido">Vestido</option>
              <option value="Bermuda">Bermuda</option>
              <option value="Outro">Outro</option>
            </select>
            {errors.tipo_peca && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.tipo_peca.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tecido / Malha</label>
            <select {...register('tecido')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Selecione...</option>
              <option value="100% Algodão">100% Algodão</option>
              <option value="Algodão Penteado">Algodão Penteado</option>
              <option value="Poliéster">Poliéster</option>
              <option value="Viscolycra">Viscolycra</option>
              <option value="Jeans/Denim">Jeans / Denim</option>
              <option value="Linho">Linho</option>
            </select>
            {errors.tecido && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.tecido.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Gênero Público</label>
            <select {...register('genero')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Selecione...</option>
              <option value="Unissex">Unissex</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Infantil">Infantil</option>
            </select>
            {errors.genero && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.genero.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Grade de Tamanhos Necessária</label>
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            {TAMANHOS_DISPONIVEIS.map(tam => (
              <label key={tam} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 border border-gray-300 rounded-md hover:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-600 has-[:checked]:text-blue-700 transition">
                <input type="checkbox" value={tam} {...register('tamanhos')} className="hidden" />
                <span className="font-bold text-sm">{tam}</span>
              </label>
            ))}
          </div>
          {errors.tamanhos && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.tamanhos.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade Total</label>
            <input {...register('quantidade')} type="number" placeholder="Ex: 500" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.quantidade && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.quantidade.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Prazo Máximo de Entrega</label>
            <input {...register('prazo_entrega')} type="date" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.prazo_entrega && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.prazo_entrega.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Condição de Pagamento</label>
            <select {...register('condicao_pagamento')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Selecione...</option>
              <option value="50% Sinal + 50% Entrega">50% Sinal + 50% Entrega</option>
              <option value="Faturado 30 Dias">Faturado 30 Dias</option>
              <option value="Faturado 30/60/90 Dias">Faturado 30/60/90 Dias</option>
              <option value="À Vista Antecipado">À Vista Antecipado</option>
            </select>
            {errors.condicao_pagamento && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.condicao_pagamento.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Acabamento Específico (Opcional)</label>
            <input {...register('acabamento')} type="text" placeholder="Ex: Estampa Silk, Etiqueta Interna" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Observações Adicionais (Opcional)</label>
            <input {...register('observacoes')} type="text" placeholder="Detalhes extras..." className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none" />
          </div>
        </div>

        <div className="pt-4">
          <button disabled={isSubmitting} type="submit" className="w-full bg-blue-700 text-white font-black text-lg py-4 rounded-xl hover:bg-blue-800 transition active:scale-95 disabled:opacity-70 shadow-lg shadow-blue-200">
            {isSubmitting ? 'Publicando...' : 'Publicar Demanda no Hub'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ==========================================
// COMPONENTE SECUNDÁRIO: LISTA DE PEDIDOS E PROPOSTAS
// ==========================================
function ListaPedidos({ pedidos, loading, onAccept }) {
  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse font-bold">Carregando seus leilões...</div>
  
  if (pedidos.length === 0) return (
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
      <Package size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-700">Você ainda não tem demandas publicadas</h3>
      <p className="text-gray-500 mt-2">Crie seu primeiro pedido na aba "Nova Demanda" e comece a receber lances.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {pedidos.map(pedido => (
        <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* CABEÇALHO DO PEDIDO */}
          <div className="p-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${pedido.status === 'Aberto' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-200 text-gray-600 border border-gray-300'}`}>
                  {pedido.status}
                </span>
                <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                  <Clock size={14} /> Publicado em {new Date(pedido.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-black text-gray-800">{pedido.titulo}</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {pedido.quantidade} peças • {pedido.tipo_peca} em {pedido.tecido}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-black text-blue-700">{pedido.propostas?.length || 0}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lances Recebidos</p>
            </div>
          </div>

          {/* LISTA DE PROPOSTAS DO PEDIDO */}
          <div className="p-6">
            {pedido.propostas?.length === 0 ? (
              <p className="text-gray-400 italic text-sm text-center py-4">Aguardando o primeiro lance das fábricas...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pedido.propostas.map(proposta => (
                  <div key={proposta.id} className={`p-4 rounded-xl border-2 transition-all ${proposta.status === 'aceita' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Fábrica / Confecção</p>
                        <p className="font-bold text-gray-800 flex items-center gap-2">
                          <Factory size={16} className="text-gray-400"/> 
                          {proposta.users_profiles?.nome_empresa || 'Fábrica Parceira'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Lance Total</p>
                        <p className="font-black text-lg text-green-700">R$ {Number(proposta.preco_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    
                    {pedido.status === 'Aberto' && proposta.status === 'pendente' && (
                      <button 
                        onClick={() => onAccept(pedido.id, proposta.id)}
                        className="w-full mt-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:border-green-600 hover:text-green-700 hover:bg-green-50 transition active:scale-95 flex justify-center items-center gap-2"
                      >
                        <CheckCircle2 size={18} /> Aceitar Proposta
                      </button>
                    )}

                    {proposta.status === 'aceita' && (
                      <div className="w-full mt-2 bg-green-600 text-white font-bold py-2.5 rounded-lg text-center text-sm flex justify-center items-center gap-2">
                        <CheckCircle2 size={18} /> Vencedor do Leilão
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}