import { defineConfig } from 'vite';
export default defineConfig({
  base: '/toolbox/',
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@jsquash/avif', '@jsquash/webp', '@jsquash/jxl'] },
  build: {
    outDir: '../toolbox',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 0,
  },
});
