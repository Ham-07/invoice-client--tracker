import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// Browser ko batao ke is app ka data apne aap delete na kare
if (__APP_MODE__ === 'full') navigator.storage?.persist?.()
