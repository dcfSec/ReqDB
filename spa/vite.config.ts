import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import macrosPlugin from "vite-plugin-babel-macros";
import { dependencies } from './package.json';
//import { nodePolyfills } from 'vite-plugin-node-polyfills'

function renderChunks(deps: Record<string, string>) {
  const chunks: Record<string, string[]> = {};
  Object.keys(deps).forEach((key) => {
    if (['react', 'react-router', 'react-dom'].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}


// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: "http://localhost:8000",
        xfwd: true,
      },
      '/auth': {
        target: "http://localhost:8000",
        xfwd: true,
      },
    },
  },
  plugins: [react(), macrosPlugin(), /*nodePolyfills()*/],
  define: {
    'process.platform': JSON.stringify(process.version),
    'process.version': JSON.stringify(process.version),
    'process.versions.node': JSON.stringify(process.versions.node),
  },
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-router', 'react-dom'],
          ...renderChunks(dependencies),
        },
      },
    },
  },
})
