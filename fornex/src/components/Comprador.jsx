import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Comprador({ mudarTela }) {
  const [formData, setFormData] = useState({
    titulo: '', categoria: 'Embalagens', quantidade: '', prazo_entrega: '', condicao_pagamento: 'À Vista', comprador_nome: '', comprador_contato: ''
  })

  const criarPedido = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('pedidos').insert([formData])
    if (error) console.log('Erro:', error)
    
    alert('Leilão Reverso Iniciado! Demanda publicada no Hub.')
    mudarTela('fornecedor') // Pula automaticamente para a tela do fornecedor
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Iniciar Leilão Reverso</h2>
      <form onSubmit={criarPedido} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">O que você precisa comprar hoje?</label>
          <input type="text" required placeholder="Ex: 1.500 Caixas de Papelão Ondulado" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, titulo: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" onChange={e => setFormData({...formData, categoria: e.target.value})}>
              <option>Embalagens</option><option>Matéria-prima</option><option>Tecnologia</option><option>Serviços</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade Necessária</label>
            <input type="text" required placeholder="Ex: 500 kg" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" onChange={e => setFormData({...formData, quantidade: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Data Limite de Entrega</label>
            <input type="date" required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" onChange={e => setFormData({...formData, prazo_entrega: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Condição de Pagamento</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" onChange={e => setFormData({...formData, condicao_pagamento: e.target.value})}>
              <option>À Vista</option><option>30 Dias</option><option>30/60/90 Dias</option>
            </select>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <p className="text-sm font-bold text-blue-900 mb-3">Dados Protegidos (Só revelados após o Match)</p>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Sua Empresa" className="p-3 border rounded-lg" onChange={e => setFormData({...formData, comprador_nome: e.target.value})} />
            <input type="text" required placeholder="Seu WhatsApp" className="p-3 border rounded-lg" onChange={e => setFormData({...formData, comprador_contato: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-bold text-lg py-4 rounded-lg hover:bg-blue-700 shadow-lg transform transition active:scale-95">
          Publicar e Receber Lances
        </button>
      </form>
    </div>
  )
}