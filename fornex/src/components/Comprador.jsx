import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Comprador({ mudarTela }) {
  const [formData, setFormData] = useState({
    titulo: '', 
    categoria: 'Tecidos e Malhas',
    quantidade: '', 
    prazo_entrega: '', 
    condicao_pagamento: 'À Vista', 
    comprador_nome: '', 
    comprador_contato: ''
  })

  const criarPedido = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('pedidos').insert([formData])
    if (error) console.log('Erro:', error)
    
    alert('Leilão Reverso Iniciado! Demanda enviada para as fábricas e confecções do Hub.')
    mudarTela('fornecedor')
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Nova Demanda de Produção</h2>
        <p className="text-gray-500 mt-2">Encontre os melhores fornecedores do setor têxtil e de confecção.</p>
      </div>

      <form onSubmit={criarPedido} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">O que precisa comprar ou produzir hoje?</label>
          <input 
            type="text" 
            required 
            placeholder="Ex: 2.000 Camisetas 100% Algodão (Private Label) ou 500 Rolos de Malha Penteada" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            onChange={e => setFormData({...formData, titulo: e.target.value})} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria Têxtil</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, categoria: e.target.value})}
            >
              <option>Tecidos e Malhas</option>
              <option>Confecção (Peças Prontas)</option>
              <option>Aviamentos (Fios, Botões, Zíperes)</option>
              <option>Serviços (Estamparia, Tinturaria)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade Necessária</label>
            <input 
              type="text" 
              required 
              placeholder="Ex: 2.000 peças ou 500 kg" 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, quantidade: e.target.value})} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Data Limite de Entrega</label>
            <input 
              type="date" 
              required 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, prazo_entrega: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Condição de Pagamento</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, condicao_pagamento: e.target.value})}
            >
              <option>À Vista</option>
              <option>Faturado 30 Dias</option>
              <option>Faturado 30/60/90 Dias</option>
              <option>Sinal de 50% + Saldo na Entrega</option>
            </select>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-100">
          <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            Dados da Marca / Confecção (Revelados apenas após o Match)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              required 
              placeholder="Nome da sua Marca ou Empresa" 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, comprador_nome: e.target.value})} 
            />
            <input 
              type="text" 
              required 
              placeholder="Seu WhatsApp" 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, comprador_contato: e.target.value})} 
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full mt-6 bg-blue-900 text-white font-bold text-lg py-4 rounded-lg hover:bg-blue-950 shadow-lg transform transition active:scale-95 flex justify-center items-center gap-2"
        >
          Publicar no Hub de Fornecedores
        </button>
      </form>
    </div>
  )
}