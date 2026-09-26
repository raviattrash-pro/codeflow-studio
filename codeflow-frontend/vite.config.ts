import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false, // Required for Tauri dev output
  server: {
    port: 3000,
    strictPort: true, // Fail if port is busy so Tauri connects reliably
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    watch: {
      ignored: ['**/src-tauri/**'] // Prevent Rust compilation triggering HMR
    }
  },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  build: {
    rollupOptions: {
      external: [
        /^@tauri-apps\/.*/
      ]
    }
  }
});
