import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    license: { fileName: 'third-party-licenses.md' },
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'typesetting', test: /node_modules[\\/]katex/ },
            { name: 'react', test: /node_modules[\\/]react/ },
          ],
        },
      },
    },
  },
  test: { include: ['src/**/*.test.ts'] },
});
