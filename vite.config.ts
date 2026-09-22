import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/RIPPLE-BD-CHAOS-PEACE/',
  build: {
    target: 'es2020',
    sourcemap: true,
    cssCodeSplit: true
  }
});
