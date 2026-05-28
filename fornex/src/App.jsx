import { useState } from 'react'

import Dashboard from './pages/Dashboard'
import Comprador from './components/Comprador'
import Fornecedor from './components/Fornecedor'
import Propostas from './pages/Propostas'

export default function App() {

  // CONTROLE DAS TELAS
  const [view, setView] = useState('dashboard')

  // =========================================
  // RENDERIZAÇÃO DAS TELAS
  // =========================================
  const renderPage = () => {

    switch (view) {

      // DASHBOARD PRINCIPAL
      case 'dashboard':
        return (
          <Dashboard mudarTela={setView} />
        )

      // TELA DE CRIAR LEILÃO
      case 'comprador':
        return (
          <Comprador mudarTela={setView} />
        )

      // TELA DO FORNECEDOR
      case 'fornecedor':
        return (
          <Fornecedor />
        )

      // TELA DE PROPOSTAS
      case 'propostas':
        return (
          <Propostas />
        )

      default:
        return (
          <Dashboard mudarTela={setView} />
        )
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

          {/* DASHBOARD */}
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded font-semibold transition ${
              view === 'dashboard'
                ? 'bg-blue-600'
                : 'hover:bg-blue-800'
            }`}
          >
            Dashboard
          </button>

          {/* ÁREA COMPRADOR */}
          <button
            onClick={() => setView('comprador')}
            className={`px-4 py-2 rounded font-semibold transition ${
              view === 'comprador'
                ? 'bg-blue-600'
                : 'hover:bg-blue-800'
            }`}
          >
            Criar Leilão
          </button>

          {/* FORNECEDOR */}
          <button
            onClick={() => setView('fornecedor')}
            className={`px-4 py-2 rounded font-semibold transition ${
              view === 'fornecedor'
                ? 'bg-blue-600'
                : 'hover:bg-blue-800'
            }`}
          >
            Área do Fornecedor
          </button>

          {/* PROPOSTAS */}
          <button
            onClick={() => setView('propostas')}
            className={`px-4 py-2 rounded font-semibold transition ${
              view === 'propostas'
                ? 'bg-blue-600'
                : 'hover:bg-blue-800'
            }`}
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