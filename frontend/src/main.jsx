import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/newsreader'
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)