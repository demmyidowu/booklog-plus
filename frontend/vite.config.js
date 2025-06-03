import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    '%VITE_GA_MEASUREMENT_ID%': JSON.stringify(process.env.VITE_GA_MEASUREMENT_ID)
  }
})
