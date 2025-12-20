import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// SAFETY NET: This catches the crash and shows the error on screen
try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  // If it crashes, show the error in red text
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-size: 20px;">
    <h1>CRITICAL ERROR</h1>
    <pre>${error}</pre>
  </div>`
  console.error("CRASHED:", error)
}
