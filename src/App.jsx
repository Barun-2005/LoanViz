import { BrowserRouter } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import AppRoutes from './routes/AppRoutes'
import Layout from './components/layout/Layout'
import { ThemeProvider } from './contexts/ThemeContext'
import './i18n/i18n';
import { LocaleProvider } from './contexts/LocaleContext';

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={
              <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading LoanViz...</p>
                </div>
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </Layout>
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  )
}

export default App
