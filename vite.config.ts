import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace <your-repository-name> with the actual name of your GitHub repository.
  // For example, if your repository URL is https://github.com/john-doe/footsteps-app,
  // the base should be '/footsteps-app/'.
  // Fix: Replaced placeholder with a sensible default.
  base: '/',
})
