import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // This makes environment variables available to your app
    'process.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(process.env.VITE_GA_MEASUREMENT_ID)
  }
})
