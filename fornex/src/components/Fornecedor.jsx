import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Fornecedor() {
  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [proposta, setProposta] = useState({ preco_total: '', fornecedor_nome: '', fornecedor_contato: '' })

  const buscarPedidos = async () => {
    const { data } = await supabase.from('pedidos').select('*').eq('status', 'Aberto').order('created_at', { ascending: false })
    setPedidos(data || [])
  }

  const enviarProposta = async (e) => {
    e.preventDefault()
    
    const payload = { 
      ...proposta, 
      pedido_id: pedidoSelecionado.id
    }
    
    const { error } = await supabase.from('propostas').insert([payload])
    
    if (error) {
      console.error('Erro no Supabase:', error)
      alert('Erro ao enviar lance! Verifique a consola.')
      return
    }

    alert(`LANCE ENVIADO! \n\nContato liberado: ${pedidoSelecionado.comprador_contato}`)
    setPedidoSelecionado(null)
    buscarPedidos()
  }

  useEffect(() => {
    buscarPedidos()
  }, [])

  return (
    <div className="w-full px-4">
      {!pedidoSelecionado ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Leilões Disponíveis</h2>
            <div className="flex items-center gap-2">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{pedidos.length} ativos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pedidos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-xl hover:border-blue-300 transition-all duration-300 group">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold uppercase tracking-tight">
                      {p.categoria}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {p.titulo}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Quantidade:</span>
                      <span className="font-bold text-gray-700">{p.quantidade}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Pagamento:</span>
                      <span className="font-bold text-gray-700">{p.condicao_pagamento}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                  <button 
                    onClick={() => setPedidoSelecionado(p)} 
                    className="w-full bg-white text-blue-600 border-2 border-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    Dar Lance
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pedidos.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 text-lg italic">Aguardando novas demandas no mercado...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mt-4">
          <button onClick={() => setPedidoSelecionado(null)} className="text-blue-600 font-bold text-sm mb-6 flex items-center gap-2 hover:underline">
            ← Voltar ao Mural
          </button>

          <form onSubmit={enviarProposta} className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4 py-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Lance para:</p>
              <h3 className="font-black text-2xl text-gray-800 mb-3">{pedidoSelecionado.titulo}</h3>
              
              {/* ADICIONADO: QUANTIDADE E PAGAMENTO BEM VISÍVEIS */}
              <div className="flex flex-wrap gap-3">
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200">
                  📦 Qtd: <span className="text-blue-700">{pedidoSelecionado.quantidade}</span>
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200">
                  💳 Pagamento: <span className="text-blue-700">{pedidoSelecionado.condicao_pagamento}</span>
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Seu Preço Total (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-600">R$</span>
                  <input type="number" step="0.01" required className="w-full p-4 pl-12 text-3xl font-black bg-green-50 border-2 border-green-200 rounded-2xl text-green-700 focus:ring-4 focus:ring-green-100 outline-none transition-all" placeholder="0,00" onChange={e => setProposta({...proposta, preco_total: e.target.value})} />
                </div>
                <p className="text-xs text-gray-400 font-semibold mt-2 text-right">Preço para {pedidoSelecionado.quantidade}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                 <input type="text" required placeholder="Nome da Empresa" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" onChange={e => setProposta({...proposta, fornecedor_nome: e.target.value})} />
                 <input type="text" required placeholder="Seu WhatsApp" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" onChange={e => setProposta({...proposta, fornecedor_contato: e.target.value})} />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
              CONFIRMAR LANCE
            </button>
          </form>
        </div>
      )}
    </div>
  )
}