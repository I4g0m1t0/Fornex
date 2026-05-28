import { useState } from 'react'

import Comprador from './components/Comprador'
import Fornecedor from './components/Fornecedor'
import Propostas from './pages/Propostas'

export default function App() {

  const [view, setView] = useState('comprador')

  const renderPage = () => {

    switch (view) {

      case 'comprador':
        return <Comprador mudarTela={setView} />

      case 'fornecedor':
        return <Fornecedor />

      case 'propostas':
        return <Propostas />

      default:
        return <Dashboard mudarTela={setView} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">

        <h1 className="text-2xl font-bold tracking-wider">
          FORNEX
          <span className="text-blue-400 text-sm ml-2">
            Leilão Reverso B2B
          </span>
        </h1>

        <div className="space-x-4">

          <button
            onClick={() => setView('comprador')}
            className="px-4 py-2 rounded font-semibold hover:bg-blue-800"
          >
            Criar Leilão
          </button>

          <button
            onClick={() => setView('fornecedor')}
            className="px-4 py-2 rounded font-semibold hover:bg-blue-800"
          >
            Área do Fornecedor
          </button>

          <button
            onClick={() => setView('propostas')}
            className="px-4 py-2 rounded font-semibold hover:bg-blue-800"
          >
            Propostas
          </button>

        </div>

      </nav>

      {/* CONTEÚDO */}
      <main className="p-8">
        {renderPage()}
      </main>

    </div>
  )
}