import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './i18n/config' // Import i18n config
import { App } from './App.tsx'
import { AppStatusProvider } from './contexts/AppStatusContext'
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppStatusProvider>
        <Suspense fallback={<div style={{ padding: 20 }}>Loading translations...</div>}>
          <App />
        </Suspense>
      </AppStatusProvider>
    </ErrorBoundary>
  </StrictMode>,
)
