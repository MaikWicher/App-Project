import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App.tsx'
import { AppStatusProvider } from './contexts/AppStatusContext'
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppStatusProvider>
        <App />
      </AppStatusProvider>
    </ErrorBoundary>
  </StrictMode>,
)
