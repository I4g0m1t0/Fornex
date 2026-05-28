import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Propostas() {

  const [propostas, setPropostas] = useState([])

  // =========================
  // BUSCAR PROPOSTAS
  // =========================
  const buscarPropostas = async () => {

    const { data, error } = await supabase
      .from('propostas')
      .select(`
        *,
        pedidos (
          titulo,
          categoria,
          quantidade,
          condicao_pagamento
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setPropostas(data || [])
  }

  useEffect(() => {
    buscarPropostas()
  }, [])

  return (
    <div className="w-full">

      {/* TOPO */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Propostas Recebidas
          </h1>

          <p className="text-gray-500 mt-1">
            Lances enviados pelos fornecedores
          </p>
        </div>

        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold">
          {propostas.length} propostas
        </div>

      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {propostas.map((proposta) => (

          <div
            key={proposta.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
          >

            {/* HEADER */}
            <div className="bg-blue-600 p-5 text-white">

              <span className="text-xs uppercase tracking-widest opacity-80">
                {proposta.pedidos?.categoria}
              </span>

              <h2 className="text-2xl font-black mt-2">
                {proposta.pedidos?.titulo}
              </h2>

            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">

              {/* VALOR */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">

                <p className="text-xs font-black text-green-700 uppercase mb-2">
                  Valor do Lance
                </p>

                <h2 className="text-4xl font-black text-green-600">
                  R$ {Number(proposta.preco_total).toLocaleString('pt-BR')}
                </h2>

              </div>

              {/* FORNECEDOR */}
              <div>

                <p className="text-xs text-gray-400 uppercase font-bold">
                  Fornecedor
                </p>

                <h3 className="text-xl font-bold text-gray-800 mt-1">
                  {proposta.fornecedor_nome}
                </h3>

                <p className="text-gray-500 mt-1">
                  {proposta.fornecedor_contato}
                </p>

              </div>

              {/* DETALHES */}
              <div className="space-y-3 border-t pt-4">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Quantidade
                  </span>

                  <span className="font-bold">
                    {proposta.pedidos?.quantidade}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Pagamento
                  </span>

                  <span className="font-bold">
                    {proposta.pedidos?.condicao_pagamento}
                  </span>
                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="p-4 bg-gray-50 border-t">

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
                Aceitar Proposta
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* SEM PROPOSTAS */}
      {propostas.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 italic">
            Nenhuma proposta recebida ainda...
          </p>
        </div>
      )}

    </div>
  )
}