import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import macrosPlugin from "vite-plugin-babel-macros";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/api': "http://localhost:5000"
    }
  },
  plugins: [react(), macrosPlugin()],
  define: {
    'process.env': process.env,
    'process.platform': JSON.stringify(process.version),
    'process.version': JSON.stringify(process.version),
    'process.versions.node': JSON.stringify(process.versions.node),
  }
})
