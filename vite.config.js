import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          stockfish: ['stockfish.wasm']
        }
      }
    }
  },
  resolve: {
    alias: {
      'stockfish.js': '/stockfish.js',
      'stockfish.worker.js': "/stockfish.worker.js",
      'stockfish.wasm': "/stockfish.wasm",
    },
  },
  server: {
    // middlewareMode: true,
    // fs: {
    //   allow: ['.'],
    // },
    setup: ({app}) => {
      app.use((req, res, next) => {
        if(req.url.endsWith('wasm')) {
          res.setHeader('Content-Type', 'application/wasm')
        }
        next()
      })
    }
  }
});
