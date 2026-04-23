import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During dev we serve at the root so `localhost:5173/` works as expected.
// For the production build we prefix assets with the repo name so the bundle
// resolves correctly at https://stephenbreen.github.io/the-breaking/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/the-breaking/' : '/',
  server: {
    port: 5173,
    strictPort: false,
  },
}))
