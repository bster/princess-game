import { defineConfig } from 'vite';

export default defineConfig({
  root: 'www',
  publicDir: false,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
    minify: 'esbuild',
  },
});
