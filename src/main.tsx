import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/components.css'
import { registerSW } from 'virtual:pwa-register'

// Register the service worker – auto-updates in the background
registerSW({
  onNeedRefresh() {
    // Silent auto-refresh (no prompt)
  },
  onOfflineReady() {
    console.log('[TERMINAL] App is ready to work offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
