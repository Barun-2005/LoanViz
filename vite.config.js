import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define environment variables that should be available in the client
  define: {
    // Make sure environment variables are properly stringified
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(process.env.VITE_BUILD_DATE)
  },
  // Base path for GitHub Pages deployment
  // Change this to '/<repository-name>/' when deploying to GitHub Pages
  base: '/loanviz/'
})
