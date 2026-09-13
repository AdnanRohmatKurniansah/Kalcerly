import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--k-bg-card)",
          color: "var(--k-text-1)",
          border: "1px solid var(--k-border)",
          fontFamily: "inherit",
        },
      }}
    />
  </StrictMode>,
)
