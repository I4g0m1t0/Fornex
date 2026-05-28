import { useState } from 'react'

// IMPORTAÇÃO DA IMAGEM LOCAL (Descomente a linha abaixo se for usar uma imagem do seu computador)
import logoFornex from './assets/fornex.jpeg'

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
        // Nota: Certifique-se de que o componente Dashboard está importado no topo se for usá-lo como default
        return <Comprador mudarTela={setView} /> 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">

        {/* ÁREA DO LOGO E TÍTULO ALINHADOS LADO A LADO */}
        <div className="flex items-center gap-3">
          
          {/* TAG DA IMAGEM */}
          {/* Se usar imagem local importada: <img src={logoFornex} alt="Logo Fornex" className="h-10 w-auto" /> */}
          {/* Se usar um link da internet, coloque o link no src abaixo: */}
          <img 
            src={logoFornex} 
            alt="Logo Fornex" 
            className="h-10 w-auto rounded bg-white p-1" 
          />

          <h1 className="text-2xl font-bold tracking-wider">
            <span className="text-blue-400 text-sm ml-2 hidden sm:inline-block">
              Leilão Reverso B2B
            </span>
          </h1>
        </div>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div className="space-x-2 md:space-x-4">
          <button
            onClick={() => setView('comprador')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${view === 'comprador' ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
          >
            Criar Leilão
          </button>

          <button
            onClick={() => setView('fornecedor')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${view === 'fornecedor' ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
          >
            Área do Fornecedor
          </button>

          <button
            onClick={() => setView('propostas')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${view === 'propostas' ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
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