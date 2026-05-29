import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Search, Gavel, Clock, CheckCircle2, XCircle, Phone, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import logoFornex from '../assets/fornex.jpeg'

const lanceSchema = z.object({
  preco_total: z.coerce.number().min(1, 'O valor total deve ser maior que zero')
})

const formatarData = (dataString) => {
  if (!dataString) return '-';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function FornecedorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('mercado')
  const [pedidos, setPedidos] = useState([])
  const [minhasPropostas, setMinhasPropostas] = useState([])
  const [loading, setLoading] = useState(true)
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)

  const carregarDados = async () => {
    setLoading(true)
    
    const { data: dataPedidos, error: errPedidos } = await supabase
      .from('pedidos')
      .select('*')
      .eq('status', 'Aberto')
      .order('created_at', { ascending: false })

    const { data: dataPropostas, error: errPropostas } = await supabase
      .from('propostas')
      .select(`
        *,
        pedidos ( titulo, quantidade, tipo_peca, tecido )
      `)
      .eq('fornecedor_id', user.id)
      .order('created_at', { ascending: false })

    if (errPedidos || errPropostas) {
      toast.error('Erro ao carregar dados do mercado.')
    } else {
      const meusPedidosIds = dataPropostas?.map(p => p.pedido_id) || []
      const pedidosDisponiveis = dataPedidos?.filter(p => !meusPedidosIds.includes(p.id)) || []
      
      setPedidos(pedidosDisponiveis)
      setMinhasPropostas(dataPropostas || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    carregarDados()

    const channel = supabase.channel('propostas_updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'propostas',
        filter: `fornecedor_id=eq.${user.id}` 
      }, (payload) => {
        if (payload.new.status === 'aceita') {
          toast.success('Parabéns! Um dos seus lances foi ACEITE. Veja os detalhes na aba Meus Lances.', { duration: 8000 })
          carregarDados()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider flex items-center gap-2 sm:gap-3">
            <img src={logoFornex} alt="Logo Fornex" className="h-6 sm:h-8 w-auto rounded" />
            FORNEX <span className="text-blue-400 font-medium text-xs sm:text-sm hidden sm:inline-block">| Hub das Fábricas</span>
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-950 transition">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="sticky top-[64px] z-10 bg-gray-50 pt-2 flex gap-2 sm:gap-4 mb-6 border-b border-gray-200 pb-px overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button onClick={() => setActiveTab('mercado')} className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'mercado' ? 'bg-white text-blue-700 border-t border-l border-r border-gray-200 mb-[-1px] shadow-sm' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-200'}`}>
            <Search size={18} /> Mercado de Demandas
          </button>
          <button onClick={() => setActiveTab('meus_lances')} className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'meus_lances' ? 'bg-white text-blue-700 border-t border-l border-r border-gray-200 mb-[-1px] shadow-sm' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-200'}`}>
            <Gavel size={18} /> Meus Lances
          </button>
        </div>

        {activeTab === 'mercado' ? (
          <GridMercado pedidos={pedidos} loading={loading} onDarLance={setPedidoSelecionado} />
        ) : (
          <MeusLances propostas={minhasPropostas} loading={loading} />
        )}
      </div>

      {pedidoSelecionado && (
        <ModalLance 
          pedido={pedidoSelecionado} 
          user={user}
          onClose={() => setPedidoSelecionado(null)} 
          onSuccess={() => {
            setPedidoSelecionado(null)
            carregarDados()
          }} 
        />
      )}
    </div>
  )
}

function GridMercado({ pedidos, loading, onDarLance }) {
  if (loading) return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Carregando oportunidades do mercado...</div>
  
  if (pedidos.length === 0) return (
    <div className="bg-white p-6 sm:p-12 rounded-2xl shadow-sm border border-gray-200 text-center mx-4 sm:mx-0">
      <Search size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-700">Nenhuma demanda nova no momento</h3>
      <p className="text-gray-500 mt-2">Você já deu lance em todos os pedidos abertos ou o mercado está calmo.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pedidos.map(pedido => (
        <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-md transition">
          <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                {pedido.tipo_peca}
              </span>
              <span className="text-xs text-gray-400 font-semibold">{formatarData(pedido.created_at?.split('T')[0])}</span>
            </div>
            
            <h3 className="text-lg font-black text-gray-800 mb-4">{pedido.titulo}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tecido:</span><span className="font-bold text-gray-700">{pedido.tecido}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantidade:</span><span className="font-bold text-gray-700">{pedido.quantidade} un.</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prazo:</span><span className="font-bold text-gray-700">{formatarData(pedido.prazo_entrega)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pagamento:</span><span className="font-bold text-gray-700">{pedido.condicao_pagamento}</span></div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-1">
              {pedido.tamanhos.map(t => <span key={t} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{t}</span>)}
            </div>
          </div>
          
          <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100">
            <button onClick={() => onDarLance(pedido)} className="w-full bg-blue-700 text-white font-black py-4 sm:py-3 text-base sm:text-sm rounded-xl sm:rounded-lg hover:bg-blue-800 transition active:scale-95 shadow-md">
              Dar Lance Agora
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ModalLance({ pedido, user, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(lanceSchema) })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const payload = {
      pedido_id: pedido.id,
      fornecedor_id: user.id,
      preco_total: data.preco_total,
      status: 'pendente'
    }
    
    const { error } = await supabase.from('propostas').insert([payload])
    
    if (error) {
      toast.error('Erro ao enviar lance. Você já pode ter dado um lance aqui.')
    } else {
      toast.success('Lance enviado com sucesso!')
      onSuccess()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center sm:p-4 z-50 transition-opacity">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 pt-4 pb-6 bg-white border-b border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase mb-1 tracking-wider">Novo Lance de Produção</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{pedido.titulo}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">Lote: {pedido.quantidade} un.</span>
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">Prazo: {formatarData(pedido.prazo_entrega)}</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-gray-50 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Valor Total do Lote (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-green-700 text-lg">R$</span>
              <input {...register('preco_total')} type="number" step="0.01" autoFocus placeholder="0.00" className="w-full pl-14 p-4 sm:p-5 text-3xl font-black bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" />
            </div>
            {errors.preco_total && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.preco_total.message}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button type="button" onClick={onClose} className="w-full sm:w-auto flex-1 bg-white border-2 border-gray-200 text-gray-600 font-bold py-4 sm:py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
              Cancelar
            </button>
            <button disabled={isSubmitting} type="submit" className="w-full sm:w-auto flex-[2] bg-blue-700 text-white font-black py-4 sm:py-3 rounded-xl hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-blue-200 text-lg sm:text-base">
              {isSubmitting ? 'A processar...' : 'Confirmar Lance Total'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MeusLances({ propostas, loading }) {
  const [contatos, setContatos] = useState({})

  useEffect(() => {
    const buscarContatos = async () => {
      const novasPropostas = propostas.filter(p => p.status === 'aceita' && !contatos[p.pedido_id])
      
      for (const prop of novasPropostas) {
        const { data } = await supabase.rpc('get_contact_if_accepted', { p_pedido_id: prop.pedido_id })
        if (data) {
          setContatos(prev => ({ ...prev, [prop.pedido_id]: data }))
        }
      }
    }
    
    if (propostas.length > 0) buscarContatos()
  }, [propostas])

  if (loading) return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Carregando seus lances...</div>

  if (propostas.length === 0) return (
    <div className="bg-white p-6 sm:p-12 rounded-2xl shadow-sm border border-gray-200 text-center mx-4 sm:mx-0">
      <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-700">Você ainda não enviou nenhum lance</h3>
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-4">
      {propostas.map(prop => (
        <div key={prop.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden p-5 flex flex-col gap-4 ${prop.status === 'aceita' ? 'border-green-400' : prop.status === 'recusada' ? 'border-red-200 opacity-60' : 'border-gray-200'}`}>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            
            <div className="flex-1 w-full min-w-0">
              <h4 className="font-bold text-lg text-gray-800 truncate">{prop.pedidos?.titulo || 'Pedido Encerrado'}</h4>
              <p className="text-sm text-gray-500 mt-1 truncate">{prop.pedidos?.quantidade || '-'} peças • {prop.pedidos?.tipo_peca || '-'} em {prop.pedidos?.tecido || '-'}</p>
            </div>

            <div className="text-left md:text-right whitespace-nowrap flex-shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Seu Lance</p>
              <p className="font-black text-xl text-gray-800 whitespace-nowrap">R$ {Number(prop.preco_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="w-full md:w-auto text-left md:text-right flex justify-start md:justify-end flex-shrink-0">
              {prop.status === 'pendente' && (
                <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Clock size={16} /> Em Análise</span>
              )}
              {prop.status === 'recusada' && (
                <span className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><XCircle size={16} /> Recusada</span>
              )}
              {prop.status === 'aceita' && (
                <span className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><CheckCircle2 size={16} /> Você Venceu</span>
              )}
            </div>
            
          </div>

          {prop.status === 'aceita' && contatos[prop.pedido_id] && (
            <div className="w-full bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-green-700 uppercase mb-1">Contato Liberado</p>
                <p className="font-black text-gray-800 flex items-center gap-2 text-sm sm:text-base"><Phone size={14} className="text-green-600"/> {contatos[prop.pedido_id]}</p>
              </div>
              <a href={`https://wa.me/${contatos[prop.pedido_id].replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 transition text-sm text-center">
                Chamar no WhatsApp
              </a>
            </div>
          )}
          
        </div>
      ))}
    </div>
  )
}