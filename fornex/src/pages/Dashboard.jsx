export default function Dashboard({ mudarTela }) {
  return (
    <div className="min-h-screen flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">
          ReverseHub
        </h1>

        <div className="space-y-4">

          <button
            onClick={() => mudarTela('criar')}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-left font-semibold"
          >
            Criar Leilão
          </button>

          <button
            onClick={() => mudarTela('propostas')}
            className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-left font-semibold"
          >
            Propostas Recebidas
          </button>

        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-10">

        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Dashboard
        </h2>

        <p className="text-gray-600">
          Gerencie seus leilões reversos e acompanhe propostas de fornecedores.
        </p>

      </div>
    </div>
  )
}