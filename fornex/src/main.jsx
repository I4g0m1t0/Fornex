import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- ISSO AQUI É O QUE FAZ O ESTILO FUNCIONAR!
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)