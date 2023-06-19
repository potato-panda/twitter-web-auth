import { defineConfig, defaultInclude } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/settings/setup.ts'],
    include: [...defaultInclude],
  },
})