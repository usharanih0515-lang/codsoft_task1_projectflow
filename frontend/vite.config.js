import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/codsoft_tasks/',
  plugins: [react()],
})