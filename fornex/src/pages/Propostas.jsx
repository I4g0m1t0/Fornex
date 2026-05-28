import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Propostas() {

  const [propostas, setPropostas] = useState([])

  useEffect(() => {
    buscarPropostas()
  }, [])

  const buscarPropostas = async () => {

    const { data, error } = await supabase
      .from('propostas')
      .select('*')

    if (error) {
      console.log(error)
      return
    }

    setPropostas(data)
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Propostas Recebidas
      </h1>

      <div className="grid gap-5">

        {propostas.map((proposta) => (
          <div
            key={proposta.id}
            className="bg-white p-5 rounded-xl shadow"
          >

            <h2 className="text-xl font-bold">
              {proposta.fornecedor_nome}
            </h2>

            <p className="text-gray-600 mt-2">
              Valor: R$ {proposta.valor}
            </p>

            <p className="text-gray-600">
              Prazo: {proposta.prazo}
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}