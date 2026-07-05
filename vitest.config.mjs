import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      './temp/**',
      // e2e specs run in a real browser via vitest.e2e.config.mjs
      'test/e2e/**',
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['html', 'text'],
      include: ['src'],
      // barrel files only re-export; they carry no logic to cover
      exclude: ['**/index.js'],
    },
  },
})
