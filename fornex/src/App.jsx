import { useState } from 'react'
import Comprador from './components/Comprador'
import Fornecedor from './components/Fornecedor'

export default function App() {
  const [view, setView] = useState('comprador') 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BARRA DE NAVEGAÇÃO PRINCIPAL */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider">
          FORNEX<span className="text-blue-400 text-sm ml-2">Leilão Reverso B2B</span>
        </h1>
        <div className="space-x-4">
          <button 
            onClick={() => setView('comprador')} 
            className={`px-4 py-2 rounded font-semibold transition ${view === 'comprador' ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
          >
            Área do Comprador
          </button>
          <button 
            onClick={() => setView('fornecedor')} 
            className={`px-4 py-2 rounded font-semibold transition ${view === 'fornecedor' ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
          >
            Área do Fornecedor
          </button>
        </div>
      </nav>

      {/* RENDERIZAÇÃO CONDICIONAL DOS COMPONENTES */}
      <main className="p-8">
        {view === 'comprador' ? (
          <Comprador mudarTela={setView} />
        ) : (
          <Fornecedor />
        )}
      </main>
    </div>
  )
}