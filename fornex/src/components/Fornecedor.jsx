import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Fornecedor() {
  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [proposta, setProposta] = useState({ preco_total: '', validade_proposta: '', fornecedor_nome: '', fornecedor_contato: '' })

  const buscarPedidos = async () => {
    const { data } = await supabase.from('pedidos').select('*').eq('status', 'Aberto')
    setPedidos(data || [])
  }

  const enviarProposta = async (e) => {
    e.preventDefault()
    const payload = { ...proposta, pedido_id: pedidoSelecionado.id }
    await supabase.from('propostas').insert([payload])
    alert(`LANCE ENVIADO COM SUCESSO! \n\nVocê gastou 1 crédito. \nContato do Comprador liberado: ${pedidoSelecionado.comprador_contato}`)
    setPedidoSelecionado(null)
  }

  useEffect(() => {
    buscarPedidos()
  }, [])

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
      <div className="col-span-2 space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Mural de Leilões Ativos</h2>
        {pedidos.length === 0 ? (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-700 font-semibold">Nenhum leilão ativo.</p>
          </div>
        ) : null}
        {pedidos.map(p => (
          <div key={p.id} onClick={() => setPedidoSelecionado(p)} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition group">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600">{p.titulo}</h3>
              <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold uppercase animate-pulse">Aberto para Lances</span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <p>📦 <b>Qtd:</b> {p.quantidade}</p>
              <p>💳 <b>Pagamento:</b> {p.condicao_pagamento}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit sticky top-8">
        {pedidoSelecionado ? (
          <form onSubmit={enviarProposta} className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-3 mb-4">
              Seu Lance para:<br/><span className="text-blue-600">{pedidoSelecionado.titulo}</span>
            </h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Valor Total da Sua Proposta (R$)</label>
              <input type="number" required placeholder="0.00" className="w-full p-3 text-lg font-bold bg-green-50 border border-green-300 rounded-lg text-green-800" onChange={e => setProposta({...proposta, preco_total: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Validade deste Preço</label>
              <input type="date" required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" onChange={e => setProposta({...proposta, validade_proposta: e.target.value})} />
            </div>
            <div className="pt-4 border-t mt-4">
              <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Seus Dados de Retorno</p>
              <input type="text" required placeholder="Nome da sua Empresa" className="w-full p-3 bg-gray-50 border rounded-lg mb-3" onChange={e => setProposta({...proposta, fornecedor_nome: e.target.value})} />
              <input type="text" required placeholder="Seu WhatsApp" className="w-full p-3 bg-gray-50 border rounded-lg" onChange={e => setProposta({...proposta, fornecedor_contato: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 shadow-md mt-4">
              Enviar Lance (1 Crédito)
            </button>
          </form>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl">⚖️</span>
            <p className="text-gray-500 mt-4 font-medium">Selecione uma demanda para enviar seu lance.</p>
          </div>
        )}
      </div>
    </div>
  )
}