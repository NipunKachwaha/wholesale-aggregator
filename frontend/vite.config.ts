import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor':   ['@reduxjs/toolkit', 'react-redux'],
          'charts-vendor':  ['recharts'],
          'gsap-vendor':    ['gsap'],
          'i18n-vendor':    ['i18next', 'react-i18next'],
          'axios-vendor':   ['axios'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Minification
    minify:     'esbuild',
    sourcemap:  false,
    // Target modern browsers
    target: 'es2020',
  },

  // Dev server optimization
  server: {
    port: 5173,
    hmr:  { overlay: true },
  },

  // Optimize deps
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      '@reduxjs/toolkit', 'react-redux',
      'recharts', 'gsap', 'axios',
      'i18next', 'react-i18next',
    ],
  },
})